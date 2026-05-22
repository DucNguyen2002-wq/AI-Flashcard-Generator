import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PasswordChangeForm, DangerZone } from "@/components/settings/settings-forms";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const initials = (user.email ?? "U")
    .split("@")[0]
    ?.slice(0, 2)
    .toUpperCase() ?? "U";

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
        <CardContent className="flex items-center gap-4">
          <Avatar size="lg" className="size-14">
            <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="font-medium">{user.email}</p>
            <p className="text-sm text-muted-foreground">
              Tham gia từ {new Date(user.created_at).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </CardContent>
      </Card>

      <PasswordChangeForm />

      <DangerZone email={user.email ?? ""} />
    </div>
  );
}
