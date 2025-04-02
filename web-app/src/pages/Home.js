import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';

const Home = () => {
  return (
    <div>
      {/* In the contact section, update the button to link to the support ticket page */}
      <Button
        component={Link}
        to="/support"
        variant="contained"
        color="primary"
        size="large"
        sx={{
          mt: 2,
          px: 4,
          py: 1.5,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1.1rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 25px rgba(0,0,0,0.3)',
          },
        }}
      >
        Send us a Message
      </Button>
    </div>
  );
};

export default Home; 