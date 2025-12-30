const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const IndexController = require('../controllers/IndexController');
const InitController = require('../controllers/InitController');
const OrderController = require('../controllers/OrderController');

const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const orderRoutes = require('./orders');
const statusRoutes = require('./statuses');
const userRoutes = require('./users');

router.get('/', IndexController.home);

router.post('/init', authMiddleware.verifyToken, authMiddleware.checkRole(['PRACOWNIK']), InitController.init);
router.get('/opinions', OrderController.getOpinions);

router.use('/users', userRoutes);

router.use('/categories', categoryRoutes);
router.use('/status', statusRoutes);

router.use(authMiddleware.verifyToken);

router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

module.exports = router;