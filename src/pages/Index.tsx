import React, { useState, useEffect, useMemo } from "react";
import TransactionImporter from "../components/TransactionImporter";
import TransactionTable from "../components/TransactionTable";
import CategoryEditor, { Category } from "../components/CategoryEditor";
import SummaryDashboard from "../components/SummaryDashboard";
import { useNavigate } from "react-router-dom";
import { generateDemoTransactions, DEFAULT_INCOME_CATEGORIES_DEEP, DEFAULT_EXPENSE_CATEGORIES_DEEP } from "../utils/demoTransactions";
import { getAllYears } from "../utils/dateUtils";
import ManualTransactionDialog from "../components/ManualTransactionDialog";
import CategoryGroupsPanel from "../components/CategoryGroupsPanel";
import CategoryGroupsOrderPanel from "../components/CategoryGroupsOrderPanel"; // NEW
import CategoryInputSection from "../components/CategoryInputSection";
import YearMonthPicker from "../components/YearMonthPicker";
import UndefinedTransactionsTable from "../components/UndefinedTransactionsTable";
import { useAuth } from "../components/AuthContext";

// Utility functions for persisting categories
const LOCALSTORAGE_INCOME_KEY = "persisted_income_categories";
const LOCALSTORAGE_EXPENSE_KEY = "persisted_expense_categories";

// === New for groups and assignments ===
const LOCALSTORAGE_GROUPS_KEY = "persisted_category_groups";
const LOCALSTORAGE_ASSIGNMENTS_KEY = "persisted_category_assignments";

const loadPersistedCategories = (
  key: string,
  fallback: Category[]
): Category[] => {
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch {}
  return fallback;
};
const savePersistedCategories = (key: string, cats: Category[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(cats));
  } catch {}
};

