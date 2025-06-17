import React from "react";
import type { Category } from "./CategoryEditor";
import CategoryTableRow from "./CategoryTableRow";
import { formatCurrency, getCategoryOrder } from "./CategoryMonthlyTableHelpers";
import CategoryMonthlyTotalsSection from "./CategoryMonthlyTotalsSection";
import CategoryMonthlyUngroupedSection from "./CategoryMonthlyUngroupedSection";
import CategoryMonthlyCashflowSection from "./CategoryMonthlyCashflowSection";
import CategoryMonthlyGroupSection from "./CategoryMonthlyGroupSection";

type Props = {
  transactions: any[];
  categories: Category[];
  selectedMonth: string; // "MM"
  years: string[]; // ["2021", "2022", ...]
  incomeCategories: Category[];
  categoryGroups?: string[];
  categoryAssignments?: Record<string, string>;
  categoryOrder?: string[]; // ADDED
};

// Helper to convert MM to short MMM
function getMonthShortName(numStr: string) {
  const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const idx = parseInt(numStr, 10) - 1;
  return MONTH_NAMES[idx] || numStr;
}

const CASHFLOW_GROUP = "Cashflow items";

const CategoryMonthlyHistoryTable: React.FC<Props> = ({
  transactions,
  categories,
  selectedMonth,
  years,
  incomeCategories,
  categoryGroups = [],
  categoryAssignments = {},
  categoryOrder = [],
}) => {
  // Find all unique category names present in the dataset
  const txCategories = Array.from(
    new Set(transactions.map(txn => txn.category || "Other"))
  );
  const allCategoryNames = Array.from(new Set([...categories.map(c=>c.name), ...txCategories]));
  const orderedNames = getCategoryOrder(allCategoryNames, categoryOrder);

  // Rebuild allCategories as Category objects (income at top, then expense) in order
  const allCategories: Category[] = orderedNames.map(name => (
    categories.find(c => c.name === name) ||
    { name, type: incomeCategories.find(ic=>ic.name===name) ? "income" : "expense" }
  ));
  const income = allCategories.filter(c=>c.type==="income");
  const expenses = allCategories.filter(c=>c.type==="expense");
  const orderedCats = [...income, ...expenses];

  // --- Select which categories are in "cashflow items" group
  const groupsUsed = categoryGroups.length ? categoryGroups : [];
  const allGroups = groupsUsed.includes(CASHFLOW_GROUP)
    ? groupsUsed
    : [...groupsUsed, CASHFLOW_GROUP];
  function catsInGroup(g: string) {
    return orderedCats.filter(cat => categoryAssignments[cat.name] === g);
  }
  const cashflowCats = catsInGroup(CASHFLOW_GROUP);

  // Collect names in cashflow group
  const cashflowSet = new Set(cashflowCats.map(cat => cat.name));

  // Only categories NOT in "Cashflow items"
  const nonCashflowCats = orderedCats.filter(cat => !cashflowSet.has(cat.name));

  // Build monthlyTotals as before
  const monthlyTotals: Record<string, Record<string, {income:number,expense:number,net:number}>> = {};
  for (const cat of orderedCats) {
    monthlyTotals[cat.name] = {};
    for (const year of years) {
      monthlyTotals[cat.name][year] = {income: 0, expense: 0, net: 0};
    }
  }
  for (const txn of transactions) {
    if (!txn.date || typeof txn.amount !== "number") continue;
    const [year, mo] = txn.date.split("-");
    if (years.includes(year) && mo === selectedMonth) {
      const catName = txn.category || "Other";
      if (!monthlyTotals[catName][year]) monthlyTotals[catName][year] = {income: 0, expense: 0, net: 0};
      if (incomeCategories.some(c=>c.name===catName)) {
        monthlyTotals[catName][year].income += Math.abs(txn.amount);
      } else if (txn.amount < 0) {
        monthlyTotals[catName][year].expense += Math.abs(txn.amount);
      }
      monthlyTotals[catName][year].net = monthlyTotals[catName][year].income - monthlyTotals[catName][year].expense;
    }
  }

  // Only include non-cashflow categories/groups for "Total" and "% Saved" rows
  const totalsPerYear = years.map(year => {
    let incomeSum = 0, expenseSum = 0;
    nonCashflowCats.forEach(cat => {
      const v = monthlyTotals[cat.name][year];
      if (v) {
        if (cat.type==="income") incomeSum += v.income;
        else expenseSum += v.expense;
      }
    });
    return { income: incomeSum, expense: expenseSum, net: incomeSum - expenseSum };
  });

  const percentSavedPerYear = totalsPerYear.map(t => {
    const total = Math.max(t.income, t.expense);
    if (total === 0) return null;
    return (t.net / total) * 100;
  });

  const grandIncome = totalsPerYear.reduce((sum, t) => sum + t.income, 0);
  const grandExpense = totalsPerYear.reduce((sum, t) => sum + t.expense, 0);
  const grandNet = totalsPerYear.reduce((sum, t) => sum + t.net, 0);
  const grandTotal = Math.max(grandIncome, grandExpense);
  const grandPercentSaved = grandTotal === 0 ? null : (grandNet / grandTotal) * 100;

  // --- groups, unassigned cats, cashflow calculation
  const unassignedIncomeCats = orderedCats.filter(cat => !categoryAssignments[cat.name] && cat.type === "income" && !cashflowSet.has(cat.name));
  const unassignedExpenseCats = orderedCats.filter(cat => !categoryAssignments[cat.name] && cat.type === "expense" && !cashflowSet.has(cat.name));

  // Cashflow calculation
  const cashflowTotals = years.map(year => {
    let total = 0;
    for (const cat of cashflowCats) {
      total += monthlyTotals[cat.name]?.[year]?.net || 0;
    }
    return total;
  });
  const grandCashflow = cashflowTotals.reduce((sum, t) => sum + t, 0);

  // Net Savings after Cashflow for each year
  const netAfterCashflowPerYear = totalsPerYear.map((t, i) => t.net + cashflowTotals[i]);
  const grandNetAfterCashflow = grandNet + grandCashflow;
  const percentSavedAfterPerYear = totalsPerYear.map((t, i) => {
    const denom = Math.max(t.income, t.expense);
    return denom === 0 ? null : (netAfterCashflowPerYear[i] / denom) * 100;
  });
  const grandPctSavedAfter = grandTotal === 0 ? null : (grandNetAfterCashflow / grandTotal) * 100;

  // --- DEBUG LOGS TO TROUBLESHOOT ---
  console.log("[CategoryMonthlyHistoryTable] years:", years);
  console.log("[CategoryMonthlyHistoryTable] cashflowCats:", cashflowCats.map(c=>c.name));
  console.log("[CategoryMonthlyHistoryTable] cashflowTotals:", cashflowTotals);
  console.log("[CategoryMonthlyHistoryTable] netAfterCashflowPerYear:", netAfterCashflowPerYear);
  console.log("[CategoryMonthlyHistoryTable] percentSavedAfterPerYear:", percentSavedAfterPerYear);
  console.log("[CategoryMonthlyHistoryTable] grandNetAfterCashflow:", grandNetAfterCashflow, "grandPctSavedAfter:", grandPctSavedAfter);

  return (
    <div className="bg-white rounded-xl shadow border border-muted mb-8">
      <div className="p-4 border-b border-muted flex items-center gap-2">
        <span className="font-bold text-base">
          Category by Month: All Years (Month {getMonthShortName(selectedMonth)})
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="py-2 px-4 bg-muted text-left sticky left-0 z-10 bg-white">Category</th>
              {years.map(year => (
                <th className="py-2 px-3 text-center bg-muted" key={year}>{year}</th>
              ))}
              <th className="py-2 px-3 text-center bg-muted">Total</th>
            </tr>
          </thead>
          <tbody>
            {/* Grouped Sections */}
            {allGroups.filter(g=>g!==CASHFLOW_GROUP).map(g => (
              <CategoryMonthlyGroupSection
                key={g}
                groupName={g}
                cats={catsInGroup(g)}
                years={years}
                monthlyTotals={monthlyTotals}
              />
            ))}

            {/* Other Income */}
            <CategoryMonthlyUngroupedSection
              sectionLabel="Other Income"
              cats={orderedCats.filter(cat => !categoryAssignments[cat.name] && cat.type === "income" && !cashflowSet.has(cat.name))}
              years={years}
              monthlyTotals={monthlyTotals}
            />
            {/* Other Expenses */}
            <CategoryMonthlyUngroupedSection
              sectionLabel="Other Expenses"
              cats={orderedCats.filter(cat => !categoryAssignments[cat.name] && cat.type === "expense" && !cashflowSet.has(cat.name))}
              years={years}
              monthlyTotals={monthlyTotals}
            />

            {/* Totals Section - now excluding cashflow items */}
            <CategoryMonthlyTotalsSection
              years={years}
              totalsPerYear={totalsPerYear}
              grandNet={grandNet}
              percentSavedPerYear={percentSavedPerYear}
              grandPercentSaved={grandPercentSaved}
            />

            {/* CASHFLOW GROUP SECTION (after % Saved) */}
            <CategoryMonthlyCashflowSection
              cashflowCats={cashflowCats}
              years={years}
              monthlyTotals={monthlyTotals}
              cashflowTotals={cashflowTotals}
              grandCashflow={grandCashflow}
            />
            {/* Net Savings after Cashflow items */}
            <tr>
              <td className="py-2 px-4 font-bold bg-blue-100 sticky left-0 z-10">Net Savings after Cashflow items</td>
              {netAfterCashflowPerYear.map((n, i) => (
                <td key={i} className="py-2 px-3 text-center font-bold bg-blue-100">{(n).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              ))}
              <td className="py-2 px-3 text-center font-bold bg-blue-100">{grandNetAfterCashflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
            {/* % Saved after Cashflow items */}
            <tr>
              <td className="py-2 px-4 font-bold bg-blue-50 sticky left-0 z-10">% Saved after Cashflow items</td>
              {percentSavedAfterPerYear.map((p, i) => (
                <td key={i} className="py-2 px-3 text-center font-bold bg-blue-50">{p == null ? "-" : `${p.toFixed(1)}%`}</td>
              ))}
              <td className="py-2 px-3 text-center font-bold bg-blue-50">{grandPctSavedAfter == null ? "-" : `${grandPctSavedAfter.toFixed(1)}%`}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="p-4 text-xs text-muted-foreground">
        For <b>month {selectedMonth}</b>: income <span className="text-green-700">+</span>, expenses <span className="text-red-600">-</span>, net.
      </div>
    </div>
  );
};

export default CategoryMonthlyHistoryTable;
