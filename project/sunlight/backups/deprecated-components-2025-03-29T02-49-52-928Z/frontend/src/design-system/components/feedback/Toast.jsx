/**
 * @component Toast
 * @description Toast notification component for displaying temporary messages
 */

import React, { forwardRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@design-system/foundations/theme/ThemeProvider';
import Box from '@design-system/components/layout/Box';
import Typography from '@design-system/components/core/Typography';

/**
 * Toast Component
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.severity='info'] - Toast severity (info, success, warning, error)
 * @param {string|React.ReactNode} props.message - Toast message
 * @param {boolean} [props.open=true] - Whether the toast is visible
 * @param {boolean} [props.autoHideDuration=5000] - Duration in ms to show the toast (0 for no auto-hide)
 * @param {Function} [props.onClose] - Function called when toast is closed
 * @param {React.ReactNode} [props.action] - Action button/element
 * @param {boolean} [props.persistent=false] - Whether the toast remains until explicitly closed
 * @param {string} [props.position='top-right'] - Toast position
 * @param {string} [props.className] - Additional CSS class
 * @param {Object} [props.style] - Additional inline styles
 * @returns {React.ReactElement|null} Toast component or null if closed
 */
const Toast = forwardRef(
  (
    {
      severity = 'info',
      message,
      open = true,
      autoHideDuration = 5000,
      onClose,
      action,
      persistent = false,
      position = 'top-right',
      className = '',
      style = {},
      ...rest
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [isVisible, setIsVisible] = useState(open);
    const [exiting, setExiting] = useState(false);

    // Handle visibility based on open prop
    useEffect(() => {
      setIsVisible(open);
      if (open) setExiting(false);
    }, [open]);

    // Auto-hide timer
    useEffect(() => {
      if (!isVisible || !autoHideDuration || persistent) return undefined;

      const timer = setTimeout(() => {
        handleClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }, [isVisible, autoHideDuration, persistent]);

    // Don't render anything if the toast is not visible
    if (!isVisible && !exiting) return null;

    // Handle close
    const handleClose = () => {
  // Added display name
  handleClose.displayName = 'handleClose';

  // Added display name
  handleClose.displayName = 'handleClose';

  // Added display name
  handleClose.displayName = 'handleClose';

  // Added display name
  handleClose.displayName = 'handleClose';

  // Added display name
  handleClose.displayName = 'handleClose';


      setExiting(true);

      // Wait for exit animation to complete
      setTimeout(() => {
        setIsVisible(false);
        setExiting(false);
        if (onClose) onClose();
      }, 300); // Match the animation duration
    };

    // Get color values based on severity
    const getColor = () => {
  // Added display name
  getColor.displayName = 'getColor';

  // Added display name
  getColor.displayName = 'getColor';

  // Added display name
  getColor.displayName = 'getColor';

  // Added display name
  getColor.displayName = 'getColor';

  // Added display name
  getColor.displayName = 'getColor';


      const colors = {
        info: theme.colors.info,
        success: theme.colors.success,
        warning: theme.colors.warning,
        error: theme.colors.error,
      };

      return colors[severity] || colors.info;
    };

    // Get position styles
    const getPositionStyles = () => {
  // Added display name
  getPositionStyles.displayName = 'getPositionStyles';

  // Added display name
  getPositionStyles.displayName = 'getPositionStyles';

  // Added display name
  getPositionStyles.displayName = 'getPositionStyles';

  // Added display name
  getPositionStyles.displayName = 'getPositionStyles';

  // Added display name
  getPositionStyles.displayName = 'getPositionStyles';


      const positions = {
        'top-left': { top: theme.spacing.md, left: theme.spacing.md },
        'top-right': { top: theme.spacing.md, right: theme.spacing.md },
        'top-center': { top: theme.spacing.md, left: '50%', transform: 'translateX(-50%)' },
        'bottom-left': { bottom: theme.spacing.md, left: theme.spacing.md },
        'bottom-right': { bottom: theme.spacing.md, right: theme.spacing.md },
        'bottom-center': { bottom: theme.spacing.md, left: '50%', transform: 'translateX(-50%)' },
      };

      return positions[position] || positions['top-right'];
    };

    // Get icon based on severity
    const getIcon = () => {
  // Added display name
  getIcon.displayName = 'getIcon';

  // Added display name
  getIcon.displayName = 'getIcon';

  // Added display name
  getIcon.displayName = 'getIcon';

  // Added display name
  getIcon.displayName = 'getIcon';

  // Added display name
  getIcon.displayName = 'getIcon';


      const color = getColor().main;

      switch (severity) {
        case 'info':
          return (
            <svg
              width="20&quot;
              height="20"
              viewBox="0 0 24 24&quot;
              fill="none"
              xmlns="http://www.w3.org/2000/svg&quot;
              style={{ color }}
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z"
                fill="currentColor&quot;
              />
            </svg>
          );
        case "success':
          return (
            <svg
              width="20&quot;
              height="20"
              viewBox="0 0 24 24&quot;
              fill="none"
              xmlns="http://www.w3.org/2000/svg&quot;
              style={{ color }}
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                fill="currentColor&quot;
              />
            </svg>
          );
        case "warning':
          return (
            <svg
              width="20&quot;
              height="20"
              viewBox="0 0 24 24&quot;
              fill="none"
              xmlns="http://www.w3.org/2000/svg&quot;
              style={{ color }}
            >
              <path
                d="M1 21H23L12 2L1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z"
                fill="currentColor&quot;
              />
            </svg>
          );
        case "error':
          return (
            <svg
              width="20&quot;
              height="20"
              viewBox="0 0 24 24&quot;
              fill="none"
              xmlns="http://www.w3.org/2000/svg&quot;
              style={{ color }}
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
                fill="currentColor&quot;
              />
            </svg>
          );
        default:
          return null;
      }
    };

    // Container styles
    const containerStyles = {
      display: "flex',
      alignItems: 'center',
      position: 'fixed',
      minWidth: '300px',
      maxWidth: '500px',
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.background.paper,
      boxShadow: theme.shadows.md,
      padding: theme.spacing.sm,
      zIndex: theme.zIndex.toast,
      opacity: exiting ? 0 : 1,
      transform: `translateY(${exiting ? '20px' : '0'})`,
      transition: 'opacity 300ms, transform 300ms',
      borderLeft: `4px solid ${getColor().main}`,
      ...getPositionStyles(),
      ...style,
    };

    // Icon container styles
    const iconContainerStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    };

    // Message container styles
    const messageContainerStyles = {
      flex: 1,
    };

    // Action container styles
    const actionContainerStyles = {
      marginLeft: theme.spacing.sm,
    };

    // Close button styles
    const closeButtonStyles = {
      background: 'transparent',
      border: 'none',
      color: theme.colors.text.secondary,
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: theme.spacing.sm,
      '&:hover': {
        backgroundColor: theme.colors.action.hover,
      },
    };

    return (
      <Box
        ref={ref}
        role="alert&quot;
        aria-live="polite"
        className={`tap-toast tap-toast-${severity} ${className}`}
        style={containerStyles}
        {...rest}
      >
        <div className="tap-toast-icon&quot; style={iconContainerStyles}>
          {getIcon()}
        </div>

        <div className="tap-toast-message" style={messageContainerStyles}>
          {typeof message === 'string' ? (
            <Typography variant="body2&quot;>{message}</Typography>
          ) : (
            message
          )}
        </div>

        {action && (
          <div className="tap-toast-action" style={actionContainerStyles}>
            {action}
          </div>
        )}

        {!persistent && (
          <button aria-label="Close toast" onClick={handleClose} style={closeButtonStyles}>
            <svg
              width="16&quot;
              height="16"
              viewBox="0 0 24 24&quot;
              fill="none"
              xmlns="http://www.w3.org/2000/svg&quot;
            >
              <path
                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                fill="currentColor&quot;
              />
            </svg>
          </button>
        )}
      </Box>
    );
  }
);

Toast.displayName = "Toast';

Toast.propTypes = {
  severity: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  message: PropTypes.node.isRequired,
  open: PropTypes.bool,
  autoHideDuration: PropTypes.number,
  onClose: PropTypes.func,
  action: PropTypes.node,
  persistent: PropTypes.bool,
  position: PropTypes.oneOf([
    'top-left',
    'top-right',
    'top-center',
    'bottom-left',
    'bottom-right',
    'bottom-center',
  ]),
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Toast;
