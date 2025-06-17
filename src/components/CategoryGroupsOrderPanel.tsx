
import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

type Props = {
  groups: string[];
  onGroupsChange: (newGroups: string[]) => void;
};

function moveArrayItem<T>(arr: T[], from: number, to: number) {
  const out = arr.slice();
  const removed = out.splice(from, 1)[0];
  out.splice(to, 0, removed);
  return out;
}

const CategoryGroupsOrderPanel: React.FC<Props> = ({ groups, onGroupsChange }) => {
  return (
    <div className="rounded-xl p-4 bg-white border shadow mb-3">
      <div className="font-semibold mb-2">Broad Category Order</div>
      <div className="flex flex-wrap gap-2">
        {groups.map((group, i) => (
          <span key={group} className="bg-gray-100 border px-2 py-1 rounded text-xs flex items-center gap-1">
            <button
              aria-label="Move Up"
              disabled={i === 0}
              style={{ padding: 0 }}
              onClick={() => onGroupsChange(moveArrayItem(groups, i, i - 1))}
              className="text-blue-600 hover:text-blue-900 disabled:opacity-30"
            >
              <ArrowUp size={14} />
            </button>
            <button
              aria-label="Move Down"
              disabled={i === groups.length - 1}
              style={{ padding: 0 }}
              onClick={() => onGroupsChange(moveArrayItem(groups, i, i + 1))}
              className="text-blue-600 hover:text-blue-900 disabled:opacity-30"
            >
              <ArrowDown size={14} />
            </button>
            <span>{group}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default CategoryGroupsOrderPanel;
