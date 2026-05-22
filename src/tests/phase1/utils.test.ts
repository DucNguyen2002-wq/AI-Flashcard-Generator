import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn() utility", () => {
  it("returns a single class unchanged", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  it("merges multiple classes", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("deduplicates conflicting Tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("filters falsy values", () => {
    expect(cn("base", false && "nope", undefined, null, "end")).toBe(
      "base end",
    );
  });

  it("handles conditional classes with objects", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });

  it("returns empty string for no arguments", () => {
    expect(cn()).toBe("");
  });
});
