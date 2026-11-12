/* Sharique Baig: interactions. No dependencies. */

// ── Mobile navigation ──
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.textContent = open ? 'Close' : 'Menu';
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.textContent = 'Menu';
    });
  });
}

// ── Active section link (home page) ──
const sections = document.querySelectorAll('main section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  sections.forEach(s => spy.observe(s));
}

// ── Case file accordion (projects page) ──
const casePanels = document.querySelectorAll('.case-panel');

casePanels.forEach(panel => {
  const header = panel.querySelector('.accordion-toggle');
  if (!header) return;
  header.setAttribute('role', 'button');
  header.setAttribute('tabindex', '0');
  header.setAttribute('aria-expanded', String(panel.classList.contains('active')));

  const toggle = () => {
    const wasActive = panel.classList.contains('active');
    casePanels.forEach(p => {
      p.classList.remove('active');
      const h = p.querySelector('.accordion-toggle');
      if (h) h.setAttribute('aria-expanded', 'false');
    });
    if (!wasActive) {
      panel.classList.add('active');
      header.setAttribute('aria-expanded', 'true');
    }
  };
  header.addEventListener('click', toggle);
  header.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
});

// Deep links: projects.html?tab=caseN
const tabParam = new URLSearchParams(window.location.search).get('tab');
if (tabParam) {
  const target = document.getElementById(tabParam);
  if (target && target.classList.contains('case-panel')) {
    casePanels.forEach(p => p.classList.remove('active'));
    target.classList.add('active');
    const h = target.querySelector('.accordion-toggle');
    if (h) h.setAttribute('aria-expanded', 'true');
    setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  }
}

// ── Case file filters ──
const filters = document.querySelectorAll('.filter');
filters.forEach(btn => {
  btn.addEventListener('click', () => {
    const kind = btn.dataset.kind;
    filters.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    casePanels.forEach(p => { p.hidden = kind !== 'all' && p.dataset.kind !== kind; });
  });
});

// ── Copy email ──
const copyBtn = document.getElementById('copyEmail');
const copyNote = document.getElementById('copyNote');
const emailAddress = 'shariquebaig0@gmail.com';

if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(emailAddress).then(() => {
      if (copyNote) {
        copyNote.textContent = 'Copied';
        setTimeout(() => { copyNote.textContent = ''; }, 2000);
      }
    }).catch(() => {
      if (copyNote) copyNote.textContent = emailAddress;
    });
  });
}

// ── Motion (content stays visible without JS or with reduced motion) ──
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll progress line under the header
  const header = document.querySelector('.site-header');
  if (header && !reduce) {
    const bar = document.createElement('div');
    bar.className = 'progress';
    bar.setAttribute('aria-hidden', 'true');
    header.appendChild(bar);
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(scrollY / max, 1) : 0) + ')';
    };
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
  }

  if (reduce || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.sec, [data-reveal]').forEach(el => el.classList.add('in'));
    return;
  }

  // Elements that rise into place, staggered within their group
  const groups = [
    '.sec-head', '.halves .half', '.bridge', '.figures > div',
    '.ledger tbody tr', '.xp-row', '.step', '.tool-cols > div', '.creds .cred',
    '.page-head > .container > *', '.case-panel', '.contact .container > *'
  ];
  groups.forEach(sel => {
    const seen = new Map();
    document.querySelectorAll(sel).forEach(el => {
      el.setAttribute('data-reveal', '');
      const p = el.parentElement;
      const i = seen.get(p) || 0;
      seen.set(p, i + 1);
      el.style.setProperty('--d', Math.min(i, 5) * 70 + 'ms');
    });
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
      if (entry.target.classList.contains('figures')) countUp(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll('.sec, [data-reveal]').forEach(el => io.observe(el));

  // Panels revealed later by the case filter should not stay hidden
  document.querySelectorAll('.filter').forEach(btn =>
    btn.addEventListener('click', () => document.querySelectorAll('.case-panel').forEach(p => p.classList.add('in'))));

  // Figures count up once
  const figs = document.querySelector('.figures');
  if (figs) {
    const fio = new IntersectionObserver(es => {
      if (es[0].isIntersecting) { countUp(figs); fio.disconnect(); }
    }, { threshold: 0.6 });
    fio.observe(figs);
  }
  function countUp(root) {
    if (root.dataset.counted) return;
    root.dataset.counted = '1';
    root.querySelectorAll('b').forEach(b => {
      const m = b.textContent.match(/^(\d+)(.*)$/);
      if (!m) return;
      const end = parseInt(m[1], 10), suffix = m[2], t0 = performance.now(), dur = 1300;
      const tick = now => {
        const k = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - k, 4);
        b.textContent = Math.round(end * e) + suffix;
        if (k < 1) requestAnimationFrame(tick);
      };
      b.textContent = '0' + suffix;
      requestAnimationFrame(tick);
    });
  }
})();


