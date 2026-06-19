"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ExpenseCategory } from "@/types/expense";
import { CATEGORY_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PieChartIcon } from "lucide-react";

interface CategoryPieChartProps {
  breakdown: Record<ExpenseCategory, number>;
  rangeLabel?: string;
}

const tooltipStyle = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  color: "var(--text-primary)",
  fontSize: "12px",
};

export function CategoryPieChart({
  breakdown,
  rangeLabel = "Selected range",
}: CategoryPieChartProps) {
  const data = Object.entries(breakdown)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <Card padding={false}>
        <div className="border-b border-[var(--border)] px-5 py-4 lg:px-6">
          <CardTitle>Category breakdown</CardTitle>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{rangeLabel}</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-raised)]">
            <PieChartIcon className="h-6 w-6 text-[var(--text-secondary)]" />
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            No expenses in this date range
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding={false}>
      <div className="border-b border-[var(--border)] px-5 py-4 lg:px-6">
        <CardTitle>Category breakdown</CardTitle>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {rangeLabel} · {formatCurrency(total)} total
        </p>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-2 lg:p-6">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={88}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={CATEGORY_COLORS[entry.name as ExpenseCategory]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => formatCurrency(Number(value ?? 0))}
            />
          </PieChart>
        </ResponsiveContainer>

        <ul className="flex flex-col justify-center gap-2">
          {data.map((item) => {
            const pct = ((item.value / total) * 100).toFixed(1);
            return (
              <li
                key={item.name}
                className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface-raised)] px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant="category"
                    color={CATEGORY_COLORS[item.name as ExpenseCategory]}
                  >
                    {item.name}
                  </Badge>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {pct}%
                  </span>
                </div>
                <span className="font-mono text-sm font-semibold tabular-nums text-[var(--text-primary)]">
                  {formatCurrency(item.value)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}
