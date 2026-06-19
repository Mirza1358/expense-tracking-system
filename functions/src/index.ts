import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { setGlobalOptions } from "firebase-functions/v2";

admin.initializeApp();

setGlobalOptions({ maxInstances: 10 });

type ExpenseCategory =
  | "Food"
  | "Transport"
  | "Utilities"
  | "Health"
  | "Entertainment"
  | "Education"
  | "Shopping"
  | "Other";

const CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Transport",
  "Utilities",
  "Health",
  "Entertainment",
  "Education",
  "Shopping",
  "Other",
];

const EMPTY_BREAKDOWN = (): Record<ExpenseCategory, number> =>
  CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = 0;
      return acc;
    },
    {} as Record<ExpenseCategory, number>
  );

function getMonthKey(date: string): string {
  return date.slice(0, 7);
}

function getMonthDateRange(monthKey: string): { start: string; end: string } {
  const [year, month] = monthKey.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return {
    start: `${monthKey}-01`,
    end: `${monthKey}-${String(lastDay).padStart(2, "0")}`,
  };
}

async function recomputeMonthlySummary(
  userId: string,
  monthKey: string
): Promise<void> {
  const db = admin.firestore();
  const { start, end } = getMonthDateRange(monthKey);

  const snapshot = await db
    .collection("expenses")
    .doc(userId)
    .collection("items")
    .where("date", ">=", start)
    .where("date", "<=", end)
    .get();

  const categoryBreakdown = EMPTY_BREAKDOWN();
  let totalSpent = 0;

  snapshot.forEach((doc) => {
    const data = doc.data();
    const amount = (data.amount as number) ?? 0;
    const category = (data.category as ExpenseCategory) ?? "Other";
    totalSpent += amount;
    if (categoryBreakdown[category] !== undefined) {
      categoryBreakdown[category] += amount;
    } else {
      categoryBreakdown.Other += amount;
    }
  });

  const transactionCount = snapshot.size;
  const daysInMonth = parseInt(end.split("-")[2], 10);

  const highestCategory =
    (Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] as
      | ExpenseCategory
      | undefined) ?? "Other";

  await db
    .collection("summaries")
    .doc(userId)
    .collection("months")
    .doc(monthKey)
    .set({
      month: monthKey,
      totalSpent,
      transactionCount,
      dailyAverage:
        transactionCount > 0 ? totalSpent / daysInMonth : 0,
      categoryBreakdown,
      highestCategory,
      updatedAt: new Date().toISOString(),
    });
}

export const aggregateMonthlySummary = onDocumentWritten(
  "expenses/{userId}/items/{expenseId}",
  async (event) => {
    const userId = event.params.userId;
    const monthsToUpdate = new Set<string>();

    const afterData = event.data?.after.data();
    const beforeData = event.data?.before.data();

    if (afterData?.date) {
      monthsToUpdate.add(getMonthKey(afterData.date as string));
    }
    if (beforeData?.date) {
      monthsToUpdate.add(getMonthKey(beforeData.date as string));
    }

    if (monthsToUpdate.size === 0) {
      return;
    }

    await Promise.all(
      Array.from(monthsToUpdate).map((monthKey) =>
        recomputeMonthlySummary(userId, monthKey)
      )
    );
  }
);

export const initUserSchema = functions.auth.user().onCreate(async (user) => {
  const db = admin.firestore();
  const now = new Date().toISOString();
  const batch = db.batch();

  batch.set(db.doc(`users/${user.uid}`), {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    provider: user.providerData[0]?.providerId ?? "password",
    createdAt: now,
    updatedAt: now,
  });

  batch.set(
    db.doc(`expenses/${user.uid}`),
    { ownerId: user.uid, createdAt: now },
    { merge: true }
  );

  batch.set(
    db.doc(`summaries/${user.uid}`),
    { ownerId: user.uid, createdAt: now },
    { merge: true }
  );

  await batch.commit();
});
