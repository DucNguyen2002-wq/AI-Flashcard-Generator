import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface NoCardsStateProps {
  deckId: string
  nextReviewAt: string | null
}

export function NoCardsState({ deckId, nextReviewAt }: NoCardsStateProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
      </div>
      <h2 className="text-xl font-bold">Đã ôn xong tất cả thẻ hôm nay!</h2>
      {nextReviewAt ? (
        <p className="text-muted-foreground">
          Lần ôn tiếp theo:{" "}
          <span className="font-medium text-foreground">
            {format(new Date(nextReviewAt), "eeee, dd/MM/yyyy", { locale: vi })}
          </span>
        </p>
      ) : (
        <p className="text-muted-foreground">Chưa có thẻ nào trong bộ thẻ này.</p>
      )}
      <Link href={`/dashboard/decks/${deckId}`}>
        <Button variant="outline">Quay về bộ thẻ</Button>
      </Link>
    </div>
  )
}
