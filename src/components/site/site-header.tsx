"use client";

import Link from "next/link";
import { useState } from "react";
import { siteNav } from "@/lib/nav";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-club-navy-light/20 bg-club-navy text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          {/* Placeholder crest — replace with the club badge SVG/PNG. */}
          <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-club-gold text-sm font-bold">
            RCFC
          </span>
          <span className="text-lg font-semibold tracking-wide">
            Ross County Football Club
          </span>
        </Link>

        <nav className="hidden lg:flex lg:items-center lg:gap-6">
          {siteNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/85 transition-colors hover:text-club-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-md p-2 text-white lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className="sr-only">Toggle navigation</span>
          <div className="flex flex-col gap-1.5">
            <span className="h-0.5 w-6 bg-white" />
            <span className="h-0.5 w-6 bg-white" />
            <span className="h-0.5 w-6 bg-white" />
          </div>
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-club-navy-dark lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6">
            {siteNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/5 py-3 text-sm font-medium text-white/85 last:border-none"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
