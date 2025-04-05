import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  InputAdornment,
  IconButton,
  Divider,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip
} from '@mui/material';
import { Search as SearchIcon, ShoppingCart as CartIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, getDocs, where, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ShopPage = () => {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchProducts();
    checkAndCreateSampleProduct();
  }, [searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch products...');
      
      // Check if Firebase is initialized
      if (!db) {
        throw new Error('Firebase Firestore is not initialized');
      }
      
      const productsRef = collection(db, 'products');
      console.log('Products collection reference created');
      
      let q = query(productsRef);
      
      if (searchQuery) {
        console.log('Applying search filter:', searchQuery);
        q = query(productsRef, where('name', '>=', searchQuery), where('name', '<=', searchQuery + '\uf8ff'));
      }

      console.log('Executing Firestore query...');
      const querySnapshot = await getDocs(q);
      console.log('Query completed, number of documents:', querySnapshot.size);
      
      if (querySnapshot.empty) {
        console.log('No products found in the database');
        setProducts([]);
        setError('No products available at the moment.');
      } else {
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('Products data processed:', productsData.length);
        console.log('First product sample:', productsData[0]);
        setProducts(productsData);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      // Provide more specific error messages based on the error type
      if (err.code === 'permission-denied') {
        setError('Access denied. Please check if you have the necessary permissions.');
      } else if (err.code === 'unavailable') {
        setError('Service is currently unavailable. Please try again later.');
      } else if (err.code === 'not-found') {
        setError('Products collection not found. Please contact support.');
      } else {
        setError('Failed to load products. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkAndCreateSampleProduct = async () => {
    try {
      console.log('Checking if products collection exists...');
      const productsRef = collection(db, 'products');
      const querySnapshot = await getDocs(productsRef);
      
      if (querySnapshot.empty) {
        console.log('No products found, creating a sample product...');
        await addDoc(productsRef, {
          name: 'Sample Gaming Product',
          description: 'This is a sample product to test the shop functionality.',
          price: 29.99,
          category: 'Game Key',
          platform: 'PlayStation',
          stock: 10,
          image: 'https://via.placeholder.com/300x200?text=Sample+Product',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('Sample product created successfully');
        fetchProducts(); // Refresh the products list
      } else {
        console.log('Products already exist in the database');
      }
    } catch (err) {
      console.error('Error checking/creating sample product:', err);
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
          Gaming Shop
        </Typography>

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search products..."
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
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
              <Card 
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
              <CardMedia
                component="img"
                height="200"
                  image={product.imageUrl || '/images/product-placeholder.jpg'}
                alt={product.name}
                  sx={{
                    objectFit: 'cover',
                  }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom component="h2">
                  {product.name}
                </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                  {product.description}
                </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="h6" color="primary">
                      ${product.price}
                    </Typography>
                    {product.inStock ? (
                      <Chip 
                        label="In Stock" 
                        color="success" 
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    ) : (
                      <Chip 
                        label="Out of Stock" 
                        color="error" 
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    )}
                  </Box>
                <Button
                  variant="contained"
                    color="primary"
                  fullWidth
                    startIcon={<CartIcon />}
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    sx={{ 
                      mt: 2,
                      textTransform: 'none',
                      borderRadius: 2,
                  }}
                >
                  Add to Cart
                </Button>
                </CardContent>
            </Card>
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

export default ShopPage;