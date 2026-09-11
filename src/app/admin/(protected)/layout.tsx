import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { SupabaseNotConfigured } from "@/components/admin/supabase-not-configured";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  if (!supabase) {
    return <SupabaseNotConfigured />;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return <AdminShell userEmail={user.email ?? "Admin"}>{children}</AdminShell>;
}
