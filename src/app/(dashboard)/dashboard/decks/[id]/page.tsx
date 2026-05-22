import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Brain, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Deck, Flashcard } from "@/types";
import { DeckActions } from "@/components/deck/deck-actions";
import type { DeckWithCount } from "@/types";
import { AddFlashcardForm } from "@/components/flashcard/add-flashcard-form";
import { FlashcardTable } from "@/components/flashcard/flashcard-table";

export default async function DeckDetailPage({
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

  const [{ data: deckData }, { data: flashcardsData }, { data: progressData }] =
    await Promise.all([
      supabase
        .from("decks")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("flashcards")
        .select("*")
        .eq("deck_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("card_progress")
        .select("flashcard_id, next_review_at, interval_days")
        .eq("user_id", user.id),
    ]);

  if (!deckData) notFound();

  const deck = deckData as unknown as Deck;
  const flashcards = ((flashcardsData as unknown[]) ?? []) as Flashcard[];

  const now = new Date().toISOString();
  const progressMap = new Map(
    ((progressData as unknown[]) ?? []).map((p) => {
      const row = p as { flashcard_id: string; next_review_at: string; interval_days: number };
      return [row.flashcard_id, row];
    })
  );

  const dueCount = flashcards.filter((c) => {
    const prog = progressMap.get(c.id);
    return !prog || prog.next_review_at <= now;
  }).length;

  const masteredCount = flashcards.filter((c) => {
    const prog = progressMap.get(c.id);
    return prog && prog.interval_days >= 21;
  }).length;

  // Build DeckWithCount for DeckActions
  const deckWithCount: DeckWithCount = {
    ...(deck as Deck),
    flashcard_count: flashcards.length,
    due_count: dueCount,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/dashboard/decks"
          className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold tracking-tight">{deck.title}</h2>
          {deck.description && (
            <p className="text-muted-foreground mt-1">{deck.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/dashboard/decks/${id}/generate`}
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Sparkles className="h-4 w-4" />
            Sinh AI
          </Link>
          <Link
            href={`/dashboard/decks/${id}/study`}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Brain className="h-4 w-4" />
            Học ngay
          </Link>
          <DeckActions deck={deckWithCount} />
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-6 rounded-lg border bg-muted/30 px-6 py-4">
        <div className="text-center">
          <p className="text-2xl font-bold">{flashcards.length}</p>
          <p className="text-xs text-muted-foreground">Tổng thẻ</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-500">{dueCount}</p>
          <p className="text-xs text-muted-foreground">Cần ôn hôm nay</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-500">{masteredCount}</p>
          <p className="text-xs text-muted-foreground">Đã thành thạo</p>
        </div>
      </div>

      {/* Flashcard section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Danh sách thẻ</h3>
          <AddFlashcardForm deckId={id} />
        </div>
        <FlashcardTable flashcards={flashcards} deckId={id} />
      </div>
    </div>
  );
}
