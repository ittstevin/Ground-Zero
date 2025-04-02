const express = require('express');
const router = express.Router();
const { db } = require('../firebase-config');
const moment = require('moment');

// Middleware to verify Firebase ID token
const authenticateUser = async (req, res, next) => {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get available time slots
router.get('/slots', async (req, res) => {
  try {
    const { date } = req.query;
    const startOfDay = moment(date).startOf('day');
    const endOfDay = moment(date).endOf('day');

    const bookingsSnapshot = await db.collection('bookings')
      .where('date', '>=', startOfDay.toDate())
      .where('date', '<=', endOfDay.toDate())
      .where('status', '==', 'confirmed')
      .get();

    const bookedSlots = new Set();
    bookingsSnapshot.forEach(doc => {
      const booking = doc.data();
      bookedSlots.add(booking.timeSlot);
    });

    // Generate available slots (9 AM to 10 PM, 1-hour slots)
    const availableSlots = [];
    for (let hour = 9; hour < 22; hour++) {
      if (!bookedSlots.has(hour)) {
        availableSlots.push({
          time: `${hour}:00`,
          available: true
        });
      }
    }

    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching available slots' });
  }
});

// Create a new booking
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { date, timeSlot, duration } = req.body;
    
    // Validate booking time
    const bookingDate = moment(date);
    const now = moment();
    if (bookingDate.isBefore(now)) {
      return res.status(400).json({ error: 'Cannot book for past dates' });
    }

    // Check if slot is available
    const existingBooking = await db.collection('bookings')
      .where('date', '==', bookingDate.toDate())
      .where('timeSlot', '==', timeSlot)
      .where('status', '==', 'confirmed')
      .get();

    if (!existingBooking.empty) {
      return res.status(400).json({ error: 'Time slot is already booked' });
    }

    // Create booking
    const booking = {
      userId: req.user.uid,
      date: bookingDate.toDate(),
      timeSlot,
      duration,
      status: 'pending',
      createdAt: new Date(),
      expiryTime: moment().add(1, 'hour').toDate()
    };

    const docRef = await db.collection('bookings').add(booking);
    res.status(201).json({ id: docRef.id, ...booking });
  } catch (error) {
    res.status(500).json({ error: 'Error creating booking' });
  }
});

// Confirm booking
router.put('/:bookingId/confirm', authenticateUser, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const bookingRef = db.collection('bookings').doc(bookingId);
    
    const booking = await bookingRef.get();
    if (!booking.exists) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const bookingData = booking.data();
    if (bookingData.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (bookingData.status !== 'pending') {
      return res.status(400).json({ error: 'Booking cannot be confirmed' });
    }

    await bookingRef.update({
      status: 'confirmed',
      confirmedAt: new Date()
    });

    res.json({ message: 'Booking confirmed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error confirming booking' });
  }
});

// Cancel booking
router.put('/:bookingId/cancel', authenticateUser, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const bookingRef = db.collection('bookings').doc(bookingId);
    
    const booking = await bookingRef.get();
    if (!booking.exists) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const bookingData = booking.data();
    if (bookingData.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!['pending', 'confirmed'].includes(bookingData.status)) {
      return res.status(400).json({ error: 'Booking cannot be cancelled' });
    }

    await bookingRef.update({
      status: 'cancelled',
      cancelledAt: new Date()
    });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error cancelling booking' });
  }
});

module.exports = router; 