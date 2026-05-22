"use server";

import { createClient } from "@/lib/supabase/server";
import { subDays, format, parseISO, startOfDay } from "date-fns";

export interface DailyStudyStat {
  date: string; // "YYYY-MM-DD"
  count: number;
}

export interface CardStatusStats {
  new: number;
  learning: number;
  review: number;
  mastered: number;
}

export async function getDailyStudyStats(
  userId: string,
  days = 7,
): Promise<DailyStudyStat[]> {
  const supabase = await createClient();

  const startDate = subDays(startOfDay(new Date()), days - 1);

  const { data } = await supabase
    .from("card_progress")
    .select("last_reviewed_at")
    .eq("user_id", userId)
    .gte("last_reviewed_at", startDate.toISOString());

  // Build a map of date -> count
  const countMap: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = format(subDays(new Date(), days - 1 - i), "yyyy-MM-dd");
    countMap[d] = 0;
  }

  if (data) {
    for (const row of data as { last_reviewed_at: string }[]) {
      const d = format(parseISO(row.last_reviewed_at), "yyyy-MM-dd");
      if (d in countMap) {
        countMap[d] = (countMap[d] ?? 0) + 1;
      }
    }
  }

  return Object.entries(countMap).map(([date, count]) => ({ date, count }));
}

export async function getCardStatusStats(
  userId: string,
): Promise<CardStatusStats> {
  const supabase = await createClient();

  // Total flashcards owned by user (via their decks)
  const { data: deckData } = await supabase
    .from("decks")
    .select("id")
    .eq("user_id", userId);

  const deckIds = (deckData ?? []).map((d) => d.id);
  const { count: totalCount } = deckIds.length
    ? await supabase
        .from("flashcards")
        .select("id", { count: "exact", head: true })
        .in("deck_id", deckIds)
    : { count: 0 };

  const { data: progressData } = await supabase
    .from("card_progress")
    .select("interval_days")
    .eq("user_id", userId);

  const progress = (progressData as { interval_days: number }[] | null) ?? [];

  let learning = 0;
  let review = 0;
  let mastered = 0;

  for (const p of progress) {
    const interval = p.interval_days ?? 0;
    if (interval >= 21) {
      mastered++;
    } else if (interval >= 7) {
      review++;
    } else {
      learning++;
    }
  }

  const total = totalCount ?? 0;
  const withProgress = learning + review + mastered;
  const newCards = Math.max(0, total - withProgress);

  return { new: newCards, learning, review, mastered };
}

export async function getStudyStreak(userId: string): Promise<number> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("card_progress")
    .select("last_reviewed_at")
    .eq("user_id", userId)
    .not("last_reviewed_at", "is", null)
    .order("last_reviewed_at", { ascending: false });

  if (!data || data.length === 0) return 0;

  // Get unique study dates
  const studyDates = new Set(
    (data as { last_reviewed_at: string }[]).map((row) =>
      format(parseISO(row.last_reviewed_at), "yyyy-MM-dd"),
    ),
  );

  let streak = 0;
  let checkDate = new Date();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const dateStr = format(checkDate, "yyyy-MM-dd");
    if (studyDates.has(dateStr)) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else {
      // If today has no study, check yesterday before breaking
      if (streak === 0) {
        checkDate = subDays(checkDate, 1);
        const yesterdayStr = format(checkDate, "yyyy-MM-dd");
        if (studyDates.has(yesterdayStr)) {
          streak++;
          checkDate = subDays(checkDate, 1);
          continue;
        }
      }
      break;
    }
  }

  return streak;
}
