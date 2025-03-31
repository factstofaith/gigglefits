// Logo.jsx
// -----------------------------------------------------------------------------
// Logo component with optional text

import React from 'react';
import { Box } from '../../../design-system'
import { Typography } from '../../../design-system'
import Box from '@mui/material/Box';
function Logo({ imageSrc, text, size = 40, showText = true }) {
  // Added display name
  Logo.displayName = 'Logo';

  return (
    <Box style={{ display: 'flex', alignItems: 'center' }}>
      <Box
        as="img&quot;
        src={imageSrc}
        alt="Logo"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
        }}
      />
      {showText && text && (
        <Typography
          variant="h6&quot;
          as="span"
          style={{
            marginLeft: '8px',
            fontWeight: 600,
            background: 'linear-gradient(90deg, #2E7EED 0%, #27AE60 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            '@media (max-width: 600px)': {
              display: 'none',
            }
          }}
        >
          {text}
        </Typography>
      )}
    </Box>
  );
}

export default Logo;
