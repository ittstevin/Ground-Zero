import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';

const ProfileSettings = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username || '');
          setProfilePicture(userDoc.data().photoURL || null);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleUsernameChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      // Check if username is already taken
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty && querySnapshot.docs[0].id !== user.uid) {
        throw new Error('Username is already taken');
      }

      // Update username in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        username: username,
      });

      // Update display name in Firebase Auth
      await updateProfile(user, {
        displayName: username,
      });

      setSuccess('Username updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      // Create a unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `${user.uid}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, `profile-pictures/${fileName}`);

      // Upload file
      const uploadTask = uploadBytes(storageRef, file);
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          throw error;
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Update profile picture in Firestore
          await updateDoc(doc(db, 'users', user.uid), {
            photoURL: downloadURL,
          });

          // Update photo URL in Firebase Auth
          await updateProfile(user, {
            photoURL: downloadURL,
          });

          setProfilePicture(downloadURL);
          setSuccess('Profile picture updated successfully!');
          setLoading(false);
        }
      );
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Settings
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar
            src={profilePicture}
            sx={{ width: 120, height: 120, mb: 2 }}
          />
          <Button
            variant="contained"
            component="label"
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Upload New Picture
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleProfilePictureUpload}
            />
          </Button>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <CircularProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}
        </Box>

        <Box component="form" onSubmit={handleUsernameChange}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Username'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfileSettings; 