
import type { Category } from "./CategoryEditor";

type Args = {
  transactions: any[],
  categories: Category[],
  categoryGroups: string[],
  categoryAssignments: Record<string, string>,
  groupOrder: string[],
  perGroupCategoryOrders: Record<string, string[]>,
  year: string,
};
export function useCategoryGroupings({
  transactions,
  categories,
  categoryGroups = [],
  categoryAssignments = {},
  groupOrder = [],
  perGroupCategoryOrders = {},
  year,
}: Args) {
  // Only use txns for selectedYear
  const useYear = year || (transactions.length ? String(transactions.map(t=>t.date?.slice(0,4)).sort().pop()) : new Date().getFullYear());
  const yearTxns = transactions.filter(t => String(t.date).slice(0,4) === String(useYear));

  // Broader group order
  const groupNames = groupOrder.length ? groupOrder : categoryGroups;
  // Only use categories present in this year
  const catNames = Array.from(new Set(yearTxns.map(t => t.category).filter(Boolean)));
  const usedCategories = categories.filter(c => catNames.includes(c.name));

  // Build per-group category arrays in correct order
  const groupToCategories: Record<string, Category[]> = {};
  for (const g of groupNames) {
    const cats = (perGroupCategoryOrders[g] || [])
      .map(name => usedCategories.find(c=>c.name===name))
      .filter((c): c is Category => !!c && (categoryAssignments[c.name]===g));
    groupToCategories[g] = cats;
  }
  // "Other" group: any not assigned or in any group list
  const groupedSet = new Set(groupNames.flatMap(g => (perGroupCategoryOrders[g] || [])));
  const otherCats = usedCategories.filter(c =>
    !categoryAssignments[c.name] || !groupNames.includes(categoryAssignments[c.name]) || !groupedSet.has(c.name)
  );
  if (otherCats.length) {
    groupToCategories["Other"] = otherCats;
  }

  return {
    useYear,
    yearTxns,
    groupNames,
    groupToCategories,
    usedCategories,
    catNames
  };
}
