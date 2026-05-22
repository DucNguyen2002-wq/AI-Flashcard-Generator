import { describe, it, expect, vi } from "vitest";
import { NextResponse } from "next/server";

// Mock NextResponse.json
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data: unknown) => ({
      status: 200,
      json: async () => data,
      _data: data,
    })),
  },
}));

describe("Health API route (Phase 1)", () => {
  it("GET /api/health returns status ok", async () => {
    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (response as any)._data;

    expect(data.status).toBe("ok");
  });

  it("GET /api/health returns version 1.0.0", async () => {
    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (response as any)._data;

    expect(data.version).toBe("1.0.0");
  });

  it("GET /api/health returns valid ISO timestamp", async () => {
    const { GET } = await import("@/app/api/health/route");
    const before = Date.now();
    const response = await GET();
    const after = Date.now();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (response as any)._data;
    const ts = new Date(data.timestamp).getTime();

    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it("NextResponse.json was called", async () => {
    const { GET } = await import("@/app/api/health/route");
    await GET();
    expect(NextResponse.json).toHaveBeenCalled();
  });
});
