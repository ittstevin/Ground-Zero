import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

export default function PasswordStrengthMeter({ password }) {
  const calculateStrength = (password) => {
    let strength = 0;
    if (!password) return 0;

    // Length check
    if (password.length >= 8) strength += 20;

    // Contains number
    if (/\d/.test(password)) strength += 20;

    // Contains lowercase letter
    if (/[a-z]/.test(password)) strength += 20;

    // Contains uppercase letter
    if (/[A-Z]/.test(password)) strength += 20;

    // Contains special character
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;

    return strength;
  };

  const getStrengthColor = (strength) => {
    if (strength <= 20) return 'error';
    if (strength <= 40) return 'warning';
    if (strength <= 60) return 'info';
    if (strength <= 80) return 'primary';
    return 'success';
  };

  const getStrengthText = (strength) => {
    if (strength <= 20) return 'Very Weak';
    if (strength <= 40) return 'Weak';
    if (strength <= 60) return 'Medium';
    if (strength <= 80) return 'Strong';
    return 'Very Strong';
  };

  const strength = calculateStrength(password);
  const color = getStrengthColor(strength);
  const text = getStrengthText(strength);

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <LinearProgress
        variant="determinate"
        value={strength}
        color={color}
        sx={{ height: 8, borderRadius: 4 }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
        Password Strength: {text}
      </Typography>
    </Box>
  );
} 