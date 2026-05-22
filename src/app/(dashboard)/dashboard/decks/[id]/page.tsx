import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import type { Deck } from "@/types"

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: deckData } = await supabase
    .from("decks")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!deckData) notFound()

  const deck = deckData as unknown as Deck

  const { data: flashcards } = await supabase
    .from("flashcards")
    .select("*")
    .eq("deck_id", id)
    .order("created_at", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/decks"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">{deck.title}</h2>
          {deck.description && (
            <p className="text-muted-foreground">{deck.description}</p>
          )}
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Thêm thẻ
        </Button>
      </div>

      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        <p className="text-lg font-medium">
          {(flashcards as unknown[])?.length ?? 0} thẻ ghi nhớ
        </p>
        <p className="text-sm mt-1">
          Tính năng tạo và học flashcard sẽ sớm ra mắt
        </p>
      </div>
    </div>
  )
}
