const express = require('express');
const router = express.Router();

const OrderStatusController = require('../controllers/OrderStatusController');

router.get('/', OrderStatusController.getAll);

module.exports = router;