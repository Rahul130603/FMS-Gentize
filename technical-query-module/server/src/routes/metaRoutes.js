const express = require('express');
const { authenticate } = require('../middleware/auth');
const metaController = require('../controllers/metaController');

const router = express.Router();
router.use(authenticate);

router.get('/lookups', metaController.getLookups);
router.get('/employees', metaController.listEmployees);

module.exports = router;
