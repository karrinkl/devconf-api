const mongoose = require('mongoose');

/**
 * Схема сущности «Спикер».
 *
 * Обязательные поля name и topic заданы по условию варианта 2.
 * Для каждого из них указано сообщение об ошибке на русском языке:
 * Mongoose подставит его в объект error.errors, а обработчик ошибок
 * вернёт клиенту в теле ответа со статусом 400.
 *
 * Параметр timestamps добавляет в документ поля createdAt и updatedAt,
 * которые Mongoose заполняет сам при создании и обновлении записи.
 */
const speakerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Имя спикера обязательно'],
      trim: true,
      minlength: [2, 'Имя спикера не короче 2 символов'],
      maxlength: [120, 'Имя спикера не длиннее 120 символов'],
    },
    topic: {
      type: String,
      required: [true, 'Тема доклада обязательна'],
      trim: true,
      minlength: [5, 'Тема доклада не короче 5 символов'],
      maxlength: [300, 'Тема доклада не длиннее 300 символов'],
    },
    photoUrl: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Speaker', speakerSchema);
