import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextareaAutosize,
  useTheme
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, query, where, getDocs, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { Send as SendIcon } from '@mui/icons-material';

const SupportTicket = () => {
  const { currentUser } = useAuth();
  const theme = useTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatDialogOpen, setChatDialogOpen] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [currentUser]);

  const fetchTickets = async () => {
    try {
      const ticketsRef = collection(db, 'support_tickets');
      const q = query(
        ticketsRef,
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const ticketsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      
      setTickets(ticketsData);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Error fetching tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const ticketData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        subject: newTicket.subject,
        message: newTicket.message,
        status: 'waiting',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'support_tickets'), ticketData);
      setNewTicket({ subject: '', message: '' });
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      setError('Error creating ticket');
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    try {
      const ticketRef = doc(db, 'support_tickets', selectedTicket.id);
      const newMessage = {
        text: chatMessage,
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
        timestamp: serverTimestamp()
      };

      await updateDoc(ticketRef, {
        messages: [...(selectedTicket.messages || []), newMessage],
        status: 'active',
        updatedAt: serverTimestamp()
      });

      setChatMessage('');
      fetchTickets();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error sending message');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting':
        return 'warning';
      case 'active':
        return 'success';
      case 'solved':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: theme.palette.primary.main }}>
          Support Tickets
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Create New Ticket
          </Typography>
          <form onSubmit={handleCreateTicket}>
            <TextField
              fullWidth
              label="Subject"
              value={newTicket.subject}
              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            <TextareaAutosize
              minRows={4}
              placeholder="Describe your issue..."
              value={newTicket.message}
              onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '4px',
                border: `1px solid ${theme.palette.divider}`,
                fontFamily: theme.typography.fontFamily,
                fontSize: theme.typography.body1.fontSize,
                lineHeight: theme.typography.body1.lineHeight,
              }}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Create Ticket
            </Button>
          </form>
        </Box>

        <Typography variant="h6" gutterBottom>
          Your Tickets
        </Typography>
        <List>
          {tickets.map((ticket) => (
            <React.Fragment key={ticket.id}>
              <ListItem
                button
                onClick={() => {
                  setSelectedTicket(ticket);
                  setChatDialogOpen(true);
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    {ticket.subject[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={ticket.subject}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Typography component="span" variant="body2" color="text.secondary">
                        {format(ticket.createdAt, 'MMM d, yyyy HH:mm')}
                      </Typography>
                      <Chip
                        label={ticket.status}
                        color={getStatusColor(ticket.status)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  }
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <Dialog
        open={chatDialogOpen}
        onClose={() => setChatDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTicket?.subject}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400, overflowY: 'auto', mb: 2 }}>
            {selectedTicket?.messages?.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  flexDirection: message.senderId === currentUser.uid ? 'row-reverse' : 'row',
                  mb: 2,
                }}
              >
                <Avatar sx={{ mx: 1, bgcolor: message.senderId === currentUser.uid ? theme.palette.primary.main : theme.palette.grey[500] }}>
                  {message.senderEmail[0]}
                </Avatar>
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    backgroundColor: message.senderId === currentUser.uid ? theme.palette.primary.light : theme.palette.grey[100],
                    color: message.senderId === currentUser.uid ? theme.palette.primary.contrastText : theme.palette.text.primary,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body1">
                    {message.text}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                    {format(message.timestamp?.toDate?.() || new Date(), 'HH:mm')}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>
          {selectedTicket?.status !== 'solved' && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your message..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!chatMessage.trim()}
                sx={{ alignSelf: 'flex-end' }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChatDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SupportTicket; 