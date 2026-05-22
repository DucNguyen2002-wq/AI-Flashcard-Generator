import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getDailyStudyStats,
  getCardStatusStats,
  getStudyStreak,
} from "@/actions/stats.actions";
import { subDays, format } from "date-fns";

// ─── Supabase mock ─────────────────────────────────────────────
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: mockFrom })),
}));

// ─── Helpers ───────────────────────────────────────────────────
const USER_ID = "user-stats-001";

/** Create a thenable Supabase query chain that resolves to `result`. */
function makeQuery(result: {
  data?: unknown;
  count?: number | null;
  error?: null;
}) {
  const p = Promise.resolve(result);
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    then: p.then.bind(p),
    catch: p.catch.bind(p),
    finally: p.finally.bind(p),
  };
  return chain;
}

/** ISO timestamp string for N days ago. */
function dayISO(daysAgo: number, hour = "T10:00:00Z") {
  return format(subDays(new Date(), daysAgo), "yyyy-MM-dd") + hour;
}

/** YYYY-MM-DD string for N days ago. */
function dayStr(daysAgo: number) {
  return format(subDays(new Date(), daysAgo), "yyyy-MM-dd");
}

// ─── getDailyStudyStats ────────────────────────────────────────
describe("getDailyStudyStats (Phase 4)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 7 entries with date and count keys", async () => {
    mockFrom.mockReturnValue(makeQuery({ data: [], error: null }));
    const result = await getDailyStudyStats(USER_ID, 7);
    expect(result).toHaveLength(7);
    expect(result[0]).toHaveProperty("date");
    expect(result[0]).toHaveProperty("count");
  });

  it("returns 14 entries when days=14", async () => {
    mockFrom.mockReturnValue(makeQuery({ data: [], error: null }));
    const result = await getDailyStudyStats(USER_ID, 14);
    expect(result).toHaveLength(14);
  });

  it("returns all zeros when no study data", async () => {
    mockFrom.mockReturnValue(makeQuery({ data: [], error: null }));
    const result = await getDailyStudyStats(USER_ID, 7);
    expect(result.every((r) => r.count === 0)).toBe(true);
  });

  it("counts correctly when data exists", async () => {
    mockFrom.mockReturnValue(
      makeQuery({
        data: [
          { last_reviewed_at: dayISO(0) },
          { last_reviewed_at: dayISO(0) },
          { last_reviewed_at: dayISO(1) },
        ],
        error: null,
      }),
    );
    const result = await getDailyStudyStats(USER_ID, 7);
    const today = result.find((r) => r.date === dayStr(0));
    const yesterday = result.find((r) => r.date === dayStr(1));
    expect(today?.count).toBe(2);
    expect(yesterday?.count).toBe(1);
  });

  it("dates are in YYYY-MM-DD format", async () => {
    mockFrom.mockReturnValue(makeQuery({ data: [], error: null }));
    const result = await getDailyStudyStats(USER_ID, 7);
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    expect(result.every((r) => dateRegex.test(r.date))).toBe(true);
  });

  it("dates are in ascending chronological order", async () => {
    mockFrom.mockReturnValue(makeQuery({ data: [], error: null }));
    const result = await getDailyStudyStats(USER_ID, 7);
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!.date >= result[i - 1]!.date).toBe(true);
    }
  });
});

