// Footer.jsx
// -----------------------------------------------------------------------------
// Simple footer component

import React from 'react';

function Footer() {
  const footerStyle = {
    backgroundColor: '#F5F5F5',
    padding: '1.5rem',
    borderTop: '1px solid #E0E0E0',
    marginTop: '2rem',
    textAlign: 'center',
    color: '#3B3D3D'
  };

  return (
    <footer style={footerStyle}>
      <div>
        <p>© {new Date().getFullYear()} TAP Integration Platform. All rights reserved.</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          <a 
            href="#privacy" 
            style={{ color: '#48C2C5', marginRight: '1rem', textDecoration: 'none' }}
          >
            Privacy Policy
          </a>
          <a 
            href="#terms" 
            style={{ color: '#48C2C5', textDecoration: 'none' }}
          >
            Terms of Service
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;