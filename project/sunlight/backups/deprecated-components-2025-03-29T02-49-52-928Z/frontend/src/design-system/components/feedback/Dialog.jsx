/**
 * @component Dialog
 * @description Modal dialog component for displaying content in a layer above the app
 */

import React, { forwardRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { useTheme } from '@design-system/foundations/theme/ThemeProvider';
import Box from '@design-system/components/layout/Box';
import Typography from '@design-system/components/core/Typography';

/**
 * Dialog Component
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function called when the dialog is closed
 * @param {string|React.ReactNode} [props.title] - Dialog title
 * @param {string|React.ReactNode} props.children - Dialog content
 * @param {React.ReactNode} [props.actions] - Dialog action buttons
 * @param {string} [props.size='md'] - Dialog size (sm, md, lg, xl, full)
 * @param {boolean} [props.fullScreen=false] - Whether the dialog is full screen
 * @param {boolean} [props.disableBackdropClick=false] - Whether clicking the backdrop closes the dialog
 * @param {boolean} [props.disableEscapeKeyDown=false] - Whether pressing escape closes the dialog
 * @param {string} [props.className] - Additional CSS class
 * @param {Object} [props.style] - Additional inline styles
 * @returns {React.ReactElement|null} Dialog component or null if closed
 */
const Dialog = forwardRef(
  (
    {
      open = false,
      onClose,
      title,
      children,
      actions,
      size = 'md',
      fullScreen = false,
      disableBackdropClick = false,
      disableEscapeKeyDown = false,
      className = '',
      style = {},
      ...rest
    },
    ref
  ) => {
    const { theme } = useTheme();

    // Handle ESC key press
    useEffect(() => {
      if (!open || disableEscapeKeyDown) return;

      const handleKeyDown = event => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose, disableEscapeKeyDown]);

    // Lock body scroll when dialog is open
    useEffect(() => {
      if (open) {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        return () => {
          document.body.style.overflow = originalStyle;
        };
      }
    }, [open]);

    // Don't render anything if the dialog is closed
    if (!open) return null;

    // Handle backdrop click
    const handleBackdropClick = event => {
      if (event.target === event.currentTarget && !disableBackdropClick) {
        onClose();
      }
    };

    // Get dialog width based on size
    const getDialogWidth = () => {
  // Added display name
  getDialogWidth.displayName = 'getDialogWidth';

  // Added display name
  getDialogWidth.displayName = 'getDialogWidth';

  // Added display name
  getDialogWidth.displayName = 'getDialogWidth';

  // Added display name
  getDialogWidth.displayName = 'getDialogWidth';

  // Added display name
  getDialogWidth.displayName = 'getDialogWidth';


      if (fullScreen) return '100%';

      const sizes = {
        sm: '400px',
        md: '600px',
        lg: '800px',
        xl: '1200px',
        full: '100%',
      };

      return sizes[size] || sizes.md;
    };

    // Backdrop styles
    const backdropStyles = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: theme.zIndex.modal,
      padding: fullScreen ? 0 : theme.spacing.md,
    };

    // Dialog container styles
    const dialogStyles = {
      display: 'flex',
      flexDirection: 'column',
      width: getDialogWidth(),
      maxWidth: '100%',
      maxHeight: fullScreen ? '100%' : '90vh',
      borderRadius: fullScreen ? 0 : theme.borderRadius.md,
      backgroundColor: theme.colors.background.paper,
      boxShadow: theme.shadows.lg,
      overflow: 'hidden',
      position: 'relative',
      ...style,
    };

    // Header styles
    const headerStyles = {
      display: 'flex',
      alignItems: 'center',
      padding: `${theme.spacing.md} ${theme.spacing.md}`,
      borderBottom: `1px solid ${theme.colors.divider}`,
    };

    // Content styles
    const contentStyles = {
      flex: '1 1 auto',
      padding: theme.spacing.md,
      overflowY: 'auto',
    };

    // Footer styles
    const footerStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      borderTop: actions ? `1px solid ${theme.colors.divider}` : 'none',
      gap: theme.spacing.sm,
    };

    // Close button styles
    const closeButtonStyles = {
      background: 'transparent',
      border: 'none',
      color: theme.colors.text.secondary,
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 'auto',
      '&:hover': {
        backgroundColor: theme.colors.action.hover,
      },
    };

    // Create portal for the dialog
    return createPortal(
      <div
        role="presentation&quot;
        className="tap-dialog-backdrop"
        style={backdropStyles}
        onClick={handleBackdropClick}
      >
        <Box
          ref={ref}
          role="dialog&quot;
          aria-modal="true"
          aria-labelledby={title ? 'dialog-title' : undefined}
          className={`tap-dialog ${className}`}
          style={dialogStyles}
          onClick={e => e.stopPropagation()}
          {...rest}
        >
          {title && (
            <div className="tap-dialog-header&quot; style={headerStyles}>
              <Typography
                id="dialog-title"
                variant="h6&quot;
                component="h2"
                style={{ fontWeight: theme.typography.fontWeights.medium }}
              >
                {title}
              </Typography>
              <button aria-label="Close dialog" onClick={onClose} style={closeButtonStyles}>
                <svg
                  width="18&quot;
                  height="18"
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
            </div>
          )}

          <div className="tap-dialog-content" style={contentStyles}>
            {children}
          </div>

          {actions && (
            <div className="tap-dialog-actions&quot; style={footerStyles}>
              {actions}
            </div>
          )}
        </Box>
      </div>,
      document.body
    );
  }
);

Dialog.displayName = "Dialog';

Dialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
  actions: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  fullScreen: PropTypes.bool,
  disableBackdropClick: PropTypes.bool,
  disableEscapeKeyDown: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Dialog;
