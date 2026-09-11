"use server";

import { revalidatePath } from "next/cache";
import { requireClient } from "@/lib/supabase/server";
import { getStandings, getTeamFixtures, mapFixtureStatus } from "@/lib/api-football/client";

function refresh() {
  revalidatePath("/admin/fixtures");
  revalidatePath("/fixtures");
}

export async function addFixture(formData: FormData) {
  const supabase = await requireClient();

  const { error } = await supabase.from("fixtures").insert({
    competition_id: String(formData.get("competition_id")),
    opponent: String(formData.get("opponent")),
    venue: String(formData.get("venue")),
    kickoff_at: new Date(String(formData.get("kickoff_at"))).toISOString(),
    ground: String(formData.get("ground") || "") || null,
  });

  if (error) throw new Error(error.message);
  refresh();
}

export async function updateFixtureResult(formData: FormData) {
  const supabase = await requireClient();

  const rawHome = formData.get("ross_county_score");
  const rawAway = formData.get("opponent_score");

  const { error } = await supabase
    .from("fixtures")
    .update({
      status: String(formData.get("status")),
      ross_county_score: rawHome === "" ? null : Number(rawHome),
      opponent_score: rawAway === "" ? null : Number(rawAway),
    })
    .eq("id", String(formData.get("id")));

  if (error) throw new Error(error.message);
  refresh();
}

export async function deleteFixture(formData: FormData) {
  const supabase = await requireClient();

  const { error } = await supabase
    .from("fixtures")
    .delete()
    .eq("id", String(formData.get("id")));

  if (error) throw new Error(error.message);
  refresh();
}

export async function addTableRow(formData: FormData) {
  const supabase = await requireClient();

  const { error } = await supabase.from("league_table_rows").insert({
    competition_id: String(formData.get("competition_id")),
    position: Number(formData.get("position")),
    team_name: String(formData.get("team_name")),
    played: Number(formData.get("played") || 0),
    won: Number(formData.get("won") || 0),
    drawn: Number(formData.get("drawn") || 0),
    lost: Number(formData.get("lost") || 0),
    goals_for: Number(formData.get("goals_for") || 0),
    goals_against: Number(formData.get("goals_against") || 0),
    points: Number(formData.get("points") || 0),
  });

  if (error) throw new Error(error.message);
  refresh();
}

export async function updateTableRow(formData: FormData) {
  const supabase = await requireClient();

  const { error } = await supabase
    .from("league_table_rows")
    .update({
      position: Number(formData.get("position")),
      team_name: String(formData.get("team_name")),
      played: Number(formData.get("played") || 0),
      won: Number(formData.get("won") || 0),
      drawn: Number(formData.get("drawn") || 0),
      lost: Number(formData.get("lost") || 0),
      goals_for: Number(formData.get("goals_for") || 0),
      goals_against: Number(formData.get("goals_against") || 0),
      points: Number(formData.get("points") || 0),
    })
    .eq("id", String(formData.get("id")));

  if (error) throw new Error(error.message);
  refresh();
}

export async function deleteTableRow(formData: FormData) {
  const supabase = await requireClient();

  const { error } = await supabase
    .from("league_table_rows")
    .delete()
    .eq("id", String(formData.get("id")));

  if (error) throw new Error(error.message);
  refresh();
}

export async function syncFixturesFromApiFootball(formData: FormData) {
  const supabase = await requireClient();

  const competitionId = String(formData.get("competition_id"));
  const leagueId = Number(formData.get("league_id"));
  const season = Number(formData.get("season"));
  const teamId = Number(formData.get("team_id"));

  const apiFixtures = await getTeamFixtures(leagueId, season, teamId);

  const rows = apiFixtures.map((f) => {
    const isHome = f.teams.home.id === teamId;
    return {
      competition_id: competitionId,
      api_football_fixture_id: f.fixture.id,
      opponent: isHome ? f.teams.away.name : f.teams.home.name,
      venue: isHome ? "home" : "away",
      ground: f.fixture.venue.name,
      kickoff_at: f.fixture.date,
      status: mapFixtureStatus(f.fixture.status.short),
      ross_county_score: isHome ? f.goals.home : f.goals.away,
      opponent_score: isHome ? f.goals.away : f.goals.home,
    };
  });

  if (rows.length > 0) {
    const { error } = await supabase
      .from("fixtures")
      .upsert(rows, { onConflict: "api_football_fixture_id" });
    if (error) throw new Error(error.message);
  }

  const { error: settingsError } = await supabase
    .from("site_settings")
    .update({ fixtures_last_synced_at: new Date().toISOString() })
    .eq("id", "default");
  if (settingsError) throw new Error(settingsError.message);

  refresh();
}

export async function syncLeagueTableFromApiFootball(formData: FormData) {
  const supabase = await requireClient();

  const competitionId = String(formData.get("competition_id"));
  const leagueId = Number(formData.get("league_id"));
  const season = Number(formData.get("season"));

  const standings = await getStandings(leagueId, season);

  const { error: deleteError } = await supabase
    .from("league_table_rows")
    .delete()
    .eq("competition_id", competitionId);
  if (deleteError) throw new Error(deleteError.message);

  if (standings.length > 0) {
    const rows = standings.map((s) => ({
      competition_id: competitionId,
      position: s.rank,
      team_name: s.team.name,
      played: s.all.played,
      won: s.all.win,
      drawn: s.all.draw,
      lost: s.all.lose,
      goals_for: s.all.goals.for,
      goals_against: s.all.goals.against,
      points: s.points,
    }));

    const { error: insertError } = await supabase.from("league_table_rows").insert(rows);
    if (insertError) throw new Error(insertError.message);
  }

  const { error: settingsError } = await supabase
    .from("site_settings")
    .update({ table_last_synced_at: new Date().toISOString() })
    .eq("id", "default");
  if (settingsError) throw new Error(settingsError.message);

  refresh();
}
