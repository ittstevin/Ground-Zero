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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

const AdminTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    startDate: '',
    endDate: '',
    prizePool: '',
    entryFee: '',
    maxParticipants: '',
    status: 'upcoming',
    type: 'single', // single, double, round-robin
    format: 'knockout', // knockout, league, group-stage
    description: '',
    rules: '',
    platform: 'ps4', // ps4, pc, mobile
    registrationDeadline: '',
    streamUrl: '',
    resultsUrl: '',
    isLive: false,
    image: null,
    imageUrl: ''
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const tournamentsRef = collection(db, 'tournaments');
      const q = query(tournamentsRef, orderBy('startDate', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const tournamentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate?.() || new Date(),
        endDate: doc.data().endDate?.toDate?.() || new Date()
      }));
      
      setTournaments(tournamentsData);
      setLoading(false);
    } catch (err) {
      setError('Error fetching tournaments: ' + err.message);
      setLoading(false);
    }
  };

  const handleOpenDialog = (tournament = null) => {
    if (tournament) {
      setEditingTournament(tournament);
      setFormData({
        name: tournament.name,
        game: tournament.game,
        startDate: tournament.startDate instanceof Date ? tournament.startDate : new Date(tournament.startDate),
        endDate: tournament.endDate instanceof Date ? tournament.endDate : new Date(tournament.endDate),
        prizePool: tournament.prizePool.toString(),
        entryFee: tournament.entryFee.toString(),
        maxParticipants: tournament.maxParticipants.toString(),
        status: tournament.status,
        type: tournament.type,
        format: tournament.format,
        description: tournament.description || '',
        rules: tournament.rules || '',
        platform: tournament.platform,
        registrationDeadline: tournament.registrationDeadline instanceof Date ? tournament.registrationDeadline : new Date(tournament.registrationDeadline),
        streamUrl: tournament.streamUrl || '',
        resultsUrl: tournament.resultsUrl || '',
        isLive: tournament.isLive,
        image: null,
        imageUrl: tournament.image || ''
      });
    } else {
      const now = new Date();
      setEditingTournament(null);
      setFormData({
        name: '',
        game: '',
        startDate: now,
        endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours from now
        prizePool: '',
        entryFee: '',
        maxParticipants: '',
        status: 'upcoming',
        type: 'single',
        format: 'knockout',
        description: '',
        rules: '',
        platform: 'ps4',
        registrationDeadline: now,
        streamUrl: '',
        resultsUrl: '',
        isLive: false,
        image: null,
        imageUrl: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTournament(null);
    setFormData({
      name: '',
      game: '',
      startDate: '',
      endDate: '',
      prizePool: '',
      entryFee: '',
      maxParticipants: '',
      status: 'upcoming',
      type: 'single',
      format: 'knockout',
      description: '',
      rules: '',
      platform: 'ps4',
      registrationDeadline: '',
      streamUrl: '',
      resultsUrl: '',
      isLive: false,
      image: null,
      imageUrl: ''
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Create a storage reference
      const storageRef = ref(storage, `tournaments/${Date.now()}_${file.name}`);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update form data with the image URL
      setFormData({
        ...formData,
        image: file,
        imageUrl: downloadURL
      });
    } catch (err) {
      setError('Error uploading image: ' + err.message);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.startDate || !formData.endDate || 
          !formData.entryFee || !formData.prizePool || !formData.maxParticipants) {
        setError('Please fill in all required fields');
        return;
      }

      // Ensure dates are valid
      const startDate = formData.startDate instanceof Date ? formData.startDate : new Date(formData.startDate);
      const endDate = formData.endDate instanceof Date ? formData.endDate : new Date(formData.endDate);
      const registrationDeadline = formData.registrationDeadline instanceof Date ? formData.registrationDeadline : new Date(formData.registrationDeadline);

      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || isNaN(registrationDeadline.getTime())) {
        setError('Invalid date values. Please check your date inputs.');
        return;
      }

      // Format the data
      const tournamentData = {
        name: formData.name.trim(),
        game: formData.game.trim(),
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        prizePool: parseFloat(formData.prizePool),
        entryFee: parseFloat(formData.entryFee),
        maxParticipants: parseInt(formData.maxParticipants),
        status: formData.status,
        type: formData.type,
        format: formData.format,
        description: formData.description?.trim() || '',
        rules: formData.rules?.trim() || '',
        platform: formData.platform,
        registrationDeadline: Timestamp.fromDate(registrationDeadline),
        streamUrl: formData.streamUrl?.trim() || '',
        resultsUrl: formData.resultsUrl?.trim() || '',
        isLive: formData.isLive,
        currentParticipants: 0,
        image: formData.imageUrl,
        updatedAt: Timestamp.now()
      };

      if (editingTournament) {
        const tournamentRef = doc(db, 'tournaments', editingTournament.id);
        await updateDoc(tournamentRef, tournamentData);
      } else {
        tournamentData.createdAt = Timestamp.now();
        await addDoc(collection(db, 'tournaments'), tournamentData);
      }
      
      handleCloseDialog();
      fetchTournaments();
    } catch (err) {
      console.error('Error saving tournament:', err);
      setError('Error saving tournament: ' + err.message);
    }
  };

  const handleDelete = async (tournamentId) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        await deleteDoc(doc(db, 'tournaments', tournamentId));
        fetchTournaments();
      } catch (err) {
        setError('Error deleting tournament: ' + err.message);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live':
        return 'error';
      case 'upcoming':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Manage Tournaments
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New Tournament
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Game</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Prize Pool</TableCell>
                <TableCell>Entry Fee</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tournaments.map((tournament) => (
                <TableRow key={tournament.id}>
                  <TableCell>{tournament.name}</TableCell>
                  <TableCell>{tournament.game}</TableCell>
                  <TableCell>{format(tournament.startDate, 'PPp')}</TableCell>
                  <TableCell>{format(tournament.endDate, 'PPp')}</TableCell>
                  <TableCell>KES {tournament.prizePool}</TableCell>
                  <TableCell>KES {tournament.entryFee}</TableCell>
                  <TableCell>
                    <Chip
                      label={tournament.status}
                      color={getStatusColor(tournament.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(tournament)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(tournament.id)}
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

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingTournament ? 'Edit Tournament' : 'Add New Tournament'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="tournament-image-upload"
                    type="file"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="tournament-image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<ImageIcon />}
                    >
                      Upload Image
                    </Button>
                  </label>
                  {formData.imageUrl && (
                    <Box sx={{ 
                      width: 100, 
                      height: 100, 
                      position: 'relative',
                      borderRadius: 1,
                      overflow: 'hidden',
                      border: '1px solid #e0e0e0',
                      boxShadow: 1
                    }}>
                      <img
                        src={formData.imageUrl}
                        alt="Tournament preview"
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover'
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Game"
                  value={formData.game}
                  onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="Start Date"
                  value={formData.startDate ? new Date(formData.startDate) : null}
                  onChange={(newValue) => setFormData({ ...formData, startDate: newValue })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="End Date"
                  value={formData.endDate ? new Date(formData.endDate) : null}
                  onChange={(newValue) => setFormData({ ...formData, endDate: newValue })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prize Pool (KES)"
                  type="number"
                  value={formData.prizePool}
                  onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Entry Fee (KES)"
                  type="number"
                  value={formData.entryFee}
                  onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Max Participants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="upcoming">Upcoming</MenuItem>
                    <MenuItem value="live">Live</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} color="primary">
              {editingTournament ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default AdminTournaments; 