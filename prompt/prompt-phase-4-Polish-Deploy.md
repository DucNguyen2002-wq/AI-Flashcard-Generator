<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Prompt Giai Đoạn 4 — Polish, Dashboard Charts, Realtime \& Deploy

> **Dành cho:** Claude Sonnet 4.6 (AI Agent)
> **Tiền đề:** Giai đoạn 1, 2, 3 đã hoàn thành — toàn bộ tính năng chính hoạt động end-to-end
> **Mục tiêu:** Hoàn thiện UI, tích hợp Supabase Realtime, đóng gói Docker, deploy VPS production
> **Thời gian ước tính:** 2 ngày (27/05 – 28/05)

***

## SYSTEM CONTEXT

Dự án **AI Flashcard Generator** đã có đầy đủ tính năng chính. Giai đoạn này tập trung vào:

- Hoàn thiện UI/UX (loading states, empty states, toast, responsive)
- Biểu đồ tiến độ học tập (Recharts)
- Supabase Realtime đồng bộ tiến độ
- Đóng gói Docker và deploy lên VPS production với domain + SSL

**Quy tắc bắt buộc (giữ nguyên từ các phase trước):**

- Tất cả file `.ts` / `.tsx`
- Server Components mặc định, `"use client"` chỉ khi cần
- UI text dùng tiếng Việt
- Commit sau mỗi nhóm tính năng theo Conventional Commits

***

## NGÀY 1 (27/05) — DASHBOARD CHARTS + REALTIME + UI POLISH

### BƯỚC 1 — Query Dữ Liệu Biểu Đồ

Tạo `src/actions/stats.actions.ts` với `"use server"`:

**`getDailyStudyStats(userId: string, days: number = 7)`**

- Query `card_progress` GROUP BY DATE(`last_reviewed_at`) trong `days` ngày gần nhất
- Trả về array `{ date: string, count: number }[]` đủ 7 ngày (ngày không có data = 0)
- Dùng `date-fns` để fill các ngày còn thiếu

**`getCardStatusStats(userId: string)`**

- Query phân loại card theo trạng thái dựa trên `interval_days`:
    - `New`: chưa có record trong `card_progress`
    - `Learning`: `interval_days < 7`
    - `Mastered`: `interval_days >= 21`
    - `Review`: còn lại
- Trả về `{ new: number, learning: number, review: number, mastered: number }`

**`getStudyStreak(userId: string)`**

- Query các ngày học liên tiếp tính từ hôm nay về trước trong `card_progress.last_reviewed_at`
- Trả về số ngày streak (số nguyên)

***

### BƯỚC 2 — Biểu Đồ Tiến Độ (Recharts)

Tạo `src/components/dashboard/study-chart.tsx` — **Client Component**:

**Line Chart — "Số thẻ đã học 7 ngày qua":**

- Dùng `LineChart` từ `recharts`
- X-axis: ngày format `dd/MM`
- Y-axis: số thẻ (integer)
- Line màu primary với dot hiển thị tại mỗi điểm
- Fill nhạt dưới đường (Area effect dùng `linearGradient`)
- Tooltip hiển thị: `Ngày: dd/MM/yyyy — X thẻ đã học`
- Responsive: dùng `ResponsiveContainer` width="100%" height={250}
- Empty state khi tất cả data = 0: `Chưa có dữ liệu học tập`

Tạo `src/components/dashboard/card-status-chart.tsx` — **Client Component**:

**Donut Chart — "Phân loại thẻ":**

- Dùng `PieChart` + `Pie` với `innerRadius` tạo donut
- 4 phần: New (xám), Learning (cam), Review (xanh dương), Mastered (xanh lá)
- Legend bên dưới với màu tương ứng
- Center label hiển thị tổng số thẻ
- Tooltip hiển thị: `Loại: X thẻ (Y%)`
- Nếu không có flashcard nào: hiển thị donut rỗng + text `Thêm flashcard để xem thống kê`

Cập nhật `src/app/(dashboard)/dashboard/page.tsx`:

- Fetch dữ liệu biểu đồ song song với các stats hiện có
- Thêm section `Thống kê học tập` với 2 charts bên dưới KPI cards
- Layout: line chart chiếm 2/3 chiều rộng, donut chart chiếm 1/3

***

### BƯỚC 3 — Supabase Realtime Sync

Tạo `src/components/dashboard/realtime-stats.tsx` — **Client Component**:

- Subscribe Supabase Realtime channel `card_progress_changes` cho `card_progress` table
- Event filter: `INSERT` và `UPDATE` với filter `user_id=eq.{userId}`
- Khi nhận event → trigger callback để re-fetch KPI stats và cập nhật state
- Dùng `useEffect` để setup subscription khi mount, cleanup khi unmount

