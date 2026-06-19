"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ExpenseCategory } from "@/types/expense";
import { CATEGORY_COLORS, EXPENSE_CATEGORIES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/Card";

interface CategoryBarChartProps {
  breakdown: Record<ExpenseCategory, number>;
  monthLabel: string;
}

const tooltipStyle = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  color: "var(--text-primary)",
  fontSize: "12px",
};

export function CategoryBarChart({
  breakdown,
  monthLabel,
}: CategoryBarChartProps) {
  const data = EXPENSE_CATEGORIES.map((category) => ({
    category,
    amount: breakdown[category],
  }));

  const monthTotal = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <Card padding={false}>
      <div className="border-b border-[var(--border)] px-5 py-4 lg:px-6">
        <CardTitle>Category comparison</CardTitle>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {monthLabel} · {formatCurrency(monthTotal)} total
        </p>
      </div>

      {monthTotal === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-[var(--text-secondary)]">
          No spending recorded for this month
        </div>
      ) : (
        <div className="p-2 pb-4 sm:p-4">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="category"
                stroke="var(--text-secondary)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                angle={-35}
                textAnchor="end"
                height={56}
              />
              <YAxis
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={72}
                tickFormatter={(v) => formatCurrency(Number(v))}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) =>
                  [formatCurrency(Number(value ?? 0)), "Spent"]
                }
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {data.map((entry) => (
                  <Cell
                    key={entry.category}
                    fill={CATEGORY_COLORS[entry.category]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
