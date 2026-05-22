"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signUp } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

function getPasswordStrength(password: string): {
  label: string;
  color: string;
  width: string;
} {
  if (password.length === 0) return { label: "", color: "", width: "0%" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Yếu", color: "bg-red-500", width: "33%" };
  if (score <= 3)
    return { label: "Trung bình", color: "bg-yellow-500", width: "66%" };
  return { label: "Mạnh", color: "bg-green-500", width: "100%" };
}

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const strength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await signUp(formData);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error ?? "Đăng ký thất bại");
      }
    });
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <h2 className="text-xl font-semibold">Đăng ký thành công!</h2>
        <p className="text-sm text-muted-foreground">
          Chúng tôi đã gửi email xác nhận đến địa chỉ của bạn.
          <br />
          Kiểm tra hộp thư (cả Spam) để xác nhận tài khoản.
        </p>
        <Link
          href="/login"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Quay về trang đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="ban@email.com"
            autoComplete="email"
            required
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Tối thiểu 8 ký tự, có chữ số"
            autoComplete="new-password"
            required
            disabled={isPending}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password.length > 0 && (
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Độ mạnh:{" "}
                <span
                  className={
                    strength.label === "Mạnh"
                      ? "text-green-600"
                      : strength.label === "Trung bình"
                        ? "text-yellow-600"
                        : "text-red-600"
                  }
                >
                  {strength.label}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
            required
            disabled={isPending}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang đăng ký...
            </>
          ) : (
            "Tạo tài khoản"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