```typescript
const channel = supabase
  .channel('card_progress_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'card_progress',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    onProgressUpdate(payload)
  })
  .subscribe()
```

- Wrap các KPI stats và chart data bằng state, update state khi nhận Realtime event
- Hiển thị toast nhỏ `✓ Đã đồng bộ` khi nhận được update

**Lưu ý:** Cần enable Realtime cho bảng `card_progress` trong Supabase Dashboard (Table Editor → card_progress → Enable Realtime) hoặc qua SQL:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE card_progress;
```

Ghi chú này vào README.

***

### BƯỚC 4 — Toast Notification System

Đảm bảo hệ thống toast hoạt động nhất quán toàn app:

Cập nhật `src/app/layout.tsx`: thêm `<Toaster />` từ shadcn/ui vào root layout.

Kiểm tra tất cả các action hiện có đã có toast phản hồi:

- ✅ Tạo deck → toast `Đã tạo bộ thẻ thành công`
- ✅ Xoá deck → toast `Đã xoá bộ thẻ`
- ✅ Lưu flashcard AI → toast `Đã lưu X thẻ vào bộ thẻ`
- ✅ Upload file lỗi (>5MB) → toast error đỏ
- ✅ Gemini API lỗi → toast error với message cụ thể
- ✅ Realtime sync → toast nhỏ xanh lá

***

### BƯỚC 5 — UI Polish \& Responsive

Kiểm tra và fix tất cả các vấn đề UI còn lại:

**Loading states** — đảm bảo mọi trang có skeleton:

- `/dashboard/decks`: skeleton grid 6 card
- `/dashboard/decks/[id]`: skeleton header + skeleton table rows
- `/dashboard/decks/[id]/study`: skeleton card lớn

**Empty states** — đảm bảo mọi trường hợp rỗng có UI:

- Không có deck: illustration + `Tạo bộ thẻ đầu tiên`
- Deck không có flashcard: `Thêm thẻ thủ công hoặc sinh bằng AI`
- Không có card cần ôn: hiển thị ngày tiếp theo

**Responsive** — kiểm tra trên 3 breakpoint:

- Mobile (375px): sidebar ẩn, layout 1 cột, buttons full-width
- Tablet (768px): layout 2 cột cho deck grid
- Desktop (1280px): sidebar hiện, layout 3 cột cho deck grid

**Accessibility cơ bản:**

- Tất cả button có `aria-label` khi không có text (icon-only buttons)
- Form fields có `htmlFor` và `id` khớp nhau
- Focus ring hiển thị khi dùng keyboard

***

### BƯỚC 6 — Settings Page

Hoàn thiện `src/app/(dashboard)/settings/page.tsx`:

**Section "Thông tin tài khoản":**

- Hiển thị email (read-only)
- Avatar với initials từ email

**Section "Đổi mật khẩu":**

- Form: mật khẩu hiện tại, mật khẩu mới, xác nhận mật khẩu mới
- Gọi `supabase.auth.updateUser({ password })` từ Server Action
- Toast success / error

**Section "Xoá tài khoản" (Danger Zone):**

- Nút đỏ `Xoá tài khoản`
- AlertDialog xác nhận: `Hành động này không thể hoàn tác. Tất cả dữ liệu sẽ bị xoá vĩnh viễn.`
- Yêu cầu nhập email để xác nhận
- Gọi Supabase Admin API để xoá user (dùng service role key)

***

**Commit sau Bước 6:**

```bash
git add .
git commit -m "feat(dashboard): add charts, realtime sync, and UI polish

- Add daily study stats and card status queries
- Add line chart for 7-day study activity
- Add donut chart for card status distribution
- Add Supabase Realtime sync for card progress updates
- Add consistent toast notifications across all actions
- Fix loading skeletons and empty states for all pages
- Add responsive layout fixes for mobile/tablet
- Complete settings page with password change and account deletion"
```


***

## NGÀY 2 (28/05) — DOCKER + VPS DEPLOY

### BƯỚC 7 — Kiểm Tra và Hoàn Thiện Dockerfile

Kiểm tra lại `Dockerfile` đã tạo ở Giai đoạn 1, đảm bảo:

- 3 stages: `deps` → `builder` → `runner`
- Stage `builder`: có `COPY .env.production .env.production` KHÔNG — biến môi trường phải được inject qua `env_file` trong Docker Compose, không bake vào image
- Stage `runner`: user `nextjs` non-root
- `NEXT_TELEMETRY_DISABLED=1` ở cả builder và runner
- `next.config.ts` có `output: 'standalone'` — nếu chưa có, thêm vào

Kiểm tra `.dockerignore` đã có:

```dockerignore
node_modules
.next
.git
.env.local
.env*.local
*.md
coverage
.nyc_output
supabase/.temp
```

Test local:

```bash
docker build -t ai-flashcard .
docker run -p 3000:3000 --env-file .env.local ai-flashcard
```

Truy cập `http://localhost:3000` phải hoạt động bình thường. Nếu lỗi, fix trước khi tiếp tục.