// ── Findings window (hero): rotates on desktop, swipeable row on phones ──
(function () {
  const sheet = document.getElementById('findingSheet');
  if (!sheet) return;
  const slides = [...sheet.querySelectorAll('.slide')];
  const dots = [...document.querySelectorAll('.sheet-dots .dot')];
  const bar = sheet.querySelector('.sheet-progress');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = window.matchMedia('(max-width: 640px)');
  const DWELL = 8000;
  let i = 0, timer = null, remaining = DWELL, startedAt = 0, paused = false;

  function setDots(n) { dots.forEach((d, k) => d.setAttribute('aria-current', String(k === n))); }

  function show(n) {
    i = (n + slides.length) % slides.length;
    if (phone.matches) {
      const pad = parseFloat(getComputedStyle(sheet).paddingLeft) || 0;
      sheet.scrollTo({ left: slides[i].offsetLeft - pad, behavior: 'smooth' });
      setDots(i);
      return;
    }
    slides.forEach((s, k) => {
      s.classList.toggle('is-active', k === i);
      s.setAttribute('aria-hidden', String(k !== i));
    });
    setDots(i);
    restartBar();
  }
  function restartBar() {
    if (!bar || reduce || phone.matches) return;
    bar.classList.remove('run', 'paused');
    void bar.offsetWidth;
    bar.style.setProperty('--dwell', DWELL + 'ms');
    bar.classList.add('run');
    if (paused) bar.classList.add('paused');
  }
  function arm(ms) {
    clearTimeout(timer);
    remaining = ms;
    if (reduce || paused || phone.matches) return;
    startedAt = performance.now();
    timer = setTimeout(() => { show(i + 1); arm(DWELL); }, ms);
  }
  function pause() {
    if (paused || reduce || phone.matches) return;
    paused = true;
    clearTimeout(timer);
    remaining = Math.max(remaining - (performance.now() - startedAt), 0);
    if (bar) bar.classList.add('paused');
  }
  function resume() {
    if (!paused || reduce || phone.matches) return;
    paused = false;
    if (bar) bar.classList.remove('paused');
    arm(remaining);
  }

  function applyMode() {
    clearTimeout(timer);
    paused = false;
    if (phone.matches) {
      slides.forEach(s => { s.classList.add('is-active'); s.removeAttribute('aria-hidden'); });
      sheet.scrollLeft = 0; i = 0; setDots(0);
    } else {
      show(0); arm(DWELL);
    }
  }

  dots.forEach((d, k) => d.addEventListener('click', () => { show(k); arm(DWELL); }));
  sheet.addEventListener('scroll', () => {
    if (!phone.matches || slides.length < 2) return;
    const step = slides[1].offsetLeft - slides[0].offsetLeft;
    i = Math.max(0, Math.min(slides.length - 1, Math.round(sheet.scrollLeft / step)));
    setDots(i);
  }, { passive: true });

  const wrap = sheet.parentElement;
  wrap.addEventListener('mouseenter', pause);
  wrap.addEventListener('mouseleave', resume);
  wrap.addEventListener('focusin', pause);
  wrap.addEventListener('focusout', resume);
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : resume()));
  phone.addEventListener('change', applyMode);

  slides.forEach((s, k) => s.setAttribute('aria-hidden', String(k !== 0)));
  applyMode();
})();

// ── Blind spots: hover (mouse) or tap the button to see what one half alone misses ──
(function () {
  const wrap = document.getElementById('halves');
  if (!wrap) return;
  const halves = [...wrap.querySelectorAll('.half')];
  let leaveTimer = null;

  function setActive(half) {
    halves.forEach(h => {
      const on = h === half;
      h.classList.toggle('show-blind', on);
      h.querySelector('.blind').setAttribute('aria-hidden', String(!on));
      h.querySelector('.blind-toggle').setAttribute('aria-expanded', String(on));
    });
    if (half) wrap.dataset.active = half.dataset.half; else delete wrap.dataset.active;
  }

  halves.forEach(h => {
    h.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(leaveTimer);
      setActive(h);
    });
    h.addEventListener('pointerleave', e => {
      if (e.pointerType !== 'mouse') return;
      leaveTimer = setTimeout(() => setActive(null), 120);
    });
    h.querySelector('.blind-toggle').addEventListener('click', () => {
      setActive(h.classList.contains('show-blind') ? null : h);
    });
    h.querySelector('.blind-close').addEventListener('click', () => {
      setActive(null);
      h.querySelector('.blind-toggle').focus();
    });
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setActive(null); });
})();

