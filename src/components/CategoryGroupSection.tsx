
import React from "react";
import CategoryTableRow from "./CategoryTableRow";
import type { Category } from "./CategoryEditor";

// Helper to sum a group's totals
function getGroupSubtotals(groupCats: Category[], months: string[], grouped: Record<string, Record<string, {income:number,expense:number,net:number}>>, categoryTotals: Record<string, {income:number,expense:number,net:number}>) {
  // Per month: accumulate
  const subtotals: Record<string, {income:number,expense:number,net:number}> = {};
  for (const mn of months) {
    let income = 0, expense = 0, net = 0;
    for (const cat of groupCats) {
      const cdata = grouped[cat.name]?.[mn] || {income:0, expense:0, net:0};
      income += cdata.income;
      expense += cdata.expense;
      net += cdata.net;
    }
    subtotals[mn] = { income, expense, net };
  }
  // ALL months total:
  let totalIncome = 0, totalExpense = 0, totalNet = 0;
  for (const cat of groupCats) {
    totalIncome += categoryTotals[cat.name]?.income || 0;
    totalExpense += categoryTotals[cat.name]?.expense || 0;
    totalNet += categoryTotals[cat.name]?.net || 0;
  }
  return { subtotals, totalIncome, totalExpense, totalNet };
}

type Props = {
  groupName: string;
  cats: Category[];
  months: string[];
  grouped: Record<string, Record<string, {income:number,expense:number,net:number}>>;
  categoryTotals: Record<string, {income:number,expense:number,net:number}>;
};

const CategoryGroupSection: React.FC<Props> = ({
  groupName,
  cats,
  months,
  grouped,
  categoryTotals,
}) => {
  if (!cats.length) return null;
  const { subtotals, totalIncome, totalExpense } = getGroupSubtotals(cats, months, grouped, categoryTotals);
  return (
    <>
      <tr>
        <td colSpan={months.length + 2} className="bg-blue-100 font-bold text-blue-900 py-1 px-4">{groupName}</td>
      </tr>
      {cats.map(cat => (
        <CategoryTableRow
          key={cat.name}
          cat={cat}
          months={months}
          grouped={grouped}
          categoryTotals={categoryTotals}
        />
      ))}
      {/* Sub-Total Row */}
      <tr>
        <td className="py-2 px-4 font-bold bg-blue-50 sticky left-0 z-10 whitespace-nowrap">Sub-Total</td>
        {months.map(mn => (
          <td key={mn} className="py-2 px-3 text-center font-bold bg-blue-50">
            <div className="flex flex-col gap-0.5">
              <span className="text-green-700">{subtotals[mn].income !== 0 ? "+" + (subtotals[mn].income).toLocaleString(undefined, {minimumFractionDigits:2}) : "-"}</span>
              <span className="text-red-600">{subtotals[mn].expense !== 0 ? "-" + (subtotals[mn].expense).toLocaleString(undefined, {minimumFractionDigits:2}) : "-"}</span>
            </div>
          </td>
        ))}
        <td className="py-2 px-3 text-center font-bold bg-blue-200">
          <div className="flex flex-col gap-0.5">
            <span className="text-green-700">{totalIncome !== 0 ? "+" + totalIncome.toLocaleString(undefined, {minimumFractionDigits:2}) : "-"}</span>
            <span className="text-red-600">{totalExpense !== 0 ? "-" + totalExpense.toLocaleString(undefined, {minimumFractionDigits:2}) : "-"}</span>
          </div>
        </td>
      </tr>
      {/* Removed Net Sub-Total */}
    </>
  );
};

export default CategoryGroupSection;

