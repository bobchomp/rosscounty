import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getArticleById, getCategories, getPublicImageUrl } from "@/lib/news/queries";
import { SupabaseNotConfigured } from "@/components/admin/supabase-not-configured";
import { NewsArticleForm } from "@/components/admin/news-article-form";
import { updateArticle } from "../../actions";

export default async function EditArticlePage(props: PageProps<"/admin/news/[id]/edit">) {
  const { id } = await props.params;

  const supabase = await createClient();
  if (!supabase) return <SupabaseNotConfigured />;

  const [article, categories] = await Promise.all([
    getArticleById(supabase, id),
    getCategories(supabase),
  ]);

  if (!article) notFound();

  const featuredImageUrl = article.featured_image_path
    ? getPublicImageUrl(supabase, article.featured_image_path)
    : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-club-navy">Edit article</h1>
      <div className="mt-6 rounded-xl border border-club-navy/10 bg-white p-6">
        <NewsArticleForm
          categories={categories}
          article={article}
          featuredImageUrl={featuredImageUrl}
          action={updateArticle}
        />
      </div>
    </div>
  );
}
