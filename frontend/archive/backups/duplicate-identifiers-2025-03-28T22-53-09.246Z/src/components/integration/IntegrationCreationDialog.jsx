/**
 * @component IntegrationCreationDialog
 * @description A comprehensive dialog for creating new integrations with support for both
 * template-based and custom creation workflows. Provides a step-by-step wizard interface
 * for configuring all aspects of an integration including source/destination selection,
 * connection settings, scheduling, dataset selection, and notification preferences.
 *
 * Features:
 * - Two creation modes: template-based or custom
 * - Multi-step wizard interface with intuitive navigation
 * - Dynamic configuration options based on selected components
 * - Role-based access control for advanced settings
 * - Template browsing and selection
 * - Validation for all required fields
 * - Support for various integration types (API, File, Database)
 * - Dataset association for field mapping
 *
 * @param {Object} props - Component properties
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Callback when dialog is closed
 * @param {Function} props.onCreate - Callback when integration is created, receives the integration data
 *
 * @example
 * // Basic usage
 * const [dialogOpen, setDialogOpen] = useState(false);
 *
 * const handleClose = () => {
  // Added display name
  handleClose.displayName = 'handleClose';

  // Added display name
  handleClose.displayName = 'handleClose';

  // Added display name
  handleClose.displayName = 'handleClose';


 *   setDialogOpen(false);
 * };
 *
 * const handleCreate = (integrationData) => {
  // Added display name
  handleCreate.displayName = 'handleCreate';

  // Added display name
  handleCreate.displayName = 'handleCreate';

  // Added display name
  handleCreate.displayName = 'handleCreate';


 *   // Handle the created integration (e.g., save to API, update state)
 *   setDialogOpen(false);
 * };
 *
 * return (
 *   <>
 *     <Button onClick={() => setDialogOpen(true)}>
 *       Create Integration
 *     </Button>
 *
 *     <IntegrationCreationDialog
 *       open={dialogOpen}
 *       onClose={handleClose}
 *       onCreate={handleCreate}
 *     />
 *   </>
 * );
 */

import React, { useState, useEffect } from 'react';
import {
  Add as AddIcon,
  Settings as CustomIcon,
} from '@mui/icons-material';

import {MuiBox as MuiBox, Button, Dialog, TextField, Select, Typography, Grid, CircularProgress, Chip, useTheme} from '../../design-system';

// Import services
import {
  getAvailableSources,
  getAvailableDestinations,
  getDatasets,
} from '../../services/integrationService';
import authService from '@services/authService';

// Import configuration components
import AzureBlobConfiguration from './AzureBlobConfiguration';
import ScheduleConfiguration from './ScheduleConfiguration';
import NotificationSettings from './NotificationSettings';
import MuiBox from '@mui/material/Box';

