import axios from 'axios';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const API_URL = process.env.REACT_APP_API_URL;

// Initiate payment
export const initiatePayment = async (bookingId, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/initiate`,
      { bookingId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get payment history
export const getPaymentHistory = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/payments/history`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get payment status
export const getPaymentStatus = async (paymentId) => {
  try {
    const paymentsRef = collection(db, 'payments');
    const q = query(paymentsRef, where('id', '==', paymentId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Payment not found');
    }
    
    const payment = querySnapshot.docs[0].data();
    return payment.status;
  } catch (error) {
    throw error;
  }
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES'
  }).format(amount);
};

// Calculate booking cost
export const calculateBookingCost = (duration) => {
  // Example pricing: $5 per hour
  return duration * 5;
};

// Handle M-Pesa callback
export const handleMpesaCallback = async (callbackData) => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/callback`,
      callbackData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}; 