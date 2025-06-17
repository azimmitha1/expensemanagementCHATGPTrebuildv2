
import React from "react";
import ExpenseBarChart from "./ExpenseBarChart";
import { ChartBar } from "lucide-react";
import MonthlyCategoryComparisonTable from "./MonthlyCategoryComparisonTable";
import CategoryMonthlyHistoryTable from "./CategoryMonthlyHistoryTable";
import CategoryYTDHistoryTable from "./CategoryYTDHistoryTable";
import SummaryStatsRow from "./SummaryStatsRow";
import CategoryOrderPanel from "./CategoryOrderPanel";
import type { Category } from "./CategoryEditor";
import { useSummaryStats } from "./useSummaryStats";
import { formatCurrency, getMonthString, getDeltaClass } from "./summaryHelpers";

// Helper to get "Cashflow items" category group
function getCashflowCats(categories: Category[], categoryAssignments: Record<string, string>, categoryGroups: string[]) {
  const CASHFLOW_GROUP = "Cashflow items";
  // Find which categories are in cashflow group
  return categories.filter(cat => categoryAssignments[cat.name] === CASHFLOW_GROUP);
}

type Props = {
  transactions: any[];
  categories: Category[];
  incomeCategories: Category[];
  expenseCategories: Category[];
  selectedYear: string;
  selectedMonth: string;
  filteredTransactions: any[];
  categoryOrder: string[];
  moveCategory: (name: string, dir: "up" | "down") => void;
  categoryGroups?: string[];
  categoryAssignments?: Record<string, string>;
  groupOrder?: string[];
  setGroupOrder?: (next: string[]) => void;
  perGroupCategoryOrders?: Record<string, string[]>;
  setPerGroupCategoryOrders?: (next: Record<string, string[]>) => void;
};

