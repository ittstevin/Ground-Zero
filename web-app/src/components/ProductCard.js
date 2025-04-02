import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

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

const ProductCard = ({ product, onAddToCart, onShare, onFavorite }) => {
  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Ground Zero!`,
        url: window.location.href
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <StyledCard>
      <ProductImage
        image={product.image}
        title={product.name}
        component="div"
      >
        {product.discount > 0 && (
          <DiscountChip
            label={`${product.discount}% OFF`}
            size="small"
          />
        )}
      </ProductImage>
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2">
          {product.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {product.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6" color="primary">
            KES {product.price}
          </Typography>
          {product.originalPrice && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: 'line-through' }}
            >
              KES {product.originalPrice}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={product.platform}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={product.category}
            size="small"
            color="secondary"
            variant="outlined"
          />
        </Box>
      </CardContent>
      
      <CardActions>
        <Button
          startIcon={<ShoppingCartIcon />}
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
        
        <Tooltip title="Share">
          <IconButton onClick={handleShare}>
            <ShareIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Add to Favorites">
          <IconButton onClick={() => onFavorite(product)}>
            <FavoriteIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </StyledCard>
  );
};

export default ProductCard; 