export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900 px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          AI Flashcard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Học thông minh hơn với trí tuệ nhân tạo
        </p>
      </div>
      {children}
    </div>
  );
}
