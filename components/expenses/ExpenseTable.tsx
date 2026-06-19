"use client";

import { Expense, SortDirection, SortField } from "@/types/expense";
import { CATEGORY_COLORS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pencil, Trash2 } from "lucide-react";

interface ExpenseTableProps {
  expenses: Expense[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

function SortHeader({
  label,
  field,
  sortField,
  sortDirection,
  onSort,
}: {
  label: string;
  field: SortField;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}) {
  const active = sortField === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
    >
      {label}
      {active && (
        <span className="text-[var(--accent)]">
          {sortDirection === "asc" ? "↑" : "↓"}
        </span>
      )}
    </button>
  );
}

export function ExpenseTable({
  expenses,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
}: ExpenseTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--surface-raised)]">
            <tr>
              <th className="px-4 py-3 text-left">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Title
                </span>
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader
                  label="Amount"
                  field="amount"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader
                  label="Category"
                  field="category"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader
                  label="Date"
                  field="date"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
              </th>
              <th className="px-4 py-3 text-right">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                className="group transition-colors hover:bg-[var(--surface-raised)]/60"
              >
                <td className="px-4 py-3.5">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">
                      {expense.title}
                    </p>
                    {expense.note && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-[var(--text-secondary)]">
                        {expense.note}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5 font-mono text-base font-semibold tabular-nums text-[var(--text-primary)]">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-4 py-3.5">
                  <Badge
                    variant="category"
                    color={CATEGORY_COLORS[expense.category]}
                  >
                    {expense.category}
                  </Badge>
                </td>
                <td className="px-4 py-3.5 font-mono text-xs tabular-nums text-[var(--text-secondary)]">
                  {formatDate(expense.date)}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 px-0"
                      onClick={() => onEdit(expense)}
                      aria-label="Edit expense"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 px-0 text-[var(--danger)] hover:text-[var(--danger)]"
                      onClick={() => onDelete(expense)}
                      aria-label="Delete expense"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
