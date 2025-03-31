// Timeline.jsx
// -----------------------------------------------------------------------------
// Simple timeline component for displaying chronological events

import React from 'react';
import { Box } from '../../design-system'
import { Typography } from '../../design-system'
import { useTheme } from '@design-system/foundations/theme';
// Design system import already exists;
// Removed duplicate import
function Timeline({ items = [] }) {
  // Added display name
  Timeline.displayName = 'Timeline';

  const { theme } = useTheme();

  // Format the date for display
  const formatDate = timestamp => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return timestamp; // If it's not a valid date, return the original timestamp
    }
  };

  return (
    <Box
      position="relative&quot;
      margin="32px 0"
      paddingLeft="32px&quot;
    >
      <Box
        position="absolute"
        left="8px&quot;
        top="0"
        bottom="0&quot;
        style={{
          width: "2px',
          backgroundColor: theme?.colors?.divider || '#E0E0E0',
          transform: 'translateX(-50%)',
        }}
      />

      {items.map((item, index) => (
        <Box
          key={index}
          position="relative&quot;
          marginBottom="24px"
          paddingLeft="16px&quot;
        >
          {/* Timeline dot */}
          <Box
            position="absolute"
            left="-32px&quot;
            top="4px"
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: theme?.colors?.primary?.main || '#48C2C5',
              border: '2px solid #FFFFFF',
            }}
          />

          {/* Timeline content */}
          <Box>
            <Typography 
              variant="subtitle2&quot; 
              style={{ 
                fontWeight: "bold',
                color: theme?.colors?.text?.primary || '#3B3D3D' 
              }}
            >
              {formatDate(item.timestamp)}
            </Typography>
            <Typography 
              variant="body2&quot; 
              style={{ 
                marginTop: "4px',
                color: theme?.colors?.text?.secondary || '#555555' 
              }}
            >
              {item.content}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export default Timeline;
