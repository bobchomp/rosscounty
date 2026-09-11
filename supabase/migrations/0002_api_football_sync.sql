-- Support for manually-triggered syncing from API-Football.
--
-- Config (league IDs, season, Ross County's team ID) is entered by the
-- admin in Settings, looked up from API-Football's own /leagues and
-- /teams endpoints rather than hardcoded here — those IDs aren't
-- something to guess at.

alter table competitions add column if not exists api_football_id int;

alter table site_settings
  add column if not exists api_football_season int,
  add column if not exists api_football_team_id int,
  add column if not exists fixtures_last_synced_at timestamptz,
  add column if not exists table_last_synced_at timestamptz;

-- Lets fixture syncs upsert by the API's own fixture id instead of
-- creating duplicates on every re-sync. Plain UNIQUE allows multiple
-- NULLs, so manually-added fixtures (no API id) are unaffected.
alter table fixtures add column if not exists api_football_fixture_id bigint unique;

create policy "admins write competitions" on competitions for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
