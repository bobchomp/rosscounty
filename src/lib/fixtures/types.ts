export type Competition = {
  id: string;
  name: string;
  sort_order: number;
  api_football_id: number | null;
};

export type SiteSettings = {
  id: string;
  current_competition_id: string | null;
  api_football_season: number | null;
  api_football_team_id: number | null;
  fixtures_last_synced_at: string | null;
  table_last_synced_at: string | null;
};

export type FixtureStatus = "scheduled" | "finished" | "postponed";

export type Fixture = {
  id: string;
  competition_id: string;
  kickoff_at: string;
  opponent: string;
  venue: "home" | "away";
  ground: string | null;
  status: FixtureStatus;
  ross_county_score: number | null;
  opponent_score: number | null;
  notes: string | null;
  api_football_fixture_id: number | null;
};

export type LeagueTableRow = {
  id: string;
  competition_id: string;
  position: number;
  team_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  points: number;
};
