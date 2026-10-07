const mongoose = require('mongoose');

/**
 * Подключение к MongoDB.
 *
 * Строка подключения не хранится в коде: её читает библиотека dotenv
 * из файла .env, который исключён из репозитория. Это позволяет
 * держать в разных окружениях разные базы и не публиковать пароль
 * от облачного кластера MongoDB Atlas.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('Переменная MONGO_URI не задана. Скопируйте .env.example в .env');
    process.exit(1);
  }

  try {
    const connection = await mongoose.connect(uri);
    console.log(
      `MongoDB подключена: ${connection.connection.host}, база ${connection.connection.name}`
    );
  } catch (error) {
    console.error(`Не удалось подключиться к MongoDB: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