export default function IntegrationCreationDialog({ open, onClose, onCreate }) {
  // Added display name
  IntegrationCreationDialog.displayName = 'IntegrationCreationDialog';

  // Creation mode (only custom mode is available now)
  const [creationMode, setCreationMode] = useState('custom');

  // Integration data for custom creation
  const [integrationData, setIntegrationData] = useState({
    name: '',
    type: 'API-based',
    source: '',
    destination: '',
    schedule: { type: 'onDemand' },
    azureBlobConfig: {},
    description: '',
    notifications: {
      enabled: true,
      notifyOn: ['error'],
      recipients: [],
      enableSummary: false,
    },
    selectedDatasets: [],
  });

  const [errors, setErrors] = useState({});
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [sources, setSources] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState({
    sources: false,
    destinations: false,
    datasets: false,
    templateCreation: false,
  });

  const [availableDatasets, setAvailableDatasets] = useState([]);

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

  // Fetch sources, destinations, and datasets when dialog opens
  useEffect(() => {
    if (open) {
      fetchSources(integrationData.type);
      fetchDestinations(integrationData.type);
      fetchDatasets();
    }
  }, [integrationData.type, open]);

  /**
   * @function fetchDatasets
   * @description Fetches available datasets from the API for association with the integration.
   * Updates the availableDatasets state with the fetched data and manages loading state.
   * Falls back to an empty array if the API call fails.
   *
   * @async
   * @returns {Promise<void>}
   */
  const fetchDatasets = async () => {
    try {
      setLoading(prev => ({ ...prev, datasets: true }));
      // In a real implementation, you might need to filter by application type
      const data = await getDatasets();
      setAvailableDatasets(data || []);
    } catch (error) {
      console.error('Error fetching datasets:', error);
      setAvailableDatasets([]);
    } finally {
      setLoading(prev => ({ ...prev, datasets: false }));
    }
  };

  /**
   * @function fetchSources
   * @description Fetches available source systems from the API based on the selected integration type.
   * Updates the sources state with the fetched data and manages loading state.
   * Falls back to an empty array if the API call fails.
   *
   * @async
   * @param {string} type - The type of integration (API-based, File-based, Database)
   * @returns {Promise<void>}
   */
  const fetchSources = async type => {
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

  /**
   * @function fetchDestinations
   * @description Fetches available destination systems from the API based on the selected integration type.
   * Updates the destinations state with the fetched data and manages loading state.
   * Falls back to an empty array if the API call fails.
   *
   * @async
   * @param {string} type - The type of integration (API-based, File-based, Database)
   * @returns {Promise<void>}
   */
  const fetchDestinations = async type => {
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

  /**
   * @function handleChange
   * @description Handles changes to form input fields and updates the integrationData state.
   * When the integration type changes, it also resets the source and destination fields
   * since they depend on the selected type. Clears any validation errors for the changed field.
   *
   * @param {Object} e - The input change event
   * @param {string} e.target.name - The name of the input field being changed
   * @param {string} e.target.value - The new value of the input field
   */
  const handleChange = e => {
    const { name, value } = e.target;

    // If type changed, reset source and destination
    if (name === 'type') {
      setIntegrationData(prev => ({
        ...prev,
        [name]: value,
        source: '',
        destination: '',
      }));
    } else {
      setIntegrationData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  /**
   * @function handleBlobConfigChange
   * @description Updates the Azure Blob Storage configuration in the integration data
   * and clears any validation errors for the blob configuration.
   *
   * @param {Object} config - The updated blob storage configuration object
   * @param {string} [config.containerName] - The Azure blob container name
   * @param {string} [config.authMethod] - Authentication method (connectionString, accountKey, sasToken)
   * @param {string} [config.connectionString] - Connection string for Azure storage
   * @param {string} [config.accountName] - Azure storage account name
   * @param {string} [config.accountKey] - Azure storage account key
   * @param {string} [config.sasToken] - Shared access signature token
   */
  const handleBlobConfigChange = config => {
    setIntegrationData(prev => ({
      ...prev,
      azureBlobConfig: config,
    }));

    // Clear blob config errors
    if (errors.azureBlobConfig) {
      setErrors(prev => ({
        ...prev,
        azureBlobConfig: null,
      }));
    }
  };

  /**
   * @function handleScheduleChange
   * @description Updates the schedule configuration in the integration data
   * and clears any validation errors for the schedule configuration.
   *
   * @param {Object} schedule - The updated schedule configuration object
   * @param {string} schedule.type - Schedule type (onDemand, hourly, daily, weekly, monthly, custom)
   * @param {string} [schedule.cronExpression] - Cron expression for custom schedules
   * @param {Object} [schedule.options] - Additional scheduling options
   */
  const handleScheduleChange = schedule => {
    setIntegrationData(prev => ({
      ...prev,
      schedule,
    }));

    // Clear schedule errors
    if (errors.schedule) {
      setErrors(prev => ({
        ...prev,
        schedule: null,
      }));
    }
  };

  /**
   * @function handleNotificationChange
   * @description Updates the notification settings in the integration data
   * and clears any validation errors for the notification settings.
   *
   * @param {Object} notifications - The updated notification settings object
   * @param {boolean} notifications.enabled - Whether notifications are enabled
   * @param {Array<string>} notifications.notifyOn - Events to trigger notifications (error, success, warning)
   * @param {Array<Object>} notifications.recipients - List of notification recipients
   * @param {boolean} notifications.enableSummary - Whether to send summary notifications
   */
  const handleNotificationChange = notifications => {
    setIntegrationData(prev => ({
      ...prev,
      notifications,
    }));

    // Clear notification errors
    if (errors.notifications) {
      setErrors(prev => ({
        ...prev,
        notifications: null,
      }));
    }
  };

  /**
   * @function handleDatasetChange
   * @description Updates the selected datasets in the integration data when the user
   * changes dataset selections in the Autocomplete component.
   *
   * @param {Object} event - The change event
   * @param {Array<Object>} newValue - Array of selected dataset objects
   * @param {string} newValue[].id - Unique identifier for each dataset
   * @param {string} newValue[].name - Display name of each dataset
   * @param {string} [newValue[].description] - Optional description of each dataset
   * @param {Array} [newValue[].fields] - Array of fields in each dataset
   */
  const handleDatasetChange = (event, newValue) => {
  // Added display name
  handleDatasetChange.displayName = 'handleDatasetChange';

  // Added display name
  handleDatasetChange.displayName = 'handleDatasetChange';

  // Added display name
  handleDatasetChange.displayName = 'handleDatasetChange';


    setIntegrationData(prev => ({
      ...prev,
      selectedDatasets: newValue,
    }));
  };


  /**
   * @function handleClose
   * @description Handles closing the dialog and resetting all form state.
   * Resets the integration data, errors, active step, creation mode, and
   * selected template before invoking the onClose callback.
   */
  const handleClose = () => {
  // Added display name
  handleClose.displayName = 'handleClose';

  // Added display name
  handleClose.displayName = 'handleClose';

  // Added display name
  handleClose.displayName = 'handleClose';


    // Reset form state
    setIntegrationData({
      name: '',
      type: 'API-based',
      source: '',
      destination: '',
      schedule: { type: 'onDemand' },
      azureBlobConfig: {},
      description: '',
      notifications: {
        enabled: true,
        notifyOn: ['error'],
        recipients: [],
        enableSummary: false,
      },
      selectedDatasets: [],
    });
    setErrors({});
    setActiveStep(0);
    setCreationMode('custom');
    setSelectedTemplate(null);
    onClose();
  };

  /**
   * @function validate
   * @description Validates all integration data before submission. Checks for:
   * - Required basic fields (name, source, destination)
   * - Azure Blob configuration when Azure is selected as source or destination
   * - Schedule configuration for scheduled integrations
   * - Dataset selection recommendations for API and Database integrations
   *
   * Different validation rules apply based on user role (admin vs regular user),
   * integration type, and selected source/destination systems.
   *
   * @returns {boolean} True if validation passes, false otherwise
   */
  const validate = () => {
  // Added display name
  validate.displayName = 'validate';

  // Added display name
  validate.displayName = 'validate';

  // Added display name
  validate.displayName = 'validate';


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
    if (
      integrationData.source === 'Azure Blob Container' ||
      integrationData.destination === 'Azure Blob Container'
    ) {
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

    // For APIs and Database integrations, we might want to require at least one dataset
    if (
      (integrationData.type === 'API-based' || integrationData.type === 'Database') &&
      integrationData.selectedDatasets.length === 0
    ) {
      // This is just a warning, not a blocking error
      console.warn('No datasets selected. Field mapping may be limited.');
      // You can uncomment this to make it a required field
      // newErrors.datasets = 'At least one dataset is recommended for proper field mapping';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  /**
   * @function handleCreateCustom
   * @description Creates a new custom integration after validating the form data.
   * Extracts dataset IDs from the selectedDatasets objects and prepares the data
   * for API submission. Invokes the onCreate callback with the prepared integration data.
   *
   * Only proceeds with creation if validation passes.
   */
  const handleCreateCustom = () => {
  // Added display name
  handleCreateCustom.displayName = 'handleCreateCustom';

  // Added display name
  handleCreateCustom.displayName = 'handleCreateCustom';

  // Added display name
  handleCreateCustom.displayName = 'handleCreateCustom';


    if (validate()) {
      // Extract selectedDatasets IDs to send as part of the integration creation
      const datasetIds = integrationData.selectedDatasets.map(dataset => dataset.id);

      // Create a shallow copy of the integration data without the selectedDatasets array
      const integrationToCreate = {
        ...integrationData,
        datasetIds: datasetIds, // Send the IDs instead of the full objects
        selectedDatasets: undefined, // Remove the full objects to avoid sending them
      };

      onCreate(integrationToCreate);
    }
  };

  /**
   * @function handleCreate
   * @description Main creation handler that delegates to handleCreateCustom.
   */
  const handleCreate = () => {
  // Added display name
  handleCreate.displayName = 'handleCreate';

  // Added display name
  handleCreate.displayName = 'handleCreate';

  // Added display name
  handleCreate.displayName = 'handleCreate';


    handleCreateCustom();
  };

  /**
   * @function handleNext
   * @description Advances the stepper to the next step in the integration creation workflow.
   * Increments the activeStep state value.
   */
  const handleNext = () => {
  // Added display name
  handleNext.displayName = 'handleNext';

  // Added display name
  handleNext.displayName = 'handleNext';

  // Added display name
  handleNext.displayName = 'handleNext';


    setActiveStep(prevStep => prevStep + 1);
  };

  /**
   * @function handleBack
   * @description Returns to the previous step in the integration creation workflow.
   * Decrements the activeStep state value.
   */
  const handleBack = () => {
  // Added display name
  handleBack.displayName = 'handleBack';

  // Added display name
  handleBack.displayName = 'handleBack';

  // Added display name
  handleBack.displayName = 'handleBack';


    setActiveStep(prevStep => prevStep - 1);
  };

  // Check if source or destination is Azure Blob
  const isAzureBlobSelected =
    integrationData.source === 'Azure Blob Container' ||
    integrationData.destination === 'Azure Blob Container';

  // Define the steps for the custom stepper
  const customSteps = [
    {
      label: 'Basic Information',
      content: (
        <Grid.Container spacing="md">
          <Grid.Item xs={12}>
            <TextField
              label="Integration Name"
              name="name"
              value={integrationData.name}
              onChange={handleChange}
              fullWidth
              autoFocus
              error={!!errors.name}
              helperText={errors.name}
              style={{ marginBottom: '16px' }}
            />
          </Grid.Item>

          <Grid.Item xs={12}>
            <TextField
              label="Description (Optional)"
              name="description"
              value={integrationData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              style={{ marginBottom: '16px' }}
            />
          </Grid.Item>

          <Grid.Item xs={12} sm={4}>
            <MuiBox style={{ marginBottom: '16px' }}>
              <Typography 
                variant="body2" 
                style={{ 
                  marginBottom: '4px', 
                  fontWeight: 'medium',
                  color: '#666666'
                }}
              >
                Integration Type
              </Typography>
              <Select
                name="type"
                value={integrationData.type}
                onChange={handleChange}
                options={typeOptions.map(option => ({ value: option, label: option }))}
                fullWidth
              />
            </MuiBox>
          </Grid.Item>

          <Grid.Item xs={12} sm={4}>
            <MuiBox style={{ marginBottom: '16px' }}>
              <Typography 
                variant="body2" 
                style={{ 
                  marginBottom: '4px', 
                  fontWeight: 'medium',
                  color: errors.source ? '#d32f2f' : '#666666'
                }}
              >
                Source
              </Typography>
              <Select
                name="source"
                value={integrationData.source}
                onChange={handleChange}
                disabled={loading.sources}
                fullWidth
                error={!!errors.source}
                options={
                  loading.sources
                    ? [
                        {
                          value: '',
                          label: 'Loading...',
                        },
                      ]
                    : sources.map(option => ({ value: option, label: option }))
                }
              />
              {errors.source && (
                <Typography variant="caption" style={{ color: '#d32f2f', marginTop: '4px' }}>
                  {errors.source}
                </Typography>
              )}
            </MuiBox>
          </Grid.Item>

          <Grid.Item xs={12} sm={4}>
            <MuiBox style={{ marginBottom: '16px' }}>
              <Typography 
                variant="body2" 
                style={{ 
                  marginBottom: '4px', 
                  fontWeight: 'medium',
                  color: errors.destination ? '#d32f2f' : '#666666'
                }}
              >
                Destination
              </Typography>
              <Select
                name="destination"
                value={integrationData.destination}
                onChange={handleChange}
                disabled={loading.destinations}
                fullWidth
                error={!!errors.destination}
                options={
                  loading.destinations
                    ? [
                        {
                          value: '',
                          label: 'Loading...',
                        },
                      ]
                    : destinations.map(option => ({ value: option, label: option }))
                }
              />
              {errors.destination && (
                <Typography variant="caption" style={{ color: '#d32f2f', marginTop: '4px' }}>
                  {errors.destination}
                </Typography>
              )}
            </MuiBox>
          </Grid.Item>
        </Grid.Container>
      ),
    },
    {
      label: 'Connection Configuration',
      content: (
        <MuiBox>
          {isAzureBlobSelected ? (
            <AzureBlobConfiguration
              config={integrationData.azureBlobConfig}
              onChange={handleBlobConfigChange}
              errors={errors.azureBlobConfig || {}}
              isSuperUser={isSuperUser}
            />
          ) : (
            <Typography style={{ color: '#666666' }}>
              No additional configuration needed for the selected source/destination.
            </Typography>
          )}
        </MuiBox>
      ),
    },
    {
      label: 'Schedule Configuration',
      content: (
        <MuiBox>
          <ScheduleConfiguration
            schedule={integrationData.schedule}
            onChange={handleScheduleChange}
            errors={errors.schedule || {}}
          />
        </MuiBox>
      ),
    },
    {
      label: 'Datasets Configuration',
      content: (
        <MuiBox style={{ marginTop: '16px' }}>
          <Typography 
            variant="subtitle1" 
            style={{ marginBottom: '8px' }}
          >
            Select Datasets
          </Typography>
          <Typography 
            variant="body2" 
            style={{ 
              color: '#666666', 
              marginBottom: '16px' 
            }}
          >
            Associate datasets with this integration to enable field mapping between source and
            destination.
          </Typography>

          {/* Note: Autocomplete is complex to reimplement, as a workaround we'll create a custom multi-select implementation */}
          <MuiBox style={{ marginBottom: '24px' }}>
            <Typography 
              variant="body2" 
              style={{ 
                marginBottom: '4px', 
                fontWeight: 'medium',
                color: '#666666'
              }}
            >
              Datasets
            </Typography>
            <Select
              name="selectedDatasets"
              value={integrationData.selectedDatasets.map(d => d.id)}
              onChange={(e) => {
                const selectedIds = typeof e.target.value === 'string' 
                  ? [e.target.value] 
                  : e.target.value;
                
                const selectedDatasets = availableDatasets.filter(dataset => 
                  selectedIds.includes(dataset.id)
                );
                
                handleDatasetChange(null, selectedDatasets);
              }}
              multiple
              fullWidth
              options={availableDatasets.map(dataset => ({ 
                value: dataset.id, 
                label: dataset.name 
              }))}
            />
            <Typography 
              variant="caption" 
              style={{ 
                color: '#666666', 
                marginTop: '4px',
                display: 'block' 
              }}
            >
              You can select multiple datasets to use with this integration
            </Typography>
            {loading.datasets && (
              <MuiBox style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                <CircularProgress size="small" style={{ marginRight: '8px' }} />
                <Typography variant="body2">Loading datasets...</Typography>
              </MuiBox>
            )}
          </MuiBox>

          {integrationData.selectedDatasets.length > 0 && (
            <MuiBox style={{ marginTop: '24px' }}>
              <Typography 
                variant="subtitle2" 
                style={{ marginBottom: '16px' }}
              >
                Selected Datasets:
              </Typography>
              <Grid.Container spacing="md">
                {integrationData.selectedDatasets.map(dataset => (
                  <Grid.Item xs={12} sm={6} md={4} key={dataset.id}>
                    <MuiBox
                      style={{
                        padding: '16px',
                        backgroundColor: '#ffffff',
                        borderRadius: '4px',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <Typography 
                        variant="subtitle2" 
                        style={{ marginBottom: '4px' }}
                      >
                        {dataset.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        style={{ color: '#666666', marginBottom: '8px' }}
                      >
                        {dataset.description || 'No description available'}
                      </Typography>
                      <MuiBox style={{ marginTop: '8px' }}>
                        <Typography 
                          variant="caption"
                          style={{ color: '#888888' }}
                        >
                          {dataset.fields?.length || 0} fields
                        </Typography>
                      </MuiBox>
                    </MuiBox>
                  </Grid.Item>
                ))}
              </Grid.Container>
            </MuiBox>
          )}
        </MuiBox>
      ),
    },
    {
      label: 'Notification Settings',
      content: (
        <MuiBox>
          <NotificationSettings
            notifications={integrationData.notifications}
            onChange={handleNotificationChange}
            errors={errors.notifications || {}}
          />
        </MuiBox>
      ),
    },
  ];


  // Use only custom steps
  const steps = customSteps;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      size="lg"
      fullScreen={false}
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <MuiBox
        style={{
          padding: '24px',
          background: 'linear-gradient(45deg, #2E7EED 0%, #56CCF2 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h5" style={{ fontWeight: 'bold' }}>
          Create New Integration
        </Typography>
        <Typography variant="subtitle1" style={{ opacity: 0.9, marginTop: '4px' }}>
          Connect your systems and automate data flows
        </Typography>

        {!isSuperUser && (
          <Typography
            variant="caption"
            style={{ 
              marginTop: '8px', 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              padding: '8px', 
              borderRadius: '4px' 
            }}
          >
            Note: Some advanced configuration options are only available to administrators
          </Typography>
        )}

      </MuiBox>

      <MuiBox style={{ display: 'flex', minHeight: '520px' }}>
        {/* Sidebar with steps */}
        <MuiBox
          style={{
            width: '240px',
            borderRight: '1px solid rgba(0, 0, 0, 0.08)',
            backgroundColor: '#f9fafb',
            padding: '16px',
            paddingTop: '32px',
          }}
        >
          <div>
            {steps.map((step, index) => (
              <MuiBox key={step.label} style={{ marginBottom: '16px' }}>
                <MuiBox style={{ display: 'flex', alignItems: 'center' }}>
                  <MuiBox
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      marginRight: '8px',
                      background: activeStep === index
                        ? '#2E7EED'
                        : activeStep > index
                          ? '#4CAF50'
                          : '#E0E0E0',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    {index + 1}
                  </MuiBox>
                  <Typography
                    variant="subtitle2"
                    style={{
                      fontWeight: activeStep === index ? 'bold' : 'normal',
                      color: activeStep === index ? '#2E7EED' : '#333333',
                    }}
                  >
                    {step.label}
                  </Typography>
                </MuiBox>
              </MuiBox>
            ))}
          </div>

          <MuiBox 
            style={{ 
              marginTop: '64px', 
              padding: '16px', 
              backgroundColor: 'rgba(46, 126, 237, 0.08)', 
              borderRadius: '8px' 
            }}
          >
            <Typography 
              variant="subtitle2" 
              style={{ 
                color: '#2E7EED', 
                marginBottom: '8px'
              }}
            >
              Need help?
            </Typography>
            <Typography 
              variant="body2" 
              style={{ color: '#555555' }}
            >
              Click on the info icons for guidance or check our integration setup guide for detailed instructions.
            </Typography>
          </MuiBox>
        </MuiBox>

        {/* Main content area */}
        <MuiBox style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
          {/* Active step content */}
          <MuiBox style={{ minHeight: '380px' }}>{steps[activeStep].content}</MuiBox>

          {/* Navigation buttons */}
          <MuiBox
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(0, 0, 0, 0.08)',
              paddingTop: '24px',
              marginTop: '24px',
            }}
          >
            <Button 
              variant="text" 
              onClick={handleBack} 
              disabled={activeStep === 0}
            >
              Back
            </Button>

            <MuiBox>
              <Button 
                variant="text" 
                onClick={handleClose} 
                style={{ marginRight: '8px' }}
              >
                Cancel
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleCreate}
                  size="large"
                  style={{ 
                    paddingLeft: '32px', 
                    paddingRight: '32px', 
                    paddingTop: '8px', 
                    paddingBottom: '8px' 
                  }}
                >
                  Create Integration
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  onClick={handleNext} 
                  endIcon={<span>→</span>}
                >
                  Continue
                </Button>
              )}
            </MuiBox>
          </MuiBox>
        </MuiBox>
      </MuiBox>
    </Dialog>
  );
}
