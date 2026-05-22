import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Chào mừng trở lại</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Đăng nhập để tiếp tục học với AI Flashcard
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <LoginForm />
      </div>
    </div>
  )
}
