const express = require('express');
const auth = require('../middleware/auth');

const router = new express.Router();

const userCtrl = require('../controllers/user');

router.get('/', auth.authenticateWithAutologin, userCtrl.getUserId);
router.put('/', auth.authenticate, userCtrl.updatePseudo);
router.delete('/', auth.authenticate, userCtrl.logout);

module.exports = router;
