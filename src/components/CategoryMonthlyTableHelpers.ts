
// Table helpers - extracted from CategoryMonthlyHistoryTable

export function formatCurrency(v: number) {
  return "$" + v.toLocaleString(undefined, { minimumFractionDigits: 2 });
}

export function getCategoryOrder(
  allCategoryNames: string[],
  categoryOrder: string[]
) {
  let orderedNames = allCategoryNames;
  if (categoryOrder?.length) {
    orderedNames = categoryOrder.filter(name => allCategoryNames.includes(name));
    orderedNames = [
      ...orderedNames,
      ...allCategoryNames.filter(n => !orderedNames.includes(n))
    ];
  }
  return orderedNames;
}
