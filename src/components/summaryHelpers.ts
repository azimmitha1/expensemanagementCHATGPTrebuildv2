
export function formatCurrency(v: number) {
  return "$" +
    v.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
}

export function getMonthString(dateStr: string) {
  const [y, m] = dateStr.split("-");
  if (!y || !m) return dateStr;
  return new Date(Number(y), Number(m) - 1).toLocaleString("default", {
    month: "long",
    year: "numeric"
  });
}

export function getDeltaClass(delta: number) {
  return delta === 0
    ? "text-muted-foreground"
    : delta < 0
    ? "text-green-600"
    : "text-red-600";
}
