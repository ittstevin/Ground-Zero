import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const AdminShop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '',
  });

  useEffect(() => {
    fetchProducts();
    createTestProductIfNoneExist();
  }, []);

  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProducts(productsData);
      setLoading(false);
    } catch (err) {
      setError('Error fetching products: ' + err.message);
      setLoading(false);
    }
  };

  const createTestProductIfNoneExist = async () => {
    try {
      console.log('Checking if products collection is empty...');
      const productsRef = collection(db, 'products');
      const querySnapshot = await getDocs(productsRef);
      
      if (querySnapshot.empty) {
        console.log('No products found, creating test product...');
        const testProduct = {
          name: 'Test Gaming Product',
          description: 'This is a test product to verify the shop functionality.',
          price: 49.99,
          category: 'Game Key',
          platform: 'PlayStation',
          stock: 100,
          image: 'https://via.placeholder.com/300x200?text=Test+Product',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await addDoc(productsRef, testProduct);
        console.log('Test product created successfully');
        fetchProducts(); // Refresh the products list
      } else {
        console.log('Products already exist in the database');
      }
    } catch (err) {
      console.error('Error creating test product:', err);
      setError('Error creating test product: ' + err.message);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        stock: product.stock.toString(),
        image: product.image || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      image: '',
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingProduct) {
        const productRef = doc(db, 'products', editingProduct.id);
        await updateDoc(productRef, {
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'products'), {
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      handleCloseDialog();
      fetchProducts();
    } catch (err) {
      setError('Error saving product: ' + err.message);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        fetchProducts();
      } catch (err) {
        setError('Error deleting product: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Manage Shop Products
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Product
        </Button>
      </Box>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={product.image || '/images/product-placeholder.jpg'}
                alt={product.name}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {product.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${product.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stock: {product.stock}
                </Typography>
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Tooltip title="Edit">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(product)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(product.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Price"
            fullWidth
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Category"
            fullWidth
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Stock"
            fullWidth
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Image URL"
            fullWidth
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            {editingProduct ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminShop; 