
import React from "react";
import { formatCurrency } from "./MonthlyCategoryTableUtils";
import type { Category } from "./CategoryEditor";

type Props = {
  cat: Category,
  months: string[],
  grouped: Record<string, Record<string, {income:number,expense:number,net:number}>>,
  categoryTotals: Record<string, {income:number,expense:number,net:number}>,
};

const CategoryTableRow: React.FC<Props> = ({ cat, months, grouped, categoryTotals }) => (
  <tr key={cat.name}>
    <td className="py-2 px-4 font-bold bg-gray-50 sticky left-0 z-10 whitespace-nowrap">{cat.name}</td>
    {months.map(mn => {
      const cdata = grouped[cat.name]?.[mn] || { income:0, expense:0, net:0 };
      // Only show a single value per category: income=green, expense=red
      let value: string = "";
      let colorClass: string = "";
      if (cat.type === "income") {
        value = cdata.income !== 0 ? "+" + formatCurrency(cdata.income) : "-";
        colorClass = "text-green-700";
      } else {
        value = cdata.expense !== 0 ? "-" + formatCurrency(cdata.expense) : "-";
        colorClass = "text-red-600";
      }
      return (
        <td key={mn} className="py-2 px-3 text-center whitespace-nowrap">
          <div className={`font-bold ${colorClass}`}>{value}</div>
        </td>
      );
    })}
    <td className="py-2 px-3 text-center font-bold bg-gray-100 whitespace-nowrap">
      <div className="font-bold">
        {cat.type === "income"
          ? (
            categoryTotals[cat.name]?.income !== 0
              ? <span className="text-green-700">+{formatCurrency(categoryTotals[cat.name].income)}</span>
              : "-"
            )
          : (
            categoryTotals[cat.name]?.expense !== 0
              ? <span className="text-red-600">-{formatCurrency(categoryTotals[cat.name].expense)}</span>
              : "-"
            )
        }
      </div>
    </td>
  </tr>
);

export default CategoryTableRow;

