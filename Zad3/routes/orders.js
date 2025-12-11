const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const OrderController = require('../controllers/OrderController');

router.get('/', authMiddleware.checkRole(['PRACOWNIK']), OrderController.getAll);
router.get('/:id', authMiddleware.checkRole(['PRACOWNIK']), OrderController.getById);
router.post('/', authMiddleware.checkRole(['KLIENT', 'PRACOWNIK']), OrderController.store);
router.get('/user/:userName', authMiddleware.checkRole(['KLIENT', 'PRACOWNIK']), OrderController.getByUser);
router.get('/status/:status_id', authMiddleware.checkRole(['PRACOWNIK']), OrderController.getByStatus);
router.patch('/:id', authMiddleware.checkRole(['PRACOWNIK']), OrderController.updateStatus);
router.post('/:id/opinion', authMiddleware.checkRole(['KLIENT', 'PRACOWNIK']), OrderController.addOpinion);

module.exports = router;