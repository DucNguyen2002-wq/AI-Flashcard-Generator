# Hướng Dẫn Deploy VPS

## Thông tin VPS

- **IP**: `178.128.50.79`
- **OS yêu cầu**: Ubuntu 22.04 LTS
- **RAM tối thiểu**: 1 GB (khuyến nghị 2 GB)
- **SSD tối thiểu**: 20 GB

---

## Phần 1 — Chuẩn Bị VPS

### 1.1 Cài Docker

```bash
# Cài Docker tự động
curl -fsSL https://get.docker.com | bash

# Thêm user vào group docker (để không cần sudo)
usermod -aG docker $USER

# Kiểm tra
docker --version
docker compose version
```

### 1.2 Cài Nginx

```bash
apt update
apt install -y nginx certbot python3-certbot-nginx

# Khởi động nginx
systemctl enable nginx
systemctl start nginx
```

---

## Phần 2 — Deploy Ứng Dụng

### 2.1 Clone Repository

```bash
# SSH vào VPS
ssh root@178.128.50.79

# Clone repo
git clone https://github.com/DucNguyen2002-wq/AI-Flashcard-Generator.git
cd AI-Flashcard-Generator
```

### 2.2 Tạo File .env.production

```bash
cp .env.example .env.production
nano .env.production
```

Điền đầy đủ:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_APP_URL=http://178.128.50.79
```

> ⚠️ **Không commit file `.env.production` vào Git!** Đã có trong `.gitignore`.

### 2.3 Build và Chạy

```bash
docker compose up -d --build

# Kiểm tra
docker compose ps
docker compose logs app --tail=50
```

### 2.4 Kiểm Tra Health

```bash
curl http://localhost:3000/api/health
# Kết quả mong đợi: {"status":"ok"}
```

---

## Phần 3 — Cấu Hình Nginx

### 3.1 Copy Config

```bash
cp nginx/nginx.conf /etc/nginx/sites-available/ai-flashcard

# Enable site
ln -s /etc/nginx/sites-available/ai-flashcard /etc/nginx/sites-enabled/

# Xóa default site (tùy chọn)
rm -f /etc/nginx/sites-enabled/default

# Kiểm tra và reload
nginx -t && systemctl reload nginx
```

### 3.2 Truy Cập Ứng Dụng

Mở trình duyệt: `http://178.128.50.79`

---

## Phần 4 — Cấu Hình SSL (khi có domain)

Nếu bạn có domain (vd: `flashcard.example.com`):

```bash
# Thay IP bằng domain trong nginx config
sed -i 's/178.128.50.79/flashcard.example.com/g' /etc/nginx/sites-available/ai-flashcard

# Cấp SSL với Certbot
certbot --nginx -d flashcard.example.com

# Uncomment SSL block trong nginx/nginx.conf
# Verify HTTPS
curl -I https://flashcard.example.com
```

Cập nhật `.env.production`:
```env
NEXT_PUBLIC_APP_URL=https://flashcard.example.com
```

---

## Phần 5 — Cập Nhật Supabase cho Production

Vào **Supabase Dashboard → Authentication → URL Configuration**:

1. **Site URL**: `http://178.128.50.79` (hoặc domain nếu có)
2. **Redirect URLs**: thêm `http://178.128.50.79/auth/callback`

---

## Phần 6 — Bật Supabase Realtime

Chạy trong **Supabase SQL Editor**:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE card_progress;
```

---

## Phần 7 — Cập Nhật Ứng Dụng

```bash
# SSH vào VPS
ssh root@178.128.50.79
cd AI-Flashcard-Generator

# Chạy deploy script
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

## Troubleshooting

### App không khởi động

```bash
docker compose logs app
```

### Port 3000 bị chiếm

```bash
lsof -i :3000
kill -9 <PID>
```

### Nginx lỗi 502

```bash
# Kiểm tra app đang chạy
docker compose ps

# Restart app
docker compose restart app
```

### Xem logs realtime

```bash
docker compose logs -f app
```
