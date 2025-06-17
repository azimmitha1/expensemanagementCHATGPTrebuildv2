
export const getAllYears = (transactions: any[]) => {
  const years = Array.from(
    new Set(transactions.map(txn => String(txn.date).slice(0, 4)))
  );
  return years.sort();
};
