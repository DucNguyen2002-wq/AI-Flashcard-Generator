# Prompt Giai Đoạn 1 — Setup & Khởi Tạo Dự Án

> **Dành cho:** Claude Sonnet 4.6 (AI Agent)  
> **Mục tiêu:** Hoàn thành toàn bộ setup dự án AI Flashcard Generator trong một lần chạy  
> **Thời gian ước tính:** 1–2 giờ

---

## SYSTEM CONTEXT

Bạn là một senior full-stack developer. Bạn đang giúp sinh viên setup dự án **AI Flashcard Generator** — một ứng dụng web full-stack cuối kỳ môn học, với các ràng buộc công nghệ bắt buộc:

- **Frontend:** Next.js 15 App Router + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Auth + PostgreSQL + Storage + Realtime)
- **Container:** Docker multi-stage build + Docker Compose
- **AI:** Google Gemini 2.0 Flash
- **Git:** Conventional Commits

Thông tin Supabase project đã được tạo sẵn:

```
NEXT_PUBLIC_SUPABASE_URL=https://zgdgwdwgxoavfjhjosjf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZGd3ZHdneG9hdmZqaGpvc2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MDkwNjAsImV4cCI6MjA5NDQ4NTA2MH0.4lZ0OuyDJGNfCY6LPcCP_4II3X3itHrIfHlnyudP8RM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZGd3ZHdneG9hdmZqaGpvc2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODkwOTA2MCwiZXhwIjoyMDk0NDg1MDYwfQ.YYM1Pd7aqCYGV4HiQOczefsfkSCcfI4Rxk0VmUe0-xU
```

---

## NHIỆM VỤ

Thực hiện tuần tự toàn bộ các bước sau. **Sau mỗi bước, báo cáo ngắn kết quả trước khi tiếp tục bước kế.**

---

### BƯỚC 1 — Khởi tạo Next.js Project

Tạo project Next.js mới với tên `ai-flashcard` bằng `create-next-app` với các tùy chọn sau:

- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **Yes**
- App Router: **Yes**
- Turbopack: **Yes**
- Import alias: **@/\***

Sau khi tạo xong, di chuyển vào thư mục dự án và cài đặt tất cả các dependencies sau trong một lệnh:

**Production dependencies:**

- `@supabase/supabase-js`
- `@supabase/ssr`
- `@google/generative-ai`
- `ai` (Vercel AI SDK)
- `zod`
- `recharts`
- `pdf-parse`
- `lucide-react`
- `clsx`
- `tailwind-merge`
- `class-variance-authority`
- `date-fns`

**Dev dependencies:**

- `@types/pdf-parse`
- `supabase` (CLI)

---

### BƯỚC 2 — Cài đặt và Init shadcn/ui

Chạy lệnh init shadcn/ui với style **default**, base color **neutral**, CSS variables **yes**.

Sau đó cài đặt tất cả các component shadcn/ui cần thiết cho dự án trong một lệnh:
`button`, `card`, `dialog`, `form`, `input`, `label`, `badge`, `progress`, `separator`, `sheet`, `toast`, `skeleton`, `select`, `textarea`, `tabs`, `dropdown-menu`, `avatar`, `alert`, `tooltip`, `scroll-area`, `table`

---

### BƯỚC 3 — Tạo cấu trúc thư mục

Tạo toàn bộ cấu trúc thư mục dự án theo đúng layout sau (tạo file `.gitkeep` trong các thư mục rỗng):

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── decks/
│   │   │       └── [id]/
│   │   │           ├── generate/
│   │   │           └── study/
│   │   └── settings/
│   └── api/
│       ├── generate/
│       └── health/
├── components/
│   ├── ui/          (shadcn components — đã có)
│   ├── auth/
│   ├── deck/
│   ├── flashcard/
│   ├── study/
│   └── dashboard/
├── lib/
│   ├── supabase/
│   ├── sm2.ts       (file rỗng)
│   ├── gemini.ts    (file rỗng)
│   └── utils.ts     (đã có từ shadcn)
├── actions/
├── hooks/
└── types/
```

---

### BƯỚC 4 — Tạo file biến môi trường

Tạo hai file:

**`.env.local`** — dùng cho development, điền đầy đủ giá trị thật:

```
NEXT_PUBLIC_SUPABASE_URL=https://zgdgwdwgxoavfjhjosjf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZGd3ZHdneG9hdmZqaGpvc2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MDkwNjAsImV4cCI6MjA5NDQ4NTA2MH0.4lZ0OuyDJGNfCY6LPcCP_4II3X3itHrIfHlnyudP8RM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZGd3ZHdneG9hdmZqaGpvc2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODkwOTA2MCwiZXhwIjoyMDk0NDg1MDYwfQ.YYM1Pd7aqCYGV4HiQOczefsfkSCcfI4Rxk0VmUe0-xU
GEMINI_API_KEY= AIzaSyDpt9XJF4k5Qlu2Et4282hygI-daEM9XOY
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**`.env.example`** — template commit lên GitHub, không chứa giá trị thật:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### BƯỚC 5 — Cập nhật .gitignore

