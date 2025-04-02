import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { RotateLeft, RotateRight, Crop } from '@mui/icons-material';

const ImageEditor = ({ open, onClose, imageUrl, onSave }) => {
  const [rotation, setRotation] = useState(0);
  const [croppedImage, setCroppedImage] = useState(null);
  const imageRef = useRef(null);

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleCrop = () => {
    // Implement cropping logic here
    // This is a placeholder for the actual cropping implementation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    canvas.width = img.width;
    canvas.height = img.height;
    
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    
    setCroppedImage(canvas.toDataURL());
  };

  const handleSave = () => {
    onSave(croppedImage || imageUrl);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Profile Picture</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '400px',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Profile"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease',
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton onClick={handleRotateLeft} color="primary">
              <RotateLeft />
            </IconButton>
            <IconButton onClick={handleRotateRight} color="primary">
              <RotateRight />
            </IconButton>
            <IconButton onClick={handleCrop} color="primary">
              <Crop />
            </IconButton>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageEditor; 