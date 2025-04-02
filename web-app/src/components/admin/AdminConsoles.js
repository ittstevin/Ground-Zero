import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import {
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
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function AdminConsoles() {
  const [consoles, setConsoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingConsole, setEditingConsole] = useState(null);
  const [formData, setFormData] = useState({
    number: '',
    description: '',
    controllers: 2,
    pricePerHour: 200,
    status: 'available',
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'consoles'), (snapshot) => {
      const consoleList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConsoles(consoleList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching consoles:', error);
      setError('Failed to load consoles');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenDialog = (console = null) => {
    if (console) {
      setEditingConsole(console);
      setFormData({
        number: console.number,
        description: console.description,
        controllers: console.controllers,
        pricePerHour: console.pricePerHour,
        status: console.status,
      });
    } else {
      setEditingConsole(null);
      setFormData({
        number: '',
        description: '',
        controllers: 2,
        pricePerHour: 200,
        status: 'available',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingConsole(null);
    setFormData({
      number: '',
      description: '',
      controllers: 2,
      pricePerHour: 200,
      status: 'available',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      if (editingConsole) {
        const consoleRef = doc(db, 'consoles', editingConsole.id);
        await updateDoc(consoleRef, formData);
        setSuccess('Console updated successfully');
      } else {
        await addDoc(collection(db, 'consoles'), formData);
        setSuccess('Console added successfully');
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving console:', error);
      setError(`Failed to save console: ${error.message}`);
    }
  };

  const handleDelete = async (consoleId) => {
    if (!window.confirm('Are you sure you want to delete this console?')) return;

    try {
      setError('');
      setSuccess('');
      await deleteDoc(doc(db, 'consoles', consoleId));
      setSuccess('Console deleted successfully');
    } catch (error) {
      console.error('Error deleting console:', error);
      setError(`Failed to delete console: ${error.message}`);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Manage PlayStation Consoles
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add New Console
        </Button>
      </Box>

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

      <Grid container spacing={3}>
        {consoles.map((console) => (
          <Grid item key={console.id} xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h5">
                    PS4 Pro #{console.number}
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(console)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(console.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {console.description || 'High-performance gaming console with 4K HDR support'}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={console.status === 'available' ? 'Available' : 'In Use'}
                    color={console.status === 'available' ? 'success' : 'error'}
                    sx={{ mr: 1 }}
                  />
                  <Chip label={`${console.controllers} Controllers`} />
                </Box>
                <Typography variant="h6" color="primary">
                  KES {console.pricePerHour}/hour
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingConsole ? 'Edit Console' : 'Add New Console'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              label="Console Number"
              fullWidth
              margin="normal"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              required
            />
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              label="Number of Controllers"
              type="number"
              fullWidth
              margin="normal"
              value={formData.controllers}
              onChange={(e) => setFormData({ ...formData, controllers: parseInt(e.target.value) })}
              required
            />
            <TextField
              label="Price per Hour (KES)"
              type="number"
              fullWidth
              margin="normal"
              value={formData.pricePerHour}
              onChange={(e) => setFormData({ ...formData, pricePerHour: parseInt(e.target.value) })}
              required
            />
            <TextField
              select
              label="Status"
              fullWidth
              margin="normal"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
              SelectProps={{
                native: true,
              }}
            >
              <option value="available">Available</option>
              <option value="in_use">In Use</option>
              <option value="maintenance">Maintenance</option>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingConsole ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default AdminConsoles; 