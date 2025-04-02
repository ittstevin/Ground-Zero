import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  TextField,
} from '@mui/material';
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

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          'https://www.gamivo.com/api/v1/products?platform=ps4&sort=discount&limit=50'
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
  }, []);

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

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Filter news based on search query and selected tab
  const filteredNews = Array.isArray(news) ? news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = selectedTab === 0 || // All Deals
                      (selectedTab === 1 && item.discount >= 50) || // Big Discounts
                      (selectedTab === 2 && item.discount >= 30 && item.discount < 50) || // Medium Discounts
                      (selectedTab === 3 && item.discount < 30); // Small Discounts
    
    return matchesSearch && matchesTab;
  }) : [];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Box p={4}>
          <Typography color="error" align="center">
            Failed to load game deals. Please try again later.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        PlayStation Game Deals
      </Typography>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search deals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Deals" />
          <Tab label="Big Discounts (50%+)" />
          <Tab label="Medium Discounts (30-49%)" />
          <Tab label="Small Discounts (<30%)" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {filteredNews.map((item, index) => (
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
    </Container>
  );
};

export default NewsPage; 