"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import type { CardStatusStats } from "@/actions/stats.actions";

interface CardStatusChartProps {
  data: CardStatusStats;
}

const COLORS = {
  new: "hsl(220 14% 60%)",
  learning: "hsl(25 95% 55%)",
  review: "hsl(217 91% 55%)",
  mastered: "hsl(142 71% 45%)",
};

const LABELS = {
  new: "Mới",
  learning: "Đang học",
  review: "Ôn tập",
  mastered: "Thành thạo",
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { percent: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  if (!item) return null;
  const pct = ((item.payload?.percent ?? 0) * 100).toFixed(1);
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-sm">
      <p className="font-medium">{item.name}</p>
      <p className="text-muted-foreground">
        {item.value} thẻ ({pct}%)
      </p>
    </div>
  );
}

export function CardStatusChart({ data }: CardStatusChartProps) {
  const total = data.new + data.learning + data.review + data.mastered;

  const chartData = [
    { name: LABELS.new, value: data.new, color: COLORS.new },
    { name: LABELS.learning, value: data.learning, color: COLORS.learning },
    { name: LABELS.review, value: data.review, color: COLORS.review },
    { name: LABELS.mastered, value: data.mastered, color: COLORS.mastered },
  ].filter((d) => d.value > 0);

  if (total === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
        Chưa có thẻ nào
      </div>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-6">
        <span className="text-2xl font-bold">{total}</span>
        <span className="text-xs text-muted-foreground">tổng thẻ</span>
      </div>
    </div>
  );
}
