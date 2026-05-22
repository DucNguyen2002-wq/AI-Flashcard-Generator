import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentDecks } from "@/components/dashboard/recent-decks";
import { StudyChart } from "@/components/dashboard/study-chart";
import { CardStatusChart } from "@/components/dashboard/card-status-chart";
import {
  getDailyStudyStats,
  getCardStatusStats,
  getStudyStreak,
} from "@/actions/stats.actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DeckWithCount } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [decksResult, dueResult, dailyStats, statusStats, streak] =
    await Promise.all([
      supabase
        .from("decks")
        .select("*, flashcard_count:flashcards(count)")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("card_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .lte("next_review_at", new Date().toISOString()),
      getDailyStudyStats(user.id, 7),
      getCardStatusStats(user.id),
      getStudyStreak(user.id),
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
  const totalFlashcards = decks.reduce((sum, d) => sum + (d.flashcard_count ?? 0), 0);
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
        streak={streak}
      />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Bộ thẻ gần đây</h3>
        </div>
        <RecentDecks decks={decks.slice(0, 4)} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Thống kê học tập</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hoạt động 7 ngày qua
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StudyChart data={dailyStats} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Phân loại thẻ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardStatusChart data={statusStats} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
