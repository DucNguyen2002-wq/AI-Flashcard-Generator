import { describe, it, expect } from "vitest";
import { calculateSM2, SM2_DEFAULTS } from "@/lib/sm2";

// ─── SM-2 Algorithm Tests ─────────────────────────────────────
describe("calculateSM2 (Phase 3)", () => {
  const defaults = {
    easeFactor: SM2_DEFAULTS.easeFactor, // 2.5
    intervalDays: SM2_DEFAULTS.intervalDays, // 0
    repetitions: SM2_DEFAULTS.repetitions, // 0
  };

  // ── Grade < 3: reset ──────────────────────────────────────
  it("grade 1: resets repetitions to 0 and interval to 1", () => {
    const result = calculateSM2({ ...defaults, grade: 1 });
    expect(result.repetitions).toBe(0);
    expect(result.intervalDays).toBe(1);
  });

  it("grade 2: resets repetitions to 0 and interval to 1", () => {
    const result = calculateSM2({ ...defaults, grade: 2 });
    expect(result.repetitions).toBe(0);
    expect(result.intervalDays).toBe(1);
  });

  it("grade 1: ease factor decreases (harder recalled items get lower EF)", () => {
    const result = calculateSM2({ ...defaults, grade: 1 });
    expect(result.easeFactor).toBeLessThan(defaults.easeFactor);
  });

  it("grade 2: ease factor decreases slightly", () => {
    const result = calculateSM2({ ...defaults, grade: 2 });
    expect(result.easeFactor).toBeLessThan(defaults.easeFactor);
  });

  // ── Grade >= 3: advance ───────────────────────────────────
  it("grade 3 on first rep: interval = 1, repetitions = 1", () => {
    const result = calculateSM2({ ...defaults, repetitions: 0, grade: 3 });
    expect(result.intervalDays).toBe(1);
    expect(result.repetitions).toBe(1);
  });

  it("grade 4 on first rep: interval = 1, repetitions = 1", () => {
    const result = calculateSM2({ ...defaults, repetitions: 0, grade: 4 });
    expect(result.intervalDays).toBe(1);
    expect(result.repetitions).toBe(1);
  });

  it("grade 3 on second rep: interval = 6, repetitions = 2", () => {
    const result = calculateSM2({ ...defaults, repetitions: 1, intervalDays: 1, grade: 3 });
    expect(result.intervalDays).toBe(6);
    expect(result.repetitions).toBe(2);
  });

  it("grade 4 on third+ rep: interval = round(prev * EF), repetitions increments", () => {
    const ef = 2.5;
    const prevInterval = 6;
    const result = calculateSM2({
      easeFactor: ef,
      intervalDays: prevInterval,
      repetitions: 2,
      grade: 4,
    });
    const expectedInterval = Math.round(prevInterval * result.easeFactor);
    expect(result.intervalDays).toBe(expectedInterval);
    expect(result.repetitions).toBe(3);
  });

  // ── Ease factor clamp ─────────────────────────────────────
  it("ease factor never drops below 1.3", () => {
    // Simulate many grade 1s from a low EF
    let ef = 1.3;
    for (let i = 0; i < 5; i++) {
      const result = calculateSM2({ easeFactor: ef, intervalDays: 1, repetitions: 0, grade: 1 });
      ef = result.easeFactor;
      expect(ef).toBeGreaterThanOrEqual(1.3);
    }
  });

  it("grade 4: ease factor increases", () => {
    const result = calculateSM2({ ...defaults, grade: 4 });
    expect(result.easeFactor).toBeGreaterThan(defaults.easeFactor);
  });

  it("grade 3: ease factor stays approximately the same (small decrease)", () => {
    const result = calculateSM2({ ...defaults, grade: 3 });
    // grade 3: 0.1 - (4-3)*(0.08+(4-3)*0.02) = 0.1 - 0.1 = 0 → no change
    expect(result.easeFactor).toBeCloseTo(defaults.easeFactor, 5);
  });

  // ── nextReviewAt ──────────────────────────────────────────
  it("nextReviewAt is a Date instance", () => {
    const result = calculateSM2({ ...defaults, grade: 3 });
    expect(result.nextReviewAt).toBeInstanceOf(Date);
  });

  it("nextReviewAt is in the future for interval >= 1", () => {
    const before = Date.now();
    const result = calculateSM2({ ...defaults, grade: 3 });
    expect(result.nextReviewAt.getTime()).toBeGreaterThan(before);
  });

  it("nextReviewAt approx equals Date.now() + intervalDays * 86400000", () => {
    const result = calculateSM2({ ...defaults, grade: 4 });
    const expected = Date.now() + result.intervalDays * 24 * 60 * 60 * 1000;
    expect(Math.abs(result.nextReviewAt.getTime() - expected)).toBeLessThan(1000);
  });

  // ── Reset after incorrect then correct ────────────────────
  it("after grade 1 reset, next grade 3 restarts from rep=0 → interval=1", () => {
    const after1 = calculateSM2({ ...defaults, grade: 1 });
    const after3 = calculateSM2({
      easeFactor: after1.easeFactor,
      intervalDays: after1.intervalDays,
      repetitions: after1.repetitions,
      grade: 3,
    });
    expect(after3.intervalDays).toBe(1);
    expect(after3.repetitions).toBe(1);
  });

  // ── SM2_DEFAULTS values ───────────────────────────────────
  it("SM2_DEFAULTS has expected initial values", () => {
    expect(SM2_DEFAULTS.easeFactor).toBe(2.5);
    expect(SM2_DEFAULTS.intervalDays).toBe(0);
    expect(SM2_DEFAULTS.repetitions).toBe(0);
  });
});
