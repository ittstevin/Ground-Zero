import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  styled,
  keyframes
} from '@mui/material';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Hexagon animation keyframes
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
  100% { transform: translateY(0px) rotate(360deg); }
`;

const float2 = keyframes`
  0% { transform: translateY(0px) rotate(360deg); }
  50% { transform: translateY(20px) rotate(180deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

// Styled components
const HexagonBackground = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  background: 'linear-gradient(45deg, #1a237e 0%, #0d47a1 100%)',
  zIndex: -1,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
  }
}));

const Hexagon = styled(Box)(({ theme, delay, duration, animation }) => ({
  position: 'absolute',
  width: '100px',
  height: '115px',
  background: 'rgba(255,255,255,0.1)',
  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  animation: `${animation} ${duration}s infinite`,
  animationDelay: `${delay}s`,
  opacity: 0.3,
  backdropFilter: 'blur(5px)',
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(26, 26, 26, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  padding: theme.spacing(4),
  maxWidth: '400px',
  width: '100%',
  margin: '0 auto',
  '&:hover': {
    background: 'rgba(26, 26, 26, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    '& input': {
      color: 'white',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': {
      color: 'rgba(255, 255, 255, 0.9)',
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  color: 'white',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
  },
}));

function AuthPage() {
  // ... existing state and functions ...

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <HexagonBackground>
        {/* Hexagon grid */}
        {[...Array(20)].map((_, index) => (
          <Hexagon
            key={index}
            delay={index * 0.2}
            duration={10 + Math.random() * 10}
            animation={index % 2 === 0 ? float : float2}
            sx={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </HexagonBackground>

      <Container maxWidth="sm">
        <GlassPaper elevation={3}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'white', mb: 4 }}>
            Welcome to Ground Zero
          </Typography>

          <Tabs
            value={isLogin ? 0 : 1}
            onChange={handleTabChange}
            centered
            sx={{
              mb: 3,
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected': {
                  color: 'white',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'white',
              },
            }}
          >
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {!isLogin && (
              <StyledTextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                required
              />
            )}
            <StyledTextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <StyledTextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            {!isLogin && (
              <StyledTextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                required
              />
            )}
            <StyledButton
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : (isLogin ? 'Login' : 'Sign Up')}
            </StyledButton>
          </Box>
        </GlassPaper>
      </Container>
    </Box>
  );
}

export default AuthPage; 