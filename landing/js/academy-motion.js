/* Small flocks circle the crown; heading, banking and wingbeats follow the flight. */
document.querySelectorAll('[data-history-scene]').forEach(function (scene) {
  var button = scene.parentElement.querySelector('.history-animation-toggle');
  var motion = scene.querySelector('.history-motion');
  var flock = scene.querySelector('[data-history-birds]');
  var template = scene.querySelector('#history-dove');
  if (!button || !motion || !flock || !template) return;
  var ns = 'http://www.w3.org/2000/svg';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var birds = [
    { path: 'M160 325 C65 235 210 60 460 82 C715 82 925 230 850 365 C770 465 410 430 160 325Z', duration: 23, offset: 0.12, size: 0.79 },
    { path: 'M825 260 C900 140 700 62 470 100 C230 125 95 300 205 385 C360 475 745 390 825 260Z', duration: 27, offset: 0.51, size: 0.64 },
    { path: 'M250 180 C370 75 705 85 845 240 C945 355 720 470 455 385 C210 325 110 250 250 180Z', duration: 31, offset: 0.78, size: 0.53 }
  ].map(function (bird, i) {
    var path = document.createElementNS(ns, 'path');
    path.setAttribute('d', bird.path);
    bird.path = path;
    bird.length = path.getTotalLength();
    bird.node = template.cloneNode(true);
    bird.node.removeAttribute('id');
    bird.node.setAttribute('class', 'history-bird');
    flock.appendChild(bird.node);
    bird.wings = bird.node.querySelectorAll('.dove-wing');
    bird.phase = i * 2.1;
    return bird;
  });
  var page = scene.querySelector('.history-page');
  var pageShapes = [
    [221,551,284,531,336,553,420,646,354,637,300,662],
    [221,551,281,467,320,478,350,596,321,607,300,662],
    [221,551,185,461,171,501,217,606,270,616,300,662],
    [221,551,151,527,83,540,169,651,240,636,300,662]
  ];
  var pageStops = [0.18, 0.38, 0.57, 0.77];
  var elapsed = 0, previous = null, frame = null, visible = false, paused = false;
  function paint() {
    if (page) {
      var phase = (elapsed % 7) / 7;
      var segment = 0;
      while (segment < 2 && phase > pageStops[segment + 1]) segment++;
      var progress = Math.max(0, Math.min(1, (phase - pageStops[segment]) / (pageStops[segment + 1] - pageStops[segment])));
      progress = progress * progress * (3 - 2 * progress);
      var shape = pageShapes[segment].map(function (value, i) { return value + (pageShapes[segment + 1][i] - value) * progress; });
      page.setAttribute('d', 'M' + shape[0] + ' ' + shape[1] + ' Q' + shape.slice(2, 6).join(' ') + ' L' + shape.slice(6, 8).join(' ') + ' Q' + shape.slice(8).join(' ') + 'Z');
      page.style.opacity = String(Math.max(0, Math.min(1, (phase - 0.12) / 0.06, (0.85 - phase) / 0.08)));
    }
    birds.forEach(function (bird, i) {
      var fraction = (elapsed / bird.duration + bird.offset) % 1;
      var distance = fraction * bird.length;
      var point = bird.path.getPointAtLength(distance);
      var ahead = bird.path.getPointAtLength((distance + 2) % bird.length);
      var behind = bird.path.getPointAtLength((distance - 2 + bird.length) % bird.length);
      var dx = ahead.x - behind.x, dy = ahead.y - behind.y;
      var heading = dx / Math.max(0.01, Math.hypot(dx, dy));
      // Continuous yaw narrows the silhouette before it turns, without flipping upside down.
      var bank = Math.atan2(dy, Math.abs(dx) + 2) * 180 / Math.PI * 0.42;
      var depth = (point.y - 70) / 400;
      var scale = bird.size * (0.76 + depth * 0.3);
      bird.node.setAttribute('transform', 'translate(' + point.x + ' ' + point.y + ') rotate(' + bank + ') scale(' + (scale * heading) + ' ' + scale + ')');
      bird.node.setAttribute('opacity', String(0.64 + depth * 0.31));
      // Several beats alternate with a short glide; the two wings share one shoulder rhythm.
      var gliding = Math.sin(elapsed * 0.7 + bird.phase) > 0.6;
      var lift = gliding ? 0.2 : Math.sin(elapsed * (15.5 + i) + bird.phase);
      var tip = -8 - 21 * lift;
      bird.wings[0].setAttribute('d', 'M-5 3 Q-16 ' + (tip * 0.48) + ' -25 ' + tip + ' Q-7 ' + (tip * 0.7) + ' 7 4Z');
      bird.wings[1].setAttribute('d', 'M2 3 Q10 ' + (tip * 0.52) + ' 21 ' + (tip * 0.78) + ' Q20 ' + (tip * 0.24) + ' 10 7Z');
    });
  }
  function tick(now) {
    frame = null;
    if (previous !== null) elapsed += Math.min((now - previous) / 1000, 0.05);
    previous = now;
    paint();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    var active = visible && !paused && !document.hidden && !reduced.matches;
    if (!active && frame !== null) { cancelAnimationFrame(frame); frame = null; }
    previous = null;
    if (active && frame === null) frame = requestAnimationFrame(tick);
  }
  button.addEventListener('click', function () {
    paused = !paused;
    scene.classList.toggle('is-paused', paused);
    var label = paused ? 'Продолжить анимацию' : 'Приостановить анимацию';
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', label);
    button.title = label;
    button.textContent = label;
    sync();
  });
  new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; sync(); }, { rootMargin: '80px' }).observe(scene);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  paint();
});
