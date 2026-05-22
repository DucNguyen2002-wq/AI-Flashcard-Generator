import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  saveGeneratedCards,
} from "@/actions/flashcard.actions";

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
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

// ─── Helpers ──────────────────────────────────────────────────
function makeFormData(data: Record<string, string>) {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

const DECK_ID = "123e4567-e89b-12d3-a456-426614174000";
const CARD_ID = "223e4567-e89b-12d3-a456-426614174001";
const USER = { id: "user-abc", email: "u@test.com" };

function authOk() {
  mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
}
function authFail() {
  mockGetUser.mockResolvedValue({
    data: { user: null },
    error: new Error("no auth"),
  });
}

// Build a chainable mock that owns a deck
function deckOwnedChain(resolveValue: object | null = { id: DECK_ID }) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: resolveValue, error: null }),
  };
  return chain;
}

// ─── createFlashcard ──────────────────────────────────────────
describe("createFlashcard action (Phase 3)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns error when deckId is not a UUID", async () => {
    authOk();
    const fd = makeFormData({ deckId: "bad", question: "Q", answer: "A" });
    const result = await createFlashcard(fd);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/deckId/);
  });

  it("returns error when question is empty", async () => {
    authOk();
    const fd = makeFormData({ deckId: DECK_ID, question: "", answer: "A" });
    const result = await createFlashcard(fd);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/hỏi/);
  });

  it("returns error when answer is empty", async () => {
    authOk();
    const fd = makeFormData({ deckId: DECK_ID, question: "Q", answer: "" });
    const result = await createFlashcard(fd);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/lời/);
  });

  it("returns error when not authenticated", async () => {
    authFail();
    const fd = makeFormData({ deckId: DECK_ID, question: "Q", answer: "A" });
    const result = await createFlashcard(fd);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/đăng nhập/);
  });

  it("returns error when deck not owned", async () => {
    authOk();
    // deck ownership check returns null (not owned)
    const chain = deckOwnedChain(null);
    mockFrom.mockReturnValue(chain);

    const fd = makeFormData({ deckId: DECK_ID, question: "Q", answer: "A" });
    const result = await createFlashcard(fd);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/quyền/);
  });

  it("returns success when deck is owned and insert succeeds", async () => {
    authOk();
    const fakeCard = {
      id: CARD_ID,
      question: "Q",
      answer: "A",
      deck_id: DECK_ID,
    };
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First call: verifyDeckOwnership
        return deckOwnedChain({ id: DECK_ID });
      }
      // Second call: insert flashcard
      return {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: fakeCard, error: null }),
      };
    });

    const fd = makeFormData({ deckId: DECK_ID, question: "Q", answer: "A" });
    const result = await createFlashcard(fd);
    expect(result.success).toBe(true);
    expect((result as { flashcard: typeof fakeCard }).flashcard).toEqual(
      fakeCard,
    );
  });

  it("returns error for question longer than 500 chars", async () => {
    authOk();
    const fd = makeFormData({
      deckId: DECK_ID,
      question: "q".repeat(501),
      answer: "A",
    });
    const result = await createFlashcard(fd);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/500/);
  });
});

// ─── updateFlashcard ──────────────────────────────────────────
describe("updateFlashcard action (Phase 3)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns error for invalid flashcard UUID", async () => {
    authOk();
    const result = await updateFlashcard(
      "not-uuid",
      makeFormData({ question: "Q", answer: "A" }),
    );
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/ID/);
  });

  it("returns error when question is empty", async () => {
    authOk();
    const result = await updateFlashcard(
      CARD_ID,
      makeFormData({ question: "", answer: "A" }),
    );
    expect(result.success).toBe(false);
  });

  it("returns error when flashcard not found", async () => {
    authOk();
    mockFrom.mockReturnValue(deckOwnedChain(null));
    const result = await updateFlashcard(
      CARD_ID,
      makeFormData({ question: "Q", answer: "A" }),
    );
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/tồn tại/);
  });

  it("returns success when flashcard exists and update succeeds", async () => {
    authOk();
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // select with join — finds flashcard
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi
            .fn()
            .mockResolvedValue({ data: { deck_id: DECK_ID }, error: null }),
        };
      }
      // update call
      return {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
    });
    const result = await updateFlashcard(
      CARD_ID,
      makeFormData({ question: "New Q", answer: "New A" }),
    );
    expect(result.success).toBe(true);
  });
});

// ─── deleteFlashcard ──────────────────────────────────────────
describe("deleteFlashcard action (Phase 3)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns error for invalid UUID", async () => {
    const result = await deleteFlashcard("bad-id", DECK_ID);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/ID/);
  });

  it("returns success when delete succeeds", async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const result = await deleteFlashcard(CARD_ID, DECK_ID);
    expect(result.success).toBe(true);
  });

  it("returns error when supabase delete fails", async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: "constraint" } }),
    });
    const result = await deleteFlashcard(CARD_ID, DECK_ID);
    expect(result.success).toBe(false);
  });
});

// ─── saveGeneratedCards ───────────────────────────────────────
describe("saveGeneratedCards action (Phase 3)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns error for invalid deckId UUID", async () => {
    authOk();
    const result = await saveGeneratedCards("bad", [
      { question: "Q", answer: "A" },
    ]);
    expect(result.success).toBe(false);
  });

  it("returns error for empty cards array", async () => {
    authOk();
    const result = await saveGeneratedCards(DECK_ID, []);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/1/);
  });

  it("returns error for cards array exceeding 20", async () => {
    authOk();
    const cards = Array.from({ length: 21 }, (_, i) => ({
      question: `Q${i}`,
      answer: `A${i}`,
    }));
    const result = await saveGeneratedCards(DECK_ID, cards);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/20/);
  });

  it("returns error when not authenticated", async () => {
    authFail();
    const result = await saveGeneratedCards(DECK_ID, [
      { question: "Q", answer: "A" },
    ]);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/đăng nhập/);
  });

  it("returns error when deck not owned", async () => {
    authOk();
    mockFrom.mockReturnValue(deckOwnedChain(null));
    const result = await saveGeneratedCards(DECK_ID, [
      { question: "Q", answer: "A" },
    ]);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/quyền/);
  });

  it("returns success with count when all valid", async () => {
    authOk();
    const cards = [
      { question: "Q1", answer: "A1" },
      { question: "Q2", answer: "A2" },
    ];
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return deckOwnedChain({ id: DECK_ID });
      return {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
    });

    const result = await saveGeneratedCards(DECK_ID, cards);
    expect(result.success).toBe(true);
    expect((result as { count: number }).count).toBe(2);
  });
});
