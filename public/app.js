const STREAM_URL   = 'https://d3d4yli4hf5bmh.cloudfront.net/hls/live.m3u8';
const METADATA_URL = 'https://d3d4yli4hf5bmh.cloudfront.net/metadatav2.json';
const COVER_URL    = 'https://d3d4yli4hf5bmh.cloudfront.net/cover.jpg';
const POLL_MS = 15000;

const audio       = new Audio();
const playBtn     = document.getElementById('playBtn');
const iconPlay    = document.getElementById('iconPlay');
const iconPause   = document.getElementById('iconPause');
const statusEl    = document.getElementById('status');
const visualizer  = document.getElementById('visualizer');
const volumeEl    = document.getElementById('volume');
const elapsedEl   = document.getElementById('elapsed');
const npTitle     = document.getElementById('npTitle');
const npArtist    = document.getElementById('npArtist');
const npAlbum     = document.getElementById('npAlbum');
const npQuality   = document.getElementById('npQuality');
const npYear      = document.getElementById('npYear');
const albumArt    = document.getElementById('albumArt');
const historyList = document.getElementById('historyList');
const ratingsRow  = document.getElementById('ratingsRow');
const btnUp       = document.getElementById('btnUp');
const btnDown     = document.getElementById('btnDown');
const countUp     = document.getElementById('countUp');
const countDown   = document.getElementById('countDown');

let currentSongId = null;
let playing = false;
let elapsedSecs = 0;
let timer = null;
let pollTimer = null;
let lastTitle = null;

/* ── Elapsed timer ── */
function formatTime(secs) {
  const h  = Math.floor(secs / 3600);
  const m  = Math.floor((secs % 3600) / 60);
  const s  = secs % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function startTimer() {
  elapsedSecs = 0;
  elapsedEl.classList.add('visible');
  timer = setInterval(() => { elapsedSecs++; elapsedEl.textContent = formatTime(elapsedSecs); }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  timer = null;
  elapsedEl.classList.remove('visible');
  elapsedEl.textContent = '00:00';
  elapsedSecs = 0;
}

/* ── Metadata ── */
async function fetchMetadata() {
  try {
    const res  = await fetch(METADATA_URL);
    const data = await res.json();
    renderMetadata(data);
  } catch (_) { /* silent */ }
}

function renderMetadata(d) {
  const songId = `${d.artist}::${d.title}`;
  const isNew  = songId !== currentSongId;
  if (isNew) currentSongId = songId;
  lastTitle = d.title;

  if (isNew) {
    ratingsRow.style.display = 'none';
    loadRatings(songId);

    [npTitle, npArtist].forEach(el => el.classList.remove('track-updated'));
    void npTitle.offsetWidth;
    npTitle.classList.add('track-updated');
    npArtist.classList.add('track-updated');

    albumArt.classList.add('loading');
    const img = new Image();
    img.onload = () => {
      albumArt.src = img.src;
      albumArt.classList.remove('loading');
    };
    img.src = `${COVER_URL}?t=${Date.now()}`;
  }

  npTitle.textContent  = d.title  || '—';
  npArtist.textContent = d.artist || '—';
  npAlbum.textContent  = d.album  || '—';
  npYear.textContent   = d.date   || '—';

  if (d.bit_depth && d.sample_rate) {
    const khz = (d.sample_rate / 1000).toFixed(1);
    npQuality.textContent = `${d.bit_depth}-bit / ${khz} kHz`;
  }

  const items = [];
  for (let i = 1; i <= 5; i++) {
    const t = d[`prev_title_${i}`];
    const a = d[`prev_artist_${i}`];
    if (t && a) items.push({ title: t, artist: a });
  }

  historyList.innerHTML = items.map((item, i) => `
    <div class="history-item">
      <div class="history-num">${i + 1}</div>
      <div class="history-info">
        <div class="history-title">${escHtml(item.title)}</div>
        <div class="history-artist">${escHtml(item.artist)}</div>
      </div>
    </div>
  `).join('');
}

/* ── Ratings ── */
function applyVoteState({ up, down, userVote }) {
  countUp.textContent   = up;
  countDown.textContent = down;
  btnUp.classList.toggle('voted-up',     userVote === 1);
  btnDown.classList.toggle('voted-down', userVote === -1);
  btnUp.disabled   = false;
  btnDown.disabled = false;
}

async function loadRatings(songId) {
  try {
    const res  = await fetch(`/api/ratings?song=${encodeURIComponent(songId)}`);
    const data = await res.json();
    applyVoteState(data);
    ratingsRow.style.display = '';
  } catch (_) { /* silent */ }
}

async function submitRating(rating) {
  if (!currentSongId) return;
  try {
    const res  = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ song_id: currentSongId, rating }),
    });
    const data = await res.json();
    applyVoteState(data);
  } catch (_) { /* silent */ }
}

btnUp.addEventListener('click',   () => submitRating(1));
btnDown.addEventListener('click', () => submitRating(-1));

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function startPolling() {
  fetchMetadata();
  pollTimer = setInterval(fetchMetadata, POLL_MS);
}

function stopPolling() {
  clearInterval(pollTimer);
  pollTimer = null;
}

/* ── HLS init ── */
function initHls() {
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(STREAM_URL);
    hls.attachMedia(audio);
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) setStatus('Stream error — retrying…');
    });
  } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
    audio.src = STREAM_URL;
  } else {
    setStatus('HLS not supported in this browser');
  }
}

function setStatus(msg) { statusEl.textContent = msg; }

initHls();

albumArt.onload = () => albumArt.classList.remove('loading');
albumArt.src = COVER_URL;

fetchMetadata();

/* ── Play / Pause ── */
playBtn.addEventListener('click', () => {
  if (!playing) {
    audio.play().then(() => {
      playing = true;
      iconPlay.style.display  = 'none';
      iconPause.style.display = '';
      visualizer.classList.add('playing');
      setStatus('Live');
      startTimer();
      startPolling();
    }).catch(() => setStatus('Playback blocked — try again'));
  } else {
    audio.pause();
    playing = false;
    iconPlay.style.display  = '';
    iconPause.style.display = 'none';
    visualizer.classList.remove('playing');
    setStatus('Paused');
    stopTimer();
    stopPolling();
  }
});

volumeEl.addEventListener('input', () => { audio.volume = volumeEl.value; });

audio.addEventListener('waiting', () => setStatus('Buffering…'));
audio.addEventListener('playing', () => setStatus('Live'));
audio.addEventListener('stalled', () => setStatus('Stream stalled…'));
