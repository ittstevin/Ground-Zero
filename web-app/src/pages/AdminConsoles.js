import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const getStatusColor = (status) => {
  switch (status) {
    case 'available':
      return 'success';
    case 'maintenance':
      return 'warning';
    case 'in_use':
      return 'info';
    case 'broken':
      return 'error';
    default:
      return 'default';
  }
};

const AdminConsoles = () => {
  const [consoles, setConsoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingConsole, setEditingConsole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: 'available',
    pricePerHour: '',
    description: '',
  });

  useEffect(() => {
    fetchConsoles();
  }, []);

  const fetchConsoles = async () => {
    try {
      const consolesRef = collection(db, 'consoles');
      const querySnapshot = await getDocs(consolesRef);
      
      const consolesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setConsoles(consolesData);
      setLoading(false);
    } catch (err) {
      setError('Error fetching consoles: ' + err.message);
      setLoading(false);
    }
  };

  const handleOpenDialog = (console = null) => {
    if (console) {
      setEditingConsole(console);
      setFormData({
        name: console.name,
        type: console.type,
        status: console.status,
        pricePerHour: console.pricePerHour.toString(),
        description: console.description || '',
      });
    } else {
      setEditingConsole(null);
      setFormData({
        name: '',
        type: '',
        status: 'available',
        pricePerHour: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingConsole(null);
    setFormData({
      name: '',
      type: '',
      status: 'available',
      pricePerHour: '',
      description: '',
    });
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.type || !formData.status || !formData.pricePerHour) {
        setError('Please fill in all required fields');
        return;
      }

      // Format the data
      const consoleData = {
        name: formData.name.trim(),
        type: formData.type.trim(),
        status: formData.status,
        pricePerHour: parseFloat(formData.pricePerHour),
        description: formData.description?.trim() || '',
        updatedAt: new Date()
      };

      if (editingConsole) {
        const consoleRef = doc(db, 'consoles', editingConsole.id);
        await updateDoc(consoleRef, consoleData);
      } else {
        consoleData.createdAt = new Date();
        await addDoc(collection(db, 'consoles'), consoleData);
      }
      
      handleCloseDialog();
      fetchConsoles();
    } catch (err) {
      setError('Error saving console: ' + err.message);
    }
  };

  const handleDelete = async (consoleId) => {
    if (window.confirm('Are you sure you want to delete this console?')) {
      try {
        await deleteDoc(doc(db, 'consoles', consoleId));
        setConsoles(consoles.filter(console => console.id !== consoleId));
      } catch (err) {
        setError('Error deleting console: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Manage Consoles
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add New Console
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Price per Hour</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {consoles.map((console) => (
              <TableRow key={console.id}>
                <TableCell>{console.name}</TableCell>
                <TableCell>{console.type}</TableCell>
                <TableCell>
                  <Chip
                    label={console.status}
                    color={getStatusColor(console.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>KES {console.pricePerHour}/hr</TableCell>
                <TableCell>{console.description}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(console)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(console.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingConsole ? 'Edit Console' : 'Add New Console'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Type"
            fullWidth
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Status"
            fullWidth
            select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="available">Available</option>
            <option value="maintenance">Maintenance</option>
            <option value="in_use">In Use</option>
            <option value="broken">Broken</option>
          </TextField>
          <TextField
            margin="dense"
            label="Price per Hour (KES)"
            fullWidth
            type="number"
            value={formData.pricePerHour}
            onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            {editingConsole ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminConsoles; 