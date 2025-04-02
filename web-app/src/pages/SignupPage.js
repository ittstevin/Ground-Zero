import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, doc, setDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
  Stack,
  LinearProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    username: '',
    photoURL: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [usernameStatus, setUsernameStatus] = useState({
    available: false,
    checking: false,
    message: ''
  });
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();
  const { signup } = useAuth();

  // Generate username suggestions based on email
  useEffect(() => {
    if (formData.email) {
      const baseUsername = formData.email.split('@')[0];
      const suggestions = [
        baseUsername,
        `${baseUsername}${Math.floor(Math.random() * 1000)}`,
        `${baseUsername}_${Math.floor(Math.random() * 1000)}`,
        `${baseUsername}${new Date().getFullYear()}`,
        `${baseUsername}_gamer`,
        `${baseUsername}_pro`
      ];
      setUsernameSuggestions(suggestions);
    }
  }, [formData.email]);

  // Check username availability
  const checkUsernameAvailability = async (username) => {
    if (!username) {
      setUsernameStatus({
        available: false,
        checking: false,
        message: ''
      });
      return;
    }

    // Basic validation
    if (username.length < 3) {
      setUsernameStatus({
        available: false,
        checking: false,
        message: 'Username must be at least 3 characters long'
      });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameStatus({
        available: false,
        checking: false,
        message: 'Username can only contain letters, numbers, and underscores'
      });
      return;
    }

    setUsernameStatus(prev => ({ ...prev, checking: true }));

    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('username', '==', username.toLowerCase()),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUsernameStatus({
          available: false,
          checking: false,
          message: 'Username is already taken'
        });
      } else {
        setUsernameStatus({
          available: true,
          checking: false,
          message: 'Username is available'
        });
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameStatus({
        available: false,
        checking: false,
        message: 'Unable to check username. Please try again.'
      });
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.match(/[a-z]/)) strength += 20;
    if (password.match(/[A-Z]/)) strength += 20;
    if (password.match(/[0-9]/)) strength += 20;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 20;
    return strength;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 1MB)
      if (file.size > 1 * 1024 * 1024) {
        setError('Image size should be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          photoURL: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setFormData(prev => ({ ...prev, username: newUsername }));
    checkUsernameAvailability(newUsername);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData(prev => ({ ...prev, password: newPassword }));
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.displayName.trim()) {
        throw new Error('Display name is required');
      }
      if (!formData.username.trim()) {
        throw new Error('Username is required');
      }
      if (!usernameStatus.available) {
        throw new Error('Please choose an available username');
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Create user account
      const { user } = await signup(formData.email, formData.password);

      // Create user document in Firestore
      const userRef = doc(collection(db, 'users'));
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: formData.displayName.trim(),
        username: formData.username.trim().toLowerCase(),
        photoURL: formData.photoURL,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(userRef, userData);

      setSuccess('Account created successfully! Redirecting to home page...');
      setTimeout(() => {
      navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create an account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
          Create Account
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
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={formData.photoURL}
              sx={{ width: 100, height: 100, mb: 2 }}
            />
            <Button
              variant="outlined"
              component="label"
              size="small"
            >
              Upload Photo (Optional)
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Max size: 1MB, Supported: JPG, PNG, GIF
            </Typography>
          </Box>

          <TextField
            required
            fullWidth
            label="Display Name"
            value={formData.displayName}
            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
            margin="normal"
            error={!formData.displayName.trim()}
            helperText={!formData.displayName.trim() ? 'Display name is required' : ''}
          />

          <Box sx={{ position: 'relative' }}>
            <TextField
              required
              fullWidth
              label="Username"
              value={formData.username}
              onChange={handleUsernameChange}
              margin="normal"
              error={!usernameStatus.available && !usernameStatus.checking && formData.username !== ''}
              helperText={
                usernameStatus.checking ? 'Checking availability...' :
                usernameStatus.message
              }
            />
            {!usernameStatus.checking && (
              <Box sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
                {usernameStatus.available ? (
                  <CheckCircleIcon color="success" />
                ) : formData.username && !usernameStatus.checking ? (
                  <ErrorIcon color="error" />
                ) : null}
              </Box>
            )}
          </Box>

          {usernameSuggestions.length > 0 && (
            <Box sx={{ mt: 1, mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Suggested usernames:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {usernameSuggestions.map((suggestion) => (
                  <Chip
                    key={suggestion}
                    label={suggestion}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, username: suggestion }));
                      checkUsernameAvailability(suggestion);
                    }}
                    size="small"
                  />
                ))}
              </Stack>
            </Box>
          )}

            <TextField
            required
              fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              margin="normal"
            error={!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)}
            helperText={!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) ? 'Please enter a valid email address' : ''}
          />

          <TextField
              required
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={handlePasswordChange}
            margin="normal"
            error={formData.password.length < 6 && formData.password !== ''}
            helperText={formData.password.length < 6 && formData.password !== '' ? 'Password must be at least 6 characters long' : ''}
          />

          {formData.password && (
            <Box sx={{ mt: 1, mb: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={passwordStrength} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 
                      passwordStrength <= 20 ? '#f44336' :
                      passwordStrength <= 40 ? '#ff9800' :
                      passwordStrength <= 60 ? '#ffeb3b' :
                      passwordStrength <= 80 ? '#8bc34a' :
                      '#4caf50'
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Password strength: {passwordStrength}%
              </Typography>
            </Box>
          )}

            <TextField
            required
            fullWidth
              label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              margin="normal"
            error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ''}
            helperText={formData.password !== formData.confirmPassword && formData.confirmPassword !== '' ? 'Passwords do not match' : ''}
          />

            <Button
              type="submit"
            fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
          </Box>
        </Paper>
    </Container>
  );
} 

export default SignupPage; 