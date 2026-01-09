const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const ProductsController = require('../controllers/ProductsController');

router.get('/', ProductsController.getAll);
router.get('/:id', ProductsController.getById);

router.get('/:id/seo-description', authMiddleware.verifyToken, authMiddleware.checkRole(['KLIENT', 'PRACOWNIK']), ProductsController.getSeoDesc);

router.post('/', authMiddleware.verifyToken, authMiddleware.checkRole(['PRACOWNIK']), ProductsController.store);

router.put('/:id', authMiddleware.verifyToken, authMiddleware.checkRole(['PRACOWNIK']), ProductsController.updateById);

module.exports = router;