Đảm bảo `.gitignore` có đủ các mục sau (thêm vào nếu thiếu, không xoá cái đã có):

- `.env.local`
- `.env.production`
- `.env*.local`
- `node_modules/`
- `.next/`
- `out/`
- `.DS_Store`
- `*.log`
- `supabase/.temp/`

---

### BƯỚC 6 — Tạo Supabase Database Schema

Sử dụng **Supabase CLI** hoặc tạo file SQL migration để tạo toàn bộ schema database. Tạo file `supabase/migrations/001_initial_schema.sql` với nội dung tạo đúng 3 bảng và RLS policies:

**Bảng `decks`:**

- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `user_id` UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `title` TEXT NOT NULL (max 100 ký tự, check constraint)
- `description` TEXT
- `source_file` TEXT (path trong Supabase Storage)
- `created_at` TIMESTAMPTZ DEFAULT now()
- `updated_at` TIMESTAMPTZ DEFAULT now()

**Bảng `flashcards`:**

- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `deck_id` UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE
- `question` TEXT NOT NULL
- `answer` TEXT NOT NULL
- `created_at` TIMESTAMPTZ DEFAULT now()

**Bảng `card_progress`:**

- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `user_id` UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `flashcard_id` UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE
- `ease_factor` FLOAT DEFAULT 2.5
- `interval_days` INT DEFAULT 1
- `repetitions` INT DEFAULT 0
- `next_review_at` TIMESTAMPTZ DEFAULT now()
- `last_reviewed_at` TIMESTAMPTZ
- UNIQUE constraint trên (user_id, flashcard_id)

**RLS Policies** (enable RLS trên cả 3 bảng, tạo policy ALL cho từng bảng):

- `decks`: `user_id = auth.uid()`
- `flashcards`: `deck_id IN (SELECT id FROM decks WHERE user_id = auth.uid())`
- `card_progress`: `user_id = auth.uid()`

**Trigger `updated_at`** tự động cập nhật trường `updated_at` trên bảng `decks` mỗi khi có UPDATE.

Sau khi tạo file SQL, chạy migration lên Supabase remote bằng Supabase CLI. Nếu CLI chưa login, hướng dẫn sinh viên bước này cần làm thủ công.

---

### BƯỚC 7 — Tạo Supabase Storage Bucket

Tạo file SQL hoặc script để tạo bucket `documents` trong Supabase Storage với cấu hình:

- Bucket name: `documents`
- Public: **false** (private)
- File size limit: 5MB (5242880 bytes)
- Allowed MIME types: `application/pdf`, `text/plain`
- Storage Policy: user chỉ đọc/ghi được file trong thư mục `{user_id}/`

Lưu script vào `supabase/migrations/002_storage_bucket.sql`.

---

### BƯỚC 8 — Tạo Supabase Client Helpers

Tạo hai file helper để khởi tạo Supabase client:

**`src/lib/supabase/client.ts`** — Dùng trong Client Components (browser):

- Dùng `createBrowserClient` từ `@supabase/ssr`
- Export function `createClient()` không tham số

**`src/lib/supabase/server.ts`** — Dùng trong Server Components, Server Actions, Route Handlers:

- Dùng `createServerClient` từ `@supabase/ssr`
- Đọc/ghi cookies qua Next.js `cookies()` API
- Export async function `createClient()`

**`src/lib/supabase/middleware.ts`** — Helper cho middleware:

- Export function `updateSession(request: NextRequest)` để refresh Supabase session
- Trả về `{ supabaseResponse, user }` để middleware dùng

---

### BƯỚC 9 — Tạo Middleware bảo vệ route

Tạo file `src/middleware.ts`:

- Import `updateSession` từ `@/lib/supabase/middleware`
- Bảo vệ tất cả routes bắt đầu bằng `/dashboard`
- Nếu chưa có session → redirect về `/login`
- Nếu đã có session và đang ở `/login` hoặc `/register` → redirect về `/dashboard`
- Config `matcher` để áp dụng cho tất cả routes trừ static files và `_next`

---

### BƯỚC 10 — Tạo TypeScript Types

Tạo file `src/types/index.ts` định nghĩa tất cả TypeScript types cho dự án:

- `Database` type từ Supabase (dựa trên schema đã tạo) — tạo thủ công theo đúng cấu trúc bảng
- `Deck` type (Row type từ bảng decks)
- `Flashcard` type (Row type từ bảng flashcards)
- `CardProgress` type (Row type từ bảng card_progress)
- `DeckWithCount` type (Deck + flashcard_count + due_count)
- `StudyCard` type (Flashcard + CardProgress | null)
- `GeneratedCard` type `{ question: string; answer: string; selected: boolean }`
- `SM2Grade` type: `1 | 2 | 3 | 4`
- `SM2Result` type: `{ easeFactor: number; intervalDays: number; repetitions: number; nextReviewAt: Date }`

