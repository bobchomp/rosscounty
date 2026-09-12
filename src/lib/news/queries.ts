import type { SupabaseClient } from "@supabase/supabase-js";
import type { NewsArticleWithCategory, NewsCategory } from "./types";

const ARTICLE_SELECT = "*, category:news_categories(*)";

export function getPublicImageUrl(supabase: SupabaseClient, path: string) {
  return supabase.storage.from("news-images").getPublicUrl(path).data.publicUrl;
}

export async function getCategories(supabase: SupabaseClient): Promise<NewsCategory[]> {
  const { data, error } = await supabase
    .from("news_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPublishedArticles(
  supabase: SupabaseClient,
  options: { categoryId?: string; limit?: number } = {}
): Promise<NewsArticleWithCategory[]> {
  let query = supabase
    .from("news_articles")
    .select(ARTICLE_SELECT)
    .eq("status", "published")
    .lte("publish_at", new Date().toISOString())
    .order("publish_at", { ascending: false });

  if (options.categoryId) {
    query = query.eq("category_id", options.categoryId);
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as unknown as NewsArticleWithCategory[]) ?? [];
}

export async function getPublishedArticleBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<NewsArticleWithCategory | null> {
  const { data, error } = await supabase
    .from("news_articles")
    .select(ARTICLE_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .lte("publish_at", new Date().toISOString())
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as NewsArticleWithCategory | null;
}

export async function getCategoryArticleCounts(
  supabase: SupabaseClient
): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("news_articles").select("category_id");
  if (error) throw new Error(error.message);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    if (row.category_id) counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
  }
  return counts;
}

export async function getAllArticlesForAdmin(
  supabase: SupabaseClient
): Promise<NewsArticleWithCategory[]> {
  const { data, error } = await supabase
    .from("news_articles")
    .select(ARTICLE_SELECT)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as unknown as NewsArticleWithCategory[]) ?? [];
}

export async function getArticleById(
  supabase: SupabaseClient,
  id: string
): Promise<NewsArticleWithCategory | null> {
  const { data, error } = await supabase
    .from("news_articles")
    .select(ARTICLE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as NewsArticleWithCategory | null;
}
