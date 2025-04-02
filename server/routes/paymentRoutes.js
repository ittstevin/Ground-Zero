const express = require('express');
const router = express.Router();
const axios = require('axios');
const Booking = require('../models/Booking');

// Generate access token
const generateAccessToken = async () => {
  try {
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error generating access token:', error);
    throw error;
  }
};

// Generate password
const generatePassword = (shortcode, passkey, timestamp) => {
  const str = shortcode + passkey + timestamp;
  return Buffer.from(str).toString('base64');
};

// Initiate M-Pesa payment
router.post('/initiate-mpesa', async (req, res) => {
  try {
    const { phoneNumber, amount, bookingId } = req.body;
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = generatePassword(process.env.MPESA_SHORTCODE, process.env.MPESA_PASSKEY, timestamp);
    const accessToken = await generateAccessToken();

    // Generate unique transaction reference
    const transactionRef = `BOOK${bookingId}${Date.now()}`;

    // Prepare request body
    const requestBody = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phoneNumber,
      CallBackURL: `${process.env.BASE_URL}/api/payments/mpesa-callback`,
      AccountReference: transactionRef,
      TransactionDesc: "Gaming Session Booking"
    };

    // Make request to M-Pesa API
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Update booking with payment details
    await Booking.findByIdAndUpdate(bookingId, {
      'payment.transactionRef': transactionRef,
      'payment.status': 'pending',
      'payment.amount': amount
    });

    res.json({
      success: true,
      checkoutRequestID: response.data.CheckoutRequestID
    });
  } catch (error) {
    console.error('M-Pesa payment initiation error:', error.response?.data || error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.response?.data || error.message
    });
  }
});

// M-Pesa callback
router.post('/mpesa-callback', async (req, res) => {
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;
    const { ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    if (ResultCode === 0) {
      // Payment successful
      const { Amount, MpesaReceiptNumber, TransactionDate } = CallbackMetadata.Item;
      
      // Extract booking ID from transaction reference
      const transactionRef = CallbackMetadata.Item[4].Value;
      const bookingId = transactionRef.substring(4, transactionRef.length - 13);

      // Update booking with payment success
      await Booking.findByIdAndUpdate(bookingId, {
        'payment.status': 'completed',
        'payment.transactionId': MpesaReceiptNumber,
        'payment.paidAt': new Date(TransactionDate),
        status: 'confirmed'
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(500).json({ success: false });
  }
});

// Check payment status
router.get('/status/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      status: booking.payment.status
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status'
    });
  }
});

module.exports = router; 