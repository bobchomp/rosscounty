"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireClient } from "@/lib/supabase/server";

function refresh() {
  revalidatePath("/admin/news/categories");
  revalidatePath("/admin/news");
  revalidatePath("/news");
}

export async function createCategory(formData: FormData) {
  const supabase = await requireClient();
  const name = String(formData.get("name") || "").trim();
  const sortOrder = Number(formData.get("sort_order") || 0);

  if (!name) throw new Error("Category name is required.");

  const { error } = await supabase.from("news_categories").insert({ name, sort_order: sortOrder });
  if (error) throw new Error(error.message);

  refresh();
}

export async function updateCategory(formData: FormData) {
  const supabase = await requireClient();
  const id = String(formData.get("id"));
  const name = String(formData.get("name") || "").trim();
  const sortOrder = Number(formData.get("sort_order") || 0);

  if (!name) throw new Error("Category name is required.");

  const { error } = await supabase
    .from("news_categories")
    .update({ name, sort_order: sortOrder })
    .eq("id", id);
  if (error) throw new Error(error.message);

  refresh();
}

export async function deleteCategory(formData: FormData) {
  const supabase = await requireClient();
  const id = String(formData.get("id"));

  const { count, error: countError } = await supabase
    .from("news_articles")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);
  if (countError) throw new Error(countError.message);

  if (count && count > 0) {
    const message = `Can't delete this category — ${count} article${
      count === 1 ? "" : "s"
    } still use it. Reassign or delete ${count === 1 ? "it" : "them"} first.`;
    redirect(`/admin/news/categories?error=${encodeURIComponent(message)}`);
  }

  const { error } = await supabase.from("news_categories").delete().eq("id", id);
  if (error) throw new Error(error.message);

  refresh();
}
