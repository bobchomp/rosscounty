"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/news/slug";
import { sanitizeArticleHtml } from "@/lib/news/sanitize";
import { extractExcerpt } from "@/lib/news/excerpt";

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

type DisplayStatus = "draft" | "published" | "scheduled";

function readDisplayStatus(formData: FormData): DisplayStatus {
  const raw = String(formData.get("display_status") || "draft");
  return raw === "published" || raw === "scheduled" ? raw : "draft";
}

function readCommonFields(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const rawSlug = String(formData.get("slug") || "").trim();
  const body_html = sanitizeArticleHtml(String(formData.get("body_html") || ""));

  return {
    title,
    slug: slugify(rawSlug || title),
    category_id: String(formData.get("category_id") || "") || null,
    body_html,
    excerpt: extractExcerpt(body_html) || null,
  };
}

function readScheduledPublishAt(formData: FormData) {
  const raw = String(formData.get("publish_at") || "");
  return raw ? new Date(raw).toISOString() : new Date().toISOString();
}

export async function createArticle(formData: FormData) {
  const supabase = await requireClient();
  const fields = readCommonFields(formData);
  const displayStatus = readDisplayStatus(formData);

  // A brand-new article has no "already live" date to preserve, so
  // draft/published both just use "now" — only "scheduled" needs the
  // admin-chosen future date.
  const status = displayStatus === "draft" ? "draft" : "published";
  const publish_at =
    displayStatus === "scheduled" ? readScheduledPublishAt(formData) : new Date().toISOString();

  const file = formData.get("featured_image");
  const featured_image_path =
    file instanceof File && file.size > 0 ? await uploadFeaturedImage(supabase, file) : null;

  const { data, error } = await supabase
    .from("news_articles")
    .insert({ ...fields, status, publish_at, featured_image_path })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  refresh();
  redirect(`/admin/news/${data.id}/edit`);
}

export async function updateArticle(formData: FormData) {
  const supabase = await requireClient();
  const id = String(formData.get("id"));
  const fields = readCommonFields(formData);
  const displayStatus = readDisplayStatus(formData);

  const status = displayStatus === "draft" ? "draft" : "published";

  let publish_at: string;
  if (displayStatus === "scheduled") {
    publish_at = readScheduledPublishAt(formData);
  } else {
    // Editing a draft/typo-fix shouldn't silently change when an already-live
    // article "was published" — only set publish_at to "now" the moment it
    // actually goes live for the first time; otherwise keep its existing date.
    const { data: existing } = await supabase
      .from("news_articles")
      .select("status, publish_at")
      .eq("id", id)
      .maybeSingle();

    const wasAlreadyLive =
      existing?.status === "published" &&
      Boolean(existing.publish_at) &&
      new Date(existing.publish_at).getTime() <= Date.now();

    publish_at =
      displayStatus === "published" && !wasAlreadyLive
        ? new Date().toISOString()
        : (existing?.publish_at ?? new Date().toISOString());
  }

  const update: Record<string, unknown> = {
    ...fields,
    status,
    publish_at,
    updated_at: new Date().toISOString(),
  };

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
