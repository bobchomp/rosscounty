"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { adminNav, type NavLink } from "@/lib/nav";
import { createClient } from "@/lib/supabase/client";

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function mostSpecificActiveChild(pathname: string, children: NavLink[]) {
  return [...children]
    .sort((a, b) => b.href.length - a.href.length)
    .find((child) => isActive(pathname, child.href));
}

export function AdminShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [openLabel, setOpenLabel] = useState<string | null>(() => {
    const activeParent = adminNav.find(
      (item) => item.children && mostSpecificActiveChild(pathname, item.children)
    );
    return activeParent?.label ?? null;
  });
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
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
          {adminNav.map((item) => {
            if (item.children) {
              const isOpen = openLabel === item.label;
              const activeChild = mostSpecificActiveChild(pathname, item.children);

              return (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() => setOpenLabel(isOpen ? null : item.label)}
                    aria-expanded={isOpen}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                      activeChild
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`text-xs transition-transform ${isOpen ? "rotate-90" : ""}`}
                      aria-hidden
                    >
                      ›
                    </span>
                  </button>
                  {isOpen && (
                    <div className="mt-1 ml-3 space-y-1 border-l border-white/10 pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                            child === activeChild
                              ? "bg-white/10 text-white"
                              : "text-white/70 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
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
              disabled={signingOut}
              className="rounded-md border border-club-navy/20 px-3 py-1.5 text-sm font-medium text-club-navy hover:bg-club-navy/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </header>
        <main className="flex-1 bg-neutral-50 px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
