// ApplicationsManager.jsx
import React, { useState, useEffect } from 'react';
'import { Box } from '../../design-system';
'import { Card } from '../../design-system';
'import { Grid } from '../../design-system';
'import { Typography, Button } from '../../design-system';
'import { TextField, Select, Switch } from '../../design-system';
'import { Table } from '../../design-system';
'import { Chip } from '../../design-system';
'import { Dialog, CircularProgress, Alert } from '../../design-system';
'import { Tabs } from '../../design-system';
'import { useTheme } from '@design-system/foundations/theme';
'import { Paper, TableBody, TableCell, TableContainer, TableHead, TableRow, InputAdornment, DialogTitle, DialogContent, DialogActions, FormControl, FormControlLabel, FormHelperText, FormGroup, InputLabel, MenuItem, Tab, List, ListItem, ListItemText, ListItemSecondaryAction, Divider, Tooltip, Link } from '../../design-system';
'import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import IconButton from '@mui/material/IconButton';;
'import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Apps as AppsIcon,
  Visibility as VisibilityIcon,
  ContentCopy as ContentCopyIcon,
  Analytics as AnalyticsIcon,
  ExpandMore as ExpandMoreIcon,
  Storage as StorageIcon,
  Link as LinkIcon,
  DataObject as DataObjectIcon,
  Notifications as NotificationsIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  PlayArrow as TestIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Code as CodeIcon,
  AutoAwesome as AutoAwesomeIcon,
  Api as ApiIcon,
  Description as DescriptionIcon,
  Psychology as PsychologyIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Schema as SchemaIcon,
  Business as TenantIcon,
  LinkOff as LinkOffIcon,
} from '@mui/icons-material';
'import useNotification from '@hooks/useNotification';
'import { useResource } from '@contexts/ResourceContext';
'import ResourceLoader from '@components/common/ResourceLoader';
'import * as adminService from '@services/adminService';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
'// Schema discovery methods
const SCHEMA_DISCOVERY_METHODS = [
  {
    value: 'manual',
'    label: 'Manual Entry',
'    description: 'Manually enter the schema definition',
'    icon: <EditIcon /></EditIcon>,
  },
  {
    value: 'api',
'    label: 'API Endpoint',
'    description: 'Discover schema by calling an API endpoint',
'    icon: <ApiIcon /></ApiIcon>,
  },
  {
    value: 'swagger',
'    label: 'Swagger/OpenAPI',
'    description: 'Use Swagger/OpenAPI specification',
'    icon: <DescriptionIcon /></DescriptionIcon>,
  },
  {
    value: 'database',
'    label: 'Database',
'    description: 'Discover schema through database introspection',
'    icon: <StorageIcon /></StorageIcon>,
  },
  {
    value: 'file',
'    label: 'File Sample',
'    description: 'Upload a file sample to infer schema',
'    icon: <InsertDriveFileIcon /></InsertDriveFileIcon>,
  },
  {
    value: 'ai',
'    label: 'AI Inference',
'    description: 'Use AI to infer schema from examples',
'    icon: <PsychologyIcon /></PsychologyIcon>,
  },
];

