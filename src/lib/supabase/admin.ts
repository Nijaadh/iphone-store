import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-only client that bypasses Row Level Security. Used to save customer
// orders, since the public key is not allowed to write to the orders tables.
// Accepts either the current Supabase name or the older service_role one.
export function secretKey() {
  return (
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    null
  );
}

export function createSecretClient() {
  const key = secretKey();
  if (!key) {
    throw new Error(
      "SUPABASE_SECRET_KEY is not set. Add it to .env.local and to your Vercel environment variables."
    );
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
