require('dotenv').config();

const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Speaker = require('../models/Speaker');

/*
  Наполнение базы демонстрационными данными.

  Спикеры те же, что в клиентском приложении лабораторных работ
  № 23 и № 25, поэтому список в базе совпадает со списком на сайте.

  Запуск: npm run seed. Ключ --clear очищает коллекцию без записи
  новых документов: npm run seed:clear.
*/

const speakers = [
  {
    name: 'Алексей Ковалёв',
    topic: 'Трекинг объектов в реальном времени: от YOLO до DeepSORT',
    photoUrl: '/images/speaker-01-1x.webp',
  },
  {
    name: 'Дарья Мельник',
    topic: 'Дизайн-система без боли: что ломается на втором году',
    photoUrl: '/images/speaker-02-1x.webp',
  },
  {
    name: 'Игорь Савчук',
    topic: 'Наблюдаемость сервисов: метрики, которые правда нужны',
    photoUrl: '/images/speaker-03-1x.webp',
  },
  {
    name: 'Марина Ярош',
    topic: 'Компонентные библиотеки: когда брать готовую, а когда свою',
    photoUrl: '/images/speaker-04-1x.webp',
  },
  {
    name: 'Павел Бортник',
    topic: 'Потоковая обработка видео: архитектура без лишних копий',
    photoUrl: '/images/speaker-05-1x.webp',
  },
  {
    name: 'Ольга Лагун',
    topic: 'Тестирование интерфейсов: визуальные регрессии в CI',
    photoUrl: '/images/speaker-06-1x.webp',
  },
  {
    name: 'Антон Демчук',
    topic: 'Защита фронтенда: CSP, зависимости и чужой код в сборке',
    photoUrl: '/images/speaker-07-1x.webp',
  },
  {
    name: 'Вероника Руденко',
    topic: 'Рефакторинг легаси-интерфейса без остановки продукта',
    photoUrl: '/images/speaker-08-1x.webp',
  },
];

async function run() {
  await connectDB();

  const clearOnly = process.argv.includes('--clear');

  const removed = await Speaker.deleteMany({});
  console.log(`Удалено документов: ${removed.deletedCount}`);

  if (!clearOnly) {
    const created = await Speaker.insertMany(speakers);
    console.log(`Добавлено спикеров: ${created.length}`);
  }

  await mongoose.connection.close();
  console.log('Соединение с базой закрыто');
}

run().catch(async (error) => {
  console.error(`Ошибка наполнения базы: ${error.message}`);
  await mongoose.connection.close();
  process.exit(1);
});
