"use client";

import { TrendingUp, Calendar, Tag, Hash } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

interface SummaryCardsProps {
  totalSpent: number;
  dailyAverage: number;
  highestCategory: string;
  transactionCount: number;
  loading?: boolean;
  subtitle?: string;
}

export function SummaryCards({
  totalSpent,
  dailyAverage,
  highestCategory,
  transactionCount,
  loading,
  subtitle = "This month",
}: SummaryCardsProps) {
  const cards = [
    {
      label: "Total spent",
      sub: subtitle,
      value: formatCurrency(totalSpent),
      icon: TrendingUp,
      highlight: true,
    },
    {
      label: "Daily average",
      sub: subtitle,
      value: formatCurrency(dailyAverage),
      icon: Calendar,
    },
    {
      label: "Top category",
      sub: subtitle,
      value: transactionCount > 0 ? highestCategory : "—",
      icon: Tag,
    },
    {
      label: "Transactions",
      sub: subtitle,
      value: transactionCount.toString(),
      icon: Hash,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.label}
            className={`relative overflow-hidden ${card.highlight ? "ring-1 ring-[var(--accent)]/20" : ""}`}
          >
            {card.highlight && (
              <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 translate-x-4 -translate-y-4 rounded-full bg-[var(--accent-muted)] blur-2xl" />
            )}
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  {card.label}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                  {card.sub}
                </p>
                <p
                  className={`mt-2 font-mono text-2xl font-semibold tabular-nums text-[var(--text-primary)] ${loading ? "animate-pulse opacity-50" : ""}`}
                >
                  {loading ? "—" : card.value}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-raised)]">
                <Icon className="h-5 w-5 text-[var(--accent)]" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
