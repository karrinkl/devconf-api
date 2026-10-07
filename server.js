require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const speakerRoutes = require('./routes/speakerRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

/*
  Промежуточные обработчики.

  express.json разбирает тело запроса в формате JSON и кладёт результат
  в req.body: без него POST и PUT получали бы пустое тело.

  cors разрешает обращаться к API из браузера с другого адреса. Это
  понадобится, когда к серверу подключится клиентское приложение
  из предыдущих лабораторных работ: оно работает на другом порту,
  и без этого заголовка браузер запрос заблокирует.
*/
app.use(express.json());
app.use(cors());

// Проверка, что сервер запущен
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'DEVCONF 2026 API',
    endpoints: ['/api/speakers'],
  });
});

app.use('/api/speakers', speakerRoutes);

// Обработчики ошибок подключаются после всех маршрутов
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

/*
  Сервер начинает принимать запросы только после установленного
  соединения с базой: иначе первые запросы завершались бы ошибкой.
*/
async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
  });
}

start();

module.exports = app;
