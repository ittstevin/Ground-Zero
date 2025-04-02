const express = require('express');
const router = express.Router();
const { auth, db } = require('../firebase-config');

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

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists || !userDoc.data().isAdmin) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Error checking admin status' });
  }
};

// Get all users (admin only)
router.get('/', authenticateUser, isAdmin, async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Get user by ID (admin only)
router.get('/:userId', authenticateUser, isAdmin, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

// Update user role (admin only)
router.put('/:userId/role', authenticateUser, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await db.collection('users').doc(userId).update({
      role,
      updatedAt: new Date()
    });

    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating user role' });
  }
});

// Get user's booking history (admin only)
router.get('/:userId/bookings', authenticateUser, isAdmin, async (req, res) => {
  try {
    const bookingsSnapshot = await db.collection('bookings')
      .where('userId', '==', req.params.userId)
      .orderBy('createdAt', 'desc')
      .get();

    const bookings = [];
    bookingsSnapshot.forEach(doc => {
      bookings.push({ id: doc.id, ...doc.data() });
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user bookings' });
  }
});

// Get user's payment history (admin only)
router.get('/:userId/payments', authenticateUser, isAdmin, async (req, res) => {
  try {
    const paymentsSnapshot = await db.collection('payments')
      .where('userId', '==', req.params.userId)
      .orderBy('createdAt', 'desc')
      .get();

    const payments = [];
    paymentsSnapshot.forEach(doc => {
      payments.push({ id: doc.id, ...doc.data() });
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user payments' });
  }
});

// Delete user (admin only)
router.delete('/:userId', authenticateUser, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete user's bookings
    const bookingsSnapshot = await db.collection('bookings')
      .where('userId', '==', userId)
      .get();

    const batch = db.batch();
    bookingsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete user's payments
    const paymentsSnapshot = await db.collection('payments')
      .where('userId', '==', userId)
      .get();

    paymentsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete user document
    batch.delete(db.collection('users').doc(userId));

    // Commit all deletions
    await batch.commit();

    // Delete user from Firebase Auth
    await auth.deleteUser(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user' });
  }
});

module.exports = router; 