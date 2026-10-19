// exit-intent.js — BlockBlast exit overlay (NL)
// Usage: <script src="exit-intent.js"></script> anywhere in your lander
// Triggers on: desktop mouse-leave top, mobile tab-switch / back gesture

(function () {
  'use strict';

  var SHOWN_KEY = 'fc_exit_shown';
  var fired = false;

  // don't show twice per session
  try { if (sessionStorage.getItem(SHOWN_KEY)) return; } catch (e) {}

  // ── inject styles ─────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '#fc-exit-overlay{',
      'position:fixed;inset:0;z-index:2147483647;',
      'background:rgba(0,0,0,.72);',
      'display:flex;align-items:center;justify-content:center;',
      'padding:16px;',
      'opacity:0;transition:opacity .22s ease;',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;',
    '}',
    '#fc-exit-overlay.fc-visible{opacity:1;}',

    '#fc-exit-card{',
      'background:#111118;',
      'border:1px solid rgba(255,255,255,.09);',
      'border-radius:20px;',
      'width:100%;max-width:420px;',
      'overflow:hidden;',
      'transform:translateY(18px) scale(.97);',
      'transition:transform .25s cubic-bezier(.22,1,.36,1);',
      'box-shadow:0 0 60px rgba(245,200,66,.1),0 24px 64px rgba(0,0,0,.7);',
    '}',
    '#fc-exit-overlay.fc-visible #fc-exit-card{',
      'transform:translateY(0) scale(1);',
    '}',

    '#fc-exit-strip{',
      'background:#ff4444;color:#fff;',
      'font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;',
      'padding:9px 20px;text-align:center;',
    '}',

    '#fc-exit-body{',
      'padding:28px 24px 32px;',
      'display:flex;flex-direction:column;align-items:center;gap:20px;',
    '}',

    '#fc-exit-icon{',
      'width:76px;height:76px;border-radius:19px;',
      'background:linear-gradient(135deg,#1a1a2e,#16213e);',
      'border:2px solid #f5c842;',
      'box-shadow:0 0 22px rgba(245,200,66,.28);',
      'display:flex;align-items:center;justify-content:center;',
      'flex-shrink:0;',
    '}',

    '#fc-exit-headline{text-align:center;}',
    '#fc-exit-eyebrow{',
      'font-size:10px;font-weight:700;letter-spacing:.14em;',
      'text-transform:uppercase;color:#f5c842;margin-bottom:6px;',
    '}',
    '#fc-exit-h1{',
      'font-size:clamp(38px,10vw,56px);line-height:.95;',
      'font-weight:900;color:#fff;letter-spacing:.01em;',
    '}',
    '#fc-exit-h1 span{',
      'color:#f5c842;text-shadow:0 0 28px rgba(245,200,66,.35);',
    '}',
    '#fc-exit-sub{',
      'font-size:14px;color:rgba(255,255,255,.55);line-height:1.5;',
      'margin-top:8px;',
    '}',

    '#fc-exit-stat{',
      'display:flex;align-items:center;gap:12px;',
      'background:rgba(0,230,118,.07);',
      'border:1px solid rgba(0,230,118,.2);',
      'border-radius:12px;padding:14px 18px;width:100%;',
    '}',
    '#fc-exit-stat-icon{',
      'width:38px;height:38px;background:rgba(0,230,118,.15);',
      'border-radius:9px;display:flex;align-items:center;justify-content:center;',
      'font-size:18px;flex-shrink:0;',
    '}',
    '#fc-exit-stat-val{',
      'font-size:20px;font-weight:900;color:#00e676;',
      'font-variant-numeric:tabular-nums;line-height:1;',
      'text-shadow:0 0 18px rgba(0,230,118,.3);',
    '}',
    '#fc-exit-stat-lbl{font-size:11px;color:rgba(255,255,255,.5);margin-top:2px;}',

    '#fc-exit-proof{',
      'display:flex;align-items:center;gap:8px;',
      'font-size:12px;color:rgba(255,255,255,.5);',
    '}',
    '.fc-dot{',
      'width:20px;height:20px;border-radius:50%;',
      'border:2px solid #111118;',
      'background:linear-gradient(135deg,#667eea,#764ba2);',
      'display:inline-flex;align-items:center;justify-content:center;',
      'font-size:9px;font-weight:700;color:#fff;margin-right:-5px;',
      'flex-shrink:0;',
    '}',

    '#fc-exit-cta{',
      'display:flex;align-items:center;justify-content:center;gap:8px;',
      'width:100%;background:linear-gradient(135deg,#f5c842,#f0a500);',
      'color:#0a0a0f;font-size:16px;font-weight:900;',
      'padding:17px 20px;border-radius:13px;border:none;cursor:pointer;',
      'box-shadow:0 4px 22px rgba(245,200,66,.35);',
      'transition:transform .12s ease,box-shadow .12s ease;',
      'font-family:inherit;letter-spacing:.01em;',
    '}',
    '#fc-exit-cta:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(245,200,66,.45);}',
    '#fc-exit-cta:active{transform:translateY(0);}',

    '#fc-exit-dismiss{',
      'font-size:12px;color:rgba(255,255,255,.4);',
      'background:none;border:none;cursor:pointer;',
      'font-family:inherit;padding:4px;',
      'transition:color .15s;',
    '}',
    '#fc-exit-dismiss:hover{color:rgba(255,255,255,.7);}',

    '@media(prefers-reduced-motion:reduce){',
      '#fc-exit-overlay,#fc-exit-card{transition:none;}',
    '}'
  ].join('');
  document.head.appendChild(style);

  // ── build overlay HTML ────────────────────────────────────────────────────
  var overlay = document.createElement('div');
  overlay.id = 'fc-exit-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Exclusief aanbod');
  overlay.innerHTML = [
    '<div id="fc-exit-card">',
      '<div id="fc-exit-strip">⚠ Wacht — Exclusief Aanbod</div>',
      '<div id="fc-exit-body">',
        '<div id="fc-exit-icon"><canvas id="fc-exit-canvas" width="52" height="52"></canvas></div>',
        '<div id="fc-exit-headline">',
          '<div id="fc-exit-eyebrow">Voordat je weggaat</div>',
          '<div id="fc-exit-h1">Verdien<br><span>500€</span><br>Per Uur</div>',
          '<div id="fc-exit-sub">BlockBlast-spelers op Freecash verdienen echt geld — geen trucs, geen abonnement.</div>',
        '</div>',
        '<div id="fc-exit-stat">',
          '<div id="fc-exit-stat-icon">💸</div>',
          '<div>',
            '<div id="fc-exit-stat-val">€0.00</div>',
            '<div id="fc-exit-stat-lbl">verdiend door spelers in de laatste 60s</div>',
          '</div>',
        '</div>',
        '<div id="fc-exit-proof">',
          '<span class="fc-dot">A</span><span class="fc-dot">M</span>',
          '<span class="fc-dot">R</span><span class="fc-dot">K</span>',
          '<span style="margin-left:10px">+12.400 actieve spelers nu online</span>',
        '</div>',
        '<button id="fc-exit-cta">Ja, ik wil verdienen &nbsp;→</button>',
        '<button id="fc-exit-dismiss">Nee, ik doe niet mee</button>',
      '</div>',
    '</div>'
  ].join('');
  document.body.appendChild(overlay);

  // ── pixel art icon ────────────────────────────────────────────────────────
  (function () {
    var c = document.getElementById('fc-exit-canvas');
    if (!c) return;
    var ctx = c.getContext('2d');
    var colors = ['#f5c842','#00e676','#ff4444','#42a5f5','#ab47bc','#ff7043'];
    var grid = [[1,1,0,0,2,2],[1,1,0,0,2,2],[0,0,3,3,0,0],[0,0,3,3,0,0],[4,4,0,0,5,5],[4,4,0,0,5,5]];
    var s = 52 / 6;
    grid.forEach(function (row, r) {
      row.forEach(function (cell, col) {
        if (!cell) return;
        ctx.fillStyle = colors[cell - 1];
        ctx.beginPath();
        ctx.roundRect(col * s, r * s, s - 1, s - 1, 2);
        ctx.fill();
      });
    });
  })();

  // ── live counter ──────────────────────────────────────────────────────────
  var counterEl = document.getElementById('fc-exit-stat-val');
  var counterVal = 847.30 + Math.random() * 200;
  var counterTimer = null;
  function tickCounter() {
    counterVal += (Math.random() * 4.5 + 0.5);
    if (counterEl) counterEl.textContent = '€' + counterVal.toFixed(2);
    counterTimer = setTimeout(tickCounter, 800 + Math.random() * 600);
  }

  // ── show / hide ───────────────────────────────────────────────────────────
  function show() {
    if (fired) return;
    fired = true;
    try { sessionStorage.setItem(SHOWN_KEY, '1'); } catch (e) {}
    overlay.style.display = 'flex';
    // force reflow so transition fires
    overlay.getBoundingClientRect();
    overlay.classList.add('fc-visible');
    tickCounter();
  }

  function hide() {
    overlay.classList.remove('fc-visible');
    clearTimeout(counterTimer);
    setTimeout(function () { overlay.style.display = 'none'; }, 250);
  }

  // ── triggers ──────────────────────────────────────────────────────────────

  // desktop: mouse leaves toward top of viewport
  document.addEventListener('mouseleave', function (e) {
    if (e.clientY <= 0) show();
  });

  // mobile / tablet: tab hidden (back button, swipe away, tab switch)
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') show();
  });

  // ── close actions ─────────────────────────────────────────────────────────
  document.getElementById('fc-exit-cta').addEventListener('click', function () {
    hide();
  });
  document.getElementById('fc-exit-dismiss').addEventListener('click', function () {
    hide();
  });
  // click outside card
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) hide();
  });
  // esc key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && fired) hide();
  });

})();