***

### BƯỚC 8 — Hoàn Thiện Docker Compose

Kiểm tra lại `docker-compose.yml`, đảm bảo:

```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Tạo thêm `docker-compose.override.yml` cho development (mount source code):

```yaml
services:
  app:
    build:
      target: deps
    command: npm run dev
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    env_file:
      - .env.local
```


***

### BƯỚC 9 — Tạo Script Deploy

Tạo file `scripts/deploy.sh`:

```bash
#!/bin/bash
# Script deploy lên VPS
# Usage: ./scripts/deploy.sh

set -e

echo "🚀 Bắt đầu deploy AI Flashcard Generator..."

# Pull code mới nhất
git pull origin main

# Build lại Docker image
docker compose build --no-cache

# Restart service
docker compose down
docker compose up -d

# Kiểm tra health
echo "⏳ Chờ app khởi động..."
sleep 10
curl -f http://localhost:3000/api/health && echo "✅ Deploy thành công!" || echo "❌ Deploy thất bại"

# Xoá image cũ
docker image prune -f
```

Chmod +x `scripts/deploy.sh`.

***

### BƯỚC 10 — Tạo File Cấu Hình Nginx

Tạo `nginx/nginx.conf`:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name YOUR_DOMAIN;

    ssl_certificate /etc/letsencrypt/live/YOUR_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/YOUR_DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    # Static files cache
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```


***

### BƯỚC 11 — Cập Nhật README

Cập nhật `README.md` với đầy đủ thông tin:

```markdown
# AI Flashcard Generator

Ứng dụng web tạo flashcard tự động bằng AI, hỗ trợ học theo Spaced Repetition.

## Tech Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth + PostgreSQL + Storage + Realtime)
- Google Gemini 2.0 Flash
- Docker + Docker Compose

## Yêu cầu
- Node.js 20+
- Docker & Docker Compose
- Tài khoản Supabase
- Gemini API Key

## Cài đặt Local

```bash
git clone <repo-url>
cd ai-flashcard
npm install
cp .env.example .env.local
# Điền các biến môi trường vào .env.local
npm run dev
```


## Chạy bằng Docker

```bash
cp .env.example .env.local
# Điền các biến môi trường
docker compose up --build
```


## Setup Supabase

1. Tạo project tại https://supabase.com
2. Chạy migration trong Supabase SQL Editor:
    - `supabase/migrations/001_initial_schema.sql`
    - `supabase/migrations/002_storage_bucket.sql`
3. Bật Realtime cho bảng `card_progress`:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE card_progress;
```

4. Bật Google OAuth: Authentication → Providers → Google

## Biến Môi Trường

| Tên | Mô tả |
| :-- | :-- |
| NEXT_PUBLIC_SUPABASE_URL | URL Supabase project |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Anon key |
| SUPABASE_SERVICE_ROLE_KEY | Service role key (server only) |
| GEMINI_API_KEY | Google Gemini API key |
| NEXT_PUBLIC_APP_URL | URL production |

```

***

### BƯỚC 12 — Hướng Dẫn Deploy VPS (Tạo tài liệu)

Tạo file `docs/deployment.md` với hướng dẫn chi tiết từng bước:

**Phần 1 — Chuẩn bị VPS:**
- Yêu cầu: Ubuntu 22.04, tối thiểu 1GB RAM, 20GB SSD
- Cài Docker: script tự động từ get.docker.com
- Cài Nginx và Certbot

**Phần 2 — Cấu hình DNS:**
- Tạo A Record trỏ về IP VPS
- Chờ propagation (5–30 phút)

**Phần 3 — Deploy app:**
```bash
# SSH vào VPS
ssh root@YOUR_VPS_IP

# Clone repo
git clone https://github.com/YOUR_USERNAME/ai-flashcard.git
cd ai-flashcard

# Tạo file .env.production
nano .env.production
# Điền đầy đủ các biến môi trường với giá trị production
# NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN

# Build và chạy
docker compose up -d --build

# Kiểm tra
docker compose ps
docker compose logs app
```

**Phần 4 — Cấu hình Nginx + SSL:**

```bash
# Copy nginx config
cp nginx/nginx.conf /etc/nginx/sites-available/ai-flashcard
# Thay YOUR_DOMAIN bằng domain thật
sed -i 's/YOUR_DOMAIN/yourdomain.com/g' /etc/nginx/sites-available/ai-flashcard

