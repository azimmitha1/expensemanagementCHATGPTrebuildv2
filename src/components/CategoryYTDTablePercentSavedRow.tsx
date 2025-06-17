
import React from "react";

type Props = {
  percentSavedPerYear: (number|null)[];
  grandPercentSaved: number|null;
  years: string[];
};

const CategoryYTDTablePercentSavedRow: React.FC<Props> = ({
  percentSavedPerYear,
  grandPercentSaved,
  years
}) => (
  <tr>
    <td className="py-2 px-4 font-bold bg-muted sticky left-0 z-10">% Saved</td>
    {percentSavedPerYear.map((pct, idx) => (
      <td
        key={"pct-" + idx}
        className={`py-2 px-3 text-center font-bold ${pct != null && pct >= 0 ? "text-green-700" : "text-red-700"} bg-gray-50`}
      >
        {pct == null ? "-" : `${pct.toFixed(1)}%`}
      </td>
    ))}
    <td
      className={`py-2 px-3 text-center font-bold ${
        grandPercentSaved != null && grandPercentSaved >= 0 ? "text-green-700" : "text-red-700"
      } bg-gray-100`}
    >
      {grandPercentSaved == null ? "-" : `${grandPercentSaved.toFixed(1)}%`}
    </td>
  </tr>
);

export default CategoryYTDTablePercentSavedRow;
