import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

const TestimonialCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  padding: theme.spacing(4),
  position: 'relative',
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  },
}));

const QuoteIconWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: -20,
  left: 20,
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
}));

const Testimonials = () => {
  const testimonials = [
    {
      name: 'John Doe',
      role: 'Professional Gamer',
      image: '/images/testimonials/user1.jpg',
      rating: 5,
      text: 'Ground Zero has the best gaming setup I\'ve ever experienced. The PS4 Pro with 4K display is absolutely stunning!',
    },
    {
      name: 'Jane Smith',
      role: 'Casual Gamer',
      image: '/images/testimonials/user2.jpg',
      rating: 5,
      text: 'The staff is incredibly friendly and helpful. They helped me choose the perfect console for my gaming needs.',
    },
    {
      name: 'Mike Johnson',
      role: 'Tournament Player',
      image: '/images/testimonials/user3.jpg',
      rating: 5,
      text: 'The tournament setup is professional and the competition is fierce. Love the gaming community here!',
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
          What Our Gamers Say
        </Typography>
        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <TestimonialCard>
                <QuoteIconWrapper>
                  <FormatQuoteIcon />
                </QuoteIconWrapper>
                <CardContent sx={{ flexGrow: 1, pt: 4 }}>
                  <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                  <Typography
                    variant="body1"
                    paragraph
                    sx={{
                      fontStyle: 'italic',
                      mb: 3,
                    }}
                  >
                    "{testimonial.text}"
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={testimonial.image}
                      alt={testimonial.name}
                      sx={{ width: 56, height: 56 }}
                    />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </TestimonialCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Testimonials; 