
import { useMemo } from "react";
import { isIncomeCategory } from "../utils/categoryTypeUtils";
import type { Category } from "./CategoryEditor";

type Args = {
  transactions: any[];
  categories: Category[];
  selectedYear: string;
  selectedMonth: string;
  incomeCategories: Category[];
  expenseCategories: Category[];
  filteredTransactions: any[];
};

export function useSummaryStats({
  transactions,
  categories,
  selectedYear,
  selectedMonth,
  incomeCategories,
  expenseCategories,
  filteredTransactions
}: Args) {
  function groupByMonth(transactions: any[]) {
    return transactions.reduce((acc: any, txn) => {
      if (!txn.date) return acc;
      const month = txn.date.slice(0, 7); // yyyy-mm
      acc[month] = acc[month] || [];
      acc[month].push(txn);
      return acc;
    }, {});
  }

  function total(transactions: any[], incomeCats: Category[], expenseCats: Category[]) {
    let income = 0, expense = 0;
    for (const txn of transactions) {
      if (!txn.amount || !txn.category) continue;
      if (isIncomeCategory(txn.category, incomeCats)) {
        income += Math.abs(txn.amount);
      } else {
        expense += Math.abs(txn.amount);
      }
    }
    return { income, expense, net: income - expense };
  }

  const byMonth = useMemo(() => groupByMonth(transactions), [transactions]);
  const allMonths = useMemo(() => Object.keys(byMonth).sort(), [byMonth]);
  const lastMonthKey = allMonths[allMonths.length - 1];
  const prevMonthKey = allMonths[allMonths.length - 2];

  const byMonthFiltered = useMemo(() => groupByMonth(filteredTransactions), [filteredTransactions]);
  const filteredMonthKeys = Object.keys(byMonthFiltered).sort();
  const filteredLastMonthKey = filteredMonthKeys[filteredMonthKeys.length - 1];
  const filteredPrevMonthKey = filteredMonthKeys[filteredMonthKeys.length - 2];

  const thisMonthTxns =
    filteredLastMonthKey && byMonthFiltered[filteredLastMonthKey]?.length
      ? byMonthFiltered[filteredLastMonthKey]
      : lastMonthKey
      ? byMonth[lastMonthKey]
      : [];
  const prevMonthTxns =
    filteredPrevMonthKey && byMonthFiltered[filteredPrevMonthKey]?.length
      ? byMonthFiltered[filteredPrevMonthKey]
      : prevMonthKey
      ? byMonth[prevMonthKey]
      : [];

  const thisMonthYear = filteredLastMonthKey || lastMonthKey || "";
  let thisYearNum = 0,
    thisMonthNum = 0;
  if (thisMonthYear) {
    [thisYearNum, thisMonthNum] = thisMonthYear.split("-").map(Number);
  }
  const sameMonthLastYearKey =
    thisYearNum && thisMonthNum
      ? `${thisYearNum - 1}-${String(thisMonthNum).padStart(2, "0")}`
      : null;
  const sameMonthLastYearTxns =
    sameMonthLastYearKey && byMonth[sameMonthLastYearKey]
      ? byMonth[sameMonthLastYearKey]
      : [];

  const thisTotals = total(thisMonthTxns, incomeCategories, expenseCategories);
  const prevTotals = total(prevMonthTxns, incomeCategories, expenseCategories);
  const lastYearTotals = total(sameMonthLastYearTxns, incomeCategories, expenseCategories);

  // Deltas: All three metrics
  const percentDelta = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0);
  const incomeDeltaMoM = percentDelta(thisTotals.income, prevTotals.income);
  const expenseDeltaMoM = percentDelta(thisTotals.expense, prevTotals.expense);
  const netDeltaMoM = percentDelta(thisTotals.net, prevTotals.net);

  const incomeDeltaYoY = percentDelta(thisTotals.income, lastYearTotals.income);
  const expenseDeltaYoY = percentDelta(thisTotals.expense, lastYearTotals.expense);
  const netDeltaYoY = percentDelta(thisTotals.net, lastYearTotals.net);

  return {
    thisMonthYear,
    thisMonthTxns,
    prevMonthTxns,
    sameMonthLastYearKey,
    sameMonthLastYearTxns,
    thisTotals,
    prevTotals,
    lastYearTotals,
    incomeDeltaMoM,
    expenseDeltaMoM,
    netDeltaMoM,
    incomeDeltaYoY,
    expenseDeltaYoY,
    netDeltaYoY,
  };
}
