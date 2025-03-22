// AlertBox.jsx
// -----------------------------------------------------------------------------
// Displays an alert in brand colors, with optional close.

import React from 'react';

function AlertBox({ type = 'info', message, onClose }) {
  // Basic color mapping
  const colorMap = {
    success: { bg: '#48C2C5', text: '#FFFFFF' },
    error: { bg: '#FC741C', text: '#FFFFFF' },
    warning: { bg: '#FFAA3B', text: '#FFFFFF' },
    info: { bg: '#48C2C5', text: '#FFFFFF' }
  };

  const style = {
    backgroundColor: colorMap[type] ? colorMap[type].bg : '#48C2C5',
    color: colorMap[type] ? colorMap[type].text : '#FFFFFF',
    padding: '1rem',
    borderRadius: '6px',
    margin: '1rem 0',
    position: 'relative'
  };

  const closeStyle = {
    position: 'absolute',
    top: '0.5rem',
    right: '0.75rem',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    color: 'inherit',
    fontSize: '1.2rem',
    lineHeight: '1'
  };

  return (
    <div style={style}>
      {message}
      {onClose && (
        <button style={closeStyle} onClick={onClose}>
          &times;
        </button>
      )}
    </div>
  );
}

export default AlertBox;