// Status chip color mapping
const statusColors = {
  active: 'success',
'  draft: 'info',
'  inactive: 'warning',
'  deprecated: 'error',
'};

// Auth type display mapping
const authTypeDisplay = {
  none: 'None',
'  api_key: 'API Key',
'  oauth2: 'OAuth 2.0',
'  basic: 'Basic Auth',
'  custom: 'Custom',
'};

// Application type display mapping
const appTypeDisplay = {
  api: 'API',
'  file: 'File Storage',
'  database: 'Database',
'  custom: 'Custom',
'};

// Webhook event types grouped by category
const EVENT_TYPES = {
  Integration: [
    { value: 'integration.created', label: 'Integration Created' },
'    { value: 'integration.updated', label: 'Integration Updated' },
'    { value: 'integration.deleted', label: 'Integration Deleted' },
'    { value: 'integration.run.started', label: 'Integration Run Started' },
'    { value: 'integration.run.completed', label: 'Integration Run Completed' },
'    { value: 'integration.run.failed', label: 'Integration Run Failed' },
'    { value: 'integration.health.changed', label: 'Integration Health Changed' },
'  ],
  Application: [
    { value: 'application.created', label: 'Application Created' },
'    { value: 'application.updated', label: 'Application Updated' },
'    { value: 'application.deleted', label: 'Application Deleted' },
'  ],
  Dataset: [
    { value: 'dataset.created', label: 'Dataset Created' },
'    { value: 'dataset.updated', label: 'Dataset Updated' },
'    { value: 'dataset.deleted', label: 'Dataset Deleted' },
'  ],
  User: [
    { value: 'user.created', label: 'User Created' },
'    { value: 'user.updated', label: 'User Updated' },
'  ],
  Tenant: [
    { value: 'tenant.created', label: 'Tenant Created' },
'    { value: 'tenant.updated', label: 'Tenant Updated' },
'  ],
};

// Authentication types
const AUTH_TYPES = [
  { value: 'none', label: 'None' },
'  { value: 'basic', label: 'Basic Authentication' },
'  { value: 'bearer', label: 'Bearer Token' },
'  { value: 'custom', label: 'Custom' },
'];

// Tab panel component
const TabPanel = ({ children, value, index, ...other }) => {
  // Added display name
  TabPanel.displayName = 'TabPanel';

  // Added display name
  TabPanel.displayName = 'TabPanel';

  // Added display name
  TabPanel.displayName = 'TabPanel`;
'

  return (
    <div
      role="tabpanel"
"      hidden={value !== index}
      id={`app-tabpanel-${index}`}
      aria-labelledby={`app-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={2}>{children}</Box>}
    </div>
  );
};

// ApplicationsManager component
const ApplicationsManager = () => {
  // Added display name
  ApplicationsManager.displayName = 'ApplicationsManager';

  // Added display name
  ApplicationsManager.displayName = 'ApplicationsManager';

  // Added display name
  ApplicationsManager.displayName = `ApplicationsManager';
'

  const { showToast, addNotification } = useNotification();

  // Get resource context data
  const {
    applications,
    datasets: allDatasets,
    tenants,
    currentApplication,
    applicationLoading,
    applicationError,
    fetchApplications,
    fetchDatasets,
    fetchTenants,
    fetchApplicationById,
    createApplication: contextCreateApplication,
    updateApplication: contextUpdateApplication,
    deleteApplication: contextDeleteApplication,
    clearCurrentApplication,
  } = useResource();

  const [searchTerm, setSearchTerm] = useState('');
'  const [openDialog, setOpenDialog] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [usageStatsOpen, setUsageStatsOpen] = useState(false);
  const [usageStats, setUsageStats] = useState(null);
  const [usageStatsLoading, setUsageStatsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isWebhookFormOpen, setIsWebhookFormOpen] = useState(false);
  const [currentWebhook, setCurrentWebhook] = useState(null);
  const [webhookTestDialogOpen, setWebhookTestDialogOpen] = useState(false);
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState(null);

  // Schema discovery state
  const [schemaDiscoveryOpen, setSchemaDiscoveryOpen] = useState(false);
  const [selectedDiscoveryMethod, setSelectedDiscoveryMethod] = useState('');
'  const [discoveryConfig, setDiscoveryConfig] = useState({});
  const [discoveredFields, setDiscoveredFields] = useState([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [createDatasetOpen, setCreateDatasetOpen] = useState(false);
  const [newDatasetName, setNewDatasetName] = useState('');
'  const [newDatasetDescription, setNewDatasetDescription] = useState('');
'
  // Tenant-related state
  const [applicationTenants, setApplicationTenants] = useState([]);
  const [tenantUpdateLoading, setTenantUpdateLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
'    type: 'api',
'    description: '',
'    auth_type: 'none',
'    status: 'draft',
'    is_public: false,
    connection_parameters: [],
    documentation_url: '',
'    support_url: '',
'    associated_datasets: [],
  });

  const [webhookFormData, setWebhookFormData] = useState({
    name: '',
'    url: '',
'    description: '',
'    auth_type: 'none',
'    auth_credentials: null,
    headers: {},
    events: [],
    is_secure: true,
    timeout_seconds: 5,
    retry_count: 3,
    retry_interval_seconds: 60,
  });

  const [formErrors, setFormErrors] = useState({});

  // Load applications, datasets, and tenants
  useEffect(() => {
    fetchApplications();
    fetchDatasets();
    fetchTenants();
  }, [fetchApplications, fetchDatasets, fetchTenants]);

  // Handle search input
  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
  };

  // Filter applications based on search term
  const filteredApplications = applications.filter(
    app =>
      app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id?.toString().includes(searchTerm.toLowerCase())
  );

  // Handle refresh button
  const handleRefresh = () => {
  // Added display name
  handleRefresh.displayName = 'handleRefresh';

  // Added display name
  handleRefresh.displayName = 'handleRefresh';

  // Added display name
  handleRefresh.displayName = 'handleRefresh';
'

    fetchApplications();
    showToast('Applications refreshed', 'info');
'  };

  // Reset form state
  const resetFormState = () => {
  // Added display name
  resetFormState.displayName = 'resetFormState';

  // Added display name
  resetFormState.displayName = 'resetFormState';

  // Added display name
  resetFormState.displayName = 'resetFormState';
'

    setFormData({
      name: '',
'      type: 'api',
'      description: '',
'      auth_type: 'none',
'      status: 'draft',
'      is_public: false,
      connection_parameters: [],
      documentation_url: '',
'      support_url: '',
'      associated_datasets: [],
    });
    setFormErrors({});
  };

  // Open create application dialog
  const handleOpenCreateDialog = () => {
  // Added display name
  handleOpenCreateDialog.displayName = 'handleOpenCreateDialog';

  // Added display name
  handleOpenCreateDialog.displayName = 'handleOpenCreateDialog';

  // Added display name
  handleOpenCreateDialog.displayName = 'handleOpenCreateDialog';
'

    resetFormState();
    setOpenDialog(true);
  };

  // Close create application dialog
  const handleCloseDialog = () => {
  // Added display name
  handleCloseDialog.displayName = 'handleCloseDialog';

  // Added display name
  handleCloseDialog.displayName = 'handleCloseDialog';

  // Added display name
  handleCloseDialog.displayName = 'handleCloseDialog';
'

    setOpenDialog(false);
  };

  // Handle input change for application form
  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
'    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Clear validation error when field is modified
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle selection change for associated datasets
  const handleDatasetSelection = e => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, associated_datasets: value }));
  };

  // Validate form inputs
  const validateForm = () => {
  // Added display name
  validateForm.displayName = 'validateForm';

  // Added display name
  validateForm.displayName = 'validateForm';

  // Added display name
  validateForm.displayName = 'validateForm';
'

    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
'    }

    if (!formData.type) {
      errors.type = 'Type is required';
'    }

    if (!formData.status) {
      errors.status = 'Status is required';
'    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      let result;

      if (formData.id) {
        // Update existing application
        result = await contextUpdateApplication(formData.id, formData);
        showToast('Application updated successfully', 'success');
'      } else {
        // Create new application
        result = await contextCreateApplication(formData);
        showToast('Application created successfully', 'success');
'        addNotification({
          title: 'New Application Created`,
'          message: `Application "${formData.name}" has been created successfully.`,
"          type: `success',
'        });
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving application:', error);
'      showToast('Failed to save application', 'error`);
'    }
  };

  // Handle opening application detail dialog
  const handleOpenDetails = async application => {
    await fetchApplicationById(application.id);
    setDetailDialogOpen(true);
    setActiveTab(0);
    fetchApplicationTenants(application.id);
  };

  // Fetch application tenants
  const fetchApplicationTenants = async applicationId => {
    setTenantUpdateLoading(true);
    try {
      // Get all tenants that have access to this application
      const data = [];

      // For each tenant, check if they have access to this application
      for (const tenant of tenants) {
        try {
          const tenantApps = await adminService.getTenantApplications(tenant.id);
          if (tenantApps.some(app => app.id === applicationId)) {
            data.push(tenant);
          }
        } catch (error) {
          console.error(`Error checking tenant ${tenant.id} applications:`, error);
        }
      }

      setApplicationTenants(data);
    } catch (error) {
      console.error(`Error fetching application tenants:', error);
'      showToast('Failed to load tenant information', 'error');
'    } finally {
      setTenantUpdateLoading(false);
    }
  };

  // Close application detail dialog
  const handleCloseDetails = () => {
  // Added display name
  handleCloseDetails.displayName = 'handleCloseDetails';

  // Added display name
  handleCloseDetails.displayName = 'handleCloseDetails';

  // Added display name
  handleCloseDetails.displayName = 'handleCloseDetails';
'

    setDetailDialogOpen(false);
    clearCurrentApplication();
  };

  // Handle tab change in application detail dialog
  const handleTabChange = (event, newValue) => {
  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';
'

    setActiveTab(newValue);
  };

  // Open confirm delete dialog;
  const handleConfirmDelete = application => {
    setApplicationToDelete(application);
    setDeleteConfirmOpen(true);
  };

  // Handle delete application;
  const handleDeleteApplication = async () => {
    if (!applicationToDelete) return;

    try {
      await contextDeleteApplication(applicationToDelete.id);
      setDeleteConfirmOpen(false);
      showToast('Application deleted successfully', 'success');
'
      // If detail dialog is open for this application, close it
      if (detailDialogOpen && currentApplication?.id === applicationToDelete.id) {
        handleCloseDetails();
      }
    } catch (error) {
      console.error('Error deleting application:', error);
'      showToast('Failed to delete application', 'error');
'    } finally {
      setApplicationToDelete(null);
    }
  };

  // Handle edit application
  const handleEditApplication = application => {
    setFormData({ ...application });
    setOpenDialog(true);
  };

  // Open usage stats dialog
  const handleOpenUsageStats = async application => {
    setUsageStatsOpen(true);
    setUsageStatsLoading(true);

    try {
      const stats = await adminService.getApplicationUsageStats(application.id);
      setUsageStats(stats);
    } catch (error) {
      console.error('Error fetching application usage stats:', error);
'      showToast('Failed to load usage statistics', 'error');
'    } finally {
      setUsageStatsLoading(false);
    }
  };

  // Close usage stats dialog
  const handleCloseUsageStats = () => {
  // Added display name
  handleCloseUsageStats.displayName = 'handleCloseUsageStats';

  // Added display name
  handleCloseUsageStats.displayName = 'handleCloseUsageStats';

  // Added display name
  handleCloseUsageStats.displayName = 'handleCloseUsageStats';
'

    setUsageStatsOpen(false);
    setUsageStats(null);
  };

  // Handle webhook form dialog
  const handleOpenWebhookForm = (webhook = null) => {
  // Added display name
  handleOpenWebhookForm.displayName = 'handleOpenWebhookForm';

  // Added display name
  handleOpenWebhookForm.displayName = 'handleOpenWebhookForm';

  // Added display name
  handleOpenWebhookForm.displayName = 'handleOpenWebhookForm';
'

    if (webhook) {
      setCurrentWebhook(webhook);
      setWebhookFormData({ ...webhook });
    } else {
      setCurrentWebhook(null);
      setWebhookFormData({
        name: '',
'        url: '',
'        description: '',
'        auth_type: 'none',
'        auth_credentials: null,
        headers: {},
        events: [],
        is_secure: true,
        timeout_seconds: 5,
        retry_count: 3,
        retry_interval_seconds: 60,
      });
    }

    setIsWebhookFormOpen(true);
  };

  // Close webhook form dialog
  const handleCloseWebhookForm = () => {
  // Added display name
  handleCloseWebhookForm.displayName = 'handleCloseWebhookForm';

  // Added display name
  handleCloseWebhookForm.displayName = 'handleCloseWebhookForm';

  // Added display name
  handleCloseWebhookForm.displayName = 'handleCloseWebhookForm';
'

    setIsWebhookFormOpen(false);
    setCurrentWebhook(null);
  };

  // Handle webhook form input change
  const handleWebhookInputChange = e => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
'    setWebhookFormData(prev => ({ ...prev, [name]: newValue }));
  };

  // Handle webhook events selection
  const handleWebhookEventsChange = e => {
    const { value } = e.target;
    setWebhookFormData(prev => ({ ...prev, events: value }));
  };

  // Handle webhook form submission
  const handleSubmitWebhook = async () => {
    if (!currentApplication) return;

    try {
      if (currentWebhook) {
        // Update existing webhook
        await adminService.updateWebhook(currentWebhook.id, {
          ...webhookFormData,
          application_id: currentApplication.id,
        });
        showToast('Webhook updated successfully', 'success');
'      } else {
        // Create new webhook
        await adminService.createWebhook({
          ...webhookFormData,
          application_id: currentApplication.id,
        });
        showToast('Webhook created successfully', 'success');
'      }

      handleCloseWebhookForm();
      fetchApplicationById(currentApplication.id);
    } catch (error) {
      console.error('Error saving webhook:', error);
'      showToast('Failed to save webhook', 'error');
'    }
  };

  // Handle webhook test
  const handleTestWebhook = async webhook => {
    setWebhookTestDialogOpen(true);
    setWebhookTesting(true);
    setWebhookTestResult(null);

    try {
      const result = await adminService.testWebhook(webhook.id);
      setWebhookTestResult({
        success: true,
        statusCode: result.status_code,
        responseTime: result.response_time_ms,
        message: result.message,
      });
    } catch (error) {
      console.error('Error testing webhook:', error);
'      setWebhookTestResult({
        success: false,
        message: error.message || 'Failed to test webhook',
'      });
    } finally {
      setWebhookTesting(false);
    }
  };

  // Handle webhook deletion;
  const handleDeleteWebhook = async webhook => {
    if (!currentApplication) return;

    try {
      await adminService.deleteWebhook(webhook.id);
      showToast('Webhook deleted successfully', 'success');
'      fetchApplicationById(currentApplication.id);
    } catch (error) {
      console.error('Error deleting webhook:', error);
'      showToast('Failed to delete webhook', 'error');
'    }
  };

  // Handle schema discovery dialog
  const handleOpenSchemaDiscovery = () => {
  // Added display name
  handleOpenSchemaDiscovery.displayName = 'handleOpenSchemaDiscovery';

  // Added display name
  handleOpenSchemaDiscovery.displayName = 'handleOpenSchemaDiscovery';

  // Added display name
  handleOpenSchemaDiscovery.displayName = 'handleOpenSchemaDiscovery';
'

    setSchemaDiscoveryOpen(true);
    setSelectedDiscoveryMethod('');
'    setDiscoveryConfig({});
    setDiscoveredFields([]);
  };

  // Close schema discovery dialog
  const handleCloseSchemaDiscovery = () => {
  // Added display name
  handleCloseSchemaDiscovery.displayName = 'handleCloseSchemaDiscovery';

  // Added display name
  handleCloseSchemaDiscovery.displayName = 'handleCloseSchemaDiscovery';

  // Added display name
  handleCloseSchemaDiscovery.displayName = 'handleCloseSchemaDiscovery';
'

    setSchemaDiscoveryOpen(false);
    setDiscoveredFields([]);
  };

  // Handle discovery method selection
  const handleDiscoveryMethodChange = e => {
    setSelectedDiscoveryMethod(e.target.value);
    setDiscoveryConfig({});
  };

  // Handle discovery config changes
  const handleDiscoveryConfigChange = e => {
    const { name, value } = e.target;
    setDiscoveryConfig(prev => ({ ...prev, [name]: value }));
  };

  // Handle schema discovery
  const handleDiscoverSchema = async () => {
    if (!currentApplication || !selectedDiscoveryMethod) return;

    setDiscoveryLoading(true);
    try {
      const fields = await adminService.discoverApplicationSchema(
        currentApplication.id,
        selectedDiscoveryMethod,
        discoveryConfig
      );

      setDiscoveredFields(fields);

      // Show success notification
      showToast('Schema discovered successfully', 'success`);
'
      // Open create dataset dialog if fields were found
      if (fields && fields.length > 0) {
        setNewDatasetName(`${currentApplication.name} Dataset`);
        setNewDatasetDescription(`Dataset for ${currentApplication.name}`);
      }
    } catch (error) {
      console.error(`Error discovering schema:', error);
'      showToast('Failed to discover schema', 'error');
'    } finally {
      setDiscoveryLoading(false);
    }
  };

  // Open create dataset dialog
  const handleOpenCreateDataset = () => {
  // Added display name
  handleOpenCreateDataset.displayName = 'handleOpenCreateDataset';

  // Added display name
  handleOpenCreateDataset.displayName = 'handleOpenCreateDataset';

  // Added display name
  handleOpenCreateDataset.displayName = 'handleOpenCreateDataset';
'

    setCreateDatasetOpen(true);
  };

  // Close create dataset dialog
  const handleCloseCreateDataset = () => {
  // Added display name
  handleCloseCreateDataset.displayName = 'handleCloseCreateDataset';

  // Added display name
  handleCloseCreateDataset.displayName = 'handleCloseCreateDataset';

  // Added display name
  handleCloseCreateDataset.displayName = 'handleCloseCreateDataset';
'

    setCreateDatasetOpen(false);
  };

  // Handle create dataset from schema
  const handleCreateDatasetFromSchema = async () => {
    if (!currentApplication || !discoveredFields.length) return;

    try {
      const dataset = await adminService.createDatasetFromSchema(
        currentApplication.id,
        newDatasetName,
        newDatasetDescription,
        discoveredFields
      );

      // Update datasets
      fetchDatasets();

      // Close dialogs
      handleCloseCreateDataset();
      handleCloseSchemaDiscovery();

      // Show success notification
      addNotification({
        title: 'Dataset Created`,
'        message: `Dataset "${newDatasetName}" has been created successfully from the discovered schema.`,
"        type: `success',
'        actionLabel: 'View Dataset`,
'        onActionClick: () => (window.location.href = `/admin/datasets/${dataset.id}`),
      });
    } catch (error) {
      console.error(`Error creating dataset from schema:', error);
'      showToast('Failed to create dataset', 'error`);
'    }
  };

  // Handle tenant access toggle
  const handleToggleTenantAccess = async (tenant, hasAccess) => {
    if (!currentApplication) return;

    setTenantUpdateLoading(true);
    try {
      if (hasAccess) {
        // Remove access
        await adminService.removeApplicationFromTenant(tenant.id, currentApplication.id);
        setApplicationTenants(prev => prev.filter(t => t.id !== tenant.id));
        showToast(`Removed application access from tenant `${tenant.name}`, `info`);
      } else {
        // Grant access
        await adminService.addApplicationToTenant(tenant.id, currentApplication.id);
        setApplicationTenants(prev => [...prev, tenant]);
        showToast(`Granted application access to tenant `${tenant.name}`, `success');
'      }
    } catch (error) {
      console.error('Error updating tenant access:', error);
'      showToast('Failed to update tenant access', 'error');
'    } finally {
      setTenantUpdateLoading(false);
    }
  };

  return (
    <Box>
      {/* Header with actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
"        <Typography variant="h5">Manage Applications</Typography>;
"
        <Box display="flex" style={{ gap: '16px' }}>
"          <Button variant="outlined" onClick={handleRefresh}>;
"            <Box as="span" display="flex" alignItems="center">
"              <RefreshIcon style={{ marginRight: '8px' }} />
'              Refresh
            </RefreshIcon></Box>
          </Button>

          <Button variant="contained" onClick={handleOpenCreateDialog}>;
"            <Box as="span" display="flex" alignItems="center">
"              <AddIcon style={{ marginRight: '8px' }} />
'              New Application
            </AddIcon></Box>
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search applications..."
"        value={searchTerm}
        onChange={handleSearchChange}
        style={{ marginBottom: '24px' }}
'        startAdornment={<SearchIcon /></TextField>}
      />

      {/* Applications table */}
      <ResourceLoader
        loading={applicationLoading}
        error={applicationError}
        isEmpty={filteredApplications.length === 0}
        emptyMessage="No applications found"
"        onRetry={fetchApplications}
        useSkeleton={true}
        skeletonCount={3}
      >
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Cell>Name</Table.Cell>
              <Table.Cell>Type</Table.Cell>
              <Table.Cell>Authentication</Table.Cell>
              <Table.Cell>Status</Table.Cell>
              <Table.Cell>Datasets</Table.Cell>
              <Table.Cell align="right">Actions</Table.Cell>
"            </Table.Row>
          </Table.Head>
          <Table.Body>
            {filteredApplications.map(app => (
              <Table.Row key={app.id}>
                <Table.Cell>
                  <Box display="flex" alignItems="center">
"                    <AppsIcon style={{ marginRight: '8px', color: '#1976d2' }} />
'                    <Typography variant="body1">{app.name}</Typography>;
"                  </AppsIcon></Box>
                </Table.Cell>
                <Table.Cell>{appTypeDisplay[app.type] || app.type}</Table.Cell>
                <Table.Cell>{authTypeDisplay[app.auth_type] || app.auth_type}</Table.Cell>
                <Table.Cell>
                  <Chip
                    label={app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    color={statusColors[app.status] || 'default'}
'                    size="small"
"                    variant="outlined";
"                  />
                </Chip></Table.Cell>
                <Table.Cell>
                  {app.associated_datasets && app.associated_datasets.length > 0 ? (
                    <Chip
                      label={app.associated_datasets.length}
                      color="secondary"
"                      size="small"
"                      icon={<StorageIcon />}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">;
"                      None
                    </Typography>
                  )}
                </Chip></Table.Cell>
                <Table.Cell align="right">
"                  <Box display="flex" justifyContent="flex-end">
"                    <Box
                      as="button"
"                      aria-label="View Details"
"                      title="View Details"
"                      onClick={() => handleOpenDetails(app)}
                      style={{
                        background: 'transparent',
'                        border: 'none',
'                        padding: '4px',
'                        margin: '0 4px',
'                        cursor: 'pointer',
'                        borderRadius: '4px',
'                        display: 'inline-flex',
'                        alignItems: 'center',
'                        justifyContent: 'center'
'                      }}
                    >
                      <VisibilityIcon style={{ fontSize: '20px' }} />
'                    </VisibilityIcon></Box>
                    <Box
                      as="button"
"                      aria-label="Edit"
"                      title="Edit"
"                      onClick={() => handleEditApplication(app)}
                      style={{
                        background: 'transparent',
'                        border: 'none',
'                        padding: '4px',
'                        margin: '0 4px',
'                        cursor: 'pointer',
'                        borderRadius: '4px',
'                        display: 'inline-flex',
'                        alignItems: 'center',
'                        justifyContent: 'center'
'                      }}
                    >
                      <EditIcon style={{ fontSize: '20px' }} />
'                    </EditIcon></Box>
                    <Box
                      as="button"
"                      aria-label="Delete";
"                      title="Delete";
"                      onClick={() => handleConfirmDelete(app)}
                      style={{
                        background: 'transparent',
'                        border: 'none',
'                        padding: '4px',
'                        margin: '0 4px',
'                        cursor: 'pointer',
'                        borderRadius: '4px',
'                        display: 'inline-flex',
'                        alignItems: 'center',
'                        justifyContent: 'center',
'                        color: '#d32f2f'
'                      }}
                    >
                      <DeleteIcon style={{ fontSize: '20px' }} />;
'                    </DeleteIcon></Box>;
                  </Box>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </ResourceLoader>

      {/* Create/Edit Application Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        size="lg"
"        title={formData.id ? 'Edit Application' : 'Create New Application'}
'        actions={
          <>
            <Button variant="text" onClick={handleCloseDialog}>Cancel</Button>;
"            <Button variant="contained" onClick={handleSubmit}>;
"              <Box as="span" display="flex" alignItems="center">
"                <SaveIcon style={{ marginRight: '8px' }} />
'                {formData.id ? 'Update' : 'Create'}
'              </SaveIcon></Box>
            </Button>
          </>
        }
      >
        <Grid container spacing={2} style={{ marginTop: '8px' }}>
'          <Grid item xs={12} sm={6}>
            <Box mb={2}>
              <Typography variant="subtitle2" component="label" htmlFor="app-name">Name *</Typography>;
"              <TextField
                id="app-name"
"                name="name"
"                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
              />
            </TextField></Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box mb={2}>
              <Typography variant="subtitle2" component="label" htmlFor="app-type">Type *</Typography>;
"              <Select
                id="app-type"
"                name="type"
"                fullWidth
                value={formData.type}
                onChange={handleInputChange}
                error={!!formErrors.type}
              >
                <Select.Option value="api">API</Select.Option>
"                <Select.Option value="file">File Storage</Select.Option>
"                <Select.Option value="database">Database</Select.Option>
"                <Select.Option value="custom">Custom</Select.Option>
"              </Select>
              {formErrors.type && (
                <Typography variant="caption" color="error">{formErrors.type}</Typography>;
"              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box mb={2}>
              <Typography variant="subtitle2" component="label" htmlFor="auth-type">Authentication Type</Typography>;
"              <Select
                id="auth-type"
"                name="auth_type"
"                fullWidth
                value={formData.auth_type}
                onChange={handleInputChange}
              >
                <Select.Option value="none">None</Select.Option>
"                <Select.Option value="api_key">API Key</Select.Option>
"                <Select.Option value="oauth2">OAuth 2.0</Select.Option>
"                <Select.Option value="basic">Basic Auth</Select.Option>
"                <Select.Option value="custom">Custom</Select.Option>
"              </Select>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box mb={2}>
              <Typography variant="subtitle2" component="label" htmlFor="app-status">Status *</Typography>;
"              <Select
                id="app-status"
"                name="status"
"                fullWidth
                value={formData.status}
                onChange={handleInputChange}
                error={!!formErrors.status}
              >
                <Select.Option value="draft">Draft</Select.Option>
"                <Select.Option value="active">Active</Select.Option>
"                <Select.Option value="inactive">Inactive</Select.Option>
"                <Select.Option value="deprecated">Deprecated</Select.Option>
"              </Select>
              {formErrors.status && (
                <Typography variant="caption" color="error">{formErrors.status}</Typography>;
"              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box mb={2}>
              <Typography variant="subtitle2" component="label" htmlFor="app-description">Description</Typography>;
"              <TextField
                id="app-description"
"                name="description"
"                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
              />
            </TextField></Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box mb={2}>
              <Typography variant="subtitle2" component="label" htmlFor="doc-url">Documentation URL</Typography>;
"              <TextField
                id="doc-url"
"                name="documentation_url"
"                fullWidth
                value={formData.documentation_url}
                onChange={handleInputChange}
                placeholder="https://docs.example.com"
"              />
            </TextField></Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box mb={2}>
              <Typography variant="subtitle2" component="label" htmlFor="support-url">Support URL</Typography>;
"              <TextField
                id="support-url"
"                name="support_url"
"                fullWidth
                value={formData.support_url}
                onChange={handleInputChange}
                placeholder="https://support.example.com"
"              />
            </TextField></Box>
          </Grid>
          <Grid item xs={12}>
            <Box mb={2}>
              <Typography variant="subtitle2" component="label" htmlFor="associated-datasets">Associated Datasets</Typography>;
"              <Select
                id="associated-datasets"
"                multiple
                fullWidth
                name="associated_datasets"
"                value={formData.associated_datasets}
                onChange={handleDatasetSelection}
                renderValue={() => (
                  <Box display="flex" flexWrap="wrap" style={{ gap: '4px' }}>
"                    {formData.associated_datasets.map(value => {
                      const dataset = allDatasets.find(d => d.id === value);
                      return (
                        <Chip
                          key={value}
                          label={dataset ? dataset.name : value}
                          size="small"
"                          icon={<StorageIcon />}
                        />
                      );
                    })}
                  </Chip></Box>
                )}
              >
                {allDatasets.map(dataset => (
                  <Select.Option key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </Select.Option>
                ))}
              </Select>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
"              <Switch
                checked={formData.is_public}
                onChange={handleInputChange}
                name="is_public"
"              />
              <Typography variant="body2" style={{ marginLeft: '8px' }}>;
"                Public Application (Available to all tenants)
              </Typography>
            </Switch></Box>
          </Grid>
        </Grid>
      </Dialog>

      {/* Application Detail Dialog */}
      {currentApplication && (
        <Dialog 
          open={detailDialogOpen} 
          onClose={handleCloseDetails} 
          size="lg"
"          title={
            <Box display="flex" alignItems="center">
"              <AppsIcon style={{ marginRight: '8px', color: '#1976d2' }} />
'              <Box>
                <Box display="flex" alignItems="center">
"                  <Typography variant="h6">{currentApplication.name}</Typography>;
"                  <Chip
                    label={
                      currentApplication.status.charAt(0).toUpperCase() +
                      currentApplication.status.slice(1)
                    }
                    color={statusColors[currentApplication.status] || 'default'}
'                    size="small"
"                    variant="outlined";
"                    style={{ marginLeft: '16px' }}
'                  />
                </Chip></Box>
                <Typography variant="body2" color="text.secondary">;
"                  {appTypeDisplay[currentApplication.type] || currentApplication.type} (ID:{' '}
'                  {currentApplication.id})
                </Typography>
              </Box>
            </AppsIcon></Box>
          }
          actions={
            <Button onClick={handleCloseDetails}>Close</Button>
          }
        >
          <Box borderBottom="1px solid" borderColor="divider">
"            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
            >
              <Tabs.Tab icon={<AppsIcon /></AppsIcon>} label="Details" />
"              <Tabs.Tab icon={<DataObjectIcon /></DataObjectIcon>} label="Parameters" />
"              <Tabs.Tab icon={<NotificationsIcon /></NotificationsIcon>} label="Webhooks" />
"              <Tabs.Tab icon={<AnalyticsIcon /></AnalyticsIcon>} label="Usage" />
"              <Tabs.Tab icon={<TenantIcon />} label="Tenants" />
"              <Tabs.Tab icon={<SchemaIcon />} label="Schema Discovery" />
"            </SchemaIcon></Tabs>
          </TenantIcon></Box>

          {/* Details Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>;
"                  Description
                </Typography>
                <Typography variant="body2">;
"                  {currentApplication.description || 'No description provided'}
'                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>;
"                  Authentication
                </Typography>
                <Typography variant="body2">;
"                  {authTypeDisplay[currentApplication.auth_type] || currentApplication.auth_type}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>;
"                  Public
                </Typography>
                <Typography variant="body2">;
"                  {currentApplication.is_public ? 'Yes' : 'No'}
'                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>;
"                  Created
                </Typography>
                <Typography variant="body2">;
"                  {currentApplication.created_at
                    ? new Date(currentApplication.created_at).toLocaleString()
                    : 'Unknown'}
'                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>;
"                  Documentation
                </Typography>
                {currentApplication.documentation_url ? (
                  <Typography variant="body2">;
"                    <Typography 
                      component="a"
"                      href={currentApplication.documentation_url}
                      target="_blank"
"                      rel="noopener noreferrer"
"                      style={{ color: '#1976d2', textDecoration: 'none' }}
'                    >
                      {currentApplication.documentation_url}
                    </Typography>
                  </Typography>
                ) : (
                  <Typography variant="body2">No documentation URL provided</Typography>;
"                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>;
"                  Support
                </Typography>
                {currentApplication.support_url ? (
                  <Typography variant="body2">;
"                    <Typography 
                      component="a"
"                      href={currentApplication.support_url}
                      target="_blank"
"                      rel="noopener noreferrer"
"                      style={{ color: '#1976d2', textDecoration: 'none' }}
'                    >
                      {currentApplication.support_url}
                    </Typography>
                  </Typography>
                ) : (
                  <Typography variant="body2">No support URL provided</Typography>;
"                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>;
"                  Associated Datasets
                </Typography>
                {currentApplication.associated_datasets &&
                currentApplication.associated_datasets.length > 0 ? (
                  <Box display="flex" flexWrap="wrap" style={{ gap: '8px` }}>
"                    {currentApplication.associated_datasets.map(datasetId => {
                      const dataset = allDatasets.find(d => d.id === datasetId);
                      return (
                        <Chip
                          key={datasetId}
                          label={dataset ? dataset.name : `Dataset ${datasetId}`}
                          icon={<StorageIcon />}
                          color="secondary"
"                          variant="outlined";
"                        />
                      );
                    })}
                  </Chip></Box>
                ) : (
                  <Typography variant="body2">;
"                    No datasets associated with this application
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} style={{ marginTop: `16px' }}>
'                <Box display="flex" style={{ gap: '16px' }}>
"                  <Button
                    variant="outlined";
"                    onClick={() => {
                      handleEditApplication(currentApplication);
                      handleCloseDetails();
                    }}
                  >
                    <Box as="span" display="flex" alignItems="center">
"                      <EditIcon style={{ marginRight: '8px' }} />
'                      Edit Application
                    </EditIcon></Box>
                  </Button>
                  <Button
                    variant="outlined";
"                    color="error"
"                    onClick={() => {
                      handleConfirmDelete(currentApplication);
                      handleCloseDetails();
                    }}
                  >
                    <Box as="span" display="flex" alignItems="center">
"                      <DeleteIcon style={{ marginRight: '8px' }} />;
'                      Delete Application;
                    </DeleteIcon></Box>;
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Parameters Tab */}
          <TabPanel value={activeTab} index={1}>
            {/* Parameters content would go here */}
            <Typography variant="body1">;
"              Connection parameters for this application would be managed here.
            </Typography>
          </TabPanel>

          {/* Webhooks Tab */}
          <TabPanel value={activeTab} index={2}>
            <Box display="flex" justifyContent="space-between" mb={2}>
"              <Typography variant="h6">Webhooks</Typography>;
"              <Button
                variant="contained";
"                size="small"
"                onClick={() => handleOpenWebhookForm()}
              >
                <Box as="span" display="flex" alignItems="center">
"                  <AddIcon style={{ marginRight: '8px' }} />
'                  Add Webhook
                </AddIcon></Box>
              </Button>
            </Box>

            {/* Webhooks list would go here */}
            <Typography variant="body1">;
"              Webhooks management for this application would be implemented here.
            </Typography>
          </TabPanel>

          {/* Usage Tab */}
          <TabPanel value={activeTab} index={3}>
            <Box display="flex" justifyContent="space-between" mb={2}>
"              <Typography variant="h6">Usage Statistics</Typography>;
"              <Button
                variant="outlined";
"                size="small"
"                onClick={() => handleOpenUsageStats(currentApplication)}
              >
                <Box as="span" display="flex" alignItems="center">
"                  <RefreshIcon style={{ marginRight: '8px' }} />
'                  Refresh Stats
                </RefreshIcon></Box>
              </Button>
            </Box>

            <Typography variant="body1">;
"              Usage statistics for this application would be displayed here.
            </Typography>
          </TabPanel>

          {/* Tenants Tab */}
          <TabPanel value={activeTab} index={4}>
            <Box mb={2}>
              <Typography variant="subtitle1" gutterBottom>;
"                Manage tenant access to this application
              </Typography>
              <Alert severity="info" style={{ marginBottom: '16px' }}>
"                <Typography variant="body2">;
"                  Control which tenants have access to this application. Note that public
                  applications are accessible to all tenants regardless of these settings.
                </Typography>
              </Alert>
            </Box>

            <ResourceLoader
              loading={tenantUpdateLoading}
              error={null}
              isEmpty={tenants.length === 0}
              emptyMessage="No tenants available"
"            >
              <Box>
                <Box borderBottom="1px solid" borderColor="divider" />
"                {tenants.map(tenant => {
                  const hasAccess = applicationTenants.some(t => t.id === tenant.id);

                  return (
                    <React.Fragment key={tenant.id}>
                      <Box 
                        display="flex" 
"                        alignItems="center" 
"                        p={2} 
                        borderBottom="1px solid" 
"                        borderColor="divider"
"                      >
                        <Box mr={2}>
                          <TenantIcon style={{ color: hasAccess ? '#1976d2' : '#757575' }} />
'                        </TenantIcon></Box>
                        <Box flex={1}>
                          <Typography variant="body1">{tenant.name}</Typography>;
"                          <Typography variant="body2" color="text.secondary">{tenant.domain}</Typography>;
"                        </Box>
                        <Box
                          as="button"
"                          aria-label={hasAccess ? 'Remove Access' : 'Grant Access'}
'                          title={hasAccess ? 'Remove Access' : 'Grant Access'}
'                          onClick={() => handleToggleTenantAccess(tenant, hasAccess)}
                          style={{
                            background: 'transparent',
'                            border: 'none',
'                            padding: '8px',
'                            cursor: 'pointer',
'                            borderRadius: '4px',
'                            display: 'inline-flex',
'                            alignItems: 'center',
'                            justifyContent: 'center',
'                            color: hasAccess ? '#d32f2f' : '#2e7d32'
'                          }}
                        >
                          {hasAccess ? <LinkOffIcon /> : <LinkIcon />}
                        </LinkIcon></LinkOffIcon></Box>
                      </Box>
                    </React.Fragment>
                  );
                })}
              </Box>
            </ResourceLoader>
          </TabPanel>

          {/* Schema Discovery Tab */}
          <TabPanel value={activeTab} index={5}>
            <Box mb={2}>
              <Typography variant="subtitle1" gutterBottom>;
"                Discover and create datasets from this application
              </Typography>
              <Alert severity="info" style={{ marginBottom: '16px' }}>
"                <Typography variant="body2">;
"                  Automatically discover data schemas from this application and create associated
                  datasets.
                </Typography>
              </Alert>

              <Button
                variant="contained";
"                onClick={handleOpenSchemaDiscovery}
              >
                <Box as="span" display="flex" alignItems="center">
"                  <AutoAwesomeIcon style={{ marginRight: '8px' }} />
'                  Start Schema Discovery
                </AutoAwesomeIcon></Box>
              </Button>
            </Box>
          </TabPanel>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteConfirmOpen};
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Delete";
"        actions={
          <>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>;
            <Button
              onClick={handleDeleteApplication}
              color="error"
"              variant="contained";
"            >
              <Box as="span" display="flex" alignItems="center">
"                <DeleteIcon style={{ marginRight: '8px' }} />;
'                Delete;
              </DeleteIcon></Box>;
            </Button>
          </>
        }
      >
        <Typography>
          Are you sure you want to delete the application "{applicationToDelete?.name}"?;
"          This action cannot be undone.
        </Typography>
        <Box mt={2}>
          <Alert severity="warning">
"            <Typography variant="body2">;
"              Deleting this application may impact any integrations that use it. Make sure there are;
              no active dependencies before continuing.
            </Typography>
          </Alert>
        </Box>
      </Dialog>

      {/* Schema Discovery Dialog */}
      <Dialog
        open={schemaDiscoveryOpen}
        onClose={handleCloseSchemaDiscovery}
        size="lg"
"        title="Discover Schema"
"        actions={
          <>
            <Button onClick={handleCloseSchemaDiscovery}>Cancel</Button>
            <Button
              variant="contained";
"              onClick={handleDiscoverSchema}
              disabled={!selectedDiscoveryMethod || discoveryLoading}
            >
              <Box as="span" display="flex" alignItems="center">
"                {discoveryLoading ? (
                  <>
                    <CircularProgress size={20} style={{ marginRight: '8px' }} />
'                    Discovering...
                  </CircularProgress></>
                ) : (
                  <>
                    <SchemaIcon style={{ marginRight: '8px' }} />
'                    Discover Schema
                  </SchemaIcon></>
                )}
              </Box>
            </Button>
          </>
        }
      >
        <Typography variant="subtitle1" gutterBottom>;
"          Select a method to discover data schema from {currentApplication?.name}
        </Typography>

        <Box mb={3}>
          <Typography variant="subtitle2" component="label" htmlFor="discovery-method" gutterBottom>;
"            Discovery Method
          </Typography>
          <Select
            id="discovery-method"
"            fullWidth
            value={selectedDiscoveryMethod}
            onChange={handleDiscoveryMethodChange}
          >
            {SCHEMA_DISCOVERY_METHODS.map(method => (
              <Select.Option key={method.value} value={method.value}>
                <Box display="flex" alignItems="center">
"                  <Box mr={1}>{method.icon}</Box>
                  <Box>
                    <Typography variant="body1">{method.label}</Typography>;
"                    <Typography variant="caption" color="text.secondary">;
"                      {method.description}
                    </Typography>
                  </Box>
                </Box>
              </Select.Option>
            ))}
          </Select>
        </Box>

        {/* Discovery config inputs based on selected method */}
        {selectedDiscoveryMethod && (
          <Box mb={3}>
            {/* Configuration inputs would go here */}
            <Typography variant="body1">;
"              Configuration for {selectedDiscoveryMethod} discovery method would be implemented
              here.
            </Typography>
          </Box>
        )}

        {/* Discovered fields */}
        {discoveredFields.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle1" gutterBottom>;
"              Discovered Fields
            </Typography>
            <Box style={{ maxHeight: '300px', overflow: 'auto' }}>
'              <Box borderTop="1px solid" borderColor="divider">
"                {discoveredFields.map((field, index) => (
                  <Box 
                    key={index} 
                    p={2}
                    borderBottom="1px solid" 
"                    borderColor="divider"
"                  >
                    <Typography variant="body1" fontWeight="medium">{field.name}</Typography>;
"                    <Typography component="span" variant="body2" color="text.primary">;
"                      Type: {field.type}
                    </Typography>
                    {field.description && (
                      <Typography component="span" variant="body2" display="block">;
"                        {field.description}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>

            <Box mt={2} display="flex" justifyContent="flex-end">
"              <Button
                variant="contained";
"                color="primary"
"                onClick={handleOpenCreateDataset}
              >
                <Box as="span" display="flex" alignItems="center">
"                  <StorageIcon style={{ marginRight: '8px' }} />
'                  Create Dataset from Schema
                </StorageIcon></Box>
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>

      {/* Create Dataset from Schema Dialog */}
      <Dialog 
        open={createDatasetOpen} 
        onClose={handleCloseCreateDataset} 
        size="md"
"        title="Create Dataset from Schema"
"        actions={
          <>
            <Button onClick={handleCloseCreateDataset}>Cancel</Button>
            <Button
              variant="contained";
"              onClick={handleCreateDatasetFromSchema}
              disabled={!newDatasetName}
            >
              <Box as="span" display="flex" alignItems="center">
"                <SaveIcon style={{ marginRight: '8px' }} />
'                Create Dataset
              </SaveIcon></Box>
            </Button>
          </>
        }
      >
        <Grid container spacing={2} style={{ marginTop: '8px' }}>
'          <Grid item xs={12}>
            <Box mb={2}>
              <Typography variant="subtitle2" component="label" htmlFor="dataset-name" gutterBottom>;
"                Dataset Name *
              </Typography>
              <TextField
                id="dataset-name"
"                fullWidth
                required
                value={newDatasetName}
                onChange={e => setNewDatasetName(e.target.value)}
              />
            </TextField></Box>
          </Grid>
          <Grid item xs={12}>
            <Box mb={2}>
              <Typography variant="subtitle2" component="label" htmlFor="dataset-description" gutterBottom>;
"                Description
              </Typography>
              <TextField
                id="dataset-description"
"                fullWidth
                multiline
                rows={3}
                value={newDatasetDescription}
                onChange={e => setNewDatasetDescription(e.target.value)}
              />
            </TextField></Box>
          </Grid>
          <Grid item xs={12}>
            <Alert severity="info">
"              <Typography variant="body2">;
"                A new dataset will be created with {discoveredFields.length} discovered fields.
                You can modify the fields later in the dataset settings.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Dialog>
    </Box>
  );
};

export default ApplicationsManager;