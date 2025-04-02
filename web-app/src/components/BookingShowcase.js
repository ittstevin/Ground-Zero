import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { Close as CloseIcon } from '@mui/icons-material';

const ShowcaseSection = styled(Box)(({ theme, background }) => ({
  padding: theme.spacing(8, 0),
  background: background || theme.palette.background.default,
  position: 'relative',
  overflow: 'hidden',
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  textAlign: 'center',
  padding: theme.spacing(4),
}));

const VideoBackground = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 0,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%)',
  },
});

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  borderRadius: '30px',
  textTransform: 'none',
  fontSize: '1.1rem',
  fontWeight: 600,
  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
  '&:hover': {
    boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
  },
}));

const ConsoleCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  overflow: 'hidden',
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  },
}));

const GameCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  },
}));

const AccessoryCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  overflow: 'hidden',
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  },
}));

const BookingShowcase = () => {
  const theme = useTheme();
  const [selectedConsole, setSelectedConsole] = useState(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    duration: '1',
    console: '',
  });

  const consoles = [
    {
      name: 'PS4 Pro',
      description: 'Experience gaming in stunning 4K HDR with enhanced performance.',
      image: '/images/ps4-pro.jpg',
      specs: [
        '4K HDR Gaming',
        'Enhanced Performance',
        'HDR Support',
        'Boost Mode',
      ],
      price: '₹200/hour',
    },
    {
      name: 'PS4 Slim',
      description: 'Compact and powerful gaming console for casual gamers.',
      image: '/images/ps4-slim.jpg',
      specs: [
        '1080p Gaming',
        'Energy Efficient',
        'Compact Design',
        '1TB Storage',
      ],
      price: '₹150/hour',
    },
    {
      name: 'PS5',
      description: 'Next-gen gaming experience with lightning-fast loading.',
      image: '/images/ps5.jpg',
      specs: [
        '4K 120fps Gaming',
        'SSD Storage',
        'DualSense Controller',
        'Ray Tracing',
      ],
      price: '₹300/hour',
    },
  ];

  const popularGames = [
    {
      name: 'God of War Ragnarök',
      genre: 'Action-Adventure',
      rating: 'M',
      image: '/images/god-of-war.jpg',
    },
    {
      name: 'Horizon Forbidden West',
      genre: 'Action RPG',
      rating: 'T',
      image: '/images/horizon.jpg',
    },
    {
      name: 'Gran Turismo 7',
      genre: 'Racing',
      rating: 'E',
      image: '/images/gran-turismo.jpg',
    },
  ];

  const accessories = [
    {
      name: 'DualSense Controller',
      description: 'Next-gen controller with haptic feedback and adaptive triggers.',
      image: '/images/dualsense.jpg',
    },
    {
      name: 'Pulse 3D Headset',
      description: 'Premium wireless headset with 3D audio support.',
      image: '/images/pulse-headset.jpg',
    },
    {
      name: 'DualShock 4',
      description: 'Classic controller with precise controls and built-in speaker.',
      image: '/images/dualshock.jpg',
    },
  ];

  const handleBookingClick = (console) => {
    setSelectedConsole(console);
    setBookingForm(prev => ({ ...prev, console: console.name }));
    setBookingDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setBookingDialogOpen(false);
    setSelectedConsole(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitBooking = () => {
    // Handle booking submission
    console.log('Booking submitted:', bookingForm);
    handleCloseDialog();
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        }}
      >
        <VideoBackground>
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          >
            <source src="/videos/ps4-pro-showcase.mp4" type="video/mp4" />
          </video>
        </VideoBackground>
        <ContentWrapper>
          <Typography
            variant="h1"
            align="center"
            gutterBottom
            sx={{
              fontSize: { xs: '3rem', md: '5rem' },
              fontWeight: 700,
              letterSpacing: '-0.02em',
              mb: 4,
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            PS4 Pro
          </Typography>
          <Typography
            variant="h5"
            align="center"
            sx={{
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              color: 'white',
              mb: 6,
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            Experience gaming in stunning 4K HDR
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <StyledButton
              variant="contained"
              color="primary"
              size="large"
              onClick={() => setBookingDialogOpen(true)}
            >
              Book Now
            </StyledButton>
            <StyledButton
              variant="outlined"
              color="inherit"
              size="large"
              component={Link}
              to="/marketplace"
            >
              Learn More
            </StyledButton>
          </Stack>
        </ContentWrapper>
      </Box>

      {/* Features Section */}
      <ShowcaseSection>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                gutterBottom
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  mb: 4,
                }}
              >
                Next-Gen Gaming Experience
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                paragraph
                sx={{ mb: 4 }}
              >
                Immerse yourself in stunning 4K HDR graphics, enhanced performance, and a vast library of games.
              </Typography>
              <Stack spacing={2}>
                {[
                  '4K HDR Gaming',
                  'Enhanced Performance',
                  'HDR Support',
                  'Boost Mode',
                ].map((feature, index) => (
                  <Stack key={feature} direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: 'white', fontWeight: 'bold' }}
                      >
                        ✓
                      </Typography>
                    </Box>
                    <Typography variant="body1">{feature}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/ps4-pro-features.jpg"
                alt="PS4 Pro Features"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '20px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </ShowcaseSection>

      {/* Available Consoles Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontWeight: 700,
            letterSpacing: '-0.02em',
            mb: 6,
          }}
        >
          Available Consoles
        </Typography>
        <Grid container spacing={4}>
          {consoles.map((console, index) => (
            <Grid item xs={12} md={4} key={index}>
              <ConsoleCard>
                <CardMedia
                  component="img"
                  height="200"
                  image={console.image}
                  alt={console.name}
                />
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                    }}
                  >
                    {console.name}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {console.description}
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 3 }}>
                    {console.specs.map((spec, idx) => (
                      <Typography key={idx} variant="body2">
                        • {spec}
                      </Typography>
                    ))}
                  </Stack>
                  <Typography
                    variant="h6"
                    color="primary"
                    sx={{ mb: 2 }}
                  >
                    {console.price}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => handleBookingClick(console)}
                  >
                    Book Now
                  </Button>
                </CardContent>
              </ConsoleCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Popular Games Section */}
      <ShowcaseSection background="linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)">
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            gutterBottom
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 700,
              letterSpacing: '-0.02em',
              mb: 6,
              color: 'white',
            }}
          >
            Popular Games
          </Typography>
          <Grid container spacing={4}>
            {popularGames.map((game, index) => (
              <Grid item xs={12} md={4} key={index}>
                <GameCard>
                  <CardMedia
                    component="img"
                    height="200"
                    image={game.image}
                    alt={game.name}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                      }}
                    >
                      {game.name}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip label={game.genre} color="primary" />
                      <Chip label={game.rating} color="secondary" />
                    </Stack>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Available on all our consoles
                    </Typography>
                  </CardContent>
                </GameCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </ShowcaseSection>

      {/* Accessories Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontWeight: 700,
            letterSpacing: '-0.02em',
            mb: 6,
          }}
        >
          Premium Accessories
        </Typography>
        <Grid container spacing={4}>
          {accessories.map((accessory, index) => (
            <Grid item xs={12} md={4} key={index}>
              <AccessoryCard>
                <CardMedia
                  component="img"
                  height="200"
                  image={accessory.image}
                  alt={accessory.name}
                />
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                    }}
                  >
                    {accessory.name}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {accessory.description}
                  </Typography>
                </CardContent>
              </AccessoryCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Booking Dialog */}
      <Dialog
        open={bookingDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 0
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Book Your Gaming Session
          </Typography>
          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={bookingForm.name}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={bookingForm.email}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={bookingForm.phone}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={bookingForm.date}
                onChange={handleFormChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Time"
                name="time"
                type="time"
                value={bookingForm.time}
                onChange={handleFormChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Duration (hours)"
                name="duration"
                value={bookingForm.duration}
                onChange={handleFormChange}
                required
              >
                {[1, 2, 3, 4, 5, 6].map((hour) => (
                  <MenuItem key={hour} value={hour}>
                    {hour} {hour === 1 ? 'hour' : 'hours'}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Console"
                name="console"
                value={bookingForm.console}
                onChange={handleFormChange}
                required
              >
                {consoles.map((console) => (
                  <MenuItem key={console.name} value={console.name}>
                    {console.name} - {console.price}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitBooking}
            size="large"
          >
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingShowcase; 