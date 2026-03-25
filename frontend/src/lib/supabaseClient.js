import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseBrowserConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseBrowserConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helps verify that Vite actually picked up env vars.
console.log("Supabase env loaded:", {
  hasUrl: Boolean(supabaseUrl),
  hasAnonKey: Boolean(supabaseAnonKey),
  configured: isSupabaseBrowserConfigured,
});
