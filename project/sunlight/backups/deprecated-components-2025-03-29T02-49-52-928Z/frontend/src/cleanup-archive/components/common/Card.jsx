/**
 * @component Card
 * @description A simple, flexible container component for wrapping content in a visually distinct box with shadow.
 * Supports optional title and customizable styling.
 *
 * @example
 * // Basic usage
 * <Card title="User Profile&quot;>
 *   <p>Card content goes here</p>
 * </Card>
 *
 * @example
 * // With custom styles
 * <Card
 *   title="Important Notice"
 *   style={{
 *     backgroundColor: '#f8f9fa',
 *     borderLeft: '4px solid #fc741c'
 *   }}
 * >
 *   <p>This is an important message...</p>
 * </Card>
 *
 * @example
 * // With React element as title
 * <Card
 *   title={
 *     <div style={{ display: 'flex', alignItems: 'center' }}>
 *       <AlertIcon />
 *       <span>Alert Status</span>
 *     </div>
 *   }
 * >
 *   <p>Alert details...</p>
 * </Card>
 */
import React from 'react';

/**
 * Card component for containing content in a styled container
 *
 * @param {Object} props - The component props
 * @param {string|React.ReactNode} [props.title] - Title to display at the top of the card
 * @param {React.ReactNode} props.children - Content to be rendered inside the card
 * @param {Object} [props.style] - Custom styles to apply to the card container
 * @returns {React.ReactElement} Rendered Card component
 */
function Card({ title, children, style }) {
  // Added display name
  Card.displayName = 'Card';

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    ...style,
  };

  const titleStyle = {
    margin: '0 0 1rem 0',
    color: '#3B3D3D',
    fontSize: '1.25rem',
  };

  return (
    <div style={cardStyle}>
      {title &&
        (typeof title === 'string' ? (
          <h3 style={titleStyle}>{title}</h3>
        ) : (
          title // Allow passing a React element for more complex titles
        ))}
      {children}
    </div>
  );
}

export default Card;
