const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const ProductsController = require('../controllers/ProductsController');

router.get('/', authMiddleware.checkRole(['KLIENT', 'PRACOWNIK']), ProductsController.getAll);
router.get('/:id', authMiddleware.checkRole(['KLIENT', 'PRACOWNIK']), ProductsController.getById);

router.get('/:id/seo-description', authMiddleware.checkRole(['KLIENT', 'PRACOWNIK']), ProductsController.getSeoDesc);

router.post('/', authMiddleware.checkRole(['PRACOWNIK']), ProductsController.store);

router.put('/:id', authMiddleware.checkRole(['PRACOWNIK']), ProductsController.updateById);

module.exports = router;