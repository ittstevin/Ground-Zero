const admin = require('firebase-admin');
const db = admin.firestore();

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    console.log('Received booking request:', req.body);
    const { consoleId, startTime, duration, name, phone, email, notes } = req.body;
    
    // Validate required fields
    if (!consoleId || !startTime || !duration) {
      console.log('Missing required fields:', { consoleId, startTime, duration });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate consoleId format
    if (!consoleId || typeof consoleId !== 'string' || consoleId.length === 0) {
      console.log('Invalid console ID format:', consoleId);
      return res.status(400).json({ error: 'Invalid console ID format' });
    }

    // Ensure consoleId is a valid Firestore document ID
    if (!/^[a-zA-Z0-9_-]+$/.test(consoleId)) {
      console.log('Invalid console ID characters:', consoleId);
      return res.status(400).json({ error: 'Invalid console ID characters' });
    }

    try {
      console.log('Creating Firestore document reference...');
      console.log('Console ID before doc creation:', consoleId);
      console.log('Console ID type:', typeof consoleId);
      console.log('Console ID length:', consoleId.length);
      
      // Log the full path we're trying to access
      const collectionPath = 'consoles';
      const documentPath = consoleId;
      console.log('Attempting to access Firestore path:', `${collectionPath}/${documentPath}`);
      
      const consoleRef = db.collection(collectionPath).doc(documentPath);
      console.log('Console reference created successfully');
      console.log('Console reference path:', consoleRef.path);
      console.log('Console reference ID:', consoleRef.id);
      
      console.log('Fetching console document...');
      const consoleDoc = await consoleRef.get();
      console.log('Console document exists:', consoleDoc.exists);
      
      if (!consoleDoc.exists) {
        console.log('Console not found:', consoleId);
        return res.status(404).json({ error: 'Console not found' });
      }

      const consoleData = consoleDoc.data();
      console.log('Found console data:', consoleData);

      // Check if console is available
      if (consoleData.status !== 'available') {
        console.log('Console is not available:', { status: consoleData.status });
        return res.status(400).json({ error: 'Console is not available for booking' });
      }

      // Validate booking time
      const start = new Date(startTime);
      const now = new Date();
      
      if (isNaN(start.getTime())) {
        console.log('Invalid start time:', startTime);
        return res.status(400).json({ error: 'Invalid start time format' });
      }
      
      if (start < now) {
        console.log('Booking time is in the past:', { start, now });
        return res.status(400).json({ error: 'Cannot book in the past' });
      }

      // Check for overlapping bookings
      const overlappingBookings = await db.collection('bookings')
        .where('consoleId', '==', consoleId)
        .where('startTime', '<=', start)
        .where('endTime', '>', start)
        .where('status', '==', 'confirmed')
        .get();

      if (!overlappingBookings.empty) {
        console.log('Overlapping bookings found');
        return res.status(400).json({ error: 'Console is already booked for this time slot' });
      }

      // Calculate end time
      const endTime = new Date(start.getTime() + duration * 60 * 60 * 1000);

      // Create booking
      const bookingRef = await db.collection('bookings').add({
        userId: req.user.uid,
        consoleId,
        startTime: start,
        endTime,
        duration,
        name,
        phone,
        email,
        notes,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log('Booking created successfully:', bookingRef.id);
      res.status(201).json({ 
        id: bookingRef.id,
        message: 'Booking created successfully'
      });
    } catch (error) {
      console.error('Error checking console:', error);
      res.status(500).json({ error: 'Error checking console availability' });
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

// Get user's bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookingsSnapshot = await db.collection('bookings')
      .where('userId', '==', req.user.uid)
      .orderBy('startTime', 'desc')
      .get();

    const bookings = [];
    bookingsSnapshot.forEach(doc => {
      bookings.push({ id: doc.id, ...doc.data() });
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const bookingDoc = await db.collection('bookings').doc(req.params.bookingId).get();

    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingDoc.data();
    if (booking.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ id: bookingDoc.id, ...booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const bookingRef = db.collection('bookings').doc(req.params.bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingDoc.data();
    if (booking.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Booking cannot be cancelled' });
    }

    await bookingRef.update({
      status: 'cancelled',
      cancelledAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 