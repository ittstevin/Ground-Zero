import React from 'react';
import { Box, styled } from '@mui/material';

const BackgroundContainer = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  background: 'linear-gradient(45deg, #1a1a1a 0%, #2d3436 50%, #1a1a1a 100%)',
  zIndex: -1,
});

const AnimatedBackground = () => {
  return <BackgroundContainer />;
};

export default AnimatedBackground; 