// ─── getCardStatusStats ────────────────────────────────────────
describe("getCardStatusStats (Phase 4)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all zeros when user has no decks", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "decks") return makeQuery({ data: [], error: null });
      return makeQuery({ data: [], error: null });
    });
    const result = await getCardStatusStats(USER_ID);
    expect(result).toEqual({ new: 0, learning: 0, review: 0, mastered: 0 });
  });

  it("returns new=total when no progress records exist", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "decks")
        return makeQuery({ data: [{ id: "deck-1" }], error: null });
      if (table === "flashcards")
        return makeQuery({ count: 5, data: null, error: null });
      if (table === "card_progress")
        return makeQuery({ data: [], error: null });
      return makeQuery({ data: null });
    });
    const result = await getCardStatusStats(USER_ID);
    expect(result).toEqual({ new: 5, learning: 0, review: 0, mastered: 0 });
  });

  it("classifies learning cards (interval_days < 7)", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "decks")
        return makeQuery({ data: [{ id: "d1" }], error: null });
      if (table === "flashcards")
        return makeQuery({ count: 3, data: null, error: null });
      if (table === "card_progress")
        return makeQuery({
          data: [
            { interval_days: 1 },
            { interval_days: 3 },
            { interval_days: 6 },
          ],
          error: null,
        });
      return makeQuery({ data: null });
    });
    const result = await getCardStatusStats(USER_ID);
    expect(result.learning).toBe(3);
    expect(result.new).toBe(0);
  });

  it("classifies review cards (interval_days 7–20)", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "decks")
        return makeQuery({ data: [{ id: "d1" }], error: null });
      if (table === "flashcards")
        return makeQuery({ count: 3, data: null, error: null });
      if (table === "card_progress")
        return makeQuery({
          data: [{ interval_days: 7 }, { interval_days: 14 }, { interval_days: 20 }],
          error: null,
        });
      return makeQuery({ data: null });
    });
    const result = await getCardStatusStats(USER_ID);
    expect(result.review).toBe(3);
    expect(result.new).toBe(0);
  });

  it("classifies mastered cards (interval_days >= 21)", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "decks")
        return makeQuery({ data: [{ id: "d1" }], error: null });
      if (table === "flashcards")
        return makeQuery({ count: 2, data: null, error: null });
      if (table === "card_progress")
        return makeQuery({
          data: [{ interval_days: 21 }, { interval_days: 100 }],
          error: null,
        });
      return makeQuery({ data: null });
    });
    const result = await getCardStatusStats(USER_ID);
    expect(result.mastered).toBe(2);
    expect(result.new).toBe(0);
  });

  it("returns correct new count when some cards have progress", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "decks")
        return makeQuery({ data: [{ id: "d1" }], error: null });
      if (table === "flashcards")
        return makeQuery({ count: 10, data: null, error: null });
      if (table === "card_progress")
        return makeQuery({
          data: [
            { interval_days: 3 },  // learning
            { interval_days: 10 }, // review
            { interval_days: 25 }, // mastered
          ],
          error: null,
        });
      return makeQuery({ data: null });
    });
    const result = await getCardStatusStats(USER_ID);
    expect(result.new).toBe(7); // 10 total - 3 with progress
    expect(result.learning).toBe(1);
    expect(result.review).toBe(1);
    expect(result.mastered).toBe(1);
  });

  it("new count is never negative", async () => {
    // More progress records than total cards (edge case)
    mockFrom.mockImplementation((table: string) => {
      if (table === "decks")
        return makeQuery({ data: [{ id: "d1" }], error: null });
      if (table === "flashcards")
        return makeQuery({ count: 1, data: null, error: null });
      if (table === "card_progress")
        return makeQuery({
          data: [{ interval_days: 3 }, { interval_days: 10 }],
          error: null,
        });
      return makeQuery({ data: null });
    });
    const result = await getCardStatusStats(USER_ID);
    expect(result.new).toBeGreaterThanOrEqual(0);
  });
});

// ─── getStudyStreak ────────────────────────────────────────────
describe("getStudyStreak (Phase 4)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 0 when no data", async () => {
    mockFrom.mockReturnValue(makeQuery({ data: [], error: null }));
    expect(await getStudyStreak(USER_ID)).toBe(0);
  });

  it("returns 1 when studied only today", async () => {
    mockFrom.mockReturnValue(
      makeQuery({ data: [{ last_reviewed_at: dayISO(0) }], error: null }),
    );
    expect(await getStudyStreak(USER_ID)).toBe(1);
  });

  it("returns 1 when studied only yesterday (not today)", async () => {
    mockFrom.mockReturnValue(
      makeQuery({ data: [{ last_reviewed_at: dayISO(1) }], error: null }),
    );
    expect(await getStudyStreak(USER_ID)).toBe(1);
  });

  it("returns consecutive streak count for multiple days", async () => {
    mockFrom.mockReturnValue(
      makeQuery({
        data: [
          { last_reviewed_at: dayISO(0) },
          { last_reviewed_at: dayISO(1) },
          { last_reviewed_at: dayISO(2) },
        ],
        error: null,
      }),
    );
    expect(await getStudyStreak(USER_ID)).toBe(3);
  });

  it("stops streak at a gap day", async () => {
    // Studied today and 2 days ago — NOT yesterday → streak = 1
    mockFrom.mockReturnValue(
      makeQuery({
        data: [
          { last_reviewed_at: dayISO(0) },
          { last_reviewed_at: dayISO(2) },
        ],
        error: null,
      }),
    );
    expect(await getStudyStreak(USER_ID)).toBe(1);
  });

  it("counts each day only once even with multiple entries", async () => {
    // Today has 3 study sessions, yesterday 2 sessions → streak = 2
    mockFrom.mockReturnValue(
      makeQuery({
        data: [
          { last_reviewed_at: dayISO(0, "T08:00:00Z") },
          { last_reviewed_at: dayISO(0, "T12:00:00Z") },
          { last_reviewed_at: dayISO(0, "T18:00:00Z") },
          { last_reviewed_at: dayISO(1, "T10:00:00Z") },
          { last_reviewed_at: dayISO(1, "T15:00:00Z") },
        ],
        error: null,
      }),
    );
    expect(await getStudyStreak(USER_ID)).toBe(2);
  });
});
