(function () {
  'use strict';
  var links = (window.ASSA_CONFIG || {}).schoolPayments || {};
  document.querySelectorAll('[data-school-payment]').forEach(function (link) {
    var value = links[link.getAttribute('data-school-payment')];
    if (!value) return;
    var url;
    try { url = new URL(value); } catch (error) { return; }
    if (url.protocol !== 'https:') return;
    var previousLabel = link.getAttribute('aria-label');
    link.href = url.href;
    link.textContent = link.getAttribute('data-school-payment').endsWith('Pair') ? 'Оплатить за двоих' : 'Оплатить';
    if (previousLabel) link.setAttribute('aria-label', previousLabel.replace('Запросить оплату', 'Оплатить'));
  });
})();
