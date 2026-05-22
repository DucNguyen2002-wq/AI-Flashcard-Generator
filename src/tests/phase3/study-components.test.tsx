import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FlashcardCard } from "@/components/study/flashcard-card";
import { NoCardsState } from "@/components/study/no-cards-state";
import { SessionComplete } from "@/components/study/session-complete";
import type { StudyCard } from "@/types";

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

// ─── Sample Data ──────────────────────────────────────────────
const sampleCard: StudyCard = {
  id: "card-001",
  deck_id: "deck-001",
  question: "What is React?",
  answer: "A JavaScript library for building UIs",
  created_at: "2024-01-01T00:00:00Z",
  progress: null,
};

// ─── FlashcardCard ────────────────────────────────────────────
describe("FlashcardCard component (Phase 3)", () => {
  it("renders 'CÂU HỎI' badge on front face", () => {
    render(<FlashcardCard card={sampleCard} isFlipped={false} onFlip={vi.fn()} />);
    expect(screen.getByText("CÂU HỎI")).toBeInTheDocument();
  });

  it("renders the question text", () => {
    render(<FlashcardCard card={sampleCard} isFlipped={false} onFlip={vi.fn()} />);
    expect(screen.getByText("What is React?")).toBeInTheDocument();
  });

  it("renders 'TRẢ LỜI' badge on back face", () => {
    render(<FlashcardCard card={sampleCard} isFlipped={true} onFlip={vi.fn()} />);
    expect(screen.getByText("TRẢ LỜI")).toBeInTheDocument();
  });

  it("renders answer text (back is always in DOM)", () => {
    render(<FlashcardCard card={sampleCard} isFlipped={false} onFlip={vi.fn()} />);
    // Answer is always rendered (hidden by CSS transform, not by conditional rendering)
    expect(screen.getByText("A JavaScript library for building UIs")).toBeInTheDocument();
  });

  it("calls onFlip when card is clicked", async () => {
    const onFlip = vi.fn();
    const { container } = render(
      <FlashcardCard card={sampleCard} isFlipped={false} onFlip={onFlip} />
    );
    const card = container.querySelector(".relative.h-64") as HTMLElement;
    card.click();
    expect(onFlip).toHaveBeenCalledOnce();
  });
});

// ─── NoCardsState ─────────────────────────────────────────────
describe("NoCardsState component (Phase 3)", () => {
  it("renders completion heading", () => {
    render(<NoCardsState deckId="deck-001" nextReviewAt={null} />);
    expect(screen.getByText("Đã ôn xong tất cả thẻ hôm nay!")).toBeInTheDocument();
  });

  it("renders fallback text when nextReviewAt is null", () => {
    render(<NoCardsState deckId="deck-001" nextReviewAt={null} />);
    expect(screen.getByText(/Chưa có thẻ nào/)).toBeInTheDocument();
  });

  it("renders next review date when provided", () => {
    render(<NoCardsState deckId="deck-001" nextReviewAt="2024-03-20T10:00:00Z" />);
    expect(screen.getByText(/20\/03\/2024/)).toBeInTheDocument();
  });

  it("renders link back to deck page", () => {
    render(<NoCardsState deckId="deck-001" nextReviewAt={null} />);
    const link = document.querySelector(`a[href="/dashboard/decks/deck-001"]`);
    expect(link).not.toBeNull();
  });
});

// ─── SessionComplete ──────────────────────────────────────────
describe("SessionComplete component (Phase 3)", () => {
  it("renders 'Hoàn thành buổi học!' heading", () => {
    render(<SessionComplete correct={8} total={10} durationMs={60000} deckId="deck-001" />);
    expect(screen.getByText("Hoàn thành buổi học!")).toBeInTheDocument();
  });

  it("displays correct count", () => {
    render(<SessionComplete correct={7} total={10} durationMs={30000} deckId="deck-001" />);
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("displays poor (total - correct) count", () => {
    render(<SessionComplete correct={7} total={10} durationMs={30000} deckId="deck-001" />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("displays percentage", () => {
    render(<SessionComplete correct={8} total={10} durationMs={30000} deckId="deck-001" />);
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("shows 100% motivational text for perfect score", () => {
    render(<SessionComplete correct={10} total={10} durationMs={30000} deckId="deck-001" />);
    expect(screen.getByText(/Xuất sắc/)).toBeInTheDocument();
  });

  it("shows >=80% motivational text", () => {
    render(<SessionComplete correct={9} total={10} durationMs={30000} deckId="deck-001" />);
    expect(screen.getByText(/Rất tốt/)).toBeInTheDocument();
  });

  it("shows >=60% motivational text", () => {
    render(<SessionComplete correct={6} total={10} durationMs={30000} deckId="deck-001" />);
    expect(screen.getByText(/Khá tốt/)).toBeInTheDocument();
  });

  it("shows <60% motivational text", () => {
    render(<SessionComplete correct={5} total={10} durationMs={30000} deckId="deck-001" />);
    expect(screen.getByText(/luyện tập/)).toBeInTheDocument();
  });

  it("renders duration in seconds for < 1 minute", () => {
    render(<SessionComplete correct={5} total={10} durationMs={45000} deckId="deck-001" />);
    expect(screen.getByText(/45 giây/)).toBeInTheDocument();
  });

  it("renders duration in minutes for >= 1 minute", () => {
    render(<SessionComplete correct={5} total={10} durationMs={90000} deckId="deck-001" />);
    expect(screen.getByText(/1 phút 30 giây/)).toBeInTheDocument();
  });

  it("renders 'Học lại' link to study page", () => {
    render(<SessionComplete correct={5} total={10} durationMs={30000} deckId="deck-abc" />);
    const link = document.querySelector(`a[href="/dashboard/decks/deck-abc/study"]`);
    expect(link).not.toBeNull();
    expect(link?.textContent).toMatch(/Học lại/);
  });

  it("renders 'Quay về bộ thẻ' link to deck page", () => {
    render(<SessionComplete correct={5} total={10} durationMs={30000} deckId="deck-abc" />);
    const link = document.querySelector(`a[href="/dashboard/decks/deck-abc"]`);
    expect(link).not.toBeNull();
    expect(link?.textContent).toMatch(/Quay về/);
  });
});