// ── Process steps light up in order while the section is on screen ──
(function () {
  const list = document.querySelector('.steps');
  if (!list || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const steps = [...list.querySelectorAll('.step')];
  const DWELL = 2600, HOLD = 2600;
  list.style.setProperty('--dwell', DWELL + 'ms');
  let i = -1, timer = null, remaining = 0, startedAt = 0, paused = false, visible = false;

  function clearAll() { steps.forEach(s => s.classList.remove('on', 'done')); }
  function advance() {
    if (i >= 0) { steps[i].classList.remove('on'); steps[i].classList.add('done'); }
    i += 1;
    if (i >= steps.length) {          // all done: hold, then start over
      i = -1;
      arm(HOLD, () => { clearAll(); advance(); });
      return;
    }
    steps[i].classList.add('on');
    arm(DWELL, advance);
  }
  function arm(ms, fn) {
    clearTimeout(timer);
    remaining = ms; startedAt = performance.now(); next = fn;
    if (!paused && visible) timer = setTimeout(fn, ms);
  }
  let next = advance;
  function pause() {
    if (paused) return;
    paused = true; clearTimeout(timer);
    remaining = Math.max(remaining - (performance.now() - startedAt), 0);
    list.classList.add('paused');
  }
  function resume() {
    if (!paused) return;
    paused = false; list.classList.remove('paused');
    if (visible) { startedAt = performance.now(); timer = setTimeout(next, remaining); }
  }

  new IntersectionObserver(es => {
    const now = es[0].isIntersecting;
    if (now && !visible) {
      visible = true;
      if (i === -1 && !steps.some(s => s.classList.contains('on'))) { clearAll(); list.classList.add('playing'); advance(); }
      else if (!paused) { startedAt = performance.now(); timer = setTimeout(next, remaining); }
    } else if (!now && visible) {
      visible = false;
      clearTimeout(timer);
      remaining = Math.max(remaining - (performance.now() - startedAt), 0);
      list.classList.add('paused');
    }
    if (now) list.classList.remove('paused');
  }, { threshold: 0, rootMargin: '-25% 0px -25% 0px' }).observe(list);

})();


// ── Phone extras: Break/Build tabs, expandable engagements, bottom action bar ──
(function () {
  const phone = window.matchMedia('(max-width: 640px)');

  // Break / Build tabs
  const halves = document.getElementById('halves');
  const tabs = document.querySelectorAll('.halves-tabs button');
  if (halves && tabs.length) {
    halves.dataset.tab = 'break';
    tabs.forEach(t => t.addEventListener('click', () => {
      halves.dataset.tab = t.dataset.tab;
      tabs.forEach(b => b.setAttribute('aria-pressed', String(b === t)));
      // a panel left open on the other half should not linger
      halves.querySelectorAll('.half.show-blind').forEach(h => h.classList.remove('show-blind'));
      delete halves.dataset.active;
    }));
  }

  // Engagement rows expand on tap (phone only; desktop shows everything)
  document.querySelectorAll('#engagements .ledger tbody tr').forEach(tr => {
    tr.setAttribute('tabindex', '0');
    const toggle = () => { if (phone.matches) { tr.classList.toggle('open'); tr.setAttribute('aria-expanded', String(tr.classList.contains('open'))); } };
    tr.addEventListener('click', toggle);
    tr.addEventListener('keydown', e => { if (phone.matches && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(); } });
  });

  // Bottom action bar
  const onProjects = /projects/.test(location.pathname);
  const dock = document.createElement('nav');
  dock.className = 'dock hide';
  dock.setAttribute('aria-label', 'Quick actions');
  dock.innerHTML = (onProjects ? '<a href="index.html">Home</a>' : '<a href="projects.html">Case files</a>') +
    '<a class="primary" href="https://calendly.com/shariquebaig/new-meeting" target="_blank" rel="noopener">Book a call</a>';
  document.body.appendChild(dock);

  const blockers = new Set();
  function sync() { dock.classList.toggle('hide', blockers.size > 0); }
  function watch(el, key, showWhenVisible) {
    if (!el || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(es => {
      const visible = es[0].isIntersecting;
      if (visible === showWhenVisible) blockers.add(key); else blockers.delete(key);
      sync();
    }).observe(el);
  }
  // hidden while the hero buttons or the contact section are already on screen
  watch(document.querySelector('.hero-actions'), 'hero', true);
  watch(document.getElementById('contact'), 'contact', true);
  const nav = document.getElementById('navLinks');
  if (nav) new MutationObserver(() => { if (nav.classList.contains('open')) blockers.add('menu'); else blockers.delete('menu'); sync(); })
    .observe(nav, { attributes: true, attributeFilter: ['class'] });
  if (!document.querySelector('.hero-actions')) { /* projects page: show immediately */ sync(); }
})();
