/* =========================================================
   АССА — интерактив главной страницы
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------
     1. Меню
     ------------------------------------------------------ */
  var menuBtn = document.getElementById('menuBtn');
  var menu = document.getElementById('mainMenu');

  function openMenu() {
    menu.hidden = false;
    // даём браузеру кадр, чтобы сработал transition
    requestAnimationFrame(function () { menu.classList.add('is-open'); });
    menuBtn.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    setTimeout(function () {
      if (!menu.classList.contains('is-open')) menu.hidden = true;
    }, 350);
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.hidden ? openMenu() : closeMenu();
    });
    document.addEventListener('click', function (e) {
      if (!menu.hidden && !menu.contains(e.target) && e.target !== menuBtn) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) closeMenu();
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeMenu();
    });
  }

  /* ------------------------------------------------------
     2. Липкая шапка
     ------------------------------------------------------ */
  var topbar = document.querySelector('.topbar');
  var lastStuck = null;
  function onScroll() {
    var stuck = window.scrollY > 70;
    if (stuck !== lastStuck) {
      topbar.classList.toggle('is-stuck', stuck);
      lastStuck = stuck;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------
     3. Появление секций при прокрутке
     ------------------------------------------------------ */
  var reveals = document.querySelectorAll('.reveal');

  /* задержка каждого слоя внутри своей секции — блоки проявляются по очереди */
  Array.prototype.forEach.call(document.querySelectorAll('.intro, .sec, .hero'), function (sec) {
    var layers = sec.classList.contains('reveal') ? [sec] : [];
    layers = layers.concat(Array.prototype.slice.call(sec.querySelectorAll('.reveal')));
    layers.forEach(function (el, i) {
      el.style.setProperty('--rd', (i * 0.13).toFixed(2) + 's');
    });
  });

  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -10% 0px' });
    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
    // страховка: если наблюдатель по какой-то причине не сработал — показываем всё
    setTimeout(function () {
      Array.prototype.forEach.call(reveals, function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in');
      });
    }, 2500);
  }

  /* ------------------------------------------------------
     4. Круглые картинки — мягкое движение за курсором
     ------------------------------------------------------ */
  var canHover = window.matchMedia('(hover: hover)').matches;
  if (canHover && !reduced) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-tilt]'), function (wrap) {
      var el = wrap.querySelector('.circle');
      if (!el) return;

      function set(tx, ty, rx, ry, sc) {
        el.style.setProperty('--tx', tx.toFixed(2) + 'px');
        el.style.setProperty('--ty', ty.toFixed(2) + 'px');
        el.style.setProperty('--rx', rx.toFixed(2) + 'deg');
        el.style.setProperty('--ry', ry.toFixed(2) + 'deg');
        el.style.setProperty('--sc', sc.toFixed(4));
      }

      wrap.addEventListener('mousemove', function (e) {
        var r = wrap.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;   // -0.5 … 0.5
        var py = (e.clientY - r.top) / r.height - 0.5;
        // мягкое смещение вслед за курсором + лёгкий наклон
        set(px * 26, py * 26, -py * 8, px * 8, 1.045);
      });

      wrap.addEventListener('mouseleave', function () {
        set(0, 0, 0, 0, 1);
      });
    });
  }

  /* ------------------------------------------------------
     Общие часы анимаций: один rAF-цикл, не чаще 60 fps.
     Производительность: canvas и волны обновляются в одном и том же кадре.
     CSS-анимации волн жили своим циклом, и кадры canvas и волн не совпадали,
     что прибавляло работы композитору/GPU. На 120 Гц — каждый второй vsync.
     30 fps давали ~1.5% CPU, но движение рвалось.
     Анимация идёт, только когда вкладка видна и окно в фокусе. Подписчики
     получают t — время анимации без пауз (мс), поэтому после паузы всё
     продолжается с того же места, без скачка.
     dt — в «кадрах 60 fps»: скорости частиц заданы в px за такой кадр.
     ------------------------------------------------------ */
  var FRAME_MS = 1000 / 60;
  var STEP_MS = 1000 / 60;

  var clock = (function () {
    var subs = [], raf = null, last = 0, t = 0;
    var focused = document.hasFocus();

    function tick(now) {
      raf = requestAnimationFrame(tick);
      var elapsed = now - last;
      if (elapsed < FRAME_MS - 4) return;
      last = now;
      elapsed = Math.min(elapsed, 250);
      t += elapsed;
      var dt = elapsed / STEP_MS;
      for (var i = 0; i < subs.length; i++) subs[i](t, dt);
    }

    function sync() {
      var run = subs.length > 0 && focused && !document.hidden;
      if (run && !raf) {
        last = performance.now() - FRAME_MS;
        raf = requestAnimationFrame(tick);
      } else if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    }
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('focus', function () { focused = true; sync(); });
    window.addEventListener('blur', function () { focused = false; sync(); });

    return {
      time: function () { return t; },
      add: function (fn) {
        if (subs.indexOf(fn) >= 0) return;
        subs.push(fn);
        // на паузе (окно без фокуса) — хотя бы один статичный кадр вместо пустого canvas
        if (!raf) fn(t, 0);
        sync();
      },
      remove: function (fn) { var i = subs.indexOf(fn); if (i >= 0) subs.splice(i, 1); sync(); }
    };
  })();

  /* подписка на часы только пока элемент на экране */
  function whileVisible(el, fn, margin) {
    if (!('IntersectionObserver' in window)) { clock.add(fn); return; }
    new IntersectionObserver(function (e) {
      e[e.length - 1].isIntersecting ? clock.add(fn) : clock.remove(fn);
    }, { rootMargin: margin || '0px' }).observe(el);
  }

  /* ------------------------------------------------------
     Волны: каждый дрейфующий <g class="drift"> выносится в свой <svg>.
     transform-анимация элемента внутри SVG не композитится — браузер
     перерисовывал всю SVG каждый кадр; корневой <svg> с will-change — свой слой
     на GPU, сдвиг без перерисовки. Слой с тем же viewBox и overflow:visible
     рисует волну за правым краем, её обрезает overflow:hidden контейнера.
     Сдвигом управляют общие часы (см. выше); без JS работает CSS-анимация .drift.
     ------------------------------------------------------ */
  if (!reduced) {
    Array.prototype.forEach.call(document.querySelectorAll('svg > g.drift'), function (g) {
      var src = g.ownerSVGElement;
      // --d задаётся классом drift--NN; 44s — то же значение по умолчанию, что в CSS
      var dur = (parseFloat(getComputedStyle(g).getPropertyValue('--d')) || 44) * 1000;
      var rev = g.classList.contains('drift--rev');

      var layer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      layer.setAttribute('viewBox', src.getAttribute('viewBox'));
      layer.setAttribute('preserveAspectRatio', src.getAttribute('preserveAspectRatio'));
      layer.setAttribute('class', 'drift-layer');
      g.removeAttribute('class');
      layer.appendChild(g);

      var after = src;
      while (after.nextElementSibling && after.nextElementSibling.classList.contains('drift-layer')) {
        after = after.nextElementSibling;
      }
      src.parentNode.insertBefore(layer, after.nextSibling);

      // сдвиг на ширину слоя = период волны (1440 единиц viewBox)
      function move(t) {
        var p = (t / dur) % 1;
        layer.style.transform = 'translate3d(' + ((rev ? p - 1 : -p) * 100).toFixed(3) + '%,0,0)';
      }
      move(clock.time());
      whileVisible(src.parentNode, move);
    });
  }

  /* ------------------------------------------------------
     Canvas: createRadialGradient на каждую частицу в каждом кадре съедал
     основную часть CPU. Свечение рендерится один раз в спрайт,
     в кадре — только drawImage.
     ------------------------------------------------------ */
  function glowSprite(size, stops) {
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var g2 = c.getContext('2d');
    var g = g2.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
    g2.fillStyle = g;
    g2.fillRect(0, 0, size, size);
    return c;
  }

  /* ------------------------------------------------------
     5. Общий слой частиц: поверх линий-волн, под плашками
     ------------------------------------------------------ */
  var DUST_WARM = glowSprite(64, [[0, 'rgba(255,238,196,1)'], [0.32, 'rgba(240,197,120,0.5)'], [1, 'rgba(238,190,110,0)']]);
  var DUST_COOL = glowSprite(64, [[0, 'rgba(226,240,255,0.95)'], [0.32, 'rgba(160,205,255,0.42)'], [1, 'rgba(150,200,255,0)']]);

  function particleField(canvas, preset) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, DPR = 1, ps = [];

    var CFG = preset === 'rich'
      ? { density: 5200, rMin: 0.5, rMax: 2.3, rise: 0.62, glow: 5.0, alpha: 0.95, warm: 0.82,
          drift: 0.30, sway: 0.26, tw: 1.15 }
      : { density: 8200, rMin: 0.4, rMax: 1.8, rise: 0.20, glow: 4.2, alpha: 0.75, warm: 0.88,
          drift: 0.14, sway: 0.12, tw: 1.00 };

    function rnd(a, b) { return a + Math.random() * (b - a); }

    function spawn(anywhere) {
      return {
        x: Math.random() * W,
        y: anywhere ? Math.random() * H : H + rnd(4, 60),
        r: rnd(CFG.rMin, CFG.rMax),
        vx: rnd(-CFG.drift, CFG.drift),
        vy: -rnd(CFG.rise * 0.35, CFG.rise),
        p: Math.random() * Math.PI * 2,
        s: rnd(0.6, 1.9),
        warm: Math.random() < CFG.warm
      };
    }

    function build() {
      ps = [];
      if (W < 2 || H < 2) return;
      var n = Math.min(Math.round(W * H / CFG.density), 420);
      for (var i = 0; i < n; i++) ps.push(spawn(true));
    }

    function resize() {
      // пылинки — мягкое свечение, на retina 1x выглядит так же, а пикселей вчетверо меньше
      DPR = 1;
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      if (W < 2 || H < 2) return;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      build();
    }

    function frame(t, dt) {
      var time = t / 1000;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < ps.length; i++) {
        var q = ps[i];
        q.x += (q.vx + Math.sin(time * 0.55 + q.p) * CFG.sway) * dt;
        q.y += q.vy * dt;
        if (q.y < -14 || q.x < -24 || q.x > W + 24) { ps[i] = spawn(false); continue; }
        var tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * q.s * CFG.tw + q.p));
        ctx.globalAlpha = tw * CFG.alpha;
        var rad = q.r * CFG.glow;
        ctx.drawImage(q.warm ? DUST_WARM : DUST_COOL, q.x - rad, q.y - rad, rad * 2, rad * 2);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize', resize);
    resize();

    whileVisible(canvas, frame, '120px');
  }

  if (!reduced) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-fx]'), function (cv) {
      particleField(cv, cv.getAttribute('data-fx'));
    });
  }

  /* ------------------------------------------------------
     6. Шапка: частицы и волны на canvas
     ------------------------------------------------------ */
  var cv = document.getElementById('heroCanvas');
  if (!cv || reduced) return;

  var ctx = cv.getContext('2d');
  var W = 0, H = 0, DPR = 1;
  var particles = [], stars = [];
  var z, ribbonGrads = [], eraseGrad;

  var HERO_WARM = glowSprite(64, [[0, 'rgba(255,236,190,1)'], [0.35, 'rgba(245,206,140,0.55)'], [1, 'rgba(245,206,140,0)']]);
  var HERO_GLOW = glowSprite(256, [[0, 'rgba(255,246,222,0.28)'], [0.35, 'rgba(255,232,183,0.09)'], [1, 'rgba(255,232,183,0)']]);

  /* «Свободная зона» под заголовком: анимация туда не заходит */
  function safeZone() {
    return {
      cx: W * 0.5,
      cy: H * 0.48,
      rx: Math.min(W * 0.30, 420),
      ry: Math.max(H * 0.20, 92)
    };
  }

  /* Ленты-волны: каждая лента — пучок тонких линий (эффект «сетки») */
  var RIBBONS = [
    { y: 0.24, spread: 0.055, lines: 12, amp: 0.050, len: 1.30, speed: 0.035,
      phase: 5.5, skew: 0.7, width: 1.0, color: '132,178,230', alpha: 0.12 },
    { y: 0.40, spread: 0.062, lines: 20, amp: 0.070, len: 1.00, speed: 0.070,
      phase: 0.0, skew: 0.8, width: 1.2, color: '226,164,58', alpha: 0.30 },
    { y: 0.49, spread: 0.090, lines: 14, amp: 0.058, len: 1.55, speed: 0.045,
      phase: 3.1, skew: 1.0, width: 1.0, color: '120,180,240', alpha: 0.13 },
    { y: 0.58, spread: 0.070, lines: 22, amp: 0.080, len: 0.78, speed: -0.050,
      phase: 1.7, skew: 0.9, width: 1.3, color: '236,186,92', alpha: 0.34 },
    { y: 0.68, spread: 0.058, lines: 16, amp: 0.052, len: 1.18, speed: -0.085,
      phase: 4.4, skew: 0.8, width: 1.4, color: '246,206,126', alpha: 0.30 }
  ];





  function rand(a, b) { return a + Math.random() * (b - a); }

  function build() {
    // мерцающие звёзды в тёмной верхней части
    var starCount = Math.round(W * H / 16000);
    stars = [];
    for (var i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.55,
        r: rand(0.4, 1.35),
        p: Math.random() * Math.PI * 2,
        s: rand(0.5, 1.6)
      });
    }
    // золотые пылинки
    var pCount = Math.round(W * H / 5200);
    particles = [];
    for (var j = 0; j < pCount; j++) {
      particles.push(makeParticle(true));
    }
  }

  function makeParticle(anywhere) {
    return {
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : rand(H * 0.55, H * 1.02),
      r: rand(0.5, 2.1),
      vx: rand(-0.30, 0.30),
      vy: rand(-0.62, -0.16),
      p: Math.random() * Math.PI * 2,
      s: rand(0.6, 1.8),
      warm: Math.random() < 0.78
    };
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth;
    H = cv.clientHeight;
    cv.width = Math.round(W * DPR);
    cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();

    // всё, что зависит только от размера, — один раз на resize, а не в каждом кадре
    z = safeZone();
    ribbonGrads = RIBBONS.map(function (cfg) {
      var grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, 'rgba(' + cfg.color + ',0)');
      grad.addColorStop(0.10, 'rgba(' + cfg.color + ',1)');
      grad.addColorStop(0.90, 'rgba(' + cfg.color + ',1)');
      grad.addColorStop(1, 'rgba(' + cfg.color + ',0)');
      return grad;
    });
    eraseGrad = ctx.createRadialGradient(z.cx, z.cy, 0, z.cx, z.cy, 1);
    eraseGrad.addColorStop(0, 'rgba(0,0,0,0.95)');
    eraseGrad.addColorStop(0.62, 'rgba(0,0,0,0.8)');
    eraseGrad.addColorStop(1, 'rgba(0,0,0,0)');
  }

  /* насколько точка «свободна» от зоны заголовка: 0 — внутри, 1 — снаружи */
  function freedom(x, y, z) {
    var dx = (x - z.cx) / z.rx, dy = (y - z.cy) / z.ry;
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d >= 1.35) return 1;
    if (d <= 0.85) return 0;
    return (d - 0.85) / 0.5;
  }

  function drawRibbon(cfg, grad, time) {
    ctx.strokeStyle = grad;
    ctx.lineWidth = cfg.width;
    ctx.lineJoin = 'round';

    var step = W > 900 ? 10 : 14;
    for (var i = 0; i < cfg.lines; i++) {
      var k = cfg.lines === 1 ? 0.5 : i / (cfg.lines - 1);
      var off = (k - 0.5) * cfg.spread * H;
      ctx.globalAlpha = cfg.alpha * (0.25 + 0.75 * Math.sin(Math.PI * k));
      ctx.beginPath();
      for (var x = -20; x <= W + 20; x += step) {
        var u = x / (W || 1);
        var y = cfg.y * H + off
          + Math.sin(u * Math.PI * 2 * cfg.len + time * cfg.speed + cfg.phase + k * cfg.skew) * cfg.amp * H
          + Math.sin(u * Math.PI * 2 * cfg.len * 2.4 + time * cfg.speed * 1.6 + cfg.phase * 1.4) * cfg.amp * H * 0.32
          + Math.sin(u * Math.PI * 2 * cfg.len * 0.45 - time * cfg.speed * 0.7) * cfg.amp * H * 0.5;
        if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function frame(t, dt) {
    var time = t / 1000;

    ctx.clearRect(0, 0, W, H);

    /* тёплое свечение справа — как на макете */
    var gx = W * (0.78 + Math.sin(time * 0.07) * 0.03);
    var gy = H * (0.34 + Math.cos(time * 0.09) * 0.02);
    var gr = Math.max(W, H) * 0.28;
    ctx.drawImage(HERO_GLOW, gx - gr, gy - gr, gr * 2, gr * 2);

    /* звёзды */
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      var f = freedom(st.x, st.y, z);
      if (f <= 0.02) continue;
      var a = (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * st.s + st.p))) * f;
      ctx.globalAlpha = a * 0.9;
      ctx.fillStyle = '#eaf3ff';
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    /* волны-ленты */
    ctx.globalCompositeOperation = 'lighter';
    for (var r = 0; r < RIBBONS.length; r++) drawRibbon(RIBBONS[r], ribbonGrads[r], time);

    /* золотые частицы */
    for (var p = 0; p < particles.length; p++) {
      var q = particles[p];
      q.x += (q.vx + Math.sin(time * 0.5 + q.p) * 0.26) * dt;
      q.y += q.vy * dt;
      if (q.y < -12 || q.x < -20 || q.x > W + 20) {
        particles[p] = makeParticle(false);
        continue;
      }
      var fr = freedom(q.x, q.y, z);
      if (fr <= 0.02) continue;
      var tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(time * q.s + q.p));
      ctx.globalAlpha = tw * fr * 0.85;
      if (q.warm) {
        var qr = q.r * 4.5;
        ctx.drawImage(HERO_WARM, q.x - qr, q.y - qr, qr * 2, qr * 2);
      } else {
        ctx.fillStyle = 'rgba(214,236,255,0.9)';
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.r * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    /* вычищаем зону заголовка, чтобы анимация не мешала тексту */
    ctx.globalCompositeOperation = 'destination-out';
    ctx.save();
    ctx.translate(z.cx, z.cy);
    ctx.scale(z.rx * 1.16, z.ry * 1.16);
    ctx.translate(-z.cx, -z.cy);
    ctx.fillStyle = eraseGrad;
    ctx.beginPath();
    ctx.arc(z.cx, z.cy, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
  }

  var ro = ('ResizeObserver' in window) ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(cv); else window.addEventListener('resize', resize);

  resize();
  whileVisible(cv, frame);
})();

/* =========================================================
   7. Подстановка ссылок из js/config.js (Скул Мастер, соцсети)
   ========================================================= */
(function () {
  'use strict';
  var C = window.ASSA_CONFIG;
  if (!C) return;

  function url(v, fallback) {
    if (!v) return fallback || '';
    if (/^https?:|^#|^\//.test(v)) return v;
    return (C.lms.base || '') + v;
  }

  /* кнопки «Личный кабинет» / «Начать обучение» */
  var cab = url(C.lms.cabinet), start = url(C.lms.start);
  Array.prototype.forEach.call(document.querySelectorAll('[data-lms="cabinet"]'), function (a) { if (cab) a.href = cab; });
  Array.prototype.forEach.call(document.querySelectorAll('[data-lms="start"]'), function (a) { if (start) a.href = start; });

  /* ссылки на курсы: <a data-lms-course="school9" data-fallback="https://t.me/...">  */
  Array.prototype.forEach.call(document.querySelectorAll('[data-lms-course]'), function (a) {
    var key = a.getAttribute('data-lms-course');
    var u = url(C.lms.courses && C.lms.courses[key]);
    if (u) a.href = u; else if (a.getAttribute('data-fallback')) a.href = a.getAttribute('data-fallback');
  });

  /* телефоны */
  Array.prototype.forEach.call(document.querySelectorAll('[data-phones]'), function (box) {
    var links = box.querySelectorAll('a');
    (C.phones || []).forEach(function (p, i) {
      if (!links[i]) return;
      links[i].textContent = p;
      links[i].href = 'tel:' + p.replace(/[^\d+]/g, '');
    });
    for (var i = (C.phones || []).length; i < links.length; i++) links[i].style.display = 'none';
  });

  /* соцсети */
  var map = { youtube: '.social--yt', vk: '.social--vk', ok: '.social--ok', telegram: '.social--tg' };
  Object.keys(map).forEach(function (k) {
    Array.prototype.forEach.call(document.querySelectorAll(map[k]), function (a) {
      var v = C.socials && C.socials[k];
      if (v) a.href = v; else a.parentNode.style.display = 'none';
    });
  });

  /* активный пункт меню */
  var here = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.menu-panel a'), function (a) {
    var h = (a.getAttribute('href') || '').split('#')[0];
    if (h && h === here) a.classList.add('is-active');
  });
})();
