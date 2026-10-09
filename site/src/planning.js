import content from './content.json';
import { currentWeather, weatherLabel } from './weather.js';
import './planning.css';
import { initDisplayMode } from './display-mode.js';
import { seasonalArtwork, setSeasonScene } from './season-scene.js';
const sun = '<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="40" cy="40" r="16"/><path d="M40 5v12m0 46v12M5 40h12m46 0h12M15 15l9 9m32 32 9 9M15 65l9-9m32-32 9-9"/></svg>';

export function initPlanning() {
  initDisplayMode();
  const phone = content.contacts.phones[0].whatsapp;
  const whatsapp = message => `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  document.querySelectorAll('[data-direct-inquiry]').forEach(link => {
    link.href = whatsapp('Hi SurfBrothers! I’d like to inquire about surfing and staying in Mulki. Could you help me plan a trip?');
  });
  const c = content.planning;
  const monthNow = Number(new Intl.DateTimeFormat('en', { month: 'numeric', timeZone: c.weather.timezone }).format(new Date())) - 1;
  document.querySelector('#arrive').insertAdjacentHTML('beforebegin', `
    <section class="trip-planner section" id="when-to-come" aria-labelledby="planning-title">
      <div class="section-top"><div><p class="eyebrow">A LITTLE LOCAL KNOW-HOW</p><h2 id="planning-title">${c.headline.replace('\n','<br>')}</h2></div><p class="section-intro">${c.intro}</p></div>
      <div class="season-experience">
        <div class="season-scene" aria-hidden="true">${seasonalArtwork}
          <div class="scene-caption"><p>MULKI, THROUGH THE YEAR</p><span class="scene-month"></span><span class="scene-mood"></span></div>
          <span class="scene-index"></span>
        </div>
        <p class="scene-disclaimer">An illustrated feel for the seasons. Your actual weather and surf will vary.</p>
      </div>
      <div class="planning-grid">
        <div class="season-planner">
          <div class="season-topline"><span>THE MULKI CALENDAR</span><span>01 — 12</span></div>
          <div class="month-picker" role="group" aria-label="Explore Mulki by month">${c.months.map((name, i) => `<button type="button" data-month="${i}" data-season="${c.seasons.find(s => s.months.includes(i)).id}" aria-pressed="${i === monthNow}" aria-label="${name}${i === monthNow ? ', current month' : ''}"><span>${name.slice(0,3)}</span><i aria-hidden="true"></i></button>`).join('')}</div>
          <div class="season-legend"><span><i class="favourite"></i> Suggested window</span><span><i class="summer"></i> Wider season</span><span><i class="monsoon"></i> Monsoon</span></div>
          <div class="season-detail" aria-live="polite" aria-atomic="true"><p class="eyebrow" id="season-label"></p><h3 id="season-title"></h3><p id="season-description"></p></div>
          <a class="text-link month-inquiry" target="_blank" rel="noopener noreferrer"></a>
          <p class="season-note">${c.note}</p>
          <details class="season-sources"><summary>About this seasonal guide</summary><p>Based on local surf-school guidance; this is a planning suggestion, not SurfBrothers’ operating calendar.</p>${c.sources.map(s => `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label} ↗</a>`).join('')}</details>
        </div>
        <aside class="mulki-weather" aria-labelledby="weather-title">
          <div class="weather-topline"><h3 id="weather-title">MULKI, RIGHT NOW.</h3><span class="weather-location">13.07° N · 74.78° E</span></div>
          <div class="weather-art" aria-hidden="true">${sun}<span>≈</span></div>
          <div class="weather-reading" aria-live="polite"><p class="weather-temperature">—<span>°C</span></p><p class="weather-condition">Checking the coast…</p><p class="weather-time"></p></div>
          <dl class="weather-facts"><div><dt>Wind</dt><dd id="weather-wind">—</dd></div><div><dt>Humidity</dt><dd id="weather-humidity">—</dd></div></dl>
          <p class="weather-context">${c.weather.note}</p>
          <button class="weather-retry text-link" type="button" hidden>Try weather again ↗</button>
          <p class="weather-credit">Forecast data: <a href="${c.weather.source}" target="_blank" rel="noopener noreferrer">MET Norway</a> · <a href="${c.weather.license}" target="_blank" rel="noopener noreferrer">CC BY 4.0</a><br>Rounded near-hour estimates, not a beach observation.</p>
        </aside>
      </div>
    </section>`);
  const planner = document.querySelector('#when-to-come');
  const controls = document.createElement('div');
  controls.className = 'scene-controls';
  controls.append(planner.querySelector('.month-picker'), planner.querySelector('.season-legend'), planner.querySelector('.scene-disclaimer'));
  planner.querySelector('.season-experience').append(controls);
  planner.querySelector('.season-topline').remove();
  function selectMonth(index) {
    const season = c.seasons.find(s => s.months.includes(index));
    planner.dataset.season = season.id;
    setSeasonScene(planner, index, c.months[index]);
    planner.querySelectorAll('[data-month]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.month) === index)));
    planner.querySelector('#season-label').textContent = `${c.months[index]} / ${season.label}`;
    planner.querySelector('#season-title').textContent = season.title;
    planner.querySelector('#season-description').textContent = season.text;
    const inquiry = planner.querySelector('.month-inquiry');
    inquiry.textContent = `Ask about ${c.months[index]} ↗`;
    inquiry.href = whatsapp(`Hi SurfBrothers! I’m considering a surf trip in ${c.months[index]}. Could you advise on suitable dates, lessons and stay availability?`);
  }
  planner.querySelectorAll('[data-month]').forEach(button => button.addEventListener('click', () => selectMonth(Number(button.dataset.month))));
  selectMonth(monthNow);
  const sceneObserver = new IntersectionObserver(entries => {
    for (const entry of entries) entry.target.classList.toggle('scene-live', entry.isIntersecting && !document.hidden);
  }, { threshold: 0.05 });
  sceneObserver.observe(planner.querySelector('.season-scene'));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) planner.querySelector('.season-scene').classList.remove('scene-live');
    else { const bounds = planner.querySelector('.season-scene').getBoundingClientRect(); planner.querySelector('.season-scene').classList.toggle('scene-live', bounds.bottom > 0 && bounds.top < innerHeight); }
  });

  const card = planner.querySelector('.mulki-weather');
  const retry = card.querySelector('.weather-retry');
  const cacheKey = 'surfbrothers-mulki-weather-v1';
  let loading = false, loaded = false, nextTry = 0, freshnessTimer;
  const hour = value => new Intl.DateTimeFormat('en-IN', { timeZone: c.weather.timezone, hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' }).format(new Date(value)) + ' IST';
  function paintWeather(data) {
    const w = currentWeather(data);
    card.querySelector('.weather-temperature').innerHTML = `${w.temperature}<span>°C</span>`;
    card.querySelector('.weather-condition').textContent = weatherLabel(w.symbol);
    card.querySelector('.weather-time').textContent = `For ${hour(w.validAt)} · model updated ${hour(w.updatedAt)}`;
    card.querySelector('#weather-wind').textContent = w.wind === null ? 'Unavailable' : `${w.wind} km/h`;
    card.querySelector('#weather-humidity').textContent = w.humidity === null ? 'Unavailable' : `${w.humidity}%`;
    card.dataset.sky = /rain|thunder/.test(w.symbol) ? 'rain' : /cloud/.test(w.symbol) ? 'cloud' : 'clear';
    const icon = card.querySelector('.weather-art svg');
    if (card.dataset.sky === 'rain') icon.innerHTML = '<path d="M20 46a13 13 0 1 1 3-26 19 19 0 0 1 36 6 10 10 0 0 1 0 20H20Z"/><path d="m25 54-4 11m21-11-4 11m21-11-4 11"/>';
    else if (card.dataset.sky === 'cloud') icon.innerHTML = '<path d="M20 53a15 15 0 1 1 3-30 20 20 0 0 1 37 7 12 12 0 0 1 0 23H20Z"/>';
    else if (w.symbol.endsWith('_night')) icon.innerHTML = '<path d="M51 12a27 27 0 1 0 17 40A29 29 0 0 1 51 12Z"/><path d="M62 13v10m-5-5h10"/>';
    else icon.innerHTML = '<circle cx="40" cy="40" r="16"/><path d="M40 5v12m0 46v12M5 40h12m46 0h12M15 15l9 9m32 32 9 9M15 65l9-9m32-32 9-9"/>';
    loaded = true;
    retry.hidden = true;
    clearTimeout(freshnessTimer);
    freshnessTimer = setTimeout(() => {
      loaded = false;
      unavailable('This weather reading has expired. Refresh for the latest forecast.');
    }, Math.max(1000, Date.parse(w.validAt) + 90 * 60000 - Date.now()));
  }
  function unavailable(message = 'Current temperature is unavailable. The month guide is still here to help.') {
    card.querySelector('.weather-temperature').innerHTML = '—<span>°C</span>';
    card.querySelector('.weather-condition').textContent = 'The weather feed is taking a break.';
    card.querySelector('.weather-time').textContent = message;
    card.querySelector('#weather-wind').textContent = '—';
    card.querySelector('#weather-humidity').textContent = '—';
    retry.hidden = Date.now() < nextTry;
  }
  async function loadWeather() {
    if (loading || Date.now() < nextTry) return;
    loading = true;
    retry.hidden = true;
    card.querySelector('.weather-condition').textContent = 'Checking the coast…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
      let cached;
      try { cached = JSON.parse(localStorage.getItem(cacheKey)); } catch {}
      if (cached?.expires > Date.now()) {
        try { paintWeather(cached.data); return; }
        catch { try { localStorage.removeItem(cacheKey); } catch {} }
      }
      // Simple CORS GET: the browser supplies Origin; no location permission or API key.
      const response = await fetch(c.weather.endpoint, { signal: controller.signal, credentials: 'omit' });
      if (!response.ok) { nextTry = Date.now() + 10 * 60000; throw new Error('Weather unavailable'); }
      const data = await response.json();
      paintWeather(data);
      const expiry = Date.parse(response.headers.get('Expires'));
      const expires = Math.max(Date.now() + 30 * 60000, Number.isFinite(expiry) ? expiry : 0);
      try { localStorage.setItem(cacheKey, JSON.stringify({ expires, data })); } catch {}
    } catch {
      loaded = false;
      nextTry = Math.max(nextTry, Date.now() + 60000);
      unavailable();
      setTimeout(() => { if (!loaded) retry.hidden = false; }, Math.max(0, nextTry - Date.now()));
    } finally { clearTimeout(timeout); loading = false; }
  }
  retry.addEventListener('click', loadWeather);
  const observer = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting) && !loaded && !document.hidden) loadWeather();
  }, { rootMargin: '150px' });
  observer.observe(card);
}
