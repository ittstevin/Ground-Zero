import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Icon,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  SportsEsports as GamingIcon,
  EmojiEvents as TrophyIcon,
  Groups as CommunityIcon,
  LocalCafe as CafeIcon,
  Wifi as WifiIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

const FeatureCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-10px)',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  background: theme.palette.primary.main,
  color: 'white',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

const Features = () => {
  const features = [
    {
      icon: <GamingIcon sx={{ fontSize: 40 }} />,
      title: 'Premium Gaming',
      description: 'State-of-the-art PlayStation 4 Pro consoles with the latest games.',
    },
    {
      icon: <TrophyIcon sx={{ fontSize: 40 }} />,
      title: 'Tournaments',
      description: 'Regular gaming tournaments with exciting prizes and competitive gameplay.',
    },
    {
      icon: <CommunityIcon sx={{ fontSize: 40 }} />,
      title: 'Gaming Community',
      description: 'Join a vibrant community of gamers and make new friends.',
    },
    {
      icon: <CafeIcon sx={{ fontSize: 40 }} />,
      title: 'Refreshments',
      description: 'Enjoy delicious snacks and beverages while gaming.',
    },
    {
      icon: <WifiIcon sx={{ fontSize: 40 }} />,
      title: 'High-Speed WiFi',
      description: 'Fast and reliable internet connection for online gaming.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Safe Environment',
      description: '24/7 security and comfortable gaming environment.',
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
          Our Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <FeatureCard>
                <IconWrapper>
                  <Icon sx={{ fontSize: 40 }}>{feature.icon}</Icon>
                </IconWrapper>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Features; 