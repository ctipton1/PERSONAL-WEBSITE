// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
}

// Active nav link (robust)
(function () {
  const links = document.querySelectorAll('[data-nav]');
  if (!links.length) return;

  const norm = (url) => {
    try {
      const u = new URL(url, window.location.origin);
      let p = u.pathname.replace(/\/index\.html$/i, '/');
      if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
      return p.toLowerCase();
    } catch { return (url || '').toLowerCase(); }
  };

  const here = norm(window.location.pathname);
  links.forEach(a => {
    const target = norm(a.getAttribute('href') || '');
    if (here === target || (here === '/' && /index\.html$/i.test(target))) {
      a.classList.add('active');
    }
  });
})();

// Theme toggle with persistence + OS preference
const rootEl = document.documentElement;
const themeBtn = document.getElementById('theme-toggle');
const THEME_KEY = 'pref-theme';

function applyTheme(theme) {
  if (theme === 'dark') {
    rootEl.setAttribute('data-theme', 'dark');
    themeBtn?.setAttribute('aria-pressed', 'true');
  } else {
    rootEl.removeAttribute('data-theme');
    themeBtn?.setAttribute('aria-pressed', 'false');
  }
}

function syncThemeLabel() {
  if (!themeBtn) return;
  const usesIcons = !!themeBtn.querySelector('svg');
  if (usesIcons) return;
  const isDark = rootEl.getAttribute('data-theme') === 'dark';
  themeBtn.textContent = isDark ? 'Light' : 'Dark';
}

// Initial theme: stored > OS
(function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const start = stored || (prefersDark ? 'dark' : 'light');
  applyTheme(start);
  syncThemeLabel();
})();

// Toggle handler
themeBtn?.addEventListener('click', () => {
  const next = rootEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
  syncThemeLabel();
});

// Follow OS changes if no stored pref
const media = window.matchMedia('(prefers-color-scheme: dark)');
media.addEventListener?.('change', (e) => {
  const stored = localStorage.getItem(THEME_KEY);
  if (!stored) {
    applyTheme(e.matches ? 'dark' : 'light');
    syncThemeLabel();
  }
});

(function sortExperience() {
  const wrap = document.querySelector('.xp-cards');
  if (!wrap) return;

  const monthMap = {
    jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,sept:8,oct:9,nov:10,dec:11
  };

  const parseMonthYear = (s) => {
    if (!s) return null;
    const m = s.trim().toLowerCase();
    if (m === 'present' || m === 'current') return new Date(9999, 0, 1);
    const mm = m.match(/([a-z]+)\s+(\d{4})/i);
    if (!mm) return null;
    const mon = monthMap[mm[1].slice(0,3)] ?? monthMap[mm[1]];
    const yr = parseInt(mm[2], 10);
    if (mon == null || isNaN(yr)) return null;
    return new Date(yr, mon, 1);
  };

  const items = Array.from(wrap.querySelectorAll('.xp-card'));
  const meta = items.map(card => {
    const t = card.querySelector('.xp-dates')?.textContent || '';
    // Strip everything after the company separator "·"
    const range = t.split('·')[0].trim();
    // Split on en dash or hyphen
    const parts = range.split(/–|-/).map(v => v.trim());
    const start = parseMonthYear(parts[0]);
    const end = parseMonthYear(parts[1] || parts[0]); // single month role
    const ongoing = /present|current/i.test(range);
    if (ongoing) card.classList.add('current');
    return { card, start, end };
  });

  // Sort: latest end date first, then latest start date
  meta.sort((a,b) => {
    const ae = a.end?.getTime() ?? 0;
    const be = b.end?.getTime() ?? 0;
    if (be !== ae) return be - ae;
    const as = a.start?.getTime() ?? 0;
    const bs = b.start?.getTime() ?? 0;
    return bs - as;
  });

  // Re-append in sorted order
  meta.forEach(({card}) => wrap.appendChild(card));
})();
