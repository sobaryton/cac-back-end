const express = require('express');
const router = express.Router();

const gameCtrl = require('../controllers/game');

router.get('/:id', gameCtrl.getAGame);
router.post('/', gameCtrl.createAGame);
router.post('/:id/round/:roundId', gameCtrl.playACard);
router.put('/:id', gameCtrl.startAGame);
router.put('/:id/round/:roundId/playedCards/:playedCardId', gameCtrl.voteForACard);

module.exports = router;