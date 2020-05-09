const express = require('express');

const router = new express.Router();

const userCtrl = require('../controllers/user');

router.get('/', userCtrl.getUserId);
router.put('/', userCtrl.updatePseudo);
router.delete('/', userCtrl.logout);

module.exports = router;
