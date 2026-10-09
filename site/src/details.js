import './details.css';

// Short, user-triggered details only. No cursor-following loop, audio or analytics.
export function initDetails({ reduced }) {
  const root = document.documentElement;
  const splashes = new Set();
  const timers = new Set();
  let lastSplash = 0, secretIndex = 0, keys = '', lastKey = 0, toastTimer;
  const effectLayer = document.createElement('div');
  effectLayer.className = 'water-effects';
  effectLayer.setAttribute('aria-hidden', 'true');
  document.body.append(effectLayer);
  const toast = document.createElement('div');
  toast.className = 'ocean-whisper';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.hidden = true;
  document.body.append(toast);
  const later = (fn, delay) => {
    const id = setTimeout(() => { timers.delete(id); fn(); }, delay);
    timers.add(id);
    return id;
  };
  function splash(x, y, big = false) {
    if (reduced() || document.hidden) return;
    while (splashes.size >= 3) {
      const oldest = splashes.values().next().value;
      oldest.remove(); splashes.delete(oldest);
    }
    const effect = document.createElement('div');
    effect.className = `water-splash${big ? ' is-big' : ''}`;
    effect.setAttribute('aria-hidden', 'true');
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    effect.innerHTML = '<span class="water-ring"></span><span class="water-ring second"></span>';
    for (let i = 0; i < 12; i++) {
      const drop = document.createElement('span');
      drop.className = 'water-flight';
      const side = i < 6 ? -1 : 1;
      drop.style.setProperty('--dx', `${side * (18 + (i % 6) * 12)}px`);
      drop.style.setProperty('--rise', `${-24 - (i % 4) * 14}px`);
      drop.style.setProperty('--fall', `${30 + (i % 3) * 11}px`);
      drop.style.setProperty('--drop-size', `${3 + i % 4}px`);
      drop.style.setProperty('--delay', `${(i % 3) * 14}ms`);
      drop.innerHTML = '<i></i>';
      effect.append(drop);
    }
    effectLayer.append(effect);
    splashes.add(effect);
    later(() => { effect.remove(); splashes.delete(effect); }, 950);
  }
  function whisper(message) {
    clearTimeout(toastTimer);
    timers.delete(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = later(() => { toast.hidden = true; }, 4200);
  }
  function onPointer(event) {
    if (event.button !== 0 || reduced()) return;
    if (!event.target.closest('.hero-photo, .journey-stage, .board-study')) return;
    if (event.target.closest('a, button, input, select, textarea, summary')) return;
    const now = performance.now();
    if (now - lastSplash < 110) return;
    lastSplash = now;
    splash(event.clientX, event.clientY);
  }
  const shell = document.querySelector('.shell-secret');
  function onShell() {
    const messages = [
      'A little ocean secret: the best plan is sometimes no plan.',
      'You found the slow lane. Stay a little.',
      'Stay. Surf. Belong. There’s room for your story, too.',
    ];
    whisper(messages[secretIndex++ % messages.length]);
    const r = shell.getBoundingClientRect();
    splash(r.left + r.width / 2, r.top + r.height / 2, true);
  }
  function onKey(event) {
    if (event.key === 'Escape') { toast.hidden = true; keys = ''; return; }
    if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input, textarea, select, button, a, [contenteditable], [role="textbox"]')) return;
    if (!/^[a-z]$/i.test(event.key)) return;
    const now = performance.now();
    keys = (now - lastKey > 1800 ? '' : keys) + event.key.toLowerCase();
    keys = keys.slice(-4); lastKey = now;
    if (keys === 'surf') {
      keys = '';
      whisper('You found your sea legs. See you in Mulki.');
      splash(innerWidth / 2, innerHeight * .62, true);
      root.classList.add('secret-sun');
      later(() => root.classList.remove('secret-sun'), 1100);
    }
  }
  document.addEventListener('pointerdown', onPointer, { passive: true });
  document.addEventListener('keydown', onKey);
  shell.addEventListener('click', onShell);
  return () => {
    document.removeEventListener('pointerdown', onPointer);
    document.removeEventListener('keydown', onKey);
    shell.removeEventListener('click', onShell);
    timers.forEach(clearTimeout); timers.clear();
    splashes.forEach(el => el.remove()); splashes.clear();
    effectLayer.remove();
    toast.hidden = true;
    toast.remove();
    root.classList.remove('secret-sun');
  };
}
