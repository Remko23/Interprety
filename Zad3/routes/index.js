const express = require('express');
const router = express.Router();

const IndexController = require('../controllers/IndexController');

router.get('/', IndexController.home);

const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const orderRoutes = require('./orders');
const statusRoutes = require('./statuses');
const initsRoutes = require('./init');

router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/status', statusRoutes);
router.use('/init', initsRoutes);


module.exports = router;