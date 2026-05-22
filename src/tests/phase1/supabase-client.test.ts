import { describe, it, expect, vi, beforeEach } from "vitest";

// Set env vars before module load
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";

describe("Supabase browser client (Phase 1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createClient() returns an object with auth property", async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const client = createClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
  });

  it("createClient() auth has expected methods", async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const client = createClient();
    expect(typeof client.auth.getUser).toBe("function");
    expect(typeof client.auth.signOut).toBe("function");
    expect(typeof client.auth.signInWithOAuth).toBe("function");
  });

  it("createClient() returns object with from() method", async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const client = createClient();
    expect(typeof client.from).toBe("function");
  });
});
