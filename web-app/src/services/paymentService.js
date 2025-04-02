import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const initiateMpesaPayment = async (phoneNumber, amount, bookingId) => {
  try {
    const response = await axios.post(`${BASE_URL}/payments/initiate-mpesa`, {
      phoneNumber,
      amount,
      bookingId
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to initiate payment');
  }
};

export const checkPaymentStatus = async (bookingId) => {
  try {
    const response = await axios.get(`${BASE_URL}/payments/status/${bookingId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to check payment status');
  }
}; 