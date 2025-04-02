import { collection, query, where, getDocs, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Get available time slots for a specific date
export const getAvailableSlots = async (date) => {
  try {
    const response = await axios.get(`${API_URL}/bookings/slots`, {
      params: { date }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new booking
export const createBooking = async (bookingData, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/bookings`,
      bookingData,
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

// Confirm a booking
export const confirmBooking = async (bookingId, token) => {
  try {
    const response = await axios.put(
      `${API_URL}/bookings/${bookingId}/confirm`,
      {},
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

// Cancel a booking
export const cancelBooking = async (bookingId, token) => {
  try {
    const response = await axios.put(
      `${API_URL}/bookings/${bookingId}/cancel`,
      {},
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

// Get user's booking history
export const getUserBookings = async (userId) => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const bookings = [];
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    
    return bookings;
  } catch (error) {
    throw error;
  }
};

// Get booking details
export const getBookingDetails = async (bookingId) => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingDoc = await getDoc(bookingRef);
    
    if (!bookingDoc.exists()) {
      throw new Error('Booking not found');
    }
    
    return { id: bookingDoc.id, ...bookingDoc.data() };
  } catch (error) {
    throw error;
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status,
      updatedAt: new Date()
    });
  } catch (error) {
    throw error;
  }
}; 