"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <div>
        <h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {error.message || "Có lỗi xảy ra. Vui lòng thử lại."}
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={reset} variant="outline">
          Thử lại
        </Button>
        <Link
          href="/login"
          className="inline-flex items-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Quay về đăng nhập
        </Link>
      </div>
    </div>
  );
}
