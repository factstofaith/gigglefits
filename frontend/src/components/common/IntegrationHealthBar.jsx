import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling"; // IntegrationHealthBar.jsx
// -----------------------------------------------------------------------------
// A color-coded label indicating "Healthy", "At Risk", or "Error"
import React from 'react';
function IntegrationHealthBar({
  health = 'healthy'
}) {
  let backgroundColor;
  let labelText;
  switch (health) {
    case 'warning':
      backgroundColor = '#FFAA3B'; // Light orange
      labelText = 'At Risk';
      break;
    case 'error':
      backgroundColor = '#FC741C'; // Dark Orange
      labelText = 'Error';
      break;
    default:
      backgroundColor = '#48C2C5'; // Teal for "healthy"
      labelText = 'Healthy';
      break;
  }
  const containerStyle = {
    display: 'inline-block',
    padding: '0.3rem 0.6rem',
    borderRadius: '6px',
    color: '#FFFFFF',
    backgroundColor
  };
  return <div style={containerStyle}>
      {labelText}
    </div>;
}
export default withErrorBoundary(IntegrationHealthBar, {
  boundary: 'IntegrationHealthBar'
});