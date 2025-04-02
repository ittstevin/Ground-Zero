import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { storage } from '../firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  async function signup(email, password, username, photoURL) {
    try {
      console.log('Starting signup process for:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User created successfully:', user.uid);

      let photoURLRef = null;
      // Upload profile photo if provided
      if (photoURL) {
        console.log('Uploading profile photo...');
        const storageRef = ref(storage, `profile-photos/${user.uid}`);
        await uploadString(storageRef, photoURL, 'data_url');
        photoURLRef = await getDownloadURL(storageRef);
        console.log('Profile photo uploaded:', photoURLRef);
        await updateProfile(user, { photoURL: photoURLRef });
      }

      // Create user document in Firestore
      console.log('Creating user document in Firestore...');
      const userData = {
        email: user.email,
        username: username,
        photoURL: photoURLRef,
        createdAt: new Date(),
      };
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('User document created successfully');

      // Update current user state
      const updatedUser = {
        ...user,
        username: username,
        photoURL: photoURLRef,
        isAdmin: false,
      };
      setCurrentUser(updatedUser);
      console.log('Current user state updated:', updatedUser);

      return userCredential;
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  }

  async function login(email, password) {
    try {
      console.log('AuthContext: Starting login process');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('AuthContext: Login successful, fetching user data');

      // Get user document from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('AuthContext: User data found:', userData);
        const updatedUser = {
          ...user,
          username: userData.username,
          photoURL: userData.photoURL,
          isAdmin: userData.isAdmin || false,
        };
        setCurrentUser(updatedUser);
        console.log('AuthContext: User state updated:', updatedUser);
      } else {
        console.log('AuthContext: No user document found, creating one');
        // Create user document if it doesn't exist
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          username: user.displayName || email.split('@')[0],
          photoURL: user.photoURL,
          createdAt: new Date(),
          isAdmin: false,
        });
        setCurrentUser({
          ...user,
          isAdmin: false,
        });
      }

      return userCredential;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  }

  async function logout() {
    return signOut(auth);
  }

  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        username: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
      });
    }

    return result;
  }

  async function loginWithFacebook() {
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        username: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
      });
    }

    return result;
  }

  async function setAdminStatus(userId, isAdmin) {
    try {
      console.log('Setting admin status for user:', userId, 'to:', isAdmin);
      
      // First update Firestore
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        isAdmin: isAdmin
      }, { merge: true });
      
      // Verify the update in Firestore
      const updatedDoc = await getDoc(userRef);
      const updatedData = updatedDoc.data();
      console.log('Verified Firestore data:', updatedData);
      
      // Update current user if it's the same user
      if (currentUser && currentUser.uid === userId) {
        console.log('Updating current user state with admin status:', isAdmin);
        const updatedUser = {
          ...currentUser,
          isAdmin: isAdmin
        };
        console.log('New current user state:', updatedUser);
        setCurrentUser(updatedUser);
      }
      
      return true;
    } catch (error) {
      console.error('Error setting admin status:', error);
      return false;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('Auth state changed - user logged in:', user.uid);
        try {
          // Get user document from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data from Firestore:', userData);
            const updatedUser = {
              ...user,
              username: userData.username,
              photoURL: userData.photoURL,
              isAdmin: userData.isAdmin || false,
            };
            console.log('Setting current user with data:', updatedUser);
            setCurrentUser(updatedUser);
          } else {
            console.log('No user document found in Firestore');
            setCurrentUser({
              ...user,
              isAdmin: false,
            });
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setCurrentUser({
            ...user,
            isAdmin: false,
          });
        }
      } else {
        console.log('Auth state changed - user logged out');
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    loginWithGoogle,
    loginWithFacebook,
    setAdminStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 