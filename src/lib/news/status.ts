import type { NewsArticleWithCategory, NewsStatus } from "./types";

export type DisplayStatus = "draft" | "published" | "scheduled";

// The database only ever stores draft/published — "scheduled" is derived
// (published with a publish_at still in the future), not a stored value.
// This keeps the "no background job" scheduling design: a scheduled
// article just starts matching the public query once its time passes.
export function getDisplayStatus(status: NewsStatus, publishAt: string): DisplayStatus {
  if (status === "draft") return "draft";
  return new Date(publishAt).getTime() > Date.now() ? "scheduled" : "published";
}

export type ArticleStatusLabel = { text: string; className: string };

const LABELS: Record<DisplayStatus, ArticleStatusLabel> = {
  draft: { text: "Draft", className: "bg-neutral-200 text-neutral-700" },
  scheduled: { text: "Scheduled", className: "bg-amber-100 text-amber-800" },
  published: { text: "Published", className: "bg-green-100 text-green-800" },
};

export function getArticleStatusLabel(article: NewsArticleWithCategory): ArticleStatusLabel {
  return LABELS[getDisplayStatus(article.status, article.publish_at)];
}
