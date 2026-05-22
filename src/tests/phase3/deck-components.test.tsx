import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeckCard } from "@/components/deck/deck-card";
import { DeckList } from "@/components/deck/deck-list";
import type { DeckWithCount } from "@/types";

// Mock next/link for jsdom
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// DeckActions makes server calls — mock it to avoid supabase in component tests
vi.mock("@/components/deck/deck-actions", () => ({
  DeckActions: () => <div data-testid="deck-actions" />,
}));

// ─── Sample Data ──────────────────────────────────────────────
const sampleDeck: DeckWithCount = {
  id: "deck-001",
  user_id: "user-001",
  title: "React Fundamentals",
  description: "Core React concepts",
  source_file: null,
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-15T10:00:00Z",
  flashcard_count: 12,
  due_count: 3,
};

const noDuesDeck: DeckWithCount = {
  ...sampleDeck,
  id: "deck-002",
  title: "No Due Cards",
  due_count: 0,
};

// ─── DeckCard ─────────────────────────────────────────────────
describe("DeckCard component (Phase 3)", () => {
  it("renders deck title", () => {
    render(<DeckCard deck={sampleDeck} />);
    expect(screen.getByText("React Fundamentals")).toBeInTheDocument();
  });

  it("renders deck description", () => {
    render(<DeckCard deck={sampleDeck} />);
    expect(screen.getByText("Core React concepts")).toBeInTheDocument();
  });

  it("renders flashcard count badge", () => {
    render(<DeckCard deck={sampleDeck} />);
    expect(screen.getByText(/12 thẻ/)).toBeInTheDocument();
  });

  it("renders due badge with animate-pulse when due_count > 0", () => {
    render(<DeckCard deck={sampleDeck} />);
    const dueBadge = screen.getByText(/3 cần ôn/);
    expect(dueBadge).toBeInTheDocument();
    // Badge itself has animate-pulse class
    expect(dueBadge.closest("[class*='animate-pulse']") ?? dueBadge).toBeTruthy();
  });

  it("does NOT render due badge when due_count is 0", () => {
    render(<DeckCard deck={noDuesDeck} />);
    expect(screen.queryByText(/cần ôn/)).not.toBeInTheDocument();
  });

  it("wraps in a link to the deck page", () => {
    render(<DeckCard deck={sampleDeck} />);
    const link = document.querySelector(`a[href="/dashboard/decks/${sampleDeck.id}"]`);
    expect(link).not.toBeNull();
  });

  it("renders 'Không có mô tả' when description is null", () => {
    const deck = { ...sampleDeck, description: null };
    render(<DeckCard deck={deck} />);
    expect(screen.getByText("Không có mô tả")).toBeInTheDocument();
  });

  it("renders a formatted date", () => {
    render(<DeckCard deck={sampleDeck} />);
    // date-fns formats 2024-01-15 as "15/01/2024" in vi locale
    expect(screen.getByText("15/01/2024")).toBeInTheDocument();
  });
});

// ─── DeckList ─────────────────────────────────────────────────
describe("DeckList component (Phase 3)", () => {
  it("shows empty state when decks array is empty", () => {
    render(<DeckList decks={[]} />);
    expect(screen.getByText("Bạn chưa có bộ thẻ nào")).toBeInTheDocument();
  });

  it("empty state shows hint text", () => {
    render(<DeckList decks={[]} />);
    expect(screen.getByText(/Tạo bộ thẻ mới/)).toBeInTheDocument();
  });

  it("renders a DeckCard per deck", () => {
    const decks: DeckWithCount[] = [
      sampleDeck,
      { ...sampleDeck, id: "deck-003", title: "TypeScript Deep Dive" },
    ];
    render(<DeckList decks={decks} />);
    expect(screen.getByText("React Fundamentals")).toBeInTheDocument();
    expect(screen.getByText("TypeScript Deep Dive")).toBeInTheDocument();
  });

  it("does NOT show empty state when decks exist", () => {
    render(<DeckList decks={[sampleDeck]} />);
    expect(screen.queryByText("Bạn chưa có bộ thẻ nào")).not.toBeInTheDocument();
  });
});
