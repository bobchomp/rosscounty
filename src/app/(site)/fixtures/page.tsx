import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCompetitions, getFixtures, getLeagueTable, getSiteSettings } from "@/lib/fixtures/queries";
import type { Fixture, LeagueTableRow } from "@/lib/fixtures/types";

export const metadata: Metadata = { title: "Fixtures & League Table" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ComingSoon({ heading, message }: { heading: string; message: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-club-gold-dark">
        Ross County FC
      </p>
      <h1 className="mt-2 text-3xl font-bold text-club-navy sm:text-4xl">{heading}</h1>
      <p className="mt-4 max-w-2xl text-base text-neutral-600">{message}</p>
    </div>
  );
}

function FixtureRow({ fixture }: { fixture: Fixture }) {
  const played = fixture.status === "finished";
  const score =
    played && fixture.ross_county_score !== null && fixture.opponent_score !== null
      ? `${fixture.ross_county_score} - ${fixture.opponent_score}`
      : null;

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 border-b border-club-navy/10 py-4 last:border-none">
      <div>
        <p className="font-medium text-club-navy">
          {fixture.venue === "home" ? "Ross County v " : ""}
          {fixture.opponent}
          {fixture.venue === "away" ? " v Ross County" : ""}
        </p>
        <p className="text-sm text-neutral-500">
          {formatDate(fixture.kickoff_at)}
          {fixture.ground ? ` — ${fixture.ground}` : ""}
          {fixture.status === "postponed" ? " — Postponed" : ""}
        </p>
      </div>
      {score && <p className="text-lg font-semibold text-club-navy">{score}</p>}
    </li>
  );
}

function LeagueTable({ rows }: { rows: LeagueTableRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-club-navy/20 text-xs uppercase text-neutral-500">
            <th className="py-2 pr-2">#</th>
            <th className="py-2 pr-2">Team</th>
            <th className="py-2 pr-2 text-center">P</th>
            <th className="py-2 pr-2 text-center">W</th>
            <th className="py-2 pr-2 text-center">D</th>
            <th className="py-2 pr-2 text-center">L</th>
            <th className="py-2 pr-2 text-center">GF</th>
            <th className="py-2 pr-2 text-center">GA</th>
            <th className="py-2 text-center">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={`border-b border-club-navy/5 ${
                row.team_name.toLowerCase().includes("ross county") ? "bg-club-gold/10 font-semibold" : ""
              }`}
            >
              <td className="py-2 pr-2">{row.position}</td>
              <td className="py-2 pr-2">{row.team_name}</td>
              <td className="py-2 pr-2 text-center">{row.played}</td>
              <td className="py-2 pr-2 text-center">{row.won}</td>
              <td className="py-2 pr-2 text-center">{row.drawn}</td>
              <td className="py-2 pr-2 text-center">{row.lost}</td>
              <td className="py-2 pr-2 text-center">{row.goals_for}</td>
              <td className="py-2 pr-2 text-center">{row.goals_against}</td>
              <td className="py-2 text-center">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function FixturesPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <ComingSoon
        heading="Fixtures & League Table"
        message="This page is being connected to live data. Check back soon."
      />
    );
  }

  const [competitions, settings] = await Promise.all([
    getCompetitions(supabase),
    getSiteSettings(supabase),
  ]);
  const currentCompetition =
    competitions.find((c) => c.id === settings?.current_competition_id) ?? null;

  if (!currentCompetition) {
    return (
      <ComingSoon
        heading="Fixtures & League Table"
        message="Fixtures and the league table haven't been added yet — check back soon."
      />
    );
  }

  const [fixtures, table] = await Promise.all([
    getFixtures(supabase, currentCompetition.id),
    getLeagueTable(supabase, currentCompetition.id),
  ]);

  const upcoming = fixtures.filter((f) => f.status !== "finished");
  const results = fixtures
    .filter((f) => f.status === "finished")
    .slice()
    .reverse();
  const nextMatch = upcoming[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-club-gold-dark">
        {currentCompetition.name}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-club-navy sm:text-4xl">
        Fixtures &amp; League Table
      </h1>

      {nextMatch && (
        <div className="mt-8 rounded-xl bg-club-navy p-6 text-white sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-club-gold">
            Next match
          </p>
          <p className="mt-2 text-2xl font-bold">
            {nextMatch.venue === "home" ? "Ross County v " : ""}
            {nextMatch.opponent}
            {nextMatch.venue === "away" ? " v Ross County" : ""}
          </p>
          <p className="mt-1 text-white/75">
            {formatDate(nextMatch.kickoff_at)}
            {nextMatch.ground ? ` — ${nextMatch.ground}` : ""}
          </p>
        </div>
      )}

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-xl font-semibold text-club-navy">Upcoming fixtures</h2>
          {upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-500">No upcoming fixtures scheduled yet.</p>
          ) : (
            <ul className="mt-3">
              {upcoming.map((fixture) => (
                <FixtureRow key={fixture.id} fixture={fixture} />
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-club-navy">Recent results</h2>
          {results.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-500">No results yet.</p>
          ) : (
            <ul className="mt-3">
              {results.map((fixture) => (
                <FixtureRow key={fixture.id} fixture={fixture} />
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-14">
        <h2 className="text-xl font-semibold text-club-navy">League table</h2>
        <div className="mt-4">
          {table.length === 0 ? (
            <p className="text-sm text-neutral-500">League table not added yet.</p>
          ) : (
            <LeagueTable rows={table} />
          )}
        </div>
      </section>
    </div>
  );
}
