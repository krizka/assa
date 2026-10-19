/* =========================================================
   АССА — настройки сайта
   Здесь меняются ссылки на Скул Мастер (личный кабинет,
   регистрация, курсы), телефоны и соцсети. HTML править не нужно.
   ========================================================= */
window.ASSA_CONFIG = {

  /* --- Скул Мастер (LMS) --- */
  lms: {
    /* адрес вашей школы в Скул Мастере, например 'https://assa.skoolmaster.ru' */
    base: 'https://academy.alva.club',
    /* вход в личный кабинет ученика */
    cabinet: 'https://academy.alva.club/',
    /* страница регистрации / первого шага (кнопка «НАЧАТЬ ОБУЧЕНИЕ») */
    start: '#start',
    /* ссылки на конкретные курсы в LMS: ключ = data-lms-course="..." в HTML */
    courses: {
      school9:   '',   // Школа 9 ступеней
      firststep: '',   // Программа «Первый шаг»
      bank:      '',   // Банк интеллектуальных тренировок
      circle:    '',   // Круги
      eniyoga:   ''    // Энийога
    }
  },

  /* Реальные платёжные ссылки Школы. Пустое значение — запрос у куратора. */
  schoolPayments: {
    step1: '',
    step1Pair: '',
    step2: '',
    step2Pair: '',
    step3: '',
    step3Pair: '',
    step4: '',
    step4Pair: '',
    step5: '',
    step5Pair: '',
    step6: '',
    step6Pair: '',
    step7: '',
    step7Pair: '',
    step8: '',
    step8Pair: '',
    step9: '',
    step9Pair: '',
    steps1to3: '',
    steps4to6: '',
    steps7to9: '',
    annual: ''
  },

  /* Заказы: paymentUrl — ссылка на оплату; bookingUrl — календарь / форма брони.
     Пустые ссылки открывают подготовленную заявку в Telegram. */
  orders: { contact: "https://t.me/olemirbraun" },
  offers: {
      "school.step1": {
          "title": "1-я ступень — за одного",
          "price": "10 600 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.step1Pair": {
          "title": "1-я ступень — за двоих",
          "price": "14 500 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.step2": {
          "title": "2-я ступень — за одного",
          "price": "12 500 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.step2Pair": {
          "title": "2-я ступень — за двоих",
          "price": "17 700 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.step3": {
          "title": "3-я ступень — за одного",
          "price": "15 800 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.step3Pair": {
          "title": "3-я ступень — за двоих",
          "price": "22 600 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.step4": {
          "title": "4-я ступень — за одного",
          "price": "17 100 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.step4Pair": {
          "title": "4-я ступень — за двоих",
          "price": "24 200 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.step5": {
          "title": "5-я ступень — за одного",
          "price": "18 100 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.step5Pair": {
          "title": "5-я ступень — за двоих",
          "price": "25 900 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.step6": {
          "title": "6-я ступень — за одного",
          "price": "19 300 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.step6Pair": {
          "title": "6-я ступень — за двоих",
          "price": "27 900 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.step7": {
          "title": "7-я ступень — за одного",
          "price": "20 800 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.step7Pair": {
          "title": "7-я ступень — за двоих",
          "price": "29 900 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.step8": {
          "title": "8-я ступень — за одного",
          "price": "23 100 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.step8Pair": {
          "title": "8-я ступень — за двоих",
          "price": "33 200 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.step9": {
          "title": "9-я ступень — за одного",
          "price": "27 500 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.step9Pair": {
          "title": "9-я ступень — за двоих",
          "price": "36 500 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.steps1to3": {
          "title": "Школа: ступени 1–3",
          "price": "29 400 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.steps4to6": {
          "title": "Школа: ступени 4–6",
          "price": "45 700 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.steps7to9": {
          "title": "Школа: ступени 7–9",
          "price": "59 800 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.annual": {
          "title": "Школа: годовая программа",
          "price": "Стоимость и состав уточняются у куратора",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "school.enroll": {
          "title": "Поступление в Школу 9 ступеней",
          "price": "По выбранной ступени или программе",
          "conditions": "Выберите ступень или пакет обучения на странице Школы.",
          "contact": "https://t.me/olemirbraun",
          "details": "school.html#school-payment",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "firststep.standard": {
          "title": "Программа «Первый шаг»",
          "price": "21 800 ₽",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "first-step.html#price",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "firststep.early": {
          "title": "«Первый шаг» — ранняя оплата",
          "price": "15 300 ₽",
          "conditions": "Если оплата проходит до объявленного организационного собрания и старта программы.",
          "contact": "https://t.me/olemirbraun",
          "details": "first-step.html#price",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "firststep.step1": {
          "title": "«Первый шаг» + 1 ступень Школы",
          "price": "27 200 ₽",
          "conditions": "При одновременной оплате обеих программ – скидка 5 200 ₽.",
          "contact": "https://t.me/olemirbraun",
          "details": "first-step.html#price",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "firststep.steps1to3": {
          "title": "«Первый шаг» + три ступени Школы",
          "price": "45 700 ₽",
          "conditions": "Наибольшая скидка при единовременной оплате – 5 500 ₽.",
          "contact": "https://t.me/olemirbraun",
          "details": "first-step.html#price",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "bank.access": {
          "title": "Банк интеллектуальных тренировок",
          "price": "Стоимость и условия доступа уточняются у куратора",
          "conditions": "",
          "contact": "https://t.me/olemirbraun",
          "details": "first-step.html#bank",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "consultation.first": {
          "title": "Первичные консультации для новичков",
          "price": "7 500 ₽ / час",
          "conditions": "На первой консультации обсуждаем ваш запрос и методы работы. Стоимость — 7 500 рублей за час. Условия оплаты и рассрочки согласуйте с куратором. Выбранное время подтверждается после оплаты.",
          "contact": "https://t.me/olemirbraun",
          "details": "practice.html#consultation-prices",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "consultation.support": {
          "title": "Люди в тяжелом состоянии",
          "price": "без оплаты",
          "conditions": "При тяжелых заболеваниях и опасных обстоятельствах первичная работа проводится без оплаты. После стабилизации человек сам принимает решение о дальнейшей работе.",
          "contact": "https://t.me/olemirbraun",
          "details": "practice.html#consultation-prices",
          "paymentUrl": "",
          "bookingUrl": "",
          "bookingOnly": true
      },
      "consultation.student": {
          "title": "Консультации для учеников Академии",
          "price": "5 000 ₽ / час",
          "conditions": "Для обучающихся в программах, курсах и школах Академии. Условия оплаты и рассрочки согласуйте с куратором. Выбранное время подтверждается после оплаты.",
          "contact": "https://t.me/olemirbraun",
          "details": "practice.html#consultation-prices",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "consultation.family": {
          "title": "Семейные консультации",
          "price": "5 000 ₽ / час",
          "conditions": " Условия оплаты и рассрочки согласуйте с куратором. Выбранное время подтверждается после оплаты.",
          "contact": "https://t.me/olemirbraun",
          "details": "practice.html#consultation-prices",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "consultation.master": {
          "title": "Мастерское обучение",
          "price": "индивидуально",
          "conditions": "Согласовывается индивидуально. Индивидуальное обучение неэффективно и может усилить Эго – мы рекомендуем обучаться в группах: Школа 9 ступеней, программа «Первый шаг», курсы и Круги. Условия оплаты и рассрочки согласуйте с куратором. Выбранное время подтверждается после оплаты.",
          "contact": "https://t.me/olemirbraun",
          "details": "practice.html#consultation-prices",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "consultation.teacher": {
          "title": "Работа с основателем Академии (Учителем)",
          "price": "10 000 ₽ / час",
          "conditions": "Абсолютное условие – НЕОБХОДИМОСТЬ. Стоимость для учеников Академии. С новичками Учитель не работает: сначала нужно пройти обучение и индивидуальные консультации с кураторами. Условия оплаты и рассрочки согласуйте с куратором. Выбранное время подтверждается после оплаты.",
          "contact": "https://t.me/Irina_Savelyeva",
          "details": "practice.html#consultation-prices",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "circle.session": {
          "title": "Участие в Круге — одно занятие",
          "price": "1 500 ₽",
          "conditions": "Одно занятие — 3 часа. Дату и подходящий Круг согласуйте с куратором.",
          "contact": "https://t.me/Katyakh2023",
          "details": "practice.html#circles",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "circle.selfknowledge": {
          "title": "Круг «Самознание»",
          "price": "Условия участия уточняются у куратора",
          "conditions": "Актуальные даты и условия согласуйте с куратором.",
          "contact": "https://t.me/Katyakh2023",
          "details": "practice.html#circles",
          "paymentUrl": "",
          "bookingUrl": ""
      },
      "eniyoga.class": {
          "title": "Энийога — занятие",
          "price": "Стоимость уточняется у тренера",
          "conditions": "Регулярные онлайн-занятия в группе Энерго-Информационной Йоги в Telegram.",
          "contact": "https://t.me/katyagalani",
          "details": "yoga.html",
          "paymentUrl": "",
          "bookingUrl": ""
      }
  },

  /* Расписание: только подтвержденные публичные события.
     bookingUrl специалиста — его страница свободных слотов School Master. */
  schedule: {
      "calendarUrl": "https://academy.alva.club/event-calendar",
      "feedUrl": "data/calendar.json",
      "timezone": "Europe/Moscow",
      "bookingFlow": "slot-first",
      "events": [],
      "specialists": [
          {
              "id": "irina",
              "name": "Ирина Владимировна Савельева",
              "role": "Учитель Академии",
              "image": "images/generated/teacher-irina-portrait.webp",
              "contact": "https://t.me/Irina_Savelyeva",
              "bookingUrl": "",
              "offers": [
                  "consultation.teacher"
              ]
          },
          {
              "id": "ekaterina",
              "name": "Екатерина Хмелева",
              "role": "Куратор · директор",
              "image": "images/team/ekaterina-khmeleva.webp",
              "contact": "https://t.me/Katyakh2023",
              "bookingUrl": "",
              "offers": [
                  "consultation.first",
                  "consultation.student",
                  "consultation.family",
                  "consultation.master",
                  "consultation.support"
              ]
          },
          {
              "id": "olga",
              "name": "Ольга Мир",
              "role": "Куратор Школы · эвотренер «Первого шага»",
              "image": "images/team/olga-mir.webp",
              "contact": "https://t.me/olemirbraun",
              "bookingUrl": "",
              "offers": [
                  "consultation.first",
                  "consultation.student",
                  "consultation.family",
                  "consultation.master",
                  "consultation.support"
              ]
          },
          {
              "id": "eduard",
              "name": "Эдуард Кондратьев",
              "role": "Бизнес-консультант · куратор Школы",
              "image": "images/team/eduard-kondratyev.webp",
              "contact": "https://t.me/KondratyevEV",
              "bookingUrl": "",
              "offers": [
                  "consultation.first",
                  "consultation.student",
                  "consultation.family",
                  "consultation.master",
                  "consultation.support"
              ]
          },
          {
              "id": "yoga",
              "name": "Екатерина Ивановская",
              "role": "Тренер Энийоги",
              "image": "images/team/ekaterina-ivanovskaya.jpg",
              "contact": "https://t.me/katyagalani",
              "bookingUrl": "",
              "offers": [
                  "eniyoga.class"
              ]
          }
      ]
  },

  /* --- телефоны (показываются в шапке и в меню) --- */
  phones: ['+7 8356376973', '+7 8356376973'],

  /* --- соцсети (иконки в шапке и подвале) --- */
  socials: {
    youtube:  'https://www.youtube.com/@ASSAALVA',
    vk:       'https://vk.com/academiya_alva',
    ok:       '',                       // Одноклассники — пока нет
    telegram: 'https://t.me/ASSALVA'
  }
};
