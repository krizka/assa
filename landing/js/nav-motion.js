/* Soft light follows the current section without delaying normal page navigation. */
(function () {
  'use strict';
  var nav = document.querySelector('.site-nav');
  if (!nav) return;
  var rail = nav.querySelector('.site-nav__inner');
  var links = Array.prototype.slice.call(rail.querySelectorAll('a'));
  var active = rail.querySelector('[aria-current="page"], .is-current-section');
  if (!active) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var storageKey = 'alva.navigation-light';
  var fromLink = active;
  try {
    var previous = JSON.parse(sessionStorage.getItem(storageKey));
    sessionStorage.removeItem(storageKey);
    if (previous && Date.now() - previous.at < 15000) {
      fromLink = links.filter(function (link) { return link.getAttribute('href') === previous.from; })[0] || active;
    }
  } catch (ignore) { /* Navigation also works when browser storage is unavailable. */ }

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
    center = center || linkShape(fromLink);
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
  var count = width < 700 ? 28 : 44;
  for (var i = 0; i < count; i++) {
    var angle = i / count * Math.PI * 2;
    particles.push({ angle: angle, phase: Math.random() * Math.PI * 2,
      speed: .12 + Math.random() * .16, radius: .8 + Math.random() * .7,
      size: 2.7 + Math.random() * 3.2,
      x: center.x + Math.cos(angle) * center.rx * 1.3,
      y: center.y + Math.sin(angle) * center.ry * 1.25 });
  }

  function frame(time) {
    raf = 0;
    if (document.hidden || !visible || reduced.matches || !ctx || !spriteCtx) return;
    if (last && time - last < 30) { raf = requestAnimationFrame(frame); return; }
    var dt = last ? Math.min((time - last) / 1000, .08) : .033;
    last = time;
    var follow = 1 - Math.exp(-dt * 7);
    ['x', 'y', 'rx', 'ry'].forEach(function (key) { center[key] += (target[key] - center[key]) * follow; });
    positionLight();
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    particles.forEach(function (p) {
      p.angle += dt * p.speed;
      var drift = Math.sin(time * .0007 + p.phase) * 4;
      var x = center.x + Math.cos(p.angle) * (center.rx + 9 + drift) * p.radius;
      var y = center.y + Math.sin(p.angle) * (center.ry + 5) + Math.cos(time * .0009 + p.phase) * 3;
      var attraction = 1 - Math.exp(-dt * 4);
      p.x += (x - p.x) * attraction;
      p.y += (y - p.y) * attraction;
      // Most light stays at the edges, keeping the label clear and readable.
      var edge = Math.min(1, Math.abs(p.y - center.y) / 13 + Math.abs(p.x - center.x) / (center.rx * 2));
      ctx.globalAlpha = (.45 + .35 * Math.sin(time * .001 + p.phase)) * edge;
      var radius = p.size;
      ctx.drawImage(sprite, p.x - radius, p.y - radius, radius * 2, radius * 2);
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

  links.forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      try { sessionStorage.setItem(storageKey, JSON.stringify({ from: active.getAttribute('href'), at: Date.now() })); } catch (ignore) {}
      target = linkShape(link);
    });
  });
  rail.addEventListener('scroll', function () { target = linkShape(active); if (reduced.matches) sync(); }, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(nav);
  else window.addEventListener('resize', measure);
  document.addEventListener('visibilitychange', sync);
  if (reduced.addEventListener) reduced.addEventListener('change', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; sync(); }).observe(nav);
  }
  window.addEventListener('pageshow', sync);
  sync();
})();
