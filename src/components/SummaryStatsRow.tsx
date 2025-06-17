
import React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

type Props = {
  monthStr: string | null;
  thisMonthIncome: number;
  thisMonthExpense: number;
  thisMonthNet: number;
  prevMonthKey?: string | null;
  prevMonthIncome: number;
  prevMonthExpense: number;
  prevMonthNet: number;
  lastYearIncome: number;
  lastYearExpense: number;
  lastYearNet: number;
  incomeDeltaMoM: number;
  expenseDeltaMoM: number;
  netDeltaMoM: number;
  incomeDeltaYoY: number;
  expenseDeltaYoY: number;
  netDeltaYoY: number;
  getMonthString: (dateStr: string) => string;
  formatCurrency: (v: number) => string;
  getDeltaClass: (d: number) => string;
  sameMonthLastYearKey: string | null;
};

// Standard green/red for positive/negative values
function getDeltaClass(d: number) {
  if (d > 0) return "text-green-700";
  if (d < 0) return "text-red-600";
  return "text-muted-foreground";
}
// Inverted: positive change = red, negative = green (for Expenses only)
function getDeltaClassInverted(d: number) {
  if (d > 0) return "text-red-600";
  if (d < 0) return "text-green-700";
  return "text-muted-foreground";
}

const SummaryStatsRow: React.FC<Props> = (props) => {
  // Compute proper "Prior Month" label
  let priorMonthLabel = "Prior Month";
  if (props.prevMonthKey && props.getMonthString) {
    priorMonthLabel = props.getMonthString(props.prevMonthKey);
  }

  return (
    <div className="bg-white rounded-xl shadow border border-muted mb-4 px-2 py-3 flex flex-wrap gap-4 md:gap-8 justify-between items-center">
      {/* Month */}
      <div>
        <div className="text-muted-foreground text-xs">Month</div>
        <div className="font-bold text-lg">
          {props.monthStr ? props.getMonthString(props.monthStr) : "n/a"}
        </div>
      </div>
      {/* Income */}
      <div>
        <div className="text-muted-foreground text-xs">Total Income</div>
        <div className="font-mono font-bold text-lg text-green-600">{props.formatCurrency(props.thisMonthIncome)}</div>
        <div className={`text-xs ${getDeltaClass(props.incomeDeltaMoM)}`}>
          {props.prevMonthKey && props.prevMonthIncome > 0 &&
            <>
              vs Prior Month ({priorMonthLabel}): {props.formatCurrency(props.prevMonthIncome)}
              {" "}
              {props.incomeDeltaMoM !== 0 && (
                <>
                  {props.incomeDeltaMoM > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  ({props.incomeDeltaMoM > 0 ? "+" : ""}{props.incomeDeltaMoM.toFixed(1)}%)
                </>
              )}
            </>
          }
        </div>
        <div className={`text-xs ${getDeltaClass(props.incomeDeltaYoY)}`}>
          {props.lastYearIncome > 0 && props.sameMonthLastYearKey &&
            <>
              vs {props.getMonthString(props.sameMonthLastYearKey)}: {props.formatCurrency(props.lastYearIncome)}
              {" "}
              {props.incomeDeltaYoY !== 0 && (
                <>
                  {props.incomeDeltaYoY > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  ({props.incomeDeltaYoY > 0 ? "+" : ""}{props.incomeDeltaYoY.toFixed(1)}%)
                </>
              )}
            </>
          }
        </div>
      </div>
      {/* Expenses */}
      <div>
        <div className="text-muted-foreground text-xs">Total Expenses</div>
        <div className="font-mono font-bold text-lg text-red-500">{props.formatCurrency(props.thisMonthExpense)}</div>
        <div className={`text-xs ${getDeltaClassInverted(props.expenseDeltaMoM)}`}>
          {props.prevMonthKey && props.prevMonthExpense > 0 &&
            <>
              vs Prior Month ({priorMonthLabel}): {props.formatCurrency(props.prevMonthExpense)}
              {" "}
              {props.expenseDeltaMoM !== 0 && (
                <>
                  {props.expenseDeltaMoM > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  ({props.expenseDeltaMoM > 0 ? "+" : ""}{props.expenseDeltaMoM.toFixed(1)}%)
                </>
              )}
            </>
          }
        </div>
        <div className={`text-xs ${getDeltaClassInverted(props.expenseDeltaYoY)}`}>
          {props.lastYearExpense > 0 && props.sameMonthLastYearKey &&
            <>
              vs {props.getMonthString(props.sameMonthLastYearKey)}: {props.formatCurrency(props.lastYearExpense)}
              {" "}
              {props.expenseDeltaYoY !== 0 && (
                <>
                  {props.expenseDeltaYoY > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  ({props.expenseDeltaYoY > 0 ? "+" : ""}{props.expenseDeltaYoY.toFixed(1)}%)
                </>
              )}
            </>
          }
        </div>
      </div>
      {/* Net Income → Net Savings */}
      <div>
        <div className="text-muted-foreground text-xs font-bold">Net Savings</div>
        <div className={`font-mono font-bold text-lg ${props.thisMonthNet >= 0 ? "text-green-700" : "text-red-700"}`}>
          {props.formatCurrency(props.thisMonthNet)}
        </div>
        <div className={`text-xs ${getDeltaClass(props.netDeltaMoM)}`}>
          {props.prevMonthKey && props.prevMonthNet !== 0 &&
            <>
              vs Prior Month ({priorMonthLabel}): {props.formatCurrency(props.prevMonthNet)}
              {" "}
              {props.netDeltaMoM !== 0 && (
                <>
                  {props.netDeltaMoM > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  ({props.netDeltaMoM > 0 ? "+" : ""}{props.netDeltaMoM.toFixed(1)}%)
                </>
              )}
            </>
          }
        </div>
        <div className={`text-xs ${getDeltaClass(props.netDeltaYoY)}`}>
          {props.lastYearNet !== 0 && props.sameMonthLastYearKey &&
            <>
              vs {props.getMonthString(props.sameMonthLastYearKey)}: {props.formatCurrency(props.lastYearNet)}
              {" "}
              {props.netDeltaYoY !== 0 && (
                <>
                  {props.netDeltaYoY > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  ({props.netDeltaYoY > 0 ? "+" : ""}{props.netDeltaYoY.toFixed(1)}%)
                </>
              )}
            </>
          }
        </div>
      </div>
    </div>
  );
};
export default SummaryStatsRow;
