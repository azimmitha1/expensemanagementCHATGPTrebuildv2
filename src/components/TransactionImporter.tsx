import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { FilePlus } from "lucide-react";
import KeywordRuleManager from "./KeywordRuleManager";
import * as XLSX from "xlsx";
import UndefinedTransactionsTable from "./UndefinedTransactionsTable";

// Utility: Get rules from localStorage or props
function loadKeywordRules() {
  try {
    const raw = window.localStorage.getItem("keyword_rules_v1");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveKeywordRules(rules) {
  window.localStorage.setItem("keyword_rules_v1", JSON.stringify(rules));
}

function autoCategorize(txns, keywordRules) {
  if (!keywordRules?.length) return;
  txns.forEach(t => {
    const matched = keywordRules.find(r =>
      t.description &&
      r.keyword &&
      t.description.toLowerCase().includes(r.keyword.toLowerCase())
    );
    if (matched) {
      t.category = matched.category;
    }
  });
}

// --- NEW Helpers for advanced CSV parsing ---
function splitCsvRow(row) {
  // Simple CSV/TSV, allowing for commas in quoted strings
  // (Doesn't handle ALL edge cases, but works for most bank files)
  let cols = [];
  let col = '';
  let insideQuote = false;
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      insideQuote = !insideQuote;
    } else if (char === "," && !insideQuote) {
      cols.push(col);
      col = '';
    } else {
      col += char;
    }
  }
  cols.push(col);
  return cols;
}

function parseCsvRaw(text) {
  // Handles both CSV and TSV (tab-delimited) by auto-detecting
  let lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const sep = lines[0].includes('\t') ? '\t' : ',';
  return lines.map(line => {
    if (sep === ',') return splitCsvRow(line);
    return line.split(sep);
  });
}

