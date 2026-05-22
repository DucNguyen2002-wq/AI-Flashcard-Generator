# AI Flashcard Generator

Ứng dụng web tạo flashcard tự động bằng AI, hỗ trợ học theo Spaced Repetition (SM-2).

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS v4** + shadcn/ui
- **Supabase** (Auth + PostgreSQL + Storage + Realtime)
- **Google Gemini 2.0 Flash** — sinh flashcard tự động từ văn bản/PDF
- **Recharts** — biểu đồ thống kê học tập
- **Docker** + Docker Compose — đóng gói và triển khai

## Tính năng

- ✅ Đăng ký / đăng nhập (email + Google OAuth)
- ✅ Tạo và quản lý bộ thẻ (deck)
- ✅ Sinh flashcard tự động bằng AI từ văn bản hoặc file PDF
- ✅ Học flashcard theo thuật toán Spaced Repetition SM-2
- ✅ Dashboard thống kê: KPI, biểu đồ hoạt động 7 ngày, phân loại thẻ
- ✅ Đồng bộ Realtime qua Supabase
- ✅ Dark mode
- ✅ Cài đặt tài khoản: đổi mật khẩu, xóa tài khoản

## Yêu cầu

- Node.js 20+
- Docker & Docker Compose (cho production)
- Tài khoản [Supabase](https://supabase.com)
- [Gemini API Key](https://aistudio.google.com)

## Cài đặt Local

```bash
git clone https://github.com/DucNguyen2002-wq/AI-Flashcard-Generator.git
cd AI-Flashcard-Generator
npm install
cp .env.example .env.local
# Điền các biến môi trường vào .env.local
npm run dev
```

Truy cập [http://localhost:3000](http://localhost:3000).

## Chạy bằng Docker

```bash
cp .env.example .env.production
# Điền đầy đủ các biến môi trường vào .env.production
docker compose up --build
```

## Setup Supabase

1. Tạo project tại [https://supabase.com](https://supabase.com)
2. Chạy migration trong Supabase SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_storage_bucket.sql`
3. Bật Realtime cho bảng `card_progress`:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE card_progress;
```

4. Bật Google OAuth: **Authentication → Providers → Google**

## Biến Môi Trường

| Tên | Mô tả |
|:----|:------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `NEXT_PUBLIC_APP_URL` | URL production (vd: `http://178.128.50.79`) |

## Chạy Tests

```bash
npm run test          # chạy một lần
npm run test:watch    # chế độ watch
```

## Deploy lên VPS

Xem hướng dẫn chi tiết trong [docs/deployment.md](docs/deployment.md).

**Tóm tắt nhanh:**

```bash
# SSH vào VPS
ssh root@178.128.50.79

# Clone và cấu hình
git clone https://github.com/DucNguyen2002-wq/AI-Flashcard-Generator.git
cd AI-Flashcard-Generator
cp .env.example .env.production
nano .env.production  # điền giá trị production

# Deploy
docker compose up -d --build
```

