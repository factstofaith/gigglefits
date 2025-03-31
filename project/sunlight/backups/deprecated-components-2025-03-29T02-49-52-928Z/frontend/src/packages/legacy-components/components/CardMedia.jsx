import React from 'react';

/**
 * Legacy wrapper for CardMedia from @mui/material
 *
 * This component provides backward compatibility with Material UI's CardMedia
 * while using the design system under the hood.
 */
const CardMedia = props => {
  // For now, we're just passing through to the original component
  // In the future, this will be replaced with a custom implementation
  return <CardMedia {...props} />;
};


CardMedia.displayName = 'CardMedia';
export default CardMedia;
