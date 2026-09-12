-- Author byline dropped from articles — wasn't adding anything for a
-- single-author club news feed, and the excerpt field is now
-- auto-derived from the article body instead of manually entered.
alter table news_articles drop column if exists author_name;
