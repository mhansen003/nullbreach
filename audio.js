// ── GAMEPLAY MUSIC: random rotating playlist ─────────────

const PLAYLIST = [

  'assets/music1.mp3',

  'assets/music2.mp3',

  'assets/music3.mp3',

  'assets/music4.mp3',

  'assets/music5.mp3',

  'assets/music6.mp3',

  'assets/music7.mp3',

  'assets/music9.mp3',

];

let _currentTrack = null;

let musicStarted = false;

let musicMuted = false;

let _sfxMuted  = false;

let _sfxVol    = 1.0;

function playNextTrack() {

  if (musicMuted) return;

  // Pick a random track guaranteed to differ from the last one played
  const candidates = PLAYLIST.length > 1
    ? PLAYLIST.filter(t => t !== _currentTrack)
    : [...PLAYLIST];
  _currentTrack = candidates[Math.floor(Math.random() * candidates.length)];

  const audio = document.getElementById('bgTrack');

  audio.src = _currentTrack;
  audio.load(); // force browser to fetch new src (required with preload="none")

  audio.volume = 0.4;

  audio.play().catch(() => {
    // Autoplay blocked — retry on first user interaction
    const retry = () => { audio.play().catch(() => {}); };
    document.addEventListener('pointerdown', retry, { once:true, capture:true });
    document.addEventListener('click',       retry, { once:true, capture:true });
    document.addEventListener('keydown',     retry, { once:true, capture:true });
    document.addEventListener('touchstart',  retry, { once:true, capture:true });
  });

}

// Consecutive track-load failures. Capped at one full playlist pass so a
// broken audio setup (offline, missing files) can't loop error→next-track
// forever; reset whenever a track actually plays.
let _musicErrorStreak = 0;

function startGameMusic() {

  if (musicStarted) return;

  musicStarted = true;

  const audio = document.getElementById('bgTrack');

  audio.addEventListener('ended', playNextTrack);
  audio.addEventListener('error', () => {
    if (!musicStarted || musicMuted) return;
    _musicErrorStreak++;
    if (_musicErrorStreak >= PLAYLIST.length) {
      if (_musicErrorStreak === PLAYLIST.length)
        console.warn('Music: every playlist track failed to load — stopping retries');
      return;
    }
    playNextTrack();
  });
  audio.addEventListener('playing', () => { _musicErrorStreak = 0; });

  playNextTrack();

}

// Auto-start music on first user interaction (browser blocks autoplay without a gesture)
function _autoStartMusic() {
  if (!musicMuted && !musicStarted) startGameMusic();
}
document.addEventListener('pointerdown', _autoStartMusic, { once: true, capture: true });
document.addEventListener('click',       _autoStartMusic, { once: true, capture: true });
document.addEventListener('keydown',     _autoStartMusic, { once: true, capture: true });
document.addEventListener('touchstart',  _autoStartMusic, { once: true, capture: true });

// Resume music when user returns to tab (mobile suspends audio on tab-switch)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && musicStarted && !musicMuted) {
    const audio = document.getElementById('bgTrack');
    if (!audio) return;
    if (audio.ended) playNextTrack(); // track finished while backgrounded
    else if (audio.paused) audio.play().catch(() => {});
  }
});

function setSfxVolume(val) {

  _sfxVol = val / 100;

  const s = document.getElementById('sfxSlider');

  if (s) s.value = val;

}

function toggleSfxMute() {

  _sfxMuted = !_sfxMuted;

  const btn = document.getElementById('sfxMuteBtn');

  if (btn) btn.textContent = _sfxMuted ? '🔇 UNMUTE SFX' : '🔊 MUTE SFX';

}

function setVolume(val) {

  const audio = document.getElementById('bgTrack');

  if (audio) audio.volume = val / 100;

  // Sync both sliders

  const s1 = document.getElementById('volSlider');

  const s2 = document.getElementById('volSlider2');

  if (s1) s1.value = val;
  try { localStorage.setItem('gz_musicVol', val); } catch(e){}

  if (s2) s2.value = val;

}

function playHoverSfx() {

  const sfx = document.getElementById('hoverSfx');

  if (!sfx || _sfxMuted) return;

  sfx.currentTime = 0; sfx.volume = 0.65 * _sfxVol;

  sfx.play().catch(() => {});

}

function playCardSfx() {

  const sfx = document.getElementById('cardSfx');

  if (!sfx || _sfxMuted) return;

  sfx.currentTime = 0; sfx.volume = 0.7 * _sfxVol;

  sfx.play().catch(() => {});

}

function playSelectSfx() {

  const sfx = document.getElementById('selectSfx');

  if (!sfx || _sfxMuted) return;

  sfx.currentTime = 0; sfx.volume = 0.65 * _sfxVol;

  sfx.play().catch(() => {});

}

function playDeckExpandSfx() {

  const sfx = document.getElementById('deckExpandSfx');

  if (!sfx || _sfxMuted) return;

  sfx.currentTime = 0; sfx.volume = 0.8 * _sfxVol;

  sfx.play().catch(() => {});

}

function playCardPopSfx() {

  const sfx = document.getElementById('cardPopSfx');

  if (!sfx || _sfxMuted) return;

  sfx.currentTime = 0; sfx.volume = 0.55 * _sfxVol;

  sfx.play().catch(() => {});

}
