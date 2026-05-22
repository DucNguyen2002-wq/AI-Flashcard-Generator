"use client"

import Link from "next/link"
import { CheckCircle, RotateCcw, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SessionCompleteProps {
  correct: number
  total: number
  durationMs: number
  deckId: string
}

function formatDuration(ms: number) {
  const totalSecs = Math.floor(ms / 1000)
  const mins = Math.floor(totalSecs / 60)
  const secs = totalSecs % 60
  if (mins === 0) return `${secs} giây`
  return `${mins} phút ${secs} giây`
}

export function SessionComplete({
  correct,
  total,
  durationMs,
  deckId,
}: SessionCompleteProps) {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0
  const poor = total - correct

  let motivationalText = ""
  if (percentage === 100) motivationalText = "Xuất sắc! Bạn nhớ tất cả các thẻ! 🎉"
  else if (percentage >= 80) motivationalText = "Rất tốt! Tiếp tục duy trì nhé! 👍"
  else if (percentage >= 60) motivationalText = "Khá tốt! Hãy ôn lại các thẻ chưa nhớ 💪"
  else motivationalText = "Hãy tiếp tục luyện tập để ghi nhớ tốt hơn 📚"

  return (
    <div className="mx-auto max-w-md space-y-8 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold">Hoàn thành buổi học!</h2>
        <p className="text-muted-foreground">{motivationalText}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 rounded-xl border bg-muted/30 p-6">
        <div>
          <p className="text-3xl font-bold text-green-500">{correct}</p>
          <p className="text-xs text-muted-foreground mt-1">Nhớ được</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-destructive">{poor}</p>
          <p className="text-xs text-muted-foreground mt-1">Cần ôn lại</p>
        </div>
        <div>
          <p className="text-3xl font-bold">{percentage}%</p>
          <p className="text-xs text-muted-foreground mt-1">Tỉ lệ nhớ</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Thời gian: {formatDuration(durationMs)} — {total} thẻ đã ôn
      </p>

      <div className="flex flex-col gap-3">
        <Link href={`/dashboard/decks/${deckId}/study`}>
          <Button className="w-full" variant="default">
            <RotateCcw className="mr-2 h-4 w-4" />
            Học lại
          </Button>
        </Link>
        <Link href={`/dashboard/decks/${deckId}`}>
          <Button className="w-full" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay về bộ thẻ
          </Button>
        </Link>
      </div>
    </div>
  )
}
