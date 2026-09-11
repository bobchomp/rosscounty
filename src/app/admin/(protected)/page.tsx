import { adminNav } from "@/lib/nav";

export default function AdminDashboardPage() {
  const sections = adminNav.filter((link) => link.href !== "/admin");

  return (
    <div>
      <h1 className="text-2xl font-bold text-club-navy">Dashboard</h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-600">
        Welcome to the Ross County FC admin panel. This is a placeholder —
        real stats and shortcuts will appear here once the site is
        populated with data.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <div
            key={section.href}
            className="rounded-xl border border-club-navy/10 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-semibold text-club-navy">{section.label}</p>
            <p className="mt-1 text-xs text-neutral-500">Not set up yet.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
