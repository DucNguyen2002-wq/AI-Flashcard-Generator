import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentDecks } from "@/components/dashboard/recent-decks";
import type { DeckWithCount } from "@/types";

// StatsCards uses only lucide + shadcn Card — no extra mocks needed.
// RecentDecks uses next/link which is already available in jsdom test env.
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

// ─── StatsCards ───────────────────────────────────────────────
describe("StatsCards component (Phase 2)", () => {
  it("renders 4 stat cards by checking all 4 titles are present", () => {
    render(
      <StatsCards
        totalDecks={3}
        totalFlashcards={42}
        dueToday={5}
        streak={7}
      />,
    );
    expect(screen.getByText("Tổng bộ thẻ")).toBeInTheDocument();
    expect(screen.getByText("Tổng thẻ ghi nhớ")).toBeInTheDocument();
    expect(screen.getByText("Đến hạn hôm nay")).toBeInTheDocument();
    expect(screen.getByText("Chuỗi ngày học")).toBeInTheDocument();
  });

  it("displays correct numeric values", () => {
    render(
      <StatsCards
        totalDecks={3}
        totalFlashcards={42}
        dueToday={5}
        streak={7}
      />,
    );
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("displays Vietnamese labels", () => {
    render(
      <StatsCards totalDecks={0} totalFlashcards={0} dueToday={0} streak={0} />,
    );
    expect(screen.getByText("Tổng bộ thẻ")).toBeInTheDocument();
    expect(screen.getByText("Tổng thẻ ghi nhớ")).toBeInTheDocument();
    expect(screen.getByText("Đến hạn hôm nay")).toBeInTheDocument();
    expect(screen.getByText("Chuỗi ngày học")).toBeInTheDocument();
  });

  it("renders description text for each card", () => {
    render(
      <StatsCards totalDecks={1} totalFlashcards={2} dueToday={3} streak={4} />,
    );
    expect(screen.getByText("Bộ thẻ đã tạo")).toBeInTheDocument();
    expect(screen.getByText("Thẻ trong tất cả bộ")).toBeInTheDocument();
    expect(screen.getByText("Thẻ cần ôn tập")).toBeInTheDocument();
    expect(screen.getByText("Ngày liên tiếp")).toBeInTheDocument();
  });
});

// ─── RecentDecks ──────────────────────────────────────────────
describe("RecentDecks component (Phase 2)", () => {
  it("shows empty state when decks array is empty", () => {
    render(<RecentDecks decks={[]} />);
    expect(screen.getByText("Chưa có bộ thẻ nào")).toBeInTheDocument();
    expect(screen.getByText(/Tạo bộ thẻ đầu tiên/)).toBeInTheDocument();
  });

  it("empty state contains link to /dashboard/decks", () => {
    render(<RecentDecks decks={[]} />);
    const link = screen.getByRole("link", { name: /Tạo bộ thẻ/ });
    expect(link).toHaveAttribute("href", "/dashboard/decks");
  });

  const sampleDecks: DeckWithCount[] = [
    {
      id: "d1",
      user_id: "u1",
      title: "JavaScript Basics",
      description: "Core JS concepts",
      source_file: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      flashcard_count: 20,
      due_count: 3,
    },
    {
      id: "d2",
      user_id: "u1",
      title: "React Hooks",
      description: null,
      source_file: null,
      created_at: "2024-01-02T00:00:00Z",
      updated_at: "2024-01-02T00:00:00Z",
      flashcard_count: 15,
      due_count: 0,
    },
  ];

  it("renders a card for each deck", () => {
    render(<RecentDecks decks={sampleDecks} />);
    expect(screen.getByText("JavaScript Basics")).toBeInTheDocument();
    expect(screen.getByText("React Hooks")).toBeInTheDocument();
  });

  it("displays deck card counts", () => {
    render(<RecentDecks decks={sampleDecks} />);
    expect(screen.getByText("20 thẻ")).toBeInTheDocument();
    expect(screen.getByText("15 thẻ")).toBeInTheDocument();
  });

  it("each deck card links to the correct deck page", () => {
    render(<RecentDecks decks={sampleDecks} />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/dashboard/decks/d1");
    expect(hrefs).toContain("/dashboard/decks/d2");
  });

  it("shows description when present", () => {
    render(<RecentDecks decks={sampleDecks} />);
    expect(screen.getByText("Core JS concepts")).toBeInTheDocument();
  });
});
