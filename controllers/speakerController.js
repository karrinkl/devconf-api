const Speaker = require('../models/Speaker');

/*
  Контроллеры сущности «Спикер».

  Каждая функция асинхронная и обёрнута в try...catch: ошибка запроса
  к базе не должна обрушивать процесс сервера. Ошибки, которые
  невозможно разобрать здесь, передаются дальше вызовом next(error)
  в общий обработчик, он и формирует ответ со статусом 500.
*/

/**
 * GET /api/speakers
 * Список всех спикеров, новые записи выше.
 * Успех: 200 и массив документов.
 */
async function getSpeakers(req, res, next) {
  try {
    const speakers = await Speaker.find().sort({ createdAt: -1 });

    res.status(200).json({
      count: speakers.length,
      data: speakers,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/speakers/:id
 * Один спикер по идентификатору.
 * Успех: 200. Запись не найдена: 404. Идентификатор неверного вида: 400.
 */
async function getSpeakerById(req, res, next) {
  try {
    const speaker = await Speaker.findById(req.params.id);

    if (!speaker) {
      return res.status(404).json({
        message: `Спикер с идентификатором ${req.params.id} не найден`,
      });
    }

    res.status(200).json({ data: speaker });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/speakers
 * Создание спикера.
 * Успех: 201 и созданный документ. Нарушена валидация схемы: 400.
 */
async function createSpeaker(req, res, next) {
  try {
    const { name, topic, photoUrl } = req.body;

    const speaker = await Speaker.create({ name, topic, photoUrl });

    res.status(201).json({
      message: 'Спикер создан',
      data: speaker,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/speakers/:id
 * Обновление спикера.
 *
 * Параметр new возвращает документ уже после изменения, а не до него.
 * Параметр runValidators заставляет Mongoose проверить правила схемы
 * и при обновлении: без него пустое имя записалось бы в базу.
 *
 * В объект обновления попадают только переданные поля, поэтому запрос
 * с одним полем topic меняет тему доклада и не затирает имя спикера.
 *
 * Успех: 200. Запись не найдена: 404. Нарушена валидация: 400.
 */
async function updateSpeaker(req, res, next) {
  try {
    const { name, topic, photoUrl } = req.body;
    const update = {};

    if (name !== undefined) update.name = name;
    if (topic !== undefined) update.topic = topic;
    if (photoUrl !== undefined) update.photoUrl = photoUrl;

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        message: 'Тело запроса пустое: укажите хотя бы одно поле',
      });
    }

    const speaker = await Speaker.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!speaker) {
      return res.status(404).json({
        message: `Спикер с идентификатором ${req.params.id} не найден`,
      });
    }

    res.status(200).json({
      message: 'Спикер обновлён',
      data: speaker,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/speakers/:id
 * Удаление спикера.
 * Успех: 200 и удалённый документ. Запись не найдена: 404.
 */
async function deleteSpeaker(req, res, next) {
  try {
    const speaker = await Speaker.findByIdAndDelete(req.params.id);

    if (!speaker) {
      return res.status(404).json({
        message: `Спикер с идентификатором ${req.params.id} не найден`,
      });
    }

    res.status(200).json({
      message: 'Спикер удалён',
      data: speaker,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSpeakers,
  getSpeakerById,
  createSpeaker,
  updateSpeaker,
  deleteSpeaker,
};