---

### BƯỚC 11 — Kiểm tra cấu hình Next.js

Cập nhật `next.config.ts` để:

- Enable `output: 'standalone'` (cần cho Docker)
- Thêm `images.remotePatterns` cho Supabase storage URL: `zgdgwdwgxoavfjhjosjf.supabase.co`
- Thêm `serverExternalPackages: ['pdf-parse']` (tránh lỗi bundle)

---

### BƯỚC 12 — Tạo API Route Health Check

Tạo `src/app/api/health/route.ts`:

- GET handler trả về JSON `{ status: "ok", timestamp: new Date().toISOString(), version: "1.0.0" }`
- Dùng để Docker healthcheck

---

### BƯỚC 13 — Tạo Dockerfile và Docker Compose

**`Dockerfile`** (multi-stage, 3 stages: deps → builder → runner):

- Base image: `node:20-alpine`
- Stage deps: install production dependencies
- Stage builder: copy deps, copy source, set `NEXT_TELEMETRY_DISABLED=1`, run `npm run build`
- Stage runner: copy standalone output từ builder, tạo non-root user `nextjs`, expose port 3000
- CMD: `node server.js`

**`docker-compose.yml`:**

- Service `app`: build từ Dockerfile, port `3000:3000`, env_file `.env.local`, restart `unless-stopped`
- Healthcheck: GET `http://localhost:3000/api/health`, interval 30s, timeout 10s, retries 3

**`.dockerignore`:**

- `node_modules`, `.next`, `.git`, `*.md`, `.env*`, `supabase/.temp`

---

### BƯỚC 14 — Commit lên GitHub

Thực hiện commit đầu tiên theo Conventional Commits:

```
git add .
git commit -m "chore: initial project setup

- Initialize Next.js 15 with App Router, TypeScript, Tailwind CSS
- Install and configure shadcn/ui with required components
- Setup Supabase client helpers (browser + server + middleware)
- Create project folder structure and TypeScript types
- Add database schema migration (decks, flashcards, card_progress)
- Add RLS policies for all tables
- Add Supabase Storage bucket configuration
- Add Next.js middleware for route protection
- Add Dockerfile multi-stage build and docker-compose.yml
- Add health check API route
- Configure next.config.ts with standalone output"
```

---

### BƯỚC 15 — Kiểm tra cuối giai đoạn

Sau khi hoàn thành tất cả bước trên, thực hiện kiểm tra:

1. Chạy `npm run dev` — kiểm tra không có lỗi compile
2. Chạy `npm run build` — kiểm tra build thành công
3. Kiểm tra file `.env.local` có đủ 5 biến môi trường
4. Kiểm tra `src/middleware.ts` đã được tạo
5. Kiểm tra `src/lib/supabase/client.ts`, `server.ts`, `middleware.ts` đã được tạo
6. Kiểm tra `src/types/index.ts` có đủ các types
7. Kiểm tra `Dockerfile` và `docker-compose.yml` đã được tạo
8. Kiểm tra `supabase/migrations/` có 2 file SQL

Báo cáo kết quả kiểm tra. Nếu có lỗi nào, tự fix trước khi kết thúc.

---

## KẾT QUẢ MONG ĐỢI

Khi giai đoạn 1 hoàn thành:

- ✅ `npm run dev` chạy không lỗi, truy cập `http://localhost:3000` thấy Next.js app
- ✅ `npm run build` thành công
- ✅ Supabase có đủ 3 bảng với RLS (cần chạy migration thủ công nếu CLI chưa link)
- ✅ File `.env.local` điền đầy đủ (trừ `GEMINI_API_KEY` — sinh viên tự lấy key)
- ✅ Cấu trúc thư mục đúng theo spec
- ✅ Middleware bảo vệ route `/dashboard`
- ✅ Dockerfile và docker-compose.yml sẵn sàng
- ✅ 1 commit trên GitHub

---

## LƯU Ý QUAN TRỌNG

- **KHÔNG** dùng Pages Router. Chỉ dùng App Router.
- **KHÔNG** dùng JavaScript thuần. Tất cả file phải là `.ts` hoặc `.tsx`.
- **KHÔNG** commit file `.env.local` hoặc `.env.production` lên GitHub.
- Supabase migration cần được chạy thủ công nếu `supabase login` chưa được thực hiện — trong trường hợp đó, xuất ra file SQL để sinh viên paste vào Supabase SQL Editor.
- Nếu `GEMINI_API_KEY` chưa có, để trống trong `.env.local` và ghi chú rõ cách lấy key tại [https://aistudio.google.com](https://aistudio.google.com).
- Luôn giải thích ngắn gọn **tại sao** khi đưa ra quyết định thiết kế quan trọng (ví dụ: tại sao dùng `createServerClient` thay vì `createClient` trong Server Component).
