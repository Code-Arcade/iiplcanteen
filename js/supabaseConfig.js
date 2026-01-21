const SUPABASE_URL = 'https://abmfgqyxfffuqsqbkxhr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_l3ZszLehKsfk5yOGH62Hjw_K0ZdEfCj';

// Initialize Supabase Client
// We attach it to window to ensure it's globally accessible across scripts
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
