"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/news/slug";
import { sanitizeArticleHtml } from "@/lib/news/sanitize";

function refresh() {
  revalidatePath("/admin/news");
  revalidatePath("/news");
}

async function uploadFeaturedImage(
  supabase: Awaited<ReturnType<typeof requireClient>>,
  file: File
) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("news-images").upload(path, file);
  if (error) throw new Error(error.message);

  return path;
}

function readArticleFields(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const rawSlug = String(formData.get("slug") || "").trim();

  return {
    title,
    slug: slugify(rawSlug || title),
    category_id: String(formData.get("category_id") || "") || null,
    excerpt: String(formData.get("excerpt") || "").trim() || null,
    body_html: sanitizeArticleHtml(String(formData.get("body_html") || "")),
    author_name: String(formData.get("author_name") || "Ross County FC").trim() || "Ross County FC",
    status: String(formData.get("status") || "draft"),
    publish_at: (() => {
      const raw = String(formData.get("publish_at") || "");
      return raw ? new Date(raw).toISOString() : new Date().toISOString();
    })(),
  };
}

export async function createArticle(formData: FormData) {
  const supabase = await requireClient();
  const fields = readArticleFields(formData);

  const file = formData.get("featured_image");
  const featured_image_path =
    file instanceof File && file.size > 0 ? await uploadFeaturedImage(supabase, file) : null;

  const { data, error } = await supabase
    .from("news_articles")
    .insert({ ...fields, featured_image_path })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  refresh();
  redirect(`/admin/news/${data.id}/edit`);
}

export async function updateArticle(formData: FormData) {
  const supabase = await requireClient();
  const id = String(formData.get("id"));
  const fields = readArticleFields(formData);

  const update: Record<string, unknown> = { ...fields, updated_at: new Date().toISOString() };

  const file = formData.get("featured_image");
  if (file instanceof File && file.size > 0) {
    update.featured_image_path = await uploadFeaturedImage(supabase, file);
  }

  const { error } = await supabase.from("news_articles").update(update).eq("id", id);
  if (error) throw new Error(error.message);

  refresh();
  revalidatePath(`/admin/news/${id}/edit`);
}

export async function deleteArticle(formData: FormData) {
  const supabase = await requireClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("news_articles").delete().eq("id", id);
  if (error) throw new Error(error.message);

  refresh();
}
