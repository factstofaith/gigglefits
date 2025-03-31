// IntegrationDetailView.jsx
// -----------------------------------------------------------------------------
// Component for viewing and editing integration details, including configuration

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, CircularProgress, Divider, Grid, Tab, Tabs, Typography, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Snackbar, Alert as MuiAlert } from '../../design-system';
import IconButton from '@mui/material/IconButton';;
import {
  ButtonLegacy as Button,
  CardLegacy as Card,
  CardContentLegacy as CardContent,
  CardHeaderLegacy as CardHeader,
  CardLegacy as Paper,
  InputFieldLegacy as TextField,
} from '../../design-system/legacy';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WebhookIcon from '@mui/icons-material/Webhook';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DatasetIcon from '@mui/icons-material/Dataset';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SaveIcon from '@mui/icons-material/Save';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import VerifiedIcon from '@mui/icons-material/Verified';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import MenuIcon from '@mui/icons-material/Menu';

// Import configuration components
import AzureBlobConfiguration from '@components/integration/AzureBlobConfiguration';
import ScheduleConfiguration from '@components/integration/ScheduleConfiguration';
import RunLogViewer from '@components/integration/RunLogViewer';
import NotificationSettings from '@components/integration/NotificationSettings';
import WebhookSettings from '@components/integration/WebhookSettings';
import EarningsMappingDetail from '@components/integration/EarningsMappingDetail';
import IntegrationFlowCanvas from '@components/integration/IntegrationFlowCanvas';

// Import services
import {
  getIntegrationById,
  updateIntegration,
  runIntegration,
  getIntegrationDatasets,
  associateDataset,
  disassociateDataset,
  getIntegrationFlow,
  saveIntegrationFlow,
  validateIntegrationFlow,
  getApplications,
} from '../../services/integrationService';
import authService from '@services/authService';

