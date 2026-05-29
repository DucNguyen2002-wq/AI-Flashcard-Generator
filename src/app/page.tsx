import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  Upload,
  BarChart3,
  Brain,
  ArrowRight,
  CheckCircle,
  Zap,
  GraduationCap,
  Target,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Sparkles,
    title: "AI tạo flashcard tự động",
    description:
      "Chỉ cần nhập nội dung hoặc upload tài liệu, AI Gemini 2.0 sẽ tạo bộ flashcard chất lượng cao trong vài giây.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: FileText,
    title: "Hỗ trợ PDF & TXT",
    description:
      "Tải lên file PDF hoặc TXT tối đa 5MB, hệ thống tự trích xuất nội dung và sinh flashcard theo yêu cầu.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: Brain,
    title: "Thuật toán SM-2 thông minh",
    description:
      "Lên lịch ôn tập tối ưu dựa trên khoa học ghi nhớ, giúp bạn thuộc bài lâu hơn và tiết kiệm thời gian học.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: BarChart3,
    title: "Thống kê tiến độ chi tiết",
    description:
      "Biểu đồ học tập theo ngày, chuỗi ngày học liên tiếp, tỉ lệ thuộc bài – tất cả trong một dashboard.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
];

const steps = [
  {
    number: "01",
    icon: BookOpen,
    title: "Tạo bộ thẻ",
    description:
      "Tạo bộ thẻ mới với tên và mô tả. Phân loại theo môn học, chủ đề hoặc dự án của bạn.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Để AI tạo flashcard",
    description:
      "Dán văn bản hoặc tải file PDF/TXT, chọn số lượng thẻ và nhấn tạo. Chỉ mất vài giây!",
  },
  {
    number: "03",
    icon: Target,
    title: "Học và theo dõi tiến độ",
    description:
      "Ôn tập thẻ hàng ngày, đánh giá mức độ nhớ và xem thống kê tiến độ của bạn.",
  },
];

