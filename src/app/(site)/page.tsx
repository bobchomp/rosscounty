import Link from "next/link";
import { siteNav } from "@/lib/nav";

const quickLinks = siteNav.filter((link) => link.href !== "/");

export default function HomePage() {
  return (
    <div>
      <section className="bg-club-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-club-gold">
            Placeholder Website — In Development
          </p>
          <h1 className="mt-4 text-4xl font-bold sm:text-6xl">
            Ross County Football Club
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-white/75">
            This is an early mock-up of the club website. Crest, photography,
            colours, and all match/news/ticket content will be added once
            approved.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-semibold text-club-navy">Explore the site</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-xl border border-club-navy/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="text-lg font-semibold text-club-navy group-hover:text-club-navy-light">
                {link.label}
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                Placeholder page — content to follow.
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
