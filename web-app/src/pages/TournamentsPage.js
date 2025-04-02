import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  EmojiEvents as TrophyIcon,
  People as PeopleIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  LiveTv as StreamIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tournament-tabpanel-${index}`}
      aria-labelledby={`tournament-tab-${index}`}
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

const TournamentsPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [openRegistrationDialog, setOpenRegistrationDialog] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [registrationData, setRegistrationData] = useState({
    gameUsername: '',
    discordUsername: '',
    teamName: ''
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRegisterClick = (tournament) => {
    setSelectedTournament(tournament);
    setOpenRegistrationDialog(true);
  };

  const handleRegistrationSubmit = async () => {
    try {
      const registrationRef = collection(db, 'tournament_registrations');
      await addDoc(registrationRef, {
        tournamentId: selectedTournament.id,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        ...registrationData,
        status: 'pending',
        registeredAt: new Date()
      });

      // Update tournament participants count
      const tournamentRef = doc(db, 'tournaments', selectedTournament.id);
      await updateDoc(tournamentRef, {
        currentParticipants: (selectedTournament.currentParticipants || 0) + 1
      });

      setOpenRegistrationDialog(false);
      setRegistrationData({
        gameUsername: '',
        discordUsername: '',
        teamName: ''
      });
      fetchTournaments(); // Refresh tournament data
    } catch (err) {
      setError('Error registering for tournament: ' + err.message);
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

  const filteredTournaments = tournaments.filter(tournament => {
    const now = new Date();
    const startDate = new Date(tournament.startDate);
    const endDate = new Date(tournament.endDate);

    switch (activeTab) {
      case 0: // Live
        return tournament.status === 'live';
      case 1: // Upcoming
        return tournament.status === 'upcoming';
      case 2: // Past
        return tournament.status === 'completed' || tournament.status === 'cancelled';
      default:
        return true;
    }
  });

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tournaments
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          aria-label="tournament tabs"
        >
          <Tab label="Live" />
          <Tab label="Upcoming" />
          <Tab label="Past" />
        </Tabs>

        <Divider />

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {filteredTournaments.map((tournament) => (
              <Grid item key={tournament.id} xs={12} md={6}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={tournament.image || '/images/tournament-placeholder.jpg'}
                    alt={tournament.name}
                  />
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" component="h2">
                        {tournament.name}
                      </Typography>
                      <Chip
                        label={tournament.status}
                        color={getStatusColor(tournament.status)}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {tournament.description}
                    </Typography>

                    <List dense>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <TrophyIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Prize Pool"
                          secondary={`KES ${tournament.prizePool}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <PeopleIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Participants"
                          secondary={`${tournament.currentParticipants || 0}/${tournament.maxParticipants}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <TimeIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Start Date"
                          secondary={format(new Date(tournament.startDate), 'PPp')}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <MoneyIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Entry Fee"
                          secondary={`KES ${tournament.entryFee}`}
                        />
                      </ListItem>
                    </List>

                    <Box mt={2} display="flex" justifyContent="flex-end">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleRegisterClick(tournament)}
                        disabled={tournament.status !== 'upcoming' || 
                                (tournament.currentParticipants >= tournament.maxParticipants)}
                      >
                        Register
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            {filteredTournaments.map((tournament) => (
              <Grid item key={tournament.id} xs={12} md={6}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={tournament.image || '/images/tournament-placeholder.jpg'}
                    alt={tournament.name}
                  />
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" component="h2">
                        {tournament.name}
                      </Typography>
                      <Chip
                        label={tournament.status}
                        color={getStatusColor(tournament.status)}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {tournament.description}
                    </Typography>

                    <List dense>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <TrophyIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Prize Pool"
                          secondary={`KES ${tournament.prizePool}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <PeopleIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Participants"
                          secondary={`${tournament.currentParticipants || 0}/${tournament.maxParticipants}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <TimeIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Start Date"
                          secondary={format(new Date(tournament.startDate), 'PPp')}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <MoneyIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Entry Fee"
                          secondary={`KES ${tournament.entryFee}`}
                        />
                      </ListItem>
                    </List>

                    <Box mt={2} display="flex" justifyContent="flex-end">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleRegisterClick(tournament)}
                        disabled={tournament.currentParticipants >= tournament.maxParticipants}
                      >
                        Register
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            {filteredTournaments.map((tournament) => (
              <Grid item key={tournament.id} xs={12} md={6}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={tournament.image || '/images/tournament-placeholder.jpg'}
                    alt={tournament.name}
                  />
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" component="h2">
                        {tournament.name}
                      </Typography>
                      <Chip
                        label={tournament.status}
                        color={getStatusColor(tournament.status)}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {tournament.description}
                    </Typography>

                    <List dense>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <TrophyIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Prize Pool"
                          secondary={`KES ${tournament.prizePool}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <PeopleIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Participants"
                          secondary={`${tournament.currentParticipants || 0}/${tournament.maxParticipants}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <TimeIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Start Date"
                          secondary={format(new Date(tournament.startDate), 'PPp')}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <MoneyIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Entry Fee"
                          secondary={`KES ${tournament.entryFee}`}
                        />
                      </ListItem>
                    </List>

                    {tournament.resultsUrl && (
                      <Box mt={2} display="flex" justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          color="primary"
                          href={tournament.resultsUrl}
                          target="_blank"
                          startIcon={<TrophyIcon />}
                        >
                          View Results
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Paper>

      <Dialog open={openRegistrationDialog} onClose={() => setOpenRegistrationDialog(false)}>
        <DialogTitle>Register for {selectedTournament?.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Game Username"
            fullWidth
            value={registrationData.gameUsername}
            onChange={(e) => setRegistrationData({ ...registrationData, gameUsername: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Discord Username"
            fullWidth
            value={registrationData.discordUsername}
            onChange={(e) => setRegistrationData({ ...registrationData, discordUsername: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Team Name (Optional)"
            fullWidth
            value={registrationData.teamName}
            onChange={(e) => setRegistrationData({ ...registrationData, teamName: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRegistrationDialog(false)}>Cancel</Button>
          <Button onClick={handleRegistrationSubmit} color="primary">
            Register
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TournamentsPage; 