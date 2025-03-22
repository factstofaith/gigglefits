// IntegrationCreationDialog.jsx
// -----------------------------------------------------------------------------
// Dialog for creating a new integration, including source/destination selection

import React, { useState, useEffect } from 'react';
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
  Grid,
  CircularProgress,
  Divider,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';

// Import services
import { 
  getAvailableSources, 
  getAvailableDestinations 
} from '../../services/integrationService';
import authService from '../../services/authService';

// Import configuration components
import AzureBlobConfiguration from './AzureBlobConfiguration';
import ScheduleConfiguration from './ScheduleConfiguration';

export default function IntegrationCreationDialog({ open, onClose, onCreate }) {
  const [integrationData, setIntegrationData] = useState({
    name: '',
    type: 'API-based',
    source: '',
    destination: '',
    schedule: { type: 'onDemand' },
    azureBlobConfig: {},
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [sources, setSources] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState({
    sources: false,
    destinations: false
  });

  // Options for different fields
  const typeOptions = ['API-based', 'File-based', 'Database'];

  // Check if user is a super user
  useEffect(() => {
    const checkUserRole = async () => {
      const isAdmin = await authService.isAdmin();
      setIsSuperUser(isAdmin);
    };
    
    checkUserRole();
  }, []);

  // Fetch sources and destinations when integration type changes
  useEffect(() => {
    if (open) {
      fetchSources(integrationData.type);
      fetchDestinations(integrationData.type);
    }
  }, [integrationData.type, open]);

  const fetchSources = async (type) => {
    try {
      setLoading(prev => ({ ...prev, sources: true }));
      const data = await getAvailableSources(type);
      setSources(data || []);
    } catch (error) {
      console.error('Error fetching sources:', error);
      // Fallback to empty array if error
      setSources([]);
    } finally {
      setLoading(prev => ({ ...prev, sources: false }));
    }
  };

  const fetchDestinations = async (type) => {
    try {
      setLoading(prev => ({ ...prev, destinations: true }));
      const data = await getAvailableDestinations(type);
      setDestinations(data || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      // Fallback to empty array if error
      setDestinations([]);
    } finally {
      setLoading(prev => ({ ...prev, destinations: false }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If type changed, reset source and destination
    if (name === 'type') {
      setIntegrationData(prev => ({
        ...prev,
        [name]: value,
        source: '',
        destination: ''
      }));
    } else {
      setIntegrationData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Handle changes to blob storage configuration
  const handleBlobConfigChange = (config) => {
    setIntegrationData(prev => ({
      ...prev,
      azureBlobConfig: config
    }));
    
    // Clear blob config errors
    if (errors.azureBlobConfig) {
      setErrors(prev => ({
        ...prev,
        azureBlobConfig: null
      }));
    }
  };
  
  // Handle changes to schedule configuration
  const handleScheduleChange = (schedule) => {
    setIntegrationData(prev => ({
      ...prev,
      schedule
    }));
    
    // Clear schedule errors
    if (errors.schedule) {
      setErrors(prev => ({
        ...prev,
        schedule: null
      }));
    }
  };

  const handleClose = () => {
    // Reset form state
    setIntegrationData({
      name: '',
      type: 'API-based',
      source: '',
      destination: '',
      schedule: { type: 'onDemand' },
      azureBlobConfig: {},
      description: ''
    });
    setErrors({});
    setActiveStep(0);
    onClose();
  };

  const validate = () => {
    const newErrors = {};
    
    if (!integrationData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!integrationData.source) {
      newErrors.source = 'Source is required';
    }
    
    if (!integrationData.destination) {
      newErrors.destination = 'Destination is required';
    }
    
    // Validate Azure Blob configuration when selected
    if (integrationData.source === 'Azure Blob Container' || 
        integrationData.destination === 'Azure Blob Container') {
      
      const blobConfig = integrationData.azureBlobConfig;
      const blobErrors = {};
      
      if (!blobConfig.containerName) {
        blobErrors.containerName = 'Container name is required';
      }
      
      if (isSuperUser) {
        // Validation for authentication fields that only super users can configure
        if (blobConfig.authMethod === 'connectionString' && !blobConfig.connectionString) {
          blobErrors.connectionString = 'Connection string is required';
        }
        
        if (blobConfig.authMethod === 'accountKey') {
          if (!blobConfig.accountName) {
            blobErrors.accountName = 'Account name is required';
          }
          if (!blobConfig.accountKey) {
            blobErrors.accountKey = 'Account key is required';
          }
        }
        
        if (blobConfig.authMethod === 'sasToken') {
          if (!blobConfig.accountName) {
            blobErrors.accountName = 'Account name is required';
          }
          if (!blobConfig.sasToken) {
            blobErrors.sasToken = 'SAS token is required';
          }
        }
      }
      
      if (Object.keys(blobErrors).length > 0) {
        newErrors.azureBlobConfig = blobErrors;
      }
    }
    
    // Validate schedule when not on-demand
    if (integrationData.schedule?.type !== 'onDemand') {
      const scheduleErrors = {};
      
      if (integrationData.schedule.type === 'custom' && !integrationData.schedule.cronExpression) {
        scheduleErrors.cronExpression = 'Cron expression is required for custom schedules';
      }
      
      if (Object.keys(scheduleErrors).length > 0) {
        newErrors.schedule = scheduleErrors;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (validate()) {
      onCreate(integrationData);
    }
  };
  
  // Handle step navigation
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Check if source or destination is Azure Blob
  const isAzureBlobSelected = 
    integrationData.source === 'Azure Blob Container' ||
    integrationData.destination === 'Azure Blob Container';
  
  // Define the steps for the stepper
  const steps = [
    {
      label: 'Basic Information',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Integration Name"
              name="name"
              value={integrationData.name}
              onChange={handleChange}
              fullWidth
              autoFocus
              error={!!errors.name}
              helperText={errors.name}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Description (Optional)"
              name="description"
              value={integrationData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Integration Type</InputLabel>
              <Select
                name="type"
                value={integrationData.type}
                onChange={handleChange}
                label="Integration Type"
              >
                {typeOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth margin="normal" error={!!errors.source}>
              <InputLabel>Source</InputLabel>
              <Select
                name="source"
                value={integrationData.source}
                onChange={handleChange}
                label="Source"
                disabled={loading.sources}
              >
                {loading.sources ? (
                  <MenuItem value="">
                    <CircularProgress size={20} /> Loading...
                  </MenuItem>
                ) : (
                  sources.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))
                )}
              </Select>
              {errors.source && <FormHelperText>{errors.source}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth margin="normal" error={!!errors.destination}>
              <InputLabel>Destination</InputLabel>
              <Select
                name="destination"
                value={integrationData.destination}
                onChange={handleChange}
                label="Destination"
                disabled={loading.destinations}
              >
                {loading.destinations ? (
                  <MenuItem value="">
                    <CircularProgress size={20} /> Loading...
                  </MenuItem>
                ) : (
                  destinations.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))
                )}
              </Select>
              {errors.destination && <FormHelperText>{errors.destination}</FormHelperText>}
            </FormControl>
          </Grid>
        </Grid>
      )
    },
    {
      label: 'Connection Configuration',
      content: (
        <Box>
          {isAzureBlobSelected ? (
            <AzureBlobConfiguration
              config={integrationData.azureBlobConfig}
              onChange={handleBlobConfigChange}
              errors={errors.azureBlobConfig || {}}
              isSuperUser={isSuperUser}
            />
          ) : (
            <Typography color="textSecondary">
              No additional configuration needed for the selected source/destination.
            </Typography>
          )}
        </Box>
      )
    },
    {
      label: 'Schedule Configuration',
      content: (
        <ScheduleConfiguration
          schedule={integrationData.schedule}
          onChange={handleScheduleChange}
          errors={errors.schedule || {}}
        />
      )
    }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6">
          Create New Integration
        </Typography>
        {!isSuperUser && (
          <Typography variant="caption" color="textSecondary">
            Note: Some advanced configuration options are only available to administrators
          </Typography>
        )}
      </DialogTitle>
      
      <DialogContent dividers>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                {step.content}
                <Box sx={{ mb: 2, mt: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      {index === steps.length - 1 ? 'Finish' : 'Continue'}
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Back
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleCreate}
          color="primary"
          disabled={activeStep !== steps.length - 1}
        >
          Create Integration
        </Button>
      </DialogActions>
    </Dialog>
  );
}