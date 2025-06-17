
import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { CategoryType } from "./CategoryGroupsPanel";

type AssignmentProps = {
  title: string;
  categories: string[];
  assignments: Record<string, string>;
  onAssign: (cat: string, group: string) => void;
  onRemove: (cat: string) => void;
  allowedGroupOptions: (cat: string) => { label: string; value: string }[];
  categoryTypes: Record<string, CategoryType>;
};

const pillColors: Record<CategoryType, string> = {
  income: "bg-green-100 text-green-800 border border-green-200",
  expense: "bg-red-100 text-red-700 border border-red-200",
};

const OTHER_INCOME_GROUP_NAME = "Other Income";
const OTHER_EXPENSES_GROUP_NAME = "Other Expenses";

const CategoryListAssignment: React.FC<AssignmentProps> = ({
  title,
  categories,
  assignments,
  onAssign,
  onRemove,
  allowedGroupOptions,
  categoryTypes,
}) => (
  <div className="mb-6">
    <div className="font-bold text-xs mb-2">{title}</div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
      {categories.map((cat) => {
        // By default, display "Other Income" for unset income, "Other Expenses" for unset expense
        let selectedValue: string = assignments[cat] || "";
        if (!selectedValue) {
          if (categoryTypes[cat] === "income") {
            selectedValue = OTHER_INCOME_GROUP_NAME;
          } else if (categoryTypes[cat] === "expense") {
            selectedValue = OTHER_EXPENSES_GROUP_NAME;
          }
        }
        return (
          <div
            className="flex items-center gap-2 border-b last:border-b-0 pb-1"
            key={cat}
          >
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold mr-1 ${pillColors[categoryTypes[cat] || "expense"]}`}>
              {categoryTypes[cat] === "income" ? "Income" : "Expense"}
            </span>
            <span className="text-xs font-medium">{cat}</span>
            <select
              value={selectedValue}
              onChange={(e) =>
                e.target.value
                  ? onAssign(cat, e.target.value)
                  : onRemove(cat)
              }
              className="border px-2 h-7 rounded text-xs"
            >
              {allowedGroupOptions(cat).map((opt) => (
                <option value={opt.value} key={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {assignments[cat] && (
              <button
                className="text-xs text-gray-400"
                onClick={() => onRemove(cat)}
              >
                Clear
              </button>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

export default CategoryListAssignment;

