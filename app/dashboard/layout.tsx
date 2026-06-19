"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { showPromise } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Skeleton } from "@/components/ui/Skeleton";
import { UserAvatar } from "@/components/ui/UserAvatar";

const navItems = [
  { href: "/dashboard/expenses", label: "Expenses", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  const handleSignOut = () => {
    showPromise(signOut(), {
      loading: "Signing out...",
      success: "Signed out successfully",
      error: "Failed to sign out",
    }).then(() => router.push("/auth/login"));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center page-gradient">
        <div className="w-full max-w-sm space-y-4 p-8">
          <Skeleton className="mx-auto h-12 w-12 rounded-2xl" />
          <Skeleton className="mx-auto h-4 w-40" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)]">
          <Wallet className="h-5 w-5 text-[var(--accent)]" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
            Expense Tracker
          </p>
          <p className="text-xs text-[var(--text-secondary)]">Real-time sync</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-[var(--surface-raised)] p-3">
          <UserAvatar
            name={user.displayName}
            email={user.email}
            photoURL={user.photoURL}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
              {user.displayName ?? "User"}
            </p>
            <p className="truncate text-xs text-[var(--text-secondary)]">
              {user.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen page-gradient">
      <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-[260px] overflow-y-auto border-r border-[var(--border)] bg-[var(--surface)] lg:block">
        {sidebar}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[280px] border-r border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <button
              className="absolute right-3 top-3 rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen min-w-0 flex-col lg:ml-[260px]">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-[var(--border)] bg-[var(--surface)]/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="font-semibold tracking-tight text-[var(--text-primary)]">
            Expense Tracker
          </p>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-5 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
