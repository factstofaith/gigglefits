import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Close as CloseIcon,
} from '@mui/icons-material';
import ApplicationForm from './application_form';
import { trackEvent } from './analytics_service';

// Styled components
const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  textAlign: 'center',
}));

/**
 * ApplicationFormDialog component
 * 
 * A dialog wrapper for the ApplicationForm component,
 * handling loading states, errors, and dialog lifecycle.
 */
const ApplicationFormDialog = ({
  open,
  onClose,
  onSubmit,
  application = null,
  isLoading = false,
  error = null,
  dialogTitle = '',
  availableRoles = [],
  availableTimeZones = [],
}) => {
  // Local state for submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Clear submission state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setIsSubmitting(false);
      setSubmitError(null);
    }
  }, [open]);
  
  // Handle form submission
  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      await onSubmit(values);
      trackEvent('application_form_submitted', {
        is_edit: Boolean(application),
        application_type: values.type,
      });
      onClose();
    } catch (error) {
      setSubmitError(error.message || 'Failed to save application');
      trackEvent('application_form_error', {
        is_edit: Boolean(application),
        error_message: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Determine dialog title based on context
  const title = dialogTitle || (application ? 'Edit Application' : 'Create Application');
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="application-form-dialog-title"
    >
      <DialogTitle id="application-form-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">{title}</Typography>
          <IconButton
            edge="end"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <StyledDialogContent>
        {isLoading ? (
          <LoadingContainer>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1">
              {application ? 'Loading application data...' : 'Preparing form...'}
            </Typography>
          </LoadingContainer>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : (
          <>
            {submitError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {submitError}
              </Alert>
            )}
            
            <ApplicationForm
              application={application}
              onSubmit={handleSubmit}
              onCancel={onClose}
              isSubmitting={isSubmitting}
              availableRoles={availableRoles}
              availableTimeZones={availableTimeZones}
            />
          </>
        )}
      </StyledDialogContent>
    </Dialog>
  );
};

ApplicationFormDialog.propTypes = {
  /**
   * Whether the dialog is open
   */
  open: PropTypes.bool.isRequired,
  
  /**
   * Callback function when the dialog is closed
   */
  onClose: PropTypes.func.isRequired,
  
  /**
   * Callback function when the form is submitted
   */
  onSubmit: PropTypes.func.isRequired,
  
  /**
   * Application data for editing (null for creating a new application)
   */
  application: PropTypes.object,
  
  /**
   * Whether the application data is loading
   */
  isLoading: PropTypes.bool,
  
  /**
   * Error message to display
   */
  error: PropTypes.string,
  
  /**
   * Custom dialog title
   */
  dialogTitle: PropTypes.string,
  
  /**
   * Available roles for role-based permissions
   */
  availableRoles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  
  /**
   * Available timezones for scheduling
   */
  availableTimeZones: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
};

export default ApplicationFormDialog;