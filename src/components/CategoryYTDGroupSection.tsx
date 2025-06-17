
import React from "react";
import type { Category } from "./CategoryEditor";
import CategoryTableRow from "./CategoryTableRow";

type YtdTotals = Record<string, Record<string, { income: number; expense: number; net: number }>>;

type Props = {
  group: string;
  cats: Category[];
  years: string[];
  ytdTotals: YtdTotals;
};

const CategoryYTDGroupSection: React.FC<Props> = ({ group, cats, years, ytdTotals }) => {
  if (!cats.length) return null;

  // Subtotals for this group per year
  const subtotals: Record<string, {income:number, expense:number, net:number}> = {};
  for (const year of years) {
    let income = 0, expense = 0, net = 0;
    for (const cat of cats) {
      const v = ytdTotals[cat.name][year] || { income: 0, expense: 0, net: 0 };
      income += v.income;
      expense += v.expense;
      net += v.net;
    }
    subtotals[year] = { income, expense, net };
  }
  let totalIncome = 0, totalExpense = 0, totalNet = 0;
  for (const cat of cats) {
    const totals = years.reduce(
      (tot, yr) => {
        const v = ytdTotals[cat.name][yr] || { income: 0, expense: 0, net: 0 };
        tot.income += v.income;
        tot.expense += v.expense;
        tot.net += v.net;
        return tot;
      },
      { income: 0, expense: 0, net: 0 }
    );
    totalIncome += totals.income;
    totalExpense += totals.expense;
    totalNet += totals.net;
  }
  return (
    <>
      <tr>
        <td colSpan={years.length + 2} className="bg-blue-100 font-bold text-blue-900 py-1 px-4">{group}</td>
      </tr>
      {cats.map(cat => (
        <CategoryTableRow
          key={cat.name}
          cat={cat}
          months={years}
          grouped={ytdTotals}
          categoryTotals={{
            [cat.name]: years.reduce(
              (tot, yr) => {
                const v = ytdTotals[cat.name][yr] || { income: 0, expense: 0, net: 0 };
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
      <tr>
        <td className="py-2 px-4 font-bold bg-blue-50 sticky left-0 z-10 whitespace-nowrap">Sub-Total</td>
        {years.map(year => (
          <td key={year} className="py-2 px-3 text-center font-bold bg-blue-50">
            <div className="flex flex-col gap-0.5">
              <span className="text-green-700">{subtotals[year].income !== 0 ? "+" + (subtotals[year].income).toLocaleString(undefined, {minimumFractionDigits:2}) : "-"}</span>
              <span className="text-red-600">{subtotals[year].expense !== 0 ? "-" + (subtotals[year].expense).toLocaleString(undefined, {minimumFractionDigits:2}) : "-"}</span>
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
    </>
  );
};
export default CategoryYTDGroupSection;
