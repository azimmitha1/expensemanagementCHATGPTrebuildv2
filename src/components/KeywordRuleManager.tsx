import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

type Rule = {
  keyword: string;
  category: string;
};

type Props = {
  categories: string[];
  rules: Rule[];
  onChange: (rules: Rule[]) => void;
};

const KeywordRuleManager: React.FC<Props> = ({ categories, rules, onChange }) => {
  const [editing, setEditing] = useState<Rule[]>(rules);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState(categories[0] || "");

  // Bulk uploader state
  const [bulkUploadText, setBulkUploadText] = useState("");
  const [bulkMode, setBulkMode] = useState(false);

  useEffect(() => {
    setEditing(rules);
  }, [rules]);

  const handleAdd = () => {
    if (!keyword.trim()) {
      toast({ title: "Error", description: "Please provide a keyword." });
      return;
    }
    if (editing.some(r => r.keyword.toLowerCase() === keyword.toLowerCase())) {
      toast({ title: "Duplicate", description: "This keyword already exists." });
      return;
    }
    const updated = [...editing, { keyword: keyword.trim(), category }];
    setEditing(updated);
    setKeyword("");
    setCategory(categories[0] || "");
    onChange(updated);
    toast({ title: "Added", description: `Rule for "${keyword}" → ${category}` });
  };

  const handleDelete = (idx: number) => {
    const updated = editing.filter((_, i) => i !== idx);
    setEditing(updated);
    onChange(updated);
  };

  // Bulk add: Accept keywords, one per line (ignore separators/categories)
  function parseBulkKeywords(txt: string): string[] {
    return txt
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .filter(line => !editing.some(r => r.keyword.toLowerCase() === line.toLowerCase()));
  }

  const handleBulkApply = () => {
    const newKeywords = parseBulkKeywords(bulkUploadText);
    if (!newKeywords.length) {
      toast({
        title: "No valid keywords",
        description: "Paste a list of keywords (one per line). Duplicates are ignored."
      });
      return;
    }
    const updated = [
      ...editing,
      ...newKeywords.map((kw) => ({ keyword: kw, category: "" }))
    ];
    setEditing(updated);
    onChange(updated);
    setBulkUploadText("");
    setBulkMode(false);
    toast({ title: `Added ${newKeywords.length} keywords`, description: "Bulk keywords imported. Now assign categories in the app." });
  };

  // Change: show empty value for unassigned category, allow selection in dropdown per rule
  const handleCategoryChange = (idx: number, newCat: string) => {
    const updated = editing.map((r, i) =>
      i === idx ? { ...r, category: newCat } : r
    );
    setEditing(updated);
    onChange(updated);
  };

  return (
    <div className="rounded-lg bg-white shadow p-4 mb-4 border border-muted">
      <h3 className="font-bold text-base mb-2">Auto-Categorise Rules</h3>
      <div className="flex flex-wrap gap-2 items-center mb-2">
        <Input
          className="w-[160px]"
          placeholder="Enter keyword (e.g. MRT)"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border border-input rounded-md text-sm px-2 py-2"
        >
          {categories.map(cat => (
            <option value={cat} key={cat}>{cat}</option>
          ))}
        </select>
        <Button type="button" onClick={handleAdd} className="ml-2 px-4">Add Rule</Button>
        <Button
          variant="outline"
          type="button"
          className="ml-2"
          onClick={() => setBulkMode(m => !m)}
        >
          {bulkMode ? "Cancel Bulk" : "Bulk Upload"}
        </Button>
      </div>

      {/* Bulk upload panel */}
      {bulkMode && (
        <div className="mb-4 p-3 rounded bg-muted/40 space-y-2">
          <div className="font-medium text-sm">Paste keywords (one per line):</div>
          <textarea
            className="w-full min-h-[60px] border border-input rounded p-1 text-sm bg-white"
            value={bulkUploadText}
            onChange={e => setBulkUploadText(e.target.value)}
            placeholder={"e.g.\nCoffee\nMRT\nStarbucks"}
          />
          <div className="flex gap-2">
            <Button onClick={handleBulkApply} type="button">Apply Bulk</Button>
            <Button variant="ghost" type="button" onClick={() => setBulkMode(false)}>Cancel</Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Paste a list of keywords, one per line. Assign categories later in the app.
          </div>
        </div>
      )}
      <div>
        <ul className="text-sm mt-2">
          {editing.map((r, i) => (
            <li key={i} className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 border rounded bg-muted">{r.keyword}</span>
              <select
                value={r.category}
                onChange={e => handleCategoryChange(i, e.target.value)}
                className={`border border-input rounded bg-background px-2 py-1 text-sm min-w-[110px] ${
                  !r.category ? "text-muted-foreground" : ""
                }`}
              >
                <option value="">Assign…</option>
                {categories.map(cat => (
                  <option value={cat} key={cat}>{cat}</option>
                ))}
              </select>
              <Button variant="outline" size="sm" onClick={() => handleDelete(i)}>Delete</Button>
            </li>
          ))}
          {!editing.length && <li className="text-muted-foreground">No auto-categorisation rules yet.</li>}
        </ul>
      </div>
    </div>
  );
};

export default KeywordRuleManager;
