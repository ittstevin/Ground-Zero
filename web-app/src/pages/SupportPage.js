import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';

function SupportPage() {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, 'support_tickets'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const ticketList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTickets(ticketList);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !subject.trim()) return;

    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const ticketData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        subject,
        message,
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Creating ticket with data:', ticketData);
      const docRef = await addDoc(collection(db, 'support_tickets'), ticketData);
      console.log('Ticket created with ID:', docRef.id);

      setMessage('');
      setSubject('');
      setSuccess('Support ticket submitted successfully!');
    } catch (error) {
      console.error('Error creating support ticket:', error);
      setError(`Failed to create support ticket: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 8, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Please log in to access support
          </Typography>
          <Typography>
            You need to be logged in to create support tickets and chat with our support team.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Support Center
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
          
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" gutterBottom>
              Create Support Ticket
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                margin="normal"
                required
                multiline
                rows={4}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 2 }}
              >
                Submit Ticket
              </Button>
            </Box>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Your Support Tickets
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : tickets.length === 0 ? (
            <Typography color="text.secondary">
              No support tickets yet.
            </Typography>
          ) : (
            <Box sx={{ mt: 2 }}>
              {tickets.map((ticket) => (
                <Card key={ticket.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6">
                        {ticket.subject || 'No Subject'}
                      </Typography>
                      <Chip
                        label={ticket.status}
                        color={
                          ticket.status === 'open' ? 'success' :
                          ticket.status === 'in_progress' ? 'warning' :
                          'default'
                        }
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Created: {ticket.createdAt?.toDate().toLocaleString()}
                    </Typography>
                    <Typography variant="body1">
                      {ticket.message}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default SupportPage; 