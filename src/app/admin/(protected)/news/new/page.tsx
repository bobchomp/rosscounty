import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/news/queries";
import { SupabaseNotConfigured } from "@/components/admin/supabase-not-configured";
import { NewsArticleForm } from "@/components/admin/news-article-form";
import { createArticle } from "../actions";

export default async function NewArticlePage() {
  const supabase = await createClient();
  if (!supabase) return <SupabaseNotConfigured />;

  const categories = await getCategories(supabase);

  return (
    <div>
      <h1 className="text-2xl font-bold text-club-navy">New article</h1>
      <div className="mt-6 rounded-xl border border-club-navy/10 bg-white p-6">
        <NewsArticleForm categories={categories} action={createArticle} />
      </div>
    </div>
  );
}
