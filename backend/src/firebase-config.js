const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Get Firestore instance
const db = admin.firestore();

// Get Auth instance
const auth = admin.auth();

module.exports = {
  admin,
  db,
  auth
}; 