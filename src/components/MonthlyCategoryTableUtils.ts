
import { isIncomeCategory } from "../utils/categoryTypeUtils";
import type { Category } from "./CategoryEditor";

// Get short month name
export function getMonthName(monthIdx: number) {
  const date = new Date(2025, monthIdx, 1);
  return date.toLocaleString("default", { month: "short" }); // Jan, Feb, Mar...
}

// Group transactions by category and month
export function groupByCategoryAndMonth(transactions: any[], categories: string[], incomeCats: string[]) {
  const grouped: Record<string, Record<string, {income:number, expense:number, net:number}>> = {};
  for (const cat of categories) {
    grouped[cat] = {};
  }
  for (const txn of transactions) {
    if (!txn.date || typeof txn.amount !== "number") continue;
    const month = txn.date.slice(0, 7); // yyyy-mm
    const cat = txn.category || "Other";
    if (!grouped[cat]) grouped[cat] = {};
    if (!grouped[cat][month]) grouped[cat][month] = { income: 0, expense: 0, net: 0 };
    if (isIncomeCategory(cat, incomeCats))
      grouped[cat][month].income += Math.abs(txn.amount);
    else
      grouped[cat][month].expense += Math.abs(txn.amount);
    grouped[cat][month].net = grouped[cat][month].income - grouped[cat][month].expense;
  }
  return grouped;
}

// Get all unique months in the year present in transactions
export function getAllMonthsInYear(transactions: any[], year: number) {
  const months = new Set<string>();
  for (const txn of transactions) {
    if (!txn.date) continue;
    const [y, m] = txn.date.split("-");
    if (Number(y) === year) {
      months.add(`${y}-${m}`);
    }
  }
  // Ensure all months present Jan–Dec
  for (let i = 1; i <= 12; ++i) {
    const mm = String(i).padStart(2, "0");
    months.add(`${year}-${mm}`);
  }
  return Array.from(months).sort();
}

export function formatCurrency(v: number) {
  return "$" + v.toLocaleString(undefined, { minimumFractionDigits: 2 });
}

