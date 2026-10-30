import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { site } from "@/lib/site";
import LoginForm from "./LoginForm";

export const metadata = { title: "Admin login" };

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.app_metadata?.role === "admin") redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">{site.name} admin</h1>
        <p className="mb-6 mt-1 text-sm text-neutral-500">
          Sign in to manage your iPhones.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
