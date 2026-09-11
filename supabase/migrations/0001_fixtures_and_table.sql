-- Fixtures & League Table
--
-- Single-club model: `fixtures` only ever stores Ross County's own matches
-- (an opponent + home/away), not every match in the division. The league
-- table is separate and lists every team, entered manually by an admin.
-- The current competition (Premiership / Championship / League One / Two)
-- is a site setting, since it changes with promotion/relegation.

create extension if not exists "pgcrypto";

create table if not exists competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0
);

insert into competitions (name, sort_order) values
  ('Scottish Premiership', 1),
  ('Scottish Championship', 2),
  ('Scottish League One', 3),
  ('Scottish League Two', 4)
on conflict (name) do nothing;

create table if not exists site_settings (
  id text primary key default 'default',
  current_competition_id uuid references competitions (id),
  constraint single_row check (id = 'default')
);

insert into site_settings (id) values ('default')
on conflict (id) do nothing;

create table if not exists fixtures (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions (id),
  kickoff_at timestamptz not null,
  opponent text not null,
  venue text not null check (venue in ('home', 'away')),
  ground text,
  status text not null default 'scheduled' check (status in ('scheduled', 'finished', 'postponed')),
  ross_county_score int,
  opponent_score int,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists fixtures_competition_id_idx on fixtures (competition_id);
create index if not exists fixtures_kickoff_at_idx on fixtures (kickoff_at);

create table if not exists league_table_rows (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions (id),
  position int not null,
  team_name text not null,
  played int not null default 0,
  won int not null default 0,
  drawn int not null default 0,
  lost int not null default 0,
  goals_for int not null default 0,
  goals_against int not null default 0,
  points int not null default 0
);

create index if not exists league_table_rows_competition_id_idx on league_table_rows (competition_id);

alter table competitions enable row level security;
alter table site_settings enable row level security;
alter table fixtures enable row level security;
alter table league_table_rows enable row level security;

-- Public (anon) can read everything; only signed-in admins can write.
-- There's a single admin role for now (see README) — no separate
-- permissions table yet.
create policy "public read competitions" on competitions for select using (true);
create policy "public read site_settings" on site_settings for select using (true);
create policy "public read fixtures" on fixtures for select using (true);
create policy "public read league_table_rows" on league_table_rows for select using (true);

create policy "admins write site_settings" on site_settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admins write fixtures" on fixtures for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admins write league_table_rows" on league_table_rows for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
