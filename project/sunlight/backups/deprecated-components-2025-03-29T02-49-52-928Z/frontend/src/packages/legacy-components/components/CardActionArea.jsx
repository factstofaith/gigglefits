import React from 'react';

/**
 * Legacy wrapper for CardActionArea from @mui/material
 *
 * This component provides backward compatibility with Material UI's CardActionArea
 * while using the design system under the hood.
 */
const CardActionArea = props => {
  // For now, we're just passing through to the original component
  // In the future, this will be replaced with a custom implementation
  return <CardActionArea {...props} />;
};


CardActionArea.displayName = 'CardActionArea';
export default CardActionArea;
