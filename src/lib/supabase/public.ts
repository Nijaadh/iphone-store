import { createClient } from "@supabase/supabase-js";

// Cookie-less client for public shop pages (no login needed).
// Row Level Security still applies: it can only read what the policies allow.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
