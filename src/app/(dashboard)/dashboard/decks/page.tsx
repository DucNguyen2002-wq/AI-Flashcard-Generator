import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeckList } from "@/components/deck/deck-list";
import { CreateDeckDialog } from "@/components/deck/create-deck-dialog";
import type { DeckWithCount } from "@/types";

export default async function DecksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const now = new Date().toISOString();

  // fetch decks with flashcard count and due count
  const { data } = await supabase
    .from("decks")
    .select(
      `
      *,
      flashcard_count:flashcards(count),
      due_count:flashcards(card_progress(count))
    `,
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  // Fetch due counts separately (card_progress where next_review_at <= now)
  const { data: progressData } = await supabase
    .from("card_progress")
    .select("flashcard_id, flashcards!inner(deck_id)")
    .eq("user_id", user.id)
    .lte("next_review_at", now);

  // Build due count per deck
  const dueCounts: Record<string, number> = {};
  ((progressData as unknown[]) ?? []).forEach((p) => {
    const row = p as { flashcards: { deck_id: string } };
    const deckId = row.flashcards?.deck_id;
    if (deckId) dueCounts[deckId] = (dueCounts[deckId] ?? 0) + 1;
  });

  const decks = ((data as unknown[]) ?? []).map((d) => {
    const deck = d as Record<string, unknown>;
    const counts = deck.flashcard_count;
    return {
      ...deck,
      flashcard_count: Array.isArray(counts)
        ? ((counts[0] as { count: number })?.count ?? 0)
        : 0,
      due_count: dueCounts[deck.id as string] ?? 0,
    };
  }) as DeckWithCount[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bộ thẻ của tôi</h2>
          <p className="text-muted-foreground">
            Quản lý các bộ thẻ ghi nhớ của bạn
          </p>
        </div>
        <CreateDeckDialog />
      </div>

      <DeckList decks={decks} />
    </div>
  );
}
