# Prompt Giai Đoạn 3 — Core Features: CRUD + AI Generate + Study Mode

> **Dành cho:** Claude Sonnet 4.6 (AI Agent)
> **Tiền đề:** Giai đoạn 1 & 2 đã hoàn thành — Auth hoạt động, Dashboard Layout có sidebar, KPI cards
> **Mục tiêu:** Toàn bộ tính năng chính hoạt động end-to-end
> **Thời gian ước tính:** 2 ngày (25/05 – 26/05)

---

## SYSTEM CONTEXT

Dự án **AI Flashcard Generator** đã có:

- ✅ Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui
- ✅ Supabase Auth + Database (3 bảng: decks, flashcards, card_progress với RLS)
- ✅ Dashboard Layout (sidebar, header, KPI cards)
- ✅ TypeScript types trong `src/types/index.ts`

**Quy tắc bắt buộc (giữ nguyên từ Phase 2):**

- Tất cả file `.ts` / `.tsx`, không dùng `.js`
- Server Components mặc định, `"use client"` chỉ khi cần interactivity
- Server Actions có `"use server"`, validate bằng Zod
- Import Supabase đúng context (server/client)
- UI text dùng tiếng Việt
- Commit sau mỗi nhóm tính năng

---

## NGÀY 1 (25/05) — CRUD DECK + AI GENERATE FLASHCARD

### BƯỚC 1 — Server Actions cho Deck

Tạo `src/actions/deck.actions.ts` với `"use server"`.

**`createDeck(formData: FormData)`**

- Zod schema: `title` (string, min 1, max 100), `description` (string optional, max 500)
- Lấy user từ `supabase.auth.getUser()`
- Insert vào bảng `decks` với `user_id`
- `revalidatePath("/dashboard/decks")`
- Return `{ success: true, deck }` hoặc `{ success: false, error }`

**`updateDeck(id: string, formData: FormData)`**

- Validate id là UUID hợp lệ
- Update chỉ các field `title`, `description`, `updated_at = now()`
- RLS tự đảm bảo chỉ owner mới update được
- `revalidatePath("/dashboard/decks")` và `revalidatePath(\`/dashboard/decks/\${id}\`)`

**`deleteDeck(id: string)`**

- Delete deck — CASCADE sẽ tự xoá flashcards và card_progress liên quan
- `revalidatePath("/dashboard/decks")`
- Return `{ success: true }` hoặc `{ success: false, error }`

---

### BƯỚC 2 — Server Actions cho Flashcard

Tạo `src/actions/flashcard.actions.ts` với `"use server"`.

**`createFlashcard(formData: FormData)`**

- Zod: `deckId` (UUID), `question` (string, min 1, max 500), `answer` (string, min 1, max 1000)
- Verify deck thuộc về user hiện tại trước khi insert
- Insert vào `flashcards`
- `revalidatePath(\`/dashboard/decks/\${deckId}\`)`

**`updateFlashcard(id: string, formData: FormData)`**

- Zod: `question`, `answer`
- Update flashcard, verify ownership qua JOIN với decks

**`deleteFlashcard(id: string, deckId: string)`**

- Delete flashcard (card_progress CASCADE tự xoá)
- `revalidatePath(\`/dashboard/decks/\${deckId}\`)`

**`saveGeneratedCards(deckId: string, cards: { question: string; answer: string }[])`**

- Validate deckId và cards array (min 1, max 20 items)
- Batch insert tất cả cards vào `flashcards`
- `revalidatePath(\`/dashboard/decks/\${deckId}\`)`
- Return `{ success: true, count: number }`

---

### BƯỚC 3 — Trang Danh Sách Deck `/dashboard/decks`

Tạo `src/app/(dashboard)/dashboard/decks/page.tsx` là **Server Component**:

- Query tất cả decks của user kèm flashcard_count và due_count (số card next_review_at <= now())
- Dùng Supabase query với select có count

Tạo `src/components/deck/deck-list.tsx` — Server Component render grid decks.

Tạo `src/components/deck/deck-card.tsx` — Server Component hiển thị từng deck:

- Tên deck (font semibold, truncate 1 dòng)
- Mô tả (text-muted, truncate 2 dòng, min-height để đồng đều)
- Footer: badge "X thẻ", badge "X cần ôn" (màu cam/đỏ nếu >0)
- Ngày tạo format dd/MM/yyyy (dùng `date-fns`)
- Hover effect, cursor pointer, toàn bộ card là link đến `/dashboard/decks/[id]`

Tạo `src/components/deck/create-deck-dialog.tsx` — **Client Component**:

