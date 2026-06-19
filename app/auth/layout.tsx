import { ReactNode } from "react";
import { Wallet } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center page-gradient p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-64 w-64 rounded-full bg-[var(--accent-muted)] blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-[var(--accent-muted)] blur-3xl" />
      </div>

      <div className="relative w-full max-w-[420px] animate-slide-up">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-muted)] ring-1 ring-[var(--accent)]/20">
            <Wallet className="h-7 w-7 text-[var(--accent)]" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Expense Tracker
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Track spending with clarity and real-time sync
          </p>
        </div>
        <div className="surface rounded-2xl p-6 shadow-2xl sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
