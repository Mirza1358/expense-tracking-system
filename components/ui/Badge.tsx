import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "category";
  color?: string;
}

export function Badge({
  children,
  variant = "default",
  color,
}: BadgeProps) {
  if (variant === "category" && color) {
    return (
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
        style={{ backgroundColor: color }}
      >
        {children}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
      {children}
    </span>
  );
}
