/**
 * Integration Creation Dialog
 *
 * A dialog component for creating new integrations.
 *
 * @component
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Stack,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import ContextualHelp from '../common/ContextualHelp';
import { useContextualHelp } from '../../hooks';

// Define steps for integration creation
const steps = ['Basic Information', 'Connection Settings', 'Schedule'];

// Validation schema for the form
const validationSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(3, 'Name should be at least 3 characters')
    .max(50, 'Name should be at most 50 characters'),
  description: yup
    .string()
    .max(200, 'Description should be at most 200 characters'),
  type: yup
    .string()
    .required('Integration type is required'),
});

/**
 * Integration types and their descriptions
 */
const INTEGRATION_TYPES = [
  { 
    value: 'data_sync', 
    label: 'Data Synchronization', 
    description: 'Synchronize data between multiple systems' 
  },
  { 
    value: 'data_transformation', 
    label: 'Data Transformation', 
    description: 'Transform data from one format to another' 
  },
  { 
    value: 'data_validation', 
    label: 'Data Validation', 
    description: 'Validate data against business rules' 
  },
  { 
    value: 'data_migration', 
    label: 'Data Migration', 
    description: 'Migrate data from legacy systems to new platforms' 
  },
];

/**
 * Integration Creation Dialog component
 */
const IntegrationCreationDialog = ({ open, onClose, onSubmit }) => {
  const [activeStep, setActiveStep] = useState(0);
  const { getHelp } = useContextualHelp('integration');
  
  // Initialize formik
  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      type: '',
      scheduleType: 'manual',
      scheduleFrequency: '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
      formik.resetForm();
      setActiveStep(0);
      onClose();
    },
  });
  
  // Handle step navigation
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
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
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" component="div">Create New Integration</Typography>
          <ContextualHelp
            id="integration-creation"
            title="Integration Creation"
            content={getHelp('creation')?.content || "Create a new integration by specifying its name, description, and type. An integration defines how data moves between systems."}
            type="tooltip"
            size="small"
          />
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        <form onSubmit={formik.handleSubmit}>
          {/* Step 1: Basic Information */}
          {activeStep === 0 && (
            <Box>
              <TextField
                fullWidth
                margin="normal"
                id="name"
                name="name"
                label="Integration Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              
              <TextField
                fullWidth
                margin="normal"
                id="description"
                name="description"
                label="Description"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
              
              <FormControl 
                fullWidth 
                margin="normal"
                error={formik.touched.type && Boolean(formik.errors.type)}
              >
                <InputLabel id="type-label">Integration Type</InputLabel>
                <Select
                  labelId="type-label"
                  id="type"
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  label="Integration Type"
                >
                  {INTEGRATION_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.type && formik.errors.type && (
                  <FormHelperText>{formik.errors.type}</FormHelperText>
                )}
              </FormControl>
              
              {formik.values.type && (
                <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
                  <Typography variant="body2">
                    {INTEGRATION_TYPES.find(t => t.value === formik.values.type)?.description}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          
          {/* Step 2: Connection Settings */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Connection Settings
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                You'll configure the detailed connection settings in the Flow Designer after creating the integration.
              </Typography>
              
              <ContextualHelp
                id="connection-settings-info"
                title="Connection Configuration"
                content="The Flow Designer is where you'll build your integration workflow by connecting nodes together. You'll be able to configure source and destination systems, add transformation steps, and define how data flows between them."
                type="inline"
                icon="info"
                relatedLinks={[
                  { 
                    label: "Take Flow Designer tour", 
                    onClick: () => console.log("Start flow designer tour") 
                  },
                  { 
                    label: "View connection types", 
                    onClick: () => console.log("Open connection types documentation") 
                  }
                ]}
              />
              
              <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                The Flow Designer will allow you to:
              </Typography>
              <ul>
                <li>Add source and destination nodes</li>
                <li>Configure transformation and filter operations</li>
                <li>Establish connections between nodes</li>
                <li>Validate and test your integration flow</li>
              </ul>
            </Box>
          )}
          
          {/* Step 3: Schedule */}
          {activeStep === 2 && (
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Typography variant="subtitle1">Schedule Configuration</Typography>
                <ContextualHelp
                  id="schedule-config"
                  title="Scheduling"
                  content={getHelp('schedule')?.content || "Set up when your integration should run automatically. Supports one-time, recurring, and event-based schedules."}
                  type="popover"
                  size="small"
                  relatedLinks={[
                    { 
                      label: "View scheduling documentation", 
                      onClick: () => console.log("Open scheduling documentation") 
                    },
                    { 
                      label: "Take scheduling tour", 
                      onClick: () => console.log("Start scheduling tour") 
                    }
                  ]}
                />
              </Stack>
            
              <FormControl fullWidth margin="normal">
                <InputLabel id="schedule-type-label">Schedule Type</InputLabel>
                <Select
                  labelId="schedule-type-label"
                  id="scheduleType"
                  name="scheduleType"
                  value={formik.values.scheduleType}
                  onChange={formik.handleChange}
                  label="Schedule Type"
                >
                  <MenuItem value="manual">Manual Execution</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="event_driven">Event Driven</MenuItem>
                </Select>
              </FormControl>
              
              {formik.values.scheduleType === 'scheduled' && (
                <FormControl fullWidth margin="normal">
                  <InputLabel id="schedule-frequency-label">Frequency</InputLabel>
                  <Select
                    labelId="schedule-frequency-label"
                    id="scheduleFrequency"
                    name="scheduleFrequency"
                    value={formik.values.scheduleFrequency}
                    onChange={formik.handleChange}
                    label="Frequency"
                  >
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="custom">Custom (CRON)</MenuItem>
                  </Select>
                </FormControl>
              )}
              
              {formik.values.scheduleType === 'event_driven' && (
                <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
                  <Typography variant="body2">
                    Event-driven integrations will be triggered by external events such as webhook calls,
                    file uploads, or system notifications.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </form>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        
        {activeStep > 0 && (
          <Button onClick={handleBack}>Back</Button>
        )}
        
        {activeStep < steps.length - 1 && (
          <Button 
            onClick={handleNext}
            variant="contained"
            disabled={
              (activeStep === 0 && !(formik.values.name && formik.values.type && !formik.errors.name && !formik.errors.description))
            }
          >
            Next
          </Button>
        )}
        
        {activeStep === steps.length - 1 && (
          <Button 
            onClick={() => formik.handleSubmit()}
            variant="contained"
            color="primary"
          >
            Create Integration
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

IntegrationCreationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default IntegrationCreationDialog;