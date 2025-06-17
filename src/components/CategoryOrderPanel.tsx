
import React from "react";
import type { Category } from "./CategoryEditor";

type Props = {
  categories: Category[];
  categoryOrder: string[];
  moveCategory: (name: string, dir: "up" | "down") => void;
};

const CategoryOrderPanel: React.FC<Props> = ({ categories, categoryOrder, moveCategory }) => {
  // Sort according to order; append any missing ones at the end.
  const ordered = categoryOrder
    .map(name => categories.find(c => c.name === name))
    .filter((c): c is Category => !!c);
  const extras = categories.filter(c => !categoryOrder.includes(c.name));
  const fullCategoryObjs = [...ordered, ...extras];

  return (
    <div className="mb-6 max-w-2xl">
      <div className="font-semibold text-base pb-1">Category Order (drag or use arrows):</div>
      <div className="bg-white border shadow-sm rounded overflow-x-auto px-3 py-2">
        <ul className="flex flex-col gap-2">
          {fullCategoryObjs.map((c, idx) => (
            <li key={c.name} className="flex items-center gap-2">
              <span className={`font-medium rounded px-2 py-1 ${c.type==="income" ? "bg-green-50 text-green-900 border border-green-300" : "bg-blue-50 text-blue-900 border border-blue-300"}`}>
                {c.name}
                <span className={`text-xs ml-2 px-1 rounded ${c.type==="income" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                  {c.type === "income" ? "Income" : "Expense"}
                </span>
              </span>
              <button
                disabled={idx === 0}
                onClick={() => moveCategory(c.name, "up")}
                className="ml-1 px-1 py-0.5 text-gray-500 hover:text-blue-700 disabled:opacity-40"
                title="Move Up"
                aria-label="Move up"
              >
                ▲
              </button>
              <button
                disabled={idx === fullCategoryObjs.length - 1}
                onClick={() => moveCategory(c.name, "down")}
                className="px-1 py-0.5 text-gray-500 hover:text-blue-700 disabled:opacity-40"
                title="Move Down"
                aria-label="Move down"
              >
                ▼
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="text-xs text-muted-foreground pt-2">
        Income categories are shown first by default; you may reorder categories as you wish. Applies to all tables and charts below.
      </div>
    </div>
  );
};

export default CategoryOrderPanel;
