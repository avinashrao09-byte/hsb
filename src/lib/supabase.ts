import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-side client for use in Server Components and Server Actions.
// For this scaffold RLS is left permissive; tighten before real PII goes in.
export function getServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null; // lets the UI render a "connect Supabase" state
  return createClient(url, key, { auth: { persistSession: false } });
}

export function isConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
