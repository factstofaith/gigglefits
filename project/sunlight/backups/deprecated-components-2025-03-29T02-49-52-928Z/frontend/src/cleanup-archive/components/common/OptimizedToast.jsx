// OptimizedToast.jsx
// A performance-optimized version of Toast for heavy usage scenarios
import React, { memo, useRef, useEffect } from 'react';
import { Box } from '../../../design-system'
import { Typography } from '../../../design-system'
import { Toast as DSToast } from '../../../design-system'
import { useTheme } from '../../design-system/foundations/theme';
import { Close as CloseIcon } from '@mui/icons-material';

// Icon mapping - we'll import the necessary icons based on type
import {
import Box from '@mui/material/Box';
CheckCircleOutline as SuccessIcon,
  ErrorOutline as ErrorIcon,
  WarningAmber as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// Get the appropriate icon based on type
const getIcon = (type, theme) => {
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


  switch (type) {
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

// Use memo to prevent unnecessary re-renders
const OptimizedToast = memo(
  ({ open, onClose, message, type = 'info', autoHideDuration = 5000, action, title }) => {
    const { theme } = useTheme();
    const timeoutRef = useRef(null);

    // Manually manage timeout for better performance
    useEffect(() => {
      if (open && autoHideDuration) {
        timeoutRef.current = setTimeout(() => {
          if (onClose) onClose();
        }, autoHideDuration);
      }

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [open, autoHideDuration, onClose]);

    // Only render when open to save resources
    if (!open) return null;

    // Action container with close button
    const actionContent = (
      <Box style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {action}
        <Box
          as="button&quot;
          onClick={onClose}
          aria-label="Close toast"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            padding: '4px',
            borderRadius: '50%',
            cursor: 'pointer',
          }}
        >
          <CloseIcon style={{ fontSize: '18px' }} />
        </Box>
      </Box>
    );

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
        <Typography variant="body2&quot;>{message}</Typography>
      </>
    );

    return (
      <DSToast
        open={open}
        severity={type}
        message={messageContent}
        action={actionContent}
        position="top-right"
        persistent={true} // We're manually managing the timeout
        style={{
          width: '100%',
          maxWidth: '400px',
          boxShadow: theme?.shadows?.md || '0px 3px 5px rgba(0, 0, 0, 0.2)',
          border: '1px solid',
          borderColor: theme?.colors?.[type]?.main || '#ccc'
        }}
      />
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for memo to prevent unnecessary re-renders
    return (
      prevProps.open === nextProps.open &&
      prevProps.message === nextProps.message &&
      prevProps.type === nextProps.type &&
      prevProps.title === nextProps.title
    );
  }
);

OptimizedToast.displayName = 'OptimizedToast';

export default OptimizedToast;
