/**
 * Integration Creation Dialog
 *
 * A dialog component for creating new integrations.
 *
 * @component
 */

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText, Box, Stepper, Step, StepLabel, Typography, Stack, Alert, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import ContextualHelp from '../common/ContextualHelp';
import { useContextualHelp } from "@/hooks";
import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling";

// Define steps for integration creation
const steps = ['Basic Information', 'Connection Settings', 'Schedule'];

// Validation schema for the form
const validationSchema = yup.object({
  name: yup.string().required('Name is required').min(3, 'Name should be at least 3 characters').max(50, 'Name should be at most 50 characters'),
  description: yup.string().max(200, 'Description should be at most 200 characters'),
  type: yup.string().required('Integration type is required')
});

/**
 * Integration types and their descriptions
 */
const INTEGRATION_TYPES = [{
  value: 'data_sync',
  label: 'Data Synchronization',
  description: 'Synchronize data between multiple systems'
}, {
  value: 'data_transformation',
  label: 'Data Transformation',
  description: 'Transform data from one format to another'
}, {
  value: 'data_validation',
  label: 'Data Validation',
  description: 'Validate data against business rules'
}, {
  value: 'data_migration',
  label: 'Data Migration',
  description: 'Migrate data from legacy systems to new platforms'
}];

/**
 * Integration Creation Dialog component
 */
