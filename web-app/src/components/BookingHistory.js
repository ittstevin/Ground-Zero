import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const BookingHistory = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('userId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setBookings(bookingsData);
      setLoading(false);
    } catch (err) {
      setError('Error fetching bookings: ' + err.message);
      setLoading(false);
    }
  }, [currentUser.uid]);

  useEffect(() => {
    if (currentUser) {
      fetchBookings();
    }
  }, [currentUser, fetchBookings]);

  // ... rest of the component code ...
};

export default BookingHistory; 