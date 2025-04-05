import { collection, query, where, getDocs, addDoc, doc, updateDoc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

// Get available time slots for a specific date
export const getAvailableSlots = async (date) => {
  try {
    console.log('Fetching available slots for date:', date);
    
    // Get all bookings for the specified date
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef, 
      where('date', '==', date),
      where('status', 'in', ['confirmed', 'pending'])
    );
    
    const querySnapshot = await getDocs(q);
    
    // Get all booked slots
    const bookedSlots = [];
    querySnapshot.forEach((doc) => {
      const booking = doc.data();
      if (booking.slot) {
        bookedSlots.push(booking.slot);
      }
    });
    
    // Define all possible slots (you can customize this based on your business hours)
    const allSlots = [
      '09:00', '10:00', '11:00', '12:00', '13:00', 
      '14:00', '15:00', '16:00', '17:00', '18:00', 
      '19:00', '20:00', '21:00', '22:00'
    ];
    
    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
    
    console.log(`Found ${availableSlots.length} available slots out of ${allSlots.length} total slots`);
    return availableSlots;
  } catch (error) {
    console.error('Error fetching available slots:', error);
    throw error;
  }
};

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    console.log('Creating new booking:', bookingData);
    
    // Add timestamps
    const bookingWithTimestamps = {
      ...bookingData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'pending'
    };
    
    // Add to Firestore
    const docRef = await addDoc(collection(db, 'bookings'), bookingWithTimestamps);
    console.log('Booking created with ID:', docRef.id);
    
    return { id: docRef.id, ...bookingWithTimestamps };
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Confirm a booking
export const confirmBooking = async (bookingId) => {
  try {
    console.log('Confirming booking:', bookingId);
    
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status: 'confirmed',
      updatedAt: new Date()
    });
    
    console.log('Booking confirmed successfully');
    return { id: bookingId, status: 'confirmed' };
  } catch (error) {
    console.error('Error confirming booking:', error);
    throw error;
  }
};

// Cancel a booking
export const cancelBooking = async (bookingId) => {
  try {
    console.log('Cancelling booking:', bookingId);
    
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status: 'cancelled',
      updatedAt: new Date()
    });
    
    console.log('Booking cancelled successfully');
    return { id: bookingId, status: 'cancelled' };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

// Get user's booking history
export const getUserBookings = async (userId) => {
  try {
    console.log('Fetching bookings for user:', userId);
    
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef, 
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const bookings = [];
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`Found ${bookings.length} bookings for user`);
    return bookings;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

// Get booking details
export const getBookingDetails = async (bookingId) => {
  try {
    console.log('Fetching booking details:', bookingId);
    
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingDoc = await getDoc(bookingRef);
    
    if (!bookingDoc.exists()) {
      console.error('Booking not found:', bookingId);
      throw new Error('Booking not found');
    }
    
    console.log('Booking details retrieved successfully');
    return { id: bookingDoc.id, ...bookingDoc.data() };
  } catch (error) {
    console.error('Error fetching booking details:', error);
    throw error;
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, status) => {
  try {
    console.log(`Updating booking ${bookingId} status to ${status}`);
    
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status,
      updatedAt: new Date()
    });
    
    console.log('Booking status updated successfully');
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
}; 