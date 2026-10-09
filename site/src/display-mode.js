export function initDisplayMode() {
  const root = document.documentElement;
  const system = matchMedia('(prefers-color-scheme: dark)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const button = document.querySelector('.display-switch');
  let choice = 'auto', transitioning = false;
  try { const saved = localStorage.getItem('surfbrothers-theme'); if (['auto', 'sun', 'surf'].includes(saved)) choice = saved; } catch {}
  const current = () => choice === 'auto' ? system.matches ? 'surf' : 'sun' : choice;
  function paint() {
    const theme = current();
    root.dataset.theme = theme;
    button.querySelector('.mode-glyph').textContent = theme === 'surf' ? '☾' : '☼';
    button.querySelector('.mode-name').textContent = theme === 'surf' ? 'Surf' : 'Sun';
    button.setAttribute('aria-label', `Switch to ${theme === 'surf' ? 'Sun' : 'Surf'} mode`);
    button.setAttribute('aria-pressed', String(theme === 'surf'));
    button.title = theme === 'surf' ? 'Switch to Sun mode' : 'Switch to Surf mode';
    document.querySelector('meta[name="theme-color"]').content = theme === 'surf' ? '#081f25' : '#f5f0e5';
  }
  const tide = document.createElement('div');
  tide.className = 'theme-tide';
  tide.setAttribute('aria-hidden', 'true');
  tide.innerHTML = '<div class="theme-water"><svg viewBox="0 0 1440 150" preserveAspectRatio="none"><path class="theme-foam" d="M0 85Q180 0 360 65T720 55T1080 60T1440 55V150H0Z"/><path d="M0 100Q180 20 360 80T720 70T1080 75T1440 70V150H0Z"/></svg><span>≈</span></div>';
  document.body.append(tide);
  let paintTimer, endTimer;
  function finish() {
    clearTimeout(paintTimer); clearTimeout(endTimer);
    paint();
    tide.classList.remove('is-running');
    transitioning = false;
    button.removeAttribute('aria-busy');
  }
  button.addEventListener('click', () => {
    if (transitioning) return;
    choice = current() === 'surf' ? 'sun' : 'surf';
    try { localStorage.setItem('surfbrothers-theme', choice); } catch {}
    if (reduced.matches || root.dataset.reducedMotion === 'true') { paint(); return; }
    transitioning = true;
    button.setAttribute('aria-busy', 'true');
    tide.style.setProperty('--tide-colour', choice === 'surf' ? '#0d393e' : '#f3dfb6');
    tide.style.setProperty('--foam-colour', choice === 'surf' ? '#82b9ad' : '#ffb67c');
    tide.classList.add('is-running');
    // Change the surfaces while the crest covers the view, then let it recede.
    paintTimer = setTimeout(paint, 460);
    endTimer = setTimeout(finish, 1050);
  });
  system.addEventListener('change', () => { if (choice === 'auto') paint(); });
  reduced.addEventListener('change', () => { if (reduced.matches && transitioning) finish(); });
  window.addEventListener('pagehide', finish);
  paint();
}
