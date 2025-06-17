import React, { useState, useMemo } from "react";
import { Select } from "@/components/ui/select";
import { SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { File, Edit, Delete } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  transactions: any[];
  categories: string[];
  onCategoryChange: (idx: number, newCategory: string) => void;
  onDeleteTransaction?: (idx: number) => void;
  onAmountChange?: (idx: number, newAmount: number) => void;
  onDateChange?: (idx: number, newDate: string) => void;
  onDescriptionChange?: (idx: number, newDescription: string) => void;
  selectedRows?: number[];
  onRowSelect?: (idx: number, selected: boolean) => void;
  onSelectAll?: (selectAll: boolean) => void;
  onBulkDelete?: () => void;
};

const CategoryColor: { [cat: string]: string } = {
  "Groceries": "bg-green-100 text-green-800",
  "Rent": "bg-orange-100 text-orange-700",
  "Utilities": "bg-blue-100 text-blue-700",
  "Dining Out": "bg-pink-100 text-pink-600",
  "Transport": "bg-gray-100 text-gray-700",
  "Shopping": "bg-lime-100 text-lime-700",
  "Entertainment": "bg-fuchsia-100 text-fuchsia-700",
  "Medical": "bg-yellow-100 text-yellow-800",
  "Other": "bg-zinc-100 text-zinc-600"
};

