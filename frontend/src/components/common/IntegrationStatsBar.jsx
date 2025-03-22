// IntegrationStatsBar.jsx
// -----------------------------------------------------------------------------
// A modern stats bar showing integration counts (total, healthy, warnings, errors).

import React from 'react';

function IntegrationStatsBar({ total = 0, healthy = 0, warnings = 0, errors = 0 }) {
  const containerStyle = {
    display: 'flex',
    gap: '2rem',
    backgroundColor: '#FFFFFF',
    padding: '1rem',
    borderRadius: '6px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem'
  };

  const statBoxStyle = {
    textAlign: 'center',
    color: '#3B3D3D'
  };

  const statNumberStyle = {
    fontSize: '1.2rem',
    fontWeight: 'bold'
  };

  return (
    <div style={containerStyle}>
      <div style={statBoxStyle}>
        <div style={statNumberStyle}>{total}</div>
        <div>Total Integrations</div>
      </div>
      <div style={statBoxStyle}>
        <div style={statNumberStyle}>{healthy}</div>
        <div>Healthy</div>
      </div>
      <div style={statBoxStyle}>
        <div style={statNumberStyle}>{warnings}</div>
        <div>Warnings</div>
      </div>
      <div style={statBoxStyle}>
        <div style={statNumberStyle}>{errors}</div>
        <div>Errors</div>
      </div>
    </div>
  );
}

export default IntegrationStatsBar;