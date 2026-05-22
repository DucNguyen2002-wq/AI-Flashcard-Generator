import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus } from "lucide-react"
import type { DeckWithCount } from "@/types"

interface RecentDecksProps {
  decks: DeckWithCount[]
}

export function RecentDecks({ decks }: RecentDecksProps) {
  if (decks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <BookOpen className="h-12 w-12 text-muted-foreground/50" />
          <div className="text-center">
            <p className="font-medium">Chưa có bộ thẻ nào</p>
            <p className="text-sm text-muted-foreground">
              Tạo bộ thẻ đầu tiên để bắt đầu học
            </p>
          </div>
          <Link
            href="/dashboard/decks"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            <Plus className="h-4 w-4" />
            Tạo bộ thẻ
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {decks.map((deck) => (
        <Link key={deck.id} href={`/dashboard/decks/${deck.id}`}>
          <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-tight line-clamp-2">
                  {deck.title}
                </CardTitle>

              </div>
            </CardHeader>
            <CardContent>
              {deck.description && (
                <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                  {deck.description}
                </p>
              )}
              <p className="text-sm font-medium">
                {deck.flashcard_count ?? 0} thẻ
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
