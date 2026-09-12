import { RichTextEditor } from "./rich-text-editor";
import { ArticleStatusFields } from "./article-status-fields";
import { getDisplayStatus } from "@/lib/news/status";
import type { NewsArticleWithCategory, NewsCategory } from "@/lib/news/types";

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-club-navy focus:outline-none";
const labelClass = "block text-sm font-medium text-neutral-700";
const buttonClass =
  "rounded-md bg-club-navy px-4 py-2 text-sm font-semibold text-white hover:bg-club-navy-light";

export function NewsArticleForm({
  categories,
  article,
  featuredImageUrl,
  action,
}: {
  categories: NewsCategory[];
  article?: NewsArticleWithCategory;
  featuredImageUrl?: string | null;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action} className="space-y-6">
      {article && <input type="hidden" name="id" value={article.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            required
            defaultValue={article?.title}
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="slug">
            Slug (optional — auto-generated from title)
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={article?.slug}
            placeholder="e.g. match-report-vs-livingston"
            className={`mt-1 ${inputClass}`}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="category_id">Category</label>
          <select
            id="category_id"
            name="category_id"
            defaultValue={article?.category_id ?? ""}
            className={`mt-1 ${inputClass}`}
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <ArticleStatusFields
          initialStatus={article ? getDisplayStatus(article.status, article.publish_at) : "draft"}
          initialPublishAt={article?.publish_at}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="featured_image">
          Featured image {featuredImageUrl ? "(choose a file to replace it)" : ""}
        </label>
        {featuredImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={featuredImageUrl}
            alt=""
            className="mt-2 h-32 w-auto rounded-md border border-neutral-200 object-cover"
          />
        )}
        <input
          id="featured_image"
          name="featured_image"
          type="file"
          accept="image/*"
          className="mt-2 block text-sm"
        />
      </div>

      <div>
        <label className={labelClass}>Body</label>
        <div className="mt-1">
          <RichTextEditor name="body_html" initialContent={article?.body_html ?? ""} />
        </div>
      </div>

      <button type="submit" className={buttonClass}>
        {article ? "Save changes" : "Create article"}
      </button>
    </form>
  );
}
