/*
  Общая обработка ошибок.

  Express считает обработчиком ошибок функцию с четырьмя параметрами,
  поэтому параметр next в errorHandler обязателен, даже если не
  используется. Обработчик подключается последним, после всех
  маршрутов.
*/

/** Запрос к несуществующему адресу: 404. */
function notFound(req, res) {
  res.status(404).json({
    message: `Маршрут ${req.method} ${req.originalUrl} не существует`,
  });
}

/**
 * Разбор ошибки и выбор кода ответа.
 *
 * ValidationError возникает, когда нарушены правила схемы: не заполнено
 * обязательное поле или значение короче допустимого. Это ошибка клиента,
 * поэтому ответ со статусом 400 и перечнем полей.
 *
 * CastError возникает, когда строка в адресе не приводится к типу поля.
 * Для пути _id это означает, что идентификатор не является корректным
 * значением ObjectId, и запрос тоже считается ошибкой клиента.
 *
 * Код 11000 драйвер MongoDB возвращает при нарушении уникального
 * индекса. Остальные ошибки относятся к серверу: ответ со статусом 500.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Данные не прошли проверку',
      errors: Object.values(error.errors).map((item) => item.message),
    });
  }

  if (error.name === 'CastError' && error.path === '_id') {
    return res.status(400).json({
      message: `Значение ${error.value} не является корректным идентификатором`,
    });
  }

  if (error.code === 11000) {
    return res.status(400).json({
      message: 'Запись с такими данными уже существует',
      fields: Object.keys(error.keyValue || {}),
    });
  }

  console.error(error);

  res.status(500).json({
    message: 'Внутренняя ошибка сервера',
  });
}

module.exports = { notFound, errorHandler };
