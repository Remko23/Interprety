const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const OrderController = require('../controllers/OrderController');

router.get('/', authMiddleware.verifyToken, authMiddleware.checkRole(['PRACOWNIK']), OrderController.getAll);
router.get('/:id', authMiddleware.verifyToken, authMiddleware.checkRole(['PRACOWNIK']), OrderController.getById);
router.post('/', OrderController.store);
router.get('/user/:userName', authMiddleware.verifyToken, authMiddleware.checkRole(['KLIENT', 'PRACOWNIK']), OrderController.getByUser);
router.get('/status/:status_id', authMiddleware.verifyToken, authMiddleware.checkRole(['PRACOWNIK']), OrderController.getByStatus);
router.patch('/:id', authMiddleware.verifyToken, authMiddleware.checkRole(['PRACOWNIK']), OrderController.updateStatus);
router.post('/:id/opinions', authMiddleware.verifyToken, authMiddleware.checkRole(['KLIENT', 'PRACOWNIK']), OrderController.addOpinion);

module.exports = router;