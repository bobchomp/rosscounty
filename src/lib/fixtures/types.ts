export type Competition = {
  id: string;
  name: string;
  sort_order: number;
};

export type SiteSettings = {
  id: string;
  current_competition_id: string | null;
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
