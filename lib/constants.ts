import { ExpenseCategory } from "@/types/expense";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Transport",
  "Utilities",
  "Health",
  "Entertainment",
  "Education",
  "Shopping",
  "Other",
];

export const PAGE_SIZE = 10;

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: "#10b981",
  Transport: "#3b82f6",
  Utilities: "#f59e0b",
  Health: "#ef4444",
  Entertainment: "#8b5cf6",
  Education: "#06b6d4",
  Shopping: "#ec4899",
  Other: "#64748b",
};

export const EMPTY_CATEGORY_BREAKDOWN: Record<ExpenseCategory, number> = {
  Food: 0,
  Transport: 0,
  Utilities: 0,
  Health: 0,
  Entertainment: 0,
  Education: 0,
  Shopping: 0,
  Other: 0,
};
