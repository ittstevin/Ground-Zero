import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Typography, Box, Alert } from '@mui/material';

function AdminSetup() {
  const { currentUser, setAdminStatus } = useAuth();
  const [status, setStatus] = useState('');

  useEffect(() => {
    console.log('AdminSetup - Current user:', currentUser);
  }, [currentUser]);

  const handleSetAdmin = async () => {
    if (!currentUser) {
      setStatus('Please log in first');
      return;
    }

    console.log('Attempting to set admin status for user:', currentUser.uid);
    const success = await setAdminStatus(currentUser.uid, true);
    if (success) {
      console.log('Admin status set successfully');
      setStatus('Admin status set successfully! Please log out and log back in.');
    } else {
      console.error('Failed to set admin status');
      setStatus('Failed to set admin status. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Admin Setup
      </Typography>
      {currentUser ? (
        <>
          <Typography variant="body1" gutterBottom>
            Current user: {currentUser.email}
          </Typography>
          <Typography variant="body1" gutterBottom>
            User ID: {currentUser.uid}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Current Admin Status: {currentUser.isAdmin ? 'Yes' : 'No'}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSetAdmin}
            sx={{ mt: 2 }}
          >
            Set Admin Status
          </Button>
        </>
      ) : (
        <Typography variant="body1" color="error">
          Please log in first
        </Typography>
      )}
      {status && (
        <Alert severity={status.includes('success') ? 'success' : 'error'} sx={{ mt: 2 }}>
          {status}
        </Alert>
      )}
    </Box>
  );
}

export default AdminSetup; 