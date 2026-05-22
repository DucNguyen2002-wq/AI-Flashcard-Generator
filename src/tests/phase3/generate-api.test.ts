import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/generate/route";

// ─── Supabase mock ────────────────────────────────────────────
const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

// ─── Helpers ──────────────────────────────────────────────────
const DECK_ID = "123e4567-e89b-12d3-a456-426614174000";
const USER = { id: "user-gen", email: "gen@test.com" };
const VALID_BODY = { text: "React is a JavaScript library", count: 5, deckId: DECK_ID };

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function authOk() {
  mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
}

function authFail() {
  mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error("no auth") });
}

function deckExists() {
  mockFrom.mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: DECK_ID }, error: null }),
  });
}

function deckNotFound() {
  mockFrom.mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  });
}

function mockGeminiSuccess(cards: object[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: JSON.stringify(cards) }],
            },
          },
        ],
      }),
    }),
  );
}

function mockGemini429() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
    }),
  );
}

const originalEnv = { ...process.env };

// ─── Tests ────────────────────────────────────────────────────
describe("POST /api/generate (Phase 3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure GEMINI_API_KEY is set by default
    process.env.GEMINI_API_KEY = "test-api-key";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  // ── Auth ────────────────────────────────────────────────
  it("returns 401 when not authenticated", async () => {
    authFail();
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toMatch(/xác thực/);
  });

  // ── Input validation ────────────────────────────────────
  it("returns 400 when body is invalid JSON", async () => {
    authOk();
    const req = new NextRequest("http://localhost/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/hợp lệ/);
  });

  it("returns 400 when text is missing", async () => {
    authOk();
    const res = await POST(makeRequest({ count: 5, deckId: DECK_ID }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when text exceeds 5000 chars", async () => {
    authOk();
    const res = await POST(makeRequest({ text: "x".repeat(5001), count: 5, deckId: DECK_ID }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/5000/);
  });

  it("returns 400 for invalid count value (7 is not 5|10|15|20)", async () => {
    authOk();
    const res = await POST(makeRequest({ text: "content", count: 7, deckId: DECK_ID }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid deckId (not UUID)", async () => {
    authOk();
    const res = await POST(makeRequest({ text: "content", count: 5, deckId: "bad" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/deckId/);
  });

  // ── Deck ownership ──────────────────────────────────────
  it("returns 404 when deck not found", async () => {
    authOk();
    deckNotFound();
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toMatch(/tồn tại/);
  });

  // ── Missing API key ─────────────────────────────────────
  it("returns 503 when GEMINI_API_KEY is not set", async () => {
    authOk();
    deckExists();
    delete process.env.GEMINI_API_KEY;
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.error).toMatch(/GEMINI_API_KEY/);
  });

  // ── Successful generation ───────────────────────────────
  it("returns 200 with cards array on success", async () => {
    authOk();
    deckExists();
    const cards = [
      { question: "What is React?", answer: "A JS library" },
      { question: "What is JSX?", answer: "JavaScript XML" },
    ];
    mockGeminiSuccess(cards);

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json.length).toBe(2);
    expect(json[0]).toHaveProperty("question");
    expect(json[0]).toHaveProperty("answer");
  });

  it("strips markdown fences from Gemini response", async () => {
    authOk();
    deckExists();
    const cards = [{ question: "Q1", answer: "A1" }];
    // Simulate Gemini wrapping in ```json ... ```
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: "```json\n" + JSON.stringify(cards) + "\n```" }],
              },
            },
          ],
        }),
      }),
    );

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json[0].question).toBe("Q1");
  });

  // ── Rate limiting ───────────────────────────────────────
  it("returns 429 when Gemini responds with 429", async () => {
    authOk();
    deckExists();
    mockGemini429();

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error).toMatch(/giới hạn/);
  });

  // ── Double parse failure → 500 ──────────────────────────
  it("returns 500 when Gemini returns unparseable JSON twice", async () => {
    authOk();
    deckExists();
    // Both calls return invalid JSON
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: "not valid json at all" }],
              },
            },
          ],
        }),
      }),
    );

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toMatch(/phân tích/);
  });
});
