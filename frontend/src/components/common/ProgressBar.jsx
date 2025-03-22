// ProgressBar.jsx
// -----------------------------------------------------------------------------
// Simple progress bar component

import React from 'react';

function ProgressBar({ value = 0, max = 100, color = '#48C2C5', height = 8, style }) {
  // Ensure value is between 0 and max
  const clampedValue = Math.min(Math.max(0, value), max);
  const percentage = (clampedValue / max) * 100;

  const containerStyle = {
    width: '100%',
    backgroundColor: '#EEEEEE',
    borderRadius: height / 2,
    height: `${height}px`,
    overflow: 'hidden',
    ...style
  };

  const fillStyle = {
    height: '100%',
    width: `${percentage}%`,
    backgroundColor: color,
    borderRadius: height / 2,
    transition: 'width 0.3s ease'
  };

  return (
    <div style={containerStyle}>
      <div style={fillStyle}></div>
    </div>
  );
}

export default ProgressBar;