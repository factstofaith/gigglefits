/**
 * Alert
 * 
 * A standardized alert component for displaying messages and notifications.
 * 
 * @module components/common/Alert
 */

import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Standardized alert component for messages and notifications
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Alert message
 * @param {string} [props.title] - Alert title
 * @param {string} [props.severity='info'] - Alert severity
 * @param {boolean} [props.closable=false] - Whether alert can be closed
 * @param {function} [props.onClose] - Callback when alert is closed
 * @param {boolean} [props.outlined=false] - Whether alert has outlined style
 * @param {boolean} [props.filled=false] - Whether alert has filled style
 * @param {node} [props.icon] - Custom icon
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element|null} The alert component or null if closed
 */
const Alert = forwardRef(({
  message,
  title,
  severity = 'info',
  closable = false,
  onClose,
  outlined = false,
  filled = false,
  icon,
  className = '',
  ...rest
}, ref) => {
  const [closed, setClosed] = useState(false);

  if (closed) {
    return null;
  }

  // Color mapping for different severities
  const colorMap = {
    info: {
      light: '#e3f2fd',
      main: '#2196f3',
      dark: '#1565c0',
      contrastText: '#000000',
    },
    success: {
      light: '#e8f5e9',
      main: '#4caf50',
      dark: '#2e7d32',
      contrastText: '#000000',
    },
    warning: {
      light: '#fff8e1',
      main: '#ff9800',
      dark: '#f57c00',
      contrastText: '#000000',
    },
    error: {
      light: '#ffebee',
      main: '#f44336',
      dark: '#c62828',
      contrastText: '#ffffff',
    },
  };

  const color = colorMap[severity] || colorMap.info;

  // Generate default icons based on severity
  const defaultIcon = () => {
    const iconStyle = {
      display: 'inline-block',
      width: '24px',
      height: '24px',
      marginRight: '8px',
      flexShrink: 0,
    };

    // Simple SVG icons for each severity
    const icons = {
      info: (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
      ),
      success: (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
      warning: (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
      ),
      error: (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      ),
    };

    return icons[severity] || icons.info;
  };

  // Style variants based on props
  let backgroundColor = color.light;
  let textColor = color.dark;
  let borderColor = color.main;

  if (filled) {
    backgroundColor = color.main;
    textColor = color.contrastText;
    borderColor = 'transparent';
  } else if (outlined) {
    backgroundColor = 'transparent';
    borderColor = color.main;
  }

  // Alert styles
  const alertStyle = {
    position: 'relative',
    display: 'flex',
    padding: '8px 16px',
    marginBottom: '16px',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor,
    color: textColor,
    border: `1px solid ${borderColor}`,
    boxSizing: 'border-box',
    alignItems: 'center',
  };

  // Content wrapper styles
  const contentStyle = {
    flex: '1 1 auto',
  };

  // Title styles
  const titleStyle = {
    margin: '0 0 4px 0',
    fontWeight: 'bold',
    fontSize: '16px',
  };

  // Message styles
  const messageStyle = {
    margin: 0,
  };

  // Close button styles
  const closeButtonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    marginLeft: '8px',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    color: 'inherit',
    opacity: 0.7,
    transition: 'opacity 0.2s',
    ':hover': {
      opacity: 1,
    },
  };

  // Handle close button click
  const handleClose = () => {
    setClosed(true);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      ref={ref}
      style={alertStyle}
      role="alert"
      className={`tap-alert tap-alert--${severity} ${outlined ? 'tap-alert--outlined' : ''} ${filled ? 'tap-alert--filled' : ''} ${className}`}
      data-testid="tap-alert"
      {...rest}
    >
      {icon || defaultIcon()}
      
      <div style={contentStyle}>
        {title && <h4 style={titleStyle}>{title}</h4>}
        <p style={messageStyle}>{message}</p>
      </div>
      
      {closable && (
        <button
          type="button"
          onClick={handleClose}
          style={closeButtonStyle}
          aria-label="Close"
          data-testid="tap-alert-close-button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      )}
    </div>
  );
});

// Display name for debugging
Alert.displayName = 'Alert';

// Prop types
Alert.propTypes = {
  /** Alert message */
  message: PropTypes.string.isRequired,
  
  /** Optional alert title */
  title: PropTypes.string,
  
  /** Alert severity */
  severity: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  
  /** Whether alert can be closed */
  closable: PropTypes.bool,
  
  /** Callback when alert is closed */
  onClose: PropTypes.func,
  
  /** Whether alert has outlined style */
  outlined: PropTypes.bool,
  
  /** Whether alert has filled style */
  filled: PropTypes.bool,
  
  /** Custom icon */
  icon: PropTypes.node,
  
  /** Additional CSS class names */
  className: PropTypes.string,
};

export default Alert;