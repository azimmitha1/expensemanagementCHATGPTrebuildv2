
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from "./categoryTypeUtils";

const months = [
  "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"
];
const years = ["2020", "2021", "2022", "2023", "2024", "2025"];
const expenseCats = [
  "Groceries", "Rent", "Utilities", "Dining Out", "Transport", "Shopping", "Entertainment", "Medical", "Other"
];
const incomeCats = [
  "Salary", "Interest", "Sales Income", "Investment", "Other Income"
];

export function generateDemoTransactions() {
  const transactions: {
    date: string;
    description: string;
    amount: number;
    category: string;
  }[] = [];
  years.forEach((year) => {
    months.forEach((month, mi) => {
      // Only fill up to June in 2025 (i.e., break after month=06 in 2025)
      if (year === "2025" && Number(month) > 6) return;
      const dayExpense = String((mi % 27) + 1).padStart(2, "0");
      const dayIncome = String(((mi + 5) % 27) + 1).padStart(2, "0");
      // Expense transaction
      transactions.push({
        date: `${year}-${month}-${dayExpense}`,
        description: `${year} ${expenseCats[mi % expenseCats.length]}`,
        amount: -Math.round((Math.random() * 450 + 50) * 100) / 100,
        category: expenseCats[mi % expenseCats.length]
      });
      // Income transaction
      transactions.push({
        date: `${year}-${month}-${dayIncome}`,
        description: `${year} ${incomeCats[mi % incomeCats.length]}`,
        amount: Math.round((Math.random() * 3000 + 300) * 100) / 100,
        category: incomeCats[mi % incomeCats.length]
      });
    });
  });
  return transactions;
}

export const DEFAULT_INCOME_CATEGORIES_DEEP = [...DEFAULT_INCOME_CATEGORIES];
export const DEFAULT_EXPENSE_CATEGORIES_DEEP = [...DEFAULT_EXPENSE_CATEGORIES];

