import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme
} from '@mui/material';
import GameNewsFeed from '../components/FortniteNewsFeed';
import Hero from '../components/Hero';
import HotDeals from '../components/HotDeals';
import WhyChooseGroundZero from '../components/WhyChooseGroundZero';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';

const HomePage = () => {
  const theme = useTheme();

  return (
    <Box>
      <Hero />
      <HotDeals />
      <WhyChooseGroundZero />
      <Features />
      <Testimonials />
      <Contact />
    </Box>
  );
};

export default HomePage; 