import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getStudyCards } from "@/actions/progress.actions"
import type { Deck } from "@/types"
import { StudySession } from "@/components/study/study-session"
import { NoCardsState } from "@/components/study/no-cards-state"

export default async function StudyPage({
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
    .select("id, title, description")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!deckData) notFound()

  const deck = deckData as unknown as Pick<Deck, "id" | "title" | "description">

  const studyCards = await getStudyCards(id)

  if (studyCards.length === 0) {
    // Find the next scheduled review time
    const { data: nextProgress } = await supabase
      .from("card_progress")
      .select("next_review_at")
      .eq("user_id", user.id)
      .order("next_review_at", { ascending: true })
      .limit(1)
      .maybeSingle()

    const nextReviewAt = nextProgress
      ? (nextProgress as { next_review_at: string }).next_review_at
      : null

    return <NoCardsState deckId={id} nextReviewAt={nextReviewAt} />
  }

  return (
    <StudySession
      cards={studyCards}
      deckId={id}
      deckTitle={deck.title}
    />
  )
}
