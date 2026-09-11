import { createClient } from "@/lib/supabase/server";
import { getCompetitions, getSiteSettings } from "@/lib/fixtures/queries";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";
import { SupabaseNotConfigured } from "@/components/admin/supabase-not-configured";
import { setCurrentCompetition } from "./actions";

const selectClass =
  "mt-1 w-full max-w-xs rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-club-navy focus:outline-none";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  if (!supabase) return <SupabaseNotConfigured />;

  const [competitions, settings] = await Promise.all([
    getCompetitions(supabase),
    getSiteSettings(supabase),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-club-navy">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600">
          Site-wide settings. More (Shop redirect URL, admin user
          management) will be added here later.
        </p>
      </div>

      <section className="rounded-xl border border-club-navy/10 bg-white p-6">
        <h2 className="text-lg font-semibold text-club-navy">
          Current competition
        </h2>
        <p className="mt-1 max-w-xl text-sm text-neutral-600">
          Controls which competition&apos;s fixtures and league table are
          managed in the Fixtures &amp; Results section and shown on the
          public Fixtures page. Change this when the club is promoted or
          relegated.
        </p>

        <form action={setCurrentCompetition} className="mt-4">
          <label htmlFor="competition_id" className="block text-sm font-medium text-neutral-700">
            Competition
          </label>
          <select
            id="competition_id"
            name="competition_id"
            defaultValue={settings?.current_competition_id ?? ""}
            className={selectClass}
          >
            <option value="" disabled>
              Select a competition…
            </option>
            {competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="mt-4 rounded-md bg-club-navy px-4 py-2 text-sm font-semibold text-white hover:bg-club-navy-light"
          >
            Save
          </button>
        </form>
      </section>

      <AdminPlaceholder
        title="Everything else"
        description="Shop redirect URL, admin user management and other site-wide settings will be added here."
      />
    </div>
  );
}
