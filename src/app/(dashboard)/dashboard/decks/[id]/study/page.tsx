import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStudyCards } from "@/actions/progress.actions";
import type { Deck, Flashcard, StudyCard } from "@/types";
import { StudySession } from "@/components/study/study-session";
import { NoCardsState } from "@/components/study/no-cards-state";

export default async function StudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: deckData } = await supabase
    .from("decks")
    .select("id, title, description")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!deckData) notFound();

  const deck = deckData as unknown as Pick<
    Deck,
    "id" | "title" | "description"
  >;

  const studyCards = await getStudyCards(id);

  if (studyCards.length === 0) {
    // Check if deck has any flashcards at all
    const { data: allFlashcardsData } = await supabase
      .from("flashcards")
      .select("*")
      .eq("deck_id", id)
      .order("created_at", { ascending: true });

    const allFlashcards = (allFlashcardsData ?? []) as unknown[] as Flashcard[];

    if (allFlashcards.length === 0) {
      // Deck is truly empty
      return <NoCardsState deckId={id} />;
    }

    // Cards exist but none are due today — review all anyway
    const reviewAll: StudyCard[] = allFlashcards.map((f) => ({
      ...f,
      progress: null,
    }));
    const shuffled = reviewAll.sort(() => Math.random() - 0.5);
    return (
      <StudySession
        cards={shuffled}
        deckId={id}
        deckTitle={deck.title}
        isReviewAll
      />
    );
  }

  return <StudySession cards={studyCards} deckId={id} deckTitle={deck.title} />;
}
