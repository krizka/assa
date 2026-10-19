(function () {
  'use strict';
  var config = window.ASSA_CONFIG || {};
  var offers = config.offers || {};
  var specialists = (config.schedule || {}).specialists || [];
  var dialog, trigger, activeKey, activeMode;

  function https(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      var url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
    } catch (error) { return ''; }
  }
  function contactUrl(offer, mode, specialist) {
    var contact = https((specialist || {}).contact || offer.contact || (config.orders || {}).contact);
    if (!contact) return '';
    var url = new URL(contact);
    var message = (mode === 'booking' ? 'Здравствуйте! Хочу согласовать время: ' : 'Здравствуйте! Хочу заказать: ') + offer.title;
    if (specialist) message += '. Специалист: ' + specialist.name;
    if (offer.price) message += '. Стоимость на сайте: ' + offer.price;
    message += '. Подскажите, пожалуйста, условия и доступные даты.';
    if (url.hostname === 't.me') url.searchParams.set('text', message);
    return url.href;
  }
  function paymentUrl(key, offer) {
    return https(offer.paymentUrl) || https(key.indexOf('school.') === 0 && (config.schoolPayments || {})[key.slice(7)]);
  }
  function makeDialog() {
    dialog = document.createElement('dialog');
    dialog.className = 'order-dialog';
    dialog.setAttribute('aria-labelledby', 'order-title');
    dialog.setAttribute('aria-describedby', 'order-note');
    dialog.innerHTML = '<div class="order-dialog__body"><button class="order-dialog__close" type="button" aria-label="Закрыть окно заявки">×</button><p class="order-dialog__eyebrow"></p><h2 id="order-title"></h2><p class="order-dialog__price"></p><p class="order-dialog__conditions"></p><div class="order-dialog__specialist" hidden><label for="order-specialist">Специалист</label><select id="order-specialist"></select></div><div class="order-dialog__actions"><a class="btn-gold order-dialog__pay" target="_blank" rel="noopener"></a><a class="btn-outline order-dialog__book" target="_blank" rel="noopener"></a></div><p class="order-dialog__note" id="order-note"></p><a class="order-dialog__details">Подробнее об услуге</a></div>';
    document.body.appendChild(dialog);
    dialog.querySelector('button').addEventListener('click', function () { dialog.close(); });
    dialog.querySelector('.order-dialog__details').addEventListener('click', function () { dialog.close(); });
    dialog.querySelector('select').addEventListener('change', renderActions);
    dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', function () {
      document.documentElement.classList.remove('order-is-open');
      if (trigger) trigger.focus();
    });
  }
  function renderActions() {
    var offer = offers[activeKey];
    var selected = dialog.querySelector('select').value;
    var specialist = specialists.find(function (p) { return p.id === selected && (p.offers || []).indexOf(activeKey) !== -1; });
    var slotFirst = activeKey.indexOf('consultation.') === 0 && !offer.bookingOnly;
    var pay = offer.bookingOnly ? '' : paymentUrl(activeKey, offer);
    var book = https((specialist || {}).bookingUrl) || https(offer.bookingUrl);
    var contact = contactUrl(offer, 'order', specialist);
    var bookingContact = contactUrl(offer, 'booking', specialist);
    var payLink = dialog.querySelector('.order-dialog__pay');
    payLink.hidden = (!pay && !contact) || !!offer.bookingOnly || slotFirst;
    payLink.href = pay || contact || trigger.href;
    payLink.textContent = pay ? 'Перейти к оплате' : 'Заказать через куратора';
    var bookLink = dialog.querySelector('.order-dialog__book');
    bookLink.hidden = !book && !bookingContact;
    bookLink.href = book || bookingContact || trigger.href;
    bookLink.className = (slotFirst || offer.bookingOnly ? 'btn-gold' : 'btn-outline') + ' order-dialog__book';
    bookLink.textContent = book ? (slotFirst ? 'Выбрать время и оформить запись' : 'Выбрать дату и забронировать') : (offer.bookingOnly ? 'Отправить заявку' : (slotFirst ? 'Согласовать время' : 'Забронировать через куратора'));
    dialog.querySelector('.order-dialog__eyebrow').textContent = offer.bookingOnly ? 'Запись без оплаты' : (slotFirst ? 'Время → оплата → подтверждение' : (activeMode === 'booking' ? 'Заявка на бронирование' : 'Заказ и оплата'));
    var note;
    if (offer.bookingOnly) {
      note = 'Первичная работа без оплаты. Время встречи согласовывается со специалистом. ';
    } else if (slotFirst) {
      note = book ? 'Сначала выберите свободное время. Запись подтверждается после успешной оплаты в школе. ' : 'Часы приёма пока не опубликованы. Сначала согласуйте подходящее время; запись на слот подтверждается после оплаты. ';
    } else {
      note = 'Бронирование подтверждается после согласования даты и условий. ';
      if (pay) note += 'Оплата откроется на отдельной странице, где можно проверить заказ и сумму. ';
      if (book) note += 'Для бронирования откроется страница записи. ';
    }
    if (!book) note += 'Заявка откроется в Telegram. Чтобы отправить её, нажмите «Отправить» в чате.';
    dialog.querySelector('.order-dialog__note').textContent = note;
  }
  function openOrder(key, mode, source) {
    var offer = offers[key];
    if (!offer || typeof HTMLDialogElement === 'undefined') return false;
    if (!dialog) makeDialog();
    trigger = source; activeKey = key; activeMode = mode;
    dialog.querySelector('h2').textContent = offer.title;
    dialog.querySelector('.order-dialog__price').textContent = offer.price || 'Стоимость уточняется у куратора';
    dialog.querySelector('.order-dialog__conditions').textContent = offer.conditions || '';
    var select = dialog.querySelector('select'); select.textContent = '';
    var available = specialists.filter(function (p) { return (p.offers || []).indexOf(key) !== -1; });
    var box = dialog.querySelector('.order-dialog__specialist'); box.hidden = !available.length;
    if (available.length > 1) {
      var placeholder = document.createElement('option'); placeholder.value = ''; placeholder.textContent = 'Помогите выбрать специалиста'; select.appendChild(placeholder);
    }
    available.forEach(function (p) { var option = document.createElement('option'); option.value = p.id; option.textContent = p.name; select.appendChild(option); });
    var preferred = source.getAttribute('data-specialist');
    if (available.some(function (p) { return p.id === preferred; })) select.value = preferred;
    dialog.querySelector('.order-dialog__details').href = offer.details || 'contacts.html';
    renderActions();
    dialog.showModal(); document.documentElement.classList.add('order-is-open');
    if (mode === 'booking' && !dialog.querySelector('.order-dialog__book').hidden) dialog.querySelector('.order-dialog__book').focus();
    return true;
  }
  document.querySelectorAll('[data-offer]').forEach(function (link) {
    var key = link.getAttribute('data-offer'); if (!offers[key]) return;
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', function (event) {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (openOrder(key, link.getAttribute('data-order-mode'), link)) event.preventDefault();
    });
  });
})();
