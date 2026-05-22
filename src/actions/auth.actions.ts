"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

// ─── Zod Schemas ─────────────────────────────────────────────
const signUpSchema = z
  .object({
    email: z.string().email("Email không hợp lệ"),
    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(/\d/, "Mật khẩu phải chứa ít nhất 1 chữ số"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })

const signInSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
})

// ─── signUp ──────────────────────────────────────────────────
export async function signUp(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  }

  const result = signUpSchema.safeParse(raw)
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? "Dữ liệu không hợp lệ"
    return { success: false, error: firstError }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
  })

  if (error) {
    if (error.message.includes("already registered")) {
      return { success: false, error: "Email này đã được đăng ký" }
    }
    return { success: false, error: "Đăng ký thất bại. Vui lòng thử lại" }
  }

  return { success: true, message: "Kiểm tra email để xác nhận tài khoản" }
}

// ─── signIn ──────────────────────────────────────────────────
export async function signIn(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const result = signInSchema.safeParse(raw)
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? "Dữ liệu không hợp lệ"
    return { success: false, error: firstError }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  })

  if (error) {
    return { success: false, error: "Email hoặc mật khẩu không đúng" }
  }

  revalidatePath("/")
  redirect("/dashboard")
}

// ─── signOut ─────────────────────────────────────────────────
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/")
  redirect("/login")
}
