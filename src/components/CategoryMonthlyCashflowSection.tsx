
import React from "react";
import CategoryTableRow from "./CategoryTableRow";
import type { Category } from "./CategoryEditor";

type Props = {
  cashflowCats: Category[];
  years: string[];
  monthlyTotals: Record<string, Record<string, {income:number,expense:number,net:number}>>;
  cashflowTotals: number[];
  grandCashflow: number;
};

const CategoryMonthlyCashflowSection: React.FC<Props> = ({
  cashflowCats,
  years,
  monthlyTotals,
  cashflowTotals,
  grandCashflow
}) => {
  if (!cashflowCats.length) return null;
  return (
    <>
      <tr>
        <td colSpan={years.length + 2} className="bg-blue-100 font-bold text-blue-900 py-1 px-4">Cashflow items</td>
      </tr>
      {cashflowCats.map(cat => (
        <CategoryTableRow
          key={cat.name}
          cat={cat}
          months={years}
          grouped={monthlyTotals}
          categoryTotals={{
            [cat.name]: years.reduce(
              (tot, yr) => {
                const v = monthlyTotals[cat.name][yr] || { income: 0, expense: 0, net: 0 };
                tot.income += v.income;
                tot.expense += v.expense;
                tot.net += v.net;
                return tot;
              },
              { income: 0, expense: 0, net: 0 }
            ),
          }}
        />
      ))}
      {/* Cashflow total row */}
      <tr>
        <td className="py-2 px-4 font-bold bg-blue-50 sticky left-0 z-10 whitespace-nowrap">Sub-Total</td>
        {years.map((year, i) => (
          <td key={year} className="py-2 px-3 text-center font-bold bg-blue-50">
            <span>{cashflowTotals[i].toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </td>
        ))}
        <td className="py-2 px-3 text-center font-bold bg-blue-200">
          {grandCashflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </td>
      </tr>
    </>
  );
};

export default CategoryMonthlyCashflowSection;
