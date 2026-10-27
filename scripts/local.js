/*
  Локальный запуск без установленной MongoDB и без Docker.

  Пакет mongodb-memory-server при первом запуске скачивает официальный
  исполняемый файл mongod (около 70 МБ, кладётся в кеш
  ~/.cache/mongodb-binaries) и поднимает настоящий сервер MongoDB
  как дочерний процесс. Для Arch Linux у MongoDB нет своей сборки,
  пакет сам берёт сборку для Ubuntu 22.04, она работает на Arch.

  Данные хранятся в каталоге .mongo-data рядом с проектом и переживают
  перезапуск. Если коллекция спикеров пуста, она заполняется теми же
  восемью записями, что и по команде npm run seed.

  Запуск: npm run local. Остановка: Ctrl+C.

  Сервер слушает порт 27017, как обычная MongoDB, поэтому к нему можно
  подключиться из MongoDB Compass по адресу mongodb://127.0.0.1:27017.
  Если порт занят (например, уже запущен контейнер из docker-compose),
  выбирается свободный порт и адрес выводится в терминал.
*/

const fs = require('fs');
const net = require('net');
const path = require('path');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const Speaker = require('../models/Speaker');
const speakers = require('../data/speakers');

const DB_PATH = path.join(__dirname, '..', '.mongo-data');
const DB_NAME = 'devconf';
const PREFERRED_PORT = 27017;

function isPortFree(port) {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once('error', () => resolve(false))
      .once('listening', () => tester.close(() => resolve(true)))
      .listen(port, '127.0.0.1');
  });
}

async function seedIfEmpty(uri) {
  const connection = await mongoose.createConnection(uri).asPromise();
  const SpeakerModel = connection.model('Speaker', Speaker.schema);

  const count = await SpeakerModel.countDocuments();
  if (count === 0) {
    await SpeakerModel.insertMany(speakers);
    console.log(`База пуста, добавлено спикеров: ${speakers.length}`);
  } else {
    console.log(`В базе уже есть спикеров: ${count}`);
  }

  await connection.close();
}

async function main() {
  fs.mkdirSync(DB_PATH, { recursive: true });

  const port = (await isPortFree(PREFERRED_PORT)) ? PREFERRED_PORT : undefined;

  console.log('Запуск MongoDB (при первом запуске скачивается mongod, это займёт минуту)...');

  const mongod = await MongoMemoryServer.create({
    instance: {
      port,
      dbPath: DB_PATH,
      storageEngine: 'wiredTiger',
    },
  });

  const uri = mongod.getUri(DB_NAME);
  console.log(`MongoDB работает: ${uri}`);

  // dotenv не перезаписывает уже заданные переменные, поэтому server.js
  // возьмёт именно эту строку подключения, а не строку из .env
  process.env.MONGO_URI = uri;

  await seedIfEmpty(uri);

  const stop = async () => {
    console.log('\nОстановка...');
    await mongoose.connection.close().catch(() => {});
    // doCleanup: false сохраняет каталог .mongo-data для следующего запуска
    await mongod.stop({ doCleanup: false });
    process.exit(0);
  };

  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);

  require('../server');
}

main().catch((error) => {
  console.error(`Не удалось запустить локальную MongoDB: ${error.message}`);
  process.exit(1);
});
