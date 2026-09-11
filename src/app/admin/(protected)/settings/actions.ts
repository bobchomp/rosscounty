"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setCurrentCompetition(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase
    .from("site_settings")
    .update({ current_competition_id: String(formData.get("competition_id")) })
    .eq("id", "default");

  if (error) throw new Error(error.message);

  revalidatePath("/admin/settings");
  revalidatePath("/admin/fixtures");
  revalidatePath("/fixtures");
}
