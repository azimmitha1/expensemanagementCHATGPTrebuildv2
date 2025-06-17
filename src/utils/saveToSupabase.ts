import { supabase } from '../lib/supabaseClient';

export async function saveTransactionsToSupabase(rows, userId) {
  const formatted = rows.map((row) => ({
    amount: parseFloat(row.amount),
    category: row.category || null,
    note: row.note || null,
    date: row.date,
    user_id: userId,
  }));

  const { error } = await supabase.from('transactions').insert(formatted);
  return error;
}