- Nút "Tạo bộ thẻ mới" (với icon Plus) ở header trang
- Mở Dialog khi click
- Form trong Dialog: input tên, textarea mô tả
- Submit gọi Server Action `createDeck` với `useTransition`
- Loading state trên nút submit
- Đóng dialog và toast success sau khi tạo xong

Tạo `src/components/deck/deck-actions.tsx` — **Client Component** (3-dot menu):

- DropdownMenu với 2 options: "Chỉnh sửa" và "Xoá"
- "Chỉnh sửa" mở Edit Dialog (form tương tự Create)
- "Xoá" mở AlertDialog xác nhận trước khi gọi `deleteDeck`

---

### BƯỚC 4 — Trang Chi Tiết Deck `/dashboard/decks/[id]`

Tạo `src/app/(dashboard)/dashboard/decks/[id]/page.tsx` — **Server Component**:

- Fetch deck theo id, kiểm tra RLS (nếu không tồn tại hoặc không phải owner → `notFound()`)
- Fetch tất cả flashcards của deck
- Truyền data xuống components

**Header section:**

- Tên deck (heading lớn) + mô tả
- Nút "Học ngay" (nổi bật, màu primary) → link đến `/dashboard/decks/[id]/study`
- Nút "Sinh flashcard AI" → link đến `/dashboard/decks/[id]/generate`
- DeckActions component (edit/delete) cho deck này

**Stats bar:**

- 3 số liệu nhỏ: Tổng thẻ / Cần ôn hôm nay / Đã thành thạo (card có interval_days >= 21)

**Flashcard list section:**

- Nút "Thêm thẻ thủ công" mở inline Create Form phía trên danh sách
- Table hiển thị flashcards: STT / Câu hỏi (truncate) / Câu trả lời (truncate) / Ngày tạo / Actions
- Mỗi row: nút Edit (mở inline form) + nút Delete (confirm)
- Empty state nếu chưa có flashcard: "Bộ thẻ này chưa có thẻ nào. Thêm thủ công hoặc sinh bằng AI."

Tạo `src/components/flashcard/flashcard-table.tsx` — **Client Component** (cần state cho inline edit form).

Tạo `src/components/flashcard/add-flashcard-form.tsx` — **Client Component**:

- Inline form (không dialog) gồm 2 textarea: Câu hỏi và Câu trả lời
- Submit gọi `createFlashcard`, reset form sau khi thành công

---

### BƯỚC 5 — API Route Gemini Generate

Tạo `src/app/api/generate/route.ts` — **Route Handler**:

```
POST /api/generate
Body: { text: string, count: 5|10|15|20, deckId: string }
```

Logic:

1. Lấy session từ Supabase, return 401 nếu chưa auth
2. Validate body bằng Zod
3. Verify deckId thuộc về user (query DB)
4. Khởi tạo Gemini client với `GEMINI_API_KEY` từ env
5. Gọi `gemini-2.0-flash` model với prompt:

```
System: Bạn là giáo viên chuyên nghiệp tạo flashcard học tập.
Nhiệm vụ: Tạo ĐÚNG {count} flashcard từ nội dung được cung cấp.
Yêu cầu:
- Câu hỏi: ngắn gọn, rõ ràng, tập trung 1 khái niệm
- Câu trả lời: súc tích, đầy đủ thông tin cốt lõi
- Đa dạng loại câu hỏi: định nghĩa, ví dụ, so sánh, ứng dụng
- Trả về JSON array KHÔNG có markdown, KHÔNG có text thêm

Format bắt buộc:
[{"question":"...","answer":"..."},{"question":"...","answer":"..."}]

Nội dung:
{text}
```

6. Parse response, validate bằng Zod schema `z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) }))`
7. Return JSON array

Error handling:

- Nếu Gemini trả về format sai: retry 1 lần với prompt điều chỉnh
- Nếu vẫn sai: return 500 với message "AI không thể phân tích nội dung này"
- Rate limit (429): return 429 với message rõ ràng

---

### BƯỚC 6 — Trang Sinh Flashcard AI `/dashboard/decks/[id]/generate`

Tạo `src/app/(dashboard)/dashboard/decks/[id]/generate/page.tsx` — Server Component:

- Verify deck tồn tại và thuộc về user
- Render `GenerateFlashcardForm` client component

Tạo `src/components/flashcard/generate-form.tsx` — **Client Component**:

**Tab 1 — Nhập văn bản:**

- Textarea lớn, placeholder "Nhập nội dung bài học, đoạn văn bản, ghi chú..."
- Character counter góc phải: "X / 5000 ký tự" (đỏ khi > 4500)
- Màu border đỏ khi vượt 5000 ký tự

