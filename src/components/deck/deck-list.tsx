import type { DeckWithCount } from "@/types"
import { DeckCard } from "./deck-card"

interface DeckListProps {
  decks: DeckWithCount[]
}

export function DeckList({ decks }: DeckListProps) {
  if (decks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <p className="text-lg font-medium">Bạn chưa có bộ thẻ nào</p>
        <p className="text-sm text-muted-foreground">
          Nhấn "Tạo bộ thẻ mới" để bắt đầu
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {decks.map((deck) => (
        <DeckCard key={deck.id} deck={deck} />
      ))}
    </div>
  )
}
