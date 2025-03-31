/**
 * Badge
 * 
 * A standardized badge component for displaying status or count indicators.
 * 
 * @module components/common/Badge
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Standardized badge component
 * 
 * @param {Object} props - Component props
 * @param {node} props.children - Badge content
 * @param {string} [props.color='primary'] - Badge color
 * @param {string} [props.variant='standard'] - Badge variant
 * @param {string} [props.size='medium'] - Badge size
 * @param {string} [props.shape='rounded'] - Badge shape
 * @param {node} [props.content] - Badge content (alternative to children)
 * @param {boolean} [props.invisible=false] - Whether badge is invisible
 * @param {string|number} [props.max] - Maximum value to display
 * @param {boolean} [props.showZero=false] - Whether to display zero values
 * @param {Function} [props.onClick] - Click handler
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} The badge component
 */
const Badge = forwardRef(({
  children,
  color = 'primary',
  variant = 'standard',
  size = 'medium',
  shape = 'rounded',
  content,
  invisible = false,
  max,
  showZero = false,
  onClick,
  className = '',
  ...rest
}, ref) => {
  // Color styles
  const colorMap = {
    primary: {
      standard: { background: '#1976d2', color: '#ffffff' },
      outlined: { background: 'transparent', color: '#1976d2', border: '1px solid #1976d2' },
      text: { background: 'rgba(25, 118, 210, 0.1)', color: '#1976d2' },
    },
    secondary: {
      standard: { background: '#9c27b0', color: '#ffffff' },
      outlined: { background: 'transparent', color: '#9c27b0', border: '1px solid #9c27b0' },
      text: { background: 'rgba(156, 39, 176, 0.1)', color: '#9c27b0' },
    },
    success: {
      standard: { background: '#4caf50', color: '#ffffff' },
      outlined: { background: 'transparent', color: '#4caf50', border: '1px solid #4caf50' },
      text: { background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' },
    },
    warning: {
      standard: { background: '#ff9800', color: '#ffffff' },
      outlined: { background: 'transparent', color: '#ff9800', border: '1px solid #ff9800' },
      text: { background: 'rgba(255, 152, 0, 0.1)', color: '#ff9800' },
    },
    error: {
      standard: { background: '#f44336', color: '#ffffff' },
      outlined: { background: 'transparent', color: '#f44336', border: '1px solid #f44336' },
      text: { background: 'rgba(244, 67, 54, 0.1)', color: '#f44336' },
    },
    info: {
      standard: { background: '#2196f3', color: '#ffffff' },
      outlined: { background: 'transparent', color: '#2196f3', border: '1px solid #2196f3' },
      text: { background: 'rgba(33, 150, 243, 0.1)', color: '#2196f3' },
    },
    default: {
      standard: { background: '#e0e0e0', color: '#212121' },
      outlined: { background: 'transparent', color: '#757575', border: '1px solid #757575' },
      text: { background: 'rgba(0, 0, 0, 0.08)', color: '#757575' },
    },
  };
  
  // Size styles
  const sizeMap = {
    small: {
      fontSize: '0.75rem',
      height: '18px',
      minWidth: '18px',
      padding: '0 4px',
    },
    medium: {
      fontSize: '0.875rem',
      height: '22px',
      minWidth: '22px',
      padding: '0 6px',
    },
    large: {
      fontSize: '1rem',
      height: '28px',
      minWidth: '28px',
      padding: '0 8px',
    },
  };
  
  // Shape styles
  const shapeMap = {
    rounded: {
      borderRadius: '4px',
    },
    pill: {
      borderRadius: '999px',
    },
    square: {
      borderRadius: '0',
    },
  };
  
  // Get badge content (children or content prop)
  let badgeContent = children || content;
  
  // Handle numeric content
  if (badgeContent !== undefined && typeof badgeContent === 'number') {
    // If max is defined and content exceeds max, show max+
    if (max !== undefined && badgeContent > max) {
      badgeContent = `${max}+`;
    }
    
    // Hide zero values unless showZero is true
    if (badgeContent === 0 && !showZero) {
      invisible = true;
    }
  }
  
  // Hide if no content or invisible prop is true
  if (badgeContent === undefined || invisible) {
    return null;
  }
  
  // Get styles from maps
  const colorStyle = colorMap[color]?.[variant] || colorMap.default[variant];
  const sizeStyle = sizeMap[size] || sizeMap.medium;
  const shapeStyle = shapeMap[shape] || shapeMap.rounded;
  
  // Combine styles
  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    fontWeight: 600,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
    cursor: onClick ? 'pointer' : 'default',
    ...colorStyle,
    ...sizeStyle,
    ...shapeStyle,
  };
  
  // Pass to click handler
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };
  
  return (
    <span
      ref={ref}
      style={badgeStyle}
      className={`tap-badge tap-badge--${color} tap-badge--${variant} tap-badge--${size} tap-badge--${shape} ${className}`}
      onClick={handleClick}
      data-testid="tap-badge"
      {...rest}
    >
      {badgeContent}
    </span>
  );
});

// Display name for debugging
Badge.displayName = 'Badge';

// Prop types
Badge.propTypes = {
  /** Badge content */
  children: PropTypes.node,
  
  /** Badge color */
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'info', 'default']),
  
  /** Badge variant */
  variant: PropTypes.oneOf(['standard', 'outlined', 'text']),
  
  /** Badge size */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  
  /** Badge shape */
  shape: PropTypes.oneOf(['rounded', 'pill', 'square']),
  
  /** Badge content (alternative to children) */
  content: PropTypes.node,
  
  /** Whether badge is invisible */
  invisible: PropTypes.bool,
  
  /** Maximum value to display */
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  
  /** Whether to display zero values */
  showZero: PropTypes.bool,
  
  /** Click handler */
  onClick: PropTypes.func,
  
  /** Additional CSS class names */
  className: PropTypes.string,
};

export default Badge;