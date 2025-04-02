import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';

function PlayStationPage() {
  const [consoles, setConsoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsoles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'consoles'));
        const consoleData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setConsoles(consoleData);
      } catch (error) {
        console.error('Error fetching consoles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsoles();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        PlayStation 4 Pro Consoles
      </Typography>
      <Typography variant="h6" color="text.secondary" align="center" paragraph>
        Book your gaming session with our premium PS4 Pro consoles
      </Typography>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        {consoles.map((console) => (
          <Grid item key={console.id} xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box
                component="img"
                src={console.imageUrl || 'https://via.placeholder.com/300x200'}
                alt={`PS4 Pro ${console.number}`}
                sx={{
                  height: 200,
                  objectFit: 'cover',
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  PS4 Pro #{console.number}
                </Typography>
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
                <Typography variant="h6" color="primary" gutterBottom>
                  KES {console.pricePerHour}/hour
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={console.status !== 'available'}
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Why Choose Our PS4 Pro Consoles?
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Premium Experience
            </Typography>
            <Typography>
              Our PS4 Pro consoles are equipped with the latest firmware and regularly maintained for optimal performance.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              ️4K HDR Gaming
            </Typography>
            <Typography>
              Experience your favorite games in stunning 4K resolution with HDR support for enhanced visuals.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Comfortable Setup
            </Typography>
            <Typography>
              Ergonomic seating and proper lighting create the perfect gaming environment.
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default PlayStationPage; 