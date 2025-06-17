import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowDown } from "lucide-react";
import CategoryGroupList from "./CategoryGroupList";
import CategoryListAssignment from "./CategoryListAssignment";

export type CategoryType = "income" | "expense";

type Props = {
  groups: string[];
  onGroupsChange: (newGroups: string[]) => void;
  assignments: Record<string, string>; // categoryName -> groupName
  categories: string[];
  onAssignmentsChange: (next: Record<string, string>) => void;
  // New props to persist per-group category order
  categoryOrders?: Record<string, string[]>;
  setCategoryOrders?: (next: Record<string, string[]>) => void;
  // Optionally: show category types for clarity
  categoryTypes?: Record<string, CategoryType>;
};

const OTHER_GROUP_NAME = "Other";
const OTHER_INCOME_GROUP_NAME = "Other Income";
const OTHER_EXPENSES_GROUP_NAME = "Other Expenses";
const CASHFLOW_GROUP = "Cashflow items";

// Helper to reorder items in an array
function moveArrayItem<T>(arr: T[], from: number, to: number) {
  const out = arr.slice();
  const removed = out.splice(from, 1)[0];
  out.splice(to, 0, removed);
  return out;
}

const pillColors: Record<CategoryType, string> = {
  income: "bg-green-100 text-green-800 border border-green-200",
  expense: "bg-red-100 text-red-700 border border-red-200",
};

