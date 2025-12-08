//D3
const express = require('express');
const router = express.Router();

const InitController = require('../controllers/InitController');

router.post('/', InitController.init);

module.exports = router;