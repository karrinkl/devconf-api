const express = require('express');

const {
  getSpeakers,
  getSpeakerById,
  createSpeaker,
  updateSpeaker,
  deleteSpeaker,
} = require('../controllers/speakerController');

const router = express.Router();

/*
  Маршруты сущности «Спикер». Префикс /api/speakers задан в server.js,
  поэтому здесь указаны только оставшиеся части адреса.

  Методы с одинаковым путём объединены цепочкой route: так видно,
  что адрес /api/speakers обрабатывает и получение списка, и создание
  записи, а различает их метод запроса.
*/

router.route('/').get(getSpeakers).post(createSpeaker);

router.route('/:id').get(getSpeakerById).put(updateSpeaker).delete(deleteSpeaker);

module.exports = router;
