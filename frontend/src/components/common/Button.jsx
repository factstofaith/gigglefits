// Button.jsx
// -----------------------------------------------------------------------------
// A modern button component using your color scheme and minimal, clean styling.
// Uses a slight hover effect and consistent borderRadius.

import React from 'react';

function Button({ onClick, children, style, disabled = false }) {
  // Primary brand color as a fallback if no style overrides
  const defaultBackground = '#3B3D3D';
  const disabledColor = '#DDDDDD';

  const buttonStyle = {
    display: 'inline-block',
    padding: '0.35rem .9rem',
    borderRadius: '22px',
    border: 'none',
    color: '#FFFFFF',
    backgroundColor: disabled ? disabledColor : defaultBackground,
    fontSize: '1rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
    ...style
  };

  // Basic hover behavior (darken or lighten). 
  // We'll rely on inline style + event for demonstration.
  const handleMouseEnter = (e) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor = '#FC741C'; // slightly darker teal
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor = defaultBackground;
    }
  };

  return (
    <button
      onClick={onClick}
      style={buttonStyle}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
}

export default Button;
