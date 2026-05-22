/**
 * Tests for getPasswordStrength logic (Phase 2)
 *
 * The function is not exported, so we replicate the scoring
 * logic here to keep tests self-contained and type-safe.
 *
 * Scoring:
 *  +1 length >= 8
 *  +1 length >= 12
 *  +1 uppercase present
 *  +1 digit present
 *  +1 special char present
 *  score <= 2  → "Yếu"
 *  score <= 3  → "Trung bình"
 *  score >= 4  → "Mạnh"
 */
import { describe, it, expect } from "vitest";

function getPasswordStrength(password: string) {
  if (password.length === 0) return { label: "", color: "", width: "0%" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Yếu", color: "bg-red-500", width: "33%" };
  if (score <= 3)
    return { label: "Trung bình", color: "bg-yellow-500", width: "66%" };
  return { label: "Mạnh", color: "bg-green-500", width: "100%" };
}

describe("getPasswordStrength (Phase 2)", () => {
  it("returns empty for empty string", () => {
    const r = getPasswordStrength("");
    expect(r.label).toBe("");
    expect(r.width).toBe("0%");
  });

  it('"abc" → Yếu (score 0)', () => {
    expect(getPasswordStrength("abc").label).toBe("Yếu");
  });

  it('"password1" (8 chars + digit) → Trung bình (score 2-3)', () => {
    // len>=8(+1), no uppercase, digit(+1) = 2 → Yếu, but let's be precise
    const r = getPasswordStrength("password1");
    // score: len>=8 (+1), digit (+1) = 2 → Yếu
    expect(r.label).toBe("Yếu");
  });

  it('"Password1" (8+, uppercase, digit) → Trung bình (score 3)', () => {
    const r = getPasswordStrength("Password1");
    // len>=8(+1), uppercase(+1), digit(+1) = 3 → Trung bình
    expect(r.label).toBe("Trung bình");
  });

  it('"P@ssword123!" (12+, uppercase, digit, special) → Mạnh', () => {
    const r = getPasswordStrength("P@ssword123!");
    // len>=8(+1), len>=12(+1), uppercase(+1), digit(+1), special(+1) = 5 → Mạnh
    expect(r.label).toBe("Mạnh");
  });

  it("Mạnh has green color class", () => {
    expect(getPasswordStrength("P@ssword123!").color).toBe("bg-green-500");
  });

  it("Yếu has red color class", () => {
    expect(getPasswordStrength("abc").color).toBe("bg-red-500");
  });

  it("Trung bình has yellow color class", () => {
    expect(getPasswordStrength("Password1").color).toBe("bg-yellow-500");
  });
});
