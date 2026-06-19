"use client";

import { useMemo, useState } from "react";
import { format, parseISO, subDays, startOfMonth, endOfMonth } from "date-fns";
import Papa from "papaparse";
import { CalendarRange, Download, TrendingUp } from "lucide-react";
import { showError, showSuccess } from "@/lib/toast";
import { useExpenses } from "@/hooks/useExpenses";
import { useSummaries } from "@/hooks/useSummaries";
import {
  aggregateExpenses,
  computeMonthlySummaryFromExpenses,
  filterExpenses,
  formatCurrency,
  formatDate,
  getCurrentMonthKey,
  getDefaultDateRange,
} from "@/lib/utils";
import { EMPTY_CATEGORY_BREAKDOWN } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { SummaryCards } from "@/components/charts/SummaryCards";
import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";
import { CategoryPieChart } from "@/components/charts/CategoryPieChart";
import { CategoryBarChart } from "@/components/charts/CategoryBarChart";

type DatePreset = "this-month" | "last-30" | "last-90" | "custom";

function getPresetRange(preset: DatePreset) {
  const now = new Date();
  if (preset === "this-month") {
    return {
      from: format(startOfMonth(now), "yyyy-MM-dd"),
      to: format(endOfMonth(now), "yyyy-MM-dd"),
    };
  }
  if (preset === "last-30") {
    return {
      from: format(subDays(now, 30), "yyyy-MM-dd"),
      to: format(now, "yyyy-MM-dd"),
    };
  }
  if (preset === "last-90") {
    return {
      from: format(subDays(now, 90), "yyyy-MM-dd"),
      to: format(now, "yyyy-MM-dd"),
    };
  }
  return getDefaultDateRange();
}

export default function AnalyticsPage() {
  const { expenses, loading: expensesLoading } = useExpenses();
  const { summaries, loading: summariesLoading } = useSummaries();
  const defaultRange = getDefaultDateRange();

  const [dateFrom, setDateFrom] = useState(defaultRange.from);
  const [dateTo, setDateTo] = useState(defaultRange.to);
  const [barMonth, setBarMonth] = useState(getCurrentMonthKey());
  const [preset, setPreset] = useState<DatePreset>("this-month");

  const rangeFilters = useMemo(
    () => ({
      search: "",
      category: "All" as const,
      dateFrom,
      dateTo,
    }),
    [dateFrom, dateTo]
  );

  const filteredExpenses = useMemo(
    () => filterExpenses(expenses, rangeFilters),
    [expenses, rangeFilters]
  );

  const rangeAggregated = useMemo(
    () => aggregateExpenses(filteredExpenses),
    [filteredExpenses]
  );

  const currentMonthSummary = useMemo(() => {
    const month = getCurrentMonthKey();
    const fromCloud = summaries.find((s) => s.month === month);
    if (fromCloud) return fromCloud;
    return computeMonthlySummaryFromExpenses(month, expenses);
  }, [summaries, expenses]);

  const barBreakdown = useMemo(() => {
    const fromCloud = summaries.find((s) => s.month === barMonth);
    if (fromCloud) return fromCloud.categoryBreakdown;
    return computeMonthlySummaryFromExpenses(barMonth, expenses)
      .categoryBreakdown;
  }, [summaries, expenses, barMonth]);

  const rangeLabel = `${formatDate(dateFrom)} – ${formatDate(dateTo)}`;

  const applyPreset = (next: DatePreset) => {
    setPreset(next);
    if (next === "custom") return;
    const range = getPresetRange(next);
    setDateFrom(range.from);
    setDateTo(range.to);
  };

  const handleExportCsv = () => {
    if (filteredExpenses.length === 0) {
      showError("No expenses to export in selected range");
      return;
    }

    const csv = Papa.unparse(
      filteredExpenses.map((e) => ({
        Title: e.title,
        Amount: e.amount,
        Currency: "PKR",
        Category: e.category,
        Date: e.date,
        Note: e.note ?? "",
        CreatedAt: e.createdAt,
      }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `expenses_${dateFrom}_${dateTo}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showSuccess(`Exported ${filteredExpenses.length} expenses to CSV`);
  };

  const loading = expensesLoading || summariesLoading;

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            Reports
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Spending insights, trends, and exports
          </p>
        </div>
        <Button variant="secondary" onClick={handleExportCsv}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <SummaryCards
          totalSpent={currentMonthSummary.totalSpent}
          dailyAverage={currentMonthSummary.dailyAverage}
          highestCategory={currentMonthSummary.highestCategory}
          transactionCount={currentMonthSummary.transactionCount}
          subtitle="Current month"
        />
      )}

      <MonthlyTrendChart
        summaries={summaries}
        expenses={expenses}
        loading={expensesLoading}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-[var(--accent)]" />
            <CardTitle>Date range filters</CardTitle>
          </div>
        </CardHeader>

        <div className="mb-5 flex flex-wrap gap-2">
          {(
            [
              ["this-month", "This month"],
              ["last-30", "Last 30 days"],
              ["last-90", "Last 90 days"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
                preset === key
                  ? "bg-[var(--accent-muted)] text-[var(--accent)] ring-1 ring-[var(--accent)]/30"
                  : "bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="analyticsFrom"
            label="From"
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setPreset("custom");
              setDateFrom(e.target.value);
            }}
          />
          <Input
            id="analyticsTo"
            label="To"
            type="date"
            value={dateTo}
            onChange={(e) => {
              setPreset("custom");
              setDateTo(e.target.value);
            }}
          />
        </div>
      </Card>

      {!loading && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="sm:col-span-1">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              Range total
            </p>
            <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-[var(--text-primary)]">
              {formatCurrency(rangeAggregated.totalSpent)}
            </p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {rangeLabel}
            </p>
          </Card>
          <Card>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              Transactions
            </p>
            <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-[var(--text-primary)]">
              {rangeAggregated.transactionCount}
            </p>
          </Card>
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  Top category
                </p>
                <p className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
                  {rangeAggregated.transactionCount > 0
                    ? rangeAggregated.highestCategory
                    : "—"}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
            </div>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryPieChart
          breakdown={
            rangeAggregated.categoryBreakdown ?? EMPTY_CATEGORY_BREAKDOWN
          }
          rangeLabel={rangeLabel}
        />

        <div className="space-y-4">
          <Input
            id="barMonth"
            label="Compare categories by month"
            type="month"
            value={barMonth}
            onChange={(e) => setBarMonth(e.target.value)}
          />
          <CategoryBarChart
            breakdown={barBreakdown}
            monthLabel={format(parseISO(`${barMonth}-01`), "MMMM yyyy")}
          />
        </div>
      </div>
    </div>
  );
}
