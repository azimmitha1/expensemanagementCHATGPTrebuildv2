
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { FilePlus } from "lucide-react";

export type Category = { name: string; type: "income" | "expense" };

type Props = {
  categories: Category[];
  onCategoriesChange: (cats: Category[]) => void;
  lockedType?: "income" | "expense";
};

const DEFAULT_TYPES: Record<string, "income" | "expense"> = {
  "Salary": "income",
  "Interest": "income",
  "Investment": "income",
  "Other income": "income",
};

function guessType(name: string): "income" | "expense" {
  const n = name.trim().toLowerCase();
  if (["salary", "interest", "investment", "other income"].includes(n))
    return "income";
  return "expense";
}

const CategoryEditor: React.FC<Props> = ({ categories, onCategoriesChange, lockedType }) => {
  const [newCat, setNewCat] = useState("");
  const [newCatType, setNewCatType] = useState<"income" | "expense">(lockedType ?? "expense");
  const [editing, setEditing] = useState<null | number>(null);
  const [editVal, setEditVal] = useState("");
  const [editType, setEditType] = useState<"income" | "expense">(lockedType ?? "expense");

  // ---- Bulk Import Additions ----
  const [bulkInput, setBulkInput] = useState("");
  const [bulkType, setBulkType] = useState<"income" | "expense">(lockedType ?? "expense");

  function handleBulkImport() {
    if (!bulkInput.trim()) {
      toast({ title: "No categories entered", description: "Paste a list of categories to import." });
      return;
    }
    let imported = bulkInput
      .split(/\n|,/)
      .map(str => str.trim())
      .filter(Boolean)
      .map(name => ({
        name,
        type: lockedType ?? guessType(name)
      }));
    // Apply override type if lockedType or user selected a specific type (optional)
    if (lockedType) {
      imported = imported.map(cat => ({
        ...cat,
        type: lockedType
      }));
    } else if (bulkType) {
      imported = imported.map(cat => ({
        ...cat,
        type: bulkType === "income" ? "income" : (cat.type ?? "expense")
      }));
    }
    // Remove already existing
    let existingNames = new Set(categories.map((c) => c.name));
    let newItems = imported.filter((c) => !existingNames.has(c.name));
    if (!newItems.length) {
      toast({ title: "No new categories", description: "All are already in the list." });
      return;
    }
    const all = [...categories, ...newItems];
    onCategoriesChange(all);
    toast({ title: "Imported!", description: `${newItems.length} categories added.` });
    setBulkInput("");
  }

  function handleAdd() {
    if (!newCat.trim()) return;
    if (categories.find((cat) => cat.name === newCat.trim())) {
      toast({ title: "Category exists", description: "Choose a different name." });
      return;
    }
    onCategoriesChange([
      ...categories,
      { name: newCat.trim(), type: lockedType ?? newCatType },
    ]);
    toast({ title: "Category added", description: newCat.trim() });
    setNewCat("");
    if (!lockedType) setNewCatType("expense");
  }

  function handleDelete(idx: number) {
    onCategoriesChange(categories.filter((_, i) => i !== idx));
  }

  function handleEdit(idx: number) {
    setEditing(idx);
    setEditVal(categories[idx].name);
    setEditType(lockedType ?? categories[idx].type);
  }
  function handleEditSave(idx: number) {
    if (!editVal.trim()) return;
    if (categories.find((cat, i) => cat.name === editVal.trim() && i !== idx)) {
      toast({ title: "Category exists", description: "Please choose a unique name." });
      return;
    }
    let cats = [...categories];
    cats[idx] = { name: editVal.trim(), type: lockedType ?? editType };
    onCategoriesChange(cats);
    setEditing(null);
    setEditVal("");
  }

  function handleEditCancel() {
    setEditing(null);
    setEditVal("");
  }

  return (
    <div className="rounded-xl bg-white shadow-sm border border-muted p-4 min-w-[210px]">
      <div className="flex items-center gap-2 font-semibold text-base mb-2">
        <FilePlus size={16} className="text-green-500" /> Categories
      </div>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[38px]">
        {categories.map((cat, idx) =>
          editing === idx ? (
            <span key={cat.name} className="flex items-center gap-2">
              <Input
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
                className="h-7 text-xs px-2 text-gray-900 dark:text-gray-100"
                autoFocus
              />
              {!lockedType && (
                <RadioGroup
                  value={editType}
                  onValueChange={val => setEditType(val as "income" | "expense")}
                  className="flex flex-row gap-2 ml-1"
                >
                  <RadioGroupItem value="income" id={`edit-income-${idx}`} />
                  <label htmlFor={`edit-income-${idx}`} className="text-xs text-gray-900 dark:text-gray-100">
                    Income
                  </label>
                  <RadioGroupItem value="expense" id={`edit-expense-${idx}`} />
                  <label htmlFor={`edit-expense-${idx}`} className="text-xs mr-2 text-gray-900 dark:text-gray-100">
                    Expense
                  </label>
                </RadioGroup>
              )}
              <Button size="sm" className="px-2 h-7 bg-blue-500" onClick={() => handleEditSave(idx)}>Save</Button>
              <Button size="sm" className="px-2 h-7 bg-gray-300 text-gray-700" variant="outline" onClick={handleEditCancel}>Cancel</Button>
            </span>
          ) : (
            <Badge
              key={cat.name}
              className={`flex items-center gap-1 px-2 py-[2px] border ${cat.type === "income" ? "border-green-400 bg-green-50 text-green-900" : "border-blue-400 bg-blue-50 text-blue-900"}`}
            >
              <span className="">{cat.name}</span>
              <span className={`text-[10px] ml-1 rounded-full px-1 ${cat.type === "income" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                {cat.type === "income" ? "Income" : "Expense"}
              </span>
              <button
                className="ml-1 text-xs hover:text-blue-600"
                title="Rename"
                onClick={() => handleEdit(idx)}
              >
                ✏️
              </button>
              <button
                className="ml-1 text-xs hover:text-red-600"
                title="Delete"
                onClick={() => handleDelete(idx)}
                disabled={categories.length <= 1}
              >
                ×
              </button>
            </Badge>
          )
        )}
      </div>
      <div className="flex gap-2 mt-2 items-center">
        <Input
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
          className="h-8 text-xs text-gray-900 dark:text-gray-100"
          placeholder="New category"
          onKeyDown={e => e.key === "Enter" && handleAdd()}
        />
        {!lockedType ? (
          <RadioGroup
            value={newCatType}
            onValueChange={val => setNewCatType(val as "income" | "expense")}
            className="flex flex-row gap-2"
          >
            <RadioGroupItem value="income" id="add-income" />
            <label htmlFor="add-income" className="text-xs text-gray-900 dark:text-gray-100">Income</label>
            <RadioGroupItem value="expense" id="add-expense" />
            <label htmlFor="add-expense" className="text-xs text-gray-900 dark:text-gray-100">Expense</label>
          </RadioGroup>
        ) : (
          <span className="ml-2 text-xs text-gray-900 dark:text-gray-100 px-2 py-1 rounded bg-gray-100">{lockedType.charAt(0).toUpperCase() + lockedType.slice(1)}</span>
        )}
        <Button size="sm" className="h-8 bg-green-600" onClick={handleAdd}>
          Add
        </Button>
      </div>
      {/* --- Bulk Import Area --- */}
      <div className="mt-4">
        <div className="mb-1 text-xs font-medium text-muted-foreground">Bulk import categories:</div>
        <textarea
          value={bulkInput}
          onChange={e => setBulkInput(e.target.value)}
          placeholder="Paste a list here (one per line or comma-separated)"
          className="w-full min-h-[48px] resize-y border border-input rounded p-1 text-xs 
            bg-muted/30 text-gray-900 dark:text-gray-100 dark:bg-muted/20"
        />
        <div className="flex gap-4 items-center mt-2">
          <div className="text-xs">Set type for import:</div>
          {!lockedType ? (
            <RadioGroup
              value={bulkType}
              onValueChange={val => setBulkType(val as "income" | "expense")}
              className="flex flex-row gap-2"
            >
              <RadioGroupItem value="income" id="bulk-income" />
              <label htmlFor="bulk-income" className="text-xs text-gray-900 dark:text-gray-100">Income</label>
              <RadioGroupItem value="expense" id="bulk-expense" />
              <label htmlFor="bulk-expense" className="text-xs text-gray-900 dark:text-gray-100">Expense</label>
            </RadioGroup>
          ) : (
            <span className="ml-2 text-xs text-gray-900 dark:text-gray-100 px-2 py-1 rounded bg-gray-100">{lockedType.charAt(0).toUpperCase() + lockedType.slice(1)}</span>
          )}
        </div>
        <Button onClick={handleBulkImport} size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700 w-full">
          Import Categories
        </Button>
      </div>
    </div>
  );
};

export default CategoryEditor;
