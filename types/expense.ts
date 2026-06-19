export type ExpenseCategory = 
  | "Food"
  | "Transport"
  | "Utilities"
  | "Health"
  | "Entertainment"
  | "Education"
  | "Shopping"
  | "Other";

export interface ExpenseInput {
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note?: string;
  receiptURL?: string;
}

export interface Expense extends ExpenseInput {
  id: string;
  uid: string;
  createdAt: string;
}

export interface MonthlySummary {
  month: string;
  totalSpent: number;
  transactionCount: number;
  dailyAverage: number;
  categoryBreakdown: Record<string, number>;
  highestCategory: ExpenseCategory;
  updatedAt: string;
}

export interface ExpenseFilters {
  search: string;
  category: ExpenseCategory | "All";
  dateFrom: string;
  dateTo: string;
}

export type SortField = "date" | "amount" | "title" | "category";
export type SortDirection = "asc" | "desc";
