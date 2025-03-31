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
import DatasetForm from './dataset_form';
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
 * DatasetFormDialog component
 * 
 * A dialog wrapper for the DatasetForm component,
 * handling loading states, errors, and dialog lifecycle.
 */
const DatasetFormDialog = ({
  open,
  onClose,
  onSubmit,
  dataset = null,
  applications = [],
  connections = [],
  isLoading = false,
  error = null,
  dialogTitle = '',
  availableRoles = [],
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
      trackEvent('dataset_form_submitted', {
        is_edit: Boolean(dataset),
        dataset_type: values.type,
        source_type: values.config?.source?.type,
      });
      onClose();
    } catch (error) {
      setSubmitError(error.message || 'Failed to save dataset');
      trackEvent('dataset_form_error', {
        is_edit: Boolean(dataset),
        error_message: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Determine dialog title based on context
  const title = dialogTitle || (dataset ? 'Edit Dataset' : 'Create Dataset');
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="dataset-form-dialog-title"
    >
      <DialogTitle id="dataset-form-dialog-title">
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
              {dataset ? 'Loading dataset data...' : 'Preparing form...'}
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
            
            <DatasetForm
              dataset={dataset}
              applications={applications}
              connections={connections}
              onSubmit={handleSubmit}
              onCancel={onClose}
              isSubmitting={isSubmitting}
              availableRoles={availableRoles}
            />
          </>
        )}
      </StyledDialogContent>
    </Dialog>
  );
};

DatasetFormDialog.propTypes = {
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
   * Dataset data for editing (null for creating a new dataset)
   */
  dataset: PropTypes.object,
  
  /**
   * Available applications to associate with the dataset
   */
  applications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  
  /**
   * Available connections for data sources
   */
  connections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    })
  ),
  
  /**
   * Whether the dataset data is loading
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
};

DatasetFormDialog.defaultProps = {
  applications: [],
  connections: [],
  availableRoles: [
    { id: 'admin', name: 'Administrator' },
    { id: 'power_user', name: 'Power User' },
    { id: 'standard_user', name: 'Standard User' },
    { id: 'read_only', name: 'Read Only' },
  ],
};

export default DatasetFormDialog;