import { describe, it, expect, vi, beforeEach } from "vitest";
import { signUp, signIn } from "@/actions/auth.actions";

// Mock Supabase server client
const mockSignUp = vi.fn();
const mockSignIn = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignIn,
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  })),
}));

// Prevent redirect from throwing in tests
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// ─── Helpers ─────────────────────────────────────────────────
function makeFormData(data: Record<string, string>) {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

// ─── signUp ──────────────────────────────────────────────────
describe("signUp action (Phase 2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignUp.mockResolvedValue({ error: null });
  });

  it("returns error for invalid email", async () => {
    const fd = makeFormData({
      email: "bad-email",
      password: "Pass1word",
      confirmPassword: "Pass1word",
    });
    const result = await signUp(fd);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Email");
  });

  it("returns error for password shorter than 8 chars", async () => {
    const fd = makeFormData({
      email: "a@b.com",
      password: "Ab1",
      confirmPassword: "Ab1",
    });
    const result = await signUp(fd);
    expect(result.success).toBe(false);
    expect(result.error).toContain("8 ký tự");
  });

  it("returns error for password without digit", async () => {
    const fd = makeFormData({
      email: "a@b.com",
      password: "PasswordNoNum",
      confirmPassword: "PasswordNoNum",
    });
    const result = await signUp(fd);
    expect(result.success).toBe(false);
    expect(result.error).toContain("chữ số");
  });

  it("returns error when passwords don't match", async () => {
    const fd = makeFormData({
      email: "a@b.com",
      password: "Pass1word",
      confirmPassword: "Different1",
    });
    const result = await signUp(fd);
    expect(result.success).toBe(false);
    expect(result.error).toContain("không khớp");
  });

  it("returns success when valid data and Supabase returns no error", async () => {
    const fd = makeFormData({
      email: "a@b.com",
      password: "Password1",
      confirmPassword: "Password1",
    });
    const result = await signUp(fd);
    expect(result.success).toBe(true);
  });

  it("calls supabase.auth.signUp with correct email and password", async () => {
    const fd = makeFormData({
      email: "test@test.com",
      password: "Secure123",
      confirmPassword: "Secure123",
    });
    await signUp(fd);
    expect(mockSignUp).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "Secure123",
    });
  });

  it("returns already-registered error message for duplicate email", async () => {
    mockSignUp.mockResolvedValue({
      error: { message: "User already registered" },
    });
    const fd = makeFormData({
      email: "existing@b.com",
      password: "Pass1word",
      confirmPassword: "Pass1word",
    });
    const result = await signUp(fd);
    expect(result.success).toBe(false);
    expect(result.error).toContain("đã được đăng ký");
  });

  it("returns generic error for unknown Supabase error", async () => {
    mockSignUp.mockResolvedValue({ error: { message: "Network error" } });
    const fd = makeFormData({
      email: "a@b.com",
      password: "Pass1word",
      confirmPassword: "Pass1word",
    });
    const result = await signUp(fd);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Đăng ký thất bại");
  });
});

// ─── signIn ──────────────────────────────────────────────────
describe("signIn action (Phase 2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignIn.mockResolvedValue({ error: null });
  });

  it("returns error for invalid email format", async () => {
    const fd = makeFormData({ email: "not-an-email", password: "Pass1word" });
    const result = await signIn(fd);
    expect(result).toBeDefined();
    expect(result?.success).toBe(false);
    expect(result?.error).toContain("Email");
  });

  it("returns error for empty password", async () => {
    const fd = makeFormData({ email: "a@b.com", password: "" });
    const result = await signIn(fd);
    expect(result?.success).toBe(false);
    expect(result?.error).toContain("mật khẩu");
  });

  it("calls supabase.auth.signInWithPassword with correct credentials", async () => {
    const fd = makeFormData({ email: "a@b.com", password: "Password1" });
    await signIn(fd);
    expect(mockSignIn).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "Password1",
    });
  });

  it("returns wrong-credentials error on Supabase error", async () => {
    mockSignIn.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });
    const fd = makeFormData({ email: "a@b.com", password: "WrongPass1" });
    const result = await signIn(fd);
    expect(result?.success).toBe(false);
    expect(result?.error).toContain("không đúng");
  });
});
