import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types'

// Dùng createServerClient (không phải createClient từ @supabase/supabase-js)
// vì Server Components không có browser context — cookies phải được truyền
// qua Next.js cookies() API để Supabase đọc/ghi session đúng cách.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll được gọi từ Server Component — có thể bỏ qua nếu
            // session đã được refresh bởi middleware
          }
        },
      },
    }
  )
}
