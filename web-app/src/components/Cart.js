import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  TextField,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

const Cart = ({ open, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();

  const handleCheckout = async () => {
    if (!user) {
      setError('Please log in to complete your purchase');
      return;
    }

    if (!phoneNumber) {
      setError('Please enter your phone number');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orderItems = cartItems.map(item => ({
        product: item._id,
        quantity: item.quantity,
        price: item.price
      }));

      const response = await axios.post('/api/orders', {
        items: orderItems,
        phoneNumber
      });

      // Clear cart and close drawer
      onClose();
      // TODO: Show success message and redirect to order confirmation
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Shopping Cart</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {cartItems.length === 0 ? (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="text.secondary">Your cart is empty</Typography>
        </Box>
      ) : (
        <>
          <List sx={{ flex: 1, overflow: 'auto' }}>
            {cartItems.map((item) => (
              <ListItem key={item._id}>
                <ListItemText
                  primary={item.name}
                  secondary={`KES ${item.price}`}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  <TextField
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                    inputProps={{ min: 1, max: item.stock }}
                    size="small"
                    sx={{ width: 60 }}
                  />
                </Box>
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => removeFromCart(item._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          <Divider />

          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total: KES {getCartTotal()}
            </Typography>

            <TextField
              fullWidth
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your M-PESA phone number"
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleCheckout}
              disabled={loading || cartItems.length === 0}
            >
              {loading ? <CircularProgress size={24} /> : 'Checkout with M-PESA'}
            </Button>
          </Box>
        </>
      )}
    </Drawer>
  );
};

export default Cart; 