import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Tạo tài khoản mới</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bắt đầu hành trình học với thẻ ghi nhớ AI
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <RegisterForm />
      </div>
    </div>
  )
}
