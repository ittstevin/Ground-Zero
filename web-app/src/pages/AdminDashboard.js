import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  CircularProgress,
  DialogContentText,
  Badge
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Support as SupportIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { collection, query, getDocs, updateDoc, doc, deleteDoc, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import AdminProducts from './AdminProducts';
import AdminBookings from './AdminBookings';
import AdminConsoles from './AdminConsoles';
import AdminTournaments from './AdminTournaments';
import AdminShop from './AdminShop';
import { format } from 'date-fns';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
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

function AdminDashboard() {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [supportTickets, setSupportTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchSupportTickets();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
      setLoading(false);
    }
  };

  const fetchSupportTickets = async () => {
    try {
      const ticketsRef = collection(db, 'support_tickets');
      const q = query(ticketsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const ticketsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      
      setSupportTickets(ticketsData);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      setError('Error fetching support tickets');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (user) => {
    setSelectedUser(user);
    setLoyaltyPoints(user.loyaltyPoints?.toString() || '0');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleUpdateLoyaltyPoints = async () => {
    try {
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, {
        loyaltyPoints: parseInt(loyaltyPoints)
      });
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, loyaltyPoints: parseInt(loyaltyPoints) }
          : user
      ));
      showSnackbar('Loyalty points updated successfully');
      handleCloseDialog();
    } catch (error) {
      showSnackbar('Failed to update loyalty points', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDeleteUser = (userId) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const userRef = doc(db, 'users', userToDelete);
      await deleteDoc(userRef);
      
      // Update the users list
      setUsers(users.filter(user => user.id !== userToDelete));
      
      showSnackbar('User deleted successfully');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      showSnackbar('Failed to delete user', 'error');
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleTicketStatusChange = async (ticketId, newStatus) => {
    try {
      const ticketRef = doc(db, 'support_tickets', ticketId);
      await updateDoc(ticketRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      
      setSupportTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, status: newStatus }
            : ticket
        )
      );
      
      showSnackbar(`Ticket ${newStatus === 'resolved' ? 'resolved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      showSnackbar('Error updating ticket status', 'error');
    }
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setTicketDialogOpen(true);
  };

  if (!currentUser || !currentUser.isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" />
          <Tab label="Products" />
          <Tab label="Users" />
          <Tab label="Bookings" />
          <Tab label="Consoles" />
          <Tab label="Tournaments" />
          <Tab 
            label={
              <Badge 
                badgeContent={supportTickets.filter(t => t.status === 'pending').length} 
                color="error"
              >
                <SupportIcon sx={{ mr: 1 }} />
                Support
              </Badge>
            } 
          />
        </Tabs>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Users
                    </Typography>
                    <Typography variant="h4">
                      {users.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              {/* Add more overview cards here */}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <AdminProducts />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                User Management
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Loyalty Points</TableCell>
                        <TableCell>Member Since</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.displayName || 'N/A'}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phoneNumber || 'N/A'}</TableCell>
                          <TableCell>{user.loyaltyPoints || 0}</TableCell>
                          <TableCell>
                            {user.createdAt ? format(user.createdAt, 'MMM dd, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={user.isActive ? 'Active' : 'Inactive'} 
                              color={user.isActive ? 'success' : 'default'} 
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(user)}
                              title="Edit Loyalty Points"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteUser(user.id)}
                              title="Delete User"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
          <AdminBookings />
        </TabPanel>

          <TabPanel value={tabValue} index={4}>
          <AdminConsoles />
        </TabPanel>

          <TabPanel value={tabValue} index={5}>
          <AdminTournaments />
        </TabPanel>

          <TabPanel value={tabValue} index={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Support Tickets
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {supportTickets.map((ticket) => (
                        <TableRow 
                          key={ticket.id}
                          hover
                          onClick={() => handleTicketClick(ticket)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>{ticket.id}</TableCell>
                          <TableCell>{ticket.userEmail}</TableCell>
                          <TableCell>{ticket.subject}</TableCell>
                          <TableCell>
                            <Chip
                              label={ticket.status}
                              color={
                                ticket.status === 'resolved' ? 'success' :
                                ticket.status === 'rejected' ? 'error' :
                                'warning'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {format(ticket.createdAt, 'MMM d, yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            {ticket.status === 'pending' && (
                              <>
                                <IconButton
                                  color="success"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTicketStatusChange(ticket.id, 'resolved');
                                  }}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                                <IconButton
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTicketStatusChange(ticket.id, 'rejected');
                                  }}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </TabPanel>
        </LocalizationProvider>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Update Loyalty Points</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Loyalty Points"
            type="number"
            fullWidth
            value={loyaltyPoints}
            onChange={(e) => setLoyaltyPoints(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleUpdateLoyaltyPoints} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete User
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={ticketDialogOpen}
        onClose={() => setTicketDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Support Ticket Details
        </DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Subject: {selectedTicket.subject}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                From: {selectedTicket.userEmail}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Created: {format(selectedTicket.createdAt, 'MMM d, yyyy HH:mm')}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                {selectedTicket.message}
              </Typography>
              {selectedTicket.response && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Response:
                  </Typography>
                  <Typography variant="body1">
                    {selectedTicket.response}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTicketDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AdminDashboard; 