// --- Date normalization utility ---
function normalizeDate(input: string): string {
  // Trim and check for empty
  if (!input || typeof input !== "string") return "";
  const trimmed = input.trim();
  // Already in YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  // Try MM/DD/YYYY or M/D/YYYY or DD/MM/YYYY or D/M/YYYY
  // US style: MM/DD/YYYY. European: DD/MM/YYYY, but ambiguity exists
  // We'll try DD MMM YYYY as explicitly requested
  // Examples: "04 Apr 2025"
  const dmyRegex = /^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})$/;
  const dmyMatch = trimmed.match(dmyRegex);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const monthStr = dmyMatch[2].toLowerCase().slice(0, 3);
    const year = dmyMatch[3];
    // Map short months to numeric
    const monthNum =
      {
        jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
        jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
      }[monthStr];
    if (monthNum) return `${year}-${monthNum}-${day}`;
  }
  // Try MM/DD/YYYY or M/D/YYYY or variants
  const usRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/;
  const usMatch = trimmed.match(usRegex);
  if (usMatch) {
    let [_, mm, dd, yyyy] = usMatch;
    if (yyyy.length === 2) yyyy = `20${yyyy}`; // handle "25" ~ "2025"
    mm = mm.padStart(2, "0");
    dd = dd.padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  // Try YYYY/MM/DD
  const isoRegex = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/;
  const isoMatch = trimmed.match(isoRegex);
  if (isoMatch) {
    const [_ignored, yyyy, mm, dd] = isoMatch;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  // If nothing matches, return original string (to be treated as undefined date)
  return trimmed;
}

type Props = {
  onTransactionsImported: (txns: any[]) => void;
  categories: string[];
};

const REQUIRED_FIELDS = [
  { label: "Date", key: "date" },
  { label: "Description", key: "description" },
  { label: "Amount", key: "amount" }
];

const TransactionImporter: React.FC<Props> = ({
  onTransactionsImported,
  categories,
}) => {
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [keywordRules, setKeywordRules] = React.useState(loadKeywordRules());
  // `columnMapping` now allows "description" to be an array of indices
  const [columnMapping, setColumnMapping] = useState<{ [k: string]: number | number[] } | null>(null);
  const [parsedPreview, setParsedPreview] = useState<string[][] | null>(null);

  const [undefinedTransactions, setUndefinedTransactions] = useState<any[]>([]);

  const inputFileRef = useRef<HTMLInputElement>(null);

  // Step 1: User pastes or uploads, preview columns
  const handlePaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRaw(e.target.value);
    setColumnMapping(null);
    setParsedPreview(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = file.name.toLowerCase();
    setLoading(true);

    if (fileName.endsWith(".xls") || fileName.endsWith(".xlsx")) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          // Always read the first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          // Convert the sheet to CSV, then setRaw as if it was a CSV file
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          setRaw(csv);
          setColumnMapping(null);
          setParsedPreview(null);
          setLoading(false);
          toast({
            title: "Excel file loaded",
            description: "Preview the data and map columns.",
          });
        } catch (err: any) {
          setLoading(false);
          toast({
            title: "Excel file error",
            description: err.message || "Could not parse Excel file.",
            variant: "destructive",
          });
          if (inputFileRef.current) inputFileRef.current.value = '';
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    if (fileName.endsWith(".csv") || fileName.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        setRaw(content);
        setColumnMapping(null);
        setParsedPreview(null);
        setLoading(false);
        toast({
          title: "File loaded",
          description: "Preview the data and map columns.",
        });
      };
      reader.readAsText(file);
      return;
    }

    setLoading(false);
    toast({
      title: "File type not supported",
      description: "Please upload a .csv, .txt, .xls or .xlsx file.",
      variant: "destructive",
    });
    if (inputFileRef.current) inputFileRef.current.value = '';
  };

  // When raw is set, try to parse columns for preview
  React.useEffect(() => {
    if (!raw) {
      setParsedPreview(null);
      setColumnMapping(null);
      return;
    }
    const table: string[][] = parseCsvRaw(raw).filter(r => r.length > 1);
    if (table.length) {
      // Take up to 50 rows for preview
      const previewRows = table.slice(0, 50);
      // Find the max number of columns in these preview rows
      const maxCols = previewRows.reduce(
        (max, row) => Math.max(max, row.length),
        0
      );
      // Pad all rows to maxCols
      const paddedPreview = previewRows.map(row => {
        if (row.length < maxCols) {
          return [...row, ...Array(maxCols - row.length).fill("")];
        }
        return row;
      });
      setParsedPreview(paddedPreview);
      setColumnMapping(null);
    }
  }, [raw]);

  // Column-mapping UI
  const handleSetMapping = (mapping: { [k: string]: number | number[] }) => {
    setColumnMapping(mapping);
  };

  // Parse & import mapped data
  const handleImport = () => {
    if (!parsedPreview || !columnMapping) {
      toast({
        title: "Please map all fields.",
        description: "Map each required field to a column first."
      });
      return;
    }

    const validCategories =
      (categories || []).filter(
        c => typeof c === "string" && c.trim() !== ""
      );
    if (!validCategories.length) {
      toast({
        title: "No categories available",
        description: "Please create at least one category before importing transactions.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    setLoading(true);

    // Parse and build
    const table: string[][] = parseCsvRaw(raw).filter(r => r.length > 1);
    // Remove possible header row
    let startIndex = 0;
    const likelyHeader = table[0] && (
      Object.entries(columnMapping).some(([key, colIdxs]) => {
        if (Array.isArray(colIdxs)) {
          return colIdxs.some(colIdx => {
            const cell = (table[0][colIdx] || '').toLowerCase();
            return (
              cell.includes("date") ||
              cell.includes("desc") ||
              cell.includes("amount") ||
              cell.includes("transaction") ||
              cell.includes("memo")
            );
          });
        } else {
          const cell = (table[0][colIdxs] || '').toLowerCase();
          return (
            cell.includes("date") ||
            cell.includes("desc") ||
            cell.includes("amount") ||
            cell.includes("transaction") ||
            cell.includes("memo")
          );
        }
      })
    );
    if (likelyHeader) startIndex = 1;

    const txns: any[] = [];
    for (let i = startIndex; i < table.length; ++i) {
      const row = table[i];
      const safeRow = (row ?? []);
      const t: any = {};
      for (const field of REQUIRED_FIELDS) {
        const colIdx = columnMapping[field.key];
        if (field.key === "description") {
          if (Array.isArray(colIdx)) {
            t[field.key] = colIdx.map(idx => (safeRow[idx] ?? "").trim()).filter(Boolean).join(" ");
          } else {
            t[field.key] = (safeRow[colIdx] ?? "").trim();
          }
        } else if (field.key === "amount") {
          if (Array.isArray(colIdx)) {
            let total = 0;
            for (const idx of colIdx) {
              let val = (safeRow[idx] ?? "").trim();
              val = val
                .replace(/[$,]/g, "")
                .replace(/^\((.*)\)$/, "-$1");
              const num = Number(val) || 0;
              total += num;
            }
            t.amount = total;
          } else {
            let val = (safeRow[colIdx as number] ?? "").trim();
            val = val
              .replace(/[$,]/g, "")
              .replace(/^\((.*)\)$/, "-$1");
            t.amount = Number(val) || 0;
          }
        } else if (field.key === "date") {
          // <------ MAIN CHANGE: normalize date
          t[field.key] = normalizeDate(safeRow[colIdx as number] ?? "");
        } else {
          t[field.key] = (safeRow[colIdx as number] ?? "").trim();
        }
      }
      // Only supply a valid category at this stage
      t.category = "";
      txns.push(t);
    }
    autoCategorize(txns, keywordRules);

    // Defensive: only accept txns with a valid, non-empty category (for those WITH date)
    const firstValidCategory = validCategories[0]; // guaranteed
    // Split transactions with and without date
    const withDate: any[] = [];
    const withoutDate: any[] = [];

    for (const t of txns) {
      let cat = t.category;
      if (!cat || typeof cat !== "string" || !validCategories.includes(cat.trim())) {
        cat = firstValidCategory;
      }
      const tWithSafeCat = { ...t, category: cat };
      if (!tWithSafeCat.date || !tWithSafeCat.date.trim()) {
        // Date is missing/empty
        withoutDate.push(tWithSafeCat);
      } else {
        withDate.push(tWithSafeCat);
      }
    }

    // Only import transactions with date
    if (!withDate.length) {
      setLoading(false);
      setUndefinedTransactions(withoutDate); // Always update undefined ones
      setRaw("");
      setParsedPreview(null);
      setColumnMapping(null);
      if (inputFileRef.current) inputFileRef.current.value = '';
      toast({
        title: "Imported with Warnings",
        description: "No transactions with valid date fields were found. Please fix undefined transactions below.",
        variant: "destructive",
      });
      return;
    }

    onTransactionsImported(withDate);
    setUndefinedTransactions(withoutDate);
    setLoading(false);
    setRaw("");
    setParsedPreview(null);
    setColumnMapping(null);
    if (inputFileRef.current) inputFileRef.current.value = '';
    toast({
      title: "Imported!",
      description: `${withDate.length} transactions imported. ${withoutDate.length ? withoutDate.length + " without date." : ""}`,
    });
  };

  const handleKeywordRuleChange = (rules) => {
    setKeywordRules(rules);
    saveKeywordRules(rules);
    toast({
      title: "Rules updated",
      description: "Auto-categorization rules saved.",
    });
  };

  // === Editing/deleting undefined transactions ===
  const handleEditUndefined = (idx: number, field: "date" | "description", value: string) => {
    setUndefinedTransactions(utxns =>
      utxns.map((txn, i) =>
        i === idx ? { ...txn, [field]: value } : txn
      )
    );
  };

  const handleDeleteUndefined = (idx: number) => {
    setUndefinedTransactions(utxns =>
      utxns.filter((_, i) => i !== idx)
    );
  };

  // Allow moving an undefined transaction to imported ones IF date is added
  React.useEffect(() => {
    if (!undefinedTransactions.length) return;
    // If the user manually adds a date to an undefined transaction, move it into the imported area:
    setUndefinedTransactions(prev => {
      const utxns = prev || [];
      const ready: any[] = [];
      const stillUndefined: any[] = [];
      for (let t of utxns) {
        if (t.date && t.date.trim()) {
          // Simulate import for just this transaction:
          onTransactionsImported([t]);
          ready.push(t);
        } else {
          stillUndefined.push(t);
        }
      }
      return stillUndefined;
    });
    // eslint-disable-next-line
  }, [undefinedTransactions.map(t => t.date).join(",")]);

  return (
    <div className="rounded-lg bg-white shadow p-6 space-y-3 border border-muted">
      {/* Show undefined transactions first, if any */}
      <UndefinedTransactionsTable
        transactions={undefinedTransactions}
        onDateChange={(idx, newDate) => handleEditUndefined(idx, "date", newDate)}
        onDescriptionChange={(idx, newDescription) => handleEditUndefined(idx, "description", newDescription)}
        onDeleteTransaction={handleDeleteUndefined}
      />
      <KeywordRuleManager categories={categories} rules={keywordRules} onChange={handleKeywordRuleChange} />
      <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
        <FilePlus size={22} className="text-blue-500" /> Import Transactions
      </h2>
      <p className="text-muted-foreground text-sm mb-3">
        Paste your CSV or upload a file. You'll be able to map columns before importing.<br />
        <span className="text-xs">Supports CSVs/TSVs with extra columns and headers. Required fields: Date, Description, Amount.</span>
      </p>
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
        <textarea
          className="w-full min-h-[50px] max-h-40 border border-input rounded-md p-2 text-sm bg-muted/50"
          value={raw}
          onChange={handlePaste}
          placeholder="Paste CSV/TSV data here"
        />
        <Input
          type="file"
          accept=".csv,.txt,.xls,.xlsx"
          onChange={handleFileUpload}
          className="w-[180px] md:w-[180px]"
          ref={inputFileRef}
        />
      </div>
      {/* Only show mapping UI if preview is available and columns are not mapped */}
      {parsedPreview && !columnMapping && (
        <div className="border rounded mt-4 bg-muted/20 p-4">
          <div className="font-medium mb-1">Preview & Map Columns</div>
          <p className="text-xs text-muted-foreground mb-2">
            Select which column represents each field below.
          </p>
          <div className="overflow-x-auto">
            <table className="border mb-2 w-auto text-xs">
              <thead>
                <tr>
                  {Array(parsedPreview[0]?.length || 0).fill(null).map((_, colIdx) => (
                    <th key={colIdx} className="px-2 py-1 border bg-muted text-muted-foreground">{`Col #${colIdx + 1}`}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedPreview.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="border px-2 py-1">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form
            className="flex flex-col sm:flex-row sm:items-end gap-3 mb-2"
            onSubmit={e => {
              e.preventDefault();
              // @ts-ignore
              const data = new FormData(e.target);
              const mapping: { [k: string]: number | number[] } = {};
              for (const field of REQUIRED_FIELDS) {
                if (field.key === "description" || field.key === "amount") {
                  // For "description" and now "amount": get all selected options (multi-select)
                  const sel = e.target[field.key];
                  const selectedValues = Array.from(sel.selectedOptions)
                    .map((o: any) => o.value)
                    .filter(v => v !== "" && v !== undefined)
                    .map((v: any) => Number(v))
                    .filter((v: any) => !isNaN(v));
                  if (!selectedValues.length) {
                    toast({ title: "Error", description: `Please select at least one column for ${field.label}` });
                    return;
                  }
                  mapping[field.key] = selectedValues;
                } else {
                  const idxStr = data.get(field.key);
                  if (idxStr === null || idxStr === undefined || idxStr === "") {
                    toast({ title: "Error", description: `Please select a column for ${field.label}` });
                    return;
                  }
                  const idx = Number(idxStr);
                  if (isNaN(idx)) {
                    toast({ title: "Error", description: `Invalid column index for ${field.label}` });
                    return;
                  }
                  mapping[field.key] = idx;
                }
              }
              handleSetMapping(mapping);
            }}
          >
            {REQUIRED_FIELDS.map(field => (
              <label key={field.key} className="flex flex-col text-sm">
                <span className="mb-1">{field.label} column:</span>
                {(field.key === "description" || field.key === "amount") ? (
                  <select
                    name={field.key}
                    className="border rounded p-1 bg-white text-sm"
                    required
                    multiple
                    style={{ minWidth: 100, maxWidth: 250, minHeight: 64 }}
                  >
                    {parsedPreview[0].map((_, i) => (
                      <option key={i} value={i}>{`Col #${i + 1}`}</option>
                    ))}
                  </select>
                ) : (
                  <select
                    name={field.key}
                    className="border rounded p-1 bg-white text-sm"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select...
                    </option>
                    {parsedPreview[0].map((_, i) => (
                      <option key={i} value={i}>{`Col #${i + 1}`}</option>
                    ))}
                  </select>
                )}
              </label>
            ))}
            <Button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700">Map Columns</Button>
          </form>
        </div>
      )}
      {/* Confirm + Import */}
      {parsedPreview && columnMapping && (
        <div className="mt-4 border rounded bg-muted/10 p-3">
          <div className="font-semibold mb-1">Ready to import?</div>
          <ul className="text-xs mb-2 text-muted-foreground">
            {REQUIRED_FIELDS.map(field => {
              let display;
              if (field.key === "description") {
                const idxs = columnMapping[field.key];
                if (Array.isArray(idxs)) {
                  display = idxs.map(idx => `#${(idx as number) + 1}`).join(", ");
                } else {
                  display = `#${(idxs as number) + 1}`;
                }
                return <li key={field.key}>Field "<b>{field.label}</b>" mapped to column(s) {display}</li>;
              } else {
                const idx = columnMapping[field.key];
                display = typeof idx === "number" ? `#${idx + 1}` : "";
                return <li key={field.key}>Field "<b>{field.label}</b>" mapped to column {display}</li>;
              }
            })}
          </ul>
          <Button
            onClick={handleImport}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 mr-2"
          >Import</Button>
          <Button
            variant="ghost"
            onClick={() => { setColumnMapping(null); setParsedPreview(parsedPreview); }}
          >Remap</Button>
        </div>
      )}
    </div>
  );
};

export default TransactionImporter;