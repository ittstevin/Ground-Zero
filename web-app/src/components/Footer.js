import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
} from '@mui/material';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Ground Zero
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your premier gaming destination in Kirigiti, Kiambu. Experience the best in gaming entertainment with our state-of-the-art PlayStation consoles and regular tournaments.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MuiLink component={Link} to="/" color="inherit">
                Home
              </MuiLink>
              <MuiLink component={Link} to="/booking" color="inherit">
                Book Now
              </MuiLink>
              <MuiLink component={Link} to="/tournaments" color="inherit">
                Tournaments
              </MuiLink>
              <MuiLink component={Link} to="/shop" color="inherit">
                Shop
              </MuiLink>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: info@groundzero.com
              <br />
              Phone: +254 123 456 789
              <br />
              Address: Kirigiti, Kiambu
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Ground Zero. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer; 