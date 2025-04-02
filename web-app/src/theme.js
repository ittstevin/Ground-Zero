import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF4B2B',
      light: '#FF6B4B',
      dark: '#CC3C22',
    },
    secondary: {
      main: '#2B2B2B',
      light: '#3B3B3B',
      dark: '#1B1B1B',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F5F5F5',
    },
    text: {
      primary: '#2B2B2B',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"SF Pro Text"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"SF Pro Display"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"SF Pro Display"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"SF Pro Display"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"SF Pro Display"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"SF Pro Display"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      fontWeight: 600,
    },
    h6: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"SF Pro Display"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      fontWeight: 600,
    },
    button: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"SF Pro Text"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      textTransform: 'none',
      fontWeight: 500,
    },
    body1: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"SF Pro Text"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      fontWeight: 400,
    },
    body2: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"SF Pro Text"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      fontWeight: 400,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 24px',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

export default theme; 