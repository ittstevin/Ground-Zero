import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, query, where, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Snackbar,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  Divider
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { Link as RouterLink } from 'react-router-dom';
import { initiateMpesaPayment, checkPaymentStatus } from '../services/paymentService';
import { createBooking } from '../services/bookingService';

const steps = ['Select Date & Time', 'Enter Details', 'Payment', 'Confirmation'];

function BookingPage() {
  const { currentUser } = useAuth();
  const [consoles, setConsoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedConsole, setSelectedConsole] = useState(null);
  const [bookingDate, setBookingDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    duration: '1',
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [bookingId, setBookingId] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchConsoles = async () => {
      try {
        const consolesRef = collection(db, 'consoles');
        const q = query(consolesRef, where('status', '==', 'available'));
        const querySnapshot = await getDocs(q);
        
        const consoleData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setConsoles(consoleData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching consoles:', error);
        setError('Failed to load consoles. Please try again later.');
        setLoading(false);
      }
    };

    fetchConsoles();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', currentUser.uid),
      where('status', 'in', ['pending', 'confirmed'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingList);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validate required fields
      if (!selectedConsole || !selectedConsole.id) {
        throw new Error('Please select a console');
      }

      if (!bookingData.date || !bookingData.time) {
        throw new Error('Please select a date and time');
      }

      if (!bookingData.duration) {
        throw new Error('Please select a duration');
      }

      if (!bookingData.name || !bookingData.phone || !bookingData.email) {
        throw new Error('Please fill in all required contact information');
      }

      // Format phone number to include country code
      const formattedPhone = bookingData.phone.startsWith('254') 
        ? bookingData.phone 
        : `254${bookingData.phone.substring(1)}`;

      // Calculate amount based on console's price per hour
      const amount = parseInt(bookingData.duration) * selectedConsole.pricePerHour;

      // Format the date and time into a single ISO string
      const [year, month, day] = bookingData.date.split('-');
      const [hours, minutes] = bookingData.time.split(':');
      
      // Create date in local timezone
      const startDateTime = new Date(year, month - 1, day, hours, minutes);
      
      // Convert to UTC ISO string
      const utcStartDateTime = new Date(startDateTime.getTime() - startDateTime.getTimezoneOffset() * 60000);
      
      if (isNaN(utcStartDateTime.getTime())) {
        throw new Error('Invalid date or time format');
      }

      // Validate console ID format
      if (!/^[a-zA-Z0-9_-]+$/.test(selectedConsole.id)) {
        throw new Error('Invalid console ID format');
      }

      // Ensure console ID is a string and not empty
      const consoleId = String(selectedConsole.id).trim();
      if (!consoleId) {
        throw new Error('Console ID cannot be empty');
      }

      const formattedBookingData = {
        consoleId,
        startTime: utcStartDateTime.toISOString(),
        duration: parseInt(bookingData.duration),
        name: bookingData.name,
        phone: formattedPhone,
        email: bookingData.email,
        notes: bookingData.notes
      };

      console.log('Selected console:', selectedConsole);
      console.log('Console ID:', consoleId);
      console.log('Booking data:', formattedBookingData);

      const response = await createBooking(formattedBookingData);
      console.log('Booking response:', response);
      
      // Show success message
      setSuccess('Booking created successfully!');
      // Reset form
      setBookingData({
        date: '',
        time: '',
        duration: '',
        name: '',
        phone: '',
        email: '',
        notes: ''
      });
      setSelectedConsole(null);
    } catch (error) {
      console.error('Booking error:', error);
      setError(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Format phone number to include country code
      const formattedPhone = bookingData.phone.startsWith('254') 
        ? bookingData.phone 
        : `254${bookingData.phone.substring(1)}`;

      // Calculate amount based on console's price per hour
      const amount = parseInt(bookingData.duration) * selectedConsole.pricePerHour;

      // Format the date and time into a single ISO string
      const [year, month, day] = bookingData.date.split('-');
      const [hours, minutes] = bookingData.time.split(':');
      
      // Create date in local timezone
      const startDateTime = new Date(year, month - 1, day, hours, minutes);
      
      // Convert to UTC ISO string
      const utcStartDateTime = new Date(startDateTime.getTime() - startDateTime.getTimezoneOffset() * 60000);
      
      if (isNaN(utcStartDateTime.getTime())) {
        throw new Error('Invalid date or time format');
      }

      // Format the booking data for the backend
      if (!selectedConsole || !selectedConsole.id) {
        throw new Error('Invalid console selection');
      }

      // Validate console ID format
      if (!/^[a-zA-Z0-9_-]+$/.test(selectedConsole.id)) {
        throw new Error('Invalid console ID format');
      }

      // Ensure console ID is a string and not empty
      const consoleId = String(selectedConsole.id).trim();
      if (!consoleId) {
        throw new Error('Console ID cannot be empty');
      }

      const formattedBookingData = {
        consoleId,
        startTime: utcStartDateTime.toISOString(),
        duration: parseInt(bookingData.duration),
        name: bookingData.name,
        phone: formattedPhone,
        email: bookingData.email,
        notes: bookingData.notes
      };

      console.log('Selected console:', selectedConsole); // Debug log
      console.log('Console ID:', consoleId); // Debug log
      console.log('Console ID type:', typeof consoleId); // Debug log
      console.log('Console ID length:', consoleId.length); // Debug log
      console.log('Sending booking data:', formattedBookingData); // Debug log

      // Create booking first
      const bookingResponse = await createBooking(formattedBookingData);
      setBookingId(bookingResponse.id);

      // Initiate M-Pesa payment
      const paymentResponse = await initiateMpesaPayment(
        formattedPhone,
        amount,
        bookingResponse.id
      );

      setSuccess('Payment initiated! Please check your phone for the M-Pesa prompt.');
      setPaymentStatus('pending');
      
      // Start polling for payment status
      pollPaymentStatus(bookingResponse.id);
    } catch (err) {
      console.error('Booking error:', err); // Debug log
      setError(err.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (id) => {
    const interval = setInterval(async () => {
      try {
        const status = await checkPaymentStatus(id);
        setPaymentStatus(status.status);
        
        if (status.status === 'completed') {
          clearInterval(interval);
          setSuccess('Payment successful! Your booking is confirmed.');
          handleNext();
        } else if (status.status === 'failed') {
          clearInterval(interval);
          setError('Payment failed. Please try again.');
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
      }
    }, 5000); // Check every 5 seconds

    // Clear interval after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Select a Console
              </Typography>
              <Grid container spacing={2}>
                {consoles.map((console) => (
                  <Grid item xs={12} sm={6} md={4} key={console.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedConsole?.id === console.id ? `2px solid ${theme.palette.primary.main}` : 'none'
                      }}
                      onClick={() => setSelectedConsole(console)}
                    >
                      <CardContent>
                        <Typography variant="h6">{console.name}</Typography>
                        <Typography color="textSecondary">{console.description}</Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Price: KES {console.pricePerHour}/hour
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                name="date"
                value={bookingData.date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="time"
                label="Time"
                name="time"
                value={bookingData.time}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Duration (hours)"
                name="duration"
                value={bookingData.duration}
                onChange={handleInputChange}
                SelectProps={{
                  native: true,
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((hour) => (
                  <option key={hour} value={hour}>
                    {hour} {hour === 1 ? 'hour' : 'hours'}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={!selectedConsole || !bookingData.date || !bookingData.time}
              >
                Next
              </Button>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={bookingData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={bookingData.phone}
                onChange={handleInputChange}
                required
                helperText="Format: 254712345678"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={bookingData.email}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={4}
                value={bookingData.notes}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={!bookingData.name || !bookingData.phone || !bookingData.email}
              >
                Next
              </Button>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Payment Details
              </Typography>
              <Typography>
                Amount: KES {parseInt(bookingData.duration) * selectedConsole.pricePerHour}
              </Typography>
              <Typography>
                Duration: {bookingData.duration} {parseInt(bookingData.duration) === 1 ? 'hour' : 'hours'}
              </Typography>
              <Typography>
                Date: {new Date(bookingData.date).toLocaleDateString()}
              </Typography>
              <Typography>
                Time: {bookingData.time}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePayment}
                disabled={loading || paymentStatus === 'completed'}
              >
                {loading ? 'Processing...' : 'Pay with M-Pesa'}
              </Button>
            </Grid>
            {paymentStatus === 'pending' && (
              <Grid item xs={12}>
                <Typography color="primary">
                  Waiting for payment confirmation... Please check your phone for the M-Pesa prompt.
                </Typography>
              </Grid>
            )}
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Booking Confirmed!
              </Typography>
              <Typography>
                Your booking has been confirmed. Here are your booking details:
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography>Booking ID: {bookingId}</Typography>
                <Typography>Date: {new Date(bookingData.date).toLocaleDateString()}</Typography>
                <Typography>Time: {bookingData.time}</Typography>
                <Typography>Duration: {bookingData.duration} {parseInt(bookingData.duration) === 1 ? 'hour' : 'hours'}</Typography>
                <Typography>Amount Paid: KES {parseInt(bookingData.duration) * selectedConsole.pricePerHour}</Typography>
              </Box>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  if (!currentUser) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 8, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Please log in to make a booking
          </Typography>
          <Typography paragraph>
            You need to be logged in to book a PlayStation console.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/login"
              sx={{ mr: 2 }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              color="primary"
              component={RouterLink}
              to="/signup"
            >
              Sign Up
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, bgcolor: 'white' }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            color: theme.palette.primary.main,
            fontWeight: 'bold',
            mb: 3
          }}
        >
          Book a Gaming Session
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

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

        {renderStepContent(activeStep)}
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default BookingPage; 