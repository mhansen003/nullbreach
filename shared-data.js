// ── SHARED FACTION DATA ──────────────────────────────────────────────────────
// Single source of truth for faction names + colors across menu (index.html),
// engine (cards.js RACE_DATA) and leaderboard (leaderboard.js _LB_FACTIONS).
// Canonical values taken from cards.js RACE_DATA — the in-game truth.
// ── SHARED SUPABASE CONFIG ───────────────────────────────────────────────────
// Single source of truth for the Supabase URL / anon key / headers used by
// index.html (SB_*), leaderboard.js (_SB_LB_*) and multiplayer.js (_SB_*).
// The anon/public key is safe to ship; RLS enforces all access rules.
window.GZ_SB = {
  url: 'https://mstpkwxxhsspivtngfnm.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdHBrd3h4aHNzcGl2dG5nZm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTE2MTcsImV4cCI6MjA5NjAyNzYxN30.B0F-e_mGzv5kbjwOa2yw499OfsZ3qJDXdoyrCu2tNiI',
};
window.GZ_SB.headers = {
  'apikey': window.GZ_SB.key,
  'Authorization': 'Bearer ' + window.GZ_SB.key,
  'Content-Type': 'application/json',
};

window.GZ_FACTIONS = {
  terran:     { name: 'THE TERRAN ACCORD',      color: '#7ab8e8' },
  crystallis: { name: 'THE CRYSTALLIS',         color: '#00ccff' },
  mycos:      { name: 'THE MYCOS DRIFT',        color: '#9dcf6e' },
  veil:       { name: 'THE VEIL',               color: '#fff5a0' },
  entropy:    { name: 'THE ENTROPY CULT',       color: '#c4723a' },
  brood:      { name: 'THE BROOD SOVEREIGN',    color: '#88cc44' },
  void:       { name: 'THE VOID HUNTERS',       color: '#9b59b6' },
  gas:        { name: 'THE GAS NOMADS',         color: '#ffd700' },
  lithos:     { name: 'THE LITHOS',             color: '#a0896a' },
  quantum:    { name: 'THE QUANTUM THREAD',     color: '#ff69b4' },
  choir:      { name: 'THE CHOIR',              color: '#c8c8ff' },
};
