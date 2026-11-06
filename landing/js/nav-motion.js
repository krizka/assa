/* Soft light follows the current section without delaying normal page navigation. */
(function () {
  'use strict';
  var nav = document.querySelector('.site-nav');
  if (!nav) return;
  var rail = nav.querySelector('.site-nav__inner');
  var active = rail.querySelector('[aria-current="page"], .is-current-section');
  if (!active) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var halo = document.createElement('span');
  halo.className = 'site-nav__light';
  halo.setAttribute('aria-hidden', 'true');
  var canvas = document.createElement('canvas');
  canvas.className = 'site-nav__fireflies';
  canvas.setAttribute('aria-hidden', 'true');
  nav.insertBefore(halo, rail);
  nav.insertBefore(canvas, rail);
  nav.classList.add('has-navigation-light');

  var ctx = canvas.getContext('2d');
  var width = 0, height = 0, target, center, particles = [];
  var raf = 0, last = 0, visible = true;
  var padding = 24;
  var attractionAt = 0;
  try { attractionAt = Number(sessionStorage.getItem('alva.orbit-attraction')) || 0; } catch (ignore) {}
  var motes = [];
  for (var m = 0; m < 36; m++) {
    motes.push({u: (m * .61803398875) % 1, v: (m * .381966 + .17) % 1,
      phase: m * 2.39996, speed: .025 + (m % 3) * .008});
  }

  // Keep the current section visible in the small-screen scrolling navigation.
  if (rail.scrollWidth > rail.clientWidth) {
    rail.scrollLeft = Math.max(0, active.offsetLeft - rail.clientWidth / 2 + active.offsetWidth / 2);
  }

  function linkShape(link) {
    var box = link.getBoundingClientRect();
    var frame = nav.getBoundingClientRect();
    return { x: box.left - frame.left + box.width / 2, y: box.top - frame.top + box.height / 2 + padding,
      rx: box.width / 2 + 9, ry: Math.min(box.height / 2 + 3, 26) };
  }

  function positionLight() {
    halo.style.width = (center.rx * 2 + 32) + 'px';
    halo.style.height = '76px';
    halo.style.transform = 'translate3d(' + (center.x - center.rx - 16) + 'px,' + (center.y - padding - 38) + 'px,0)';
  }

  function measure() {
    width = nav.clientWidth;
    height = nav.clientHeight + padding * 2;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (ctx) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    target = linkShape(active);
    center = center || Object.assign({}, target);
    if (reduced.matches) center = Object.assign({}, target);
    positionLight();
  }

  // Render the glow once; the animation only moves small sprites.
  var sprite = document.createElement('canvas');
  sprite.width = sprite.height = 40;
  var spriteCtx = sprite.getContext('2d');
  if (spriteCtx) {
    var glow = spriteCtx.createRadialGradient(20, 20, 0, 20, 20, 20);
    glow.addColorStop(0, '#fff8df');
    glow.addColorStop(0.12, '#ffedb5');
    glow.addColorStop(0.35, 'rgba(240,199,116,.48)');
    glow.addColorStop(1, 'rgba(240,199,116,0)');
    spriteCtx.fillStyle = glow;
    spriteCtx.fillRect(0, 0, 40, 40);
  }

  measure();
  var count = width < 700 ? 16 : 24;
  for (var i = 0; i < count; i++) {
    var angle = i / count * Math.PI * 2;
    particles.push({ angle: angle, phase: angle,
      speed: .32 + (i % 2) * .09, radius: 1 + (i % 2) * .12,
      lane: i % 2, size: 2.2 + (i % 3) * .45,
      x: center.x + Math.cos(angle) * center.rx * 1.3,
      y: center.y + Math.sin(angle) * center.ry * 1.25 });
  }

  function frame(time) {
    raf = 0;
    if (document.hidden || !visible || reduced.matches || !ctx || !spriteCtx) return;
    var dt = last ? Math.min((time - last) / 1000, .08) : .033;
    last = time;
    var follow = 1 - Math.exp(-dt * 7);
    ['x', 'y', 'rx', 'ry'].forEach(function (key) { center[key] += (target[key] - center[key]) * follow; });
    if (Math.abs(target.x - center.x) + Math.abs(target.y - center.y) + Math.abs(target.rx - center.rx) > .02) positionLight();
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    // Two clean elliptical orbits frame the label; no random inward drift.
    ctx.lineWidth = .65;
    for (var lane = 0; lane < 2; lane++) {
      ctx.globalAlpha = lane ? .14 : .24;
      ctx.strokeStyle = '#f0c774';
      ctx.beginPath();
      ctx.ellipse(center.x, center.y, (center.rx + 7) * (1 + lane * .12),
        center.ry + 3 + lane * 3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    var seconds = (performance.timeOrigin + time) / 1000;
    var age = (Date.now() - attractionAt) / 1000;
    var capture = age >= 0 && age < 3.2 ? Math.min(1, age / 1.1) : 0;
    capture = capture * capture * (3 - 2 * capture);
    var fade = age > 2.4 ? Math.max(0, (3.2 - age) / .8) : 1;
    motes.forEach(function (m) {
      var x = ((m.u + seconds * m.speed / 12) % 1) * width;
      var y = padding + m.v * (height - padding * 2);
      var dx = (x - center.x) / (center.rx + 85);
      var dy = (y - center.y) / (center.ry + 30);
      var nearby = dx * dx + dy * dy < 1;
      if (nearby && capture) {
        var angle = m.phase + seconds * .36;
        x += (center.x + Math.cos(angle) * (center.rx + 7) - x) * capture;
        y += (center.y + Math.sin(angle) * (center.ry + 3) - y) * capture;
      }
      ctx.globalAlpha = .32 * (nearby && capture ? fade : 1);
      ctx.drawImage(sprite, x - 3, y - 3, 6, 6);
    });
    particles.forEach(function (p) {
      p.angle = p.phase + (performance.timeOrigin + time) / 1000 * p.speed;
      var depth = Math.sin(p.angle);
      var x = center.x + Math.cos(p.angle) * (center.rx + 7) * p.radius;
      var y = center.y + depth * (center.ry + 3 + p.lane * 3);
      ctx.globalAlpha = .45 + (depth + 1) * .2;
      var radius = p.size * (.85 + (depth + 1) * .12);
      ctx.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
    });
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }

  function sync() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
    if (reduced.matches) {
      center = Object.assign({}, target);
      positionLight();
      if (ctx) ctx.clearRect(0, 0, width, height);
    } else if (!document.hidden && visible && ctx && spriteCtx) raf = requestAnimationFrame(frame);
  }

  rail.addEventListener('click', function (event) {
    var link = event.target.closest('a');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    attractionAt = Date.now();
    try { sessionStorage.setItem('alva.orbit-attraction', String(attractionAt)); } catch (ignore) {}
  });
  rail.addEventListener('scroll', function () { target = linkShape(active); if (reduced.matches) sync(); }, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(nav);
  else window.addEventListener('resize', measure);
  if (document.fonts) document.fonts.ready.then(function () {
    measure(); center = Object.assign({}, target); positionLight();
  });
  document.addEventListener('visibilitychange', sync);
  if (reduced.addEventListener) reduced.addEventListener('change', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; sync(); }).observe(nav);
  }
  window.addEventListener('pageshow', sync);
  sync();
})();
