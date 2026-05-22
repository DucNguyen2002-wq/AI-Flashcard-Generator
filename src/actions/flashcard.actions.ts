"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// ─── Schemas ─────────────────────────────────────────────────
const flashcardSchema = z.object({
  deckId: z.string().uuid("deckId không hợp lệ"),
  question: z
    .string()
    .min(1, "Câu hỏi không được để trống")
    .max(500, "Câu hỏi tối đa 500 ký tự"),
  answer: z
    .string()
    .min(1, "Câu trả lời không được để trống")
    .max(1000, "Câu trả lời tối đa 1000 ký tự"),
});

const updateFlashcardSchema = z.object({
  question: z.string().min(1, "Câu hỏi không được để trống").max(500),
  answer: z.string().min(1, "Câu trả lời không được để trống").max(1000),
});

const uuidSchema = z.string().uuid("ID không hợp lệ");

// ─── Helper: verify deck ownership ───────────────────────────
async function verifyDeckOwnership(deckId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("decks")
    .select("id")
    .eq("id", deckId)
    .eq("user_id", userId)
    .single();
  return !!data;
}

// ─── createFlashcard ──────────────────────────────────────────
export async function createFlashcard(formData: FormData) {
  const raw = {
    deckId: formData.get("deckId") as string,
    question: formData.get("question") as string,
    answer: formData.get("answer") as string,
  };

  const result = flashcardSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Dữ liệu không hợp lệ",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, error: "Bạn chưa đăng nhập" };
  }

  const owned = await verifyDeckOwnership(result.data.deckId, user.id);
  if (!owned) {
    return {
      success: false,
      error: "Bộ thẻ không tồn tại hoặc bạn không có quyền truy cập",
    };
  }

  const { data: flashcard, error } = await supabase
    .from("flashcards")
    .insert({
      deck_id: result.data.deckId,
      question: result.data.question,
      answer: result.data.answer,
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error: "Không thể tạo flashcard. Vui lòng thử lại",
    };
  }

  revalidatePath(`/dashboard/decks/${result.data.deckId}`);
  return { success: true, flashcard };
}

// ─── updateFlashcard ──────────────────────────────────────────
export async function updateFlashcard(id: string, formData: FormData) {
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: "ID không hợp lệ" };
  }

  const raw = {
    question: formData.get("question") as string,
    answer: formData.get("answer") as string,
  };

  const result = updateFlashcardSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Dữ liệu không hợp lệ",
    };
  }

  const supabase = await createClient();

  // verify ownership via join with decks
  const { data: existingRaw } = await supabase
    .from("flashcards")
    .select("deck_id, decks!inner(user_id)")
    .eq("id", id)
    .single();

  const existing = existingRaw as unknown as { deck_id: string } | null;

  if (!existing) {
    return { success: false, error: "Flashcard không tồn tại" };
  }

  const { error } = await supabase
    .from("flashcards")
    .update({ question: result.data.question, answer: result.data.answer })
    .eq("id", id);

  if (error) {
    return {
      success: false,
      error: "Không thể cập nhật flashcard. Vui lòng thử lại",
    };
  }

  revalidatePath(`/dashboard/decks/${existing.deck_id}`);
  return { success: true };
}

// ─── deleteFlashcard ──────────────────────────────────────────
export async function deleteFlashcard(id: string, deckId: string) {
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: "ID không hợp lệ" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("flashcards").delete().eq("id", id);

  if (error) {
    return {
      success: false,
      error: "Không thể xoá flashcard. Vui lòng thử lại",
    };
  }

  revalidatePath(`/dashboard/decks/${deckId}`);
  return { success: true };
}

// ─── saveGeneratedCards ───────────────────────────────────────
const saveGeneratedSchema = z.object({
  deckId: z.string().uuid(),
  cards: z
    .array(z.object({ question: z.string().min(1), answer: z.string().min(1) }))
    .min(1, "Phải có ít nhất 1 thẻ")
    .max(20, "Tối đa 20 thẻ mỗi lần"),
});

export async function saveGeneratedCards(
  deckId: string,
  cards: { question: string; answer: string }[],
) {
  const result = saveGeneratedSchema.safeParse({ deckId, cards });
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Dữ liệu không hợp lệ",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, error: "Bạn chưa đăng nhập" };
  }

  const owned = await verifyDeckOwnership(deckId, user.id);
  if (!owned) {
    return {
      success: false,
      error: "Bộ thẻ không tồn tại hoặc bạn không có quyền truy cập",
    };
  }

  const rows = cards.map((c) => ({
    deck_id: deckId,
    question: c.question,
    answer: c.answer,
  }));
  const { error } = await supabase.from("flashcards").insert(rows);

  if (error) {
    return {
      success: false,
      error: "Không thể lưu flashcard. Vui lòng thử lại",
    };
  }

  revalidatePath(`/dashboard/decks/${deckId}`);
  return { success: true, count: cards.length };
}

// ─── uploadDocument ───────────────────────────────────────────
export async function uploadDocument(formData: FormData) {
  const file = formData.get("file") as File | null;
  const deckId = formData.get("deckId") as string | null;

  if (!file) return { success: false, error: "Không tìm thấy file" };
  if (!deckId) return { success: false, error: "deckId là bắt buộc" };

  // Validate size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "File không được vượt quá 5MB" };
  }

  // Validate mime type
  const allowed = ["application/pdf", "text/plain"];
  if (!allowed.includes(file.type)) {
    return { success: false, error: "Chỉ hỗ trợ file PDF hoặc TXT" };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, error: "Bạn chưa đăng nhập" };
  }

  let text = "";

  if (file.type === "text/plain") {
    const buffer = await file.arrayBuffer();
    text = new TextDecoder("utf-8").decode(buffer);
  } else {
    // PDF: use pdf-parse (server-side only)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParse = ((await import("pdf-parse")) as any).default as (buf: Buffer) => Promise<{ text: string }>;
      const buffer = Buffer.from(await file.arrayBuffer());
      const data = await pdfParse(buffer);
      text = data.text;
    } catch {
      return {
        success: false,
        error: "Không thể đọc file PDF. Vui lòng thử lại",
      };
    }
  }

  // Upload to Supabase Storage
  const path = `${user.id}/${deckId}/${Date.now()}-${file.name}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (uploadError) {
    // If upload fails, still return the text so user can proceed
    return { success: true, path: null, text };
  }

  return { success: true, path, text };
}
