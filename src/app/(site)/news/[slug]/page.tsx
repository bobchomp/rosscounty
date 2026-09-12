import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getPublicImageUrl, getPublishedArticleBySlug } from "@/lib/news/queries";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata(
  props: PageProps<"/news/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const supabase = await createClient();
  const article = supabase ? await getPublishedArticleBySlug(supabase, slug) : null;

  if (!article) return { title: "News" };

  return {
    title: article.title,
    description: article.excerpt ?? undefined,
  };
}

export default async function NewsArticlePage(props: PageProps<"/news/[slug]">) {
  const { slug } = await props.params;

  const supabase = await createClient();
  if (!supabase) notFound();

  const article = await getPublishedArticleBySlug(supabase, slug);
  if (!article) notFound();

  const imageUrl = article.featured_image_path
    ? getPublicImageUrl(supabase, article.featured_image_path)
    : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/news" className="text-sm font-medium text-club-navy hover:underline">
        ← Back to News
      </Link>

      {article.category && (
        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-club-gold-dark">
          {article.category.name}
        </p>
      )}
      <h1 className="mt-2 text-3xl font-bold text-club-navy sm:text-4xl">{article.title}</h1>
      <p className="mt-3 text-sm text-neutral-500">{formatDate(article.publish_at)}</p>

      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="mt-8 aspect-[16/9] w-full rounded-xl object-cover"
        />
      )}

      {/* body_html is sanitised with DOMPurify at save time in the admin
          panel, so it's safe to render directly here. */}
      <div
        className="prose prose-neutral mt-8 max-w-none prose-headings:text-club-navy prose-a:text-club-navy"
        dangerouslySetInnerHTML={{ __html: article.body_html }}
      />
    </article>
  );
}
