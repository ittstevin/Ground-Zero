import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Grid, Box, Button } from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

const ContactInfo = ({ icon, title, content }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
    <Box sx={{ mr: 2, color: 'primary.main' }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {content}
      </Typography>
    </Box>
  </Box>
);

const Contact = () => {
  return (
    <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h2" align="center" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          Have questions or need assistance? Our support team is here to help.
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                Get in Touch
              </Typography>
              <Typography variant="body1" paragraph>
                Have questions or want to know more about our services? We're here to help!
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  component={Link}
                  to="/support"
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{
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
              </Box>
            </Box>
            <ContactInfo
              icon={<LocationIcon />}
              title="Address"
              content="Ground Zero Gaming Cafe, Kirigiti, Kiambu, Kenya"
            />
            <ContactInfo
              icon={<PhoneIcon />}
              title="Phone"
              content="+254 123 456 789"
            />
            <ContactInfo
              icon={<EmailIcon />}
              title="Email"
              content="info@groundzero.com"
            />
            <ContactInfo
              icon={<TimeIcon />}
              title="Opening Hours"
              content="Monday - Friday: 9:00 AM - 10:00 PM\nSaturday - Sunday: 10:00 AM - 11:00 PM"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              component="iframe"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.794428475456!2d37.12345678901234!3d-1.12345678901234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMDcnMzQuNCJTIDM3wrAwNyczMzQuNCJF!5e0!3m2!1sen!2ske!4v1234567890123!5m2!1sen!2ske"
              sx={{
                width: '100%',
                height: 400,
                border: 0,
                borderRadius: 2,
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Contact; 