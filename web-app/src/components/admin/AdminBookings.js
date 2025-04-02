import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      setError('');
      setSuccess('');
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: newStatus,
        adminNotes: notes,
        updatedAt: new Date()
      });
      setSuccess('Booking status updated successfully');
      setOpenDialog(false);
      setSelectedBooking(null);
      setNotes('');
    } catch (error) {
      console.error('Error updating booking:', error);
      setError(`Failed to update booking: ${error.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage Bookings
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Booking ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Console</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.id}</TableCell>
                <TableCell>{booking.userEmail}</TableCell>
                <TableCell>PS4 Pro #{booking.consoleNumber}</TableCell>
                <TableCell>{booking.date.toDate().toLocaleDateString()}</TableCell>
                <TableCell>
                  {booking.startTime.toDate().toLocaleTimeString()} - {booking.endTime.toDate().toLocaleTimeString()}
                </TableCell>
                <TableCell>
                  {((booking.endTime.toDate() - booking.startTime.toDate()) / (1000 * 60 * 60)).toFixed(1)} hours
                </TableCell>
                <TableCell>KES {booking.totalPrice}</TableCell>
                <TableCell>
                  <Chip
                    label={booking.status}
                    color={getStatusColor(booking.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setOpenDialog(true);
                    }}
                  >
                    Update Status
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Booking Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Booking Details:
            </Typography>
            <Typography variant="body2">
              User: {selectedBooking?.userEmail}
              <br />
              Console: PS4 Pro #{selectedBooking?.consoleNumber}
              <br />
              Date: {selectedBooking?.date.toDate().toLocaleDateString()}
              <br />
              Time: {selectedBooking?.startTime.toDate().toLocaleTimeString()} - {selectedBooking?.endTime.toDate().toLocaleTimeString()}
            </Typography>
            <TextField
              label="Admin Notes"
              multiline
              rows={4}
              fullWidth
              margin="normal"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleStatusUpdate(selectedBooking.id, 'cancelled')}
            color="error"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleStatusUpdate(selectedBooking.id, 'confirmed')}
            color="success"
            variant="contained"
          >
            Confirm
          </Button>
          <Button
            onClick={() => handleStatusUpdate(selectedBooking.id, 'completed')}
            color="info"
            variant="contained"
          >
            Mark Complete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminBookings; 