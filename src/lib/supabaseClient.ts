import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hfxwyceytpqatebhzkqo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmeHd5Y2V5dHBxYXRlYmh6a3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNjE3MTcsImV4cCI6MjA2NTYzNzcxN30.6uGQfb5s888NikLmz1gU2nT4dQJCQiR7shribi_DstQ'
export const supabase = createClient(supabaseUrl, supabaseAnonKey);