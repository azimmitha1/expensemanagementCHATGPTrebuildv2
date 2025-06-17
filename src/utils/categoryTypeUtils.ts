
import type { Category } from "@/components/CategoryEditor";

export const DEFAULT_INCOME_CATEGORIES = [
  "Salary", "Interest", "Sales Income", "Investment", "Other Income"
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Groceries", "Rent", "Utilities", "Dining Out", "Transport",
  "Shopping", "Entertainment", "Medical", "Other Expense"
];

// Usage: accepts either new Category object or string fallback.
export function getCategoryType(cat: string | Category): "income" | "expense" {
  if (!cat) return "expense";
  if (typeof cat === "string") {
    if (DEFAULT_INCOME_CATEGORIES.map(x => x.toLowerCase()).includes(cat.toLowerCase())) return "income";
    return "expense";
  }
  return cat.type;
}

/** Allows merging custom user categories (future expansion) */
export function isIncomeCategory(cat: string | Category, incomeCats: (string|Category)[]): boolean {
  // Support Category objects or names
  const name = typeof cat === "string" ? cat : cat.name;
  if (typeof incomeCats[0] === "string") {
    return (incomeCats as string[]).map(x => x.toLowerCase()).includes(name.toLowerCase());
  }
  return (incomeCats as Category[]).some((c) => c.name.toLowerCase() === name.toLowerCase() && c.type === "income");
}
