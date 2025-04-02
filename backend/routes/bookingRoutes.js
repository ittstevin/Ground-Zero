const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Booking routes
router.post('/', bookingController.createBooking);
router.get('/', bookingController.getUserBookings);
router.get('/:bookingId', bookingController.getBookingById);
router.put('/:bookingId/cancel', bookingController.cancelBooking);

module.exports = router; 