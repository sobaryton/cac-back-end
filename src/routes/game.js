const express = require('express');

const router = new express.Router();

const {
  createAGame,
  getAGame,
  joinAGame,
  playACard,
  startAGame,
  voteForACard,
} = require('../controllers/game');

router.get('/:id', getAGame);
router.post('/', createAGame);
router.post('/:id/round/:roundId', playACard);
router.put('/:id', startAGame);
router.put('/:id/players', joinAGame);
router.put('/:id/round/:roundId/playedCards/:playedCardId', voteForACard);

module.exports = router;