const highlights = [
  { value: "5x", label: "Nhanh hơn khi tạo thẻ" },
  { value: "SM-2", label: "Thuật toán ghi nhớ khoa học" },
  { value: "PDF & TXT", label: "Định dạng tài liệu hỗ trợ" },
  { value: "Gemini AI", label: "Công nghệ AI từ Google" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#080811]">
      {/* Top gradient stripe – inspired by Linear / Vercel */}
      <div className="fixed top-0 z-50 h-px w-full bg-linear-to-r from-transparent via-violet-500/60 to-transparent" />

      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 z-40 w-full border-b border-border/30 bg-[#fafafa]/80 backdrop-blur-xl dark:bg-[#080811]/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">FlashAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Đăng ký miễn phí</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pb-32">
        {/* Gradient blobs + dot grid – decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Dot grid pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--dot-grid) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Color blobs */}
          <div className="absolute -top-40 -right-32 h-150 w-150 rounded-full bg-violet-600/20 blur-[120px] dark:bg-violet-500/35" />
          <div className="absolute -bottom-40 -left-32 h-125 w-125 rounded-full bg-blue-600/15 blur-[100px] dark:bg-blue-500/28" />
          <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-500/8 blur-[80px] dark:bg-indigo-400/18" />
          {/* Bottom fade – blends hero into next section */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-b from-transparent to-[#fafafa] dark:to-[#080811]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left – copy & CTA */}
            <div className="space-y-8">
              <div className="space-y-5">
                <Badge
                  variant="secondary"
                  className="gap-1.5 border border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400"
                >
                  <Sparkles className="h-3 w-3" />
                  Powered by Gemini 2.0 Flash
                </Badge>

                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Tạo flashcard{" "}
                  <span className="bg-linear-to-r from-violet-500 via-fuchsia-500 to-blue-500 bg-clip-text text-transparent">
                    thông minh
                  </span>{" "}
                  với AI
                </h1>

                <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  Upload tài liệu PDF, TXT hoặc dán văn bản — AI tự động tạo
                  flashcard chất lượng cao. Học với thuật toán SM-2 để ghi nhớ
                  hiệu quả hơn.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link href="/register">
                  <Button size="lg" className="gap-2">
                    Bắt đầu miễn phí
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">
                    Đã có tài khoản
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {[
                  "Không cần thẻ tín dụng",
                  "Đăng ký trong 30 giây",
                  "Bắt đầu ngay lập tức",
                ].map((text) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – mock app UI
                [IMAGE NOTE] Thay thế khối này bằng <Image> screenshot thực tế
                của app sau khi có ảnh chụp màn hình (ví dụ: /public/app-screenshot.png).
                Kích thước lý tưởng: 1200×800px, định dạng WebP.
                Có thể dùng ảnh từ URL: https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800
                (ảnh người học bài) hoặc một mockup screenshot thực tế của app. */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-sm lg:max-w-full">
                {/* Main card mockup */}
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/10 dark:shadow-violet-950/40 dark:ring-1 dark:ring-white/6">
                  {/* Titlebar */}
                  <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-md bg-background/60 px-2.5 py-1 text-xs text-muted-foreground">
                      <Sparkles className="h-3 w-3 text-violet-500" />
                      flashai.app/study
                    </div>
                    <div className="w-16" />
                  </div>

                  {/* Flashcard area */}
                  <div className="p-6">
                    <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Lập trình Python cơ bản
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5">
                        3 / 10
                      </span>
                    </div>

                    <div className="rounded-xl border border-border bg-linear-to-br from-violet-500/5 via-background to-blue-500/5 p-6 text-center">
                      <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Câu hỏi
                      </div>
                      <p className="text-base font-semibold leading-relaxed">
                        List comprehension trong Python là gì và cú pháp như thế
                        nào?
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-violet-500">
                        <Zap className="h-3 w-3" />
                        Nhấn để xem đáp án
                      </div>
                    </div>

                    {/* Rating buttons */}
                    <div className="mt-4 grid grid-cols-4 gap-1.5">
                      {[
                        {
                          label: "Không nhớ",
                          cls: "text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900 dark:text-red-400",
                        },
                        {
                          label: "Khó",
                          cls: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-900 dark:text-orange-400",
                        },
                        {
                          label: "Tốt",
                          cls: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-400",
                        },
                        {
                          label: "Dễ",
                          cls: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-900 dark:text-emerald-400",
                        },
                      ].map((b) => (
                        <div
                          key={b.label}
                          className={`rounded-lg border px-2 py-1.5 text-center text-xs font-medium ${b.cls}`}
                        >
                          {b.label}
                        </div>
                      ))}
                    </div>

                    {/* Progress */}
                    <div className="mt-5">
                      <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                        <span>Tiến độ buổi học</span>
                        <span>30%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-1.5 w-[30%] rounded-full bg-linear-to-r from-violet-500 to-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating chip – streak */}
                <div className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2.5 shadow-xl">
                  <span className="text-xl">🔥</span>
                  <div>
                    <div className="text-xs font-bold">7 ngày</div>
                    <div className="text-xs text-muted-foreground">
                      học liên tiếp
                    </div>
                  </div>
                </div>

                {/* Floating chip – AI done */}
                <div className="absolute -top-4 -right-4 flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-3 py-2.5 shadow-xl dark:border-violet-800 dark:bg-violet-950">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  <div>
                    <div className="text-xs font-bold text-violet-700 dark:text-violet-300">
                      AI tạo xong!
                    </div>
                    <div className="text-xs text-violet-500">10 thẻ mới</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Highlights bar ─── */}
      <section className="border-y border-border/30 bg-white/60 dark:bg-white/3 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {highlights.map((h) => (
              <div key={h.label} className="text-center">
                <div className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {h.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {h.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <Badge variant="secondary" className="mb-4">
              Tính năng nổi bật
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Mọi thứ bạn cần để học hiệu quả
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
              Từ tạo flashcard đến ôn tập thông minh, FlashAI giúp việc học trở
              nên dễ dàng và thú vị hơn bao giờ hết.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className={`group rounded-2xl border ${f.border} bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}
                >
                  <div
                    className={`mb-4 inline-flex rounded-xl ${f.bg} p-3 transition-transform duration-200 group-hover:scale-110`}
                  >
                    <Icon className={`h-6 w-6 ${f.color}`} />
                  </div>
                  <h3 className="mb-2 font-semibold leading-snug">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="relative overflow-hidden bg-[#f3f3f8] py-20 dark:bg-[#0d0d1a] sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <Badge variant="secondary" className="mb-4">
              Cách hoạt động
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Chỉ 3 bước đơn giản
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Từ tài liệu thô đến bộ flashcard hoàn chỉnh chỉ trong vài phút.
            </p>
          </div>

          {/*
            [IMAGE NOTE] Có thể thêm ảnh minh họa dưới mỗi bước:
            Bước 1: screenshot form tạo deck  → /public/step-1-create-deck.png
            Bước 2: screenshot trang generate → /public/step-2-generate.png
            Bước 3: screenshot study session  → /public/step-3-study.png
            Hoặc dùng ảnh minh họa từ Unsplash (cần thêm hostname vào next.config.ts):
              Bước 1: https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400
              Bước 2: https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400
              Bước 3: https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400
          */}
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="relative rounded-2xl border border-border bg-card p-8 text-center"
                >
                  {/* Connector arrow (between cards) */}
                  {index < steps.length - 1 && (
                    <div className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 sm:block">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-sm">
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  )}

                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-violet-500/30 bg-violet-500/10">
                    <Icon className="h-7 w-7 text-violet-500" />
                  </div>
                  <div className="mb-2 text-xs font-bold uppercase tracking-widest text-violet-500">
                    Bước {step.number}
                  </div>
                  <h3 className="mb-3 text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        {/* Rich gradient overlay for CTA */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-br from-violet-600/8 via-transparent to-blue-600/8 dark:from-violet-800/30 dark:via-transparent dark:to-blue-800/25" />
          <div
            className="absolute inset-0 opacity-50 dark:opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--dot-grid) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          {/*
            [IMAGE NOTE] Vị trí lý tưởng để đặt illustration hoặc animated graphic.
            Ví dụ: ảnh người học với laptop từ Unsplash
            https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600
            (cần thêm images.unsplash.com vào next.config.ts remotePatterns)
          */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-500/30 bg-violet-500/10">
            <GraduationCap className="h-10 w-10 text-violet-500" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Sẵn sàng học thông minh hơn?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tham gia ngay và trải nghiệm cách AI thay đổi cách bạn học. Hoàn
            toàn miễn phí để bắt đầu.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2 px-8">
                Tạo tài khoản miễn phí
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8">
                Đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/30 bg-[#f0f0f6] py-10 dark:bg-[#0a0a14]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-semibold">FlashAI</span>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              © 2025 FlashAI · Được xây dựng với ❤️ và Gemini AI
            </p>

            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/login"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
