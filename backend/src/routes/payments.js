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

// Calculate booking cost
const calculateCost = (duration) => {
  // Example pricing: $5 per hour
  return duration * 5;
};

// Initiate payment
router.post('/initiate', authenticateUser, async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    // Get booking details
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
      return res.status(400).json({ error: 'Invalid booking status' });
    }

    const amount = calculateCost(bookingData.duration);
    
    // TODO: Integrate with M-Pesa API
    // For now, we'll simulate a payment process
    const payment = {
      bookingId,
      userId: req.user.uid,
      amount,
      status: 'pending',
      createdAt: new Date(),
      paymentMethod: 'mpesa',
      transactionId: `MPESA-${Date.now()}`
    };

    const paymentRef = await db.collection('payments').add(payment);
    
    // Update booking with payment reference
    await bookingRef.update({
      paymentId: paymentRef.id
    });

    res.status(201).json({
      id: paymentRef.id,
      ...payment,
      // TODO: Replace with actual M-Pesa API response
      checkoutRequestId: 'CHECKOUT-REQUEST-ID',
      merchantRequestId: 'MERCHANT-REQUEST-ID'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error initiating payment' });
  }
});

// Payment callback (to be called by M-Pesa)
router.post('/callback', async (req, res) => {
  try {
    const {
      checkoutRequestId,
      merchantRequestId,
      resultCode,
      resultDesc,
      transactionId
    } = req.body;

    // Find payment by transaction ID
    const paymentsSnapshot = await db.collection('payments')
      .where('transactionId', '==', transactionId)
      .limit(1)
      .get();

    if (paymentsSnapshot.empty) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const paymentDoc = paymentsSnapshot.docs[0];
    const payment = paymentDoc.data();

    // Update payment status
    const status = resultCode === 0 ? 'completed' : 'failed';
    await paymentDoc.ref.update({
      status,
      resultCode,
      resultDesc,
      completedAt: new Date()
    });

    // If payment successful, update booking status
    if (status === 'completed') {
      const bookingRef = db.collection('bookings').doc(payment.bookingId);
      await bookingRef.update({
        status: 'confirmed',
        confirmedAt: new Date()
      });
    }

    res.json({ message: 'Payment callback processed' });
  } catch (error) {
    res.status(500).json({ error: 'Error processing payment callback' });
  }
});

// Get payment history
router.get('/history', authenticateUser, async (req, res) => {
  try {
    const paymentsSnapshot = await db.collection('payments')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const payments = [];
    paymentsSnapshot.forEach(doc => {
      payments.push({ id: doc.id, ...doc.data() });
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching payment history' });
  }
});

module.exports = router; 