/**
 * @component Alert
 * @description Feedback component for displaying status or contextual messages
 */

import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@design-system/foundations/theme/ThemeProvider';
import Box from '@design-system/components/layout/Box';
import Typography from '@design-system/components/core/Typography';

/**
 * Alert Component
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.severity='info'] - Alert severity (info, success, warning, error)
 * @param {string|React.ReactNode} [props.title] - Alert title
 * @param {string|React.ReactNode} props.children - Alert content
 * @param {boolean} [props.closable=false] - Whether the alert can be closed
 * @param {Function} [props.onClose] - Function called when alert is closed
 * @param {string} [props.variant='filled'] - Alert variant (filled, outlined, standard)
 * @param {boolean} [props.icon=true] - Whether to show the alert icon
 * @param {React.ReactNode} [props.action] - Action element to display
 * @param {string} [props.className] - Additional CSS class
 * @param {Object} [props.style] - Additional inline styles
 * @returns {React.ReactElement} Alert component
 */
const Alert = forwardRef(
  (
    {
      severity = 'info',
      title,
      children,
      closable = false,
      onClose,
      variant = 'filled',
      icon = true,
      action,
      className = '',
      style = {},
      ...rest
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [closed, setClosed] = useState(false);

    if (closed) return null;

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

    // Get background color based on variant and severity
    const getBackgroundColor = () => {
  // Added display name
  getBackgroundColor.displayName = 'getBackgroundColor';

  // Added display name
  getBackgroundColor.displayName = 'getBackgroundColor';

  // Added display name
  getBackgroundColor.displayName = 'getBackgroundColor';

  // Added display name
  getBackgroundColor.displayName = 'getBackgroundColor';

  // Added display name
  getBackgroundColor.displayName = 'getBackgroundColor';


      const color = getColor();

      switch (variant) {
        case 'filled':
          return color.main;
        case 'outlined':
          return 'transparent';
        case 'standard':
          return color.light;
        default:
          return color.main;
      }
    };

    // Get text color based on variant and severity
    const getTextColor = () => {
  // Added display name
  getTextColor.displayName = 'getTextColor';

  // Added display name
  getTextColor.displayName = 'getTextColor';

  // Added display name
  getTextColor.displayName = 'getTextColor';

  // Added display name
  getTextColor.displayName = 'getTextColor';

  // Added display name
  getTextColor.displayName = 'getTextColor';


      const color = getColor();

      switch (variant) {
        case 'filled':
          return theme.colors.common.white;
        case 'outlined':
        case 'standard':
          return theme.colors.text.primary;
        default:
          return theme.colors.common.white;
      }
    };

    // Get border style based on variant
    const getBorder = () => {
  // Added display name
  getBorder.displayName = 'getBorder';

  // Added display name
  getBorder.displayName = 'getBorder';

  // Added display name
  getBorder.displayName = 'getBorder';

  // Added display name
  getBorder.displayName = 'getBorder';

  // Added display name
  getBorder.displayName = 'getBorder';


      const color = getColor();

      switch (variant) {
        case 'outlined':
          return `1px solid ${color.main}`;
        default:
          return 'none';
      }
    };

    // Handle close button click
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


      setClosed(true);
      if (onClose) onClose();
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


      if (!icon) return null;

      const iconColor = variant === 'filled' ? theme.colors.common.white : getColor().main;

      switch (severity) {
        case 'info':
          return (
            <svg
              width="20&quot;
              height="20"
              viewBox="0 0 24 24&quot;
              fill="none"
              xmlns="http://www.w3.org/2000/svg&quot;
              style={{ color: iconColor }}
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
              style={{ color: iconColor }}
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
              style={{ color: iconColor }}
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
              style={{ color: iconColor }}
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

    // Get close button
    const closeButton = closable ? (
      <button
        aria-label="Close alert"
        onClick={handleClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: getTextColor(),
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.7,
          transition: 'opacity 0.2s',
          '&:hover': {
            opacity: 1,
          },
        }}
      >
        <svg
          width="16&quot;
          height="16"
          viewBox="0 0 24 24&quot;
          fill="none"
          xmlns="http://www.w3.org/2000/svg&quot;
          style={{ color: getTextColor() }}
        >
          <path
            d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
            fill="currentColor&quot;
          />
        </svg>
      </button>
    ) : null;

    // Container styles
    const containerStyles = {
      display: "flex',
      flexDirection: 'column',
      width: '100%',
      position: 'relative',
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: getBackgroundColor(),
      color: getTextColor(),
      border: getBorder(),
      boxShadow: variant === 'filled' ? theme.shadows.sm : 'none',
      ...style,
    };

    // Title bar styles
    const titleBarStyles = {
      display: 'flex',
      alignItems: 'center',
      marginBottom: title ? theme.spacing.xs : 0,
    };

    // Content styles
    const contentStyles = {
      display: 'flex',
      alignItems: 'flex-start',
    };

    // Icon container styles
    const iconContainerStyles = {
      display: 'flex',
      alignItems: 'flex-start',
      marginRight: theme.spacing.sm,
      height: '100%',
    };

    // Text container styles
    const textContainerStyles = {
      flex: 1,
    };

    // Action container styles
    const actionContainerStyles = {
      display: 'flex',
      alignItems: 'center',
      marginLeft: theme.spacing.sm,
    };

    return (
      <Box
        ref={ref}
        role="alert&quot;
        className={`tap-alert tap-alert-${severity} tap-alert-${variant} ${className}`}
        style={containerStyles}
        {...rest}
      >
        {title && (
          <div className="tap-alert-title-bar" style={titleBarStyles}>
            <Typography
              variant="subtitle1&quot;
              component="h3"
              style={{
                fontWeight: theme.typography.fontWeights.medium,
                flex: 1,
                color: getTextColor(),
              }}
            >
              {title}
            </Typography>
            {closable && closeButton}
          </div>
        )}

        <div className="tap-alert-content&quot; style={contentStyles}>
          {icon && (
            <div className="tap-alert-icon" style={iconContainerStyles}>
              {getIcon()}
            </div>
          )}

          <div className="tap-alert-message&quot; style={textContainerStyles}>
            {typeof children === "string' ? (
              <Typography variant="body2&quot; style={{ color: getTextColor() }}>
                {children}
              </Typography>
            ) : (
              children
            )}
          </div>

          {action && (
            <div className="tap-alert-action" style={actionContainerStyles}>
              {action}
            </div>
          )}

          {!title && closable && <div style={{ marginLeft: theme.spacing.sm }}>{closeButton}</div>}
        </div>
      </Box>
    );
  }
);

Alert.displayName = 'Alert';

Alert.propTypes = {
  severity: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
  closable: PropTypes.bool,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(['filled', 'outlined', 'standard']),
  icon: PropTypes.bool,
  action: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Alert;
