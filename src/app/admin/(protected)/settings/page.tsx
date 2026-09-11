import { createClient } from "@/lib/supabase/server";
import { getCompetitions, getSiteSettings } from "@/lib/fixtures/queries";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";
import { SupabaseNotConfigured } from "@/components/admin/supabase-not-configured";
import { setApiFootballConfig, setCompetitionApiFootballId, setCurrentCompetition } from "./actions";

const selectClass =
  "mt-1 w-full max-w-xs rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-club-navy focus:outline-none";
const inputClass =
  "rounded-md border border-neutral-300 px-2 py-1.5 text-sm focus:border-club-navy focus:outline-none";
const buttonClass =
  "rounded-md bg-club-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-club-navy-light";

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

          <button type="submit" className={`mt-4 ${buttonClass}`}>
            Save
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-club-navy/10 bg-white p-6">
        <h2 className="text-lg font-semibold text-club-navy">API-Football sync</h2>
        <p className="mt-1 max-w-2xl text-sm text-neutral-600">
          Lets Fixtures &amp; Results pull the latest fixtures and league
          table on demand (a button you press after a match, not an
          automatic daily sync). Needs a free API key from{" "}
          <a href="https://www.api-football.com/" target="_blank" rel="noreferrer" className="underline">
            api-football.com
          </a>{" "}
          set as <code>API_FOOTBALL_KEY</code> in your environment, plus the
          IDs below — see the README for how to look them up.
        </p>

        <form action={setApiFootballConfig} className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500" htmlFor="api_football_season">
              Season
            </label>
            <input
              id="api_football_season"
              name="api_football_season"
              type="number"
              placeholder="e.g. 2025"
              defaultValue={settings?.api_football_season ?? ""}
              className={`${inputClass} w-28`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500" htmlFor="api_football_team_id">
              Ross County team ID
            </label>
            <input
              id="api_football_team_id"
              name="api_football_team_id"
              type="number"
              defaultValue={settings?.api_football_team_id ?? ""}
              className={`${inputClass} w-40`}
            />
          </div>
          <button type="submit" className={buttonClass}>
            Save
          </button>
        </form>

        <div className="mt-6 border-t border-neutral-100 pt-4">
          <p className="text-sm font-medium text-neutral-700">Competition league IDs</p>
          <div className="mt-3 space-y-3">
            {competitions.map((competition) => (
              <form
                key={competition.id}
                action={setCompetitionApiFootballId}
                className="flex flex-wrap items-center gap-3"
              >
                <input type="hidden" name="competition_id" value={competition.id} />
                <span className="w-48 text-sm text-neutral-700">{competition.name}</span>
                <input
                  name="api_football_id"
                  type="number"
                  placeholder="League ID"
                  defaultValue={competition.api_football_id ?? ""}
                  className={`${inputClass} w-32`}
                />
                <button type="submit" className={buttonClass}>
                  Save
                </button>
              </form>
            ))}
          </div>
        </div>
      </section>

      <AdminPlaceholder
        title="Everything else"
        description="Shop redirect URL, admin user management and other site-wide settings will be added here."
      />
    </div>
  );
}
