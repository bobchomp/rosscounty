import Link from "next/link";
import { siteNav } from "@/lib/nav";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-club-navy-light/20 bg-club-navy-dark text-white/70">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-lg font-semibold text-white">Ross County FC</p>
            <p className="mt-2 max-w-xs text-sm">
              Placeholder site in development. Club address, contact details
              and social links to be added.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/50">
              Explore
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {siteNav.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-club-gold">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/50">
              Follow
            </p>
            <p className="mt-3 text-sm">
              Social media links placeholder (X / Instagram / Facebook /
              YouTube).
            </p>
          </div>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
          &copy; {new Date().getFullYear()} Ross County Football Club — mock
          site for demonstration purposes.
        </p>
      </div>
    </footer>
  );
}
