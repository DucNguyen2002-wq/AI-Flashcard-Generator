# Prompt Giai Đoạn 2 — Authentication & Dashboard Layout

> **Dành cho:** Claude Sonnet 4.6 (AI Agent)
> **Tiền đề:** Giai đoạn 1 đã hoàn thành — project chạy được, Supabase đã kết nối, middleware đã có
> **Mục tiêu:** Toàn bộ luồng Auth hoạt động + Dashboard Layout hoàn chỉnh
> **Thời gian ước tính:** 2 ngày (23/05 – 24/05)

---

## SYSTEM CONTEXT

Bạn đang làm việc trên dự án **AI Flashcard Generator** đã được khởi tạo ở Giai đoạn 1. Cấu trúc thư mục, Supabase client helpers, middleware và TypeScript types đã có sẵn.

**Thông tin project:**

- Framework: Next.js 15 App Router + TypeScript
- UI: Tailwind CSS + shadcn/ui
- Auth: Supabase Auth (Email/Password + Google OAuth)
- Supabase URL: `https://zgdgwdwgxoavfjhjosjf.supabase.co`

**Quy tắc bắt buộc trong toàn bộ giai đoạn này:**

- Tất cả file phải là `.ts` hoặc `.tsx` — không dùng `.js`
- Dùng App Router, Server Components mặc định — chỉ thêm `"use client"` khi thực sự cần interactivity
- Server Actions phải có `"use server"` directive, validate input bằng Zod trước khi thao tác DB
- Import Supabase client đúng: `createClient` từ `@/lib/supabase/server` trong Server Component/Action, từ `@/lib/supabase/client` trong Client Component
- Mọi lỗi phải được xử lý và hiển thị thông báo cụ thể cho user
- Commit sau mỗi nhóm tính năng hoàn chỉnh theo Conventional Commits

---

## NGÀY 1 (23/05) — AUTHENTICATION

### BƯỚC 1 — Server Actions cho Authentication

Tạo file `src/actions/auth.actions.ts` với `"use server"` directive.

Implement 3 server actions:

**`signUp(formData: FormData)`**

- Extract email, password, confirmPassword từ formData
- Validate bằng Zod: email hợp lệ, password tối thiểu 8 ký tự, có ít nhất 1 chữ số, confirmPassword khớp password
- Gọi `supabase.auth.signUp({ email, password })`
- Nếu thành công: return `{ success: true, message: "Kiểm tra email để xác nhận tài khoản" }`
- Nếu lỗi: return `{ success: false, error: message lỗi tiếng Việt }`
- Không redirect trong action — để page component xử lý

**`signIn(formData: FormData)`**

- Extract email, password từ formData
- Validate bằng Zod
- Gọi `supabase.auth.signInWithPassword({ email, password })`
- Nếu thành công: `revalidatePath("/")` rồi `redirect("/dashboard")`
- Nếu lỗi: return `{ success: false, error: "Email hoặc mật khẩu không đúng" }`

**`signOut()`**

- Gọi `supabase.auth.signOut()`
- `revalidatePath("/")` rồi `redirect("/login")`

---

### BƯỚC 2 — Trang Đăng Nhập `/login`

Tạo `src/app/(auth)/login/page.tsx` là **Server Component** render form đăng nhập.

Tạo `src/components/auth/login-form.tsx` là **Client Component** chứa logic form:

- Import và dùng `useFormState` + `useFormStatus` (React 19) hoặc `useState` + `useTransition` để xử lý loading state
- Form có 2 fields: Email (input type="email") và Mật khẩu (input type="password")
- Nút submit hiển thị spinner khi đang pending, text "Đang đăng nhập..."
- Nút "Đăng nhập với Google" — gọi `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: \`\${window.location.origin}/auth/callback\` } })`
- Divider "hoặc" giữa 2 phương thức đăng nhập
- Link "Chưa có tài khoản? Đăng ký" trỏ đến `/register`
- Hiển thị error message từ action dạng Alert đỏ nếu có
- Giao diện: card căn giữa trang, logo/tên app ở trên, shadow nhẹ

---

### BƯỚC 3 — Trang Đăng Ký `/register`

Tạo `src/app/(auth)/register/page.tsx` là Server Component.

Tạo `src/components/auth/register-form.tsx` là **Client Component**:

- Form có 3 fields: Email, Mật khẩu, Xác nhận mật khẩu
- Hiển thị realtime password strength indicator (Weak/Medium/Strong) dựa trên độ dài và ký tự đặc biệt
- Nút submit với loading state
- Link "Đã có tài khoản? Đăng nhập" trỏ đến `/login`
- Sau khi đăng ký thành công: hiển thị màn hình success với thông báo "Kiểm tra email để xác nhận tài khoản" — KHÔNG redirect ngay

---

### BƯỚC 4 — OAuth Callback Route

Tạo `src/app/auth/callback/route.ts` — Route Handler xử lý OAuth callback từ Supabase:

