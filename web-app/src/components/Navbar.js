import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  styled,
  Fade,
  Grow,
  useScrollTrigger,
  useTheme,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Store as StoreIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Cart from './Cart';

const AdminBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: '50%',
  padding: '2px 6px',
  fontSize: '0.75rem',
  transform: 'translate(25%, -25%)',
  boxShadow: theme.shadows[2]
}));

const StyledAppBar = styled(AppBar)(({ theme, scrolled }) => ({
  background: scrolled 
    ? 'rgba(18, 18, 18, 0.95)'
    : 'rgba(18, 18, 18, 0.8)',
  backdropFilter: scrolled ? 'blur(10px)' : 'blur(0px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.2)' : 'none',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  color: 'white',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: 0,
    height: 2,
    backgroundColor: theme.palette.primary.main,
    transition: 'all 0.3s ease',
    transform: 'translateX(-50%)',
  },
  '&:hover::after': {
    width: '100%',
  },
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
}));

const Navbar = () => {
  const theme = useTheme();
  const { currentUser, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [storeAnchorEl, setStoreAnchorEl] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercentage = Math.min(scrollTop / (documentHeight - windowHeight), 1);
      setScrollProgress(scrollPercentage);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
            setIsAdmin(userDoc.data().isAdmin || false);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleStoreMenu = (event) => {
    setStoreAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStoreClose = () => {
    setStoreAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <Fade in timeout={1000}>
      <StyledAppBar 
        position="fixed" 
        scrolled={trigger}
        sx={{
          backdropFilter: `blur(${Math.min(scrollProgress * 10, 10)}px)`,
        }}
      >
      <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'white',
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease',
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
          Ground Zero
        </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <StyledButton
              onClick={handleStoreMenu}
              endIcon={<ArrowDownIcon />}
            >
              Store
            </StyledButton>
            <Menu
              anchorEl={storeAnchorEl}
              open={Boolean(storeAnchorEl)}
              onClose={handleStoreClose}
              TransitionComponent={Grow}
              TransitionProps={{ timeout: 200 }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                }
              }}
            >
              <MenuItem
                component={Link}
                to="/marketplace"
                onClick={handleStoreClose}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.05)',
                  },
                }}
              >
                Marketplace
              </MenuItem>
              <MenuItem
                component={Link}
                to="/shop"
                onClick={handleStoreClose}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.05)',
                  },
                }}
              >
                Shop
              </MenuItem>
            </Menu>

            <StyledButton
              component={Link}
              to="/booking"
            >
              Book Now
            </StyledButton>
            <StyledButton
              component={Link}
              to="/tournaments"
            >
              Tournaments
            </StyledButton>

            <IconButton
              onClick={() => setCartOpen(true)}
              sx={{
                color: 'white',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              <Badge badgeContent={getCartItemCount()} color="error">
                <CartIcon />
              </Badge>
            </IconButton>

            {currentUser ? (
              <>
                <Tooltip title={isAdmin ? 'Admin' : userData?.displayName || currentUser.displayName || 'User'}>
                  <IconButton
                    onClick={handleMenu}
                    sx={{
                      color: 'white',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      }
                    }}
                  >
                    <Badge
                      badgeContent={userData?.loyaltyPoints || 0}
                      color="primary"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          padding: '0 4px',
                          minWidth: '20px',
                          height: '20px',
                          borderRadius: '10px',
                          right: 3,
                          top: 3,
                        }
                      }}
                    >
                      <Avatar
                        src={userData?.photoURL || currentUser?.photoURL}
                        alt={userData?.displayName || currentUser?.displayName || 'User'}
                        sx={{
                          width: 35,
                          height: 35,
                          bgcolor: 'primary.main',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          }
                        }}
                      />
                    </Badge>
                    {isAdmin && <AdminBadge>A</AdminBadge>}
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  TransitionComponent={Grow}
                  TransitionProps={{ timeout: 200 }}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    }
                  }}
                >
                  <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {userData?.displayName || currentUser?.displayName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      @{userData?.username || 'username'}
                    </Typography>
                  </Box>
                  <MenuItem
                    component={Link}
                    to="/profile"
                    onClick={handleClose}
                    sx={{
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.05)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Profile</ListItemText>
                  </MenuItem>
                  {isAdmin && (
                    <MenuItem
                      component={Link}
                      to="/admin"
                      onClick={handleClose}
                      sx={{
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.05)',
                        },
                      }}
                    >
                      Admin Dashboard
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            ) : (
                <StyledButton
                  component={Link}
                  to="/login"
                >
                Login
                </StyledButton>
            )}
          </Box>
        </Toolbar>
      </StyledAppBar>
    </Fade>
  );
};

export default Navbar; 