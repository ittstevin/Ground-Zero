import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Icon,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Speed as SpeedIcon,
  EmojiEvents as TrophyIcon,
  Groups as CommunityIcon,
} from '@mui/icons-material';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  padding: theme.spacing(4),
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  color: 'white',
  '& svg': {
    fontSize: 32,
  },
}));

const AnimatedTypography = styled(Typography)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));

const WhyChooseGroundZero = () => {
  const features = [
    {
      icon: <SpeedIcon />,
      title: 'High-Performance Gaming',
      description: 'Experience gaming at its finest with our state-of-the-art consoles and high-speed internet connection.',
    },
    {
      icon: <TrophyIcon />,
      title: 'Tournament Ready',
      description: 'Participate in exciting tournaments and compete with the best gamers in the community.',
    },
    {
      icon: <CommunityIcon />,
      title: 'Vibrant Community',
      description: 'Join a thriving gaming community where you can connect, compete, and share your passion for gaming.',
    },
  ];

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
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
          }}
        >
          Why Choose Ground Zero
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <StyledCard>
                <IconWrapper>
                  <Icon>{feature.icon}</Icon>
                </IconWrapper>
                <CardContent>
                  <AnimatedTypography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                    }}
                  >
                    {feature.title}
                  </AnimatedTypography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.7,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default WhyChooseGroundZero; 