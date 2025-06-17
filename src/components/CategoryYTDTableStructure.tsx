
import React from "react";
import CategoryYTDTableTotalsRow from "./CategoryYTDTableTotalsRow";
import CategoryYTDTableNetSavingsRow from "./CategoryYTDTableNetSavingsRow";
import CategoryYTDTablePercentSavedRow from "./CategoryYTDTablePercentSavedRow";
import CategoryYTDGroupSection from "./CategoryYTDGroupSection";
import CategoryYTDOtherSection from "./CategoryYTDOtherSection";
import type { Category } from "./CategoryEditor";

type Props = {
  years: string[];
  groupsUsed: string[];
  renderGroupSection: (g: string) => React.ReactNode;
  unassignedIncomeCats: Category[];
  unassignedExpenseCats: Category[];
  ytdTotals: Record<string, Record<string, { income: number; expense: number; net: number }>>;
  totalsPerYear: { income: number; expense: number; net: number }[];
  percentSavedPerYear: (number | null)[];
  grandNet: number;
  grandPercentSaved: number | null;
};

const CategoryYTDTableStructure: React.FC<Props> = ({
  years,
  groupsUsed,
  renderGroupSection,
  unassignedIncomeCats,
  unassignedExpenseCats,
  ytdTotals,
  totalsPerYear,
  percentSavedPerYear,
  grandNet,
  grandPercentSaved,
}) => (
  <table className="min-w-full text-sm">
    <thead>
      <tr>
        <th className="py-2 px-4 bg-muted text-left sticky left-0 z-10 bg-white">Category</th>
        {years.map(year => (
          <th className="py-2 px-3 text-center bg-muted" key={year}>{year}</th>
        ))}
        <th className="py-2 px-3 text-center bg-muted">Total</th>
      </tr>
    </thead>
    <tbody>
      {groupsUsed.map(g => renderGroupSection(g))}
      <CategoryYTDOtherSection
        sectionName="Other Income"
        cats={unassignedIncomeCats}
        years={years}
        ytdTotals={ytdTotals}
      />
      <CategoryYTDOtherSection
        sectionName="Other Expenses"
        cats={unassignedExpenseCats}
        years={years}
        ytdTotals={ytdTotals}
      />
      <CategoryYTDTableTotalsRow totalsPerYear={totalsPerYear} years={years} />
      <CategoryYTDTableNetSavingsRow totalsPerYear={totalsPerYear} years={years} grandNet={grandNet} />
      <CategoryYTDTablePercentSavedRow percentSavedPerYear={percentSavedPerYear} grandPercentSaved={grandPercentSaved} years={years} />
    </tbody>
  </table>
);

export default CategoryYTDTableStructure;
