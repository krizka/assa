/* The photograph remains visible when motion is paused or reduced. */
document.querySelectorAll('[data-history-scene]').forEach(function (scene) {
  var button = scene.querySelector('.history-animation-toggle');
  var motion = scene.querySelector('svg');
  if (!button || !motion) return;
  button.addEventListener('click', function () {
    var paused = scene.classList.toggle('is-paused');
    if (paused) motion.pauseAnimations();
    else motion.unpauseAnimations();
    var label = paused ? 'Продолжить анимацию' : 'Приостановить анимацию';
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', label);
    button.title = label;
    button.querySelector('span').textContent = paused ? '▷' : 'Ⅱ';
  });
});
