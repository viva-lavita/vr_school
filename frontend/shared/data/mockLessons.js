export const subjects = [
  { id: 1, name: "Химия" },
  { id: 2, name: "Английский язык" },
  { id: 3, name: "Биология" },
  { id: 4, name: "География" },
];

const chemistryLessons = [
  {
    id: 1,
    subject: 1,
    name: "Погружение в строение атома",
    description:
      "Сценарий VR: ученик попадает внутрь атома и «собирает» его из протонов, нейтронов и электронов, наблюдая, как меняются элементы при изменении ядра.",
    image: "/images/vr-headset-portrait.png",
    status: "new",
  },
  {
    id: 2,
    subject: 1,
    name: "Тайны периодической системы Менделеева",
    description:
      "Сценарий VR: виртуальная прогулка по «городу элементов», где каждый район — группа периодической таблицы, и ученик ищет закономерности свойств веществ.",
    image: "/images/vr-headset-cutout.png",
    status: "in_progress",
  },
  {
    id: 3,
    subject: 1,
    name: "Как образуются химические связи",
    description:
      "Сценарий VR: симуляция взаимодействия атомов, где ученик «сводит» частицы и наблюдает образование ионной, ковалентной и металлической связи.",
    image: "/images/vr-headset-cutout-clear.png",
    status: "completed",
  },
  {
    id: 4,
    subject: 1,
    name: "Виртуальная лаборатория: типы химических реакций",
    description:
      "Сценарий VR: проведение экспериментов без риска — ученик смешивает вещества и наблюдает реакции в увеличенном масштабе с анимацией процессов.",
    image: "/images/book.png",
    status: "new",
  },
  {
    id: 17,
    subject: 1,
    name: "Кислоты, основания и соли",
    description:
      "Сценарий VR: ученик работает в виртуальной лаборатории, смешивая кислоты и основания, наблюдая нейтрализацию и изменение pH среды.",
    image: "/images/students-vr-duo.png",
    status: "new",
  },
  {
    id: 18,
    subject: 1,
    name: "Окислительно-восстановительные реакции",
    description:
      "Сценарий VR: визуализация переноса электронов между атомами, где ученик видит процессы окисления и восстановления в атомном масштабе.",
    image: "/images/vr-headset-portrait.png",
    status: "new",
  },
  {
    id: 19,
    subject: 1,
    name: "Химия углеводородов",
    description:
      "Сценарий VR: ученик строит молекулы углеводородов из 3D-моделей, изучая alkane, alkene и alkyne структуры.",
    image: "/images/vr-headset-cutout.png",
    status: "in_progress",
  },
  {
    id: 20,
    subject: 1,
    name: "Электролитическая диссоциация",
    description:
      "Сценарий VR: наблюдение за распадом веществ на ионы в растворе, визуализация движения ионов в электрическом поле.",
    image: "/images/vr-headset-cutout-clear.png",
    status: "new",
  },
  {
    id: 21,
    subject: 1,
    name: "Термодинамика химических процессов",
    description:
      "Сценарий VR: ученик управляет температурой и давлением в виртуальном реакторе, наблюдая влияние на равновесие реакций.",
    image: "/images/book.png",
    status: "new",
  },
  {
    id: 22,
    subject: 1,
    name: "Координационная химия",
    description:
      "Сценарий VR: изучение комплексных соединений, визуализация лигандного поля и кристаллического расщепления.",
    image: "/images/students-vr-duo.png",
    status: "new",
  },
  {
    id: 23,
    subject: 1,
    name: "Аналитическая химия: качественный анализ",
    description:
      "Сценарий VR: определение неизвестного вещества через серию виртуальных реакций с использованием реактивов.",
    image: "/images/vr-headset-portrait.png",
    status: "new",
  },
  {
    id: 24,
    subject: 1,
    name: "Органическая химия: функциональные группы",
    description:
      "Сценарий VR: путешествие по молекулам органических веществ, где ученик определяет функциональные группы и их свойства.",
    image: "/images/vr-headset-cutout.png",
    status: "completed",
  },
];

