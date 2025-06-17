
import React from "react";
import { formatCurrency } from "./CategoryMonthlyTableHelpers";

type Totals = {
  income: number;
  expense: number;
  net: number;
};

type Props = {
  years: string[];
  totalsPerYear: Totals[];
  grandNet: number;
  percentSavedPerYear: (number|null)[];
  grandPercentSaved: number|null;
};

const CategoryMonthlyTotalsSection: React.FC<Props> = ({
  years,
  totalsPerYear,
  grandNet,
  percentSavedPerYear,
  grandPercentSaved
}) => (
  <>
    {/* Totals Row */}
    <tr>
      <td className="py-2 px-4 font-bold bg-muted sticky left-0 z-10">Total</td>
      {totalsPerYear.map((t, idx) => (
        <td key={"total-" + idx} className="py-2 px-3 text-center font-bold bg-gray-100">
          <div className="flex flex-col gap-0.5">
            <span className="text-green-700">{t.income !== 0 ? "+"+formatCurrency(t.income) : "-"}</span>
            <span className="text-red-600">{t.expense !== 0 ? "-"+formatCurrency(t.expense) : "-"}</span>
          </div>
        </td>
      ))}
      <td className="py-2 px-3 text-center font-bold bg-gray-200">
        <div className="flex flex-col gap-0.5">
          <span className="text-green-700">
            {
              totalsPerYear.reduce((sum, t) => sum + t.income, 0) !== 0
                ? "+" + formatCurrency(totalsPerYear.reduce((sum, t) => sum + t.income, 0))
                : "-"
            }
          </span>
          <span className="text-red-600">
            {
              totalsPerYear.reduce((sum, t) => sum + t.expense, 0) !== 0
                ? "-" + formatCurrency(totalsPerYear.reduce((sum, t) => sum + t.expense, 0))
                : "-"
            }
          </span>
        </div>
      </td>
    </tr>
    {/* Net Savings Row */}
    <tr>
      <td className="py-2 px-4 font-bold bg-muted sticky left-0 z-10">Net Savings</td>
      {totalsPerYear.map((t, idx) => (
        <td key={"net-" + idx} className={`py-2 px-3 text-center font-bold ${t.net >= 0 ? "text-green-700" : "text-red-700"} bg-gray-200`}>
          = {formatCurrency(t.net)}
        </td>
      ))}
      <td className={`py-2 px-3 text-center font-bold bg-gray-300`}>
        = {formatCurrency(grandNet)}
      </td>
    </tr>
    {/* % Saved Row */}
    <tr>
      <td className="py-2 px-4 font-bold bg-muted sticky left-0 z-10">% Saved</td>
      {percentSavedPerYear.map((pct, idx) => (
        <td key={"pct-"+idx} className={`py-2 px-3 text-center font-bold ${pct != null && pct >= 0 ? "text-green-700" : "text-red-700"} bg-gray-50`}>
          {pct == null ? "-" : `${pct.toFixed(1)}%`}
        </td>
      ))}
      <td className={`py-2 px-3 text-center font-bold ${grandPercentSaved != null && grandPercentSaved >= 0 ? "text-green-700" : "text-red-700"} bg-gray-100`}>
        {grandPercentSaved == null ? "-" : `${grandPercentSaved.toFixed(1)}%`}
      </td>
    </tr>
  </>
);

export default CategoryMonthlyTotalsSection;
