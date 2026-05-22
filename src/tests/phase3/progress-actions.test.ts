import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateCardProgress, getStudyCards } from "@/actions/progress.actions";
import type { SM2Grade } from "@/types";

// ─── Supabase mock ────────────────────────────────────────────
const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// ─── Helpers ──────────────────────────────────────────────────
const USER = { id: "user-prog", email: "prog@test.com" };
const CARD_ID = "123e4567-e89b-12d3-a456-426614174000";
const DECK_ID = "223e4567-e89b-12d3-a456-426614174001";

function authOk() {
  mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
}
function authFail() {
  mockGetUser.mockResolvedValue({
    data: { user: null },
    error: new Error("unauth"),
  });
}

// ─── updateCardProgress ───────────────────────────────────────
describe("updateCardProgress (Phase 3)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns error when not authenticated", async () => {
    authFail();
    const result = await updateCardProgress(CARD_ID, 4 as SM2Grade);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/xác thực/);
  });

  it("uses SM2_DEFAULTS when no existing progress", async () => {
    authOk();
    let callCount = 0;
    const upsertMock = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // card_progress select — returns null (no progress yet)
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      // card_progress upsert
      return { upsert: upsertMock };
    });

    const result = await updateCardProgress(CARD_ID, 4 as SM2Grade);
    expect(result.success).toBe(true);
    expect(upsertMock).toHaveBeenCalledOnce();
    // Ensure upsert contains snake_case fields
    const upsertArg = upsertMock.mock.calls[0][0];
    expect(upsertArg).toHaveProperty("ease_factor");
    expect(upsertArg).toHaveProperty("interval_days");
    expect(upsertArg).toHaveProperty("repetitions");
    expect(upsertArg).toHaveProperty("next_review_at");
  });

  it("uses existing progress fields when card has been studied before", async () => {
    authOk();
    const existingProgress = {
      flashcard_id: CARD_ID,
      user_id: USER.id,
      ease_factor: 2.0,
      interval_days: 6,
      repetitions: 2,
      next_review_at: new Date(Date.now() - 1000).toISOString(),
    };
    let callCount = 0;
    const upsertMock = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi
            .fn()
            .mockResolvedValue({ data: existingProgress, error: null }),
        };
      }
      return { upsert: upsertMock };
    });

    const result = await updateCardProgress(CARD_ID, 3 as SM2Grade);
    expect(result.success).toBe(true);
    const upsertArg = upsertMock.mock.calls[0][0];
    // interval_days should be round(6 * ef from SM2 grade 3)
    expect(upsertArg.interval_days).toBeGreaterThan(6);
    expect(upsertArg.repetitions).toBe(3);
  });

  it("returns error when upsert fails", async () => {
    authOk();
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      return {
        upsert: vi
          .fn()
          .mockResolvedValue({ error: { message: "upsert failed" } }),
      };
    });

    const result = await updateCardProgress(CARD_ID, 4 as SM2Grade);
    expect(result.success).toBe(false);
    expect(result.error).toBe("upsert failed");
  });

  it("grade 1 resets repetitions to 0 in upsert", async () => {
    authOk();
    const existingProgress = {
      flashcard_id: CARD_ID,
      user_id: USER.id,
      ease_factor: 2.5,
      interval_days: 6,
      repetitions: 2,
      next_review_at: new Date(Date.now() - 1000).toISOString(),
    };
    let callCount = 0;
    const upsertMock = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi
            .fn()
            .mockResolvedValue({ data: existingProgress, error: null }),
        };
      }
      return { upsert: upsertMock };
    });

    await updateCardProgress(CARD_ID, 1 as SM2Grade);
    const upsertArg = upsertMock.mock.calls[0][0];
    expect(upsertArg.repetitions).toBe(0);
    expect(upsertArg.interval_days).toBe(1);
  });
});

// ─── getStudyCards ────────────────────────────────────────────
describe("getStudyCards (Phase 3)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns empty array when not authenticated", async () => {
    authFail();
    const result = await getStudyCards(DECK_ID);
    expect(result).toEqual([]);
  });

  it("returns empty array when deck not found / not owned", async () => {
    authOk();
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // decks check — not found
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      return {};
    });
    const result = await getStudyCards(DECK_ID);
    expect(result).toEqual([]);
  });

  it("returns empty array when deck has no flashcards", async () => {
    authOk();
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // decks — found
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi
            .fn()
            .mockResolvedValue({ data: { id: DECK_ID }, error: null }),
        };
      }
      if (callCount === 2) {
        // flashcards — empty
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      return {};
    });
    const result = await getStudyCards(DECK_ID);
    expect(result).toEqual([]);
  });

  it("returns cards with no progress (new cards) as due", async () => {
    authOk();
    const cards = [
      {
        id: "c1",
        deck_id: DECK_ID,
        question: "Q1",
        answer: "A1",
        created_at: "2024-01-01",
      },
      {
        id: "c2",
        deck_id: DECK_ID,
        question: "Q2",
        answer: "A2",
        created_at: "2024-01-02",
      },
    ];
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi
            .fn()
            .mockResolvedValue({ data: { id: DECK_ID }, error: null }),
        };
      }
      if (callCount === 2) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: cards, error: null }),
        };
      }
      if (callCount === 3) {
        // card_progress — none exists
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      return {};
    });

    const result = await getStudyCards(DECK_ID);
    expect(result.length).toBe(2);
    result.forEach((c) => expect(c.progress).toBeNull());
  });

  it("excludes cards not yet due (next_review_at in the future)", async () => {
    authOk();
    const cards = [
      {
        id: "c1",
        deck_id: DECK_ID,
        question: "Q1",
        answer: "A1",
        created_at: "2024-01-01",
      },
    ];
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const progress = [
      {
        flashcard_id: "c1",
        user_id: USER.id,
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 1,
        next_review_at: futureDate,
      },
    ];
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi
            .fn()
            .mockResolvedValue({ data: { id: DECK_ID }, error: null }),
        };
      }
      if (callCount === 2) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: cards, error: null }),
        };
      }
      if (callCount === 3) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: progress, error: null }),
        };
      }
      return {};
    });

    const result = await getStudyCards(DECK_ID);
    expect(result.length).toBe(0);
  });

  it("includes cards where next_review_at is in the past", async () => {
    authOk();
    const cards = [
      {
        id: "c1",
        deck_id: DECK_ID,
        question: "Q1",
        answer: "A1",
        created_at: "2024-01-01",
      },
    ];
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const progress = [
      {
        flashcard_id: "c1",
        user_id: USER.id,
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 1,
        next_review_at: pastDate,
      },
    ];
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi
            .fn()
            .mockResolvedValue({ data: { id: DECK_ID }, error: null }),
        };
      }
      if (callCount === 2) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: cards, error: null }),
        };
      }
      if (callCount === 3) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: progress, error: null }),
        };
      }
      return {};
    });

    const result = await getStudyCards(DECK_ID);
    expect(result.length).toBe(1);
    expect(result[0].progress).not.toBeNull();
  });
});
