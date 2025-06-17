
// Helper for formatting currency values
export function formatCurrency(v: number) {
  return "$" + v.toLocaleString(undefined, { minimumFractionDigits: 2 });
}
