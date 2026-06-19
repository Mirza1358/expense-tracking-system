"use client";

import { useMemo, useState } from "react";
import { Plus, Receipt, TrendingDown } from "lucide-react";
import { Expense, ExpenseFilters, SortDirection, SortField } from "@/types/expense";
import { PAGE_SIZE } from "@/lib/constants";
import {
  aggregateExpenses,
  filterExpenses,
  formatCurrency,
  getCurrentMonthKey,
  paginateExpenses,
  sortExpenses,
} from "@/lib/utils";
import { useExpenses } from "@/hooks/useExpenses";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ExpenseFiltersBar } from "@/components/expenses/ExpenseFilters";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { ExpenseFormModal } from "@/components/expenses/ExpenseFormModal";
import { DeleteConfirmDialog } from "@/components/expenses/DeleteConfirmDialog";

const defaultFilters: ExpenseFilters = {
  search: "",
  category: "All",
  dateFrom: "",
  dateTo: "",
};

export default function ExpensesPage() {
  const { expenses, loading, error } = useExpenses();
  const [filters, setFilters] = useState<ExpenseFilters>(defaultFilters);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const processedExpenses = useMemo(() => {
    const filtered = filterExpenses(expenses, filters);
    return sortExpenses(filtered, sortField, sortDirection);
  }, [expenses, filters, sortField, sortDirection]);

  const monthSummary = useMemo(() => {
    const monthExpenses = expenses.filter(
      (e) => e.date.startsWith(getCurrentMonthKey())
    );
    return aggregateExpenses(monthExpenses);
  }, [expenses]);

  const paginatedExpenses = useMemo(
    () => paginateExpenses(processedExpenses, page),
    [processedExpenses, page]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(processedExpenses.length / PAGE_SIZE)
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            Overview
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Expenses
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {processedExpenses.length} transaction
            {processedExpenses.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <Button onClick={() => { setSelectedExpense(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" />
          New expense
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-[var(--accent-muted)] blur-2xl" />
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            This month
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-[var(--text-primary)]">
            {formatCurrency(monthSummary.totalSpent)}
          </p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {monthSummary.transactionCount} transactions
          </p>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                Top category
              </p>
              <p className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
                {monthSummary.transactionCount > 0
                  ? monthSummary.highestCategory
                  : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-[var(--surface-raised)] p-2.5">
              <TrendingDown className="h-5 w-5 text-[var(--accent)]" />
            </div>
          </div>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            Daily average
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-[var(--text-primary)]">
            {formatCurrency(monthSummary.dailyAverage)}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <ExpenseFiltersBar filters={filters} onChange={setFilters} />
      </Card>

      <Card padding={false}>
        <div className="border-b border-[var(--border)] px-5 py-4 lg:px-6">
          <CardTitle>All expenses ({processedExpenses.length})</CardTitle>
        </div>

        <div className="p-5 lg:p-6">
          {loading && <TableSkeleton />}

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-[var(--danger)]">
              {error}
            </div>
          )}

          {!loading && !error && processedExpenses.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-muted)]">
                <Receipt className="h-8 w-8 text-[var(--accent)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                No expenses yet
              </h3>
              <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
                Add your first expense to start tracking spending in real time.
              </p>
              <Button
                className="mt-6"
                onClick={() => {
                  setSelectedExpense(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add your first expense
              </Button>
            </div>
          )}

          {!loading && paginatedExpenses.length > 0 && (
            <>
              <ExpenseTable
                expenses={paginatedExpenses}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onEdit={(expense) => {
                  setSelectedExpense(expense);
                  setFormOpen(true);
                }}
                onDelete={(expense) => {
                  setSelectedExpense(expense);
                  setDeleteOpen(true);
                }}
              />

              {totalPages > 1 && (
                <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4">
                  <p className="text-xs text-[var(--text-secondary)]">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      <ExpenseFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
      />
    </div>
  );
}
