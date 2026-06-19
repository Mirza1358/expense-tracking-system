import { format, parseISO, startOfMonth, endOfMonth, subMonths } from "date-fns";
import {
  Expense,
  ExpenseCategory,
  ExpenseFilters,
  MonthlySummary,
  SortDirection,
  SortField,
} from "@/types/expense";
import { EMPTY_CATEGORY_BREAKDOWN, PAGE_SIZE } from "./constants";

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `Rs. ${formatted}`;
}

export function formatDate(date: string): string {
  return format(parseISO(date), "MMM d, yyyy");
}

export function getMonthKey(date: string): string {
  return format(parseISO(date), "yyyy-MM");
}

export function getLast12MonthKeys(): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i -= 1) {
    keys.push(format(subMonths(now, i), "yyyy-MM"));
  }
  return keys;
}

export function filterExpenses(
  expenses: Expense[],
  filters: ExpenseFilters
): Expense[] {
  return expenses.filter((expense) => {
    if (
      filters.category !== "All" &&
      expense.category !== filters.category
    ) {
      return false;
    }
    if (filters.dateFrom && expense.date < filters.dateFrom) {
      return false;
    }
    if (filters.dateTo && expense.date > filters.dateTo) {
      return false;
    }
    if (filters.search) {
      const term = filters.search.toLowerCase();
      const inTitle = expense.title.toLowerCase().includes(term);
      const inNote = expense.note?.toLowerCase().includes(term);
      if (!inTitle && !inNote) return false;
    }
    return true;
  });
}

export function sortExpenses(
  expenses: Expense[],
  field: SortField,
  direction: SortDirection
): Expense[] {
  const sorted = [...expenses].sort((a, b) => {
    if (field === "amount") return a.amount - b.amount;
    if (field === "category") return a.category.localeCompare(b.category);
    return a.date.localeCompare(b.date);
  });
  return direction === "desc" ? sorted.reverse() : sorted;
}

export function paginateExpenses<T>(items: T[], page: number): T[] {
  const start = (page - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
}

export function aggregateExpenses(expenses: Expense[]) {
  const categoryBreakdown = { ...EMPTY_CATEGORY_BREAKDOWN };
  let totalSpent = 0;

  expenses.forEach((expense) => {
    totalSpent += expense.amount;
    categoryBreakdown[expense.category] += expense.amount;
  });

  const highestCategory = (Object.entries(categoryBreakdown).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] ?? "Other") as ExpenseCategory;

  const daysInRange =
    expenses.length > 0
      ? Math.max(
          1,
          new Set(expenses.map((e) => e.date)).size
        )
      : 1;

  return {
    totalSpent,
    transactionCount: expenses.length,
    dailyAverage: totalSpent / daysInRange,
    categoryBreakdown,
    highestCategory,
  };
}

export function computeMonthlySummaryFromExpenses(
  month: string,
  expenses: Expense[]
): MonthlySummary {
  const monthExpenses = expenses.filter(
    (expense) => getMonthKey(expense.date) === month
  );
  const aggregated = aggregateExpenses(monthExpenses);
  const daysInMonth = parseISO(`${month}-01`).getDate()
    ? endOfMonth(parseISO(`${month}-01`)).getDate()
    : 30;

  return {
    month,
    totalSpent: aggregated.totalSpent,
    transactionCount: aggregated.transactionCount,
    dailyAverage:
      aggregated.transactionCount > 0
        ? aggregated.totalSpent / daysInMonth
        : 0,
    categoryBreakdown: aggregated.categoryBreakdown,
    highestCategory: aggregated.highestCategory,
    updatedAt: new Date().toISOString(),
  };
}

export function getCurrentMonthKey(): string {
  return format(new Date(), "yyyy-MM");
}

export function getDefaultDateRange() {
  const now = new Date();
  return {
    from: format(startOfMonth(now), "yyyy-MM-dd"),
    to: format(endOfMonth(now), "yyyy-MM-dd"),
  };
}

export function exportExpensesToCsv(expenses: Expense[]): string {
  const rows = expenses.map((e) => ({
    Title: e.title,
    Amount: e.amount,
    Category: e.category,
    Date: e.date,
    Note: e.note ?? "",
    ReceiptURL: e.receiptURL ?? "",
    CreatedAt: e.createdAt,
  }));
  return [
    "Title,Amount,Category,Date,Note,ReceiptURL,CreatedAt",
    ...rows.map(
      (row) =>
        `"${row.Title}",${row.Amount},"${row.Category}","${row.Date}","${row.Note}","${row.ReceiptURL}","${row.CreatedAt}"`
    ),
  ].join("\n");
}

export function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
