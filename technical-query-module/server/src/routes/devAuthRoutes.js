const express = require('express');
const devAuthController = require('../controllers/devAuthController');

const router = express.Router();

router.post('/login', devAuthController.login);
router.get('/demo-users', devAuthController.listDemoUsers);

module.exports = router;
