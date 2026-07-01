-- ═════════════════════════════════════════════════════════════════════════════
-- GALACTIC ZERO — Supabase hardening migration
--
-- Fixes:
--   1. Lossy full-array move PATCH: adds gz_append_move(), an atomic,
--      row-locked append with optimistic concurrency (expected_index).
--      multiplayer.js calls this via POST /rest/v1/rpc/gz_append_move and
--      only falls back to the legacy read-modify-write PATCH if this
--      function does not exist yet (404).
--   2. World-writable tables: enables Row Level Security on gz_rooms,
--      gz_leaderboard and gz_events and grants the anon role only the
--      minimum it needs.
--
-- Apply via the Supabase dashboard SQL editor (see supabase/README.md).
-- Idempotent: safe to run more than once.
-- ═════════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Atomic move append
-- ─────────────────────────────────────────────────────────────────────────────
-- SECURITY DEFINER: runs as the function owner, so it can update the moves
-- column even though the anon role's direct UPDATE grant on that column is
-- revoked below. This makes the RPC the ONLY way a client can write moves.
create or replace function public.gz_append_move(room_id text, move jsonb, expected_index int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  cur jsonb;
begin
  -- Lock the room row so concurrent appends serialize instead of clobbering
  select coalesce(moves, '[]'::jsonb) into cur
    from gz_rooms
   where id = room_id
     for update;

  if not found then
    raise exception 'room % not found', room_id using errcode = 'P0002';
  end if;

  -- Idempotency: a client retry of an already-applied move succeeds as a
  -- no-op instead of double-appending (mirrors the old client-side check).
  if exists (
    select 1
      from jsonb_array_elements(cur) m
     where (m->>'player') = (move->>'player')
       and (m->>'turn')   = (move->>'turn')
  ) then
    return jsonb_array_length(cur);
  end if;

  -- Optimistic concurrency: the caller states which index it expects to
  -- write. A stale client (e.g. missed an opponent move) is rejected instead
  -- of silently rewriting history.
  if jsonb_array_length(cur) <> expected_index then
    raise exception 'stale move: expected_index % but room has % moves',
      expected_index, jsonb_array_length(cur)
      using errcode = 'P0001';
  end if;

  -- Minimal shape validation of the move payload
  if (move->>'player') not in ('1','2') or (move->>'turn') is null then
    raise exception 'invalid move payload' using errcode = 'P0001';
  end if;

  update gz_rooms
     set moves      = cur || jsonb_build_array(move),
         updated_at = now()
   where id = room_id;

  return jsonb_array_length(cur) + 1;
end;
$$;

-- Only the anon role (the game client) may call the RPC
revoke all on function public.gz_append_move(text, jsonb, int) from public;
grant execute on function public.gz_append_move(text, jsonb, int) to anon;
grant execute on function public.gz_append_move(text, jsonb, int) to authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. gz_rooms — RLS + column-level write grants
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.gz_rooms enable row level security;

-- Column-level privileges: anon may NOT update the moves column directly
-- (that is what gz_append_move is for) and may not touch P1 identity columns
-- after creation. It may only fill in the P2 seat and flip the status.
revoke update on table public.gz_rooms from anon;
grant update (p2_faction, p2_color, p2_name, p2_initials, status, updated_at)
  on public.gz_rooms to anon;

-- Rooms are not deletable from the client at all
revoke delete on table public.gz_rooms from anon;

-- SELECT: anyone with the room code can read it. Room ids are short random
-- invite codes; reading is required for joining, polling and resume.
drop policy if exists gz_rooms_select on public.gz_rooms;
create policy gz_rooms_select on public.gz_rooms
  for select to anon using (true);

-- INSERT: room creation. New rooms must start in the lobby state with an
-- empty move list — a client cannot pre-seed history or create a room that
-- is already "playing"/"done".
drop policy if exists gz_rooms_insert on public.gz_rooms;
create policy gz_rooms_insert on public.gz_rooms
  for insert to anon
  with check (
    status = 'waiting'
    and coalesce(moves, '[]'::jsonb) = '[]'::jsonb
  );

-- UPDATE: only live rooms can be updated (finished rooms are frozen), and
-- the resulting status must be one of the known states. Combined with the
-- column grant above this limits client updates to: P2 joining
-- (waiting → playing + p2_* columns) and ending the game
-- (playing → done / forfeited). Move appends go through gz_append_move.
drop policy if exists gz_rooms_update on public.gz_rooms;
create policy gz_rooms_update on public.gz_rooms
  for update to anon
  using  (status in ('waiting', 'playing'))
  with check (status in ('waiting', 'playing', 'done', 'forfeited'));

-- No DELETE policy: with RLS enabled and no policy, deletes are denied.


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. gz_leaderboard — read + constrained insert only
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.gz_leaderboard enable row level security;

-- Existing rows are immutable from the client: no UPDATE/DELETE policy, and
-- the table privileges are revoked for defense in depth.
revoke update, delete on table public.gz_leaderboard from anon;

-- SELECT: the Hall of Champions is public.
drop policy if exists gz_leaderboard_select on public.gz_leaderboard;
create policy gz_leaderboard_select on public.gz_leaderboard
  for select to anon using (true);

-- INSERT: sanity-check every submitted record so a hostile client can't spam
-- absurd scores or junk names:
--   * delta must be a plausible winning margin (1..100)
--   * initials must look like arcade initials. The game pads short entries
--     with '-' (e.g. 'A--'), so '-' is allowed alongside A-Z (this widens the
--     originally proposed '^[A-Z]{1,3}$' which would reject real entries).
--   * mode must be one of the two game modes.
drop policy if exists gz_leaderboard_insert on public.gz_leaderboard;
create policy gz_leaderboard_insert on public.gz_leaderboard
  for insert to anon
  with check (
    delta between 1 and 100
    and initials ~ '^[A-Z][A-Z-]{0,2}$'
    and mode in ('pve', 'pvp')
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. gz_events — write-only analytics
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.gz_events enable row level security;

-- Analytics are private: clients can log events but never read, edit or
-- delete them (no SELECT/UPDATE/DELETE policies).
revoke select, update, delete on table public.gz_events from anon;

-- INSERT: any event with a sane event name.
drop policy if exists gz_events_insert on public.gz_events;
create policy gz_events_insert on public.gz_events
  for insert to anon
  with check (
    event is not null
    and char_length(event) <= 64
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Tell PostgREST to reload its schema cache so the new RPC is visible
--    immediately (otherwise clients keep getting 404 and using the fallback
--    until the cache refreshes on its own).
-- ─────────────────────────────────────────────────────────────────────────────
notify pgrst, 'reload schema';


-- ═════════════════════════════════════════════════════════════════════════════
-- APPENDED SECTION — gz_players hardening (achievements/stats profiles)
--
-- gz_players rows are keyed by a client-generated secret token (localStorage
-- 'gz_player_token'). Before this section, the anon role could SELECT the
-- whole table — including every player's token — and then impersonate or
-- vandalize any profile. This section makes gz_players RPC-only for the anon
-- role, mirroring the gz_append_move technique used for gz_rooms above:
--
--   * gz_get_player(p_token)  — returns achievements/stats for one token only.
--     The token column itself is never returned and, with direct SELECT
--     revoked, can no longer be enumerated.
--   * gz_save_player(p_token, p_achievements, p_stats) — validated upsert.
--     Only the caller who knows a token can write that token's row.
--
-- achievements.js prefers these RPCs and falls back to the legacy direct
-- table access only while they don't exist yet (404), so the client keeps
-- working before and after this migration is applied.
--
-- Idempotent: safe to run more than once.
-- ═════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. gz_players — RLS on, direct anon access off
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.gz_players enable row level security;

-- No policies are created: with RLS enabled and no policy, direct access is
-- denied. Belt and braces: revoke the table privileges as well, so not even a
-- future permissive policy accidentally re-exposes the token column.
revoke select, insert, update, delete on table public.gz_players from anon;
revoke select, insert, update, delete on table public.gz_players from authenticated;

-- The upsert in gz_save_player requires a unique key on token. gz_players was
-- created with token as its key; this is a no-op guard if it already exists.
create unique index if not exists gz_players_token_uidx on public.gz_players (token);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. gz_get_player — read own profile by token (token never exposed)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.gz_get_player(p_token text)
returns table (achievements jsonb, stats jsonb)
language sql
security definer
set search_path = public
stable
as $$
  select p.achievements::jsonb, p.stats::jsonb
    from gz_players p
   where p.token = p_token;
$$;

revoke all on function public.gz_get_player(text) from public;
grant execute on function public.gz_get_player(text) to anon;
grant execute on function public.gz_get_player(text) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. gz_save_player — validated upsert of own profile by token
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.gz_save_player(p_token text, p_achievements jsonb, p_stats jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Token sanity: client tokens are crypto.randomUUID() strings (36 chars).
  -- Bounds are kept loose enough for legacy tokens but reject junk/empty.
  if p_token is null or char_length(p_token) < 16 or char_length(p_token) > 64 then
    raise exception 'invalid token' using errcode = 'P0001';
  end if;

  -- Achievements must be a modest array of short string ids (the game defines
  -- ~80). Caps stop a hostile client using the row as free blob storage.
  if p_achievements is null or jsonb_typeof(p_achievements) <> 'array'
     or jsonb_array_length(p_achievements) > 200 then
    raise exception 'invalid achievements payload' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_achievements) a
     where jsonb_typeof(a) <> 'string' or char_length(a #>> '{}') > 64
  ) then
    raise exception 'invalid achievement id' using errcode = 'P0001';
  end if;

  -- Stats must be a small object.
  if p_stats is null or jsonb_typeof(p_stats) <> 'object'
     or pg_column_size(p_stats) > 16384 then
    raise exception 'invalid stats payload' using errcode = 'P0001';
  end if;

  insert into gz_players (token, achievements, stats, last_seen)
  values (p_token, p_achievements, p_stats, now())
  on conflict (token) do update
    set achievements = excluded.achievements,
        stats        = excluded.stats,
        last_seen    = now();
end;
$$;

revoke all on function public.gz_save_player(text, jsonb, jsonb) from public;
grant execute on function public.gz_save_player(text, jsonb, jsonb) to anon;
grant execute on function public.gz_save_player(text, jsonb, jsonb) to authenticated;

-- Reload PostgREST's schema cache so the new RPCs are visible immediately.
notify pgrst, 'reload schema';