**Tab 2 — Upload file:**

- Drag & drop zone: border dashed, icon Upload, text "Kéo thả file PDF hoặc TXT vào đây"
- Click để chọn file, accept `.pdf,.txt`
- Sau khi chọn: hiển thị tên file, kích thước, nút xoá
- Validate phía client: kích thước <= 5MB, đúng loại file
- Upload file lên Supabase Storage qua Server Action `uploadDocument`
- Sau upload: extract text từ file rồi populate vào textarea Tab 1

**Select số lượng thẻ:** Radio group 4 options: 5 / 10 / 15 / 20 (default: 10)

**Nút "Sinh Flashcard":**

- Disabled nếu text rỗng hoặc đang loading
- Loading state: spinner + progress text "Đang phân tích nội dung... (có thể mất vài giây)"
- Gọi `fetch("/api/generate", { method: "POST", body: JSON.stringify({ text, count, deckId }) })`

**Preview kết quả (hiện sau khi có response):**

- Tiêu đề "Xem trước X flashcard được sinh"
- Danh sách cards dạng 2 cột (câu hỏi | câu trả lời), mỗi card có checkbox
- Tất cả checkbox mặc định checked
- Nút "Bỏ chọn tất cả" / "Chọn tất cả"
- Nút "Lưu X thẻ đã chọn vào bộ thẻ" (nổi bật, gọi Server Action `saveGeneratedCards`)
- Toast success sau khi lưu + redirect về trang chi tiết deck

---

### BƯỚC 7 — Server Action Upload Document

Tạo trong `src/actions/flashcard.actions.ts`:

**`uploadDocument(formData: FormData)`**

- Extract file từ formData
- Validate: <= 5MB, mime type là `application/pdf` hoặc `text/plain`
- Upload lên Supabase Storage bucket `documents`, path: `{userId}/{deckId}/{timestamp}-{filename}`
- Dùng `SUPABASE_SERVICE_ROLE_KEY` để upload (service role bypass RLS)
- Return `{ success: true, path, text }` — trong đó `text` là nội dung extract từ file

Logic extract text:

- TXT: đọc buffer thành string UTF-8
- PDF: dùng `pdf-parse` library

---

**Commit sau Bước 7:**

```
git add .
git commit -m "feat(deck): implement deck and flashcard CRUD

- Add deck server actions (create, update, delete)
- Add flashcard server actions (create, update, delete, saveGenerated)
- Add deck list page with create/edit/delete UI
- Add deck detail page with flashcard table
- Add inline add/edit flashcard form"

git add .
git commit -m "feat(ai): integrate Gemini API for flashcard generation

- Add POST /api/generate route with Gemini 2.0 Flash
- Add generate flashcard page with text input and file upload tabs
- Add drag-and-drop file upload with PDF/TXT extraction
- Add flashcard preview with checkbox selection before saving
- Add uploadDocument server action with Supabase Storage"
```

---

## NGÀY 2 (26/05) — STUDY MODE + SPACED REPETITION

### BƯỚC 8 — Implement Thuật Toán SM-2

Tạo `src/lib/sm2.ts` — pure TypeScript, không import bất kỳ thứ gì ngoài types:

```typescript
interface SM2Input {
  grade: 1 | 2 | 3 | 4;
  easeFactor: number; // default 2.5
  intervalDays: number; // default 1
  repetitions: number; // default 0
}

interface SM2Output {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewAt: Date;
}
```

Logic SM-2:

- Nếu grade < 3: reset `repetitions = 0`, `intervalDays = 1`
- Nếu grade >= 3:
  - repetitions = 0 → intervalDays = 1
  - repetitions = 1 → intervalDays = 6
  - repetitions > 1 → intervalDays = Math.round(intervalDays \* easeFactor)
  - repetitions += 1
- easeFactor = Math.max(1.3, easeFactor + 0.1 - (4 - grade) _ (0.08 + (4 - grade) _ 0.02))
- nextReviewAt = new Date(Date.now() + intervalDays _ 24 _ 60 _ 60 _ 1000)

Export: `calculateSM2(input: SM2Input): SM2Output`

Viết thêm unit test đơn giản bằng comments (không cần test framework):

- grade 4 lần đầu: interval = 1, repetitions = 1
- grade 4 lần 2: interval = 6
- grade 1 sau nhiều lần: reset về interval = 1

---

### BƯỚC 9 — Server Action cho Study Progress

Tạo `src/actions/progress.actions.ts` với `"use server"`:

**`updateCardProgress(flashcardId: string, grade: 1|2|3|4)`**

