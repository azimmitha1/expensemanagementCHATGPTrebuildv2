
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type ManualTransactionDialogProps = {
  categories: string[];
  onAdd: (txn: { date: string; description: string; amount: number; category: string }) => void;
  buttonText?: string;
};

const ManualTransactionDialog: React.FC<ManualTransactionDialogProps> = ({ categories, onAdd, buttonText }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    date: "",
    description: "",
    amount: "",
    category: categories[0] || "",
  });
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (cat: string) => {
    setForm({ ...form, category: cat });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Validation
    if (!form.date || !form.description || !form.amount || !form.category) {
      setError("All fields are required.");
      return;
    }
    if (isNaN(Number(form.amount))) {
      setError("Amount must be a valid number.");
      return;
    }
    const txn = {
      date: form.date,
      description: form.description,
      amount: Number(form.amount),
      category: form.category,
    };
    onAdd(txn);
    toast({
      title: "Transaction added",
      description: `Added "${form.description}".`,
    });
    setForm({
      date: "",
      description: "",
      amount: "",
      category: categories[0] || "",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ring-1 ring-blue-200">
          {buttonText || "+ New Transaction"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-2">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogDescription>Fill out the details and save.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              placeholder="Date"
            />
            <Input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              placeholder="Description"
              maxLength={64}
            />
            <Input
              type="number"
              step="0.01"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              required
              placeholder="Amount"
            />
            <Select value={form.category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full">{form.category || "Select category"}</SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem value={cat} key={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <div className="text-destructive text-sm">{error}</div>}
          <DialogFooter>
            <Button type="submit">Add</Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManualTransactionDialog;

