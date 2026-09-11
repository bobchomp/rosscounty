"use server";

import { revalidatePath } from "next/cache";
import { requireClient } from "@/lib/supabase/server";

function refresh() {
  revalidatePath("/admin/settings");
  revalidatePath("/admin/fixtures");
  revalidatePath("/fixtures");
}

export async function setCurrentCompetition(formData: FormData) {
  const supabase = await requireClient();

  const { error } = await supabase
    .from("site_settings")
    .update({ current_competition_id: String(formData.get("competition_id")) })
    .eq("id", "default");

  if (error) throw new Error(error.message);
  refresh();
}

export async function setCompetitionApiFootballId(formData: FormData) {
  const supabase = await requireClient();

  const rawId = formData.get("api_football_id");

  const { error } = await supabase
    .from("competitions")
    .update({ api_football_id: rawId === "" ? null : Number(rawId) })
    .eq("id", String(formData.get("competition_id")));

  if (error) throw new Error(error.message);
  refresh();
}

export async function setApiFootballConfig(formData: FormData) {
  const supabase = await requireClient();

  const rawSeason = formData.get("api_football_season");
  const rawTeamId = formData.get("api_football_team_id");

  const { error } = await supabase
    .from("site_settings")
    .update({
      api_football_season: rawSeason === "" ? null : Number(rawSeason),
      api_football_team_id: rawTeamId === "" ? null : Number(rawTeamId),
    })
    .eq("id", "default");

  if (error) throw new Error(error.message);
  refresh();
}
