document.addEventListener('DOMContentLoaded', () => {
  const FEED_URL = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

  const $ = (id) => document.getElementById(id);
  const btn = $('getImageBtn');
  const gallery = $('gallery');
  const startInput = $('startDate');
  const endInput = $('endDate');

  const SPACE_FACTS = [
    "A day on Venus is longer than its year.",
    "Neutron stars can spin 600 times per second.",
    "Olympus Mons on Mars is ~2.5× taller than Everest.",
    "Saturn would float in water due to its low density.",
    "Jupiter’s Great Red Spot is at least 350 years old.",
    "There may be more trees on Earth than stars in the Milky Way.",
    "The Sun holds ~99.86% of the Solar System’s mass.",
    "Some exoplanets may rain glass or metal.",
    "The ISS orbits Earth about every 90 minutes.",
    "Mars has two tiny moons: Phobos and Deimos.",
    "Light from the Sun takes ~8 minutes to reach Earth.",
    "There are more than 5,000 confirmed exoplanets.",
    "A teaspoon of neutron star matter would weigh billions of tons.",
    "Uranus rotates on its side, tilted about 98°.",
    "Black holes do not “suck”—objects fall in due to gravity."
  ];

  function setRandomFact(){
    if (!factBar) return;
    const fact = SPACE_FACTS[Math.floor(Math.random() * SPACE_FACTS.length)];
    factBar.textContent = `Did you know? ${fact}`;
  }

  if (!btn) {
    console.error('Button #getImageBtn not found. Check your HTML.');
    banner('Missing button with id="getImageBtn". Fix your HTML and reload.');
    return;
  }

  function banner(msg) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">⚠️</div>
        <p>${msg}</p>
      </div>
    `;
  }

  function loading() {
    gallery.innerHTML = `
      <div class="placeholder">
        <span class="loading">🔄 Loading space photos…</span>
      </div>
    `;
  }

  const iso = (d) => new Date(d).toISOString().slice(0,10);
  const byDateDesc = (a,b) => new Date(b.date) - new Date(a.date);

  function getYouTubeId(url){
    try{
      const u = new URL(url);
      if (u.hostname.includes('youtube.com')) {
        const v = u.searchParams.get('v');
        if (v) return v;
        const m = u.pathname.match(/\/embed\/([^/]+)/);
        if (m) return m[1];
      }
      if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    } catch {}
    return null;
  }

  function card(item){
    const { title, date, media_type, url, thumbnail_url } = item;
    const el = document.createElement('article');
    el.className = 'gallery-item';
    el.tabIndex = 0;

    const wrap = document.createElement('div');
    wrap.className = 'thumb-wrap';

    const img = document.createElement('img');
    img.className = 'thumb';
    img.alt = title || 'APOD media';

    if (media_type === 'image') {
      img.src = url;
    } 
    
    else {
      const yid = getYouTubeId(url);
      img.src = thumbnail_url || (yid ? `https://img.youtube.com/vi/${yid}/hqdefault.jpg` : 'img/video-placeholder.jpg');
      const play = document.createElement('div');
      play.className = 'play-pill';
      play.textContent = '▶';
      wrap.appendChild(play);
    }

    const badge = document.createElement('div');
    badge.className = 'badge';
    badge.textContent = (media_type || 'media').toUpperCase();

    wrap.appendChild(img);
    wrap.appendChild(badge);

    const t = document.createElement('div');
    t.className = 'title';
    t.textContent = title || '(Untitled)';

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = iso(date);

    el.appendChild(wrap);
    el.appendChild(t);
    el.appendChild(meta);

    const open = () => openModal(item);
    el.addEventListener('click', open);
    el.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
    return el;
  }

  function render(list){
    if (!list.length) return banner('No APOD entries for that range.');
    const frag = document.createDocumentFragment();
    list.forEach(x => frag.appendChild(card(x)));
    gallery.innerHTML = '';
    gallery.appendChild(frag);
  }

  function openModal(item){
    const { title, date, media_type, url, explanation, hdurl } = item;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    const modal = document.createElement('div');
    modal.className = 'modal';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', close);

    let mediaEl;
    if (media_type === 'image') {
      mediaEl = document.createElement('img');
      mediaEl.src = url; mediaEl.alt = title || 'APOD image';
      mediaEl.className = 'modal-media';
    } 
    else {
      const yid = getYouTubeId(url);

      if (yid) {
        mediaEl = document.createElement('iframe');
        mediaEl.className = 'modal-media';
        mediaEl.width = '100%'; mediaEl.height = '480';
        mediaEl.src = `https://www.youtube.com/embed/${yid}`;
        mediaEl.title = title || 'APOD video';
        mediaEl.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        mediaEl.referrerPolicy = 'strict-origin-when-cross-origin';
        mediaEl.allowFullscreen = true;
      } 
      else {
        mediaEl = document.createElement('a');
        mediaEl.href = url; mediaEl.target = '_blank'; mediaEl.rel = 'noopener';
        mediaEl.textContent = 'Open video';
        mediaEl.className = 'modal-media';
      }
    }

    const header = document.createElement('div');
    header.className = 'modal-header';

    const h = document.createElement('div');
    h.className = 'modal-title';
    h.textContent = title || '(Untitled)';

    const sub = document.createElement('div');
    sub.className = 'modal-meta';
    sub.textContent = iso(date);

    if (media_type === 'image' && hdurl) {
      const hd = document.createElement('a');
      hd.href = hdurl; hd.target = '_blank'; hd.rel = 'noopener';
      hd.textContent = ' · View HD';
      hd.style.fontWeight = '600';
      sub.appendChild(hd);
    }

    const expl = document.createElement('p');
    expl.className = 'modal-expl';
    expl.textContent = explanation || '';

    modal.appendChild(closeBtn);
    modal.appendChild(mediaEl);
    header.appendChild(h);
    header.appendChild(sub);
    modal.appendChild(header);
    modal.appendChild(expl);

    overlay.appendChild(modal);
    document.getElementById('modalRoot')?.remove();
    const root = document.createElement('div');
    root.id = 'modalRoot';
    document.body.appendChild(root);
    root.appendChild(overlay);

    function close(){ root.remove(); }
    document.addEventListener('keydown', function onKey(e){
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
    });
  }

  async function fetchFeed() {
    const res = await fetch(FEED_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Feed error ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Feed did not return an array.');
    return data.filter(x => x && x.date && x.url && x.media_type);
  }


  function filterRange(items, s, e){
    if (!s && !e) return items;
    const min = s ? new Date(s) : new Date('0001-01-01');
    const max = e ? new Date(e) : new Date('9999-12-31');
    return items.filter(x => {
      const dx = new Date(x.date);
      return dx >= min && dx <= max;
    });
  }

  btn.addEventListener('click', async () => {
    loading();
    try {
      const all = await fetchFeed();
      const sVal = startInput?.value || null;
      const eVal = endInput?.value || null;

      if (sVal && eVal && new Date(sVal) > new Date(eVal)) {
        banner('Start date must be before end date.');
        return;
      }

      let list = filterRange(all, sVal, eVal).sort(byDateDesc);
      if (!sVal && !eVal) list = all.sort(byDateDesc).slice(0, 9);

      if (!list.length) {
        banner('No APOD entries for that range. Try different dates.');
        return;
      }
      render(list);
    } 
    catch (err) {
      console.error(err);
      banner('Could not load the APOD feed. Check your internet/CORS and try again.');
    }
    setRandomFact();
  });
});
