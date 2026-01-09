//D3
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const InitController = require('../controllers/InitController');

router.post('/', authMiddleware.verifyToken, authMiddleware.checkRole(['PRACOWNIK']), InitController.init);

module.exports = router;