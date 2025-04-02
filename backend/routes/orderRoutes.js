const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Order routes
router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:orderId', orderController.getOrderById);

// M-PESA callback route (no auth required)
router.post('/mpesa/callback', orderController.handleMpesaCallback);

module.exports = router; 