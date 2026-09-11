import type { SupabaseClient } from "@supabase/supabase-js";
import type { Competition, Fixture, LeagueTableRow, SiteSettings } from "./types";

export async function getCompetitions(supabase: SupabaseClient): Promise<Competition[]> {
  const { data, error } = await supabase
    .from("competitions")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getSiteSettings(supabase: SupabaseClient): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getFixtures(
  supabase: SupabaseClient,
  competitionId: string
): Promise<Fixture[]> {
  const { data, error } = await supabase
    .from("fixtures")
    .select("*")
    .eq("competition_id", competitionId)
    .order("kickoff_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getLeagueTable(
  supabase: SupabaseClient,
  competitionId: string
): Promise<LeagueTableRow[]> {
  const { data, error } = await supabase
    .from("league_table_rows")
    .select("*")
    .eq("competition_id", competitionId)
    .order("position", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
