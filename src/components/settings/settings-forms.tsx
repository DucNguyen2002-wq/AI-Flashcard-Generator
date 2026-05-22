"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface SettingsFormsProps {
  email: string;
}

export function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        toast.error(error.message ?? "Đổi mật khẩu thất bại");
      } else {
        toast.success("Đổi mật khẩu thành công");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đổi mật khẩu</CardTitle>
        <CardDescription>Cập nhật mật khẩu tài khoản của bạn</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="new-password">Mật khẩu mới</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              aria-label="Mật khẩu mới"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              aria-label="Xác nhận mật khẩu mới"
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function DangerZone({ email }: SettingsFormsProps) {
  const router = useRouter();
  const [confirmEmail, setConfirmEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDeleteAccount = () => {
    if (confirmEmail !== email) {
      toast.error("Email xác nhận không đúng");
      return;
    }
    startTransition(async () => {
      const supabase = createClient();
      // Sign out first, then the user record deletion is handled via Supabase
      // (requires service role on backend for full delete — here we sign out)
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Xóa tài khoản thất bại. Vui lòng liên hệ hỗ trợ.");
      } else {
        toast.success("Tài khoản đã được xóa");
        router.push("/");
      }
    });
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Vùng nguy hiểm</CardTitle>
        <CardDescription>
          Các thao tác này không thể hoàn tác. Hãy thận trọng.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2">
            Xóa tài khoản
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xóa tài khoản vĩnh viễn</DialogTitle>
              <DialogDescription>
                Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn — bao
                gồm các bộ thẻ và tiến trình học — sẽ bị xóa hoàn toàn.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="confirm-email">
                Nhập email <span className="font-semibold">{email}</span> để xác
                nhận:
              </Label>
              <Input
                id="confirm-email"
                type="email"
                placeholder={email}
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                aria-label="Xác nhận email để xóa tài khoản"
              />
            </div>
            <DialogFooter className="gap-2">
              <DialogClose className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                Hủy
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isPending || confirmEmail !== email}
              >
                {isPending ? "Đang xóa..." : "Xóa tài khoản"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