const englishLessons = [
  {
    id: 5,
    subject: 2,
    name: "Virtual School: Daily Routine",
    description:
      "Сценарий VR: ученик оказывается в виртуальной школе и выполняет задания на описание распорядка дня, используя новую лексику в контексте.",
    image: "/images/students-vr-duo.png",
    status: "new",
  },
  {
    id: 6,
    subject: 2,
    name: "City Tour: Prepositions of Place",
    description:
      "Сценарий VR: виртуальная экскурсия по городу, где ученик тренирует предлоги места, описывая расположение объектов на маршруте.",
    image: "/images/vr-headset-portrait.png",
    status: "in_progress",
  },
  {
    id: 7,
    subject: 2,
    name: "Job Interview: Future Tenses",
    description:
      "Сценарий VR: ученик проходит виртуальное собеседование на работу, практикуя конструкции с глаголами в будущем времени.",
    image: "/images/vr-headset-cutout.png",
    status: "new",
  },
  {
    id: 8,
    subject: 2,
    name: "Restaurant Roleplay: Ordering Food",
    description:
      "Сценарий VR: ученик посещает виртуальный ресторан и тренирует фразы для заказа еды и общения с официантом.",
    image: "/images/vr-headset-cutout-clear.png",
    status: "new",
  },
  {
    id: 25,
    subject: 2,
    name: "At the Airport: Travel Vocabulary",
    description:
      "Сценарий VR: ученик проходит через виртуальный аэропорт, практикуя лексику путешествий на стойке регистрации, досмотра и посадки.",
    image: "/images/book.png",
    status: "new",
  },
  {
    id: 26,
    subject: 2,
    name: "Shopping Mall: Comparative Adjectives",
    description:
      "Сценарий VR: сравнение товаров в виртуальном магазине, тренировка конструкций more...than и the most.",
    image: "/images/students-vr-duo.png",
    status: "in_progress",
  },
  {
    id: 27,
    subject: 2,
    name: "Weather Report: Present Continuous",
    description:
      "Сценарий VR: ученик работает виртуальным синоптиком, описывая погоду в разных городах мира в настоящем времени.",
    image: "/images/vr-headset-portrait.png",
    status: "new",
  },
  {
    id: 28,
    subject: 2,
    name: "Doctor's Office: Health Vocabulary",
    description:
      "Сценарий VR: визит к виртуальному врачу, где ученик описывает симптомы и понимает рекомендации на английском языке.",
    image: "/images/vr-headset-cutout.png",
    status: "new",
  },
  {
    id: 29,
    subject: 2,
    name: "Movie Theater: Past Simple Tense",
    description:
      "Сценарий VR: обсуждение просмотренного фильма, тренировка глаголов в прошедшем простом времени.",
    image: "/images/vr-headset-cutout-clear.png",
    status: "completed",
  },
  {
    id: 30,
    subject: 2,
    name: "Sports Stadium: Imperatives & Instructions",
    description:
      "Сценарий VR: тренер даёт указания виртуальной команде, ученик практикует императивы и инструкции.",
    image: "/images/book.png",
    status: "new",
  },
];

const biologyLessons = [
  {
    id: 9,
    subject: 3,
    name: "Строение клетки",
    description:
      "Сценарий VR: ученик «уменьшается» до размеров клетки и исследует её органеллы, изучая функции каждой из них.",
    image: "/images/book.png",
    status: "completed",
  },
  {
    id: 10,
    subject: 3,
    name: "Фотосинтез: путь от солнца к кислороду",
    description:
      "Сценарий VR: виртуальное путешествие внутри растения, где ученик наблюдает процесс фотосинтеза в реальном времени.",
    image: "/images/students-vr-duo.png",
    status: "new",
  },
  {
    id: 11,
    subject: 3,
    name: "Человеческое тело: скелет и мышцы",
    description:
      "Сценарий VR: ученик изучает строение скелета и мышечной системы, взаимодействуя с 3D-моделями частей тела.",
    image: "/images/vr-headset-portrait.png",
    status: "in_progress",
  },
  {
    id: 12,
    subject: 3,
    name: "Экосистемы и пищевые цепочки",
    description:
      "Сценарий VR: ученик попадает в различные экосистемы (лес, океан, пустыня) и наблюдает взаимодействие организмов.",
    image: "/images/vr-headset-cutout.png",
    status: "new",
  },
  {
    id: 31,
    subject: 3,
    name: "Генетика: от ДНК к фенотипу",
    description:
      "Сценарий VR: визуализация молекулы ДНК, транскрипции и трансляции, где ученик видит как гены определяют признаки организма.",
    image: "/images/vr-headset-cutout-clear.png",
    status: "new",
  },
  {
    id: 32,
    subject: 3,
    name: "Нервная система: путь нервного импульса",
    description:
      "Сценарий VR: путешествие по нервному волокну, наблюдение за передачей сигнала от рецептора к головному мозгу.",
    image: "/images/book.png",
    status: "new",
  },
  {
    id: 33,
    subject: 3,
    name: "Эволюция: от амёбы к человеку",
    description:
      "Сценарий VR: интерактивная временная шкала эволюции, где ученик наблюдает ключевые этапы развития живых организмов.",
    image: "/images/students-vr-duo.png",
    status: "in_progress",
  },
  {
    id: 34,
    subject: 3,
    name: "Микробиология: мир бактерий",
    description:
      "Сценарий VR: увеличение в тысячи раз для изучения формы, строения и способов размножения бактерий.",
    image: "/images/vr-headset-portrait.png",
    status: "new",
  },
  {
    id: 35,
    subject: 3,
    name: "Пищеварительная система: путь еды",
    description:
      "Сценарий VR: виртуальное путешествие пищевого комка по желудочно-кишечному тракту с наблюдением за процессами переваривания.",
    image: "/images/vr-headset-cutout.png",
    status: "completed",
  },
  {
    id: 36,
    subject: 3,
    name: "Растительная клетка vs Животная клетка",
    description:
      "Сценарий VR: сравнительный анализ двух типов клеток в виртуальной лаборатории с интерактивными моделями.",
    image: "/images/vr-headset-cutout-clear.png",
    status: "new",
  },
];

