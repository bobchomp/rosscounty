import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllArticlesForAdmin, getPublicImageUrl } from "@/lib/news/queries";
import { getArticleStatusLabel } from "@/lib/news/status";
import { SupabaseNotConfigured } from "@/components/admin/supabase-not-configured";
import { deleteArticle } from "./actions";

const buttonClass =
  "rounded-md bg-club-navy px-4 py-2 text-sm font-semibold text-white hover:bg-club-navy-light";
const dangerButtonClass =
  "rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminNewsPage() {
  const supabase = await createClient();
  if (!supabase) return <SupabaseNotConfigured />;

  const articles = await getAllArticlesForAdmin(supabase);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-club-navy">News</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Articles shown on the public News page, newest edited first.
          </p>
        </div>
        <Link href="/admin/news/new" className={buttonClass}>
          New article
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-club-navy/20 bg-white p-10 text-center">
          <p className="text-sm font-medium text-neutral-500">No articles yet.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {articles.map((article) => {
            const status = getArticleStatusLabel(article);
            const imageUrl = article.featured_image_path
              ? getPublicImageUrl(supabase, article.featured_image_path)
              : null;

            return (
              <div
                key={article.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-club-navy/10 bg-white p-4"
              >
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                  {imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-club-navy">{article.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                      {status.text}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    {article.category?.name ?? "No category"} · {formatDate(article.publish_at)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/admin/news/${article.id}/edit`}
                    className="rounded-md border border-club-navy/20 px-3 py-1.5 text-xs font-semibold text-club-navy hover:bg-club-navy/5"
                  >
                    Edit
                  </Link>
                  <form action={deleteArticle}>
                    <input type="hidden" name="id" value={article.id} />
                    <button type="submit" className={dangerButtonClass}>
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
