# DEVCONF 2026 API - REST-сервис для сущности «Спикер»

Лабораторная работа № 28. Простое API на Node.js и Express с хранением
данных в MongoDB.

Вариант 2: лендинг IT-конференции. Сервис обслуживает сущность «Спикер»
и в дальнейшем станет источником данных для клиентского приложения
из лабораторных работ № 23 и № 25.

## Стек

- Node.js и Express 4 - HTTP-сервер и маршрутизация
- MongoDB и Mongoose 8 - база данных и схема документов
- dotenv - чтение настроек из файла `.env`
- cors - доступ к API из браузера с другого адреса
- nodemon - перезапуск сервера при правках, только для разработки

## Требования

- Node.js версии 18 или новее
- MongoDB: любой из трёх вариантов ниже, проще всего первый
- Postman или Insomnia для проверки запросов

Arch Linux:

```bash
sudo pacman -S nodejs npm git
yay -S postman-bin          # клиент Postman из AUR
```

## Установка

```bash
git clone https://github.com/karrinkl/devconf-api.git
cd devconf-api
npm install
cp .env.example .env
```

## Запуск

### Вариант 1. Одной командой, без установки MongoDB и Docker

```bash
npm run local
```

Скрипт `scripts/local.js` поднимает настоящий сервер MongoDB через пакет
mongodb-memory-server: при первом запуске скачивается официальный
`mongod` (около 70 МБ, кеш в `~/.cache/mongodb-binaries`), дальше запуск
занимает пару секунд. Для Arch Linux у MongoDB нет отдельной сборки,
пакет сам берёт сборку для Ubuntu 22.04, она работает на Arch.

Данные лежат в каталоге `.mongo-data` и сохраняются между запусками.
Если коллекция пуста, в неё автоматически записываются восемь спикеров.
В терминале появятся строки:

```
MongoDB работает: mongodb://127.0.0.1:27017/devconf
В базе уже есть спикеров: 8
MongoDB подключена: 127.0.0.1, база devconf
Сервер запущен: http://localhost:5000
```

Остановка: Ctrl+C.

### Вариант 2. MongoDB в Docker

Arch Linux, один раз:

```bash
sudo pacman -S docker docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker $USER      # затем перелогиниться
```

Только база в контейнере, сервер на своей машине:

```bash
docker compose up -d mongo
npm run seed
npm run dev
```

Или база и сервер вместе в контейнерах:

```bash
docker compose up -d --build
docker compose exec api npm run seed
docker compose logs -f api
docker compose down
```

Внутри контейнера строка подключения `mongodb://mongo:27017/devconf`,
снаружи `mongodb://127.0.0.1:27017/devconf`, её и содержит `.env`.

### Вариант 3. MongoDB Atlas

В файле `.env` строка подключения меняется на строку облачного
кластера (Atlas, раздел Connect, пункт Drivers):

```
MONGO_URI=mongodb+srv://<пользователь>:<пароль>@<кластер>.mongodb.net/devconf?retryWrites=true&w=majority
```

Затем:

```bash
npm run seed
npm run dev
```

### Команды

| Команда | Что делает |
|---|---|
| `npm run local` | MongoDB и сервер одной командой, без Docker |
| `npm run dev` | сервер с перезапуском при правках (nodemon) |
| `npm start` | обычный запуск сервера |
| `npm run seed` | очистить коллекцию и записать восемь спикеров |
| `npm run seed:clear` | только очистить коллекцию |

После запуска сервер отвечает по адресу http://localhost:5000.

## Схема данных

Файл `models/Speaker.js`:

| Поле | Тип | Правила |
|---|---|---|
| `name` | String | Обязательно, от 2 до 120 символов, пробелы по краям обрезаются |
| `topic` | String | Обязательно, от 5 до 300 символов |
| `photoUrl` | String | Необязательно, по умолчанию пустая строка |
| `createdAt` | Date | Проставляется Mongoose при создании |
| `updatedAt` | Date | Обновляется Mongoose при изменении |

Поле `_id` создаёт MongoDB. Параметр `versionKey: false` убирает
служебное поле `__v` из ответов.

## Эндпоинты

Базовый адрес: `http://localhost:5000/api/speakers`

| Метод | URL | Назначение | Коды ответа |
|---|---|---|---|
| GET | `/api/speakers` | Список всех спикеров | 200, 500 |
| GET | `/api/speakers/:id` | Один спикер по идентификатору | 200, 400, 404, 500 |
| POST | `/api/speakers` | Создание спикера | 201, 400, 500 |
| PUT | `/api/speakers/:id` | Обновление спикера | 200, 400, 404, 500 |
| DELETE | `/api/speakers/:id` | Удаление спикера | 200, 400, 404, 500 |

### Пример создания

Запрос `POST /api/speakers`:

```json
{
  "name": "Екатерина Сидорук",
  "topic": "Бэкенд на Express: что ломается при росте нагрузки",
  "photoUrl": "/images/speaker-09-1x.webp"
}
```

Ответ, код 201:

```json
{
  "message": "Спикер создан",
  "data": {
    "_id": "6723a1f4c2b7e81f4c9d2a10",
    "name": "Екатерина Сидорук",
    "topic": "Бэкенд на Express: что ломается при росте нагрузки",
    "photoUrl": "/images/speaker-09-1x.webp",
    "createdAt": "2026-10-07T09:14:28.431Z",
    "updatedAt": "2026-10-07T09:14:28.431Z"
  }
}
```

### Пример ошибки валидации

Запрос `POST /api/speakers` с пустым телом, ответ с кодом 400:

```json
{
  "message": "Данные не прошли проверку",
  "errors": ["Имя спикера обязательно", "Тема доклада обязательна"]
}
```

## Проверка в Postman

В каталоге `postman` лежит готовая коллекция запросов. В Postman
её подключает кнопка Import, после чего достаточно выполнить запросы
по порядку: первый сохраняет идентификатор созданной записи
в переменную коллекции `speakerId`, и следующие запросы подставляют
его сами.

Коллекция содержит семь запросов: пять CRUD-операций и две проверки
обработки ошибок, с кодами 400 и 404.

## Структура проекта

```
devconf-api/
├── server.js                      создание приложения и запуск сервера
├── config/db.js                   подключение к MongoDB
├── models/Speaker.js              схема и модель сущности
├── controllers/speakerController.js  логика CRUD-операций
├── routes/speakerRoutes.js        маршруты /api/speakers
├── middleware/errorHandler.js     обработка ошибок и несуществующих адресов
├── data/speakers.js               демонстрационные спикеры
├── scripts/seed.js                наполнение базы демонстрационными данными
├── scripts/local.js               запуск MongoDB и сервера без Docker
├── docker-compose.yml             MongoDB и сервер в контейнерах
├── postman/                       коллекция запросов для Postman
└── .env.example                   образец файла настроек
```

Логика разнесена по слоям: маршрут только связывает адрес и метод
с функцией, контроллер обращается к базе через модель, модель описывает
документ. Такое разделение позволяет добавить вторую сущность, например
доклад, не трогая существующие файлы.
