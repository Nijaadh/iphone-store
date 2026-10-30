import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-only client that bypasses Row Level Security. Used to save customer
// orders, since the public key is not allowed to write to the orders tables.
export function createSecretClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SECRET_KEY is not set. Add it to .env.local and to your Vercel environment variables."
    );
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
