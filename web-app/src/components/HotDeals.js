import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4]
  }
}));

const ProductImage = styled(CardMedia)(({ theme }) => ({
  height: 200,
  objectFit: 'cover',
  position: 'relative'
}));

const DiscountChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText
}));

const HotDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHotDeals();
  }, []);

  const fetchHotDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/products?sort=discount&limit=3');
      setDeals(response.data);
    } catch (err) {
      console.error('Error fetching hot deals:', err);
      setError(err.response?.data?.message || 'Failed to fetch hot deals. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={fetchHotDeals}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Hot Deals
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" align="center" paragraph>
          Don't miss out on these amazing offers!
        </Typography>

        <Grid container spacing={4}>
          {deals.map((deal) => (
            <Grid item key={deal._id} xs={12} md={4}>
              <StyledCard>
                <ProductImage
                  image={deal.image}
                  title={deal.name}
                  component="div"
                >
                  {deal.discount > 0 && (
                    <DiscountChip
                      label={`${deal.discount}% OFF`}
                      size="small"
                    />
                  )}
                </ProductImage>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h3">
                    {deal.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {deal.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" color="primary">
                      KES {deal.price}
                    </Typography>
                    {deal.originalPrice && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textDecoration: 'line-through' }}
                      >
                        KES {deal.originalPrice}
                      </Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={deal.platform}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={deal.category}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button
                    component={Link}
                    to={`/marketplace?product=${deal._id}`}
                    fullWidth
                    variant="contained"
                    color="primary"
                  >
                    View Deal
                  </Button>
                </CardActions>
              </StyledCard>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            component={Link}
            to="/marketplace"
            variant="outlined"
            color="primary"
            size="large"
          >
            View All Deals
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HotDeals; 