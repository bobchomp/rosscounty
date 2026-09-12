export type NewsCategory = {
  id: string;
  name: string;
  sort_order: number;
};

export type NewsStatus = "draft" | "published";

export type NewsArticle = {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  body_html: string;
  featured_image_path: string | null;
  author_name: string;
  status: NewsStatus;
  publish_at: string;
  created_at: string;
  updated_at: string;
};

export type NewsArticleWithCategory = NewsArticle & {
  category: NewsCategory | null;
};
