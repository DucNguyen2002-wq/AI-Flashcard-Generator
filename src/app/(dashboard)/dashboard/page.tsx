import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentDecks } from "@/components/dashboard/recent-decks";
import type { DeckWithCount } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [decksResult, flashcardsResult, dueResult] = await Promise.all([
    supabase
      .from("decks")
      .select("*, flashcard_count:flashcards(count)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("flashcards")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("card_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .lte("next_review_at", new Date().toISOString()),
  ]);

  const decks = ((decksResult.data as unknown[]) ?? []).map((d) => {
    const deck = d as Record<string, unknown>;
    const counts = deck.flashcard_count;
    return {
      ...deck,
      flashcard_count: Array.isArray(counts)
        ? ((counts[0] as { count: number })?.count ?? 0)
        : 0,
    };
  }) as DeckWithCount[];

  const totalDecks = decks.length;
  const totalFlashcards = flashcardsResult.count ?? 0;
  const dueToday = dueResult.count ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Xin chào, {user.email?.split("@")[0]} 👋
        </h2>
        <p className="text-muted-foreground">
          Đây là tổng quan hoạt động học tập của bạn
        </p>
      </div>

      <StatsCards
        totalDecks={totalDecks}
        totalFlashcards={totalFlashcards}
        dueToday={dueToday}
        streak={0}
      />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Bộ thẻ gần đây</h3>
        </div>
        <RecentDecks decks={decks.slice(0, 4)} />
      </div>
    </div>
  );
}
