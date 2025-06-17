
import type { Category } from "./CategoryEditor";

export function getTotalsPerMonth(months: string[], usedCategories: Category[], grouped: Record<string, Record<string, {income:number, expense:number, net:number}>>) {
  return months.map(mn => {
    let income = 0, expense = 0;
    usedCategories.forEach(cat => {
      const cdata = grouped[cat.name]?.[mn] || { income: 0, expense: 0 };
      if (cat.type === "income") income += cdata.income;
      else expense += cdata.expense;
    });
    return { income, expense, net: income - expense };
  });
}

export function getCategoryTotals(months: string[], usedCategories: Category[], grouped: Record<string, Record<string, {income:number, expense:number, net:number}>>) {
  const categoryTotals: Record<string, { income: number, expense: number, net: number }> = {};
  usedCategories.forEach(cat => {
    let income = 0, expense = 0;
    months.forEach(mn => {
      const v = grouped[cat.name]?.[mn] || { income: 0, expense: 0 };
      if (cat.type === "income") income += v.income;
      else expense += v.expense;
    });
    let netAll = 0;
    months.forEach(mn => {
      const cdata = grouped[cat.name]?.[mn] || { income: 0, expense: 0, net: 0 };
      netAll += cdata.net;
    });
    categoryTotals[cat.name] = { income, expense, net: netAll };
  });
  return categoryTotals;
}

export function getGrandTotals(usedCategories: Category[], categoryTotals: Record<string, { income: number, expense: number, net: number }>) {
  let grandTotalIncome = 0, grandTotalExpense = 0;
  usedCategories.forEach(cat => {
    grandTotalIncome += cat.type === "income" ? categoryTotals[cat.name].income : 0;
    grandTotalExpense += cat.type === "expense" ? categoryTotals[cat.name].expense : 0;
  });
  return {
    grandTotalIncome,
    grandTotalExpense,
    grandTotalNet: grandTotalIncome - grandTotalExpense
  };
}
