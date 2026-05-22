import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <div>
        <h1 className="text-8xl font-bold text-muted-foreground">404</h1>
        <h2 className="mt-4 text-2xl font-semibold">Không tìm thấy trang</h2>
        <p className="mt-2 text-muted-foreground">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="inline-flex items-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        Về trang chủ
      </Link>
    </div>
  )
}
