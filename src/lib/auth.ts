import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Every admin page and server action calls this. Admin = a user whose
// app_metadata contains {"role": "admin"} (set manually in Supabase).
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    redirect("/admin/login");
  }
  return { supabase, user };
}