- GET handler nhận `code` từ query params
- Gọi `supabase.auth.exchangeCodeForSession(code)` để đổi code lấy session
- Nếu thành công: redirect về `/dashboard`
- Nếu lỗi: redirect về `/login?error=oauth_failed`

---

### BƯỚC 5 — Layout trang Auth

Tạo `src/app/(auth)/layout.tsx`:

- Layout đơn giản: full-height page, background gradient nhẹ (slate-50 → slate-100)
- Căn giữa nội dung theo cả chiều ngang và dọc
- Hiển thị tên app "AI Flashcard" và tagline nhỏ ở trên form

---

### BƯỚC 6 — Bảo vệ và điều hướng trang gốc

Cập nhật `src/app/page.tsx`:

- Server Component kiểm tra session Supabase
- Nếu đã đăng nhập → redirect `/dashboard`
- Nếu chưa → redirect `/login`

---

**Commit sau Bước 6:**

```
git add .
git commit -m "feat(auth): implement authentication flow

- Add signUp, signIn, signOut server actions with Zod validation
- Add login page with email/password form and Google OAuth button
- Add register page with password strength indicator
- Add OAuth callback route handler
- Add auth layout with centered card design
- Redirect root route based on session state"
```

---

## NGÀY 2 (24/05) — DASHBOARD LAYOUT & TRANG TỔNG QUAN

### BƯỚC 7 — Dashboard Layout với Sidebar

Tạo `src/app/(dashboard)/layout.tsx` là **Server Component**:

- Fetch user hiện tại từ Supabase session
- Nếu không có user → redirect `/login`
- Render layout 2 cột: sidebar cố định bên trái + main content area
- Pass user data xuống các child components qua props

Tạo `src/components/dashboard/sidebar.tsx` là **Client Component**:

**Cấu trúc sidebar:**

- Header: Logo icon (BookOpen từ lucide) + text "AI Flashcard"
- Navigation links (dùng `usePathname` để highlight active):
  - 🏠 Tổng quan → `/dashboard`
  - 📚 Bộ thẻ của tôi → `/dashboard/decks`
  - ⚙️ Cài đặt → `/dashboard/settings`
- Footer: Avatar người dùng (lấy từ email initials) + email rút gọn + nút Đăng xuất
- Nút Đăng xuất gọi Server Action `signOut`

**Responsive behavior:**

- Desktop (lg+): sidebar hiển thị cố định bên trái, width 240px
- Mobile (<lg): sidebar ẩn, hiện qua Sheet component (drawer từ trái) trigger bởi hamburger button trong header

Tạo `src/components/dashboard/header.tsx` là **Client Component**:

- Breadcrumb hiển thị tên trang hiện tại (dựa vào pathname)
- Hamburger menu button (chỉ hiện trên mobile) để toggle sidebar Sheet
- Dark/Light mode toggle button (dùng `next-themes` hoặc class toggle đơn giản vào `<html>`)
- Avatar nhỏ người dùng góc phải

---

### BƯỚC 8 — Cài đặt Theme (Dark/Light Mode)

Cài `next-themes`:

```
npm install next-themes
```

Tạo `src/components/providers.tsx` — Client Component bọc toàn bộ app:

- Wrap children bằng `ThemeProvider` từ next-themes
- attribute="class", defaultTheme="system", enableSystem

Cập nhật `src/app/layout.tsx` (root layout):

- Bọc `{children}` bằng `<Providers>`
- Thêm `suppressHydrationWarning` vào `<html>`
- Import và áp dụng font (Inter từ next/font/google)

---

### BƯỚC 9 — Trang Dashboard Tổng Quan `/dashboard`

Tạo `src/app/(dashboard)/dashboard/page.tsx` là **Server Component**:

Fetch dữ liệu song song bằng `Promise.all`:

1. Tổng số deck của user
2. Tổng số flashcard của user (join qua decks)
3. Số card cần ôn hôm nay (`next_review_at <= NOW()`)
4. Số ngày streak học liên tiếp (query `card_progress` theo `last_reviewed_at`)
5. 4 deck gần nhất (có flashcard_count và due_count)

Render các components:

**`src/components/dashboard/stats-cards.tsx`** — Server Component:

- 4 card KPI dạng grid 2×2 (mobile) / 4×1 (desktop):
  - 📚 **Tổng Deck** — số deck + icon
  - 🃏 **Tổng Flashcard** — tổng số card
  - 🔔 **Cần Ôn Hôm Nay** — badge đỏ nếu > 0
  - 🔥 **Streak** — số ngày + text "ngày liên tiếp"
- Mỗi card có hover effect nhẹ, shadow, border

**`src/components/dashboard/recent-decks.tsx`** — Server Component:

- Title "Bộ thẻ gần đây"
- Grid 2 cột (mobile: 1 cột) hiển thị tối đa 4 deck cards
- Mỗi deck card: tên, mô tả (truncate 2 dòng), số flashcard, badge "X cần ôn" (màu cam nếu >0)
- Link đến `/dashboard/decks/[id]`
- Nếu chưa có deck: **Empty State** — illustration đơn giản + text "Bạn chưa có bộ thẻ nào" + nút "Tạo bộ thẻ đầu tiên" link đến `/dashboard/decks`

