-- News articles.
--
-- `status` only ever has two values — scheduling is "published" with a
-- future `publish_at`, checked at read time (public visibility requires
-- status = 'published' AND publish_at <= now()). No background job needed
-- to "activate" a scheduled article.

create table if not exists news_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0
);

insert into news_categories (name, sort_order) values
  ('Club News', 1),
  ('Match Report', 2),
  ('Press Release', 3),
  ('Interview', 4)
on conflict (name) do nothing;

create table if not exists news_articles (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references news_categories (id),
  title text not null,
  slug text not null unique,
  excerpt text,
  body_html text not null default '',
  featured_image_path text,
  author_name text not null default 'Ross County FC',
  status text not null default 'draft' check (status in ('draft', 'published')),
  publish_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_articles_publish_at_idx on news_articles (publish_at desc);
create index if not exists news_articles_status_idx on news_articles (status);
create index if not exists news_articles_category_id_idx on news_articles (category_id);

alter table news_categories enable row level security;
alter table news_articles enable row level security;

create policy "public read news_categories" on news_categories for select using (true);
create policy "admins write news_categories" on news_categories for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Public (anon) can only ever see live articles. Admins (authenticated)
-- get a second, broader policy so they can see drafts and future-dated
-- ones too — Postgres ORs multiple permissive policies together.
create policy "public read published news_articles" on news_articles for select
  using (status = 'published' and publish_at <= now());
create policy "admins write news_articles" on news_articles for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Storage bucket for featured + inline article images.
insert into storage.buckets (id, name, public)
values ('news-images', 'news-images', true)
on conflict (id) do nothing;

create policy "public read news-images" on storage.objects for select
  using (bucket_id = 'news-images');
create policy "admins upload news-images" on storage.objects for insert
  with check (bucket_id = 'news-images' and auth.role() = 'authenticated');
create policy "admins update news-images" on storage.objects for update
  using (bucket_id = 'news-images' and auth.role() = 'authenticated');
create policy "admins delete news-images" on storage.objects for delete
  using (bucket_id = 'news-images' and auth.role() = 'authenticated');
