
import React from "react";
import type { Category } from "./CategoryEditor";

type Props = {
  months: string[];
  cashflowCategories: Category[];
  totalsPerMonth: { income: number; expense: number; net: number }[];
  grouped: Record<string, Record<string, {income:number,expense:number,net:number}>>;
  grandTotalIncome: number;
  grandTotalExpense: number;
  grandTotalNet: number;
  categoryTotals: Record<string, { income: number, expense: number, net: number }>;
};

const NetAfterCashflowRows: React.FC<Props> = ({
  months,
  cashflowCategories,
  totalsPerMonth,
  grouped,
  grandTotalIncome,
  grandTotalExpense,
  grandTotalNet,
  categoryTotals,
}) => {
  // Total (all months)
  let cashflowTotals = { income: 0, expense: 0, net: 0 };
  for (const cat of cashflowCategories) {
    cashflowTotals.income += categoryTotals?.[cat.name]?.income || 0;
    cashflowTotals.expense += categoryTotals?.[cat.name]?.expense || 0;
    cashflowTotals.net += categoryTotals?.[cat.name]?.net || 0;
  }
  const netAfterCashflow = grandTotalNet + cashflowTotals.net;
  const grandPositiveTotal = Math.max(grandTotalIncome, grandTotalExpense);
  const percentSavedAfter = grandPositiveTotal === 0 ? null : (netAfterCashflow / grandPositiveTotal) * 100;

  // Per-month versions
  const netAfterCashflowPerMonth = months.map((month, i) => {
    const tm = totalsPerMonth[i];
    let cashflowNet = 0;
    for (const cat of cashflowCategories) {
      cashflowNet += grouped?.[cat.name]?.[month]?.net || 0;
    }
    return (tm?.net ?? 0) + cashflowNet;
  });
  const percentSavedAfterPerMonth = months.map((month, i) => {
    const tm = totalsPerMonth[i];
    const total = Math.max(tm?.income ?? 0, tm?.expense ?? 0);
    if (total === 0) return null;
    return (netAfterCashflowPerMonth[i] / total) * 100;
  });

  return (
    <>
      <tr>
        <td className="py-2 px-4 font-bold bg-blue-100 sticky left-0 z-10">Net Savings after Cashflow items</td>
        {netAfterCashflowPerMonth.map((n, i) => (
          <td key={i} className="py-2 px-3 text-center font-bold bg-blue-100">
            {n >= 0 ? (
              <span className="text-green-700">{n.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            ) : (
              <span className="text-red-600">{n.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            )}
          </td>
        ))}
        <td className="py-2 px-3 text-center font-bold bg-blue-100">
          = {netAfterCashflow >= 0 ? (
            <span className="text-green-700">{netAfterCashflow.toLocaleString(undefined,{minimumFractionDigits:2})}</span>
          ) : (
            <span className="text-red-600">{netAfterCashflow.toLocaleString(undefined,{minimumFractionDigits:2})}</span>
          )}
        </td>
      </tr>
      <tr>
        <td className="py-2 px-4 font-bold bg-blue-50 sticky left-0 z-10">% Saved after Cashflow items</td>
        {percentSavedAfterPerMonth.map((pct, i) => (
          <td key={i} className="py-2 px-3 text-center font-bold bg-blue-50">
            {pct == null ? "-" : pct.toFixed(1) + "%"}
          </td>
        ))}
        <td className="py-2 px-3 text-center font-bold bg-blue-50">
          {percentSavedAfter == null ? "-" : percentSavedAfter.toFixed(1) + "%"}
        </td>
      </tr>
    </>
  );
};
export default NetAfterCashflowRows;