---

### BƯỚC 10 — Trang Danh Sách Deck (placeholder)

Tạo `src/app/(dashboard)/dashboard/decks/page.tsx` là **Server Component** placeholder:

- Fetch tất cả decks của user (sẽ implement đầy đủ ở Giai đoạn 3)
- Hiển thị heading "Bộ thẻ của tôi" + nút "Tạo mới" (disabled placeholder)
- Render danh sách deck đơn giản hoặc empty state
- **Mục đích:** Đảm bảo route tồn tại, không bị 404 khi navigate

Tạo tương tự các route placeholder (chỉ cần `page.tsx` với heading):

- `src/app/(dashboard)/dashboard/decks/[id]/page.tsx`
- `src/app/(dashboard)/settings/page.tsx`

---

### BƯỚC 11 — Loading và Error States

Tạo các file loading/error cho App Router:

**Loading states** (`loading.tsx`) — dùng shadcn Skeleton:

- `src/app/(dashboard)/dashboard/loading.tsx` — skeleton cho KPI cards + recent decks
- `src/app/(dashboard)/dashboard/decks/loading.tsx` — skeleton cho deck grid

**Error boundary** (`error.tsx`) — phải là Client Component:

- `src/app/(dashboard)/error.tsx` — hiển thị message lỗi + nút "Thử lại" gọi `reset()`
- `src/app/(auth)/error.tsx` — redirect về `/login`

**Not Found** (`not-found.tsx`):

- `src/app/not-found.tsx` — trang 404 đơn giản với link về `/dashboard`

---

### BƯỚC 12 — Kiểm tra Toàn Giai Đoạn

Kiểm tra toàn bộ user flow:

1. Truy cập `http://localhost:3000` → redirect đến `/login` ✅
2. Đăng ký tài khoản mới với email hợp lệ → hiển thị màn hình success ✅
3. Đăng nhập với email/password đúng → redirect `/dashboard` ✅
4. Đăng nhập sai password → hiển thị error message ✅
5. Truy cập `/dashboard` khi đã đăng nhập → thấy KPI cards ✅
6. Truy cập `/dashboard` khi chưa đăng nhập (incognito) → redirect `/login` ✅
7. Sidebar navigation hoạt động, highlight đúng trang active ✅
8. Dark mode toggle hoạt động ✅
9. Responsive: sidebar collapse thành hamburger trên mobile ✅
10. Nút Đăng xuất → redirect `/login` ✅

Nếu bất kỳ bước nào fail, fix trước khi tiếp tục.

---

### BƯỚC 13 — Commit cuối Giai Đoạn 2

```
git add .
git commit -m "feat(dashboard): implement dashboard layout and overview page

- Add responsive sidebar with navigation and user info
- Add header with breadcrumb and dark/light mode toggle
- Add dashboard overview with KPI stats cards
- Add recent decks section with empty state
- Add next-themes for dark/light mode support
- Add loading skeletons for dashboard routes
- Add error boundaries and 404 page
- Add placeholder pages for decks and settings routes"
```

---

## KẾT QUẢ MONG ĐỢI KHI HOÀN THÀNH GIAI ĐOẠN 2

- ✅ Đăng ký / Đăng nhập / Đăng xuất hoạt động hoàn chỉnh
- ✅ Google OAuth redirect đúng về `/dashboard`
- ✅ Route `/dashboard/*` được bảo vệ, redirect về `/login` khi chưa auth
- ✅ Layout dashboard có sidebar responsive (desktop + mobile)
- ✅ Dark mode / Light mode toggle hoạt động
- ✅ Dashboard tổng quan hiển thị 4 KPI cards và recent decks
- ✅ Empty state khi chưa có deck
- ✅ Loading skeleton hiển thị khi đang fetch dữ liệu
- ✅ Toàn bộ 2 commits đã push lên GitHub

---

## LƯU Ý QUAN TRỌNG

- Với **Google OAuth**: Sinh viên cần vào Supabase Dashboard → Authentication → Providers → Google để bật provider và thêm Client ID/Secret từ Google Cloud Console. Agent hãy nhắc sinh viên bước này nếu chưa setup.
- **Session handling**: Dùng `supabase.auth.getUser()` (server-side) thay vì `getSession()` để đảm bảo bảo mật — `getSession()` chỉ đọc từ cookie, không verify với server.
- **Sidebar mobile**: Dùng `Sheet` component từ shadcn/ui cho mobile drawer, không tự build từ đầu.
- **Streak tính toán**: Nếu query streak phức tạp, có thể trả về 0 làm placeholder — implement đầy đủ ở Giai đoạn 4.
- Tất cả text trong UI dùng **tiếng Việt** (label, placeholder, error message, empty state).