- Lấy user hiện tại
- Query `card_progress` theo (user_id, flashcard_id)
- Nếu chưa có record → tạo mới với default values
- Gọi `calculateSM2()` với data hiện tại và grade mới
- Upsert vào `card_progress` với `ease_factor`, `interval_days`, `repetitions`, `next_review_at`, `last_reviewed_at = now()`
- Return `{ success: true, progress }`

**`getStudyCards(deckId: string)`**

- Query flashcards của deck có card_progress.next_review_at <= now() (hoặc chưa có progress)
- LEFT JOIN với card_progress của user
- Return array StudyCard type, shuffle ngẫu nhiên
- Limit tối đa 50 cards mỗi session

---

### BƯỚC 10 — Trang Study Mode `/dashboard/decks/[id]/study`

Tạo `src/app/(dashboard)/dashboard/decks/[id]/study/page.tsx` — **Server Component**:

- Fetch deck info (tên deck)
- Gọi `getStudyCards(deckId)`
- Nếu không có card nào:
  - Query card tiếp theo gần nhất (`MIN(next_review_at)` trong deck)
  - Render `NoCardsState` component với countdown đến card tiếp theo
- Nếu có cards: render `StudySession` client component với cards data

Tạo `src/components/study/no-cards-state.tsx` — Server Component:

- Icon checkmark lớn màu xanh
- Text "Tuyệt vời! Bạn đã ôn xong tất cả thẻ hôm nay 🎉"
- Hiển thị "Thẻ tiếp theo cần ôn: {ngày giờ}" nếu có
- Nút "Quay về bộ thẻ"

---

### BƯỚC 11 — Study Session Component

Tạo `src/components/study/study-session.tsx` — **Client Component** (đây là component phức tạp nhất):

**State management:**

```typescript
const [currentIndex, setCurrentIndex] = useState(0);
const [isFlipped, setIsFlipped] = useState(false);
const [sessionStats, setSessionStats] = useState({
  total: cards.length,
  reviewed: 0,
  correct: 0,
});
const [isSubmitting, setIsSubmitting] = useState(false);
const [isFinished, setIsFinished] = useState(false);
```

**Layout:**

- Progress bar ở trên: "X / Y thẻ" + thanh tiến trình (shadcn Progress component)
- Tên deck ở trên cùng (nhỏ, muted)

**Flashcard component** (`src/components/study/flashcard-card.tsx`):

- Container với perspective CSS cho hiệu ứng 3D flip
- Mặt trước: label "CÂU HỎI" (badge nhỏ, muted) + nội dung câu hỏi (text lớn, căn giữa)
- Mặt sau: label "TRẢ LỜI" (badge nhỏ, xanh) + nội dung câu trả lời
- Click/tap vào card để flip (toggle `isFlipped`)
- CSS transition `transform: rotateY(180deg)` với `transition-duration: 0.4s`
- Card có shadow, border-radius, min-height 200px
- Hint text phía dưới khi chưa flip: "Nhấn vào thẻ để xem đáp án"

**Rating buttons** (chỉ hiển thị sau khi đã flip card):

- 4 nút theo hàng ngang với màu sắc khác nhau:
  - 🔴 **1 — Không nhớ** (variant destructive)
  - 🟠 **2 — Khó** (màu orange)
  - 🟢 **3 — Ổn** (variant default)
  - 🔵 **4 — Dễ** (màu blue)
- Mỗi nút có tooltip giải thích ngắn: "1 = Không nhớ gì, ôn lại sớm"
- Khi click:
  1. setIsSubmitting(true)
  2. Gọi Server Action `updateCardProgress(card.id, grade)`
  3. Cập nhật sessionStats
  4. setIsFlipped(false)
  5. Nếu còn card: setCurrentIndex(i + 1) sau 300ms (để animation flip về mặt trước)
  6. Nếu hết card: setIsFinished(true)

**Keyboard shortcuts** (dùng `useEffect` với event listener):

- `Space` hoặc `Enter`: flip card
- `1`, `2`, `3`, `4`: chọn rating (chỉ khi đã flip)
- Hiển thị hint keyboard shortcuts nhỏ phía dưới các nút

---

### BƯỚC 12 — Màn Hình Kết Thúc Session

Tạo `src/components/study/session-complete.tsx` — **Client Component**:

Hiển thị kết quả session:

- Icon 🎉 hoặc animation đơn giản
- "Hoàn thành! Bạn đã ôn {total} thẻ"
- Stats grid:
  - ✅ Nhớ tốt (grade 3+4): X thẻ
  - ❌ Cần ôn thêm (grade 1+2): X thẻ
  - 📊 Tỷ lệ nhớ: X%
  - ⏱️ Thời gian: X phút
