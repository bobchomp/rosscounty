"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdminClient() {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  return supabase;
}

function refresh() {
  revalidatePath("/admin/fixtures");
  revalidatePath("/fixtures");
}

export async function addFixture(formData: FormData) {
  const supabase = await requireAdminClient();

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
  const supabase = await requireAdminClient();

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
  const supabase = await requireAdminClient();

  const { error } = await supabase
    .from("fixtures")
    .delete()
    .eq("id", String(formData.get("id")));

  if (error) throw new Error(error.message);
  refresh();
}

export async function addTableRow(formData: FormData) {
  const supabase = await requireAdminClient();

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
  const supabase = await requireAdminClient();

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
  const supabase = await requireAdminClient();

  const { error } = await supabase
    .from("league_table_rows")
    .delete()
    .eq("id", String(formData.get("id")));

  if (error) throw new Error(error.message);
  refresh();
}
