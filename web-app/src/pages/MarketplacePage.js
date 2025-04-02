import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  TextField,
  Box,
  Tabs,
  Tab,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const MarketplacePage = () => {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { user } = useAuth();

  const platforms = ['all', 'PlayStation', 'Xbox', 'Nintendo', 'PC', 'Mobile'];
  const categories = ['all', 'Game Key', 'Gift Card', 'DLC'];

  useEffect(() => {
    fetchProducts();
  }, [selectedPlatform, selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedPlatform !== 'all') {
        params.append('platform', selectedPlatform);
      }
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await axios.get(`/api/products?${params.toString()}`);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products. Please try again later.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      // TODO: Implement cart functionality
      setSnackbar({
        open: true,
        message: 'Product added to cart!',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to add product to cart.',
        severity: 'error'
      });
    }
  };

  const handleShare = (product) => {
    // Share functionality is handled in ProductCard component
  };

  const handleFavorite = async (product) => {
    try {
      // TODO: Implement favorites functionality
      setSnackbar({
        open: true,
        message: 'Product added to favorites!',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to add product to favorites.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, bgcolor: 'white' }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            color: theme.palette.primary.main,
            fontWeight: 'bold',
            mb: 3
          }}
        >
          Game Marketplace
        </Typography>

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={selectedPlatform}
              onChange={(e, newValue) => setSelectedPlatform(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  minWidth: 120,
                },
                '& .Mui-selected': {
                  color: theme.palette.primary.main,
                  fontWeight: 'bold',
                },
              }}
            >
              {platforms.map((platform) => (
                <Tab
                  key={platform}
                  label={platform === 'all' ? 'All Platforms' : platform}
                  value={platform}
                />
              ))}
            </Tabs>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={selectedCategory}
              onChange={(e, newValue) => setSelectedCategory(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  minWidth: 120,
                },
                '& .Mui-selected': {
                  color: theme.palette.primary.main,
                  fontWeight: 'bold',
                },
              }}
            >
              {categories.map((category) => (
                <Tab
                  key={category}
                  label={category === 'all' ? 'All Categories' : category}
                  value={category}
                />
              ))}
            </Tabs>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item key={product._id} xs={12} sm={6} md={4}>
              <ProductCard
                product={product}
                onAddToCart={handleAddToCart}
                onShare={handleShare}
                onFavorite={handleFavorite}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MarketplacePage; 