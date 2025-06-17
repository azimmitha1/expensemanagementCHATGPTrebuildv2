
import React from "react";
import SummaryDashboard from "../components/SummaryDashboard";
import YearMonthPicker from "./YearMonthPicker";

type Props = {
  transactions: any[];
  incomeCategories: any[];
  expenseCategories: any[];
  allYears: string[];
  selectedYear: string;
  setSelectedYear: (y: string) => void;
  monthsForSelectedYear: string[];
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  filteredTransactions: any[];
  categoryOrder: string[];
  moveCategory: (name: string, dir: "up" | "down") => void;
  categoryGroups?: string[];
  categoryAssignments?: Record<string, string>;
  groupOrder?: string[];
  setGroupOrder?: (next: string[]) => void;
  perGroupCategoryOrders?: Record<string, string[]>;
  setPerGroupCategoryOrders?: (next: Record<string, string[]>) => void;
};

const OutputMainContent: React.FC<Props> = ({
  transactions,
  incomeCategories,
  expenseCategories,
  allYears,
  selectedYear,
  setSelectedYear,
  monthsForSelectedYear,
  selectedMonth,
  setSelectedMonth,
  filteredTransactions,
  categoryOrder,
  moveCategory,
  categoryGroups = [],
  categoryAssignments = {},
  groupOrder = [],
  setGroupOrder = () => {},
  perGroupCategoryOrders = {},
  setPerGroupCategoryOrders = () => {},
}) => {
  const allCategories = [...(incomeCategories || []), ...(expenseCategories || [])];
  return (
    <main className="w-full max-w-screen-2xl mx-auto px-6 py-8">
      <YearMonthPicker
        allYears={allYears}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        monthsForSelectedYear={monthsForSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />
      {/* Pass new ordering/grouping props */}
      <SummaryDashboard
        transactions={transactions}
        categories={allCategories}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        filteredTransactions={filteredTransactions}
        categoryOrder={categoryOrder}
        moveCategory={moveCategory}
        categoryGroups={categoryGroups}
        categoryAssignments={categoryAssignments}
        groupOrder={groupOrder}
        setGroupOrder={setGroupOrder}
        perGroupCategoryOrders={perGroupCategoryOrders}
        setPerGroupCategoryOrders={setPerGroupCategoryOrders}
      />
    </main>
  );
};

export default OutputMainContent;
