// Logo.jsx
// -----------------------------------------------------------------------------
// A simple logo component with brand color text or an image if needed.

import React from 'react';

function Logo({ text = 'MyCompany', imageSrc, style }) {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    ...style
  };

  const textStyle = {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#FFFFFF'
  };

  return (
    <div style={containerStyle}>
      {imageSrc ? (
        <img src={imageSrc} alt="Logo" style={{ height: '40px' }} />
      ) : (
        <span style={textStyle}>{text}</span>
      )}
    </div>
  );
}

export default Logo;
