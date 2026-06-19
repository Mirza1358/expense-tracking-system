"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Expense } from "@/types/expense";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import {
  createExpenseId,
  saveExpense,
  updateExpense,
} from "@/lib/firestore";
import { showPromise } from "@/lib/toast";
import {
  expenseFormSchema,
  parseExpenseForm,
  type ExpenseFormData,
} from "@/lib/validators/expense";
import { useAuth } from "@/hooks/useAuth";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Loader2 } from "lucide-react";

interface ExpenseFormModalProps {
  open: boolean;
  onClose: () => void;
  expense?: Expense | null;
}

export function ExpenseFormModal({
  open,
  onClose,
  expense,
}: ExpenseFormModalProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(expense);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: "",
      amount: "",
      category: "Food",
      date: new Date().toISOString().split("T")[0],
      note: "",
    },
  });

  useEffect(() => {
    if (open && expense) {
      reset({
        title: expense.title,
        amount: String(expense.amount),
        category: expense.category,
        date: expense.date,
        note: expense.note ?? "",
      });
    } else if (open && !expense) {
      reset({
        title: "",
        amount: "",
        category: "Food",
        date: new Date().toISOString().split("T")[0],
        note: "",
      });
    }
  }, [open, expense, reset]);

  const onSubmit = async (data: ExpenseFormData) => {
    if (!user) return;

    setSubmitting(true);
    onClose();

    const payload = parseExpenseForm(data);

    const saveOperation = async () => {
      if (isEdit && expense) {
        await updateExpense(user.uid, expense.id, {
          ...payload,
          receiptURL: expense.receiptURL ?? "",
        });
        return expense.id;
      }

      const expenseId = createExpenseId(user.uid);
      await saveExpense(
        user.uid,
        { ...payload, receiptURL: "" },
        expenseId
      );
      return expenseId;
    };

    try {
      await showPromise(saveOperation(), {
        loading: isEdit ? "Updating expense..." : "Saving expense...",
        success: isEdit
          ? "Expense updated successfully"
          : "Expense added successfully",
        error: "Failed to save expense. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit expense" : "New expense"}
      description={
        isEdit
          ? "Update the details below and save."
          : "Track a purchase in seconds."
      }
      size="lg"
      preventClose={submitting}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          id="title"
          label="Title"
          placeholder="Coffee, groceries, fuel..."
          autoFocus
          error={errors.title?.message}
          {...register("title")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="amount"
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register("amount")}
          />
          <Input
            id="date"
            label="Date"
            type="date"
            error={errors.date?.message}
            {...register("date")}
          />
        </div>

        <Select
          id="category"
          label="Category"
          error={errors.category?.message}
          options={EXPENSE_CATEGORIES.map((cat) => ({
            value: cat,
            label: cat,
          }))}
          {...register("category")}
        />

        <Textarea
          id="note"
          label="Note"
          placeholder="Optional details..."
          error={errors.note?.message}
          {...register("note")}
        />

        <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-5">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Add expense"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
