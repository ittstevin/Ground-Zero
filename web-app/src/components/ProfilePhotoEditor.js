import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import { RotateLeft, RotateRight } from '@mui/icons-material';
import Cropper from 'react-cropper';

export default function ProfilePhotoEditor({ open, onClose, imageUrl, onSave }) {
  const [rotation, setRotation] = useState(0);
  const [cropper, setCropper] = useState(null);
  const cropperRef = useRef(null);

  useEffect(() => {
    // Add cropper styles dynamically
    const style = document.createElement('style');
    style.textContent = `
      .cropper-container {
        width: 100%;
        height: 100%;
        background: #ddd;
      }
      .cropper-wrap-box {
        outline: 1px solid #39f;
        outline-color: rgba(51, 153, 255, 0.75);
      }
      .cropper-view-box {
        outline: 1px solid #39f;
        outline-color: rgba(51, 153, 255, 0.75);
      }
      .cropper-point {
        background-color: #39f;
      }
      .cropper-line {
        background-color: #39f;
      }
      .cropper-modal {
        background-color: rgba(0, 0, 0, 0.5);
      }
      .cropper-drag-box {
        background-color: rgba(51, 153, 255, 0.1);
      }
      .cropper-center {
        display: none;
      }
      .cropper-face,
      .cropper-line,
      .cropper-point {
        display: block;
        position: absolute;
        opacity: 0.1;
        box-sizing: border-box;
      }
      .cropper-face {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #fff;
      }
      .cropper-line {
        background-color: #39f;
      }
      .cropper-line.line-w {
        top: 0;
        left: -3px;
        width: 5px;
        height: 100%;
        cursor: w-resize;
      }
      .cropper-line.line-e {
        top: 0;
        right: -3px;
        width: 5px;
        height: 100%;
        cursor: e-resize;
      }
      .cropper-line.line-n {
        top: -3px;
        left: 0;
        width: 100%;
        height: 5px;
        cursor: n-resize;
      }
      .cropper-line.line-s {
        bottom: -3px;
        left: 0;
        width: 100%;
        height: 5px;
        cursor: s-resize;
      }
      .cropper-point {
        width: 5px;
        height: 5px;
        opacity: 0.75;
        background-color: #39f;
      }
      .cropper-point.point-n {
        top: -3px;
        left: 50%;
        margin-left: -3px;
        cursor: n-resize;
      }
      .cropper-point.point-ne {
        top: -3px;
        right: -3px;
        cursor: ne-resize;
      }
      .cropper-point.point-e {
        top: 50%;
        right: -3px;
        margin-top: -3px;
        cursor: e-resize;
      }
      .cropper-point.point-se {
        bottom: -3px;
        right: -3px;
        cursor: se-resize;
      }
      .cropper-point.point-s {
        bottom: -3px;
        left: 50%;
        margin-left: -3px;
        cursor: s-resize;
      }
      .cropper-point.point-sw {
        bottom: -3px;
        left: -3px;
        cursor: sw-resize;
      }
      .cropper-point.point-w {
        top: 50%;
        left: -3px;
        margin-top: -3px;
        cursor: w-resize;
      }
      .cropper-point.point-nw {
        top: -3px;
        left: -3px;
        cursor: nw-resize;
      }
      .cropper-point.point-se:before,
      .cropper-point.point-sw:before,
      .cropper-point.point-nw:before,
      .cropper-point.point-ne:before {
        content: '';
        position: absolute;
        display: block;
        width: 3px;
        height: 3px;
        background-color: #39f;
        opacity: 0.75;
      }
      .cropper-point.point-se:before {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(45deg);
      }
      .cropper-point.point-sw:before {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(45deg);
      }
      .cropper-point.point-nw:before {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(45deg);
      }
      .cropper-point.point-ne:before {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(45deg);
      }
      .cropper-bg {
        background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD///+l2Z/dAAAAM0lEQVR4nO2TQQ0AAAgEwNK/2jL6IWLgl4YVzB4BBWgZMaNlLluMxUoK6XzJ9CR3s2MidgwHHKcAAAAASUVORK5CYII=');
      }
      .cropper-hide {
        display: block;
        position: absolute;
        z-index: -1;
        opacity: 0;
        background-color: #fff;
      }
      .cropper-hidden {
        display: none !important;
      }
      .cropper-move {
        cursor: move;
      }
      .cropper-crop {
        cursor: crosshair;
      }
      .cropper-disabled .cropper-drag-box,
      .cropper-disabled .cropper-face,
      .cropper-disabled .cropper-line,
      .cropper-disabled .cropper-point {
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleRotate = (direction) => {
    const newRotation = direction === 'left' ? rotation - 90 : rotation + 90;
    setRotation(newRotation);
    if (cropper) {
      cropper.rotate(newRotation);
    }
  };

  const handleCrop = () => {
    if (cropper) {
      const canvas = cropper.getCroppedCanvas();
      const croppedImageUrl = canvas.toDataURL('image/jpeg');
      onSave(croppedImageUrl);
      onClose();
    }
  };

  const handleCropperInit = (cropperInstance) => {
    setCropper(cropperInstance);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Profile Photo</DialogTitle>
      <DialogContent>
        <Box sx={{ height: 400, position: 'relative' }}>
          <Cropper
            ref={cropperRef}
            src={imageUrl}
            style={{ height: '100%', width: '100%' }}
            aspectRatio={1}
            guides={true}
            viewMode={1}
            autoCropArea={1}
            onInitialized={handleCropperInit}
            rotateTo={rotation}
            background={true}
            responsive={true}
            restore={false}
            modal={true}
            highlight={true}
            cropBoxMovable={true}
            cropBoxResizable={true}
            toggleDragModeOnDblclick={true}
          />
          <Box sx={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 1 }}>
            <IconButton onClick={() => handleRotate('left')} color="primary">
              <RotateLeft />
            </IconButton>
            <IconButton onClick={() => handleRotate('right')} color="primary">
              <RotateRight />
            </IconButton>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCrop} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
} 