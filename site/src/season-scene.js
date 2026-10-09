// Original vector atmosphere. Palettes suggest seasonal moods, not a daily forecast.
const moods = [
  ['Soft light. Slow coastal days.', '#dce9e2', '#f2dfb9', '#78aaa6', '#386c66', '#edb56e', 0, 0, .18, 0, 1],
  ['A little golden light.', '#e4eadb', '#f5dbab', '#70a6a0', '#386d60', '#efb267', 15, -10, .12, 0, 1],
  ['Sun on the water.', '#f1e7c9', '#f9c994', '#69a4a4', '#47705c', '#f4a150', 35, -25, .1, 0, 1],
  ['Warm skies. A slower pace.', '#f1dbb4', '#edbe8e', '#73a5a1', '#5a765c', '#f0a24f', 50, -35, .08, 0, 1],
  ['The coast begins to change.', '#c9d6c6', '#e4d1ac', '#618e8d', '#3f6959', '#edb473', 15, -15, .65, .08, .7],
  ['Rain rolls in. Palms sway.', '#a4b9b3', '#c4cdc0', '#4c7b7e', '#2b5a50', '#d4d3a3', -20, 10, .95, .7, .28],
  ['Monsoon, in full flow.', '#92aaa8', '#b0c4bc', '#416d75', '#28554c', '#cbd2ab', -40, 25, 1, .9, .12],
  ['Clouds over a greener coast.', '#a4bbb2', '#cad3b8', '#507c7b', '#2a6450', '#d9d6a3', -15, 5, .92, .65, .25],
  ['A little light between showers.', '#c2d7c9', '#e5dcc0', '#5c8d85', '#31704f', '#e4c17c', 0, 10, .65, .25, .55],
  ['The coast after the rains.', '#cfe4d6', '#eadbb9', '#659d92', '#2e6a51', '#edbb7c', 5, 5, .32, 0, .95],
  ['Long light. Room to unwind.', '#d6e6df', '#eeddbe', '#6aa2a0', '#376e5d', '#e9b677', -10, 20, .22, 0, 1],
  ['A softer kind of winter.', '#d7e6e4', '#f1e0bf', '#72a8a7', '#386d65', '#e8b576', -20, 25, .16, 0, 1],
];

export function setSeasonScene(planner, month, name) {
  const [caption, sky, horizon, sea, palms, sun, x, y, clouds, rain, light] = moods[month];
  const properties = { '--mood-sky': sky, '--mood-horizon': horizon, '--mood-sea': sea, '--mood-palms': palms, '--mood-sun': sun, '--sun-x': `${x}px`, '--sun-y': `${y}px`, '--clouds': clouds, '--rain': rain, '--sun-light': light, '--sway': rain > .5 ? '5deg' : '1.5deg' };
  for (const [key, value] of Object.entries(properties)) planner.style.setProperty(key, value);
  planner.querySelector('.scene-month').textContent = name;
  planner.querySelector('.scene-mood').textContent = caption;
  planner.querySelector('.scene-index').textContent = `${String(month + 1).padStart(2, '0')} / 12`;
}

