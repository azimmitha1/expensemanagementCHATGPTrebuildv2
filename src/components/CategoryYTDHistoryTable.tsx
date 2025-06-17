import React from "react";
import type { Category } from "./CategoryEditor";
import CategoryYTDGroupSection from "./CategoryYTDGroupSection";
import CategoryTableRow from "./CategoryTableRow";
import CategoryYTDTableTotalsRow from "./CategoryYTDTableTotalsRow";
import CategoryYTDTableNetSavingsRow from "./CategoryYTDTableNetSavingsRow";
import CategoryYTDTablePercentSavedRow from "./CategoryYTDTablePercentSavedRow";
import { formatCurrency } from "./CategoryYTDTableHelpers";
import CategoryYTDOtherSection from "./CategoryYTDOtherSection";
import { getCategoryOrder } from "./CategoryMonthlyTableHelpers";

type Props = {
  transactions: any[];
  categories: Category[];
  selectedMonth: string; // "MM"
  years: string[];
  incomeCategories: Category[];
  categoryGroups?: string[];
  categoryAssignments?: Record<string, string>;
  categoryOrder?: string[];
};

const CASHFLOW_GROUP = "Cashflow items";

const CategoryYTDHistoryTable: React.FC<Props> = ({
  transactions,
  categories,
  selectedMonth,
  years,
  incomeCategories,
  categoryGroups = [],
  categoryAssignments = {},
  categoryOrder = [],
}) => {
  const txCategories = Array.from(
    new Set(transactions.map(txn => txn.category || "Other"))
  );
  const allCategoryNames = Array.from(new Set([...categories.map(c=>c.name), ...txCategories]));
  let orderedNames = getCategoryOrder(allCategoryNames, categoryOrder);
  const allCategories: Category[] = orderedNames.map(name => (
    categories.find(c => c.name === name) ||
    { name, type: incomeCategories.find(ic=>ic.name===name) ? "income" : "expense" }
  ));
  const income = allCategories.filter(c=>c.type==="income");
  const expenses = allCategories.filter(c=>c.type==="expense");
  const orderedCats = [...income, ...expenses];

  // Find cashflow group categories
  const groupsUsed = categoryGroups.length ? categoryGroups : [];
  const allGroups = groupsUsed.includes(CASHFLOW_GROUP)
    ? groupsUsed
    : [...groupsUsed, CASHFLOW_GROUP];

  function catsInGroup(g: string) {
    return orderedCats.filter(cat => categoryAssignments[cat.name] === g);
  }
  const cashflowCats = catsInGroup(CASHFLOW_GROUP);
  const cashflowSet = new Set(cashflowCats.map(cat => cat.name));
  const nonCashflowCats = orderedCats.filter(cat => !cashflowSet.has(cat.name));

  // Calculate YTD totals (grouped per category/year)
  const ytdTotals: Record<string, Record<string, { income: number; expense: number; net: number }>> = {};
  for (const cat of orderedCats) {
    ytdTotals[cat.name] = {};
    for (const year of years) {
      ytdTotals[cat.name][year] = { income: 0, expense: 0, net: 0 };
    }
  }
  for (const txn of transactions) {
    if (!txn.date || typeof txn.amount !== "number") continue;
    const [year, mo] = txn.date.split("-");
    if (
      years.includes(year) &&
      Number(mo) <= Number(selectedMonth)
    ) {
      const catName = txn.category || "Other";
      if (!ytdTotals[catName][year]) ytdTotals[catName][year] = { income: 0, expense: 0, net: 0 };
      if (incomeCategories.some(c=>c.name===catName)) {
        ytdTotals[catName][year].income += Math.abs(txn.amount);
      } else if (txn.amount < 0) {
        ytdTotals[catName][year].expense += Math.abs(txn.amount);
      }
      ytdTotals[catName][year].net = ytdTotals[catName][year].income - ytdTotals[catName][year].expense;
    }
  }

  // Only non-cashflow for Total/Net/Percent rows
  const totalsPerYear = years.map(year => {
    let incomeSum = 0, expenseSum = 0;
    nonCashflowCats.forEach(cat => {
      const v = ytdTotals[cat.name][year];
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

  // For group sections (excluding cashflow group)
  function renderGroupSection(g: string) {
    if (g === CASHFLOW_GROUP) return null;
    const cats = catsInGroup(g);
    if (!cats.length) return null;
    return (
      <CategoryYTDGroupSection
        group={g}
        cats={cats}
        years={years}
        ytdTotals={ytdTotals}
      />
    );
  }

  // Ungrouped cats: only non-cashflow cats
  const unassignedIncomeCats = orderedCats.filter(cat => !categoryAssignments[cat.name] && cat.type === "income" && !cashflowSet.has(cat.name));
  const unassignedExpenseCats = orderedCats.filter(cat => !categoryAssignments[cat.name] && cat.type === "expense" && !cashflowSet.has(cat.name));

  // Helper to convert MM to short MMM
  function getMonthShortName(numStr: string) {
    const MONTH_NAMES = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const idx = parseInt(numStr, 10) - 1;
    return MONTH_NAMES[idx] || numStr;
  }

  // --- CASHFLOW Group Section ---
  // Subtotals for cashflow group
  const cashflowSubtotals: Record<string, { income: number; expense: number; net: number }> = {};
  for (const year of years) {
    let income = 0, expense = 0, net = 0;
    for (const cat of cashflowCats) {
      const v = ytdTotals[cat.name][year] || { income: 0, expense: 0, net: 0 };
      income += v.income;
      expense += v.expense;
      net += v.net;
    }
    cashflowSubtotals[year] = { income, expense, net };
  }
  let cashflowTotalIncome = 0, cashflowTotalExpense = 0, cashflowTotalNet = 0;
  for (const cat of cashflowCats) {
    for (const year of years) {
      const v = ytdTotals[cat.name][year] || { income: 0, expense: 0, net: 0 };
      cashflowTotalIncome += v.income;
      cashflowTotalExpense += v.expense;
      cashflowTotalNet += v.net;
    }
  }

  // Cashflow net per year (for after rows)
  const cashflowNetPerYear = years.map(year => {
    let total = 0;
    for (const cat of cashflowCats) {
      total += ytdTotals[cat.name][year]?.net || 0;
    }
    return total;
  });
  const grandCashflowNet = cashflowNetPerYear.reduce((a, b) => a + b, 0);

  // Net after cashflow
  const netAfterCashflowPerYear = totalsPerYear.map((t, i) => t.net + cashflowNetPerYear[i]);
  const grandNetAfterCashflow = grandNet + grandCashflowNet;
  const percentSavedAfterPerYear = totalsPerYear.map((t, i) => {
    const denom = Math.max(t.income, t.expense);
    return denom === 0 ? null : (netAfterCashflowPerYear[i] / denom) * 100;
  });
  const grandPctSavedAfter = grandTotal === 0 ? null : (grandNetAfterCashflow / grandTotal) * 100;

  return (
    <div className="bg-white rounded-xl shadow border border-muted mb-8">
      <div className="p-4 border-b border-muted flex items-center gap-2">
        <span className="font-bold text-base">
          YTD Comparison by Year (Jan–{getMonthShortName(selectedMonth)}){" "}
          <span className="text-xs font-normal text-muted-foreground">(Includes data up to month {getMonthShortName(selectedMonth)} for each year)</span>
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
            {/* Group Sections (excluding cashflow) */}
            {allGroups.filter(g => g !== CASHFLOW_GROUP).map(g => renderGroupSection(g))}
            {/* Other Income */}
            <CategoryYTDOtherSection
              sectionName="Other Income"
              cats={unassignedIncomeCats}
              years={years}
              ytdTotals={ytdTotals}
            />
            {/* Other Expenses */}
            <CategoryYTDOtherSection
              sectionName="Other Expenses"
              cats={unassignedExpenseCats}
              years={years}
              ytdTotals={ytdTotals}
            />
            {/* Total, Net, Percent rows – only non-cashflow */}
            <CategoryYTDTableTotalsRow totalsPerYear={totalsPerYear} years={years} />
            <CategoryYTDTableNetSavingsRow totalsPerYear={totalsPerYear} years={years} grandNet={grandNet} />
            <CategoryYTDTablePercentSavedRow percentSavedPerYear={percentSavedPerYear} grandPercentSaved={grandPercentSaved} years={years} />
            {/* Cashflow group after main totals */}
            {!!cashflowCats.length && (
              <>
                <CategoryYTDGroupSection
                  group="Cashflow items"
                  cats={cashflowCats}
                  years={years}
                  ytdTotals={ytdTotals}
                />
              </>
            )}
            {/* Net Savings after Cashflow items */}
            <tr>
              <td className="py-2 px-4 font-bold bg-blue-100 sticky left-0 z-10">Net Savings after Cashflow items</td>
              {netAfterCashflowPerYear.map((n, i) => (
                <td key={i} className="py-2 px-3 text-center font-bold bg-blue-100">{n.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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
        Year-to-date up to month {selectedMonth}: each column shows income <span className="text-green-700">+</span>,
        expenses <span className="text-red-600">-</span>, net for Jan–
        {selectedMonth} in that year. Change the month above to view partial YTD for all years including current.
      </div>
    </div>
  );
};

export default CategoryYTDHistoryTable;
