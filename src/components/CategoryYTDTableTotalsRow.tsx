
import React from "react";
import { formatCurrency } from "./CategoryYTDTableHelpers";

type Props = {
  totalsPerYear: { income: number; expense: number; net: number }[];
  years: string[];
};

const CategoryYTDTableTotalsRow: React.FC<Props> = ({ totalsPerYear, years }) => (
  <tr>
    <td className="py-2 px-4 font-bold bg-muted sticky left-0 z-10">Total</td>
    {totalsPerYear.map((t, idx) => (
      <td key={"total-" + idx} className="py-2 px-3 text-center font-bold bg-gray-100">
        <div className="flex flex-col gap-0.5">
          <span className="text-green-700">{t.income !== 0 ? "+" + formatCurrency(t.income) : "-"}</span>
          <span className="text-red-600">{t.expense !== 0 ? "-" + formatCurrency(t.expense) : "-"}</span>
        </div>
      </td>
    ))}
    <td className="py-2 px-3 text-center font-bold bg-gray-200">
      <div className="flex flex-col gap-0.5">
        <span className="text-green-700">
          {totalsPerYear.reduce((sum, t) => sum + t.income, 0) !== 0
            ? "+" + formatCurrency(totalsPerYear.reduce((sum, t) => sum + t.income, 0))
            : "-"}
        </span>
        <span className="text-red-600">
          {totalsPerYear.reduce((sum, t) => sum + t.expense, 0) !== 0
            ? "-" + formatCurrency(totalsPerYear.reduce((sum, t) => sum + t.expense, 0))
            : "-"}
        </span>
      </div>
    </td>
  </tr>
);

export default CategoryYTDTableTotalsRow;