const IntegrationCreationDialog = ({
  open,
  onClose,
  onSubmit
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const {
    getHelp
  } = useContextualHelp('integration');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error handling
  const {
    error,
    handleError,
    clearError,
    wrapPromise
  } = useErrorHandler('IntegrationCreationDialog');

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      type: '',
      scheduleType: 'manual',
      scheduleFrequency: ''
    },
    validationSchema,
    onSubmit: async values => {
      try {
        setIsSubmitting(true);
        // Wrap the submission in a promise to handle async errors
        await wrapPromise(new Promise((resolve, reject) => {
          // Simulate potential network delay or error
          setTimeout(() => {
            try {
              onSubmit(values);
              resolve();
            } catch (err) {
              reject(err);
            }
          }, 500);
        }), {
          formValues: values,
          context: 'form-submission'
        });

        // Success path
        formik.resetForm();
        setActiveStep(0);
        onClose();
      } catch (err) {
        // Error already handled by wrapPromise, but we can add more specific handling here
        handleError(err, {
          component: 'IntegrationCreationDialog',
          action: 'form-submission',
          values
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  // Handle step navigation
  const handleNext = useCallback(() => {
    try {
      // Validate current step before proceeding
      if (activeStep === 0) {
        const errors = {};
        if (!formik.values.name) errors.name = 'Name is required';
        if (formik.values.name && formik.values.name.length < 3) errors.name = 'Name should be at least 3 characters';
        if (formik.values.name && formik.values.name.length > 50) errors.name = 'Name should be at most 50 characters';
        if (!formik.values.type) errors.type = 'Integration type is required';
        if (formik.values.description && formik.values.description.length > 200) errors.description = 'Description should be at most 200 characters';
        if (Object.keys(errors).length > 0) {
          // Set the errors manually
          Object.keys(errors).forEach(field => {
            formik.setFieldError(field, errors[field]);
            formik.setFieldTouched(field, true, false);
          });
          return;
        }
      }
      setActiveStep(prevStep => prevStep + 1);
      clearError(); // Clear any previous errors when moving to next step
    } catch (err) {
      handleError(err, {
        step: activeStep,
        action: 'next-step'
      });
    }
  }, [activeStep, formik, clearError, handleError]);
  const handleBack = useCallback(() => {
    try {
      setActiveStep(prevStep => prevStep - 1);
      clearError(); // Clear any previous errors when moving to previous step
    } catch (err) {
      handleError(err, {
        step: activeStep,
        action: 'back-step'
      });
    }
  }, [activeStep, clearError, handleError]);
  const handleReset = useCallback(() => {
    try {
      formik.resetForm();
      setActiveStep(0);
      clearError();
    } catch (err) {
      handleError(err, {
        action: 'reset-form'
      });
    }
  }, [formik, clearError, handleError]);

  // Handle dialog close
  const handleClose = useCallback(() => {
    try {
      formik.resetForm();
      setActiveStep(0);
      clearError();
      onClose();
    } catch (err) {
      handleError(err, {
        action: 'close-dialog'
      });
    }
  }, [formik, clearError, handleError, onClose]);
  return <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" aria-labelledby="integration-creation-title">
      
      <DialogTitle id="integration-creation-title">
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" component="div">Create New Integration</Typography>
          <ContextualHelp id="integration-creation" title="Integration Creation" content={getHelp('creation')?.content || "Create a new integration by specifying its name, description, and type. An integration defines how data moves between systems."} type="tooltip" size="small" />
          
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        {error && <Alert severity="error" sx={{
        mb: 2
      }} onClose={clearError}>
          
            {error.message || 'An error occurred during integration creation'}
          </Alert>}
        
        
        <Box sx={{
        mb: 2
      }}>
          <Stepper activeStep={activeStep}>
            {steps.map(label => <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>)}
            
          </Stepper>
        </Box>
        
        <form onSubmit={formik.handleSubmit} id="integration-creation-form">
          {/* Step 1: Basic Information */}
          {activeStep === 0 && <Box>
              <TextField fullWidth margin="normal" id="name" name="name" label="Integration Name" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.name && Boolean(formik.errors.name)} helperText={formik.touched.name && formik.errors.name} disabled={isSubmitting} inputProps={{
            'aria-required': 'true',
            'aria-invalid': formik.touched.name && Boolean(formik.errors.name)
          }} />
            
              
              <TextField fullWidth margin="normal" id="description" name="description" label="Description" multiline rows={3} value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.description && Boolean(formik.errors.description)} helperText={formik.touched.description && formik.errors.description} disabled={isSubmitting} />
            
              
              <FormControl fullWidth margin="normal" error={formik.touched.type && Boolean(formik.errors.type)} disabled={isSubmitting}>
              
                <InputLabel id="type-label">Integration Type</InputLabel>
                <Select labelId="type-label" id="type" name="type" value={formik.values.type} onChange={formik.handleChange} onBlur={formik.handleBlur} label="Integration Type" inputProps={{
              'aria-required': 'true',
              'aria-invalid': formik.touched.type && Boolean(formik.errors.type)
            }}>
                
                  {INTEGRATION_TYPES.map(type => <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>)}
                
                </Select>
                {formik.touched.type && formik.errors.type && <FormHelperText>{formik.errors.type}</FormHelperText>}
              
              </FormControl>
              
              {formik.values.type && <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
                  <Typography variant="body2">
                    {INTEGRATION_TYPES.find(t => t.value === formik.values.type)?.description}
                  </Typography>
                </Box>}
            
            </Box>}
          
          
          {/* Step 2: Connection Settings */}
          {activeStep === 1 && <Box>
              <Typography variant="subtitle1" gutterBottom>
                Connection Settings
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                You'll configure the detailed connection settings in the Flow Designer after creating the integration.
              </Typography>
              
              <ContextualHelp id="connection-settings-info" title="Connection Configuration" content="The Flow Designer is where you'll build your integration workflow by connecting nodes together. You'll be able to configure source and destination systems, add transformation steps, and define how data flows between them." type="inline" icon="info" relatedLinks={[{
            label: "Take Flow Designer tour",
            onClick: () => console.log("Start flow designer tour")
          }, {
            label: "View connection types",
            onClick: () => console.log("Open connection types documentation")
          }]} />

            
              
              <Typography variant="body2" gutterBottom sx={{
            mt: 2
          }}>
                The Flow Designer will allow you to:
              </Typography>
              <ul>
                <li>Add source and destination nodes</li>
                <li>Configure transformation and filter operations</li>
                <li>Establish connections between nodes</li>
                <li>Validate and test your integration flow</li>
              </ul>
            </Box>}
          
          
          {/* Step 3: Schedule */}
          {activeStep === 2 && <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Typography variant="subtitle1">Schedule Configuration</Typography>
                <ContextualHelp id="schedule-config" title="Scheduling" content={getHelp('schedule')?.content || "Set up when your integration should run automatically. Supports one-time, recurring, and event-based schedules."} type="popover" size="small" relatedLinks={[{
              label: "View scheduling documentation",
              onClick: () => console.log("Open scheduling documentation")
            }, {
              label: "Take scheduling tour",
              onClick: () => console.log("Start scheduling tour")
            }]} />

              
              </Stack>
            
              <FormControl fullWidth margin="normal" disabled={isSubmitting}>
                <InputLabel id="schedule-type-label">Schedule Type</InputLabel>
                <Select labelId="schedule-type-label" id="scheduleType" name="scheduleType" value={formik.values.scheduleType} onChange={formik.handleChange} onBlur={formik.handleBlur} label="Schedule Type">
                
                  <MenuItem value="manual">Manual Execution</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="event_driven">Event Driven</MenuItem>
                </Select>
              </FormControl>
              
              {formik.values.scheduleType === 'scheduled' && <FormControl fullWidth margin="normal" disabled={isSubmitting}>
                  <InputLabel id="schedule-frequency-label">Frequency</InputLabel>
                  <Select labelId="schedule-frequency-label" id="scheduleFrequency" name="scheduleFrequency" value={formik.values.scheduleFrequency} onChange={formik.handleChange} onBlur={formik.handleBlur} label="Frequency">
                
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="custom">Custom (CRON)</MenuItem>
                  </Select>
                </FormControl>}
            
              
              {formik.values.scheduleType === 'event_driven' && <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
                  <Typography variant="body2">
                    Event-driven integrations will be triggered by external events such as webhook calls,
                    file uploads, or system notifications.
                  </Typography>
                </Box>}
            
            </Box>}
          
        </form>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          
          Cancel
        </Button>
        
        {activeStep > 0 && <Button onClick={handleBack} disabled={isSubmitting}>
          
            Back
          </Button>}
        
        
        {activeStep < steps.length - 1 && <Button onClick={handleNext} variant="contained" disabled={isSubmitting || activeStep === 0 && !(formik.values.name && formik.values.type && !formik.errors.name && !formik.errors.description)}>

          
            Next
          </Button>}
        
        
        {activeStep === steps.length - 1 && <Button onClick={() => formik.handleSubmit()} variant="contained" color="primary" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} /> : null}>
          
            {isSubmitting ? 'Creating...' : 'Create Integration'}
          </Button>}
        
      </DialogActions>
    </Dialog>;
};
IntegrationCreationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};
export default withErrorBoundary(IntegrationCreationDialog, {
  boundary: 'IntegrationCreationDialog',
  fallback: ({
    error,
    resetError
  }) => <Dialog open={true} maxWidth="md" fullWidth>
    
      <DialogTitle sx={{
      bgcolor: '#ffebee'
    }}>
        Error Creating Integration
      </DialogTitle>
      <DialogContent sx={{
      pb: 4,
      pt: 2
    }}>
        <Alert severity="error" sx={{
        mb: 2
      }}>
          {error?.message || 'An unexpected error occurred during integration creation.'}
        </Alert>
        <Typography variant="body2" color="text.secondary" paragraph>
          Please try again or contact system administrator if the problem persists.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={resetError}>Try Again</Button>
      </DialogActions>
    </Dialog>
});