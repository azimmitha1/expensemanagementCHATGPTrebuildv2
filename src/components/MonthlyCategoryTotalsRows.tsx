
import React from "react";
import { formatCurrency } from "./MonthlyCategoryTableUtils";
import type { Category } from "./CategoryEditor";

type Props = {
  months: string[];
  totalsPerMonth: { income: number; expense: number; net: number}[];
  grandTotalIncome: number;
  grandTotalExpense: number;
  grandTotalNet: number;
};

const MonthlyCategoryTotalsRows: React.FC<Props> = ({
  months,
  totalsPerMonth,
  grandTotalIncome,
  grandTotalExpense,
  grandTotalNet
}) => {
  // Calculate '% Saved' for each month (green if >=0, red if <0)
  const percentSavedPerMonth = totalsPerMonth.map(t => {
    const total = Math.max(t.income, t.expense);
    if (total === 0) return null;
    const percent = t.net / total * 100;
    return percent;
  });
  const grandTotal = Math.max(grandTotalIncome, grandTotalExpense);
  const grandPercentSaved = grandTotal ? (grandTotalNet / grandTotal * 100) : null;

  return (
    <>
      {/* Totals Row */}
      <tr>
        <td className="py-2 px-4 font-bold bg-muted sticky left-0 z-10 whitespace-nowrap"><span className="font-bold">Total</span></td>
        {totalsPerMonth.map((t, idx) => (
          <td key={"total-" + idx} className="py-2 px-3 text-center font-bold bg-gray-100">
            <div className="flex flex-col gap-0.5">
              <span className="text-green-700">{t.income !== 0 ? "+" + formatCurrency(t.income) : "-"}</span>
              <span className="text-red-600">{t.expense !== 0 ? "-" + formatCurrency(t.expense) : "-"}</span>
            </div>
          </td>
        ))}
        <td className="py-2 px-3 text-center font-bold bg-gray-200">
          <div className="flex flex-col gap-0.5">
            <span className="text-green-700">{grandTotalIncome !== 0 ? "+" + formatCurrency(grandTotalIncome) : "-"}</span>
            <span className="text-red-600">{grandTotalExpense !== 0 ? "-" + formatCurrency(grandTotalExpense) : "-"}</span>
          </div>
        </td>
      </tr>
      {/* Net Savings Row */}
      <tr>
        <td className="py-2 px-4 font-bold bg-muted sticky left-0 z-10 whitespace-nowrap">Net Savings</td>
        {totalsPerMonth.map((t, idx) => (
          <td key={"net-" + idx} className={`py-2 px-3 text-center font-bold ${t.net >= 0 ? "text-green-700" : "text-red-700"} bg-gray-200`}>
            = {formatCurrency(t.net)}
          </td>
        ))}
        <td className={`py-2 px-3 text-center font-bold ${grandTotalNet >= 0 ? "text-green-700" : "text-red-700"} bg-gray-300`}>
          = {formatCurrency(grandTotalNet)}
        </td>
      </tr>
      {/* % Saved Row */}
      <tr>
        <td className="py-2 px-4 font-bold bg-muted sticky left-0 z-10 whitespace-nowrap">% Saved</td>
        {percentSavedPerMonth.map((pct, idx) => (
          <td key={"pct-" + idx} className={`py-2 px-3 text-center font-bold ${pct != null && pct >= 0 ? "text-green-700" : "text-red-700"} bg-gray-50`}>
            {pct == null ? "-" : `${pct.toFixed(1)}%`}
          </td>
        ))}
        <td className={`py-2 px-3 text-center font-bold ${grandPercentSaved != null && grandPercentSaved >= 0 ? "text-green-700" : "text-red-700"} bg-gray-100`}>
          {grandPercentSaved == null ? "-" : `${grandPercentSaved.toFixed(1)}%`}
        </td>
      </tr>
    </>
  );
};
export default MonthlyCategoryTotalsRows;