// Import bidirectional sync and validation utilities
import { 
  useIntegrationDetailSync, 
  IntegrationDetailSyncManager, 
  SyncTransformers, 
  SYNC_KEYS 
} from '../../utils/bidirectionalSync';
import appDatasetValidator from '@utils/appDatasetValidator';
import autoLayout from '@utils/autoLayout';
// Removed duplicate import
// Mock TabPanel component for tab content
function TabPanel(props) {
  // Added display name
  TabPanel.displayName = 'TabPanel';

  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`integration-tabpanel-${index}`}
      aria-labelledby={`integration-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const IntegrationDetailView = ({ integrationId }) => {
  // Added display name
  IntegrationDetailView.displayName = 'IntegrationDetailView';

  // Added display name
  IntegrationDetailView.displayName = 'IntegrationDetailView';

  // Added display name
  IntegrationDetailView.displayName = 'IntegrationDetailView';


  const [integration, setIntegration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [saving, setSaving] = useState(false);
  const [runningIntegration, setRunningIntegration] = useState(false);
  
  // Flow canvas specific states
  const [flowNodes, setFlowNodes] = useState([]);
  const [flowEdges, setFlowEdges] = useState([]);
  const [loadingFlow, setLoadingFlow] = useState(false);
  const [savingFlow, setSavingFlow] = useState(false);
  const [flowError, setFlowError] = useState(null);
  
  // Bidirectional sync setup
  const componentId = `integration-detail-${integrationId}`;
  const { 
    publishUpdate, 
    getState, 
    lastSync 
  } = useIntegrationDetailSync(componentId, [
    SYNC_KEYS.FLOW_DATA,
    SYNC_KEYS.DATASETS,
    SYNC_KEYS.APPLICATIONS,
    SYNC_KEYS.METADATA,
    SYNC_KEYS.SAVE_STATUS
  ]);
  
  // Applications and datasets for association management
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  
  // Layout and validation states
  const [layoutMenuAnchor, setLayoutMenuAnchor] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState([]);
  
  // Reference to canvas container for size measurement
  const canvasContainerRef = useRef(null);

  // Fetch integration data
  useEffect(() => {
    const fetchIntegration = async () => {
      try {
        setLoading(true);

        // Fetch integration, datasets, and applications in parallel
        const [data, datasets, apps] = await Promise.all([
          getIntegrationById(integrationId),
          getIntegrationDatasets(integrationId).catch(() => []),
          getApplications().catch(() => [])
        ]);

        // Initialize with default configs if not present
        if (!data.azureBlobConfig) {
          data.azureBlobConfig = {
            authMethod: 'connectionString',
            containerName: '',
          };
        }

        if (!data.schedule || typeof data.schedule === 'string') {
          data.schedule = {
            type: data.schedule || 'onDemand',
            cronExpression: '',
            timezone: 'UTC',
          };
        }

        if (!data.notifications) {
          data.notifications = {
            enabled: true,
            notifyOn: ['error'],
            recipients: [],
            enableSummary: false,
          };
        }

        // Add datasets to integration data
        data.datasets = datasets;
        
        // Store applications for dataset associations
        setApplications(apps);

        // Publish to sync manager for other components
        publishUpdate(SYNC_KEYS.DATASETS, datasets);
        publishUpdate(SYNC_KEYS.APPLICATIONS, apps);
        publishUpdate(SYNC_KEYS.METADATA, {
          name: data.name,
          description: data.description,
          type: data.type,
          status: data.status
        });

        setIntegration(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching integration details:', err);
        setError('Failed to load integration details');
        setLoading(false);
      }
    };

    const checkUserRole = async () => {
      const isAdmin = await authService.isAdmin();
      setIsSuperUser(isAdmin);
    };

    fetchIntegration();
    checkUserRole();
  }, [integrationId, publishUpdate]);
  
  // Fetch flow data when the Flow tab is selected
  useEffect(() => {
    // Only fetch flow data when the Flow tab is active (tab index 8)
    if (activeTab === 8) {
      fetchFlowData();
    }
  }, [activeTab, integrationId]);
  
  // Check for sync updates from other components
  useEffect(() => {
    // Check if we received updates from other tabs
    if (lastSync && lastSync[SYNC_KEYS.DATASETS]) {
      // Update datasets from sync if newer than our data
      const syncedDatasets = lastSync[SYNC_KEYS.DATASETS].data;
      if (syncedDatasets && Array.isArray(syncedDatasets)) {
        setIntegration(prev => ({
          ...prev,
          datasets: syncedDatasets
        }));
      }
    }
    
    if (lastSync && lastSync[SYNC_KEYS.FLOW_DATA]) {
      // Update flow data from sync if we're not currently saving
      const syncedFlowData = lastSync[SYNC_KEYS.FLOW_DATA].data;
      const sourceId = lastSync[SYNC_KEYS.FLOW_DATA].sourceId;
      
      // Only update if we're not the source of this update
      if (syncedFlowData && sourceId !== componentId && !savingFlow) {
        const { nodes, edges } = syncedFlowData;
        setFlowNodes(nodes || []);
        setFlowEdges(edges || []);
      }
    }
  }, [lastSync, componentId, savingFlow]);

  // Function to fetch flow data
  const fetchFlowData = useCallback(async () => {
  // Added display name
  fetchFlowData.displayName = 'fetchFlowData';

    try {
      setLoadingFlow(true);
      setFlowError(null);
      
      const flowData = await getIntegrationFlow(integrationId);
      
      if (flowData) {
        setFlowNodes(flowData.nodes || []);
        setFlowEdges(flowData.edges || []);
        
        // Publish to sync manager
        publishUpdate(SYNC_KEYS.FLOW_DATA, {
          nodes: flowData.nodes || [],
          edges: flowData.edges || []
        });
        
        // Validate app-dataset relationships
        const validationResults = appDatasetValidator.validateAppDatasetRelationships(
          flowData.nodes || [],
          flowData.edges || []
        );
        
        setValidationResults(validationResults);
        setShowValidationAlert(validationResults.length > 0);
      } else {
        // Initialize with empty flow if none exists
        setFlowNodes([]);
        setFlowEdges([]);
        setValidationResults([]);
      }
      
      setLoadingFlow(false);
    } catch (err) {
      console.error('Error fetching flow data:', err);
      setFlowError('Failed to load integration flow data');
      setLoadingFlow(false);
    }
  }, [integrationId, publishUpdate]);
  
  // Function to save flow data
  const handleSaveFlow = useCallback(async ({ nodes, edges }) => {
  // Added display name
  handleSaveFlow.displayName = 'handleSaveFlow';

    try {
      setSavingFlow(true);
      setFlowError(null);
      
      // First validate the flow
      const validationResponse = await validateIntegrationFlow({ nodes, edges });
      
      if (validationResponse && validationResponse.errors && validationResponse.errors.length > 0) {
        // Show validation errors but don't prevent saving
        setValidationResults(validationResponse.errors);
        setShowValidationAlert(true);
      }
      
      // Save even with warnings
      await saveIntegrationFlow(integrationId, { nodes, edges });
      
      // Update local state with the saved flow
      setFlowNodes(nodes);
      setFlowEdges(edges);
      
      // Publish to sync manager
      publishUpdate(SYNC_KEYS.FLOW_DATA, { nodes, edges });
      publishUpdate(SYNC_KEYS.SAVE_STATUS, { 
        timestamp: Date.now(),
        status: 'success'
      });
      
      setSavingFlow(false);
      return true; // Success
    } catch (err) {
      console.error('Error saving flow data:', err);
      setFlowError('Failed to save integration flow data');
      
      // Publish error status
      publishUpdate(SYNC_KEYS.SAVE_STATUS, { 
        timestamp: Date.now(),
        status: 'error',
        message: err.message
      });
      
      setSavingFlow(false);
      return false; // Failure
    }
  }, [integrationId, publishUpdate]);
  
  // Handle auto-layout functionality
  const handleAutoLayout = useCallback(() => {
  // Added display name
  handleAutoLayout.displayName = 'handleAutoLayout';

    if (!flowNodes || !flowEdges) return;
    
    try {
      // Get container dimensions for optimal layout
      const containerWidth = canvasContainerRef.current?.offsetWidth || 1000;
      const containerHeight = canvasContainerRef.current?.offsetHeight || 800;
      
      // Apply auto layout
      const layoutedNodes = autoLayout.applyAutoLayout(flowNodes, flowEdges, 'LR');
      
      // Update nodes with new positions
      setFlowNodes(layoutedNodes);
      
      // Center the view (would be handled by IntegrationFlowCanvas)
      
      // Close the menu
      setLayoutMenuAnchor(null);
    } catch (error) {
      console.error('Error applying auto layout:', error);
      setFlowError('Failed to apply automatic layout');
    }
  }, [flowNodes, flowEdges]);
  
  // Handle node alignment
  const handleAlignNodes = useCallback((alignment) => {
  // Added display name
  handleAlignNodes.displayName = 'handleAlignNodes';

    if (!selectedNodes || selectedNodes.length < 2) return;
    
    try {
      const alignedNodes = autoLayout.alignNodes(flowNodes, selectedNodes, alignment);
      setFlowNodes(alignedNodes);
      setLayoutMenuAnchor(null);
    } catch (error) {
      console.error('Error aligning nodes:', error);
      setFlowError('Failed to align nodes');
    }
  }, [flowNodes, selectedNodes]);
  
  // Handle node distribution
  const handleDistributeNodes = useCallback((direction) => {
  // Added display name
  handleDistributeNodes.displayName = 'handleDistributeNodes';

    if (!selectedNodes || selectedNodes.length < 3) return;
    
    try {
      const distributedNodes = autoLayout.distributeNodes(flowNodes, selectedNodes, direction);
      setFlowNodes(distributedNodes);
      setLayoutMenuAnchor(null);
    } catch (error) {
      console.error('Error distributing nodes:', error);
      setFlowError('Failed to distribute nodes');
    }
  }, [flowNodes, selectedNodes]);
  
  // Handle node selection from canvas
  const handleNodesSelection = useCallback((selectedNodeIds) => {
  // Added display name
  handleNodesSelection.displayName = 'handleNodesSelection';

    setSelectedNodes(selectedNodeIds);
  }, []);

  // Handle tab changes
  const handleTabChange = (event, newValue) => {
  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';


    setActiveTab(newValue);
  };

  // Handle edit mode toggle
  const toggleEditMode = () => {
  // Added display name
  toggleEditMode.displayName = 'toggleEditMode';

  // Added display name
  toggleEditMode.displayName = 'toggleEditMode';

  // Added display name
  toggleEditMode.displayName = 'toggleEditMode';


    setIsEditing(!isEditing);
  };

  // Handle Azure Blob configuration changes
  const handleBlobConfigChange = config => {
    setIntegration(prev => ({
      ...prev,
      azureBlobConfig: config,
    }));
  };

  // Handle schedule changes
  const handleScheduleChange = schedule => {
    setIntegration(prev => ({
      ...prev,
      schedule,
    }));
  };

  // Handle notification changes
  const handleNotificationChange = notifications => {
    setIntegration(prev => ({
      ...prev,
      notifications,
    }));
  };

  // Handle dataset association
  const handleAssociateDataset = async datasetId => {
    try {
      await associateDataset(integrationId, datasetId);

      // Fetch updated datasets
      const datasets = await getIntegrationDatasets(integrationId);

      // Update integration state
      setIntegration(prev => ({
        ...prev,
        datasets,
      }));
    } catch (err) {
      console.error('Error associating dataset:', err);
      setError('Failed to associate dataset');
    }
  };

  // Handle dataset disassociation
  const handleDisassociateDataset = async datasetId => {
    try {
      await disassociateDataset(integrationId, datasetId);

      // Update datasets in state by filtering out the removed dataset
      setIntegration(prev => ({
        ...prev,
        datasets: prev.datasets.filter(d => d.id !== datasetId),
      }));
    } catch (err) {
      console.error('Error disassociating dataset:', err);
      setError('Failed to disassociate dataset');
    }
  };

  // Save integration changes
  const handleSave = async () => {
    try {
      setSaving(true);
      await updateIntegration(integrationId, integration);
      setIsEditing(false);
      setSaving(false);
    } catch (err) {
      setError('Failed to save changes');
      setSaving(false);
    }
  };

  // Run integration
  const handleRunIntegration = async () => {
    try {
      setRunningIntegration(true);
      await runIntegration(integrationId);

      // In a real app, you might want to poll for status updates
      // or redirect to a run history page
      setTimeout(() => {
        setRunningIntegration(false);
      }, 2000);
    } catch (err) {
      setError('Failed to run integration');
      setRunningIntegration(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
        <Typography>{error}</Typography>
      </Paper>
    );
  }

  // Check if Azure Blob is used as source or destination
  const isAzureBlobUsed =
    integration?.source === 'Azure Blob Container' ||
    integration?.destination === 'Azure Blob Container';

  return (
    <Card>
      <CardHeader
        title={integration?.name || 'Integration Details'}
        subheader={`${integration?.source || ''} → ${integration?.destination || ''}`}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={handleRunIntegration}
              disabled={runningIntegration}
            >
              {runningIntegration ? 'Running...' : 'Run Now'}
            </Button>
            <IconButton onClick={toggleEditMode} color={isEditing ? 'primary' : 'default'}>
              <EditIcon />
            </IconButton>
          </Box>
        }
      />

      <Divider />

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="integration tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" icon={<SettingsIcon />} iconPosition="start" />
          <Tab
            label="Configuration"
            icon={<SettingsIcon />}
            iconPosition="start"
            disabled={!isAzureBlobUsed}
          />
          <Tab label="Schedule" icon={<HistoryIcon />} iconPosition="start" />
          <Tab label="Notifications" icon={<NotificationsIcon />} iconPosition="start" />
          <Tab label="Webhooks" icon={<WebhookIcon />} iconPosition="start" />
          <Tab label="Datasets" icon={<DatasetIcon />} iconPosition="start" />
          <Tab label="Earnings" icon={<AttachMoneyIcon />} iconPosition="start" />
          <Tab label="Run Logs" icon={<AssignmentIcon />} iconPosition="start" />
          <Tab 
            label="Flow" 
            icon={<AccountTreeIcon />} 
            iconPosition="start" 
            sx={{ 
              fontWeight: 'bold', 
              color: theme => activeTab === 8 ? theme.palette.primary.main : 'inherit' 
            }} 
          />
        </Tabs>
      </Box>

      <CardContent>
        {/* Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Basic Information
              </Typography>

              {isEditing ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Integration Name"
                      name="name"
                      value={integration?.name || ''}
                      onChange={e => setIntegration({ ...integration, name: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Type"
                      name="type"
                      value={integration?.type || ''}
                      onChange={e => setIntegration({ ...integration, type: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Source"
                      name="source"
                      value={integration?.source || ''}
                      onChange={e => setIntegration({ ...integration, source: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Destination"
                      name="destination"
                      value={integration?.destination || ''}
                      onChange={e =>
                        setIntegration({ ...integration, destination: e.target.value })
                      }
                    />
                  </Grid>
                </Grid>
              ) : (
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Type:</strong> {integration?.type}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Source:</strong> {integration?.source}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Destination:</strong> {integration?.destination}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Created:</strong>{' '}
                    {new Date(integration?.createdAt || Date.now()).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Last Updated:</strong>{' '}
                    {new Date(integration?.updatedAt || Date.now()).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Status:</strong> {integration?.status || 'Active'}
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Description
              </Typography>

              {isEditing ? (
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={integration?.description || ''}
                  onChange={e => setIntegration({ ...integration, description: e.target.value })}
                  multiline
                  rows={4}
                />
              ) : (
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body2">
                    {integration?.description || 'No description provided.'}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Configuration Tab */}
        <TabPanel value={activeTab} index={1}>
          {isAzureBlobUsed ? (
            <AzureBlobConfiguration
              config={integration?.azureBlobConfig}
              onChange={handleBlobConfigChange}
              readOnly={!isEditing}
              isSuperUser={isSuperUser}
            />
          ) : (
            <Typography color="textSecondary">
              No additional configuration needed for the selected source/destination.
            </Typography>
          )}
        </TabPanel>

        {/* Schedule Tab */}
        <TabPanel value={activeTab} index={2}>
          <ScheduleConfiguration
            schedule={integration?.schedule}
            onChange={handleScheduleChange}
            readOnly={!isEditing}
          />
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={activeTab} index={3}>
          <NotificationSettings
            notifications={integration?.notifications}
            onChange={handleNotificationChange}
            readOnly={!isEditing}
          />
        </TabPanel>

        {/* Webhooks Tab */}
        <TabPanel value={activeTab} index={4}>
          <WebhookSettings integrationId={integrationId} />
        </TabPanel>

        {/* Datasets Tab */}
        <TabPanel value={activeTab} index={5}>
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Associated Datasets
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Manage datasets associated with this integration. Datasets provide field definitions
              and sample data for mappings.
            </Typography>

            {/* This would be replaced with a DatasetsTable component in a real implementation */}
            {integration?.datasets && integration.datasets.length > 0 ? (
              <Grid container spacing={2}>
                {integration.datasets.map(dataset => (
                  <Grid item xs={12} md={6} key={dataset.id}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1">{dataset.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {dataset.description || 'No description provided.'}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption">
                          {dataset.fields ? dataset.fields.length : 0} fields defined
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  No datasets associated with this integration.
                </Typography>
                <Button variant="contained" color="primary" sx={{ mt: 2 }} disabled={!isEditing}>
                  Associate Dataset
                </Button>
              </Paper>
            )}
          </Box>
        </TabPanel>

        {/* Earnings Mapping Tab */}
        <TabPanel value={activeTab} index={6}>
          <EarningsMappingDetail
            integrationId={integrationId}
            datasetId={
              integration?.datasets && integration.datasets.length > 0
                ? integration.datasets[0].id
                : null
            }
          />
        </TabPanel>

        {/* Run Logs Tab */}
        <TabPanel value={activeTab} index={7}>
          <RunLogViewer integrationId={integrationId} />
        </TabPanel>
        
        {/* Flow Tab */}
        <TabPanel value={activeTab} index={8}>
          <Box sx={{ height: '70vh', width: '100%', position: 'relative' }}>
            {loadingFlow ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : flowError ? (
              <Box sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
                <Typography>{flowError}</Typography>
                <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={fetchFlowData}>
                  Retry
                </Button>
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Integration Flow Canvas
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Design and configure your integration flow with the enhanced visual flow builder.
                    </Typography>
                  </Box>
                  
                  {isEditing && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {/* Layout controls */}
                      <Tooltip title="Flow Layout Options">
                        <IconButton onClick={(e) => setLayoutMenuAnchor(e.currentTarget)}>
                          <ViewComfyIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {/* Auto-layout menu */}
                      <Menu
                        anchorEl={layoutMenuAnchor}
                        open={Boolean(layoutMenuAnchor)}
                        onClose={() => setLayoutMenuAnchor(null)}
                      >
                        <MenuItem onClick={handleAutoLayout}>
                          <ListItemIcon>
                            <AutoFixHighIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Auto-Layout Flow" />
                        </MenuItem>
                        <Divider />
                        <MenuItem 
                          onClick={() => handleAlignNodes('horizontal')}
                          disabled={!selectedNodes || selectedNodes.length < 2}
                        >
                          <ListItemIcon>
                            <FormatAlignLeftIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Align Horizontally" />
                        </MenuItem>
                        <MenuItem 
                          onClick={() => handleAlignNodes('vertical')}
                          disabled={!selectedNodes || selectedNodes.length < 2}
                        >
                          <ListItemIcon>
                            <FormatAlignRightIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Align Vertically" />
                        </MenuItem>
                        <Divider />
                        <MenuItem 
                          onClick={() => handleDistributeNodes('horizontal')}
                          disabled={!selectedNodes || selectedNodes.length < 3}
                        >
                          <ListItemIcon>
                            <ViewComfyIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Distribute Horizontally" />
                        </MenuItem>
                        <MenuItem 
                          onClick={() => handleDistributeNodes('vertical')}
                          disabled={!selectedNodes || selectedNodes.length < 3}
                        >
                          <ListItemIcon>
                            <ViewComfyIcon fontSize="small" rotate={90} />
                          </ListItemIcon>
                          <ListItemText primary="Distribute Vertically" />
                        </MenuItem>
                      </Menu>
                      
                      {/* Validation status */}
                      <Tooltip title={validationResults?.length > 0 
                        ? `${validationResults.length} validation issues found` 
                        : "Flow validation"}>
                        <span>
                          <IconButton 
                            color={validationResults?.length > 0 ? "error" : "success"}
                            onClick={() => setShowValidationAlert(true)}
                          >
                            {validationResults?.length > 0 
                              ? <ErrorOutlineIcon /> 
                              : <VerifiedIcon />}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
                
                {/* Canvas container */}
                <Box 
                  ref={canvasContainerRef}
                  sx={{ 
                    height: 'calc(70vh - 100px)', 
                    width: '100%', 
                    border: '1px solid #ddd', 
                    borderRadius: 1 
                  }}
                >
                  <IntegrationFlowCanvas 
                    initialNodes={flowNodes}
                    initialEdges={flowEdges}
                    onSave={handleSaveFlow}
                    onRun={handleRunIntegration}
                    onNodesChange={(nodes) => {
                      setFlowNodes(nodes);
                    }}
                    onEdgesChange={(edges) => {
                      setFlowEdges(edges);
                    }}
                    onNodeSelection={handleNodesSelection}
                    readOnly={!isEditing}
                    isAdmin={isSuperUser}
                    availableComponents={{
                      'Source Nodes': [
                        { type: 'source', label: 'Source', description: 'Generic data source' },
                        { type: 'api', label: 'API', description: 'API data source' },
                        { type: 'file', label: 'File', description: 'File data source' },
                        { type: 'database', label: 'Database', description: 'Database data source' }
                      ],
                      'Process Nodes': [
                        { type: 'transform', label: 'Transform', description: 'Data transformation' },
                        { type: 'filter', label: 'Filter', description: 'Data filtering' },
                        { type: 'router', label: 'Router', description: 'Conditional routing' }
                      ],
                      'Destination Nodes': [
                        { type: 'destination', label: 'Destination', description: 'Generic data destination' },
                        { type: 'dataset', label: 'Dataset', description: 'Dataset output' }
                      ],
                      'Control Nodes': [
                        { type: 'trigger', label: 'Trigger', description: 'Flow trigger' },
                        { type: 'action', label: 'Action', description: 'Perform action' }
                      ],
                      'Data Layer': [
                        { type: 'dataset', label: 'Dataset', description: 'Shared dataset' },
                        { type: 'application', label: 'Application', description: 'Application integration' }
                      ]
                    }}
                    userPreferences={{
                      showMinimap: true,
                      snapToGrid: true,
                      darkMode: false
                    }}
                    validationErrors={validationResults || []}
                  />
                </Box>
                
                {savingFlow && (
                  <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                    Saving flow changes...
                  </Typography>
                )}
                
                {isEditing && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button onClick={() => fetchFlowData()}>
                      Reset
                    </Button>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={<SaveIcon />}
                      onClick={() => handleSaveFlow({ nodes: flowNodes, edges: flowEdges })}
                      disabled={savingFlow}
                    >
                      Save Flow
                    </Button>
                  </Box>
                )}
                
                {/* Validation alert */}
                <Snackbar
                  open={showValidationAlert}
                  autoHideDuration={6000}
                  onClose={() => setShowValidationAlert(false)}
                  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                  <MuiAlert 
                    elevation={6} 
                    variant="filled" 
                    severity="warning"
                    onClose={() => setShowValidationAlert(false)}
                    sx={{ width: '100%' }}
                    action={
                      <Button color="inherit" size="small" onClick={() => setShowValidationAlert(false)}>
                        Dismiss
                      </Button>
                    }
                  >
                    {validationResults && validationResults.length > 0 ? (
                      <>
                        {validationResults.length} validation {validationResults.length === 1 ? 'issue' : 'issues'} detected in flow
                      </>
                    ) : (
                      'Flow validation successful'
                    )}
                  </MuiAlert>
                </Snackbar>
              </>
            )}
          </Box>
        </TabPanel>
      </CardContent>

      {isEditing && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button onClick={toggleEditMode} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      )}
    </Card>
  );
};

export default IntegrationDetailView;
