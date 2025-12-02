const express = require('express');
const router = express.Router();

const ProductsContorller = require('../controllers/ProductsController');

router.get('/', ProductsContorller.getAll);
router.get('/:id', ProductsContorller.getById);
router.post('/', ProductsContorller.store);
router.put('/:id', ProductsContorller.updateById);
router.put('/', ProductsContorller.updateById);

// D1
router.get('/:id/seo-description', ProductsContorller.getSeoDesc);


module.exports = router;