# Enable site
ln -s /etc/nginx/sites-available/ai-flashcard /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Cấp SSL với Certbot
certbot --nginx -d yourdomain.com

# Verify HTTPS
curl -I https://yourdomain.com
```

**Phần 5 — Cập nhật Supabase cho production:**

- Vào Supabase Dashboard → Authentication → URL Configuration
- Thêm `https://YOUR_DOMAIN` vào Site URL
- Thêm `https://YOUR_DOMAIN/auth/callback` vào Redirect URLs

***

### BƯỚC 13 — Commit và Push

```bash
git add .
git commit -m "chore(docker): finalize Docker setup and add deployment config

- Verify and fix Dockerfile multi-stage build
- Add docker-compose.override.yml for development
- Add deploy.sh script for VPS deployment
- Add nginx.conf with SSL and security headers
- Add comprehensive README with setup instructions
- Add docs/deployment.md with step-by-step VPS guide"
```


***

### BƯỚC 14 — Kiểm Tra Production Build Cuối Cùng

Trước khi kết thúc Giai đoạn 4, thực hiện kiểm tra toàn diện:

**Build check:**

```bash
npm run build
# Phải thành công không có lỗi TypeScript
# Kiểm tra output: không có warnings nghiêm trọng
```

**Docker check:**

```bash
docker compose build
docker compose up -d
# Truy cập http://localhost:3000
# Test đăng nhập, tạo deck, sinh AI, học flashcard
docker compose down
```

**Danh sách kiểm tra cuối:**

- [ ] `npm run build` thành công không lỗi TypeScript
- [ ] `docker compose up` chạy được tại localhost:3000
- [ ] `GET /api/health` trả về `{ status: "ok" }`
- [ ] Toàn bộ tính năng core hoạt động sau khi build production
- [ ] Không có `console.error` hay warning nghiêm trọng trong browser DevTools
- [ ] Tất cả route được bảo vệ đúng (test incognito)
- [ ] Dark mode hoạt động
- [ ] Charts hiển thị đúng
- [ ] Realtime sync hoạt động (mở 2 tab, học ở tab 1, xem dashboard cập nhật ở tab 2)
- [ ] File upload PDF hoạt động
- [ ] AI generate trả về kết quả trong < 15 giây

***

### BƯỚC 15 — Commit Tổng Kết Giai Đoạn 4

```bash
git add .
git commit -m "chore(release): prepare for production deployment

- Final build verification passed
- All core features tested end-to-end
- Docker build and run verified
- Ready for VPS deployment"
```


***

## KẾT QUẢ MONG ĐỢI KHI HOÀN THÀNH GIAI ĐOẠN 4

- ✅ Line chart hiển thị số thẻ học 7 ngày gần nhất
- ✅ Donut chart phân loại New / Learning / Review / Mastered
- ✅ Supabase Realtime cập nhật dashboard khi học xong
- ✅ Toast notification nhất quán trên toàn app
- ✅ Tất cả loading/empty state đã hoàn thiện
- ✅ Responsive hoạt động đúng trên mobile/tablet/desktop
- ✅ Settings page hoàn chỉnh (đổi mật khẩu, xoá tài khoản)
- ✅ `docker compose up --build` chạy được không lỗi
- ✅ `npm run build` thành công không có lỗi TypeScript
- ✅ README và docs/deployment.md đầy đủ
- ✅ Tổng cộng 2 commits đã push lên GitHub

***

## LƯU Ý QUAN TRỌNG

- **Không bake secrets vào Docker image**: biến môi trường phải được inject qua `--env-file` hoặc `environment` trong compose, KHÔNG `COPY .env` vào image.
- **Supabase Realtime phải được enable**: cần chạy `ALTER PUBLICATION supabase_realtime ADD TABLE card_progress;` trong SQL Editor, không tự động được khi tạo bảng. Ghi chú rõ trong README.
- **NEXT_PUBLIC_APP_URL trong production**: phải cập nhật thành `https://YOUR_DOMAIN` trong `.env.production` và trong Supabase Dashboard (Authentication → URL Configuration) để OAuth redirect hoạt động.
- **Recharts với Next.js**: import dynamic nếu có lỗi SSR: `const LineChartComponent = dynamic(() => import("recharts").then(m => m.LineChart), { ssr: false })` — hoặc đảm bảo component có `"use client"`.
- **PDF-parse memory**: với file PDF lớn, có thể cần tăng timeout của Route Handler lên 60s: `export const maxDuration = 60` ở đầu file route.
- Deploy VPS là **khuyến nghị** theo đề cương, không phải bắt buộc — nhưng demo production URL sẽ được điểm cao hơn video demo đáng kể.

