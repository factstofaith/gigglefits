import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling"; /**
                                                                                      * Accessibility-Enhanced Dialog Component
                                                                                      * 
                                                                                      * A dialog component with enhanced accessibility features.
                                                                                      * Part of the zero technical debt accessibility implementation.
                                                                                      * 
                                                                                      * @module components/common/A11yDialog
                                                                                      */
import React, { forwardRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useA11yFocus, useA11yAnnouncement } from "@/hooks/a11y";

/**
 * Enhanced Dialog with built-in accessibility features
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when the dialog is closed
 * @param {React.ReactNode} props.title - Dialog title
 * @param {React.ReactNode} props.children - Dialog content
 * @param {React.ReactNode} [props.actions] - Dialog actions
 * @param {string} [props.a11yDescribedBy] - ID of the element that describes the dialog
 * @param {string} [props.a11yLabelledBy] - ID of the element that labels the dialog
 * @param {string} [props.a11yAnnouncement] - Message to announce when the dialog opens
 * @param {boolean} [props.fullWidth=false] - Whether the dialog should take up the full width
 * @param {string} [props.maxWidth='sm'] - Maximum width of the dialog
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} The enhanced dialog
 */
const A11yDialog = forwardRef(({
  // A11y props
  a11yDescribedBy,
  a11yLabelledBy,
  a11yAnnouncement,
  // Standard dialog props
  open,
  onClose,
  title,
  children,
  actions,
  fullWidth = false,
  maxWidth = 'sm',
  ...rest
}, ref) => {
  const dialogTitleId = a11yLabelledBy || 'a11y-dialog-title';
  const dialogDescriptionId = a11yDescribedBy || 'a11y-dialog-description';

  // Announcement hook for screen readers
  const {
    announcePolite
  } = useA11yAnnouncement();

  // Focus management hook
  const {
    containerRef
  } = useA11yFocus({
    trapFocus: true,
    restoreFocus: true,
    autoFocus: true
  });

  // Announce to screen readers when dialog opens
  useEffect(() => {
    if (open && a11yAnnouncement) {
      announcePolite(a11yAnnouncement);
    }
  }, [open, a11yAnnouncement, announcePolite]);
  return <Dialog ref={ref} open={open} onClose={onClose} aria-labelledby={dialogTitleId} aria-describedby={dialogDescriptionId} fullWidth={fullWidth} maxWidth={maxWidth}
  // Ensure proper focus trapping
  disableEnforceFocus={false} disableAutoFocus={false} disableRestoreFocus={false} {...rest}>

      {title && <DialogTitle id={dialogTitleId}>
          {typeof title === 'string' ? <Typography variant="h6" component="h2">
              {title}
            </Typography> : title}

          {onClose && <IconButton aria-label="Close dialog" onClick={onClose} sx={{
        position: 'absolute',
        right: 8,
        top: 8,
        color: 'grey.500'
      }}>

              <CloseIcon />
            </IconButton>}

        </DialogTitle>}

      
      <DialogContent id={dialogDescriptionId}>
        {children}
      </DialogContent>
      
      {actions && <DialogActions>
          {actions}
        </DialogActions>}

    </Dialog>;
});
A11yDialog.displayName = 'A11yDialog';
A11yDialog.propTypes = {
  // A11y props
  a11yDescribedBy: PropTypes.string,
  a11yLabelledBy: PropTypes.string,
  a11yAnnouncement: PropTypes.string,
  // Standard dialog props
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
  actions: PropTypes.node,
  fullWidth: PropTypes.bool,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false])
};
export default withErrorBoundary(A11yDialog, {
  boundary: 'A11yDialog'
});