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


let playlistOrder = [];


let trackIdx = 0;


let musicStarted = false;


let musicMuted = false;


let _sfxMuted  = false;


let _sfxVol    = 1.0;

function shufflePlaylist() {


  playlistOrder = [...PLAYLIST];


  for (let i = playlistOrder.length - 1; i > 0; i--) {


    const j = Math.floor(Math.random() * (i + 1));


    [playlistOrder[i], playlistOrder[j]] = [playlistOrder[j], playlistOrder[i]];


  }


  trackIdx = 0;


}

function playNextTrack() {


  if (musicMuted) return;


  if (trackIdx >= playlistOrder.length) {
    const lastTrack = playlistOrder[playlistOrder.length - 1];
    shufflePlaylist();
    // prevent same song repeating at boundary
    if (playlistOrder[0] === lastTrack && playlistOrder.length > 1) {
      const swap = Math.floor(Math.random() * (playlistOrder.length - 1)) + 1;
      [playlistOrder[0], playlistOrder[swap]] = [playlistOrder[swap], playlistOrder[0]];
    }
  }


  const audio = document.getElementById('bgTrack');


  audio.src = playlistOrder[trackIdx++];


  audio.volume = 0.4;


  audio.play().catch(() => {
    // Autoplay blocked — retry on first user interaction
    const retry = () => {
      audio.play().catch(() => {});
      document.removeEventListener('click', retry, true);
      document.removeEventListener('keydown', retry, true);
      document.removeEventListener('touchstart', retry, true);
    };
    document.addEventListener('click',      retry, { once:true, capture:true });
    document.addEventListener('keydown',    retry, { once:true, capture:true });
    document.addEventListener('touchstart', retry, { once:true, capture:true });
  });


}

function startGameMusic() {


  if (musicStarted) return;


  musicStarted = true;


  shufflePlaylist();


  const audio = document.getElementById('bgTrack');


  audio.addEventListener('ended', playNextTrack);


  playNextTrack();


}

// Auto-start music on first user interaction (browser blocks autoplay without a gesture)
function _autoStartMusic() {
  if (!musicMuted && !musicStarted) startGameMusic();
}
document.addEventListener('click',      _autoStartMusic, { once: true, capture: true });
document.addEventListener('keydown',    _autoStartMusic, { once: true, capture: true });
document.addEventListener('touchstart', _autoStartMusic, { once: true, capture: true });

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
