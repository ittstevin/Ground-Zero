import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAe4I3DNIHyO3bPi1A-gydf96Pr-2GlW6k",
  authDomain: "jtc-gz.firebaseapp.com",
  projectId: "jtc-gz",
  storageBucket: "jtc-gz.firebasestorage.app",
  messagingSenderId: "203535445491",
  appId: "1:203535445491:web:e8d84d96f8570d8cf47686",
  measurementId: "G-P08HVLMMKX"
};

console.log('Initializing Firebase with config:', {
  ...firebaseConfig,
  apiKey: '***' // Hide the actual API key in logs
});

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase app:', error);
  throw error;
}

export const auth = getAuth(app);
console.log('Firebase Auth initialized');

export const db = getFirestore(app);
console.log('Firestore initialized');

// Uncomment the line below if you're using the Firestore emulator
// connectFirestoreEmulator(db, 'localhost', 8080);

export const storage = getStorage(app);
console.log('Firebase Storage initialized');

let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(yes => {
    if (yes) {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized');
    } else {
      console.log('Firebase Analytics not supported in this environment');
    }
  });
}
export { analytics };

export default app; 