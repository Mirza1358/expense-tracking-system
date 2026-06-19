"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MonthlySummary, Expense } from "@/types/expense";
import {
  computeMonthlySummaryFromExpenses,
  formatCurrency,
  getLast12MonthKeys,
} from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface MonthlyTrendChartProps {
  summaries: MonthlySummary[];
  expenses: Expense[];
  loading?: boolean;
}

const tooltipStyle = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  color: "var(--text-primary)",
  fontSize: "12px",
};

export function MonthlyTrendChart({
  summaries,
  expenses,
  loading,
}: MonthlyTrendChartProps) {
  const monthKeys = getLast12MonthKeys();
  const summaryMap = new Map(summaries.map((s) => [s.month, s]));

  const data = monthKeys.map((month) => {
    const fromCloud = summaryMap.get(month);
    const summary =
      fromCloud && fromCloud.transactionCount > 0
        ? fromCloud
        : computeMonthlySummaryFromExpenses(month, expenses);

    return {
      month: month.slice(5),
      fullMonth: month,
      total: summary.totalSpent,
    };
  });

  const yearTotal = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <Card padding={false}>
      <div className="flex flex-col gap-1 border-b border-[var(--border)] px-5 py-4 sm:flex-row sm:items-end sm:justify-between lg:px-6">
        <div>
          <CardTitle>12-month spending trend</CardTitle>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Rolling monthly totals for the last 12 months
          </p>
        </div>
        {!loading && (
          <p className="font-mono text-lg font-semibold tabular-nums text-[var(--text-primary)]">
            {formatCurrency(yearTotal)}{" "}
            <span className="text-xs font-normal text-[var(--text-secondary)]">
              last 12 mo.
            </span>
          </p>
        )}
      </div>

      {loading ? (
        <div className="space-y-3 p-5 lg:p-6">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <div className="p-2 pb-4 sm:p-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={72}
                domain={[0, "auto"]}
                tickFormatter={(v) => formatCurrency(Number(v))}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) =>
                  [formatCurrency(Number(value ?? 0)), "Spent"]
                }
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.fullMonth ?? ""
                }
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="var(--accent)"
                strokeWidth={2.5}
                dot={{ fill: "var(--accent)", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "var(--accent)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
