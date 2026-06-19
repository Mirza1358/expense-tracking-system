import { z } from "zod";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { ExpenseCategory, ExpenseInput } from "@/types/expense";

const categorySchema = z.enum(
  EXPENSE_CATEGORIES as [ExpenseCategory, ...ExpenseCategory[]]
);

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid date",
  });

export const expenseInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be 120 characters or less"),
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .max(1_000_000_000, "Amount is too large"),
  category: categorySchema,
  date: isoDateSchema,
  note: z.string().trim().max(500, "Note must be 500 characters or less").optional(),
  receiptURL: z.string().max(2048).optional(),
});

export const expenseFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be 120 characters or less"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
      message: "Enter an amount greater than 0",
    })
    .refine((val) => Number(val) <= 1_000_000_000, {
      message: "Amount is too large",
    }),
  category: categorySchema,
  date: isoDateSchema,
  note: z.string().trim().max(500).optional(),
});

export const expenseDocumentSchema = z.object({
  uid: z.string().min(1),
  title: z.string().min(1).max(120),
  amount: z.number().positive().max(1_000_000_000),
  category: categorySchema,
  date: isoDateSchema,
  note: z.string().max(500),
  receiptURL: z.string().max(2048),
  createdAt: z.string().min(1),
});

export const monthlySummarySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  totalSpent: z.number().min(0),
  transactionCount: z.number().int().min(0),
  dailyAverage: z.number().min(0),
  categoryBreakdown: z.record(z.string(), z.number()),
  highestCategory: categorySchema,
  updatedAt: z.string(),
});

export type ExpenseFormData = z.infer<typeof expenseFormSchema>;

export function parseExpenseInput(data: ExpenseInput) {
  return expenseInputSchema.parse(data);
}

export function parseExpenseForm(data: unknown): ExpenseInput {
  const form = expenseFormSchema.parse(data);
  return {
    title: form.title,
    amount: Number(form.amount),
    category: form.category,
    date: form.date,
    note: form.note || undefined,
  };
}

export function buildExpenseDocument(
  uid: string,
  data: ExpenseInput,
  createdAt: string
) {
  const parsed = parseExpenseInput(data);
  return expenseDocumentSchema.parse({
    uid,
    title: parsed.title,
    amount: parsed.amount,
    category: parsed.category,
    date: parsed.date,
    note: parsed.note ?? "",
    receiptURL: parsed.receiptURL ?? "",
    createdAt,
  });
}

export function parseExpenseDocument(id: string, data: unknown) {
  const parsed = expenseDocumentSchema.parse(data);
  return {
    id,
    uid: parsed.uid,
    title: parsed.title,
    amount: parsed.amount,
    category: parsed.category,
    date: parsed.date,
    note: parsed.note || undefined,
    receiptURL: parsed.receiptURL || undefined,
    createdAt: parsed.createdAt,
  };
}