const palm = `<path d="M0 0Q-9-88 5-177" fill="none" stroke="currentColor" stroke-width="12"/><path d="M5-177Q-48-226-100-198Q-48-211 5-177Q-71-185-104-145Q-60-179 5-177Q-32-242 20-255Q-5-226 5-177Q58-242 101-204Q57-220 5-177Q78-185 105-141Q64-177 5-177Q30-224 69-231Q35-216 5-177Z" fill="currentColor"/><circle cx="7" cy="-167" r="8" fill="currentColor"/>`;
export const seasonalArtwork = `
<svg class="season-landscape" viewBox="0 0 1600 500" preserveAspectRatio="xMidYMid slice" fill="none">
  <defs>
    <linearGradient id="season-sky" x2="0" y2="1"><stop stop-color="var(--mood-sky)"/><stop offset="1" stop-color="var(--mood-horizon)"/></linearGradient>
    <linearGradient id="season-water" x2="0" y2="1"><stop stop-color="var(--mood-sea)"/><stop offset="1" stop-color="#234e52"/></linearGradient>
    <linearGradient id="season-glow" x2="0" y2="1"><stop stop-color="#fff0c8" stop-opacity=".55"/><stop offset="1" stop-color="#fff0c8" stop-opacity="0"/></linearGradient>
  </defs>
  <path fill="url(#season-sky)" d="M0 0h1600v500H0z"/>
  <g class="scene-sun"><circle cx="1160" cy="115" r="111" fill="var(--mood-sun)" opacity=".09"/><circle cx="1160" cy="115" r="83" stroke="var(--mood-sun)" opacity=".25"/><circle cx="1160" cy="115" r="62" fill="var(--mood-sun)"/></g>
  <g class="scene-clouds" fill="#f3f0dc"><path d="M790 97c28-48 77-43 98-8 15-55 80-55 100-6 27-21 63-13 72 14Z" opacity=".6"/><path d="M1090 154c18-44 68-48 94-12 29-63 97-48 111-4 40-20 62 0 72 16Z" opacity=".86"/><path d="M395 107c25-33 53-28 75-9 19-50 84-48 109 0 29-11 60-3 76 17H395Z" opacity=".5"/></g>
  <path d="M0 264Q190 244 387 261T764 254T1100 250T1600 251V500H0Z" fill="url(#season-water)"/>
  <path d="m1103 265 125 0 95 169h-310Z" fill="url(#season-glow)" class="scene-reflection"/>
  <path d="M1070 273Q1190 247 1310 266T1600 258V317Q1380 292 1290 309T1070 273Z" fill="var(--mood-palms)" opacity=".55"/>
  <g stroke="#e3efe0" stroke-width="2" opacity=".55" class="scene-ripples"><path d="M-50 305q150-18 300 0t300 0t300 0t300 0t300 0t300 0"/><path d="M-80 349q160-17 320 0t320 0t320 0t320 0t320 0"/><path d="M-50 420q160-20 320 0t320 0t320 0t320 0t320 0"/></g>
  <path d="M0 350Q140 320 340 372T825 355Q1085 300 1260 325T1600 347V500H0Z" fill="#e1c69a"/>
  <path d="M0 390Q190 350 388 397T822 383Q1085 329 1260 354T1600 378V500H0Z" fill="#eed7ad"/>
  <path d="M0 465Q255 407 461 444T978 416Q1181 381 1400 416T1600 425V500H0Z" fill="var(--mood-sea)" opacity=".9"/>
  <path d="M0 457Q255 399 461 436T978 408Q1181 373 1400 408T1600 417" stroke="#f8edce" stroke-width="5" opacity=".7"/>
  <g class="scene-palms" style="color:var(--mood-palms)"><g transform="translate(1390 356)"><g class="scene-palm">${palm}</g></g><g transform="translate(1510 360) scale(.78)"><g class="scene-palm">${palm}</g></g></g>
  <g class="scene-palms-mobile" style="color:var(--mood-palms)" transform="translate(1210 365) scale(.78)"><g class="scene-palm">${palm}</g></g>
  <g transform="translate(890 388) rotate(28)"><path d="M0-62C20-49 21 13 14 51Q0 63-14 51C-21 13-20-49 0-62Z" fill="#fff3d4"/><path d="M-16-12h32v11h-32Zm-1 20h34v7h-34Z" fill="#db7844"/><path d="M0-52v98" stroke="#c9b58c" stroke-width="1"/></g>
  <g stroke="#4f6e68" stroke-width="2" stroke-linecap="round" opacity=".7"><path d="M1001 172q9-10 19 0q9-10 19 0M1048 183q6-7 12 0q6-7 12 0M980 185q5-6 10 0q5-6 10 0"/></g>
  <g class="scene-rain" stroke="#eef8eb" stroke-width="2" opacity=".7">${Array.from({length:28},(_,i)=>`<path d="m${520+(i*97)%1080} ${40+(i*47)%350}-15 38"/>`).join('')}</g>
  <path d="M0 499h1600" stroke="#eed7ad"/>
</svg>`;
