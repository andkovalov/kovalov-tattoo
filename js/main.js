/* kovalov.tattoo — main page JS */
(function () {
  'use strict';

  /* ── Prague clock ─────────────────────────────────────── */
  var clockEl = document.getElementById('clock');
  function updateClock() {
    if (!clockEl) return;
    var now = new Date();
    var prg = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Prague' }));
    var h = String(prg.getHours()).padStart(2, '0');
    var m = String(prg.getMinutes()).padStart(2, '0');
    var city = clockEl.dataset.city || 'Praha';
    clockEl.textContent = city + ' ' + h + ':' + m;
  }
  updateClock();
  setInterval(updateClock, 10000);

  /* ── Scroll progress bar ──────────────────────────────── */
  var progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    window.addEventListener('scroll', function () {
      var docH = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      progressBar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ── Sticky nav ───────────────────────────────────────── */
  var nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* ── Scroll reveal ────────────────────────────────────── */
  var revealEls = document.querySelectorAll('.r');
  if (revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ── Portfolio filter + load more ────────────────────── */
  var filterBtns  = document.querySelectorAll('.filter-btn');
  var filterOpts  = document.querySelectorAll('.filter-opt');
  var cells       = document.querySelectorAll('.portfolio-cell');
  var filterSelect = document.getElementById('filterSelect');
  var filterBtn   = document.getElementById('filterBtn');
  var filterLabel = document.getElementById('filterLabel');
  var seeMore     = document.getElementById('seeMore');
  var seeMoreRow  = document.querySelector('.see-more-row');
  var BATCH = 6;
  var currentFilter = 'all';
  var shown = BATCH;

  function renderPortfolio() {
    var matchIndex = 0, totalMatch = 0;
    cells.forEach(function (cell) {
      var matches = (currentFilter === 'all' || cell.dataset.style === currentFilter);
      if (matches) {
        totalMatch++;
        cell.classList.toggle('hidden', matchIndex >= shown);
        matchIndex++;
      } else {
        cell.classList.add('hidden');
      }
    });
    if (seeMoreRow) seeMoreRow.style.display = (shown < totalMatch) ? '' : 'none';
  }

  function applyFilter(f, label) {
    currentFilter = f; shown = BATCH;
    filterBtns.forEach(function (b) { b.classList.toggle('active', b.dataset.f === f); });
    filterOpts.forEach(function (o) { o.classList.toggle('active', o.dataset.f === f); });
    if (filterLabel && label) filterLabel.textContent = label;
    renderPortfolio();
  }

  if (seeMore) {
    seeMore.addEventListener('click', function (e) { e.preventDefault(); shown += BATCH; renderPortfolio(); });
  }
  renderPortfolio();

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () { applyFilter(btn.dataset.f, btn.textContent.trim()); });
  });
  filterOpts.forEach(function (opt) {
    opt.addEventListener('click', function () {
      applyFilter(opt.dataset.f, opt.textContent.trim());
      if (filterSelect) filterSelect.classList.remove('open');
      if (filterBtn) filterBtn.setAttribute('aria-expanded', 'false');
    });
  });
  if (filterBtn && filterSelect) {
    filterBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = filterSelect.classList.toggle('open');
      filterBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function () {
      filterSelect.classList.remove('open');
      if (filterBtn) filterBtn.setAttribute('aria-expanded', 'false');
    });
  }

  /* ── Language switcher ────────────────────────────────── */
  var langSwitcher = document.getElementById('langSwitcher');
  var langBtn      = document.getElementById('langBtn');
  var langLabel    = document.getElementById('langLabel');
  var LANGS = {
    ru: { code: 'RU', file: '/' },
    en: { code: 'EN', file: '/en/' },
    cs: { code: 'CS', file: '/cs/' }
  };
  var curLang = (document.documentElement.lang || 'ru').slice(0, 2).toLowerCase();
  if (!LANGS[curLang]) curLang = 'ru';

  if (langLabel) langLabel.textContent = LANGS[curLang].code;
  document.querySelectorAll('.lang-option').forEach(function (opt) {
    var isActive = opt.dataset.code === LANGS[curLang].code;
    opt.classList.toggle('active', isActive);
    var dot = opt.querySelector('.lang-dot');
    if (isActive && !dot) { dot = document.createElement('span'); dot.className = 'lang-dot'; opt.appendChild(dot); }
    if (!isActive && dot) dot.remove();
  });

  if (langBtn && langSwitcher) {
    langBtn.addEventListener('click', function (e) { e.stopPropagation(); langSwitcher.classList.toggle('open'); });
  }
  document.querySelectorAll('.lang-option').forEach(function (opt) {
    opt.addEventListener('click', function () {
      var code = opt.dataset.code;
      var key = Object.keys(LANGS).filter(function (k) { return LANGS[k].code === code; })[0];
      if (key && key !== curLang) window.location.href = LANGS[key].file;
      if (langSwitcher) langSwitcher.classList.remove('open');
    });
  });
  document.addEventListener('click', function () { if (langSwitcher) langSwitcher.classList.remove('open'); });

  /* ── Mobile menu ──────────────────────────────────────── */
  (function () {
    var burger = document.getElementById('navBurger');
    var menu   = document.getElementById('mobileMenu');
    if (!burger || !menu) return;
    function setOpen(open) {
      burger.classList.toggle('open', open);
      menu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.body.classList.toggle('menu-locked', open);
    }
    burger.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!menu.classList.contains('open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    menu.addEventListener('click', function (e) { if (e.target === menu) setOpen(false); });
  })();

  /* ── FAQ accordion ────────────────────────────────────── */
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (el) {
        el.classList.remove('open');
        var a = el.querySelector('.faq-answer');
        if (a) a.style.maxHeight = '';
      });
      if (!isOpen) {
        item.classList.add('open');
        var ans = item.querySelector('.faq-answer');
        var inner = ans.querySelector('.faq-answer-inner');
        ans.style.maxHeight = inner.scrollHeight + 'px';
      }
    });
  });

  /* ── Portfolio loupe (desktop only) ──────────────────── */
  (function () {
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var ZOOM = 2.5, LENS = 200;
    var grid = document.getElementById('portfolio-grid');
    if (!grid) return;

    var lens    = document.createElement('div');
    lens.className = 'loupe';
    var lensImg = document.createElement('img');
    lens.appendChild(lensImg);
    document.body.appendChild(lens);

    var active = null;
    function slotSrc(cell) {
      var img = cell.querySelector('.portfolio-img');
      return img && img.src ? img.src : null;
    }
    function hide() {
      if (!active) return;
      active.classList.remove('loupe-active');
      active = null;
      lens.classList.remove('visible');
    }

    grid.querySelectorAll('.portfolio-cell').forEach(function (cell) {
      cell.addEventListener('mouseenter', function () {
        var src = slotSrc(cell);
        if (!src) return;
        active = cell;
        if (lensImg.src !== src) lensImg.src = src;
        cell.classList.add('loupe-active');
        lens.classList.add('visible');
      });
      cell.addEventListener('mouseleave', function () { if (active === cell) hide(); });
      cell.addEventListener('mousemove', function (e) {
        if (active !== cell) return;
        var r  = cell.getBoundingClientRect();
        var mx = e.clientX - r.left;
        var my = e.clientY - r.top;
        var boxW = r.width * ZOOM, boxH = r.height * ZOOM;
        lensImg.style.width  = boxW + 'px';
        lensImg.style.height = boxH + 'px';
        var tx = Math.min(0, Math.max(LENS - boxW, LENS / 2 - mx * ZOOM));
        var ty = Math.min(0, Math.max(LENS - boxH, LENS / 2 - my * ZOOM));
        lensImg.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
        lens.style.left = (e.clientX - LENS / 2) + 'px';
        lens.style.top  = (e.clientY - LENS / 2) + 'px';
      });
    });
    window.addEventListener('scroll', hide, { passive: true });
  })();

  /* ── Flash marquee (seamless loop) ───────────────────── */
  (function () {
    var track = document.getElementById('flashTrack');
    if (!track) return;
    var base = Array.prototype.slice.call(track.children);
    var unit = base.length * (184 + 16);
    var copies = Math.max(2, Math.ceil((window.innerWidth * 2) / unit));
    if (copies % 2) copies++;
    for (var i = 1; i < copies; i++) {
      base.forEach(function (card) {
        var clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
    }
  })();

  /* ── Cookie consent (GDPR) ───────────────────────────── */
  (function () {
    var CONSENT_KEY = 'kt_cookie_consent_v1';
    var i18n = {
      RU: {
        title: 'Cookies',
        text: 'Мы используем файлы cookie для корректной работы сайта (необходимые), измерения посещаемости (аналитика) и показа релевантного контента (маркетинг). Необходимые cookie включены всегда. Нажимая «Принять все», вы даёте согласие на аналитические и маркетинговые cookie; «Отклонить» оставит только необходимые. Подробнее в {policy}.',
        accept: 'Принять все',
        reject: 'Отклонить',
        policy: 'политике cookie',
        policyFile: 'privacy.html',
        settings: 'Настройки cookie'
      },
      EN: {
        title: 'Cookies',
        text: 'We use cookies to make the site work (necessary), to measure traffic (analytics) and to show relevant content (marketing). Necessary cookies are always on. Click "Accept all" to consent to analytics and marketing cookies; "Reject" keeps only the necessary ones. More in our {policy}.',
        accept: 'Accept all',
        reject: 'Reject',
        policy: 'cookie policy',
        policyFile: 'privacy.html',
        settings: 'Cookie settings'
      },
      CS: {
        title: 'Cookies',
        text: 'Používáme soubory cookie pro správný chod webu (nezbytné), měření návštěvnosti (analytika) a zobrazení relevantního obsahu (marketing). Nezbytné cookies jsou vždy aktivní. Kliknutím na „Přijmout vše" souhlasíte s analytickými a marketingovými cookies; „Odmítnout" ponechá pouze nezbytné. Více v {policy}.',
        accept: 'Přijmout vše',
        reject: 'Odmítnout',
        policy: 'zásadách cookies',
        policyFile: 'privacy.html',
        settings: 'Nastavení cookies'
      }
    };

    var cc        = document.getElementById('cookieConsent');
    if (!cc) return;
    var titleEl   = document.getElementById('ccTitle');
    var textEl    = document.getElementById('ccText');
    var acceptEl  = document.getElementById('ccAccept');
    var rejectEl  = document.getElementById('ccReject');
    var footerLink = document.getElementById('ccSettingsLink');
    var docEl     = document.documentElement;

    function currentLang() {
      var el = document.getElementById('langLabel');
      var code = el ? el.textContent.trim() : 'RU';
      return i18n[code] ? code : 'RU';
    }
    function render(lang) {
      var t = i18n[lang] || i18n.RU;
      if (titleEl) titleEl.textContent = t.title;
      if (textEl) textEl.innerHTML = t.text.replace(
        '{policy}',
        '<a href="' + t.policyFile + '" rel="nofollow">' + t.policy + '</a>'
      );
      if (acceptEl) acceptEl.textContent = t.accept;
      if (rejectEl) rejectEl.textContent = t.reject;
      if (footerLink) footerLink.textContent = t.settings;
    }
    function lock()   { docEl.classList.add('cc-locked'); document.body.classList.add('cc-locked'); }
    function unlock() { docEl.classList.remove('cc-locked'); document.body.classList.remove('cc-locked'); }
    function openBanner() { render(currentLang()); cc.hidden = false; lock(); }
    function closeBanner() { cc.hidden = true; unlock(); }
    function save(consent) {
      var data = { necessary: true, analytics: consent, marketing: consent, ts: Date.now(), v: 1 };
      try { localStorage.setItem(CONSENT_KEY, JSON.stringify(data)); } catch (e) {}
      try { window.dispatchEvent(new CustomEvent('cookieconsent', { detail: data })); } catch (e) {}
      closeBanner();
    }

    if (acceptEl) acceptEl.addEventListener('click', function () { save(true); });
    if (rejectEl) rejectEl.addEventListener('click', function () { save(false); });

    document.querySelectorAll('.lang-option').forEach(function (opt) {
      opt.addEventListener('click', function () { render(opt.dataset.code); });
    });
    if (footerLink) {
      footerLink.addEventListener('click', function (e) { e.preventDefault(); openBanner(); });
    }

    var stored = null;
    try { stored = JSON.parse(localStorage.getItem(CONSENT_KEY)); } catch (e) {}
    render(currentLang());
    if (!stored) openBanner(); else closeBanner();
  })();

})();
