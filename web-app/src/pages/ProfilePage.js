import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { EmailAuthProvider, sendPasswordResetEmail, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '../firebase';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Stack,
  IconButton,
  InputAdornment,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function ProfilePage() {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalSpent: 0,
    averageRating: 0
  });
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: '',
    displayName: '',
    photoURL: null
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [usernameStatus, setUsernameStatus] = useState({
    available: false,
    checking: false,
    message: ''
  });
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const fetchUserStats = useCallback(async () => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Calculate stats
      const totalBookings = bookingsData.length;
      const totalSpent = bookingsData.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
      const averageRating = bookingsData.reduce((sum, booking) => sum + (booking.rating || 0), 0) / totalBookings || 0;
      
      setStats({
        totalBookings,
        totalSpent,
        averageRating
      });
      setLoading(false);
    } catch (err) {
      setError('Error fetching user stats: ' + err.message);
      setLoading(false);
    }
  }, [currentUser.uid]);

  useEffect(() => {
    if (currentUser) {
      fetchUserStats();
    }
  }, [currentUser, fetchUserStats]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user data
        const userQuery = query(
          collection(db, 'users'),
          where('uid', '==', currentUser.uid)
        );
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          setUserData(userSnapshot.docs[0].data());
        }

        // Fetch user's bookings
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('userId', '==', currentUser.uid)
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        setBookings(bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        // Fetch user's tournament history
        const tournamentsQuery = query(
          collection(db, 'tournament_participants'),
          where('userId', '==', currentUser.uid)
        );
        const tournamentsSnapshot = await getDocs(tournamentsQuery);
        setTournaments(tournamentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        // Fetch user's support tickets
        const ticketsQuery = query(
          collection(db, 'support_tickets'),
          where('userId', '==', currentUser.uid)
        );
        const ticketsSnapshot = await getDocs(ticketsQuery);
        setSupportTickets(ticketsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditClick = () => {
    setEditFormData({
      username: userData?.username || '',
      displayName: userData?.displayName || '',
      photoURL: null
    });
    setEditDialogOpen(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 1MB for base64)
      if (file.size > 1 * 1024 * 1024) {
        setError('Image size should be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditFormData(prev => ({
          ...prev,
          photoURL: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setError('');
      setSuccessMessage('');

      // Update user profile in Firebase Auth
      await currentUser.updateProfile({
        photoURL: null
      });

      // Update user document in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        photoURL: null
      });

      // Update local state
      setEditFormData(prev => ({ ...prev, photoURL: null }));
      setUserData(prev => ({ ...prev, photoURL: null }));
      setSuccessMessage('Profile picture removed successfully!');
    } catch (error) {
      console.error('Error removing profile picture:', error);
      setError('Error removing profile picture: ' + error.message);
    }
  };

  const checkUsernameAvailability = async (username) => {
    if (!username) {
      setUsernameStatus({
        available: false,
        checking: false,
        message: 'Username is required'
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
      // Check if username exists in users collection
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      // If username exists and it's not the current user's username
      if (!querySnapshot.empty && querySnapshot.docs[0].id !== currentUser.uid) {
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
        message: 'Error checking username availability'
      });
    }
  };

  const handleEditSubmit = async () => {
    try {
      setError('');
      setSuccessMessage('');

      // Check username availability before proceeding
      if (editFormData.username !== userData?.username) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', editFormData.username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty && querySnapshot.docs[0].id !== currentUser.uid) {
          setError('Username is already taken');
          return;
        }
      }

      // Get the user document reference using the correct query
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('uid', '==', currentUser.uid));
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        throw new Error('User document not found');
      }

      const userRef = doc(db, 'users', userSnapshot.docs[0].id);
      const updates = {
        username: editFormData.username,
        displayName: editFormData.displayName,
        updatedAt: new Date()
      };

      // Handle photo upload if there's a new photo
      if (editFormData.photoURL) {
        updates.photoURL = editFormData.photoURL;
      }

      // Update the user document
      await updateDoc(userRef, updates);
      
      // Update local state
      setUserData(prev => ({
        ...prev,
        ...updates
      }));
      
      setSuccessMessage('Profile updated successfully!');
      setEditDialogOpen(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Error updating profile: ' + err.message);
    }
  };

  const generateUsernameSuggestions = (baseUsername) => {
    if (!baseUsername) return [];
    
    const suggestions = [];
    const randomNumbers = ['123', '456', '789', '2024', '42'];
    const randomWords = ['gamer', 'player', 'pro', 'master', 'king'];
    
    // Add variations with numbers
    randomNumbers.forEach(num => {
      suggestions.push(`${baseUsername}${num}`);
    });
    
    // Add variations with words
    randomWords.forEach(word => {
      suggestions.push(`${baseUsername}_${word}`);
    });
    
    // Add variations with current year
    const currentYear = new Date().getFullYear();
    suggestions.push(`${baseUsername}${currentYear}`);
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  };

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setEditFormData(prev => ({ ...prev, username: newUsername }));
    checkUsernameAvailability(newUsername);
    setUsernameSuggestions(generateUsernameSuggestions(newUsername));
  };

  const handleSuggestionClick = (suggestion) => {
    setEditFormData(prev => ({ ...prev, username: suggestion }));
    checkUsernameAvailability(suggestion);
    setUsernameSuggestions([]);
  };

  const handlePasswordChange = async () => {
    try {
      setPasswordError('');
      setPasswordSuccess('');

      // Validate passwords
      if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
        setPasswordError('New passwords do not match');
        return;
      }

      if (passwordFormData.newPassword.length < 6) {
        setPasswordError('New password must be at least 6 characters long');
        return;
      }

      // Get current user
      const user = auth.currentUser;

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordFormData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordFormData.newPassword);

      setPasswordSuccess('Password updated successfully!');
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => {
        setPasswordDialogOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/wrong-password') {
        setPasswordError('Current password is incorrect');
      } else if (error.code === 'auth/requires-recent-login') {
        setPasswordError('Please log in again to change your password');
      } else {
        setPasswordError('Error updating password: ' + error.message);
      }
    }
  };

  const handleForgotPassword = async () => {
    try {
      setPasswordError('');
      setPasswordSuccess('');

      // Send password reset email
      await sendPasswordResetEmail(currentUser.auth, currentUser.email);
      setPasswordSuccess('Password reset email sent! Please check your inbox.');
      setTimeout(() => {
        setPasswordDialogOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Error sending reset email:', error);
      setPasswordError('Error sending reset email: ' + error.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ mb: 4, bgcolor: 'background.paper' }}>
        <Box sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={userData?.photoURL || currentUser?.photoURL}
                      alt={userData?.displayName || currentUser?.displayName}
                      sx={{ width: 100, height: 100, mb: 2 }}
                    />
                    <Typography variant="h5" gutterBottom>
                      {userData?.displayName || currentUser?.displayName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      @{userData?.username || 'username'}
                    </Typography>
                    <Chip
                      label={`${userData?.loyaltyPoints || 0} Loyalty Points`}
                      color="primary"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={handleEditClick}
                    fullWidth
                  >
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>
                {userData?.displayName || currentUser.displayName || 'User'}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {currentUser.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Username: {userData?.username || 'Not set'}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" sx={{ mr: 1 }} onClick={() => setPasswordDialogOpen(true)}>
                  Change Password
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="profile tabs"
            sx={{ bgcolor: 'background.paper' }}
          >
            <Tab label="Bookings" />
            <Tab label="Tournaments" />
            <Tab label="Support Tickets" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {bookings.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary">
                  No booking history found.
                </Typography>
              </Grid>
            ) : (
              bookings.map((booking) => (
                <Grid item key={booking.id} xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        PS4 Pro #{booking.consoleNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Date: {booking.date.toDate().toLocaleDateString()}
                        <br />
                        Time: {booking.startTime.toDate().toLocaleTimeString()} - {booking.endTime.toDate().toLocaleTimeString()}
                        <br />
                        Status: {booking.status}
                        <br />
                        Total: KES {booking.totalPrice}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {tournaments.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary">
                  No tournament history found.
                </Typography>
              </Grid>
            ) : (
              tournaments.map((participation) => (
                <Grid item key={participation.id} xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {participation.tournamentName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Date: {participation.date.toDate().toLocaleDateString()}
                        <br />
                        Status: {participation.status}
                        <br />
                        Position: {participation.position || 'N/A'}
                        <br />
                        Prize Won: {participation.prizeWon ? `KES ${participation.prizeWon}` : 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {supportTickets.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary">
                  No support tickets found.
                </Typography>
              </Grid>
            ) : (
              supportTickets.map((ticket) => (
                <Grid item key={ticket.id} xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {ticket.subject}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: {ticket.status}
                        <br />
                        Created: {ticket.createdAt.toDate().toLocaleDateString()}
                        <br />
                        Message: {ticket.message}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
            <Avatar
              src={editFormData.photoURL}
              sx={{ width: 100, height: 100, mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                component="label"
                size="small"
              >
                Change Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </Button>
              {editFormData.photoURL && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={handleRemovePhoto}
                >
                  Remove Photo
                </Button>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Max size: 1MB, Supported: JPG, PNG, GIF
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Display Name"
              value={editFormData.displayName}
              onChange={(e) => setEditFormData(prev => ({ ...prev, displayName: e.target.value }))}
              fullWidth
            />
            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Username"
                value={editFormData.username}
                onChange={handleUsernameChange}
                fullWidth
                error={!usernameStatus.available && !usernameStatus.checking && editFormData.username !== userData?.username}
                helperText={
                  usernameStatus.checking ? 'Checking availability...' :
                  usernameStatus.message
                }
              />
              {!usernameStatus.checking && (
                <Box sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
                  {usernameStatus.available ? (
                    <CheckCircleIcon color="success" />
                  ) : editFormData.username && editFormData.username !== userData?.username ? (
                    <ErrorIcon color="error" />
                  ) : null}
                </Box>
              )}
            </Box>
            {usernameSuggestions.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Suggested usernames:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {usernameSuggestions.map((suggestion) => (
                    <Chip
                      key={suggestion}
                      label={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained"
            disabled={!usernameStatus.available && editFormData.username !== userData?.username}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {passwordSuccess}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordFormData.currentPassword}
              onChange={(e) => setPasswordFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      edge="end"
                    >
                      {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordFormData.newPassword}
              onChange={(e) => setPasswordFormData(prev => ({ ...prev, newPassword: e.target.value }))}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      edge="end"
                    >
                      {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordFormData.confirmPassword}
              onChange={(e) => setPasswordFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      edge="end"
                    >
                      {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="text"
              color="primary"
              onClick={handleForgotPassword}
              sx={{ alignSelf: 'flex-start' }}
            >
              Forgot Password?
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained">
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ProfilePage; 