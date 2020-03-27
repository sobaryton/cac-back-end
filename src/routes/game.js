const express = require('express');
const router = express.Router();

const gameCtrl = require('../controllers/game');

router.get('/:id', gameCtrl.getAGame);
router.post('/', gameCtrl.beginAGame);

module.exports = router;