import type { NewsArticleWithCategory } from "./types";

export type ArticleStatusLabel = { text: string; className: string };

export function getArticleStatusLabel(article: NewsArticleWithCategory): ArticleStatusLabel {
  if (article.status === "draft") {
    return { text: "Draft", className: "bg-neutral-200 text-neutral-700" };
  }

  const isFuture = new Date(article.publish_at).getTime() > Date.now();
  if (isFuture) {
    return { text: "Scheduled", className: "bg-amber-100 text-amber-800" };
  }

  return { text: "Published", className: "bg-green-100 text-green-800" };
}
