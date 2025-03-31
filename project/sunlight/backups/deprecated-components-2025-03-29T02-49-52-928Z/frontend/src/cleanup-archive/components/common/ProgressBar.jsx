// ProgressBar.jsx
// -----------------------------------------------------------------------------
// Simple progress bar component

import React from 'react';
import { Box } from '../../../design-system'
import { useTheme } from '../../design-system/foundations/theme';
import Box from '@mui/material/Box';
function ProgressBar({ value = 0, max = 100, color, height = 8, style }) {
  // Added display name
  ProgressBar.displayName = 'ProgressBar';

  const { theme } = useTheme();
  
  // Ensure value is between 0 and max
  const clampedValue = Math.min(Math.max(0, value), max);
  const percentage = (clampedValue / max) * 100;
  
  // Use theme color if provided, otherwise use the prop or fallback
  const barColor = color || theme?.colors?.primary?.main || '#48C2C5';

  return (
    <Box
      width="100%&quot;
      style={{
        backgroundColor: theme?.colors?.grey?.[200] || "#EEEEEE',
        borderRadius: height / 2,
        height: `${height}px`,
        overflow: 'hidden',
        ...style,
      }}
    >
      <Box
        style={{
          height: '100%',
          width: `${percentage}%`,
          backgroundColor: barColor,
          borderRadius: height / 2,
          transition: 'width 0.3s ease',
        }}
      />
    </Box>
  );
}

export default ProgressBar;
