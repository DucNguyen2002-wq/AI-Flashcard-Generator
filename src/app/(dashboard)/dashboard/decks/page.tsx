import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { RecentDecks } from "@/components/dashboard/recent-decks"
import type { DeckWithCount } from "@/types"

export default async function DecksPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data } = await supabase
    .from("decks")
    .select("*, flashcard_count:flashcards(count)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  const decks = ((data as unknown[]) ?? []).map((d) => {
    const deck = d as Record<string, unknown>
    const counts = deck.flashcard_count
    return {
      ...deck,
      flashcard_count: Array.isArray(counts)
        ? (counts[0] as { count: number })?.count ?? 0
        : 0,
    }
  }) as DeckWithCount[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bộ thẻ của tôi</h2>
          <p className="text-muted-foreground">
            Quản lý các bộ thẻ ghi nhớ của bạn
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tạo bộ thẻ mới
        </Button>
      </div>

      <RecentDecks decks={decks} />
    </div>
  )
}
