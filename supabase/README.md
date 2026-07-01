# Supabase setup — GALACTIC ZERO

This folder contains the database migration that hardens the game's Supabase
project:

- **`gz_append_move()` RPC** — atomic, row-locked move appends with an
  `expected_index` guard, replacing the lossy read-modify-write PATCH of the
  whole `moves` array. `multiplayer.js` prefers this RPC and only falls back
  to the legacy PATCH while the function doesn't exist yet (404), so the game
  keeps working before and after the migration is applied.
- **Row Level Security** on `gz_rooms`, `gz_leaderboard` and `gz_events` so
  the shipped anon key can no longer rewrite arbitrary rows:
  - `gz_rooms`: readable by room code; inserts must start as `waiting` with
    empty moves; client updates are limited (via column grants + policy) to
    the P2 join and status transitions; move writes only via the RPC.
  - `gz_leaderboard`: public read, insert-only with sanity checks
    (`delta` 1–100, arcade-style initials, known `mode`); no update/delete.
  - `gz_events`: insert-only analytics; clients cannot read them back.

## How to apply

1. Open the Supabase dashboard: <https://supabase.com/dashboard>
2. Select the project (`mstpkwxxhsspivtngfnm` — the URL used in
   `multiplayer.js` / `leaderboard.js`).
3. In the left sidebar choose **SQL Editor** → **New query**.
4. Paste the full contents of [`migration.sql`](./migration.sql).
5. Click **Run**.

The script is idempotent — running it again is safe (policies are dropped and
recreated, the function is `create or replace`).

## Verifying

- **RPC exists:** in SQL Editor run
  `select public.gz_append_move('NOSUCH', '{"player":"1","turn":0}'::jsonb, 0);`
  — it should fail with `room NOSUCH not found` (P0002), not
  "function does not exist".
- **RLS active:** in **Table Editor**, each of the three tables should show
  the "RLS enabled" badge, or run
  `select relname, relrowsecurity from pg_class where relname like 'gz_%';`
- **Client picks it up:** play a multiplayer move and check the browser
  console — there should be **no** `gz_append_move RPC not found` warning.
  If there is, PostgREST's schema cache may not have refreshed; re-run
  `notify pgrst, 'reload schema';` in the SQL editor.

## Rolling back

To temporarily restore the old world-writable behavior (not recommended):

```sql
alter table public.gz_rooms       disable row level security;
alter table public.gz_leaderboard disable row level security;
alter table public.gz_events      disable row level security;
grant update, delete on table public.gz_rooms       to anon;
grant update, delete on table public.gz_leaderboard to anon;
grant select, update, delete on table public.gz_events to anon;
```

The client works either way — the RPC path does not depend on RLS.

## Appended: `gz_players` hardening

The migration now also locks down **`gz_players`** (achievement/stat profiles
keyed by the secret `gz_player_token` from localStorage):

- **RLS enabled, no policies, all direct table privileges revoked** for
  `anon`/`authenticated` — the token column can no longer be enumerated with
  a plain `select`, so tokens stay secret.
- **`gz_get_player(p_token)`** — `SECURITY DEFINER` RPC returning only
  `achievements` and `stats` for the caller's own token (the token itself is
  never returned).
- **`gz_save_player(p_token, p_achievements, p_stats)`** — validated upsert:
  token length bounds, achievements must be an array of ≤200 short string
  ids, stats must be an object ≤16 KB.

`achievements.js` prefers these RPCs and falls back to the legacy direct
table access while they return 404 (i.e. before this migration is applied),
mirroring the `gz_append_move` rollout pattern.

### Verifying

- `select * from public.gz_get_player('not-a-real-token');` returns 0 rows
  (not an error).
- A direct `GET /rest/v1/gz_players?select=token` with the anon key should
  now return a `42501` permission error.
- The browser console should show no failed `rpc/gz_save_player` calls after
  finishing a game.

### Rolling back

```sql
alter table public.gz_players disable row level security;
grant select, insert, update on table public.gz_players to anon;
```
