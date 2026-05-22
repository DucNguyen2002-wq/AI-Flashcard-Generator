import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const requestSchema = z.object({
  text: z.string().min(1, "Nội dung không được để trống").max(5000, "Nội dung tối đa 5000 ký tự"),
  count: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20)]),
  deckId: z.string().uuid("deckId không hợp lệ"),
})

const cardSchema = z.array(
  z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  })
)

function stripMarkdown(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim()
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }),
  })

  if (res.status === 429) {
    throw new Error("RATE_LIMIT")
  }

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
}

function buildPrompt(text: string, count: number): string {
  return `Bạn là giáo viên chuyên nghiệp tạo flashcard học tập.
Nhiệm vụ: Tạo ĐÚNG ${count} flashcard từ nội dung được cung cấp.
Yêu cầu:
- Câu hỏi: ngắn gọn, rõ ràng, tập trung 1 khái niệm
- Câu trả lời: súc tích, đầy đủ thông tin cốt lõi
- Đa dạng loại câu hỏi: định nghĩa, ví dụ, so sánh, ứng dụng
- Trả về JSON array KHÔNG có markdown, KHÔNG có text thêm

Format bắt buộc:
[{"question":"...","answer":"..."},{"question":"...","answer":"..."}]

Nội dung:
${text}`
}

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 })
  }

  // Validate body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    )
  }

  const { text, count, deckId } = parsed.data

  // Verify deck ownership
  const { data: deck } = await supabase
    .from("decks")
    .select("id")
    .eq("id", deckId)
    .eq("user_id", user.id)
    .single()

  if (!deck) {
    return NextResponse.json({ error: "Bộ thẻ không tồn tại" }, { status: 404 })
  }

  // Check API key
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY chưa được cấu hình. Lấy API key tại https://aistudio.google.com/apikey và thêm vào file .env.local",
      },
      { status: 503 }
    )
  }

  // Call Gemini
  try {
    const rawText = await callGemini(apiKey, buildPrompt(text, count))
    const stripped = stripMarkdown(rawText)

    // Try parse
    let cards: unknown
    try {
      cards = JSON.parse(stripped)
    } catch {
      // Retry once with stricter prompt
      const retryRaw = await callGemini(
        apiKey,
        buildPrompt(text, count) + "\n\nQUAN TRỌNG: Chỉ trả về JSON array thuần túy, không kèm bất kỳ text nào khác."
      )
      const retryStripped = stripMarkdown(retryRaw)
      try {
        cards = JSON.parse(retryStripped)
      } catch {
        return NextResponse.json(
          { error: "AI không thể phân tích nội dung này" },
          { status: 500 }
        )
      }
    }

    const validated = cardSchema.safeParse(cards)
    if (!validated.success) {
      return NextResponse.json(
        { error: "AI không thể phân tích nội dung này" },
        { status: 500 }
      )
    }

    return NextResponse.json(validated.data)
  } catch (err) {
    if (err instanceof Error && err.message === "RATE_LIMIT") {
      return NextResponse.json(
        { error: "Đã vượt quá giới hạn yêu cầu API. Vui lòng thử lại sau" },
        { status: 429 }
      )
    }
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi gọi AI. Vui lòng thử lại" },
      { status: 500 }
    )
  }
}
