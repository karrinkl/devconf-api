require('dotenv').config();

const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Speaker = require('../models/Speaker');

/*
  Наполнение базы демонстрационными данными.

  Список спикеров вынесен в data/speakers.js: он общий для этого
  скрипта и для скрипта локального запуска scripts/local.js.

  Запуск: npm run seed. Ключ --clear очищает коллекцию без записи
  новых документов: npm run seed:clear.
*/

const speakers = require('../data/speakers');

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
