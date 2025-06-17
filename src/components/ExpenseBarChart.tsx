import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Colors
const incomeColor = "#22d3ee"; // teal for income (up)
const expenseColor = "#ef4444"; // red for expenses (down)
const netColor = "#818cf8"; // purple for net

// Waterfall chart transforms: income is +, expenses are -.
function prepareWaterfallBarData(
  data: Record<string, { income: number; expense: number; net: number }>,
  categories: string[],
  incomeCats: string[]
) {
  return categories.map((cat) => ({
    name: cat,
    // Income appears as positive
    income: incomeCats.includes(cat) ? (data[cat]?.income || 0) : 0,
    // Expense appears as negative
    expense: !incomeCats.includes(cat) ? -(data[cat]?.expense || 0) : 0,
    // Net for reference/tooltip or small overlay
    net: (data[cat]?.net) || 0,
  }));
}

type Props = {
  data: Record<string, { income: number; expense: number; net: number }>;
  categories: string[];
  incomeCategories: string[];
  onlyNet?: boolean; // Unused for waterfall but left for interface compatibility

  // New for single-category/monthly bar chart mode
  singleCategoryMonthlyData?: { months: string[]; amounts: number[]; category: string };
  chartTitle?: string;
  // New: allow overriding bar color in single-category mode
  barColor?: string;
};

const ExpenseBarChart: React.FC<Props> = ({
  data,
  categories,
  incomeCategories,
  onlyNet,
  singleCategoryMonthlyData,
  chartTitle,
  barColor,
}) => {
  // If single category monthly mode is active:
  if (singleCategoryMonthlyData) {
    const { months, amounts, category } = singleCategoryMonthlyData;

    // Prepare data for recharts
    const barData = months.map((month, idx) => ({
      month,
      amount: amounts[idx] || 0,
    }));

    if (!barData.length)
      return (
        <div className="text-center text-muted-foreground text-sm">
          No data
        </div>
      );

    // Default bar color: expense (red). If barColor is specified, use it.
    const monthlyBarColor = barColor === "green"
      ? "#22c55e"
      : expenseColor;

    return (
      <div>
        {chartTitle && (
          <div className="font-semibold mb-2 text-base text-center">{chartTitle}</div>
        )}
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={barData}
            margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
            barGap={6}
          >
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip
              formatter={(value: any) => [
                `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                "Amount",
              ]}
              labelFormatter={m => m}
            />
            <Legend payload={[
                { value: category, type: "square", color: monthlyBarColor }
              ]}
            />
            <Bar
              dataKey="amount"
              fill={monthlyBarColor}
              name={category}
              isAnimationActive={false}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // ... keep existing code (summary bars and waterfall) the same ...
  // Existing code for the old mode
  const barData = prepareWaterfallBarData(data, categories, incomeCategories);

  if (!barData.length)
    return (
      <div className="text-center text-muted-foreground text-sm">
        No transactions
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={barData}
        margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
        barGap={2}
      >
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
        />
        <YAxis />
        <Tooltip
          formatter={(value: any, name: any) => [
            `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            name.charAt(0).toUpperCase() + name.slice(1),
          ]}
        />
        <Legend
          payload={[
            { value: "Income", type: "square", color: incomeColor },
            { value: "Expenses", type: "square", color: expenseColor },
          ]}
        />
        <Bar
          dataKey="income"
          stackId="waterfall"
          fill={incomeColor}
          name="Income (up)"
          isAnimationActive={false}
        />
        <Bar
          dataKey="expense"
          stackId="waterfall"
          fill={expenseColor}
          name="Expenses (down)"
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ExpenseBarChart;
