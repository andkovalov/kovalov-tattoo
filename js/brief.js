/* kovalov.tattoo — brief / quiz form JS */
(function () {
  'use strict';

  var TG_USERNAME = 'andkovalov';
  var WA_PHONE    = '420776273563';

  var currentStep = 1;
  var totalSteps  = 4;
  var answers     = { idea: '', location: '', size: '', name: '', contact: '' };
  var stepKeys    = [null, 'idea', 'location', 'size'];

  var lang = document.documentElement.lang || 'ru';
  var isEn = lang.slice(0, 2).toLowerCase() === 'en';

  var stepTitles = isEn
    ? ['Step 1', 'Step 2', 'Step 3', 'Step 4']
    : ['Шаг 1',  'Шаг 2',  'Шаг 3',  'Шаг 4'];

  var HOME = isEn ? '/' : '/ru/';

  var progressFill = document.getElementById('progressFill');
  var stepLabel    = document.getElementById('stepLabel');
  var stepCounter  = document.getElementById('stepCounter');
  var btnBack      = document.getElementById('btnBack');
  var btnClose     = document.getElementById('btnClose');
  var inputName    = document.getElementById('inputName');
  var inputContact = document.getElementById('inputContact');
  var btnTg        = document.getElementById('btnTg');
  var btnWa        = document.getElementById('btnWa');

  /* ── Progress ─────────────────────────────────────────── */
  function updateProgress() {
    if (progressFill) progressFill.style.width = (currentStep / totalSteps * 100) + '%';
    if (stepLabel)    stepLabel.textContent = stepTitles[currentStep - 1];
    if (stepCounter)  stepCounter.textContent = currentStep + ' / ' + totalSteps;
    if (btnBack)      btnBack.classList.toggle('hidden', currentStep === 1);
  }

  /* ── Navigation ───────────────────────────────────────── */
  function goTo(next) {
    if (next < 1 || next > totalSteps) return;
    var curr   = document.getElementById('step-' + currentStep);
    var nextEl = document.getElementById('step-' + next);
    if (!curr || !nextEl) return;
    curr.classList.remove('active');
    curr.classList.add('exit');
    setTimeout(function () {
      curr.classList.remove('exit');
      nextEl.classList.add('active');
      currentStep = next;
      updateProgress();
    }, 300);
  }
  window.goTo = goTo;

  function goBack() {
    if (currentStep <= 1) return;
    var curr = document.getElementById('step-' + currentStep);
    var prev = document.getElementById('step-' + (currentStep - 1));
    if (!curr || !prev) return;
    curr.style.transition = 'none';
    curr.classList.remove('active');
    curr.style.transform = 'translateX(28px)';
    curr.style.opacity = '0';
    setTimeout(function () {
      curr.style.transition = '';
      curr.style.transform  = '';
      curr.style.opacity    = '';
      prev.style.transition = 'none';
      prev.style.transform  = 'translateX(-28px)';
      prev.style.opacity    = '0';
      prev.classList.add('active');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          prev.style.transition = '';
          prev.style.transform  = '';
          prev.style.opacity    = '';
        });
      });
      currentStep--;
      updateProgress();
    }, 30);
  }

  /* ── Step 1: free text ────────────────────────────────── */
  var inputIdea = document.getElementById('input-idea');
  var hintIdea  = document.getElementById('hint-idea');
  var btnNext1  = document.getElementById('btn-next-1');

  function checkStep1() {
    var val = inputIdea ? inputIdea.value.trim() : '';
    if (btnNext1) btnNext1.disabled = val.length === 0;
    if (hintIdea) hintIdea.classList.toggle('show', val.length > 0 && val.length < 10);
    answers.idea = val;
  }
  if (inputIdea) inputIdea.addEventListener('input', checkStep1);

  /* ── Step 3: option cards ─────────────────────────────── */
  [3].forEach(function (s) {
    var stepEl = document.getElementById('step-' + s);
    if (!stepEl) return;
    var cards = stepEl.querySelectorAll('.option-card');
    cards.forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.tagName === 'INPUT') return;
        cards.forEach(function (c) { c.classList.remove('selected'); });
        card.classList.add('selected');
        var val = card.dataset.value;
        var textIn = card.querySelector('.option-text-input');
        if (textIn && textIn.value.trim()) val = textIn.value.trim();
        answers[stepKeys[s]] = val;
        var nextBtn = document.getElementById('btn-next-' + s);
        if (nextBtn) nextBtn.disabled = false;
      });
      var textIn = card.querySelector('.option-text-input');
      if (textIn) {
        textIn.addEventListener('input', function (e) {
          e.stopPropagation();
          answers[stepKeys[s]] = textIn.value.trim() || card.dataset.value;
        });
        textIn.addEventListener('click', function (e) { e.stopPropagation(); });
      }
    });
  });

  /* ── Step 2: location dropdown ────────────────────────── */
  (function () {
    var sel       = document.getElementById('locSelect');
    var trigger   = document.getElementById('locTrigger');
    var menu      = document.getElementById('locMenu');
    var valEl     = document.getElementById('locValue');
    var otherWrap = document.getElementById('locOtherWrap');
    var otherInput= document.getElementById('locOtherInput');
    var nextBtn   = document.getElementById('btn-next-2');
    var chosen    = null;
    if (!sel || !trigger || !menu) return;

    function refresh() {
      var ok = (chosen === '__other') ? (otherInput && otherInput.value.trim().length > 0) : !!chosen;
      if (nextBtn) nextBtn.disabled = !ok;
      if (ok) answers.location = (chosen === '__other' && otherInput) ? otherInput.value.trim() : chosen;
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      sel.classList.toggle('open');
      trigger.setAttribute('aria-expanded', sel.classList.contains('open'));
    });

    menu.querySelectorAll('.quiz-select-opt').forEach(function (opt) {
      opt.addEventListener('click', function () {
        menu.querySelectorAll('.quiz-select-opt').forEach(function (o) { o.classList.remove('selected'); });
        opt.classList.add('selected');
        chosen = opt.dataset.value;
        if (valEl) { valEl.textContent = opt.textContent; valEl.classList.remove('placeholder'); }
        if (otherWrap) otherWrap.classList.toggle('show', chosen === '__other');
        if (chosen === '__other' && otherInput) setTimeout(function () { otherInput.focus(); }, 60);
        sel.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        refresh();
      });
    });

    if (otherInput) otherInput.addEventListener('input', refresh);
    document.addEventListener('click', function () {
      sel.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    });
  })();

  /* ── Step 4: contacts + QR generation ────────────────── */
  var qrTimer = null;

  function updateQrCodes() {
    clearTimeout(qrTimer);
    qrTimer = setTimeout(function () {
      answers.name    = inputName    ? inputName.value.trim()    : '';
      answers.contact = inputContact ? inputContact.value.trim() : '';
      var msg    = buildMessage();
      var QR_API = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=';
      var tgUrl  = 'https://t.me/' + TG_USERNAME + '?text=' + encodeURIComponent(msg);
      var waUrl  = 'https://wa.me/' + WA_PHONE   + '?text=' + encodeURIComponent(msg);
      var imgTg  = document.getElementById('qrImgTg');
      var imgWa  = document.getElementById('qrImgWa');
      var blkTg  = document.getElementById('qrBlockTg');
      var blkWa  = document.getElementById('qrBlockWa');
      var hint   = document.getElementById('qrHint');
      if (imgTg) imgTg.src = QR_API + encodeURIComponent(tgUrl);
      if (imgWa) imgWa.src = QR_API + encodeURIComponent(waUrl);
      if (blkTg) { blkTg.classList.add('visible'); blkTg.removeAttribute('aria-hidden'); }
      if (blkWa) { blkWa.classList.add('visible'); blkWa.removeAttribute('aria-hidden'); }
      if (hint)  { hint.classList.add('visible');  hint.removeAttribute('aria-hidden'); }
    }, 500);
  }

  function checkContacts() {
    var ok = inputName && inputContact &&
             inputName.value.trim().length > 0 &&
             inputContact.value.trim().length > 0;
    if (btnTg) btnTg.disabled = !ok;
    if (btnWa) btnWa.disabled = !ok;
    if (ok) updateQrCodes();
  }
  if (inputName)    inputName.addEventListener('input', checkContacts);
  if (inputContact) inputContact.addEventListener('input', checkContacts);

  /* ── Build message ────────────────────────────────────── */
  function buildMessage() {
    if (isEn) {
      return [
        'Hi! I filled out the brief on kovalov.tattoo.',
        '',
        'Idea: ' + answers.idea,
        'Location: ' + answers.location,
        'Size: ' + answers.size,
        '',
        'My name is ' + answers.name + '.',
        'Contact: ' + answers.contact
      ].join('\n');
    }
    return [
      'Привет! Я заполнил(а) бриф на сайте kovalov.tattoo.',
      '',
      'Идея: ' + answers.idea,
      'Место: ' + answers.location,
      'Размер: ' + answers.size,
      '',
      'Меня зовут ' + answers.name + '.',
      'Контакт: ' + answers.contact
    ].join('\n');
  }

  /* ── Submit ───────────────────────────────────────────── */
  function finishSubmit(url) {
    if (inputName)    answers.name    = inputName.value.trim();
    if (inputContact) answers.contact = inputContact.value.trim();
    var msg = buildMessage();
    try { if (navigator.clipboard) navigator.clipboard.writeText(msg); } catch (e) {}
    window.open(url + encodeURIComponent(msg), '_blank');
    var s = document.getElementById('screen-success');
    if (s) s.classList.add('visible');
    setTimeout(function () { window.location.href = HOME; }, 4500);
  }

  if (btnTg) btnTg.addEventListener('click', function () {
    if (!btnTg.disabled) finishSubmit('https://t.me/' + TG_USERNAME + '?text=');
  });
  if (btnWa) btnWa.addEventListener('click', function () {
    if (!btnWa.disabled) finishSubmit('https://wa.me/' + WA_PHONE + '?text=');
  });

  /* ── Back & Close ─────────────────────────────────────── */
  if (btnBack) btnBack.addEventListener('click', goBack);
  if (btnClose) btnClose.addEventListener('click', function () {
    if (document.referrer) history.back();
    else window.location.href = HOME;
  });

  /* ── Init ─────────────────────────────────────────────── */
  updateProgress();

})();
