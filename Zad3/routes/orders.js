const express = require('express');
const router = express.Router();

const OrderController = require('../controllers/OrderController');

router.get('/', OrderController.getAll);
router.get('/:id', OrderController.getById);
router.post('/', OrderController.store);
router.get('/user/:userName', OrderController.getByUser);
router.get('/status/:status_id', OrderController.getByStatus);
router.patch('/:id', OrderController.updateStatus);

module.exports = router;