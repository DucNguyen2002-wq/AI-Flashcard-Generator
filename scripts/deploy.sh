#!/bin/bash
# Script deploy lên VPS
# Usage: ./scripts/deploy.sh

set -e

echo "🚀 Bắt đầu deploy AI Flashcard Generator..."

# Pull code mới nhất
git pull origin main

# Build lại Docker image
docker compose build

# Restart service
docker compose down
docker compose up -d

# Kiểm tra health
echo "⏳ Chờ app khởi động..."
sleep 10
curl -f http://localhost:3000/api/health && echo "✅ Deploy thành công!" || echo "❌ Deploy thất bại"

# Xoá image cũ
docker image prune -f
