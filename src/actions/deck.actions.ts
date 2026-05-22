"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

// ─── Schemas ─────────────────────────────────────────────────
const createDeckSchema = z.object({
  title: z.string().min(1, "Tên bộ thẻ không được để trống").max(100, "Tên bộ thẻ tối đa 100 ký tự"),
  description: z.string().max(500, "Mô tả tối đa 500 ký tự").optional(),
})

const uuidSchema = z.string().uuid("ID không hợp lệ")

// ─── createDeck ───────────────────────────────────────────────
export async function createDeck(formData: FormData) {
  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
  }

  const result = createDeckSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }
  }

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: "Bạn chưa đăng nhập" }
  }

  const { data: deck, error } = await supabase
    .from("decks")
    .insert({
      user_id: user.id,
      title: result.data.title,
      description: result.data.description ?? null,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: "Không thể tạo bộ thẻ. Vui lòng thử lại" }
  }

  revalidatePath("/dashboard/decks")
  return { success: true, deck }
}

// ─── updateDeck ───────────────────────────────────────────────
export async function updateDeck(id: string, formData: FormData) {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) {
    return { success: false, error: "ID không hợp lệ" }
  }

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
  }

  const result = createDeckSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("decks")
    .update({
      title: result.data.title,
      description: result.data.description ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    return { success: false, error: "Không thể cập nhật bộ thẻ. Vui lòng thử lại" }
  }

  revalidatePath("/dashboard/decks")
  revalidatePath(`/dashboard/decks/${id}`)
  return { success: true }
}

// ─── deleteDeck ───────────────────────────────────────────────
export async function deleteDeck(id: string) {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) {
    return { success: false, error: "ID không hợp lệ" }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("decks").delete().eq("id", id)

  if (error) {
    return { success: false, error: "Không thể xoá bộ thẻ. Vui lòng thử lại" }
  }

  revalidatePath("/dashboard/decks")
  return { success: true }
}
