"use client";

import { useState } from "react";
import { Expense } from "@/types/expense";
import { deleteExpense } from "@/lib/firestore";
import { showPromise } from "@/lib/toast";
import { useAuth } from "@/hooks/useAuth";
import { Dialog } from "@/components/ui/Dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
}

export function DeleteConfirmDialog({
  open,
  onClose,
  expense,
}: DeleteConfirmDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user || !expense) return;

    setLoading(true);
    onClose();

    try {
      await showPromise(deleteExpense(user.uid, expense.id), {
        loading: "Deleting expense...",
        success: `"${expense.title}" deleted`,
        error: "Failed to delete expense",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Delete expense"
      description={`"${expense?.title}" will be permanently removed. This cannot be undone.`}
      confirmLabel="Delete expense"
      loading={loading}
      preventClose={loading}
    />
  );
}
