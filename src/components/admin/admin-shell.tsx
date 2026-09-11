"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminNav } from "@/lib/nav";
import { createClient } from "@/lib/supabase/client";

export function AdminShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-64 shrink-0 flex-col bg-club-navy-dark text-white lg:flex">
        <div className="px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-club-gold">
            Ross County FC
          </p>
          <p className="mt-1 text-lg font-semibold">Admin Panel</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {adminNav.map((link) => {
            const active =
              link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-6 py-4 text-xs text-white/60">
          Signed in as
          <div className="truncate text-sm text-white">{userEmail}</div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-club-navy/10 bg-white px-4 py-3 sm:px-6">
          <p className="text-sm font-medium text-neutral-500 lg:hidden">
            RCFC Admin
          </p>
          <div className="ml-auto">
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-md border border-club-navy/20 px-3 py-1.5 text-sm font-medium text-club-navy hover:bg-club-navy/5"
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="flex-1 bg-neutral-50 px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
