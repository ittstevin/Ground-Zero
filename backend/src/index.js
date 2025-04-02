const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const functions = require('firebase-functions');

// Initialize Firebase Admin
admin.initializeApp();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.get('/api/pcs', async (req, res) => {
  try {
    const pcsSnapshot = await admin.firestore().collection('pcs').get();
    const pcs = [];
    pcsSnapshot.forEach(doc => {
      pcs.push({ id: doc.id, ...doc.data() });
    });
    res.json(pcs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching PCs' });
  }
});

app.get('/api/bookings', authenticateUser, async (req, res) => {
  try {
    const bookingsSnapshot = await admin.firestore()
      .collection('bookings')
      .where('userId', '==', req.user.uid)
      .get();
    
    const bookings = [];
    bookingsSnapshot.forEach(doc => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bookings' });
  }
});

app.post('/api/bookings', authenticateUser, async (req, res) => {
  try {
    const { pcId, startTime, duration } = req.body;
    
    // Validate booking time
    const start = new Date(startTime);
    const now = new Date();
    if (start < now) {
      return res.status(400).json({ error: 'Cannot book in the past' });
    }

    // Check if PC is available
    const pcRef = admin.firestore().collection('pcs').doc(pcId);
    const pcDoc = await pcRef.get();
    
    if (!pcDoc.exists) {
      return res.status(404).json({ error: 'PC not found' });
    }

    // Create booking
    const bookingRef = await admin.firestore().collection('bookings').add({
      userId: req.user.uid,
      pcId,
      startTime,
      duration,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ id: bookingRef.id });
  } catch (error) {
    res.status(500).json({ error: 'Error creating booking' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 