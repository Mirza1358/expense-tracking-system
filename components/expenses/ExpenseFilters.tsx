"use client";

import { ExpenseFilters } from "@/types/expense";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface ExpenseFiltersBarProps {
  filters: ExpenseFilters;
  onChange: (filters: ExpenseFilters) => void;
}

export function ExpenseFiltersBar({
  filters,
  onChange,
}: ExpenseFiltersBarProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Input
        id="search"
        label="Search"
        placeholder="Search title or note..."
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
      />
      <Select
        id="category"
        label="Category"
        value={filters.category}
        onChange={(e) =>
          onChange({
            ...filters,
            category: e.target.value as ExpenseFilters["category"],
          })
        }
        options={[
          { value: "All", label: "All categories" },
          ...EXPENSE_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
        ]}
      />
      <Input
        id="dateFrom"
        label="From date"
        type="date"
        value={filters.dateFrom}
        onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
      />
      <Input
        id="dateTo"
        label="To date"
        type="date"
        value={filters.dateTo}
        onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
      />
    </div>
  );
}
