"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase";
import { MonthlySummary } from "@/types/expense";
import { EMPTY_CATEGORY_BREAKDOWN } from "@/lib/constants";
import { useAuth } from "./useAuth";

function parseSummary(id: string, data: Record<string, unknown>): MonthlySummary {
  return {
    month: id,
    totalSpent: (data.totalSpent as number) ?? 0,
    transactionCount: (data.transactionCount as number) ?? 0,
    dailyAverage: (data.dailyAverage as number) ?? 0,
    categoryBreakdown:
      (data.categoryBreakdown as MonthlySummary["categoryBreakdown"]) ??
      EMPTY_CATEGORY_BREAKDOWN,
    highestCategory:
      (data.highestCategory as MonthlySummary["highestCategory"]) ?? "Other",
    updatedAt: (data.updatedAt as string) ?? new Date().toISOString(),
  };
}

export function useSummaries() {
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<MonthlySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSummaries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const summariesRef = collection(getClientDb(), "summaries", user.uid, "months");
    const q = query(summariesRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) =>
          parseSummary(doc.id, doc.data() as Record<string, unknown>)
        );
        setSummaries(data.sort((a, b) => a.month.localeCompare(b.month)));
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  return { summaries, loading, error };
}
