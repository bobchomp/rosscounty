import { createClient } from "@/lib/supabase/server";
import { getCompetitions, getFixtures, getLeagueTable, getSiteSettings } from "@/lib/fixtures/queries";
import { SupabaseNotConfigured } from "@/components/admin/supabase-not-configured";
import {
  addFixture,
  addTableRow,
  deleteFixture,
  deleteTableRow,
  setApiFootballConfig,
  setCompetitionApiFootballId,
  setCurrentCompetition,
  syncFixturesFromApiFootball,
  syncLeagueTableFromApiFootball,
  updateFixtureResult,
  updateTableRow,
} from "./actions";

const inputClass =
  "rounded-md border border-neutral-300 px-2 py-1.5 text-sm focus:border-club-navy focus:outline-none";
const selectClass =
  "mt-1 w-full max-w-xs rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-club-navy focus:outline-none";
const labelClass = "block text-xs font-medium text-neutral-500";
const buttonClass =
  "rounded-md bg-club-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-club-navy-light";
const dangerButtonClass =
  "rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50";

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDatetimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatSyncedAt(iso: string | null | undefined) {
  if (!iso) return "Never synced";
  return `Last synced ${new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default async function AdminFixturesPage() {
  const supabase = await createClient();
  if (!supabase) return <SupabaseNotConfigured />;

  const [competitions, settings] = await Promise.all([
    getCompetitions(supabase),
    getSiteSettings(supabase),
  ]);
  const currentCompetition =
    competitions.find((c) => c.id === settings?.current_competition_id) ?? null;

  const [fixtures, table] = currentCompetition
    ? await Promise.all([
        getFixtures(supabase, currentCompetition.id),
        getLeagueTable(supabase, currentCompetition.id),
      ])
    : [[], []];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-club-navy">Fixtures & Results</h1>
        {currentCompetition && (
          <p className="mt-1 text-sm text-neutral-600">
            Managing <strong>{currentCompetition.name}</strong>.
          </p>
        )}
      </div>

      <section className="rounded-xl border border-club-navy/10 bg-white p-6">
        <h2 className="text-lg font-semibold text-club-navy">Current competition</h2>
        <p className="mt-1 max-w-xl text-sm text-neutral-600">
          Controls which competition&apos;s fixtures and league table are
          managed below and shown on the public Fixtures page. Change this
          when the club is promoted or relegated.
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
        <h2 className="text-lg font-semibold text-club-navy">API-Football sync setup</h2>
        <p className="mt-1 max-w-2xl text-sm text-neutral-600">
          Needs a free API key from{" "}
          <a href="https://www.api-football.com/" target="_blank" rel="noreferrer" className="underline">
            api-football.com
          </a>{" "}
          set as <code>API_FOOTBALL_KEY</code> in your environment, plus the
          IDs below — see the README for how to look them up.
        </p>

        <form action={setApiFootballConfig} className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label className={labelClass} htmlFor="api_football_season">
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
            <label className={labelClass} htmlFor="api_football_team_id">
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

      {!currentCompetition ? (
        <p className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
          Select a competition above to manage its fixtures and league table.
        </p>
      ) : (
        <>
          <section className="rounded-xl border border-club-navy/10 bg-white p-6">
            <h2 className="text-lg font-semibold text-club-navy">Sync from API-Football</h2>
            <p className="mt-1 max-w-2xl text-sm text-neutral-600">
              Pull the latest fixtures and league table on demand —
              there&apos;s no automatic daily sync, so run this after a
              match rather than waiting on a schedule.
            </p>

            {!currentCompetition.api_football_id || !settings?.api_football_season ? (
              <p className="mt-4 rounded-md bg-amber-50 p-4 text-sm text-amber-800">
                Set the season and this competition&apos;s league ID above
                before syncing.
              </p>
            ) : (
              <div className="mt-4 flex flex-wrap items-center gap-6">
                <div>
                  <form action={syncLeagueTableFromApiFootball} className="flex items-center gap-3">
                    <input type="hidden" name="competition_id" value={currentCompetition.id} />
                    <input type="hidden" name="league_id" value={currentCompetition.api_football_id} />
                    <input type="hidden" name="season" value={settings.api_football_season} />
                    <button type="submit" className={buttonClass}>
                      Pull latest league table
                    </button>
                  </form>
                  <p className="mt-1 text-xs text-neutral-500">{formatSyncedAt(settings.table_last_synced_at)}</p>
                </div>

                <div>
                  {settings.api_football_team_id ? (
                    <form action={syncFixturesFromApiFootball} className="flex items-center gap-3">
                      <input type="hidden" name="competition_id" value={currentCompetition.id} />
                      <input type="hidden" name="league_id" value={currentCompetition.api_football_id} />
                      <input type="hidden" name="season" value={settings.api_football_season} />
                      <input type="hidden" name="team_id" value={settings.api_football_team_id} />
                      <button type="submit" className={buttonClass}>
                        Pull latest fixtures
                      </button>
                    </form>
                  ) : (
                    <p className="text-sm text-amber-800">
                      Set Ross County&apos;s team ID above to sync fixtures.
                    </p>
                  )}
                  {settings.api_football_team_id && (
                    <p className="mt-1 text-xs text-neutral-500">{formatSyncedAt(settings.fixtures_last_synced_at)}</p>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-club-navy/10 bg-white p-6">
            <h2 className="text-lg font-semibold text-club-navy">Add a fixture</h2>
            <form action={addFixture} className="mt-4 flex flex-wrap items-end gap-4">
              <input type="hidden" name="competition_id" value={currentCompetition.id} />
              <div>
                <label className={labelClass} htmlFor="opponent">Opponent</label>
                <input id="opponent" name="opponent" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass} htmlFor="venue">Venue</label>
                <select id="venue" name="venue" required className={inputClass}>
                  <option value="home">Home</option>
                  <option value="away">Away</option>
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="kickoff_at">Kick-off</label>
                <input
                  id="kickoff_at"
                  name="kickoff_at"
                  type="datetime-local"
                  required
                  defaultValue={toDatetimeLocal(new Date())}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="ground">Ground (optional)</label>
                <input id="ground" name="ground" className={inputClass} />
              </div>
              <button type="submit" className={buttonClass}>Add fixture</button>
            </form>
          </section>

          <section className="rounded-xl border border-club-navy/10 bg-white p-6">
            <h2 className="text-lg font-semibold text-club-navy">Fixtures</h2>
            {fixtures.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-500">No fixtures added yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
                      <th className="py-2 pr-4">Kick-off</th>
                      <th className="py-2 pr-4">Opponent</th>
                      <th className="py-2 pr-4">Venue</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">RCFC</th>
                      <th className="py-2 pr-4">Opp.</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fixtures.map((fixture) => (
                      <tr key={fixture.id} className="border-b border-neutral-100 align-middle">
                        <td className="py-2 pr-4 whitespace-nowrap">{formatKickoff(fixture.kickoff_at)}</td>
                        <td className="py-2 pr-4">{fixture.opponent}</td>
                        <td className="py-2 pr-4 capitalize">{fixture.venue}</td>
                        <td colSpan={4} className="py-2">
                          <form className="flex flex-wrap items-center gap-2">
                            <input type="hidden" name="id" value={fixture.id} />
                            <select name="status" defaultValue={fixture.status} className={inputClass}>
                              <option value="scheduled">Scheduled</option>
                              <option value="finished">Finished</option>
                              <option value="postponed">Postponed</option>
                            </select>
                            <input
                              name="ross_county_score"
                              type="number"
                              min={0}
                              defaultValue={fixture.ross_county_score ?? ""}
                              placeholder="RCFC"
                              className={`${inputClass} w-20`}
                            />
                            <input
                              name="opponent_score"
                              type="number"
                              min={0}
                              defaultValue={fixture.opponent_score ?? ""}
                              placeholder="Opp."
                              className={`${inputClass} w-20`}
                            />
                            <button formAction={updateFixtureResult} className={buttonClass}>
                              Save
                            </button>
                            <button formAction={deleteFixture} className={dangerButtonClass}>
                              Delete
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-club-navy/10 bg-white p-6">
            <h2 className="text-lg font-semibold text-club-navy">League table</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Entered manually — every team in {currentCompetition.name}, not just Ross County.
            </p>

            <form action={addTableRow} className="mt-4 flex flex-wrap items-end gap-3">
              <input type="hidden" name="competition_id" value={currentCompetition.id} />
              <div>
                <label className={labelClass} htmlFor="position">Pos</label>
                <input id="position" name="position" type="number" min={1} required className={`${inputClass} w-16`} />
              </div>
              <div>
                <label className={labelClass} htmlFor="team_name">Team</label>
                <input id="team_name" name="team_name" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass} htmlFor="played">P</label>
                <input id="played" name="played" type="number" min={0} defaultValue={0} className={`${inputClass} w-14`} />
              </div>
              <div>
                <label className={labelClass} htmlFor="won">W</label>
                <input id="won" name="won" type="number" min={0} defaultValue={0} className={`${inputClass} w-14`} />
              </div>
              <div>
                <label className={labelClass} htmlFor="drawn">D</label>
                <input id="drawn" name="drawn" type="number" min={0} defaultValue={0} className={`${inputClass} w-14`} />
              </div>
              <div>
                <label className={labelClass} htmlFor="lost">L</label>
                <input id="lost" name="lost" type="number" min={0} defaultValue={0} className={`${inputClass} w-14`} />
              </div>
              <div>
                <label className={labelClass} htmlFor="goals_for">GF</label>
                <input id="goals_for" name="goals_for" type="number" min={0} defaultValue={0} className={`${inputClass} w-14`} />
              </div>
              <div>
                <label className={labelClass} htmlFor="goals_against">GA</label>
                <input id="goals_against" name="goals_against" type="number" min={0} defaultValue={0} className={`${inputClass} w-14`} />
              </div>
              <div>
                <label className={labelClass} htmlFor="points">Pts</label>
                <input id="points" name="points" type="number" min={0} defaultValue={0} className={`${inputClass} w-14`} />
              </div>
              <button type="submit" className={buttonClass}>Add row</button>
            </form>

            {table.length === 0 ? (
              <p className="mt-4 text-sm text-neutral-500">No table rows added yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
                      <th className="py-2 pr-2">Pos</th>
                      <th className="py-2 pr-2">Team</th>
                      <th className="py-2 pr-2">P</th>
                      <th className="py-2 pr-2">W</th>
                      <th className="py-2 pr-2">D</th>
                      <th className="py-2 pr-2">L</th>
                      <th className="py-2 pr-2">GF</th>
                      <th className="py-2 pr-2">GA</th>
                      <th className="py-2 pr-2">Pts</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.map((row) => (
                      <tr key={row.id} className="border-b border-neutral-100">
                        <td colSpan={10} className="py-2">
                          <form className="flex flex-wrap items-center gap-2">
                            <input type="hidden" name="id" value={row.id} />
                            <input name="position" type="number" min={1} defaultValue={row.position} className={`${inputClass} w-14`} />
                            <input name="team_name" defaultValue={row.team_name} className={`${inputClass} w-40`} />
                            <input name="played" type="number" min={0} defaultValue={row.played} className={`${inputClass} w-14`} />
                            <input name="won" type="number" min={0} defaultValue={row.won} className={`${inputClass} w-14`} />
                            <input name="drawn" type="number" min={0} defaultValue={row.drawn} className={`${inputClass} w-14`} />
                            <input name="lost" type="number" min={0} defaultValue={row.lost} className={`${inputClass} w-14`} />
                            <input name="goals_for" type="number" min={0} defaultValue={row.goals_for} className={`${inputClass} w-14`} />
                            <input name="goals_against" type="number" min={0} defaultValue={row.goals_against} className={`${inputClass} w-14`} />
                            <input name="points" type="number" min={0} defaultValue={row.points} className={`${inputClass} w-14`} />
                            <button formAction={updateTableRow} className={buttonClass}>Save</button>
                            <button formAction={deleteTableRow} className={dangerButtonClass}>Delete</button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
