import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(yes => yes && (analytics = getAnalytics(app)));
}
export { analytics };

export default app; 