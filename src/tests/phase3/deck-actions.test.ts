import { describe, it, expect, vi, beforeEach } from "vitest";
import { createDeck, updateDeck, deleteDeck } from "@/actions/deck.actions";

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

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";
const USER = { id: "user-123", email: "test@test.com" };

function authOk() {
  mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
}

function authFail() {
  mockGetUser.mockResolvedValue({
    data: { user: null },
    error: new Error("unauth"),
  });
}

// ─── createDeck ───────────────────────────────────────────────
describe("createDeck action (Phase 3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when title is empty", async () => {
    authOk();
    const result = await createDeck(makeFormData({ title: "" }));
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/trống/);
  });

  it("returns error when title exceeds 100 chars", async () => {
    authOk();
    const result = await createDeck(makeFormData({ title: "x".repeat(101) }));
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/100/);
  });

  it("returns error when not authenticated", async () => {
    authFail();
    const result = await createDeck(makeFormData({ title: "Test Deck" }));
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/đăng nhập/);
  });

  it("returns success and deck data on valid input", async () => {
    authOk();
    const fakeDeck = { id: VALID_UUID, title: "Test Deck", user_id: USER.id };
    const chainMock = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: fakeDeck, error: null }),
    };
    mockFrom.mockReturnValue(chainMock);

    const result = await createDeck(makeFormData({ title: "Test Deck" }));
    expect(result.success).toBe(true);
    expect((result as { deck: typeof fakeDeck }).deck).toEqual(fakeDeck);
  });

  it("returns error when supabase insert fails", async () => {
    authOk();
    const chainMock = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: "DB error" } }),
    };
    mockFrom.mockReturnValue(chainMock);

    const result = await createDeck(makeFormData({ title: "Test Deck" }));
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/thẻ/);
  });

  it("accepts description up to 500 chars", async () => {
    authOk();
    const fakeDeck = {
      id: VALID_UUID,
      title: "T",
      description: "d".repeat(500),
    };
    const chainMock = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: fakeDeck, error: null }),
    };
    mockFrom.mockReturnValue(chainMock);

    const result = await createDeck(
      makeFormData({ title: "T", description: "d".repeat(500) }),
    );
    expect(result.success).toBe(true);
  });

  it("returns error when description exceeds 500 chars", async () => {
    authOk();
    const result = await createDeck(
      makeFormData({ title: "T", description: "d".repeat(501) }),
    );
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/500/);
  });
});

// ─── updateDeck ───────────────────────────────────────────────
describe("updateDeck action (Phase 3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error for invalid UUID", async () => {
    authOk();
    const result = await updateDeck("not-a-uuid", makeFormData({ title: "T" }));
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/ID/);
  });

  it("returns error when title is empty", async () => {
    authOk();
    const result = await updateDeck(VALID_UUID, makeFormData({ title: "" }));
    expect(result.success).toBe(false);
  });

  it("returns error when supabase update fails", async () => {
    const chainMock = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: "DB error" } }),
    };
    mockFrom.mockReturnValue(chainMock);
    const result = await updateDeck(VALID_UUID, makeFormData({ title: "T" }));
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/thẻ/);
  });

  it("returns success on valid update", async () => {
    authOk();
    const chainMock = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockResolvedValue({ data: { id: VALID_UUID }, error: null }),
    };
    mockFrom.mockReturnValue(chainMock);

    const result = await updateDeck(
      VALID_UUID,
      makeFormData({ title: "Updated" }),
    );
    expect(result.success).toBe(true);
  });
});

// ─── deleteDeck ───────────────────────────────────────────────
describe("deleteDeck action (Phase 3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error for invalid UUID", async () => {
    authOk();
    const result = await deleteDeck("bad-id");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/ID/);
  });

  it("returns error when supabase delete fails", async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: "FK constraint" } }),
    });
    const result = await deleteDeck(VALID_UUID);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/xoá/);
  });

  it("returns success when deletion succeeds", async () => {
    authOk();
    const chainMock = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      mockResolvedValue: vi.fn(),
    };
    // eq().eq() resolves to { error: null }
    const eqChain = { eq: vi.fn().mockResolvedValue({ error: null }) };
    chainMock.eq.mockReturnValueOnce(eqChain);
    mockFrom.mockReturnValue(chainMock);

    const result = await deleteDeck(VALID_UUID);
    expect(result.success).toBe(true);
  });
});
