const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

router.get('/', userCtrl.getUserId);
router.put('/', userCtrl.updatePseudo);

module.exports = router;