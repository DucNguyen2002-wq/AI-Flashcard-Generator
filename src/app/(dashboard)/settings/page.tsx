import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Cài đặt</h2>
        <p className="text-muted-foreground">
          Quản lý tài khoản và tùy chọn của bạn
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
          <CardDescription>Chi tiết tài khoản đăng ký của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Tham gia từ</p>
            <p className="text-sm text-muted-foreground">
              {new Date(user.created_at).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tùy chỉnh</CardTitle>
          <CardDescription>Các tính năng cài đặt nâng cao sẽ sớm ra mắt</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Bao gồm: thay đổi mật khẩu, quản lý phiên đăng nhập, tùy chọn thông báo...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
