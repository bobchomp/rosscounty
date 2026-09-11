import type { FixtureStatus } from "@/lib/fixtures/types";

const API_FOOTBALL_BASE = "https://v3.football.api-sports.io";

type ApiFootballEnvelope<T> = { response: T; errors: unknown };

async function apiFootballGet<T>(
  path: string,
  params: Record<string, string | number>
): Promise<T> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    throw new Error(
      "API_FOOTBALL_KEY is not set — add it to your environment first."
    );
  }

  const url = new URL(`${API_FOOTBALL_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, {
    headers: { "x-apisports-key": apiKey },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API-Football request to ${path} failed (${res.status})`);
  }

  const json = (await res.json()) as ApiFootballEnvelope<T>;

  if (json.errors && Object.keys(json.errors as object).length > 0) {
    throw new Error(`API-Football error: ${JSON.stringify(json.errors)}`);
  }

  return json.response;
}

// See https://www.api-football.com/documentation-v3 for the full fixture
// status list — everything not finished/postponed is treated as scheduled.
const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);
const POSTPONED_STATUSES = new Set(["PST", "CANC", "ABD"]);

export function mapFixtureStatus(shortStatus: string): FixtureStatus {
  if (FINISHED_STATUSES.has(shortStatus)) return "finished";
  if (POSTPONED_STATUSES.has(shortStatus)) return "postponed";
  return "scheduled";
}

export type ApiFootballFixture = {
  fixture: {
    id: number;
    date: string;
    status: { short: string };
    venue: { name: string | null };
  };
  teams: {
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  goals: { home: number | null; away: number | null };
};

export function getTeamFixtures(leagueId: number, season: number, teamId: number) {
  return apiFootballGet<ApiFootballFixture[]>("/fixtures", {
    league: leagueId,
    season,
    team: teamId,
  });
}

export type ApiFootballStanding = {
  rank: number;
  team: { name: string };
  points: number;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
};

export async function getStandings(leagueId: number, season: number) {
  const response = await apiFootballGet<
    Array<{ league: { standings: ApiFootballStanding[][] } }>
  >("/standings", { league: leagueId, season });

  return response[0]?.league.standings[0] ?? [];
}
