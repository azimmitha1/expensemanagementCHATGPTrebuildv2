
import React from "react";
import CategoryTableRow from "./CategoryTableRow";
import { formatCurrency } from "./CategoryYTDTableHelpers";
import type { Category } from "./CategoryEditor";

type Props = {
  sectionName: string;
  cats: Category[];
  years: string[];
  ytdTotals: Record<string, Record<string, { income: number; expense: number; net: number }>>;
};

const CategoryYTDOtherSection: React.FC<Props> = ({
  sectionName,
  cats,
  years,
  ytdTotals
}) => {
  if (!cats.length) return null;

  return (
    <>
      <tr>
        <td colSpan={years.length + 2} className="bg-blue-100 font-bold text-blue-900 py-1 px-4">{sectionName}</td>
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
      {/* Sub-Total Row for the section */}
      <tr>
        <td className="py-2 px-4 font-bold bg-blue-50 sticky left-0 z-10 whitespace-nowrap">Sub-Total</td>
        {years.map(year => {
          let income = 0, expense = 0;
          for (const cat of cats) {
            const v = ytdTotals[cat.name][year] || { income: 0, expense: 0, net: 0 };
            income += v.income;
            expense += v.expense;
          }
          return (
            <td key={year} className="py-2 px-3 text-center font-bold bg-blue-50">
              <div className="flex flex-col gap-0.5">
                <span className="text-green-700">{income !== 0 ? "+" + formatCurrency(income) : "-"}</span>
                <span className="text-red-600">{expense !== 0 ? "-" + formatCurrency(expense) : "-"}</span>
              </div>
            </td>
          );
        })}
        <td className="py-2 px-3 text-center font-bold bg-blue-200">
          <div className="flex flex-col gap-0.5">
            <span className="text-green-700">
              {cats.reduce((tot, cat) =>
                tot + years.reduce((s, year) =>
                  s + (ytdTotals[cat.name][year]?.income || 0), 0), 0) !== 0
                ? "+" + cats.reduce((tot, cat) => tot + years.reduce((s, year) => s + (ytdTotals[cat.name][year]?.income || 0), 0), 0).toLocaleString(undefined, {minimumFractionDigits:2})
                : "-"
              }
            </span>
            <span className="text-red-600">
              {cats.reduce((tot, cat) =>
                tot + years.reduce((s, year) =>
                  s + (ytdTotals[cat.name][year]?.expense || 0), 0), 0) !== 0
                ? "-" + cats.reduce((tot, cat) => tot + years.reduce((s, year) => s + (ytdTotals[cat.name][year]?.expense || 0), 0), 0).toLocaleString(undefined, {minimumFractionDigits:2})
                : "-"
              }
            </span>
          </div>
        </td>
      </tr>
    </>
  );
};

export default CategoryYTDOtherSection;
