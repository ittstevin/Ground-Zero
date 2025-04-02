import React from 'react';
import { Box, Container } from '@mui/material';

const Marketplace = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      pt: { xs: 8, sm: 9 }, // Add padding top to account for navbar
    }}>
      <Container maxWidth="lg">
        {/* Content will go here */}
      </Container>
    </Box>
  );
};

export default Marketplace; 