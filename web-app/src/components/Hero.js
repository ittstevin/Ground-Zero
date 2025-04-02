import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
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

const ContentWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  textAlign: 'center',
  padding: theme.spacing(4),
}));

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

const Hero = () => {
  return (
    <HeroSection>
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
          <source src="/videos/hero-background.mp4" type="video/mp4" />
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
          Welcome to Ground Zero
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
          Your Ultimate Gaming Destination
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
            component={Link}
            to="/booking"
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
            Explore Games
          </StyledButton>
        </Stack>
      </ContentWrapper>
    </HeroSection>
  );
};

export default Hero; 