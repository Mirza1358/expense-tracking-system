import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Unsubscribe,
} from "firebase/firestore";
import { getClientDb } from "./firebase";
import { Expense, ExpenseInput } from "@/types/expense";
import {
  buildExpenseDocument,
  parseExpenseDocument,
  parseExpenseInput,
} from "./validators/expense";

export function expensesCollectionRef(uid: string) {
  return collection(getClientDb(), "expenses", uid, "items");
}

export function createExpenseId(uid: string): string {
  return doc(expensesCollectionRef(uid)).id;
}

export async function saveExpense(
  uid: string,
  data: ExpenseInput,
  expenseId: string,
  createdAt?: string
): Promise<string> {
  const timestamp = createdAt ?? new Date().toISOString();
  const document = buildExpenseDocument(uid, data, timestamp);
  await setDoc(doc(getClientDb(), "expenses", uid, "items", expenseId), document);
  return expenseId;
}

export async function addExpense(
  uid: string,
  data: ExpenseInput
): Promise<string> {
  const expenseId = createExpenseId(uid);
  return saveExpense(uid, parseExpenseInput(data), expenseId);
}

export async function updateExpense(
  uid: string,
  id: string,
  data: Partial<ExpenseInput>
): Promise<void> {
  const docRef = doc(getClientDb(), "expenses", uid, "items", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    throw new Error("Expense not found");
  }

  const existing = parseExpenseDocument(id, snapshot.data());
  const merged: ExpenseInput = {
    title: data.title ?? existing.title,
    amount: data.amount ?? existing.amount,
    category: data.category ?? existing.category,
    date: data.date ?? existing.date,
    note: data.note !== undefined ? data.note : existing.note,
    receiptURL:
      data.receiptURL !== undefined ? data.receiptURL : existing.receiptURL,
  };

  const document = buildExpenseDocument(uid, merged, existing.createdAt);
  await setDoc(docRef, document);
}

export async function deleteExpense(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(getClientDb(), "expenses", uid, "items", id));
}

export function subscribeToExpenses(
  uid: string,
  onData: (expenses: Expense[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const q = query(expensesCollectionRef(uid), orderBy("date", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const expenses: Expense[] = [];
      snapshot.docs.forEach((document) => {
        try {
          expenses.push(parseExpenseDocument(document.id, document.data()));
        } catch {
          // Skip malformed documents
        }
      });
      onData(expenses);
    },
    (error) => onError(error)
  );
}

export function summariesCollectionRef(uid: string) {
  return collection(getClientDb(), "summaries", uid, "months");
}
