
import React from "react";
import CategoryEditor, { Category } from "./CategoryEditor";

type Props = {
  incomeCategories: Category[];
  expenseCategories: Category[];
  setIncomeCategories: (cats: Category[]) => void;
  setExpenseCategories: (cats: Category[]) => void;
};

const CategoryInputSection: React.FC<Props> = ({
  incomeCategories,
  expenseCategories,
  setIncomeCategories,
  setExpenseCategories,
}) => {
  return (
    <div className="bg-white border rounded-lg shadow p-4 mb-2">
      <div className="font-semibold mb-2 text-base">Get Started: Organize Your Categories</div>
      <div className="text-sm text-muted-foreground">
        Define <strong>groups</strong> like "Bills" or "Income Streams" and assign both <span className="font-semibold text-green-800">Income</span> and <span className="font-semibold text-red-700">Expense</span> categories to your chosen groups.<br />
        <span className="block mt-1">Unassigned income and expense categories will appear under default groups ("Other Income" and "Other Expenses") in your reports.</span>
      </div>
      {/* Split Income and Expense side by side */}
      <div className="mt-6 grid sm:grid-cols-2 gap-6 items-start">
        {/* Income Categories */}
        <div>
          <div className="font-medium mb-2 text-green-700 text-sm">Income Categories</div>
          <CategoryEditor
            categories={incomeCategories}
            onCategoriesChange={cats => setIncomeCategories(cats)}
            lockedType="income"
          />
        </div>
        {/* Expense Categories */}
        <div>
          <div className="font-medium mb-2 text-blue-700 text-sm">Expense Categories</div>
          <CategoryEditor
            categories={expenseCategories}
            onCategoriesChange={cats => setExpenseCategories(cats)}
            lockedType="expense"
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryInputSection;
