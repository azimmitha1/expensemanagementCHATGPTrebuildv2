
import React from "react";
import type { Category } from "./CategoryEditor";
import CategoryGroupSection from "./CategoryGroupSection";
import MonthlyCategoryTotalsRows from "./MonthlyCategoryTotalsRows";
import NetAfterCashflowRows from "./NetAfterCashflowRows";
import { groupByCategoryAndMonth } from "./MonthlyCategoryTableUtils";
import { getTotalsPerMonth, getCategoryTotals, getGrandTotals } from "./monthlyCategoryTotals";

type Props = {
  transactions: any[];
  categories: Category[];
  incomeCategories: Category[];
  orderedCategoryNames?: string[];
  categoryGroups?: string[];
  categoryAssignments?: Record<string, string>;
  selectedYear: string;
  groupOrder?: string[];
  perGroupCategoryOrders?: Record<string, string[]>;
  months: string[];
};

const OTHER_EXPENSES_GROUP = "Other Expenses";
const OTHER_INCOME_GROUP = "Other Income";
const CASHFLOW_GROUP = "Cashflow items";

const MonthlyCategoryTableBody: React.FC<Props> = ({
  transactions,
  categories,
  incomeCategories,
  orderedCategoryNames,
  categoryGroups = [],
  categoryAssignments = {},
  selectedYear,
  groupOrder = [],
  perGroupCategoryOrders = {},
  months,
}) => {
  // Split cats by type and get group ordering
  const incomeCatNames = new Set(incomeCategories.map(c => c.name));
  const allCategories = [
    ...categories.filter(c => c.type === "income"),
    ...categories.filter(c => c.type === "expense"),
  ];

  let groupsUsed = groupOrder.length ? groupOrder : categoryGroups;
  const allMainGroups = groupsUsed.includes(CASHFLOW_GROUP)
    ? groupsUsed
    : [...groupsUsed, CASHFLOW_GROUP];

  // Build group to categories mapping
  const groupToCategories: Record<string, Category[]> = {};
  for (const g of allMainGroups) {
    groupToCategories[g] = allCategories.filter(c => categoryAssignments?.[c.name] === g);
  }

  // "Other" groups
  const groupedCategoryNames = new Set(
    groupsUsed.flatMap(g =>
      allCategories.filter(c => categoryAssignments?.[c.name] === g).map(c => c.name)
    )
  );
  const otherIncomeCats = allCategories.filter(
    c =>
      c.type === "income" &&
      (!categoryAssignments?.[c.name] ||
        !groupsUsed.includes(categoryAssignments?.[c.name]) ||
        !groupedCategoryNames.has(c.name))
  );
  const otherExpenseCats = allCategories.filter(
    c =>
      c.type === "expense" &&
      (!categoryAssignments?.[c.name] ||
        !groupsUsed.includes(categoryAssignments?.[c.name]) ||
        !groupedCategoryNames.has(c.name))
  );
  if (otherIncomeCats.length) groupToCategories[OTHER_INCOME_GROUP] = otherIncomeCats;
  if (otherExpenseCats.length) groupToCategories[OTHER_EXPENSES_GROUP] = otherExpenseCats;

  const groupsToShow = [
    ...groupsUsed.filter(g => groupToCategories[g]?.length),
    ...(groupToCategories[OTHER_INCOME_GROUP]?.length ? [OTHER_INCOME_GROUP] : []),
    ...(groupToCategories[OTHER_EXPENSES_GROUP]?.length ? [OTHER_EXPENSES_GROUP] : []),
  ];

  // Data grouping and totals
  const yearTxns = transactions.filter(t => String(t.date).slice(0, 4) === String(selectedYear));
  const grouped = groupByCategoryAndMonth(
    yearTxns,
    allCategories.map(c => c.name),
    incomeCategories.map(c => c.name)
  );

  // --- MAIN FIX: Exclude "Cashflow items" categories from standard total/net rows
  // Collect the names of ALL cashflow items categories:
  const cashflowCategories = groupToCategories[CASHFLOW_GROUP] || [];
  const cashflowCategoryNames = new Set(cashflowCategories.map(c => c.name));

  // Only use categories NOT in "Cashflow items" for totals/Net/%
  const nonCashflowCategories = allCategories.filter(c => !cashflowCategoryNames.has(c.name));

  // Use only non-cashflow categories for totals
  const totalsPerMonth = getTotalsPerMonth(months, nonCashflowCategories, grouped);
  const categoryTotals = getCategoryTotals(months, allCategories, grouped); // Needed for all group sections—don't change
  const nonCashflowCategoryTotals = getCategoryTotals(months, nonCashflowCategories, grouped);
  const { grandTotalIncome, grandTotalExpense, grandTotalNet } = getGrandTotals(nonCashflowCategories, nonCashflowCategoryTotals);

  // --- END MAIN FIX

  const displayGroupName = (g: string) => {
    if (g === OTHER_EXPENSES_GROUP) return "Other Expenses";
    if (g === OTHER_INCOME_GROUP) return "Other Income";
    if (g === CASHFLOW_GROUP) return "Cashflow items";
    return g;
  };

  return (
    <tbody>
      {groupsToShow
        .filter(group => group !== CASHFLOW_GROUP)
        .map(group =>
          groupToCategories[group]?.length ? (
            <CategoryGroupSection
              key={group}
              groupName={displayGroupName(group)}
              cats={groupToCategories[group]}
              months={months}
              grouped={grouped}
              categoryTotals={categoryTotals}
            />
          ) : null
        )}
      {/* Standard totals & % Saved rows (only non-cashflow categories now) */}
      <MonthlyCategoryTotalsRows
        months={months}
        totalsPerMonth={totalsPerMonth}
        grandTotalIncome={grandTotalIncome}
        grandTotalExpense={grandTotalExpense}
        grandTotalNet={grandTotalNet}
      />
      {/* Cashflow section */}
      {cashflowCategories.length > 0 && (
        <CategoryGroupSection
          groupName={displayGroupName(CASHFLOW_GROUP)}
          cats={cashflowCategories}
          months={months}
          grouped={grouped}
          categoryTotals={categoryTotals}
        />
      )}
      <NetAfterCashflowRows
        months={months}
        cashflowCategories={cashflowCategories}
        totalsPerMonth={totalsPerMonth}
        grouped={grouped}
        grandTotalIncome={grandTotalIncome}
        grandTotalExpense={grandTotalExpense}
        grandTotalNet={grandTotalNet}
        categoryTotals={categoryTotals}
      />
    </tbody>
  );
};
export default MonthlyCategoryTableBody;
