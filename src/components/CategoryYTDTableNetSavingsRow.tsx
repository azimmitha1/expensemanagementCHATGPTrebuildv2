
import React from "react";
import { formatCurrency } from "./CategoryYTDTableHelpers";

type Props = {
  totalsPerYear: { income: number; expense: number; net: number }[];
  years: string[];
  grandNet: number;
};

const CategoryYTDTableNetSavingsRow: React.FC<Props> = ({ totalsPerYear, years, grandNet }) => (
  <tr>
    <td className="py-2 px-4 font-bold bg-muted sticky left-0 z-10">Net Savings</td>
    {totalsPerYear.map((t, idx) => (
      <td
        key={"net-" + idx}
        className={`py-2 px-3 text-center font-bold ${t.net >= 0 ? "text-green-700" : "text-red-700"} bg-gray-200`}
      >
        = {formatCurrency(t.net)}
      </td>
    ))}
    <td className="py-2 px-3 text-center font-bold bg-gray-300">
      = {formatCurrency(grandNet)}
    </td>
  </tr>
);

export default CategoryYTDTableNetSavingsRow;
