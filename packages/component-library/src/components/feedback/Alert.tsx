import React from 'react';
import MuiAlert, { AlertProps as MuiAlertProps } from '@mui/material/Alert';
import MuiAlertTitle from '@mui/material/AlertTitle';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Alert severity options
 */
export type AlertSeverity = 'success' | 'info' | 'warning' | 'error';

/**
 * Alert variant options
 */
export type AlertVariant = 'standard' | 'filled' | 'outlined';

/**
 * Alert component props interface
 */
export interface AlertProps extends Omit<MuiAlertProps, 'severity' | 'variant'> {
  /**
   * The severity of the alert
   * @default 'info'
   */
  severity?: AlertSeverity;
  
  /**
   * The variant of the alert
   * @default 'standard'
   */
  variant?: AlertVariant;
  
  /**
   * The title of the alert
   */
  title?: React.ReactNode;
  
  /**
   * The content of the alert
   */
  children: React.ReactNode;
  
  /**
   * If true, the alert will be dismissible with a close button
   * @default false
   */
  dismissible?: boolean;
  
  /**
   * Callback fired when the alert is closed
   */
  onClose?: () => void;
  
  /**
   * If true, the alert will take the full width of its container
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * If true, the alert will have a more compact appearance
   * @default false
   */
  compact?: boolean;
}

const StyledAlert = styled(MuiAlert, {
  shouldForwardProp: (prop) => !['fullWidth', 'compact'].includes(prop as string),
})<{ fullWidth?: boolean; compact?: boolean }>(({ fullWidth, compact }) => ({
  ...(fullWidth && {
    width: '100%',
  }),
  ...(compact && {
    padding: '0px 16px',
    '& .MuiAlert-message': {
      padding: '8px 0',
    },
    '& .MuiAlert-icon': {
      padding: '8px 0',
    },
  }),
}));

/**
 * Alert component for displaying feedback messages to users
 * 
 * @example
 * // Basic usage
 * <Alert severity="success">This is a success alert!</Alert>
 * 
 * @example
 * // With title
 * <Alert title="Success" severity="success">Operation completed successfully.</Alert>
 * 
 * @example
 * // Dismissible alert
 * <Alert 
 *   severity="info" 
 *   dismissible 
 *   onClose={() => console.log('Alert closed')}
 * >
 *   This is a dismissible info alert.
 * </Alert>
 * 
 * @example
 * // Different variant
 * <Alert severity="warning" variant="filled">
 *   This is a filled warning alert.
 * </Alert>
 */
export const Alert: React.FC<AlertProps> = ({
  severity = 'info',
  variant = 'standard',
  title,
  children,
  dismissible = false,
  onClose,
  fullWidth = false,
  compact = false,
  ...rest
}) => {
  return (
    <StyledAlert
      severity={severity}
      variant={variant}
      fullWidth={fullWidth}
      compact={compact}
      action={
        dismissible ? (
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        ) : undefined
      }
      {...rest}
    >
      {title && <MuiAlertTitle>{title}</MuiAlertTitle>}
      {children}
    </StyledAlert>
  );
};

export default Alert;