// React and library imports
import React, { useMemo, useState, useEffect } from "react";
// Component imports
import OutputHeader from "../components/OutputHeader";
import OutputMainContent from "../components/OutputMainContent";
import ExpenseBarChart from "../components/ExpenseBarChart"; // <-- Add this line!
// Utilities
import { useLocation } from "react-router-dom";

// Reuse year/month util
function getAllYears(transactions: any[]) {
  return Array.from(
    new Set(transactions.map((t) => String(t.date).slice(0, 4)))
  ).sort();
}
function getMonthsForYear(transactions: any[], year: string) {
  return Array.from(
    new Set(
      transactions
        .filter((txn) => String(txn.date).slice(0, 4) === year)
        .map((txn) => String(txn.date).slice(5, 7))
    )
  ).sort();
}

// MAIN OUTPUT PAGE
const Output = () => {
  const location = useLocation();
  // Gather state from navigation
  const {
    transactions,
    incomeCategories,
    expenseCategories,
    selectedYear: initialYear,
    categoryGroups = [],
    categoryAssignments = {},
  } = location.state || {};

  // Show error if missing
  if (!transactions) {
    return (
      <div className="flex flex-col min-h-screen w-full items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow p-6 border">
          <div className="text-lg font-semibold mb-2">No data provided</div>
          <div className="mb-4">Go to the <button className="text-blue-600 underline" onClick={() => window.location.replace("/")}>Input Page</button> to enter data.</div>
        </div>
      </div>
    );
  }

  // YEARS + MONTHS STATE
  const allYears = getAllYears(transactions);
  const [selectedYear, setSelectedYear] = useState(
    initialYear && allYears.includes(String(initialYear))
      ? String(initialYear)
      : allYears.length ? allYears[allYears.length - 1] : ""
  );
  const monthsForSelectedYear = getMonthsForYear(transactions, selectedYear);
  const [selectedMonth, setSelectedMonth] = useState(
    monthsForSelectedYear.length ? monthsForSelectedYear[monthsForSelectedYear.length - 1] : "01"
  );
  useEffect(() => {
    const months = getMonthsForYear(transactions, selectedYear);
    setSelectedMonth(months.length ? months[months.length - 1] : "01");
  }, [selectedYear, transactions]);

  // Filtered transactions for month
  const filteredTransactions = useMemo(
    () =>
      transactions.filter(
        (txn: any) =>
          String(txn.date).slice(0, 4) === selectedYear &&
          String(txn.date).slice(5, 7) === selectedMonth
      ),
    [transactions, selectedYear, selectedMonth]
  );

  // Categories merged for reorder logic
  const allCategories = [...(incomeCategories || []), ...(expenseCategories || [])];
  const getDefaultOrder = () => {
    if (allCategories && allCategories.length > 0) {
      const incomes = allCategories.filter(c => c.type === "income");
      const expenses = allCategories.filter(c => c.type === "expense");
      return [...incomes, ...expenses].map(c => c.name);
    }
    return [];
  };
  const [categoryOrder, setCategoryOrder] = React.useState<string[]>(() => {
    let stored = localStorage.getItem("categoryOrder");
    if (stored) return JSON.parse(stored);
    return getDefaultOrder();
  });
  useEffect(() => {
    const defaultOrder = getDefaultOrder();
    setCategoryOrder(oldOrder => {
      let order = oldOrder.filter(n => defaultOrder.includes(n));
      for (let n of defaultOrder) {
        if (!order.includes(n)) order.push(n);
      }
      return order;
    });
    // eslint-disable-next-line
  }, [JSON.stringify(allCategories)]);
  useEffect(() => {
    localStorage.setItem("categoryOrder", JSON.stringify(categoryOrder));
  }, [categoryOrder]);
  const moveCategory = (name: string, dir: "up" | "down") => {
    setCategoryOrder(order => {
      const idx = order.indexOf(name);
      if (idx === -1) return order;
      let newIdx = dir === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= order.length) return order;
      const newOrder = [...order];
      [newOrder[idx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[idx]];
      return newOrder;
    });
  };

  // NEW: group ordering and per-group category ordering
  const [groupOrder, setGroupOrder] = React.useState<string[]>(() => {
    const stored = localStorage.getItem("groupOrder");
    if (stored) return JSON.parse(stored);
    return categoryGroups || [];
  });
  useEffect(() => {
    setGroupOrder((old) => {
      let order = old.filter(g => (categoryGroups || []).includes(g));
      for (let g of (categoryGroups || [])) {
        if (!order.includes(g)) order.push(g);
      }
      return order;
    });
  }, [JSON.stringify(categoryGroups)]);
  useEffect(() => {
    localStorage.setItem("groupOrder", JSON.stringify(groupOrder));
  }, [groupOrder]);

  const [perGroupCategoryOrders, setPerGroupCategoryOrders] = React.useState<Record<string, string[]>>(() => {
    const stored = localStorage.getItem("perGroupCategoryOrders");
    return stored ? JSON.parse(stored) : {};
  });
  useEffect(() => {
    localStorage.setItem("perGroupCategoryOrders", JSON.stringify(perGroupCategoryOrders));
  }, [perGroupCategoryOrders]);

  // -- Add state for selected Expense Category --
  const firstExpenseCategory = (expenseCategories && expenseCategories.length) ? expenseCategories[0].name : "";
  const [selectedExpenseCat, setSelectedExpenseCat] = useState<string>(firstExpenseCategory);

  // NEW: Add state for selected Income Category
  const firstIncomeCategory = (incomeCategories && incomeCategories.length) ? incomeCategories[0].name : "";
  const [selectedIncomeCat, setSelectedIncomeCat] = useState<string>(firstIncomeCategory);

  useEffect(() => {
    if (!selectedExpenseCat && expenseCategories?.length) {
      setSelectedExpenseCat(expenseCategories[0].name);
    }
    if (!selectedIncomeCat && incomeCategories?.length) {
      setSelectedIncomeCat(incomeCategories[0].name);
    }
  }, [JSON.stringify(expenseCategories), JSON.stringify(incomeCategories)]);

  // -- Prepare monthly data for the selected expense category and selected year --
  const monthsInYear = useMemo(() => getMonthsForYear(transactions, selectedYear), [transactions, selectedYear]);
  const orderedMonthLabels = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  function getMonthShortName(numStr: string) {
    const MONTH_NAMES = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const idx = parseInt(numStr, 10) - 1;
    return MONTH_NAMES[idx] || numStr;
  }
  // Build data: for each month ("01"-"12") in the year, sum all transactions with selected category
  const monthlyExpenseData = useMemo(() => {
    if (!selectedExpenseCat) return [];
    // Build a map of {month: amount}
    const monthTotals: Record<string, number> = {};
    for (let m of orderedMonthLabels) {
      monthTotals[m] = 0;
    }
    transactions.forEach((txn: any) => {
      const txnYear = String(txn.date).slice(0, 4);
      const txnMonth = String(txn.date).slice(5, 7);
      if (
        txnYear === selectedYear &&
        txn.category === selectedExpenseCat
      ) {
        monthTotals[txnMonth] += Math.abs(txn.amount);
      }
    });
    return orderedMonthLabels.map(m => ({
      month: getMonthShortName(m),
      value: monthTotals[m]
    }));
  }, [transactions, selectedYear, selectedExpenseCat]);
  // -- Prepare monthly data for selected income category --
  const monthlyIncomeData = useMemo(() => {
    if (!selectedIncomeCat) return [];
    const monthTotals: Record<string, number> = {};
    for (let m of orderedMonthLabels) {
      monthTotals[m] = 0;
    }
    transactions.forEach((txn: any) => {
      const txnYear = String(txn.date).slice(0, 4);
      const txnMonth = String(txn.date).slice(5, 7);
      if (
        txnYear === selectedYear &&
        txn.category === selectedIncomeCat
      ) {
        monthTotals[txnMonth] += Math.abs(txn.amount);
      }
    });
    return orderedMonthLabels.map(m => ({
      month: getMonthShortName(m),
      value: monthTotals[m]
    }));
  }, [transactions, selectedYear, selectedIncomeCat]);

  // RENDER
  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-blue-50 via-white to-green-50 py-0">
      <OutputHeader
        transactions={transactions}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        selectedYear={selectedYear}
        categoryGroups={categoryGroups}
        categoryAssignments={categoryAssignments}
      />
      <OutputMainContent
        transactions={transactions}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        allYears={allYears}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        monthsForSelectedYear={monthsForSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
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

      {/* --- NEW: Income & Expense monthly bar charts in tiles next to each other --- */}
      {(expenseCategories?.length > 0 || incomeCategories?.length > 0) && (
        <div className="max-w-5xl mx-auto mt-12 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Expense Chart */}
          {expenseCategories?.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow border border-muted space-y-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-muted-foreground">Monthly Expense for:</span>
                <select
                  value={selectedExpenseCat}
                  onChange={e => setSelectedExpenseCat(e.target.value)}
                  className="border rounded px-3 py-1 text-sm bg-background"
                >
                  {expenseCategories.map(cat => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <span className="text-muted-foreground font-medium text-sm ml-2">in {selectedYear}</span>
              </div>
              <ExpenseBarChart
                singleCategoryMonthlyData={{
                  months: orderedMonthLabels.map(getMonthShortName),
                  amounts: monthlyExpenseData.map(d => d.value),
                  category: selectedExpenseCat,
                }}
                chartTitle={`Monthly ${selectedExpenseCat} in ${selectedYear}`}
                data={{}}
                categories={[]}
                incomeCategories={[]}
                // No barColor override for expense chart; remains default/red
              />
            </div>
          )}
          {/* Income Chart */}
          {incomeCategories?.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow border border-muted space-y-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-muted-foreground">Monthly Income for:</span>
                <select
                  value={selectedIncomeCat}
                  onChange={e => setSelectedIncomeCat(e.target.value)}
                  className="border rounded px-3 py-1 text-sm bg-background"
                >
                  {incomeCategories.map(cat => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <span className="text-muted-foreground font-medium text-sm ml-2">in {selectedYear}</span>
              </div>
              <ExpenseBarChart
                singleCategoryMonthlyData={{
                  months: orderedMonthLabels.map(getMonthShortName),
                  amounts: monthlyIncomeData.map(d => d.value),
                  category: selectedIncomeCat,
                }}
                chartTitle={`Monthly ${selectedIncomeCat} in ${selectedYear}`}
                data={{}}
                categories={[]}
                incomeCategories={[]}
                barColor="green"
              />
            </div>
          )}
        </div>
      )}

      <footer className="mt-12 text-sm text-right text-muted-foreground px-8 pb-6">
        <span className="opacity-70">© 2025 Your Expense Dashboard</span>
      </footer>
    </div>
  );
};
export default Output;