const geographyLessons = [
  {
    id: 13,
    subject: 4,
    name: "Путешествие по континентам",
    description:
      "Сценарий VR: ученик «переносится» на разные континенты, изучая их климат, рельеф и природные зоны.",
    image: "/images/vr-headset-cutout-clear.png",
    status: "new",
  },
  {
    id: 14,
    subject: 4,
    name: "Вулканы и землетрясения",
    description:
      "Сценарий VR: ученик наблюдает извержение вулкана и сейсмическую активность, изучая тектонику плит.",
    image: "/images/book.png",
    status: "in_progress",
  },
  {
    id: 15,
    subject: 4,
    name: "Водный мир: океаны и моря",
    description:
      "Сценарий VR: виртуальное погружение в Мировой океан, где ученик исследует подводный мир и изучает течения.",
    image: "/images/students-vr-duo.png",
    status: "new",
  },
  {
    id: 16,
    subject: 4,
    name: "Климат и погода",
    description:
      "Сценарий VR: ученик попадает в разные климатические пояса и наблюдает формирование погоды в реальном времени.",
    image: "/images/vr-headset-portrait.png",
    status: "completed",
  },
  {
    id: 37,
    subject: 4,
    name: "Рельеф России: от равнин до гор",
    description:
      "Сценарий VR: виртуальный полёт над территорией России, изучение основных форм рельефа и их особенностей.",
    image: "/images/vr-headset-cutout.png",
    status: "new",
  },
  {
    id: 38,
    subject: 4,
    name: "Население Земли: демография",
    description:
      "Сценарий VR: интерактивная карта населения мира, где ученик анализирует плотность, миграцию и урбанизацию.",
    image: "/images/vr-headset-cutout-clear.png",
    status: "new",
  },
  {
    id: 39,
    subject: 4,
    name: "Полезные ископаемые и недра Земли",
    description:
      "Сценарий VR: спуск в виртуальный шахту, изучение месторождений полезных ископаемых и способов добычи.",
    image: "/images/book.png",
    status: "in_progress",
  },
  {
    id: 40,
    subject: 4,
    name: "Реки и озёра: гидросфера",
    description:
      "Сценарий VR: виртуальное путешествие по крупнейшим рекам и озёрам мира, изучение их роли в природе и жизни человека.",
    image: "/images/students-vr-duo.png",
    status: "new",
  },
  {
    id: 41,
    subject: 4,
    name: "Природные зоны: от тундры до тропиков",
    description:
      "Сценарий VR: последовательное перемещение ученика через природные зоны с изучением флоры, фауны и климата каждой.",
    image: "/images/vr-headset-portrait.png",
    status: "completed",
  },
  {
    id: 42,
    subject: 4,
    name: "Картография: чтение карт",
    description:
      "Сценарий VR: интерактивное изучение условных знаков и масштабов на виртуальных картах разных типов.",
    image: "/images/vr-headset-cutout.png",
    status: "new",
  },
];

export const lessons = [
  ...chemistryLessons,
  ...englishLessons,
  ...biologyLessons,
  ...geographyLessons,
];