// --- New utilities ---
const loadPersistedGroups = (): string[] => {
  try {
    const data = localStorage.getItem(LOCALSTORAGE_GROUPS_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return [];
};
const savePersistedGroups = (groups: string[]) => {
  try {
    localStorage.setItem(LOCALSTORAGE_GROUPS_KEY, JSON.stringify(groups));
  } catch {}
};
const loadPersistedAssignments = (): Record<string, string> => {
  try {
    const data = localStorage.getItem(LOCALSTORAGE_ASSIGNMENTS_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return {};
};
const savePersistedAssignments = (assignments: Record<string, string>) => {
  try {
    localStorage.setItem(LOCALSTORAGE_ASSIGNMENTS_KEY, JSON.stringify(assignments));
  } catch {}
};

// Use the utility to get default dummy transaction data and categories
const demoTransactions = generateDemoTransactions();

// If the defaults are string[], map to { name, type }
const processCategoryDefaults = (arr: any, type: "income" | "expense"): Category[] =>
  Array.isArray(arr)
    ? arr.map((item: any) =>
        typeof item === "string"
          ? { name: item, type }
          : item // already in Category format
      )
    : [];

const defaultIncomeCategories: Category[] = processCategoryDefaults(DEFAULT_INCOME_CATEGORIES_DEEP, "income");
const defaultExpenseCategories: Category[] = processCategoryDefaults(DEFAULT_EXPENSE_CATEGORIES_DEEP, "expense");

// Add new transactions persistence utility
const LOCALSTORAGE_TRANSACTIONS_KEY = "persisted_transactions";

// Loading transactions from localStorage, fallback to demo if none
const loadPersistedTransactions = (): any[] => {
  try {
    const data = localStorage.getItem(LOCALSTORAGE_TRANSACTIONS_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return demoTransactions;
};
const savePersistedTransactions = (txns: any[]) => {
  try {
    localStorage.setItem(LOCALSTORAGE_TRANSACTIONS_KEY, JSON.stringify(txns));
  } catch {}
};

const Index = () => {
  // Load persisted transactions instead of demo
  const [transactions, setTransactions] = useState<any[]>(() => loadPersistedTransactions());

  // Load categories from localStorage if present
  const [incomeCategories, setIncomeCategories] = useState<Category[]>(
    () => loadPersistedCategories(LOCALSTORAGE_INCOME_KEY, defaultIncomeCategories)
  );
  const [expenseCategories, setExpenseCategories] = useState<Category[]>(
    () => loadPersistedCategories(LOCALSTORAGE_EXPENSE_KEY, defaultExpenseCategories)
  );

  // Persist categories on change
  useEffect(() => {
    savePersistedCategories(LOCALSTORAGE_INCOME_KEY, incomeCategories);
  }, [incomeCategories]);
  useEffect(() => {
    savePersistedCategories(LOCALSTORAGE_EXPENSE_KEY, expenseCategories);
  }, [expenseCategories]);

  // Persist transactions on any change
  useEffect(() => {
    savePersistedTransactions(transactions);
  }, [transactions]);

  // Handler for importing new transactions
  const handleorted = (newTransactions: any[]) => {
    // VALIDATE allCategories array (gathering names from current categories)
    const categoriesArray = [
      ...(incomeCategories || []),
      ...(expenseCategories || []),
    ].map((c) => c.name).filter(c => typeof c === "string" && c.trim() !== "");
    // Ensure we have at least one valid category to assign
    if (!categoriesArray.length) {
      // Defensive—should not happen, but abort if no valid categories at all
      alert("No valid categories found! Please create at least one income or expense category before importing transactions.");
      return;
    }
    // Fallback category for assignment
    const fallbackCategory =
      categoriesArray.find((c) => !!c && typeof c === "string" && c.trim() !== "") || "Uncategorized";
    // For every txn: if missing/invalid/empty category, assign to fallback
    const sanitizedTxns = (newTransactions || []).map((txn) => {
      let safeCat = txn.category;
      if (!categoriesArray.includes(safeCat)) safeCat = fallbackCategory;
      if (!safeCat || typeof safeCat !== "string" || !safeCat.trim()) safeCat = fallbackCategory;
      return { ...txn, category: safeCat };
    }).filter(txn => !!txn.category && typeof txn.category === "string" && txn.category.trim() !== "");

    // Defensive: if any new imported transactions still have empty/invalid categories, abort import (should not occur)
    if (!sanitizedTxns.length) {
      alert("Import failed. No transactions could be assigned to a valid category. Please check your category list.");
      return;
    }

    setTransactions((prevTransactions) => [
      ...prevTransactions,
      ...sanitizedTxns,
    ]);

    // After import, update filters so selectedYear and selectedMonth are valid!
    // Get all years/months from updated list
    const allTxns = [...transactions, ...sanitizedTxns];
    const years = Array.from(
      new Set((allTxns || []).map((txn) => String(txn.date).slice(0, 4)))
    ).sort();
    const mostRecentYear = years.length ? years[years.length - 1] : "";
    if (!selectedYear || !years.includes(selectedYear)) {
      setSelectedYear(mostRecentYear);
    }
    const monthsForYear = Array.from(
      new Set(
        (allTxns || [])
          .filter((txn) => String(txn.date).slice(0, 4) === mostRecentYear)
          .map((txn) => {
            const month = String(txn.date).slice(5, 7);
            return month.length === 2 ? month : `0${month}`;
          })
      )
    ).sort();
    const mostRecentMonth = monthsForYear.length
      ? monthsForYear[monthsForYear.length - 1]
      : "";
    if (!selectedMonth || !monthsForYear.includes(selectedMonth)) {
      setSelectedMonth(mostRecentMonth);
    }
  };

  // Handler for updating category on transaction
  const handleCategoryChange = (idx: number, newCategory: string) => {
    setTransactions((txns) =>
      txns.map((txn, i) =>
        i === idx ? { ...txn, category: newCategory } : txn
      )
    );
  };

  // Handler for adding/editing categories – expects Category objects, splits into income/expense
  const handleCategoriesChange = (cats: Category[]) => {
    setIncomeCategories(cats.filter(c => c.type === "income"));
    setExpenseCategories(cats.filter(c => c.type === "expense"));
  };

  // Handler to add a new manual transaction
  const handleAddManualTransaction = (txn: { date: string; description: string; amount: number; category: string }) => {
    setTransactions(prev => [
      { ...txn, amount: Number(txn.amount) },
      ...prev,
    ]);
  };

  // Handler for deleting a transaction
  const handleDeleteTransaction = (idx: number) => {
    setTransactions(txns => txns.filter((_, i) => i !== idx));
  };

  // Handler for editing transaction amount
  const handleAmountChange = (idx: number, newAmount: number) => {
    setTransactions(txns =>
      txns.map((txn, i) =>
        i === idx
          ? { ...txn, amount: newAmount }
          : txn
      )
    );
  };

  // Handler for editing transaction date
  const handleDateChange = (idx: number, newDate: string) => {
    setTransactions(txns =>
      txns.map((txn, i) =>
        i === idx
          ? { ...txn, date: newDate }
          : txn
      )
    );
  };

  // Handler for editing transaction description
  const handleDescriptionChange = (idx: number, newDesc: string) => {
    setTransactions(txns =>
      txns.map((txn, i) =>
        i === idx
          ? { ...txn, description: newDesc }
          : txn
      )
    );
  };

  // For now, handle categories as a single set for legacy components in parallel:
  const allCategories: Category[] = [...(incomeCategories || []), ...(expenseCategories || [])];

  // == CATEGORY ORDERING ==
  // Use localStorage to persist order (by category name)
  const getDefaultOrder = () => {
    if (allCategories && allCategories.length > 0) {
      const incomes = allCategories.filter(c => c.type === "income");
      const expenses = allCategories.filter(c => c.type === "expense");
      return [...incomes, ...expenses].map(c => c.name);
    }
    return [];
  };
  const [categoryOrder, setCategoryOrder] = React.useState<string[]>(() => {
    let stored = undefined;
    try {
      stored = localStorage.getItem("categoryOrder");
    } catch {}
    if (stored) return JSON.parse(stored);
    return getDefaultOrder();
  });

  // When categories change (new, removed), sync the order list
  useEffect(() => {
    // Add new categories at end, remove old
    const defaultOrder = getDefaultOrder();
    setCategoryOrder(oldOrder => {
      let order = (oldOrder || []).filter(n => defaultOrder.includes(n));
      for (let n of defaultOrder) {
        if (!order.includes(n)) order.push(n);
      }
      return order;
    });
    // eslint-disable-next-line
  }, [JSON.stringify(allCategories)]);

  // Persist order
  useEffect(() => {
    try {
      localStorage.setItem("categoryOrder", JSON.stringify(categoryOrder || []));
    } catch (err) {
      // If storage breaks, fail gracefully
      console.warn("categoryOrder persist error:", err);
    }
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

  // Add state to support custom groups and assignments
  const [categoryGroups, setCategoryGroups] = useState<string[]>(() => loadPersistedGroups());
  const [categoryAssignments, setCategoryAssignments] = useState<Record<string, string>>(
    () => loadPersistedAssignments()
  );

  // Watch and persist groups and assignments
  useEffect(() => {
    savePersistedGroups(categoryGroups);
  }, [categoryGroups]);
  useEffect(() => {
    savePersistedAssignments(categoryAssignments);
  }, [categoryAssignments]);

  const navigate = useNavigate();

  // Prepare categoryTypes so it can be passed to the groups panel
  const categoryTypes: Record<string, "income" | "expense"> = {};
  for (const c of allCategories) categoryTypes[c.name] = c.type;

  // Helper to look up group name for categories
  function getGroupForCategory(catName: string) {
    return categoryAssignments[catName] && categoryGroups.includes(categoryAssignments[catName])
      ? categoryAssignments[catName]
      : "Other";
  }

  // == Year/Month filter states ==
  const allYears = React.useMemo(() => getAllYears(transactions || []), [transactions]);
  const mostRecentYear = allYears.length ? allYears[allYears.length - 1] : "";
  const [selectedYear, setSelectedYear] = useState(mostRecentYear);

  const monthsForSelectedYear = React.useMemo(() => {
    return Array.from(
      new Set(
        (transactions || [])
          .filter(txn => String(txn.date).slice(0, 4) === selectedYear)
          .map(txn => {
            const month = String(txn.date).slice(5, 7);
            return month.length === 2 ? month : `0${month}`;
          })
      )
    ).sort();
  }, [selectedYear, transactions]);
  const mostRecentMonth = monthsForSelectedYear.length
    ? monthsForSelectedYear[monthsForSelectedYear.length - 1]
    : "";
  const [selectedMonth, setSelectedMonth] = useState(mostRecentMonth);

  // --- ENSURE selectedYear and selectedMonth are always valid ---
  React.useEffect(() => {
    if ((!selectedYear || !allYears.includes(selectedYear)) && allYears.length) {
      setSelectedYear(allYears[allYears.length - 1]);
    }
  }, [JSON.stringify(allYears), selectedYear]);

  React.useEffect(() => {
    if (
      (!selectedMonth || !monthsForSelectedYear.includes(selectedMonth)) &&
      monthsForSelectedYear.length
    ) {
      setSelectedMonth(monthsForSelectedYear[monthsForSelectedYear.length - 1]);
    }
  }, [JSON.stringify(monthsForSelectedYear), selectedMonth]);

  // New: Split transactions into dated and undefined
  const [undefinedSelectedRows, setUndefinedSelectedRows] = React.useState<number[]>([]);
  const [tableSelectedRows, setTableSelectedRows] = React.useState<number[]>([]);

  // Helper for undefined transactions
  const undefinedTransactions = transactions.filter(txn => !txn.date || !/^\d{4}-\d{2}-\d{2}$/.test(txn.date));
  // Dated transactions - use in filters
  const datedTransactions = transactions.filter(txn => txn.date && /^\d{4}-\d{2}-\d{2}$/.test(txn.date));

  // Filter transactions by year & month
  const filteredTransactions = React.useMemo(() => {
    if (!datedTransactions || !selectedYear || !selectedMonth) return [];
    return (datedTransactions || []).filter(
      txn =>
        String(txn.date).slice(0, 4) === selectedYear &&
        String(txn.date).slice(5, 7) === selectedMonth
    );
  }, [datedTransactions, selectedYear, selectedMonth]);

  // Bulk delete logic for transaction table (dated transactions)
  const handleTableRowSelect = (idx: number, selected: boolean) => {
    setTableSelectedRows(prev =>
      selected ? [...prev, idx] : prev.filter(i => i !== idx)
    );
  };
  const handleTableSelectAll = (selectAll: boolean) => {
    setTableSelectedRows(selectAll ? filteredTransactions.map((_, idx) => idx) : []);
  };
  const handleTableBulkDelete = () => {
    // Remove all filteredTransactions at selected indices
    const indexesToRemove = new Set(tableSelectedRows);
    setTransactions(
      txns => txns.filter((txn, i) => {
        // Only compare against filteredTransactions positions
        const currentIdx = filteredTransactions.findIndex(f => f === txn);
        return currentIdx === -1 || !indexesToRemove.has(currentIdx);
      })
    );
    setTableSelectedRows([]);
  };

  // Bulk delete logic for undefined transactions
  const handleUndefinedRowSelect = (idx: number, selected: boolean) => {
    setUndefinedSelectedRows(prev =>
      selected ? [...prev, idx] : prev.filter(i => i !== idx)
    );
  };
  const handleUndefinedSelectAll = (selectAll: boolean) => {
    setUndefinedSelectedRows(selectAll ? undefinedTransactions.map((_, idx) => idx) : []);
  };
  const handleUndefinedBulkDelete = () => {
    // Remove all undefined txns at selected indices
    const indexesToRemove = new Set(undefinedSelectedRows);
    setTransactions(
      txns => txns.filter((txn, i) => {
        // Only compare against undefinedTransactions positions
        const currentIdx = undefinedTransactions.findIndex(f => f === txn);
        return currentIdx === -1 || !indexesToRemove.has(currentIdx);
      })
    );
    setUndefinedSelectedRows([]);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-blue-50 via-white to-green-50 py-0">
      <header className="px-12 py-8 flex flex-col md:flex-row md:items-end gap-2 md:gap-8 shadow-sm bg-gradient-to-r from-blue-600 via-sky-500 to-green-400 text-white">
        <div>
          <h1 className="text-4xl font-extrabold tracking-wide mb-2">Personal Expense Dashboard</h1>
          <p className="text-lg opacity-90 font-light">Import, categorise, and visualise your expenses with ease.</p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          {/* Removed old CategoryEditor as these controls now appear in the input section below */}
          <button
            className="rounded px-4 py-2 bg-white text-blue-700 font-semibold shadow hover:bg-blue-50"
            onClick={() =>
              navigate("/output", {
                state: {
                  transactions,
                  incomeCategories,
                  expenseCategories,
                  selectedYear,
                  categoryGroups, // Pass groups
                  categoryAssignments, // Pass assignments
                }
              })
            }
          >
            Go to Output →
          </button>
          <LogoutButton />
        </div>
      </header>
      <main className="w-full max-w-screen-2xl mx-auto px-6 py-8 grid grid-cols-1 gap-10">
        {/* Input Section Only: Import + Year picker + Category Editor + Order Panel */}
        <section className="space-y-6">
          {/* Category Management Input Box - now refactored */}
          <CategoryInputSection
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
            setIncomeCategories={setIncomeCategories}
            setExpenseCategories={setExpenseCategories}
          />
          {/* Category Group Order Panel */}
          <CategoryGroupsOrderPanel
            groups={categoryGroups}
            onGroupsChange={setCategoryGroups}
          />
          {/* Category Group Panel */}
          <CategoryGroupsPanel
            groups={categoryGroups}
            onGroupsChange={setCategoryGroups}
            assignments={categoryAssignments}
            categories={allCategories.map(c => c.name)}
            onAssignmentsChange={setCategoryAssignments}
            categoryTypes={categoryTypes}
          />
          {/* ---- REMOVE: Expense Categories & Their Broad Category TABLE ---- */}
          {/* Import Transactions */}
          <TransactionImporter
            onorted={handleorted}
            categories={allCategories.map(c => c.name)}
          />
          {/* Manually Add Transaction button placed BELOW import */}
          <div>
            <ManualTransactionDialog
              categories={allCategories.map(c => c.name)}
              onAdd={handleAddManualTransaction}
              buttonText="Manually Add Transactions"
            />
          </div>

          {/* Year & Month Picker */}
          <YearMonthPicker
            allYears={allYears}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            monthsForSelectedYear={monthsForSelectedYear}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />

          {/* Show Undefined Transactions section */}
          <UndefinedTransactionsTable
            transactions={undefinedTransactions}
            onDateChange={(idx, newDate) => {
              // Edit the corresponding undefined transaction
              setTransactions(txns =>
                txns.map((txn, i) =>
                  undefinedTransactions[idx] === txn
                    ? { ...txn, date: newDate }
                    : txn
                )
              );
            }}
            onDescriptionChange={(idx, newDesc) => {
              setTransactions(txns =>
                txns.map((txn, i) =>
                  undefinedTransactions[idx] === txn
                    ? { ...txn, description: newDesc }
                    : txn
                )
              );
            }}
            onDeleteTransaction={idx => {
              setTransactions(txns =>
                txns.filter(txn => txn !== undefinedTransactions[idx])
              );
            }}
            selectedRows={undefinedSelectedRows}
            onRowSelect={handleUndefinedRowSelect}
            onSelectAll={handleUndefinedSelectAll}
            onBulkDelete={handleUndefinedBulkDelete}
          />

          {/* ---- REMOVE: Expense Categories & Their Broad Category TABLE ---- */}
          {/* Show only filtered transactions for the selected year & month */}
          <TransactionTable
            transactions={filteredTransactions}
            categories={allCategories.map(c => c.name)}
            onCategoryChange={handleCategoryChange}
            onDeleteTransaction={handleDeleteTransaction}
            onAmountChange={handleAmountChange}
            onDateChange={handleDateChange}
            onDescriptionChange={handleDescriptionChange}
            selectedRows={tableSelectedRows}
            onRowSelect={handleTableRowSelect}
            onSelectAll={handleTableSelectAll}
            onBulkDelete={handleTableBulkDelete}
          />
          {/* Year Picker REMOVED */}
        </section>
        {/* Output Section */}
        {/* Might want to add <TransactionTable /> here to show transactions */}
      </main>
      <footer className="mt-12 text-sm text-right text-muted-foreground px-8 pb-6">
        <span className="opacity-70">© 2025 Your Expense Dashboard</span>
      </footer>
    </div>
  );
};

// Add a LogoutButton subcomponent using useAuth
function LogoutButton() {
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };
  return (
    <button
      className="ml-4 rounded px-4 py-2 bg-red-500 text-white font-semibold shadow hover:bg-red-600"
      type="button"
      onClick={handleLogout}
    >
      Log out
    </button>
  );
}

export default Index;
