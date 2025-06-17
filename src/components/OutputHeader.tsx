
import React from "react";
import { useNavigate } from "react-router-dom";

type OutputHeaderProps = {
  transactions: any[];
  incomeCategories: any[];
  expenseCategories: any[];
  selectedYear: string;
  categoryGroups?: string[];
  categoryAssignments?: Record<string, string>;
};

const OutputHeader: React.FC<OutputHeaderProps> = ({
  transactions,
  incomeCategories,
  expenseCategories,
  selectedYear,
  categoryGroups,
  categoryAssignments,
}) => {
  const navigate = useNavigate();
  return (
    <header className="px-12 py-8 flex flex-col md:flex-row md:items-end gap-2 md:gap-8 shadow-sm bg-gradient-to-r from-blue-600 via-sky-500 to-green-400 text-white">
      <div>
        <h1 className="text-3xl font-extrabold tracking-wide mb-1">Expense Dashboard – Output</h1>
        <p className="text-base opacity-90 font-light">View reports and analytics from your inputs.</p>
      </div>
      <div className="ml-auto">
        <button
          className="rounded px-4 py-2 bg-white text-blue-700 font-semibold shadow hover:bg-blue-50"
          onClick={() =>
            navigate("/", {
              state: {
                transactions,
                incomeCategories,
                expenseCategories,
                selectedYear,
                categoryGroups,
                categoryAssignments,
              },
            })
          }
        >
          ← Back to Input
        </button>
      </div>
    </header>
  );
};

export default OutputHeader;
