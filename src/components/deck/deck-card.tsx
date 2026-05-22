import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import type { DeckWithCount } from "@/types"
import { DeckActions } from "./deck-actions"

interface DeckCardProps {
  deck: DeckWithCount
}

export function DeckCard({ deck }: DeckCardProps) {
  return (
    <div className="relative group">
      <Link href={`/dashboard/decks/${deck.id}`} className="block h-full">
        <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="truncate text-base font-semibold leading-tight pr-8">
              {deck.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
              {deck.description ?? "Không có mô tả"}
            </p>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center gap-2 pt-2 border-t">
            <Badge variant="secondary">{deck.flashcard_count ?? 0} thẻ</Badge>
            {(deck.due_count ?? 0) > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {deck.due_count} cần ôn
              </Badge>
            )}
            <span className="ml-auto text-xs text-muted-foreground">
              {format(new Date(deck.created_at), "dd/MM/yyyy", { locale: vi })}
            </span>
          </CardFooter>
        </Card>
      </Link>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <DeckActions deck={deck} />
      </div>
    </div>
  )
}
