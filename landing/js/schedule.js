(function () {
  'use strict';
  var schedule = (window.ASSA_CONFIG || {}).schedule || {};
  var zone = schedule.timezone || 'Europe/Moscow';
  function publicEvents(input) {
    return (Array.isArray(input) ? input : []).filter(function (event) {
      return event && event.public === true && event.status === 'published' && typeof event.title === 'string' && Number.isFinite(Date.parse(event.start));
    }).sort(function (a, b) { return Date.parse(a.start) - Date.parse(b.start); });
  }
  var events = publicEvents(schedule.events);
  var feedFailed = false;
  function format(date, options) { return new Intl.DateTimeFormat('ru-RU', Object.assign({ timeZone: zone }, options)).format(date); }
  function dateKey(date) {
    var parts = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
    var p = {}; parts.forEach(function (part) { p[part.type] = part.value; });
    return p.year + '-' + p.month + '-' + p.day;
  }
  function safeUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try { var u = new URL(value, location.href); return (u.protocol === 'https:' || u.origin === location.origin) && !u.username && !u.password ? u.href : ''; } catch (e) { return ''; }
  }
  var calendarUrl = safeUrl(schedule.calendarUrl);
  document.querySelectorAll('[data-school-calendar]').forEach(function (a) { if (calendarUrl) a.href = calendarUrl; });
  document.querySelectorAll('[data-specialist]').forEach(function (a) {
    var specialist = (schedule.specialists || []).find(function (p) { return p.id === a.getAttribute('data-specialist'); });
    if (specialist && safeUrl(specialist.bookingUrl)) a.textContent = 'Выбрать свободное время';
  });
  var today = dateKey(new Date());
  function renderUpcoming() {
    var upcoming = events.filter(function (e) { return dateKey(new Date(e.start)) >= today; });
    document.querySelectorAll('[data-upcoming-events]').forEach(function (container) {
      container.textContent = '';
      if (!upcoming.length) {
        var empty = document.createElement('p'); empty.textContent = feedFailed ? 'Актуальные встречи смотрите в календаре школы.' : 'Даты ближайших встреч готовятся к публикации.'; container.appendChild(empty); return;
      }
      upcoming.slice(0, 3).forEach(function (e) {
        var a = document.createElement('a'); a.className = 'schedule-mini-event'; a.href = 'schedule.html#events';
        var time = document.createElement('time'); time.dateTime = e.start; time.textContent = format(new Date(e.start), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        a.append(time, document.createTextNode(e.title)); container.appendChild(a);
      });
      if (feedFailed) { var note = document.createElement('p'); note.textContent = 'Перед записью сверьте время в календаре школы.'; container.appendChild(note); }
    });
  }
  function loadFeed() {
    if (!schedule.feedUrl) return;
    var feedUrl = safeUrl(schedule.feedUrl);
    if (!feedUrl || new URL(feedUrl).origin !== location.origin) return;
    fetch(feedUrl, { credentials: 'omit', cache: 'no-store' }).then(function (response) {
      if (!response.ok) throw new Error('Calendar unavailable');
      return response.json();
    }).then(function (feed) {
      if (feed.version !== 1 || !Array.isArray(feed.events) || !Number.isFinite(Date.parse(feed.updatedAt))) throw new Error('Invalid calendar feed');
      events = publicEvents(feed.events);
      feedFailed = Date.now() - Date.parse(feed.updatedAt) > 24 * 60 * 60 * 1000;
      renderUpcoming(); if (days) { renderDays(); renderList(); }
    }).catch(function () { feedFailed = true; renderUpcoming(); if (days) renderList(); });
  }
  renderUpcoming();
  var days = document.getElementById('calendar-days');
  if (!days) { loadFeed(); return; }
  var list = document.getElementById('public-events');
  var heading = document.getElementById('events-heading');
  var month = Number(today.slice(5, 7)) - 1, year = Number(today.slice(0, 4));
  var selectedDate = '', category = 'all';
  function renderDays() {
    document.getElementById('calendar-month').textContent = format(new Date(Date.UTC(year, month, 15, 12)), { month: 'long', year: 'numeric' });
    days.textContent = '';
    var first = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
    for (var i = 0; i < first; i++) days.appendChild(document.createElement('span'));
    var count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    for (var n = 1; n <= count; n++) {
      var key = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(n).padStart(2, '0');
      var button = document.createElement('button'); button.type = 'button'; button.textContent = n; button.dataset.date = key;
      button.setAttribute('aria-label', format(new Date(key + 'T12:00:00+03:00'), { day: 'numeric', month: 'long', year: 'numeric' }));
      button.setAttribute('aria-pressed', String(key === selectedDate));
      if (key === today) button.setAttribute('aria-current', 'date');
      if (events.some(function (e) { return dateKey(new Date(e.start)) === key && (category === 'all' || e.category === category); })) button.classList.add('has-events');
      days.appendChild(button);
    }
  }
  function empty() {
    var box = document.createElement('div'); box.className = 'agenda-empty';
    var mark = document.createElement('span'); mark.className = 'agenda-empty__mark'; mark.textContent = '◷'; mark.setAttribute('aria-hidden', 'true');
    var h = document.createElement('h4'); h.textContent = feedFailed ? 'Актуальное расписание — в календаре школы' : (selectedDate ? 'На этот день события не опубликованы' : 'Новые даты готовятся к публикации');
    var p = document.createElement('p'); p.textContent = 'Посмотрите календарь школы или уточните ближайшие встречи у куратора. Для личной консультации перейдите к записи ниже.';
    var a = document.createElement('a'); a.href = calendarUrl || 'contacts.html'; a.textContent = 'Открыть календарь школы ↗'; a.target = '_blank'; a.rel = 'noopener';
    box.append(mark, h, p, a); list.appendChild(box);
  }
  function renderList() {
    heading.textContent = selectedDate ? format(new Date(selectedDate + 'T12:00:00+03:00'), { day: 'numeric', month: 'long', year: 'numeric' }) : 'Ближайшие события';
    var visible = events.filter(function (e) {
      var key = dateKey(new Date(e.start));
      return (category === 'all' || e.category === category) && (selectedDate ? key === selectedDate : key >= today);
    });
    list.textContent = '';
    if (feedFailed && events.length) {
      var stale = document.createElement('p'); stale.className = 'booking-status'; stale.textContent = 'Расписание может быть неактуально. Перед записью сверьте время в календаре школы.'; list.appendChild(stale);
    }
    if (!visible.length) { empty(); return; }
    visible.forEach(function (e) {
      var date = new Date(e.start), card = document.createElement('article'); card.className = 'event-card';
      var dateBox = document.createElement('time'); dateBox.className = 'event-card__date'; dateBox.dateTime = e.start;
      var day = document.createElement('strong'); day.textContent = format(date, { day: 'numeric' });
      dateBox.append(day, document.createTextNode(format(date, { month: 'short' })));
      var body = document.createElement('div');
      var meta = document.createElement('div'); meta.className = 'event-card__meta'; meta.textContent = format(date, { hour: '2-digit', minute: '2-digit' }) + ' МСК' + (e.format ? ' · ' + e.format : '');
      var title = document.createElement('h4'); title.textContent = e.title; body.append(meta, title);
      if (e.description) { var p = document.createElement('p'); p.textContent = e.description; body.appendChild(p); }
      if (safeUrl(e.url)) { var a = document.createElement('a'); a.href = safeUrl(e.url); a.textContent = e.actionLabel || 'Подробнее и запись'; body.appendChild(a); }
      card.append(dateBox, body); list.appendChild(card);
    });
  }
  days.addEventListener('click', function (e) {
    var button = e.target.closest('[data-date]'); if (!button) return;
    selectedDate = button.dataset.date; renderDays(); renderList();
    days.querySelector('[data-date="' + selectedDate + '"]').focus();
  });
  document.querySelectorAll('[data-month-step]').forEach(function (button) {
    button.addEventListener('click', function () {
      var next = new Date(Date.UTC(year, month + Number(button.dataset.monthStep), 15)); year = next.getUTCFullYear(); month = next.getUTCMonth(); selectedDate = ''; renderDays(); renderList();
    });
  });
  document.querySelectorAll('[data-event-category]').forEach(function (button) {
    button.addEventListener('click', function () {
      category = button.dataset.eventCategory;
      document.querySelectorAll('[data-event-category]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); }); renderDays(); renderList();
    });
  });
  document.getElementById('calendar-reset').addEventListener('click', function () {
    selectedDate = ''; month = Number(today.slice(5, 7)) - 1; year = Number(today.slice(0, 4)); renderDays(); renderList();
  });
  renderDays(); renderList(); loadFeed();
})();
