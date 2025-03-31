/**
 * @component Toast
 * @description An adapter for Material UI icons with the design system Toast component.
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Toast as DesignSystemToast } from '../../components/feedback/Toast';
import { Box, Typography } from '../../index';
import { useTheme } from '../../foundations/theme/ThemeProvider';

// Material UI icons for toast types
import {
import { Box } from '../../design-system';
// Design system import already exists;
;
  CheckCircleOutline as SuccessIcon,
  ErrorOutline as ErrorIcon,
  WarningAmber as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

/**
 * ToastAdapted component
 * Bridges Material UI icons with the design system Toast component
 */
const Toast = forwardRef(
  ({ 
    open, 
    onClose, 
    message, 
    type = 'info', // For compatibility with Material UI
    severity, // Also support design system naming
    autoHideDuration = 5000, 
    action, 
    title,
    position = 'top-right',
    persistent = false,
    className = '',
    style = {},
    ...rest
  }, ref) => {
    const { theme } = useTheme();
    
    // Map type to severity (for compatibility)
    const effectiveSeverity = severity || type;
    
    // Get the appropriate icon based on type
    const getIcon = () => {
  // Added display name
  getIcon.displayName = 'getIcon';

  // Added display name
  getIcon.displayName = 'getIcon';

  // Added display name
  getIcon.displayName = 'getIcon';

  // Added display name
  getIcon.displayName = 'getIcon';

      switch (effectiveSeverity) {
        case 'success':
          return <SuccessIcon style={{ color: theme?.colors?.success?.main || '#4caf50' }} />;
        case 'error':
          return <ErrorIcon style={{ color: theme?.colors?.error?.main || '#f44336' }} />;
        case 'warning':
          return <WarningIcon style={{ color: theme?.colors?.warning?.main || '#ff9800' }} />;
        case 'info':
        default:
          return <InfoIcon style={{ color: theme?.colors?.info?.main || '#2196f3' }} />;
      }
    };

    // Action container with close button if provided
    const actionContent = action ? (
      <Box style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {action}
      </Box>
    ) : null;

    // Content including title and message
    const messageContent = (
      <>
        {title && (
          <Typography 
            variant="subtitle2&quot; 
            style={{ 
              fontWeight: "bold', 
              marginBottom: '4px' 
            }}
          >
            {title}
          </Typography>
        )}
        {typeof message === 'string' ? (
          <Typography variant="body2&quot;>{message}</Typography>
        ) : (
          message
        )}
      </>
    );

    return (
      <DesignSystemToast
        ref={ref}
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={onClose}
        severity={effectiveSeverity}
        message={messageContent}
        action={actionContent}
        position={position}
        persistent={persistent}
        className={`ds-toast-adapted ${className}`}
        style={{
          maxWidth: "400px',
          boxShadow: theme?.shadows?.md || '0px 3px 5px rgba(0, 0, 0, 0.2)',
          ...style
        }}
        {...rest}
      />
    );
  }
);

Toast.displayName = 'Toast';

ToastAdapted.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  message: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  severity: PropTypes.oneOf(['info', 'success', 'warning', 'error']), // Support both naming conventions
  autoHideDuration: PropTypes.number,
  action: PropTypes.node,
  title: PropTypes.node,
  position: PropTypes.oneOf([
    'top-left',
    'top-right',
    'top-center',
    'bottom-left',
    'bottom-right',
    'bottom-center',
  ]),
  persistent: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Toast;