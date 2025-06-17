import React from "react";
import { Badge } from "@/components/ui/badge";
import { Edit, Delete } from "lucide-react";

type Props = {
  transactions: any[];
  onDateChange?: (idx: number, newDate: string) => void;
  onDescriptionChange?: (idx: number, newDescription: string) => void;
  onDeleteTransaction?: (idx: number) => void;
  selectedRows?: number[];
  onRowSelect?: (idx: number, selected: boolean) => void;
  onSelectAll?: (selectAll: boolean) => void;
  onBulkDelete?: () => void;
};
const UndefinedTransactionsTable: React.FC<Props> = ({
  transactions,
  onDateChange,
  onDescriptionChange,
  onDeleteTransaction,
  selectedRows = [],
  onRowSelect,
  onSelectAll,
  onBulkDelete,
}) => {
  const [editingRow, setEditingRow] = React.useState<number | null>(null);
  const [editDateValue, setEditDateValue] = React.useState<string>("");
  const [editDescriptionValue, setEditDescriptionValue] = React.useState<string>("");

  if (!transactions.length) return null;
  const allSelected = selectedRows.length === transactions.length && transactions.length > 0;

  return (
    <div className="bg-white border border-red-200 rounded-lg shadow p-5 mt-8">
      <div className="flex items-center gap-2 mb-2">
        <Badge className="bg-red-100 text-red-800">Undefined Transactions</Badge>
        <span className="ml-2 text-xs text-muted-foreground bg-muted px-3 py-[1.5px] rounded-full">{transactions.length}</span>
        {onBulkDelete && selectedRows && selectedRows.length > 0 &&
          <button
            className="ml-4 px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded text-xs font-medium hover:bg-red-100"
            onClick={onBulkDelete}
          >
            Delete Selected ({selectedRows.length})
          </button>
        }
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="w-8">
                {onSelectAll && (
                  <input
                    type="checkbox"
                    checked={allSelected}
                    aria-label="Select all"
                    onChange={e => onSelectAll(e.target.checked)}
                  />
                )}
              </th>
              <th className="w-[110px]">Date</th>
              <th className="w-[200px]">Description</th>
              <th className="w-[80px] text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn, idx) => (
              <tr key={idx}>
                <td>
                  {onRowSelect && (
                    <input
                      type="checkbox"
                      checked={selectedRows?.includes(idx) || false}
                      aria-label="Select row"
                      onChange={e => onRowSelect(idx, e.target.checked)}
                    />
                  )}
                </td>
                {/* Date */}
                <td>
                  {editingRow === idx && (
                    <input
                      type="date"
                      value={editDateValue}
                      onChange={e => setEditDateValue(e.target.value)}
                      onBlur={() => {
                        if (onDateChange && editDateValue.trim() !== "") {
                          onDateChange(idx, editDateValue);
                        }
                        setEditingRow(null);
                        setEditDateValue("");
                      }}
                      onKeyDown={e => {
                        if (e.key === "Enter" && onDateChange && editDateValue.trim() !== "") {
                          onDateChange(idx, editDateValue);
                          setEditingRow(null);
                          setEditDateValue("");
                        } else if (e.key === "Escape") {
                          setEditingRow(null);
                          setEditDateValue("");
                        }
                      }}
                      className="w-28 border border-input rounded px-1 py-0.5 text-sm font-mono"
                      autoFocus
                    />
                  )}
                  {editingRow !== idx && (
                    <span
                      className="cursor-pointer underline-offset-2 hover:underline"
                      onClick={() => {
                        setEditingRow(idx);
                        setEditDateValue(txn.date || "");
                      }}
                      title="Click to edit date"
                    >
                      {txn.date || <span className="text-red-400 italic">No date</span>}
                    </span>
                  )}
                </td>
                {/* Description */}
                <td>
                  {editingRow === idx && (
                    <input
                      type="text"
                      value={editDescriptionValue}
                      onChange={e => setEditDescriptionValue(e.target.value)}
                      onBlur={() => {
                        if (onDescriptionChange && editDescriptionValue.trim() !== "") {
                          onDescriptionChange(idx, editDescriptionValue);
                        }
                        setEditingRow(null);
                        setEditDescriptionValue("");
                      }}
                      onKeyDown={e => {
                        if (e.key === "Enter" && onDescriptionChange && editDescriptionValue.trim() !== "") {
                          onDescriptionChange(idx, editDescriptionValue);
                          setEditingRow(null);
                          setEditDescriptionValue("");
                        } else if (e.key === "Escape") {
                          setEditingRow(null);
                          setEditDescriptionValue("");
                        }
                      }}
                      className="w-44 border border-input rounded px-1 py-0.5 text-sm"
                      autoFocus
                    />
                  )}
                  {editingRow !== idx && (
                    <span
                      className="cursor-pointer"
                      onClick={() => {
                        setEditingRow(idx);
                        setEditDescriptionValue(txn.description || "");
                      }}
                      title="Click to edit description"
                    >
                      {txn.description}
                    </span>
                  )}
                </td>
                {/* Actions */}
                <td className="text-center">
                  <button
                    className="inline-flex items-center text-red-600 hover:bg-red-50 p-1 rounded-md"
                    onClick={() => onDeleteTransaction && onDeleteTransaction(idx)}
                    aria-label="Delete Transaction"
                  >
                    <Delete size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UndefinedTransactionsTable;
