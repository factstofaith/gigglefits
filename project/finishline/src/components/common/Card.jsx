/**
 * Card
 * 
 * A standardized card component for displaying content in a contained box.
 * 
 * @module components/common/Card
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Standardized card component with header, content, and actions
 * 
 * @param {Object} props - Component props
 * @param {node} [props.header] - Card header content
 * @param {node} props.children - Card content
 * @param {node} [props.footer] - Card footer content
 * @param {string} [props.variant='default'] - Card visual variant
 * @param {boolean} [props.elevation=true] - Whether to show card elevation
 * @param {boolean} [props.outlined=false] - Whether to show card outline instead of elevation
 * @param {boolean} [props.hoverable=false] - Whether card has hover effect
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} The card component
 */
const Card = forwardRef(({
  header,
  children,
  footer,
  variant = 'default',
  elevation = true,
  outlined = false,
  hoverable = false,
  className = '',
  ...rest
}, ref) => {
  // Compute styles for the card
  const baseStyles = {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    overflow: 'hidden',
    transition: 'all 200ms ease-in-out',
    boxShadow: elevation && !outlined ? '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)' : 'none',
    border: outlined ? '1px solid #e0e0e0' : 'none',
    marginBottom: '1rem',
  };

  // Variant-specific styles
  const variantStyles = {
    default: {},
    primary: {
      borderTop: '3px solid #1565c0',
    },
    secondary: {
      borderTop: '3px solid #f50057',
    },
    success: {
      borderTop: '3px solid #4caf50',
    },
    warning: {
      borderTop: '3px solid #ff9800',
    },
    error: {
      borderTop: '3px solid #f44336',
    },
  };

  // Header styles
  const headerStyles = {
    padding: '1rem',
    borderBottom: '1px solid #f0f0f0',
    fontWeight: 500,
  };

  // Content styles
  const contentStyles = {
    padding: '1rem',
    flexGrow: 1,
  };

  // Footer styles
  const footerStyles = {
    padding: '1rem',
    borderTop: '1px solid #f0f0f0',
    backgroundColor: '#fafafa',
  };

  // Combine styles
  const cardStyle = {
    ...baseStyles,
    ...variantStyles[variant],
  };

  // Hover effect
  const handleMouseEnter = (e) => {
    if (hoverable) {
      e.currentTarget.style.transform = 'translateY(-4px)';
      if (elevation && !outlined) {
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.12)';
      }
    }
  };

  const handleMouseLeave = (e) => {
    if (hoverable) {
      e.currentTarget.style.transform = '';
      if (elevation && !outlined) {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)';
      }
    }
  };

  return (
    <div
      ref={ref}
      style={cardStyle}
      className={`tap-card tap-card--${variant} ${hoverable ? 'tap-card--hoverable' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="tap-card"
      {...rest}
    >
      {header && (
        <div style={headerStyles} className="tap-card__header">
          {header}
        </div>
      )}
      <div style={contentStyles} className="tap-card__content">
        {children}
      </div>
      {footer && (
        <div style={footerStyles} className="tap-card__footer">
          {footer}
        </div>
      )}
    </div>
  );
});

// Display name for debugging
Card.displayName = 'Card';

// Prop types
Card.propTypes = {
  /** Card header content */
  header: PropTypes.node,
  
  /** Card content */
  children: PropTypes.node.isRequired,
  
  /** Card footer content */
  footer: PropTypes.node,
  
  /** Card visual style variant */
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'success', 'warning', 'error']),
  
  /** Whether to show card elevation */
  elevation: PropTypes.bool,
  
  /** Whether to show card outline instead of elevation */
  outlined: PropTypes.bool,
  
  /** Whether card has hover effect */
  hoverable: PropTypes.bool,
  
  /** Additional CSS class names */
  className: PropTypes.string,
};

export default Card;