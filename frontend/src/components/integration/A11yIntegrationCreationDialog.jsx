/**
 * Accessibility-Enhanced Integration Creation Dialog
 *
 * A dialog component for creating new integrations with enhanced accessibility.
 * Part of the zero technical debt accessibility implementation.
 *
 * @component
 */

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText, Box, Stepper, Step, StepLabel, Typography, Stack } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import ContextualHelp from '../common/ContextualHelp';
import { useContextualHelp } from "@/hooks";
import { useA11yFocus, useA11yAnnouncement, useA11yKeyboard } from "@/hooks/a11y";
import A11yDialog from '../common/A11yDialog';
import A11yButton from '../common/A11yButton';
import { getFormFieldAttributes } from "@/utils/a11y/ariaAttributeHelper";

// Define steps for integration creation
import { withErrorBoundary } from "@/error-handling/withErrorBoundary";
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
 * Accessibility-Enhanced Integration Creation Dialog component
 */
const A11yIntegrationCreationDialog = ({
  open,
  onClose,
  onSubmit
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const {
    getHelp
  } = useContextualHelp('integration');
  const stepperRef = useRef(null);
  const formRef = useRef(null);

  // A11y hooks
  const {
    announcePolite,
    announceAssertive
  } = useA11yAnnouncement();
  const {
    registerKeyHandler
  } = useA11yKeyboard();

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
    onSubmit: values => {
      onSubmit(values);
      formik.resetForm();
      setActiveStep(0);
      announcePolite('Integration created successfully');
      onClose();
    }
  });

  // Announce active step when it changes
  useEffect(() => {
    if (open) {
      announcePolite(`Step ${activeStep + 1} of ${steps.length}: ${steps[activeStep]}`);
    }
  }, [activeStep, open]);

  // Register keyboard handlers for navigation
  useEffect(() => {
    if (!open) return;
    const handlePrevStep = e => {
      if (activeStep > 0) {
        e.preventDefault();
        handleBack();
      }
    };
    const handleNextStep = e => {
      if (activeStep < steps.length - 1) {
        e.preventDefault();
        // Only proceed if current step is valid
        if (activeStep === 0 && formik.values.name && formik.values.type && !formik.errors.name && !formik.errors.description) {
          handleNext();
        } else if (activeStep > 0) {
          handleNext();
        }
      }
    };
    const cleanup = registerKeyHandler({
      'Alt+ArrowLeft': handlePrevStep,
      'Alt+ArrowRight': handleNextStep,
      'Escape': () => onClose()
    });

    // Announce keyboard shortcuts when dialog opens
    announcePolite('Use Alt+Left Arrow and Alt+Right Arrow to navigate between steps');
    return cleanup;
  }, [open, activeStep, formik.values, formik.errors]);

  // Handle step navigation
  const handleNext = () => {
    setActiveStep(prevStep => prevStep + 1);
  };
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  const handleReset = () => {
    formik.resetForm();
    setActiveStep(0);
  };

  // Handle dialog close
  const handleClose = () => {
    formik.resetForm();
    setActiveStep(0);
    onClose();
  };

  // A11y error announcement
  const announceFormErrors = () => {
    const errors = formik.errors;
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      const errorCount = Object.keys(errors).length;
      const errorMessage = `Form has ${errorCount} ${errorCount === 1 ? 'error' : 'errors'}. ${Object.values(errors).join('. ')}`;
      announceAssertive(errorMessage);
      return false;
    }
    return true;
  };

  // ARIA attributes for form fields
  const getFieldAttributes = (fieldName, label) => {
    return getFormFieldAttributes({
      label,
      required: fieldName === 'name' || fieldName === 'type',
      invalid: formik.touched[fieldName] && Boolean(formik.errors[fieldName]),
      errorId: formik.touched[fieldName] && formik.errors[fieldName] ? `${fieldName}-error` : undefined
    });
  };

  // Generate dialog title with accessibility
  const dialogTitle = <Stack direction="row" alignItems="center" spacing={1}>
      <Typography variant="h6" component="h2" id="integration-creation-title">Create New Integration</Typography>
      <ContextualHelp id="integration-creation" title="Integration Creation" content={getHelp('creation')?.content || "Create a new integration by specifying its name, description, and type. An integration defines how data moves between systems."} type="tooltip" size="small" />

    </Stack>;

  // Generate dialog actions with A11y buttons
  const dialogActions = <>
      <A11yButton onClick={handleClose} a11yLabel="Cancel integration creation" a11yAnnouncement="Cancelling integration creation">

        Cancel
      </A11yButton>
      
      {activeStep > 0 && <A11yButton onClick={handleBack} a11yLabel="Go back to previous step" a11yAnnouncement={`Going back to ${steps[activeStep - 1]}`}>

          Back
        </A11yButton>}

      
      {activeStep < steps.length - 1 && <A11yButton onClick={handleNext} variant="contained" disabled={activeStep === 0 && !(formik.values.name && formik.values.type && !formik.errors.name && !formik.errors.description)} a11yLabel="Continue to next step" a11yAnnouncement={activeStep === 0 && !(formik.values.name && formik.values.type && !formik.errors.name && !formik.errors.description) ? "Form has errors that need to be fixed before continuing" : `Continue to ${steps[activeStep + 1]}`}>


          Next
        </A11yButton>}

      
      {activeStep === steps.length - 1 && <A11yButton onClick={() => {
      if (announceFormErrors()) {
        formik.handleSubmit();
      }
    }} variant="contained" color="primary" a11yLabel="Create integration" a11yAnnouncement="Integration created successfully">

          Create Integration
        </A11yButton>}

    </>;
  return <A11yDialog open={open} onClose={handleClose} title={dialogTitle} actions={dialogActions} fullWidth maxWidth="md" a11yLabelledBy="integration-creation-title" a11yDescribedBy="integration-dialog-description" a11yAnnouncement="Integration creation dialog opened">

      <Box id="integration-dialog-description" sx={{
      mb: 2
    }}>
        <Stepper activeStep={activeStep} ref={stepperRef}>
          {steps.map((label, index) => <Step key={label}>
              <StepLabel id={`step-${index}`} aria-current={activeStep === index ? 'step' : undefined}>

                {label}
              </StepLabel>
            </Step>)}

        </Stepper>
      </Box>
      
      <form onSubmit={formik.handleSubmit} ref={formRef} noValidate>
        {/* Step 1: Basic Information */}
        {activeStep === 0 && <Box>
            <TextField fullWidth margin="normal" id="name" name="name" label="Integration Name" value={formik.values.name} onChange={formik.handleChange} error={formik.touched.name && Boolean(formik.errors.name)} helperText={formik.touched.name && formik.errors.name} aria-required="true" {...getFieldAttributes('name', 'Integration Name')} />

            
            <TextField fullWidth margin="normal" id="description" name="description" label="Description" multiline rows={3} value={formik.values.description} onChange={formik.handleChange} error={formik.touched.description && Boolean(formik.errors.description)} helperText={formik.touched.description && formik.errors.description} {...getFieldAttributes('description', 'Description')} />

            
            <FormControl fullWidth margin="normal" error={formik.touched.type && Boolean(formik.errors.type)}>

              <InputLabel id="type-label">Integration Type</InputLabel>
              <Select labelId="type-label" id="type" name="type" value={formik.values.type} onChange={e => {
            formik.handleChange(e);
            const selectedType = INTEGRATION_TYPES.find(t => t.value === e.target.value);
            if (selectedType) {
              announcePolite(`Selected type: ${selectedType.label}. ${selectedType.description}`);
            }
          }} label="Integration Type" aria-required="true" {...getFieldAttributes('type', 'Integration Type')}>

                {INTEGRATION_TYPES.map(type => <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>)}

              </Select>
              {formik.touched.type && formik.errors.type && <FormHelperText id="type-error">{formik.errors.type}</FormHelperText>}

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
            <ul aria-label="Flow Designer capabilities">
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
          
            <FormControl fullWidth margin="normal">
              <InputLabel id="schedule-type-label">Schedule Type</InputLabel>
              <Select labelId="schedule-type-label" id="scheduleType" name="scheduleType" value={formik.values.scheduleType} onChange={e => {
            formik.handleChange(e);
            const value = e.target.value;
            let message = `Selected schedule type: ${value}`;
            if (value === 'manual') {
              message += '. You will need to manually trigger this integration.';
            } else if (value === 'event_driven') {
              message += '. This integration will be triggered by external events.';
            } else {
              message += '. You can select how frequently this integration will run.';
            }
            announcePolite(message);
          }} label="Schedule Type" {...getFieldAttributes('scheduleType', 'Schedule Type')}>

                <MenuItem value="manual">Manual Execution</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="event_driven">Event Driven</MenuItem>
              </Select>
            </FormControl>
            
            {formik.values.scheduleType === 'scheduled' && <FormControl fullWidth margin="normal">
                <InputLabel id="schedule-frequency-label">Frequency</InputLabel>
                <Select labelId="schedule-frequency-label" id="scheduleFrequency" name="scheduleFrequency" value={formik.values.scheduleFrequency} onChange={e => {
            formik.handleChange(e);
            announcePolite(`Selected frequency: ${e.target.value}`);
          }} label="Frequency" {...getFieldAttributes('scheduleFrequency', 'Frequency')}>

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
    </A11yDialog>;
};
A11yIntegrationCreationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};
export default A11yIntegrationCreationDialog;