const CategoryGroupsPanel: React.FC<Props> = ({
  groups,
  onGroupsChange,
  assignments,
  categories,
  onAssignmentsChange,
  categoryOrders = {},
  setCategoryOrders = () => {},
  // try to infer category types if provided
  categoryTypes = {},
}) => {
  const [newGroup, setNewGroup] = useState("");
  function handleAddGroup() {
    if (newGroup.trim() && !groups.includes(newGroup.trim())) {
      onGroupsChange([...groups, newGroup.trim()]);
      setNewGroup("");
    }
  }
  function handleDeleteGroup(name: string) {
    if (name === CASHFLOW_GROUP) return; // Don't allow deleting Cashflow group
    onGroupsChange(groups.filter((g) => g !== name));
    // Remove group assignments that reference this group
    const nextAssign = Object.fromEntries(
      Object.entries(assignments).filter(([, g]) => g !== name)
    );
    onAssignmentsChange(nextAssign);
    // Remove per group category order
    if (categoryOrders[name]) {
      const newOrders = { ...categoryOrders };
      delete newOrders[name];
      setCategoryOrders(newOrders);
    }
  }
  // Reorder groups
  function moveGroup(idx: number, dir: "up" | "down") {
    if (idx < 0) return;
    const to = dir === "up" ? idx - 1 : idx + 1;
    if (to < 0 || to >= groups.length) return;
    onGroupsChange(moveArrayItem(groups, idx, to));
  }
  // Assign category to group
  function handleAssign(cat: string, group: string) {
    onAssignmentsChange({ ...assignments, [cat]: group });
    // Remove from all other group orders and add at end of order for this group
    if (setCategoryOrders) {
      const updated = { ...categoryOrders };
      // Remove from other group arrays
      for (const g of Object.keys(updated)) {
        updated[g] = updated[g].filter((c) => c !== cat);
      }
      // Add to this group
      updated[group] = updated[group] || [];
      if (!updated[group].includes(cat)) updated[group].push(cat);
      setCategoryOrders(updated);
    }
  }
  // Remove assignment
  function handleRemoveAssignment(cat: string) {
    const next = { ...assignments };
    const grp = next[cat];
    delete next[cat];
    onAssignmentsChange(next);
    // Remove from orders
    if (grp && setCategoryOrders) {
      const updated = { ...categoryOrders };
      if (updated[grp]) updated[grp] = updated[grp].filter((c) => c !== cat);
      setCategoryOrders(updated);
    }
  }
  // Move category within group
  function moveCategoryInGroup(group: string, idx: number, dir: "up" | "down") {
    if (!categoryOrders[group]) return;
    const arr = categoryOrders[group];
    const to = dir === "up" ? idx - 1 : idx + 1;
    if (to < 0 || to >= arr.length) return;
    const newArr = moveArrayItem(arr, idx, to);
    setCategoryOrders({ ...categoryOrders, [group]: newArr });
  }

  // Organize categories as income/expense, and by assignment
  const incomeCats: string[] = categories.filter((c) => categoryTypes[c] === "income");
  const expenseCats: string[] = categories.filter((c) => categoryTypes[c] === "expense");

  // List of all non-assigned categories, separated by type
  const unassignedIncomeCats = incomeCats.filter((c) => !assignments[c]);
  const unassignedExpenseCats = expenseCats.filter((c) => !assignments[c]);

  // Ensure Cashflow is always present
  const allGroupsWithCashflow = React.useMemo(
    () =>
      groups.includes(CASHFLOW_GROUP)
        ? groups
        : [...groups, CASHFLOW_GROUP],
    [groups]
  );

  // For display: combine "normal" groups + always include Cashflow + "Other Income"/"Other Expenses" if needed
  const allGroupsForDisplay = [
    ...allGroupsWithCashflow,
    ...(unassignedIncomeCats.length > 0 ? [OTHER_INCOME_GROUP_NAME] : []),
    ...(unassignedExpenseCats.length > 0 ? [OTHER_EXPENSES_GROUP_NAME] : []),
  ];

  // Helper to get categories for a group (income and expense)
  function getCatsForGroup(g: string) {
    if (g === OTHER_INCOME_GROUP_NAME) return unassignedIncomeCats;
    if (g === OTHER_EXPENSES_GROUP_NAME) return unassignedExpenseCats;
    // Show ALL categories assigned to this group (so user can see/tweak them)
    return (categoryOrders[g] || [])
      .filter((cat) => assignments[cat] === g)
      .concat(
        // Always show all matching assigned (if any were manually added not present in order, edge case)
        categories.filter(
          cat =>
            assignments[cat] === g &&
            categoryTypes[cat] === categoryTypes[categories.find(c => c === cat)!] &&
            !(categoryOrders[g] || []).includes(cat)
        )
      );
  }

  // Helper: label for group
  function groupLabel(g: string) {
    if (g === OTHER_INCOME_GROUP_NAME) return "Other Income (unassigned income categories)";
    if (g === OTHER_EXPENSES_GROUP_NAME) return "Other Expenses (unassigned expense categories)";
    if (g === CASHFLOW_GROUP) return "Cashflow items (special group for cashflow categories)";
    return g;
  }

  // Helper: color for category type
  function catPillType(c: string) {
    return pillColors[categoryTypes[c] || "expense"];
  }

  // Helper: select group options (income categories can only be assigned to groups or Other Income, likewise for expense)
  function allowedGroupOptions(cat: string): { label: string; value: string }[] {
    if (categoryTypes[cat] === "income") {
      return [
        { label: "(No group)", value: "" },
        ...groups.map((g) => ({ label: g, value: g })),
        { label: OTHER_INCOME_GROUP_NAME, value: OTHER_INCOME_GROUP_NAME },
      ];
    } else {
      return [
        { label: "(No group)", value: "" },
        ...groups.map((g) => ({ label: g, value: g })),
        { label: OTHER_EXPENSES_GROUP_NAME, value: OTHER_EXPENSES_GROUP_NAME },
      ];
    }
  }

  // ---- Always show all expenses & income w/ dropdown, not just unassigned! ----
  function allExpenseCatsToShow() {
    // Show all expense categories with current group assignment (can be undefined/empty)
    return expenseCats;
  }
  function allIncomeCatsToShow() {
    return incomeCats;
  }

  return (
    <div className="rounded-xl p-4 bg-white border shadow mb-3">
      <div className="font-semibold mb-2 text-lg">
        Broad Category Groups{" "}
        <span className="ml-1 text-xs text-gray-500">
          (Organize both income and expense)
        </span>
      </div>
      <div className="text-xs text-muted-foreground mb-4">
        Create your own broad groups (like "Bills" or "Living Expenses") and assign <b>any category</b> (income or expense) to those groups.<br />
        Unassigned income categories will show under <span className="font-bold">Other Income</span>, unassigned expenses under <span className="font-bold">Other Expenses</span>.
      </div>
      <div className="mb-4 flex flex-col md:flex-row gap-2">
        <Input
          value={newGroup}
          onChange={(e) => setNewGroup(e.target.value)}
          placeholder="Add new group (e.g. Bills)"
          className="h-8 text-xs md:w-56 w-full"
          onKeyDown={(e) => e.key === "Enter" && handleAddGroup()}
        />
        <Button
          size="sm"
          className="h-8 bg-green-600"
          onClick={handleAddGroup}
        >
          Add Group
        </Button>
      </div>
      <CategoryGroupList
        groups={allGroupsWithCashflow}
        onGroupsChange={onGroupsChange}
        assignments={assignments}
        onAssignmentsChange={onAssignmentsChange}
        categoryOrders={categoryOrders}
        setCategoryOrders={setCategoryOrders}
      />
      {unassignedIncomeCats.length > 0 && (
        <span className="bg-green-50 border px-2 py-1 rounded text-xs flex items-center gap-1 text-green-700 cursor-not-allowed">{OTHER_INCOME_GROUP_NAME}</span>
      )}
      {unassignedExpenseCats.length > 0 && (
        <span className="bg-gray-100 border px-2 py-1 rounded text-xs flex items-center gap-1 text-gray-500 cursor-not-allowed">{OTHER_EXPENSES_GROUP_NAME}</span>
      )}
      <div>
        <div className="font-semibold text-sm mb-1">
          Assign categories to groups (Income &amp; Expense) and set order within group:
        </div>
        {/* Show all expense categories in "Other Expenses" section */}
        <CategoryListAssignment
          title={groupLabel(OTHER_EXPENSES_GROUP_NAME)}
          categories={allExpenseCatsToShow()}
          assignments={assignments}
          onAssign={handleAssign}
          onRemove={handleRemoveAssignment}
          allowedGroupOptions={allowedGroupOptions}
          categoryTypes={categoryTypes}
        />
        {/* Show all income categories in "Other Income" section */}
        <CategoryListAssignment
          title={groupLabel(OTHER_INCOME_GROUP_NAME)}
          categories={allIncomeCatsToShow()}
          assignments={assignments}
          onAssign={handleAssign}
          onRemove={handleRemoveAssignment}
          allowedGroupOptions={allowedGroupOptions}
          categoryTypes={categoryTypes}
        />
      </div>
    </div>
  );
};

export default CategoryGroupsPanel;
