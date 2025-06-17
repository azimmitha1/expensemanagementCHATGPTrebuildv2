
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowDown } from "lucide-react";

type Props = {
  groups: string[];
  onGroupsChange: (newGroups: string[]) => void;
  assignments: Record<string, string>;
  onAssignmentsChange: (next: Record<string, string>) => void;
  categoryOrders?: Record<string, string[]>;
  setCategoryOrders?: (next: Record<string, string[]>) => void;
};

function moveArrayItem<T>(arr: T[], from: number, to: number) {
  const out = arr.slice();
  const removed = out.splice(from, 1)[0];
  out.splice(to, 0, removed);
  return out;
}

const CategoryGroupList: React.FC<Props> = ({
  groups,
  onGroupsChange,
  assignments,
  onAssignmentsChange,
  categoryOrders = {},
  setCategoryOrders = () => {},
}) => {
  const [newGroup, setNewGroup] = useState("");
  function handleAddGroup() {
    if (newGroup.trim() && !groups.includes(newGroup.trim())) {
      onGroupsChange([...groups, newGroup.trim()]);
      setNewGroup("");
    }
  }
  function handleDeleteGroup(name: string) {
    onGroupsChange(groups.filter((g) => g !== name));
    // Remove assignments that reference this group
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

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {groups.map((g, i) => (
        <span
          key={g}
          className="bg-gray-100 border px-2 py-1 rounded text-xs flex items-center gap-1"
        >
          <button
            aria-label="Move Up"
            disabled={i === 0}
            style={{ padding: 0 }}
            onClick={() => moveGroup(i, "up")}
            className="text-blue-600 hover:text-blue-900 disabled:opacity-30"
          >
            <ArrowUp size={14} />
          </button>
          <button
            aria-label="Move Down"
            disabled={i === groups.length - 1}
            style={{ padding: 0 }}
            onClick={() => moveGroup(i, "down")}
            className="text-blue-600 hover:text-blue-900 disabled:opacity-30"
          >
            <ArrowDown size={14} />
          </button>
          <span>{g}</span>
          <button
            className="ml-1 text-xs text-red-500"
            title="Delete group"
            onClick={() => handleDeleteGroup(g)}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
};

export default CategoryGroupList;
