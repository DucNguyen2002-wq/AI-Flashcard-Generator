import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StudyChart } from "@/components/dashboard/study-chart";
import { CardStatusChart } from "@/components/dashboard/card-status-chart";
import type { DailyStudyStat, CardStatusStats } from "@/actions/stats.actions";

// ─── Mock Recharts ─────────────────────────────────────────────
// Recharts uses SVG APIs unavailable in jsdom — replace with simple divs.
vi.mock("recharts", () => ({
  ResponsiveContainer: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => null,
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Cell: () => null,
  Legend: () => <div data-testid="legend" />,
}));

// Mock date-fns locale (not used in render, but imported)
vi.mock("date-fns/locale", () => ({ vi: {} }));

// ─── Fixtures ──────────────────────────────────────────────────
const EMPTY_DAILY: DailyStudyStat[] = Array.from({ length: 7 }, (_, i) => ({
  date: `2026-05-${String(16 + i).padStart(2, "0")}`,
  count: 0,
}));

const ACTIVE_DAILY: DailyStudyStat[] = [
  { date: "2026-05-16", count: 0 },
  { date: "2026-05-17", count: 2 },
  { date: "2026-05-18", count: 5 },
  { date: "2026-05-19", count: 1 },
  { date: "2026-05-20", count: 3 },
  { date: "2026-05-21", count: 0 },
  { date: "2026-05-22", count: 4 },
];

const EMPTY_STATUS: CardStatusStats = {
  new: 0,
  learning: 0,
  review: 0,
  mastered: 0,
};

const ACTIVE_STATUS: CardStatusStats = {
  new: 5,
  learning: 3,
  review: 2,
  mastered: 1,
};

// ─── StudyChart ────────────────────────────────────────────────
describe("StudyChart component (Phase 4)", () => {
  it("shows empty state message when all counts are zero", () => {
    render(<StudyChart data={EMPTY_DAILY} />);
    expect(
      screen.getByText(/Chưa có dữ liệu học tập/),
    ).toBeInTheDocument();
  });

  it("does not show empty state when data has non-zero values", () => {
    render(<StudyChart data={ACTIVE_DAILY} />);
    expect(
      screen.queryByText(/Chưa có dữ liệu học tập/),
    ).not.toBeInTheDocument();
  });

  it("renders ResponsiveContainer and AreaChart when data exists", () => {
    render(<StudyChart data={ACTIVE_DAILY} />);
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
  });

  it("renders Area element inside the chart", () => {
    render(<StudyChart data={ACTIVE_DAILY} />);
    expect(screen.getByTestId("area")).toBeInTheDocument();
  });

  it("does not render chart container in empty state", () => {
    render(<StudyChart data={EMPTY_DAILY} />);
    expect(
      screen.queryByTestId("responsive-container"),
    ).not.toBeInTheDocument();
  });
});

// ─── CardStatusChart ───────────────────────────────────────────
describe("CardStatusChart component (Phase 4)", () => {
  it("shows empty state message when total is zero", () => {
    render(<CardStatusChart data={EMPTY_STATUS} />);
    expect(screen.getByText(/Chưa có thẻ nào/)).toBeInTheDocument();
  });

  it("does not show empty state when data exists", () => {
    render(<CardStatusChart data={ACTIVE_STATUS} />);
    expect(screen.queryByText(/Chưa có thẻ nào/)).not.toBeInTheDocument();
  });

  it("renders PieChart container when data exists", () => {
    render(<CardStatusChart data={ACTIVE_STATUS} />);
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });

  it("displays total card count in center label", () => {
    render(<CardStatusChart data={ACTIVE_STATUS} />);
    // total = 5 + 3 + 2 + 1 = 11
    expect(screen.getByText("11")).toBeInTheDocument();
  });

  it("displays 'tổng thẻ' label below total count", () => {
    render(<CardStatusChart data={ACTIVE_STATUS} />);
    expect(screen.getByText("tổng thẻ")).toBeInTheDocument();
  });

  it("renders Legend when data exists", () => {
    render(<CardStatusChart data={ACTIVE_STATUS} />);
    expect(screen.getByTestId("legend")).toBeInTheDocument();
  });

  it("does not render PieChart in empty state", () => {
    render(<CardStatusChart data={EMPTY_STATUS} />);
    expect(screen.queryByTestId("pie-chart")).not.toBeInTheDocument();
  });
});
