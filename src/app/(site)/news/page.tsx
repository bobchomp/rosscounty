import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCategories, getPublicImageUrl, getPublishedArticles } from "@/lib/news/queries";
import type { NewsArticleWithCategory } from "@/lib/news/types";

export const metadata: Metadata = { title: "News" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ArticleCard({
  article,
  imageUrl,
}: {
  article: NewsArticleWithCategory;
  imageUrl: string | null;
}) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group overflow-hidden rounded-xl border border-club-navy/10 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="aspect-[16/9] bg-club-navy/5">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="p-5">
        {article.category && (
          <p className="text-xs font-semibold uppercase tracking-wide text-club-gold-dark">
            {article.category.name}
          </p>
        )}
        <p className="mt-1 text-lg font-semibold text-club-navy group-hover:text-club-navy-light">
          {article.title}
        </p>
        {article.excerpt && (
          <p className="mt-2 text-sm text-neutral-600 line-clamp-2">{article.excerpt}</p>
        )}
        <p className="mt-3 text-xs text-neutral-500">{formatDate(article.publish_at)}</p>
      </div>
    </Link>
  );
}

export default async function NewsPage(props: PageProps<"/news">) {
  const searchParams = await props.searchParams;
  const categoryId = typeof searchParams.category === "string" ? searchParams.category : undefined;

  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-club-gold-dark">
          Ross County FC
        </p>
        <h1 className="mt-2 text-3xl font-bold text-club-navy sm:text-4xl">News</h1>
        <p className="mt-4 max-w-2xl text-base text-neutral-600">
          This page is being connected to live data. Check back soon.
        </p>
      </div>
    );
  }

  const [categories, articles] = await Promise.all([
    getCategories(supabase),
    getPublishedArticles(supabase, { categoryId, limit: 30 }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-club-gold-dark">
        Ross County FC
      </p>
      <h1 className="mt-2 text-3xl font-bold text-club-navy sm:text-4xl">News</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/news"
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            !categoryId ? "bg-club-navy text-white" : "bg-club-navy/5 text-club-navy hover:bg-club-navy/10"
          }`}
        >
          All
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/news?category=${category.id}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              categoryId === category.id
                ? "bg-club-navy text-white"
                : "bg-club-navy/5 text-club-navy hover:bg-club-navy/10"
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>

      {articles.length === 0 ? (
        <p className="mt-10 text-sm text-neutral-500">No articles here yet — check back soon.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              imageUrl={
                article.featured_image_path
                  ? getPublicImageUrl(supabase, article.featured_image_path)
                  : null
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
