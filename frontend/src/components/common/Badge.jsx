// Badge.jsx
// -----------------------------------------------------------------------------
// Simple badge component for displaying status labels

import React from 'react';

function Badge({ label, color = '#48C2C5', style }) {
  const badgeStyle = {
    display: 'inline-block',
    backgroundColor: color,
    color: '#FFFFFF',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    ...style
  };

  return <span style={badgeStyle}>{label}</span>;
}

export default Badge;