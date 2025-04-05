import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon
} from '@mui/icons-material';
import { collection, query, getDocs, addDoc, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    category: '',
    platform: '',
    price: '',
    originalPrice: '',
    discount: '',
    stock: '',
    keys: []
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('Fetching products from Firestore...');
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Fetched ${productsData.length} products`);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      showSnackbar('Failed to fetch products', 'error');
    }
  };

  const handleOpen = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        image: product.image || '',
        category: product.category || '',
        platform: product.platform || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        discount: product.discount || '',
        stock: product.stock || '',
        keys: product.keys || []
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        image: '',
        category: '',
        platform: '',
        price: '',
        originalPrice: '',
        discount: '',
        stock: '',
        keys: []
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProduct(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Update existing product
        const productRef = doc(db, 'products', editingProduct.id);
        await updateDoc(productRef, {
          ...formData,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          discount: formData.discount ? parseFloat(formData.discount) : 0,
          stock: parseInt(formData.stock),
          updatedAt: new Date()
        });
        showSnackbar('Product updated successfully');
      } else {
        // Add new product
        await addDoc(collection(db, 'products'), {
          ...formData,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          discount: formData.discount ? parseFloat(formData.discount) : 0,
          stock: parseInt(formData.stock),
          createdAt: new Date(),
          updatedAt: new Date()
        });
        showSnackbar('Product added successfully');
      }
      handleClose();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      showSnackbar('Operation failed: ' + error.message, 'error');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        showSnackbar('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        showSnackbar('Failed to delete product: ' + error.message, 'error');
      }
    }
  };

  const handleAddKey = async (productId) => {
    const key = prompt('Enter the game key:');
    if (key) {
      try {
        const productRef = doc(db, 'products', productId);
        const product = products.find(p => p.id === productId);
        
        if (!product) {
          throw new Error('Product not found');
        }
        
        const updatedKeys = [...(product.keys || []), key];
        
        await updateDoc(productRef, {
          keys: updatedKeys,
          updatedAt: new Date()
        });
        
        showSnackbar('Key added successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error adding key:', error);
        showSnackbar('Failed to add key: ' + error.message, 'error');
      }
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Manage Products</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Product
        </Button>
      </Box>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                <Typography color="textSecondary" gutterBottom>
                  {product.platform} - {product.category}
                </Typography>
                <Typography variant="body2" paragraph>
                  {product.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  KES {product.price}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Stock: {product.stock}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => handleOpen(product)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(product.id)} color="error">
                  <DeleteIcon />
                </IconButton>
                <IconButton onClick={() => handleAddKey(product.id)}>
                  <AddCircleIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
                  >
                    <MenuItem value="Game Key">Game Key</MenuItem>
                    <MenuItem value="Gift Card">Gift Card</MenuItem>
                    <MenuItem value="DLC">DLC</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Platform</InputLabel>
                  <Select
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    label="Platform"
                  >
                    <MenuItem value="PlayStation">PlayStation</MenuItem>
                    <MenuItem value="Xbox">Xbox</MenuItem>
                    <MenuItem value="Nintendo">Nintendo</MenuItem>
                    <MenuItem value="PC">PC</MenuItem>
                    <MenuItem value="Mobile">Mobile</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Original Price"
                  name="originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Discount (%)"
                  name="discount"
                  type="number"
                  value={formData.discount}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingProduct ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminProducts; 