- Nếu tỷ lệ >= 80%: hiển thị text động viên "Xuất sắc! Tiếp tục phát huy"
- Nếu < 80%: "Cố lên! Luyện tập thêm nhé"
- 2 nút hành động:
  - "Học lại ngay" (outline) → reload trang study
  - "Quay về bộ thẻ" (primary) → navigate đến `/dashboard/decks/[id]`

---

### BƯỚC 13 — Cập nhật Dashboard KPI (Realtime placeholder)

Cập nhật `src/components/dashboard/stats-cards.tsx`:

- Thêm prop `dueCount` từ query thực tế: `SELECT COUNT(*) FROM card_progress WHERE user_id = auth.uid() AND next_review_at <= now()`
- Badge đỏ nhấp nháy (animate-pulse) khi `dueCount > 0`
- Link "Xem tất cả" trên card "Cần Ôn Hôm Nay" → `/dashboard/decks`

---

### BƯỚC 14 — Kiểm tra End-to-End Flow

Kiểm tra toàn bộ luồng chính:

1. Tạo deck mới → thấy trong danh sách ✅
2. Vào deck → thêm flashcard thủ công ✅
3. Vào trang Generate → nhập text → sinh 10 flashcard bằng AI ✅
4. Xem preview → bỏ chọn 2 cards → lưu 8 cards vào deck ✅
5. Quay về deck detail → thấy 9 flashcards (1 thủ công + 8 AI) ✅
6. Nhấn "Học ngay" → thấy study session ✅
7. Flip card → đánh giá grade 3 → card tiếp theo ✅
8. Học hết → thấy màn hình tổng kết ✅
9. Quay về dashboard → KPI "Cần ôn" cập nhật ✅
10. Edit deck tên → thấy thay đổi trong list ✅
11. Delete flashcard → biến khỏi table ✅
12. Delete deck → biến khỏi danh sách ✅

Nếu bất kỳ bước nào fail, fix trước khi commit.

---

### BƯỚC 15 — Commit cuối Giai Đoạn 3

```
git add .
git commit -m "feat(study): implement study mode with SM-2 spaced repetition

- Add SM-2 algorithm implementation in lib/sm2.ts
- Add updateCardProgress and getStudyCards server actions
- Add study session page with flashcard flip animation
- Add 4-level rating system (1=Again, 2=Hard, 3=Good, 4=Easy)
- Add keyboard shortcuts for study (Space=flip, 1-4=rate)
- Add session complete screen with stats summary
- Add no-cards state with next review countdown"
```

---

## KẾT QUẢ MONG ĐỢI KHI HOÀN THÀNH GIAI ĐOẠN 3

- ✅ Tạo / sửa / xoá Deck hoạt động (với confirm dialog trước khi xoá)
- ✅ Thêm / sửa / xoá Flashcard thủ công hoạt động
- ✅ AI Generate: nhập text → sinh flashcard → preview → lưu vào deck
- ✅ Upload file PDF/TXT: extract text → sinh flashcard
- ✅ Study mode: flip card → rating → SM-2 cập nhật next_review_at
- ✅ Keyboard shortcuts trong study mode
- ✅ Màn hình tổng kết session có stats đầy đủ
- ✅ RLS đảm bảo: user không thể thao tác deck của người khác
- ✅ Toàn bộ 3 commits đã push lên GitHub

---

## LƯU Ý QUAN TRỌNG

- **PDF parsing server-side**: `pdf-parse` phải chạy trên server (Server Action / Route Handler), KHÔNG import trong Client Component. Đảm bảo `next.config.ts` có `serverExternalPackages: ["pdf-parse"]`.
- **Gemini API key**: Nếu `GEMINI_API_KEY` chưa có trong `.env.local`, hiển thị thông báo rõ ràng hướng dẫn lấy key tại https://aistudio.google.com/apikey — KHÔNG để app crash.
- **AI response parsing**: Gemini đôi khi trả về JSON bọc trong markdown code block (`json ... `). Cần strip markdown trước khi JSON.parse.
- **Study session state**: Dữ liệu cards được fetch server-side và pass xuống client component dưới dạng props — KHÔNG fetch lại ở client để tránh flicker.
- **SM-2 edge case**: Với card mới (chưa có `card_progress`), tạo record mới với `repetitions = 0`, `ease_factor = 2.5`, `interval_days = 1` trước khi tính SM-2.
- **Flashcard flip CSS**: Cần đặt `transform-style: preserve-3d` trên container và `backface-visibility: hidden` trên cả 2 mặt. Mặt sau cần `transform: rotateY(180deg)` từ đầu.
