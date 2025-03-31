import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
  Grid,
  Divider,
  Switch,
  FormControlLabel,
  IconButton,
  CircularProgress,
  Chip,
  Alert,
  Autocomplete,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Close as CloseIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

// Styled components
const StepContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 0, 4),
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

/**
 * ApplicationCreationDialog component
 * 
 * A multi-step dialog for creating new applications with comprehensive
 * validation and configuration options.
 */
const ApplicationCreationDialog = ({ open, onClose, onSubmit, tenant }) => {
  // State for stepper
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Stepper steps
  const steps = ['Basic Information', 'Configuration', 'Permissions'];
  
  // Available application types
  const applicationTypes = [
    { id: 'api_integration', name: 'API Integration', description: 'Connect to external APIs and services' },
    { id: 'data_transformation', name: 'Data Transformation', description: 'Transform and map data between formats' },
    { id: 'etl_process', name: 'ETL Process', description: 'Extract, transform and load data workflows' },
    { id: 'reporting', name: 'Reporting', description: 'Generate reports and visualizations' },
    { id: 'analytics', name: 'Analytics', description: 'Perform data analysis and insights' },
    { id: 'custom', name: 'Custom', description: 'Create a custom application type' },
  ];
  
  // User roles for permission assignment
  const availableRoles = [
    { id: 'admin', name: 'Administrator' },
    { id: 'power_user', name: 'Power User' },
    { id: 'standard_user', name: 'Standard User' },
    { id: 'read_only', name: 'Read Only' },
  ];
  
  // Tags for application categorization
  const suggestedTags = [
    'Integration', 'ETL', 'Data', 'Analysis', 'Reporting', 'API', 
    'Finance', 'HR', 'Sales', 'Marketing', 'Operations', 'Production',
    'Development', 'Testing', 'Production'
  ];
  
  // Form validation schema
  const validationSchema = Yup.object({
    // Step 1: Basic Information
    name: Yup.string()
      .required('Application name is required')
      .min(3, 'Name must be at least 3 characters')
      .max(50, 'Name must be less than 50 characters'),
    description: Yup.string()
      .max(200, 'Description must be less than 200 characters'),
    type: Yup.string()
      .required('Application type is required'),
    
    // Step 2: Configuration
    config: Yup.object({
      autoPublish: Yup.boolean(),
      requireApproval: Yup.boolean(),
      executionMode: Yup.string()
        .required('Execution mode is required'),
      maxConcurrentRuns: Yup.number()
        .when('executionMode', {
          is: 'parallel',
          then: Yup.number()
            .required('Required for parallel execution')
            .min(1, 'Must be at least 1')
            .max(10, 'Must be at most 10'),
          otherwise: Yup.number().nullable(),
        }),
    }),
    
    // Step 3: Permissions
    permissions: Yup.object({
      visibleToAllUsers: Yup.boolean(),
      specificRoles: Yup.array().when('visibleToAllUsers', {
        is: false,
        then: Yup.array()
          .min(1, 'At least one role must be selected')
          .required('Required when not visible to all users'),
        otherwise: Yup.array().nullable(),
      }),
    }),
    
    // Additional fields
    tags: Yup.array()
      .max(10, 'Maximum 10 tags allowed'),
  });
  
  // Initialize form with Formik
  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      type: '',
      config: {
        autoPublish: false,
        requireApproval: true,
        executionMode: 'sequential',
        maxConcurrentRuns: 1,
      },
      permissions: {
        visibleToAllUsers: true,
        specificRoles: [],
      },
      tags: [],
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // Format the data for API submission
        const applicationData = {
          ...values,
          tenant_id: tenant?.id,
          status: values.config.autoPublish ? 'active' : 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        await onSubmit(applicationData);
        handleClose();
      } catch (error) {
        console.error("Failed to create application:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });
  
  // Handle step navigation
  const handleNext = async () => {
    // Validate current step before proceeding
    const currentStepFields = {
      0: ['name', 'description', 'type'],
      1: ['config.executionMode', 'config.maxConcurrentRuns'],
      2: ['permissions.visibleToAllUsers'],
    };
    
    const fieldsToValidate = currentStepFields[activeStep];
    const stepIsValid = await validateFields(fieldsToValidate);
    
    if (stepIsValid) {
      if (activeStep === steps.length - 1) {
        // Last step - submit the form
        formik.handleSubmit();
      } else {
        // Move to next step
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    }
  };
  
  // Validate specific fields
  const validateFields = async (fields) => {
    try {
      await formik.validateForm();
      
      // Check if any of the specified fields have errors
      const hasErrors = fields.some(field => {
        const fieldError = getNestedFieldError(formik.errors, field);
        const fieldTouched = getNestedFieldTouched(formik.touched, field);
        return fieldError && fieldTouched;
      });
      
      // If fields haven't been touched, touch them to show validation errors
      fields.forEach(field => {
        const fieldPath = field.split('.');
        if (fieldPath.length === 1) {
          formik.setFieldTouched(field, true);
        } else {
          // Handle nested fields
          let touchedObj = {...formik.touched};
          let current = touchedObj;
          
          for (let i = 0; i < fieldPath.length - 1; i++) {
            const key = fieldPath[i];
            if (!current[key]) current[key] = {};
            current = current[key];
          }
          
          current[fieldPath[fieldPath.length - 1]] = true;
          formik.setTouched(touchedObj);
        }
      });
      
      return !hasErrors;
    } catch (error) {
      return false;
    }
  };
  
  // Helper function to get nested field errors
  const getNestedFieldError = (errors, field) => {
    const fieldPath = field.split('.');
    let current = errors;
    
    for (const path of fieldPath) {
      if (!current || !current[path]) return undefined;
      current = current[path];
    }
    
    return current;
  };
  
  // Helper function to check if nested field is touched
  const getNestedFieldTouched = (touched, field) => {
    const fieldPath = field.split('.');
    let current = touched;
    
    for (const path of fieldPath) {
      if (!current || !current[path]) return false;
      current = current[path];
    }
    
    return current;
  };
  
  // Handle step back
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Handle dialog close
  const handleClose = () => {
    formik.resetForm();
    setActiveStep(0);
    onClose();
  };
  
  // Determine if current step is valid
  const isStepValid = () => {
    const currentStepFields = {
      0: ['name', 'type'],
      1: ['config.executionMode'],
      2: [],
    };
    
    const fieldsToCheck = currentStepFields[activeStep];
    
    // If no fields to check, step is valid
    if (fieldsToCheck.length === 0) return true;
    
    // Check if any field has an error or is empty
    return !fieldsToCheck.some(field => {
      const fieldPath = field.split('.');
      let value = formik.values;
      
      for (const path of fieldPath) {
        if (!value || value[path] === undefined) return true;
        value = value[path];
      }
      
      return getNestedFieldError(formik.errors, field) !== undefined;
    });
  };
  
  // Render form step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <StepContent>
            <FormSection>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Application Name"
                variant="outlined"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                placeholder="Enter a descriptive name for your application"
                required
              />
            </FormSection>
            
            <FormSection>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                variant="outlined"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                placeholder="Briefly describe the purpose of this application"
                multiline
                rows={3}
              />
            </FormSection>
            
            <FormSection>
              <FormControl 
                fullWidth
                error={formik.touched.type && Boolean(formik.errors.type)}
                required
              >
                <InputLabel id="application-type-label">Application Type</InputLabel>
                <Select
                  labelId="application-type-label"
                  id="type"
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Application Type"
                >
                  {applicationTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      <Box>
                        <Typography variant="subtitle2">{type.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {type.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.type && formik.errors.type && (
                  <FormHelperText>{formik.errors.type}</FormHelperText>
                )}
              </FormControl>
            </FormSection>
            
            <FormSection>
              <Autocomplete
                multiple
                id="tags"
                options={suggestedTags}
                value={formik.values.tags}
                freeSolo
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      size="small"
                    />
                  ))
                }
                onChange={(event, newValue) => {
                  formik.setFieldValue('tags', newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Add tags"
                    helperText="Tags help categorize and find your application"
                  />
                )}
              />
            </FormSection>
          </StepContent>
        );
        
      case 1:
        return (
          <StepContent>
            <FormSection>
              <Typography variant="subtitle1" gutterBottom>
                Execution Configuration
              </Typography>
              
              <FormControl
                fullWidth
                error={
                  formik.touched.config?.executionMode && 
                  Boolean(formik.errors.config?.executionMode)
                }
                sx={{ mb: 3 }}
                required
              >
                <InputLabel id="execution-mode-label">Execution Mode</InputLabel>
                <Select
                  labelId="execution-mode-label"
                  id="config.executionMode"
                  name="config.executionMode"
                  value={formik.values.config.executionMode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Execution Mode"
                >
                  <MenuItem value="sequential">Sequential</MenuItem>
                  <MenuItem value="parallel">Parallel</MenuItem>
                  <MenuItem value="event_driven">Event Driven</MenuItem>
                </Select>
                {formik.touched.config?.executionMode && formik.errors.config?.executionMode && (
                  <FormHelperText>{formik.errors.config.executionMode}</FormHelperText>
                )}
              </FormControl>
              
              {formik.values.config.executionMode === 'parallel' && (
                <TextField
                  fullWidth
                  id="config.maxConcurrentRuns"
                  name="config.maxConcurrentRuns"
                  label="Maximum Concurrent Runs"
                  type="number"
                  variant="outlined"
                  value={formik.values.config.maxConcurrentRuns}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.config?.maxConcurrentRuns && 
                    Boolean(formik.errors.config?.maxConcurrentRuns)
                  }
                  helperText={
                    formik.touched.config?.maxConcurrentRuns && 
                    formik.errors.config?.maxConcurrentRuns
                  }
                  InputProps={{ inputProps: { min: 1, max: 10 } }}
                  sx={{ mb: 2 }}
                  required
                />
              )}
            </FormSection>
            
            <Divider sx={{ my: 3 }} />
            
            <FormSection>
              <Typography variant="subtitle1" gutterBottom>
                Publication Settings
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        id="config.autoPublish"
                        name="config.autoPublish"
                        checked={formik.values.config.autoPublish}
                        onChange={formik.handleChange}
                      />
                    }
                    label="Auto-publish application"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    If enabled, the application will be immediately available after creation
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        id="config.requireApproval"
                        name="config.requireApproval"
                        checked={formik.values.config.requireApproval}
                        onChange={formik.handleChange}
                        disabled={!formik.values.config.autoPublish}
                      />
                    }
                    label="Require approval before publishing"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    If enabled, an administrator must approve the application before it's published
                  </Typography>
                </Grid>
              </Grid>
            </FormSection>
          </StepContent>
        );
        
      case 2:
        return (
          <StepContent>
            <FormSection>
              <Typography variant="subtitle1" gutterBottom>
                Visibility Settings
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    id="permissions.visibleToAllUsers"
                    name="permissions.visibleToAllUsers"
                    checked={formik.values.permissions.visibleToAllUsers}
                    onChange={formik.handleChange}
                  />
                }
                label="Visible to all users"
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                If disabled, you can restrict visibility to specific roles
              </Typography>
              
              {!formik.values.permissions.visibleToAllUsers && (
                <FormControl 
                  fullWidth
                  error={
                    formik.touched.permissions?.specificRoles && 
                    Boolean(formik.errors.permissions?.specificRoles)
                  }
                >
                  <InputLabel id="specific-roles-label">Visible to Roles</InputLabel>
                  <Select
                    labelId="specific-roles-label"
                    id="permissions.specificRoles"
                    name="permissions.specificRoles"
                    multiple
                    value={formik.values.permissions.specificRoles}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Visible to Roles"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const role = availableRoles.find(r => r.id === value);
                          return (
                            <Chip key={value} label={role ? role.name : value} size="small" />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {availableRoles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.permissions?.specificRoles && formik.errors.permissions?.specificRoles && (
                    <FormHelperText>{formik.errors.permissions.specificRoles}</FormHelperText>
                  )}
                </FormControl>
              )}
            </FormSection>
            
            <Divider sx={{ my: 3 }} />
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <AlertTitle>Ready to Create</AlertTitle>
              Review your application details before creating. You'll be able to modify these settings later.
            </Alert>
          </StepContent>
        );
        
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="application-creation-dialog-title"
    >
      <DialogTitle id="application-creation-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            Create New Application
          </Typography>
          <IconButton edge="end" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {renderStepContent(activeStep)}
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={handleClose}
          color="inherit"
        >
          Cancel
        </Button>
        
        <Box sx={{ flex: '1 1 auto' }} />
        
        {activeStep > 0 && (
          <Button onClick={handleBack}>
            Back
          </Button>
        )}
        
        <Button 
          onClick={handleNext}
          variant="contained"
          disabled={isSubmitting || !isStepValid()}
        >
          {activeStep === steps.length - 1 ? (
            isSubmitting ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Creating...
              </>
            ) : (
              'Create Application'
            )
          ) : (
            'Next'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ApplicationCreationDialog.propTypes = {
  /**
   * Whether the dialog is open
   */
  open: PropTypes.bool.isRequired,
  
  /**
   * Callback function called when the dialog is closed
   */
  onClose: PropTypes.func.isRequired,
  
  /**
   * Callback function called when the form is submitted
   * @param {Object} applicationData - The application data to be created
   * @returns {Promise} Promise resolving when the application is created
   */
  onSubmit: PropTypes.func.isRequired,
  
  /**
   * The tenant object for which the application is being created
   */
  tenant: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
};

export default ApplicationCreationDialog;