const SummaryDashboard: React.FC<Props> = ({
  transactions,
  categories,
  incomeCategories,
  expenseCategories,
  selectedYear,
  selectedMonth,
  filteredTransactions,
  categoryOrder,
  moveCategory,
  categoryGroups = [],
  categoryAssignments = {},
  groupOrder = [],
  setGroupOrder = () => {},
  perGroupCategoryOrders = {},
  setPerGroupCategoryOrders = () => {},
}) => {
  if (!transactions.length)
    return (
      <div className="rounded-lg bg-white border border-muted shadow p-6 min-h-[300px] items-center flex flex-col justify-center">
        <span className="text-xl text-muted-foreground">No data yet</span>
      </div>
    );

  // All categories
  const allCategories =
    Array.isArray(categories) && categories.length
      ? categories
      : [...(incomeCategories || []), ...(expenseCategories || [])];

  const summaryStats = useSummaryStats({
    transactions,
    categories: allCategories,
    selectedYear,
    selectedMonth,
    incomeCategories,
    expenseCategories,
    filteredTransactions,
  });

  // Which categories are "cashflow"? (using same logic as CategoryMonthlyHistoryTable)
  const CASHFLOW_GROUP = "Cashflow items";
  const allGroupNames = categoryGroups && categoryGroups.length
    ? categoryGroups.includes(CASHFLOW_GROUP)
      ? categoryGroups
      : [...categoryGroups, CASHFLOW_GROUP]
    : [CASHFLOW_GROUP];
  const cashflowCats = allCategories.filter(cat => categoryAssignments[cat.name] === CASHFLOW_GROUP);
  const cashflowNamesSet = new Set(cashflowCats.map(cat => cat.name));

  // Only non-cashflow categories
  const nonCashflowCats = allCategories.filter(cat => !cashflowNamesSet.has(cat.name));
  const nonCashflowIncomeNames = nonCashflowCats.filter(c=>c.type==="income").map(c=>c.name);
  const nonCashflowExpenseNames = nonCashflowCats.filter(c=>c.type==="expense").map(c=>c.name);

  // Helper: Total for non-cashflow income/expense/net for a period
  function getPeriodTotals(transactions: any[], periodYear: string | null, periodMonth: string | null) {
    let income = 0, expense = 0, net = 0;
    for (const txn of transactions) {
      if (!txn.date || typeof txn.amount !== "number") continue;
      const [y, m] = String(txn.date).split("-");
      if (periodYear && y !== periodYear) continue;
      if (periodMonth && m !== periodMonth) continue;
      const catName = txn.category || "Other";
      if (nonCashflowIncomeNames.includes(catName)) {
        income += Math.abs(txn.amount);
        net += Math.abs(txn.amount);
      } else if (nonCashflowExpenseNames.includes(catName)) {
        expense += Math.abs(txn.amount);
        net -= Math.abs(txn.amount);
      }
    }
    return { income, expense, net };
  }

  // This month
  const thisMonthTotals = getPeriodTotals(transactions, summaryStats.thisMonthYear ? summaryStats.thisMonthYear.slice(0,4) : null, summaryStats.thisMonthYear ? summaryStats.thisMonthYear.slice(5,7) : null);
  // Prior month (if available)
  const allMonths = Array.from(new Set(transactions.map((t) => String(t.date).slice(0, 7)))).sort();
  const idx = allMonths.findIndex((m) => m === summaryStats.thisMonthYear);
  const prevMonthKey = idx > 0 ? allMonths[idx - 1] : null;
  const prevMonthTotals = prevMonthKey
    ? getPeriodTotals(transactions, prevMonthKey.slice(0,4), prevMonthKey.slice(5,7))
    : { income: 0, expense: 0, net: 0 };
  // Same month last year
  const sameMonthLastYearKey = summaryStats.sameMonthLastYearKey;
  const lastYearTotals = sameMonthLastYearKey
    ? getPeriodTotals(transactions, sameMonthLastYearKey.slice(0,4), sameMonthLastYearKey.slice(5,7))
    : { income: 0, expense: 0, net: 0 };

  // Compute percentage deltas (MoM, YoY) for these filtered numbers
  function percentDelta(curr: number, prev: number) {
    if (!prev) return 0;
    return ((curr - prev) / prev) * 100;
  }

  const incomeDeltaMoM = percentDelta(thisMonthTotals.income, prevMonthTotals.income);
  const expenseDeltaMoM = percentDelta(thisMonthTotals.expense, prevMonthTotals.expense);
  const netDeltaMoM = percentDelta(thisMonthTotals.net, prevMonthTotals.net);

  const incomeDeltaYoY = percentDelta(thisMonthTotals.income, lastYearTotals.income);
  const expenseDeltaYoY = percentDelta(thisMonthTotals.expense, lastYearTotals.expense);
  const netDeltaYoY = percentDelta(thisMonthTotals.net, lastYearTotals.net);

  return (
    <div>
      {/* Summary row */}
      <SummaryStatsRow
        monthStr={summaryStats.thisMonthYear}
        prevMonthKey={prevMonthKey}
        thisMonthIncome={thisMonthTotals.income}
        thisMonthExpense={thisMonthTotals.expense}
        thisMonthNet={thisMonthTotals.net}
        prevMonthIncome={prevMonthTotals.income}
        prevMonthExpense={prevMonthTotals.expense}
        prevMonthNet={prevMonthTotals.net}
        lastYearIncome={lastYearTotals.income}
        lastYearExpense={lastYearTotals.expense}
        lastYearNet={lastYearTotals.net}
        incomeDeltaMoM={incomeDeltaMoM}
        expenseDeltaMoM={expenseDeltaMoM}
        netDeltaMoM={netDeltaMoM}
        incomeDeltaYoY={incomeDeltaYoY}
        expenseDeltaYoY={expenseDeltaYoY}
        netDeltaYoY={netDeltaYoY}
        getMonthString={getMonthString}
        formatCurrency={formatCurrency}
        getDeltaClass={getDeltaClass}
        sameMonthLastYearKey={summaryStats.sameMonthLastYearKey}
      />

      {/* Pass uncropped category arrays to all tables */}
      <MonthlyCategoryComparisonTable
        key={selectedYear}
        transactions={transactions}
        categories={allCategories}
        incomeCategories={allCategories.filter(c=>c.type === "income")}
        categoryGroups={categoryGroups}
        categoryAssignments={categoryAssignments}
        selectedYear={selectedYear}
        groupOrder={groupOrder}
        perGroupCategoryOrders={perGroupCategoryOrders}
      />
      <CategoryMonthlyHistoryTable
        transactions={transactions}
        categories={allCategories}
        selectedMonth={selectedMonth}
        years={Array.from(new Set(transactions.map((txn) => String(txn.date).slice(0, 4)))).sort()}
        incomeCategories={allCategories.filter(c=>c.type === "income")}
        categoryGroups={categoryGroups}
        categoryAssignments={categoryAssignments}
        categoryOrder={categoryOrder}
      />
      <CategoryYTDHistoryTable
        transactions={transactions}
        categories={allCategories}
        selectedMonth={selectedMonth}
        years={Array.from(new Set(transactions.map((txn) => String(txn.date).slice(0, 4)))).sort()}
        incomeCategories={allCategories.filter(c=>c.type === "income")}
        categoryGroups={categoryGroups}
        categoryAssignments={categoryAssignments}
        categoryOrder={categoryOrder}
      />

      {/* Bar chart only */}
      <div className="bg-white rounded-xl shadow border border-muted mb-8">
        <div className="p-4 border-b border-muted flex items-center gap-2">
          <ChartBar className="text-blue-500" size={18} />
          <span className="font-bold text-base">
            Monthly Breakdown (
            {summaryStats.thisMonthYear ? getMonthString(summaryStats.thisMonthYear) : "none"})
          </span>
        </div>
        <div className="p-4 space-y-4">
          <ExpenseBarChart
            data={
              summaryStats.thisMonthTxns.reduce((acc: Record<string, {income:number, expense:number, net:number}>, txn: any) => {
                const cat = txn.category || "Uncategorised";
                if (!acc[cat]) acc[cat] = {income:0, expense:0, net:0};
                if (incomeCategories.find(x => x.name === cat && x.type === "income")) {
                  acc[cat].income += Math.abs(txn.amount);
                } else {
                  acc[cat].expense += Math.abs(txn.amount);
                }
                acc[cat].net = acc[cat].income - acc[cat].expense;
                return acc;
              }, {})
            }
            categories={allCategories.map(c=>c.name)}
            incomeCategories={allCategories.filter(c=>c.type==="income").map(c=>c.name)}
            onlyNet={true}
          />
        </div>
      </div>
    </div>
  );
};

export default SummaryDashboard;
