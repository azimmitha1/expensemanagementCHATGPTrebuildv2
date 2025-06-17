
import React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  allYears: string[];
  selectedYear: string;
  setSelectedYear: (y: string) => void;
  monthsForSelectedYear: string[];
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const YearMonthPicker: React.FC<Props> = ({
  allYears,
  selectedYear,
  setSelectedYear,
  monthsForSelectedYear,
  selectedMonth,
  setSelectedMonth,
}) => (
  <div className="flex flex-wrap gap-4 mb-6 items-center">
    <span className="font-semibold text-muted-foreground">Select year:</span>
    <Select value={selectedYear} onValueChange={setSelectedYear}>
      <SelectTrigger className="w-[110px] min-w-[92px] bg-white border" >
        <SelectValue placeholder="Year" />
      </SelectTrigger>
      <SelectContent>
        {allYears.map((year) => (
          <SelectItem key={year} value={year}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <span className="font-semibold text-muted-foreground ml-4">Select month:</span>
    <Select value={selectedMonth} onValueChange={setSelectedMonth} >
      <SelectTrigger className="w-[140px] min-w-[110px] bg-white border">
        <SelectValue placeholder="Month" />
      </SelectTrigger>
      <SelectContent>
        {monthsForSelectedYear.map((m) => (
          <SelectItem key={m} value={m}>
            {MONTH_NAMES[parseInt(m, 10) - 1] || m}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default YearMonthPicker;
