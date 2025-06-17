
import React from "react";
import { getMonthName, getAllMonthsInYear } from "./MonthlyCategoryTableUtils";
import type { Category } from "./CategoryEditor";
import MonthlyCategoryTableBody from "./MonthlyCategoryTableBody";

type Props = {
  transactions: any[];
  categories: Category[];
  incomeCategories: Category[];
  orderedCategoryNames?: string[];
  categoryGroups?: string[];
  categoryAssignments?: Record<string, string>;
  selectedYear: string;
  groupOrder?: string[];
  perGroupCategoryOrders?: Record<string, string[]>;
};

const MonthlyCategoryComparisonTable: React.FC<Props> = ({
  transactions,
  categories,
  incomeCategories,
  orderedCategoryNames,
  categoryGroups,
  categoryAssignments,
  selectedYear,
  groupOrder,
  perGroupCategoryOrders,
}) => {
  const months = getAllMonthsInYear(transactions, Number(selectedYear));

  return (
    <div className="bg-white rounded-xl shadow border border-muted mb-8">
      <div className="p-4 border-b border-muted flex items-center gap-2">
        <span className="font-bold text-base">Monthly Data for Year {selectedYear}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="py-2 px-4 bg-muted text-left sticky left-0 z-10 bg-white">Category</th>
              {months.map((mn, i) => {
                const monthNum = Number(mn.split("-")[1]) - 1;
                return (
                  <th key={mn} className="py-2 px-3 text-center bg-muted">
                    {getMonthName(monthNum)}
                  </th>
                );
              })}
              <th className="py-2 px-3 text-center bg-muted">Total</th>
            </tr>
          </thead>
          <MonthlyCategoryTableBody
            transactions={transactions}
            categories={categories}
            incomeCategories={incomeCategories}
            orderedCategoryNames={orderedCategoryNames}
            categoryGroups={categoryGroups}
            categoryAssignments={categoryAssignments}
            selectedYear={selectedYear}
            groupOrder={groupOrder}
            perGroupCategoryOrders={perGroupCategoryOrders}
            months={months}
          />
        </table>
      </div>
      <div className="p-4 text-xs text-muted-foreground">
        Income (<span className="text-green-700">green +</span>), Expenses (<span className="text-red-600">red -</span>), Net (=).
      </div>
    </div>
  );
};

export default MonthlyCategoryComparisonTable;

