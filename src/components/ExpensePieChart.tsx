import React from "react";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { isIncomeCategory } from "../utils/categoryTypeUtils";
import { Percent } from "lucide-react"; // Not needed for actual icon but kept per guidelines

const incomeColor = "#22d3ee";
const expenseColor = "#ef4444";

function preparePieData(
  data: Record<string, { income: number; expense: number; net: number }>,
  categories: string[],
  incomeCats: string[]
) {
  // One slice per category, separate for income and expense
  const result: any[] = [];
  categories.forEach((cat) => {
    if (data[cat]?.income) {
      result.push({ name: `${cat} Income`, value: data[cat].income, fill: incomeColor, category: cat, type: "income" });
    }
    if (data[cat]?.expense) {
      result.push({ name: `${cat} Expense`, value: data[cat].expense, fill: expenseColor, category: cat, type: "expense" });
    }
  });
  // Add percent calculation for each slice
  const total = result.reduce((sum, slice) => sum + slice.value, 0);
  return result.map((slice) => ({
    ...slice,
    percent: total > 0 ? (slice.value / total) * 100 : 0,
  }));
}

type Props = {
  data: Record<string, { income: number; expense: number; net: number }>;
  categories: string[];
  incomeCategories: string[];
};

const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name, value, fill } = props;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.03) return null;

  // No percent in label now
  // Format $ value (no decimals)
  const valueDisplay = `$${Math.round(Number(value))}`;

  return (
    <text
      x={x}
      y={y}
      fill={fill}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={14}
      fontWeight={500}
    >
      {`${name}: ${valueDisplay}`}
    </text>
  );
};

const ExpensePieChart: React.FC<Props> = ({ data, categories, incomeCategories }) => {
  const pieData = preparePieData(data, categories, incomeCategories);
  if (!pieData.length) return <div className="text-center text-muted-foreground text-sm">Nothing to show</div>;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={pieData}
          nameKey="name"
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius={80}
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {pieData.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          formatter={function (value: any, name: any, props: any) {
            const entry = pieData.find((e) => e.name === name);
            const percent = entry ? entry.percent : 0;
            const percentDisplay = Math.round(percent);
            // Format value as whole dollars (no decimals)
            const display = `$${Math.round(value)} (${percentDisplay}%)`;
            return [display, name];
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ExpensePieChart;
