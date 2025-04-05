import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling"; // Card.jsx
// -----------------------------------------------------------------------------
// Simple card component for containing content in a box with shadow
import React from 'react';
function Card({
  title,
  children,
  style
}) {
  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    ...style
  };
  const titleStyle = {
    margin: '0 0 1rem 0',
    color: '#3B3D3D',
    fontSize: '1.25rem'
  };
  return <div style={cardStyle}>
      {title && (typeof title === 'string' ? <h3 style={titleStyle}>{title}</h3> : title // Allow passing a React element for more complex titles
    )}
      {children}
    </div>;
}
export default withErrorBoundary(Card, {
  boundary: 'Card'
});