const TransactionTable: React.FC<Props> = ({
  transactions,
  categories,
  onCategoryChange,
  onDeleteTransaction,
  onAmountChange,
  onDateChange,
  onDescriptionChange,
  selectedRows = [],
  onRowSelect,
  onSelectAll,
  onBulkDelete,
}) => {
  // Track which row & field is being edited
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editAmountValue, setEditAmountValue] = useState<string>("");

  // New: Track editing for Date/Description
  const [editingField, setEditingField] = useState<{ row: number; field: "date" | "description" | null } | null>(null);
  const [editDateValue, setEditDateValue] = useState<string>("");
  const [editDescriptionValue, setEditDescriptionValue] = useState<string>("");

  // Helper: check if a category is valid
  const categorySet = React.useMemo(() => new Set(categories), [categories]);

  // Show no table if none
  if (!transactions.length) return null;

  // NEW: is all selected?
  const allSelected = selectedRows && transactions.length > 0
    ? selectedRows.length === transactions.length
    : false;

  return (
    <div className="bg-white border border-muted rounded-lg shadow p-5">
      <div className="flex items-center gap-2 mb-2">
        <File size={20} className="text-slate-400" />
        <h2 className="text-lg font-bold">Transactions</h2>
        <span className="ml-2 text-xs text-muted-foreground bg-muted px-3 py-[1.5px] rounded-full">{transactions.length}</span>
        {/* Bulk actions if any are selected */}
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
        <Table>
          <TableHeader>
            <TableRow>
              {/* Checkbox for Select All */}
              <TableHead className="w-8">
                {onSelectAll && (
                  <input
                    type="checkbox"
                    checked={allSelected}
                    aria-label="Select all"
                    onChange={e => onSelectAll(e.target.checked)}
                  />
                )}
              </TableHead>
              <TableHead className="w-[110px]">Date</TableHead>
              <TableHead className="w-[200px]">Description</TableHead>
              <TableHead className="w-[110px] text-right">Amount</TableHead>
              <TableHead className="w-[180px]">Category</TableHead>
              <TableHead className="w-[80px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((txn, idx) => {
              // Defensive: never allow Select if category is invalid, undefined, or ""
              const cat = typeof txn.category === "string" ? txn.category : "";
              const categoryIsValid = cat && categories.includes(cat);

              return (
                <TableRow key={idx}>
                  {/* Checkbox for row select */}
                  <TableCell className="w-8">
                    {onRowSelect && (
                      <input
                        type="checkbox"
                        checked={selectedRows?.includes(idx) || false}
                        aria-label="Select row"
                        onChange={e => onRowSelect(idx, e.target.checked)}
                      />
                    )}
                  </TableCell>
                  {/* DATE CELL */}
                  <TableCell className="text-xs font-mono whitespace-nowrap">
                    {editingField && editingField.row === idx && editingField.field === "date" ? (
                      <input
                        type="date"
                        value={editDateValue}
                        onChange={e => setEditDateValue(e.target.value)}
                        onBlur={() => {
                          if (onDateChange && editDateValue.trim() !== "") {
                            onDateChange(idx, editDateValue);
                          }
                          setEditingField(null);
                          setEditDateValue("");
                        }}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            if (onDateChange && editDateValue.trim() !== "") {
                              onDateChange(idx, editDateValue);
                            }
                            setEditingField(null);
                            setEditDateValue("");
                          } else if (e.key === "Escape") {
                            setEditingField(null);
                            setEditDateValue("");
                          }
                        }}
                        className="w-28 border border-input rounded px-1 py-0.5 text-sm font-mono"
                        autoFocus
                      />
                    ) : (
                      <span
                        className="cursor-pointer underline-offset-2 hover:underline"
                        onClick={() => {
                          setEditingField({ row: idx, field: "date" });
                          setEditDateValue(txn.date || "");
                        }}
                        title="Click to edit date"
                      >
                        {txn.date}
                      </span>
                    )}
                  </TableCell>
                  {/* DESCRIPTION CELL */}
                  <TableCell>
                    {editingField && editingField.row === idx && editingField.field === "description" ? (
                      <input
                        type="text"
                        value={editDescriptionValue}
                        onChange={e => setEditDescriptionValue(e.target.value)}
                        onBlur={() => {
                          if (onDescriptionChange && editDescriptionValue.trim() !== "") {
                            onDescriptionChange(idx, editDescriptionValue);
                          }
                          setEditingField(null);
                          setEditDescriptionValue("");
                        }}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            if (onDescriptionChange && editDescriptionValue.trim() !== "") {
                              onDescriptionChange(idx, editDescriptionValue);
                            }
                            setEditingField(null);
                            setEditDescriptionValue("");
                          } else if (e.key === "Escape") {
                            setEditingField(null);
                            setEditDescriptionValue("");
                          }
                        }}
                        className="w-44 border border-input rounded px-1 py-0.5 text-sm"
                        autoFocus
                      />
                    ) : (
                      <span
                        className="cursor-pointer"
                        onClick={() => {
                          setEditingField({ row: idx, field: "description" });
                          setEditDescriptionValue(txn.description || "");
                        }}
                        title="Click to edit description"
                      >
                        {txn.description}
                      </span>
                    )}
                  </TableCell>
                  {/* AMOUNT CELL */}
                  <TableCell className={cn("text-right font-semibold", txn.amount < 0 ? "text-red-500" : "text-green-600")}>
                    {editingRow === idx ? (
                      <input
                        type="number"
                        value={editAmountValue}
                        onChange={e => setEditAmountValue(e.target.value)}
                        onBlur={() => {
                          // Save on blur
                          if (
                            !isNaN(Number(editAmountValue)) &&
                            onAmountChange &&
                            editAmountValue.trim() !== ""
                          ) {
                            onAmountChange(idx, Number(editAmountValue));
                          }
                          setEditingRow(null);
                          setEditAmountValue("");
                        }}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            if (
                              !isNaN(Number(editAmountValue)) &&
                              onAmountChange &&
                              editAmountValue.trim() !== ""
                            ) {
                              onAmountChange(idx, Number(editAmountValue));
                            }
                            setEditingRow(null);
                            setEditAmountValue("");
                          } else if (e.key === "Escape") {
                            setEditingRow(null);
                            setEditAmountValue("");
                          }
                        }}
                        autoFocus
                        className="w-24 border border-input rounded px-1 py-0.5 text-sm text-right"
                      />
                    ) : (
                      <span
                        className="cursor-pointer"
                        onClick={() => {
                          setEditingRow(idx);
                          setEditAmountValue(String(txn.amount));
                        }}
                        title="Click to edit"
                      >
                        {txn.amount < 0 ? "-" : "+"}${Math.abs(txn.amount).toFixed(2)}
                      </span>
                    )}
                  </TableCell>
                  {/* CATEGORY CELL */}
                  <TableCell>
                    {categoryIsValid ? (
                      <Select value={cat} onValueChange={cat => onCategoryChange(idx, cat)}>
                        <SelectTrigger className="">
                          <Badge className={cn("rounded-md px-2 py-1 w-full cursor-pointer border text-xs", CategoryColor[cat] || "bg-muted text-muted-foreground")}>
                            {cat}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((catOption) => (
                            <SelectItem value={catOption} key={catOption}>
                              {catOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className="rounded-md px-2 py-1 w-full border text-xs bg-red-100 text-red-700">
                        Invalid Category
                      </Badge>
                    )}
                  </TableCell>
                  {/* ACTIONS CELL */}
                  <TableCell className="text-center">
                    <button
                      className="inline-flex items-center text-blue-600 hover:bg-blue-50 p-1 rounded-md mr-1"
                      onClick={() => {
                        setEditingRow(idx);
                        setEditAmountValue(String(txn.amount));
                      }}
                      aria-label="Edit Amount"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="inline-flex items-center text-red-600 hover:bg-red-50 p-1 rounded-md"
                      onClick={() => onDeleteTransaction && onDeleteTransaction(idx)}
                      aria-label="Delete Transaction"
                    >
                      <Delete size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionTable;
