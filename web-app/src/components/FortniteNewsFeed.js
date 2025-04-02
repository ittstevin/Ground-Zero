import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Chip,
  CardMedia,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

const NewsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const NewsImage = styled(CardMedia)({
  height: 200,
  objectFit: 'cover',
});

const NewsContent = styled(CardContent)({
  flexGrow: 1,
});

const NewsActions = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 'auto',
});

const GameNewsFeed = ({ limit = 3 }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Using GAMIVO API to get PlayStation game deals
        const response = await fetch(
          `https://www.gamivo.com/api/v1/products?platform=ps4&sort=discount&limit=${limit}`
        );
        const data = await response.json();
        
        if (data && Array.isArray(data.products)) {
          // Transform the data to match our news format
          const transformedNews = data.products.map(item => ({
            title: item.name,
            description: item.description || 'No description available',
            image: item.image || '/images/default-game.jpg',
            category: item.category || 'Game',
            date: new Date(item.date_added).getTime(),
            price: item.price,
            originalPrice: item.original_price,
            discount: item.discount,
            url: item.url,
          }));
          setNews(transformedNews);
        } else {
          throw new Error('Failed to fetch game deals');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching game deals:', err);
        setNews([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [limit]);

  const handleShare = async (newsItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: newsItem.title,
          text: `Check out this deal: ${newsItem.title} - ${newsItem.discount}% off!`,
          url: newsItem.url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const handleViewMore = () => {
    navigate('/news');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Typography color="error" align="center">
          Failed to load game deals. Please try again later.
        </Typography>
      </Box>
    );
  }

  // Ensure news is an array before using slice
  const displayNews = Array.isArray(news) ? news.slice(0, limit) : [];

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          PlayStation Game Deals
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleViewMore}
          endIcon={<span>→</span>}
        >
          View All Deals
        </Button>
      </Box>

      <Grid container spacing={3}>
        {displayNews.map((item, index) => (
          <Grid item xs={12} md={4} key={index}>
            <NewsCard>
              <NewsImage
                image={item.image}
                title={item.title}
              />
              <NewsContent>
                <Typography variant="h6" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {item.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={item.category}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`-${item.discount}%`}
                    color="error"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`$${item.price}`}
                    color="success"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  {item.originalPrice && (
                    <Chip
                      label={`$${item.originalPrice}`}
                      variant="outlined"
                      size="small"
                      sx={{ textDecoration: 'line-through' }}
                    />
                  )}
                </Box>
                <NewsActions>
                  <Box>
                    <Tooltip title="Share">
                      <IconButton onClick={() => handleShare(item)}>
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Save">
                      <IconButton>
                        <BookmarkBorderIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => window.open(item.url, '_blank')}
                  >
                    Buy Now
                  </Button>
                </NewsActions>
              </NewsContent>
            </NewsCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default GameNewsFeed; 