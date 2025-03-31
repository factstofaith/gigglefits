// AlertConfiguration.jsx
// -----------------------------------------------------------------------------
// Component for configuring alerts for Azure resources

import React, { useState, useEffect } from 'react';
'import PropTypes from 'prop-types';
'import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  Grid,
  Stack,
} from '../../design-system';
'
// Material UI components still in use
// Design system import already exists;
// Design system import already exists;
import CardHeader from '@mui/material/CardHeader';
// Design system import already exists;
// Design system import already exists;
// Design system import already exists;
// Design system import already exists;
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
// Design system import already exists;
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
// Design system import already exists;
// Design system import already exists;
// Design system import already exists;
// Design system import already exists;
// Design system import already exists;
// Design system import already exists;
// Design system import already exists;
// Design system import already exists;
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
// Import additional MUI components as needed
'
// Icons
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Notifications as NotificationsIcon,
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
'
// Import contexts and services
import { useMonitoring } from '../../contexts/MonitoringContext';
'import { useNotification } from '../../hooks/useNotification';
'import { 
// Design system import already exists;
// Design system import already exists;
'  getAlerts, 
  createAlert, 
  updateAlert, 
  deleteAlert,;
  testAlert 
} from '../../services/azureMonitorService';
'
// Alert Severity options
const ALERT_SEVERITIES = [;
  { value: 'critical', label: 'Critical', color: 'error', icon: <ErrorIcon /></ErrorIcon> },
'  { value: 'error', label: 'Error', color: 'error', icon: <ErrorIcon /></ErrorIcon> },
'  { value: 'warning', label: 'Warning', color: 'warning', icon: <WarningIcon /></WarningIcon> },
'  { value: 'information', label: 'Information', color: 'info', icon: <InfoIcon /></InfoIcon> },
'];

// Alert comparison operators
const OPERATORS = [;
  { value: 'equals', label: 'Equal to', symbol: '=' },
'  { value: 'not_equals', label: 'Not equal to', symbol: '≠' },
'  { value: 'greater_than', label: 'Greater than', symbol: '>' },
'  { value: 'less_than', label: 'Less than', symbol: '<' },
'  { value: 'greater_than_or_equals', label: 'Greater than or equal to', symbol: '≥' },
'  { value: 'less_than_or_equals', label: 'Less than or equal to', symbol: '≤' },
'];

// Time aggregation options
const AGGREGATIONS = [;
  { value: 'average', label: 'Average' },
'  { value: 'minimum', label: 'Minimum' },
'  { value: 'maximum', label: 'Maximum' },
'  { value: 'total', label: 'Total' },
'  { value: 'count', label: 'Count' },
'];

// Time window options
const TIME_WINDOWS = [;
  { value: 5, label: '5 minutes' },
'  { value: 15, label: '15 minutes' },
'  { value: 30, label: '30 minutes' },
'  { value: 60, label: '1 hour' },
'  { value: 360, label: '6 hours' },
'  { value: 720, label: '12 hours' },
'  { value: 1440, label: '24 hours' },
'];

// Notification channels
const NOTIFICATION_CHANNELS = [;
  { value: 'email', label: 'Email notification' },
'  { value: 'webhook', label: 'Webhook' },
'  { value: 'sms', label: 'SMS notification' },
'  { value: 'push', label: 'Push notification' },
'];

/**
 * Component for configuring and managing alerts for Azure resources
 */
const AlertConfiguration = () => {
  // Added display name
  AlertConfiguration.displayName = 'AlertConfiguration';

  // Added display name
  AlertConfiguration.displayName = 'AlertConfiguration';

  // Added display name
  AlertConfiguration.displayName = 'AlertConfiguration';

  // Added display name
  AlertConfiguration.displayName = 'AlertConfiguration';

  // Added display name
  AlertConfiguration.displayName = 'AlertConfiguration';
'

  // Use contexts
  const monitoring = useMonitoring();
  const { showToast } = useNotification();
  
  // State for alerts
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for alert dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  
  // Alert form state
  const [formValues, setFormValues] = useState({
    name: ',
'    description: ',
'    resourceId: ',
'    resourceName: ',
'    metricName: ',
'    severity: 'warning',
'    operator: 'greater_than',
'    threshold: 80,
    aggregation: 'average',
'    timeWindow: 15,
    enabled: true,
    notificationChannels: ['email'],
'    notificationEmail: ',
'    notificationWebhook: ',
'    notificationSms: ',
'  });
  
  // State for resource selection in form
  const [selectedResourceType, setSelectedResourceType] = useState(');
'  const [availableResources, setAvailableResources] = useState([]);
  const [availableMetrics, setAvailableMetrics] = useState([]);
  
  // Load alerts on component mount
  useEffect(() => {
    fetchAlerts();
  }, []);
  
  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAlerts();
      setAlerts(response);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching alerts:', err);
'      setError('Failed to load alerts. Please try again later.');
'      setLoading(false);
    }
  };
  
  // Determine available resources based on selected resource type
  useEffect(() => {
    if (!selectedResourceType) {
      setAvailableResources([]);
      return;
    }
    
    // Find resources of the selected type
    const resources = [];
    
    if (selectedResourceType === 'Microsoft.Web/sites' && monitoring.selectedAppService) {
'      resources.push(monitoring.selectedAppService);
    } else if (selectedResourceType === 'Microsoft.DBforPostgreSQL/servers' && monitoring.selectedDatabase) {
'      resources.push(monitoring.selectedDatabase);
    } else if (selectedResourceType === 'Microsoft.Storage/storageAccounts' && monitoring.selectedStorage) {
'      resources.push(monitoring.selectedStorage);
    } else if (selectedResourceType === 'Microsoft.KeyVault/vaults' && monitoring.selectedKeyVault) {
'      resources.push(monitoring.selectedKeyVault);
    } else if (
      (selectedResourceType === 'Microsoft.Network/virtualNetworks' || 
'       selectedResourceType === 'Microsoft.Network/networkSecurityGroups') && 
'      monitoring.selectedNetwork
    ) {
      resources.push(monitoring.selectedNetwork);
    }
    
    setAvailableResources(resources);
  }, [
    selectedResourceType,
    monitoring.selectedAppService,
    monitoring.selectedDatabase,
    monitoring.selectedStorage,
    monitoring.selectedKeyVault,
    monitoring.selectedNetwork
  ]);
  
  // Determine available metrics based on selected resource type
  useEffect(() => {
    if (!selectedResourceType) {
      setAvailableMetrics([]);
      return;
    }
    
    // Define metrics based on resource type
    let metrics = [];
    
    switch (selectedResourceType) {
      case 'Microsoft.Web/sites':
'        metrics = [
          { value: 'cpu', label: 'CPU Usage (%)' },
'          { value: 'memory', label: 'Memory Usage (%)' },
'          { value: 'responseTime', label: 'HTTP Response Time (ms)' },
'          { value: 'requests', label: 'Request Count' },
'          { value: 'errors', label: 'Error Count' },
'        ];
        break;
      case 'Microsoft.DBforPostgreSQL/servers':
'        metrics = [
          { value: 'cpu', label: 'CPU Usage (%)' },
'          { value: 'memory', label: 'Memory Usage (%)' },
'          { value: 'storage', label: 'Storage Usage (%)' },
'          { value: 'connections', label: 'Connection Count' },
'          { value: 'queryPerformance', label: 'Query Performance (ms)' },
'          { value: 'iops', label: 'IOPS' },
'        ];
        break;
      case 'Microsoft.Storage/storageAccounts':
'        metrics = [
          { value: 'availability', label: 'Availability (%)' },
'          { value: 'transactions', label: 'Transaction Count' },
'          { value: 'latency', label: 'Latency (ms)' },
'          { value: 'capacity', label: 'Capacity Usage (GB)' },
'          { value: 'ingress', label: 'Ingress (MB)' },
'          { value: 'egress', label: 'Egress (MB)' },
'        ];
        break;
      case 'Microsoft.KeyVault/vaults':
'        metrics = [
          { value: 'apiRequests', label: 'API Requests' },
'          { value: 'availability', label: 'Availability (%)' },
'          { value: 'latency', label: 'Latency (ms)' },
'          { value: 'saturation', label: 'Service Saturation (%)' },
'        ];
        break;
      case 'Microsoft.Network/virtualNetworks':
'      case 'Microsoft.Network/networkSecurityGroups':
'        metrics = [
          { value: 'throughput', label: 'Throughput (Mbps)' },
'          { value: 'latency', label: 'Latency (ms)' },
'          { value: 'packetLoss', label: 'Packet Loss (%)' },
'          { value: 'connections', label: 'Connection Count' },
'          { value: 'securityEvents', label: 'Security Events' },
'          { value: 'dataTransfer', label: 'Data Transfer (GB)' },
'        ];
        break;
      default:
        metrics = [];
    }
    
    setAvailableMetrics(metrics);
  }, [selectedResourceType]);
  
  // Open the create alert dialog
  const handleOpenCreateDialog = () => {
  // Added display name
  handleOpenCreateDialog.displayName = 'handleOpenCreateDialog';

  // Added display name
  handleOpenCreateDialog.displayName = 'handleOpenCreateDialog';

  // Added display name
  handleOpenCreateDialog.displayName = 'handleOpenCreateDialog';

  // Added display name
  handleOpenCreateDialog.displayName = 'handleOpenCreateDialog';

  // Added display name
  handleOpenCreateDialog.displayName = 'handleOpenCreateDialog';
'

    setIsEditMode(false);
    setCurrentAlert(null);
    setDialogOpen(true);
    setFormValues({
      name: ',
'      description: ',
'      resourceId: ',
'      resourceName: ',
'      metricName: ',
'      severity: 'warning',
'      operator: 'greater_than',
'      threshold: 80,
      aggregation: 'average',
'      timeWindow: 15,
      enabled: true,
      notificationChannels: ['email'],
'      notificationEmail: ',
'      notificationWebhook: ',
'      notificationSms: ',
'    });
    setSelectedResourceType(');
'  };
  
  // Open the edit alert dialog
  const handleOpenEditDialog = (alert) => {
  // Added display name
  handleOpenEditDialog.displayName = 'handleOpenEditDialog';

  // Added display name
  handleOpenEditDialog.displayName = 'handleOpenEditDialog';

  // Added display name
  handleOpenEditDialog.displayName = 'handleOpenEditDialog';

  // Added display name
  handleOpenEditDialog.displayName = 'handleOpenEditDialog';

  // Added display name
  handleOpenEditDialog.displayName = 'handleOpenEditDialog';
'

    setIsEditMode(true);
    setCurrentAlert(alert);
    setDialogOpen(true);
    
    // Determine resource type from resource ID
    const resourceType = alert.resourceId.split('/providers/')[1].split('/')[0] + '/' +;
'                         alert.resourceId.split('/providers/')[1].split('/')[1];
'    
    setSelectedResourceType(resourceType);
    
    setFormValues({
      name: alert.name,
      description: alert.description || ',
'      resourceId: alert.resourceId,
      resourceName: alert.resourceName,
      metricName: alert.metricName,
      severity: alert.severity,
      operator: alert.operator,
      threshold: alert.threshold,
      aggregation: alert.aggregation,
      timeWindow: alert.timeWindow,
      enabled: alert.enabled,
      notificationChannels: alert.notificationChannels || ['email'],
'      notificationEmail: alert.notificationEmail || ',
'      notificationWebhook: alert.notificationWebhook || ',
'      notificationSms: alert.notificationSms || ',
'    });
  };
  
  // Close the alert dialog
  const handleCloseDialog = () => {
  // Added display name
  handleCloseDialog.displayName = 'handleCloseDialog';

  // Added display name
  handleCloseDialog.displayName = 'handleCloseDialog';

  // Added display name
  handleCloseDialog.displayName = 'handleCloseDialog';

  // Added display name
  handleCloseDialog.displayName = 'handleCloseDialog';

  // Added display name
  handleCloseDialog.displayName = 'handleCloseDialog';
'

    setDialogOpen(false);
    setCurrentAlert(null);
    setSelectedResourceType(');
'  };
  
  // Handle form field changes
  const handleFormChange = (field, value) => {
  // Added display name
  handleFormChange.displayName = 'handleFormChange';

  // Added display name
  handleFormChange.displayName = 'handleFormChange';

  // Added display name
  handleFormChange.displayName = 'handleFormChange';

  // Added display name
  handleFormChange.displayName = 'handleFormChange';

  // Added display name
  handleFormChange.displayName = 'handleFormChange';
'

    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle resource type selection
  const handleResourceTypeChange = (type) => {
  // Added display name
  handleResourceTypeChange.displayName = 'handleResourceTypeChange';

  // Added display name
  handleResourceTypeChange.displayName = 'handleResourceTypeChange';

  // Added display name
  handleResourceTypeChange.displayName = 'handleResourceTypeChange';

  // Added display name
  handleResourceTypeChange.displayName = 'handleResourceTypeChange';

  // Added display name
  handleResourceTypeChange.displayName = 'handleResourceTypeChange';
'

    setSelectedResourceType(type);
    setFormValues(prev => ({
      ...prev,
      resourceId: ',
'      resourceName: ',
'      metricName: ',
'    }));
  };
  
  // Handle resource selection
  const handleResourceSelection = (resourceId, resourceName) => {
  // Added display name
  handleResourceSelection.displayName = 'handleResourceSelection';

  // Added display name
  handleResourceSelection.displayName = 'handleResourceSelection';

  // Added display name
  handleResourceSelection.displayName = 'handleResourceSelection';

  // Added display name
  handleResourceSelection.displayName = 'handleResourceSelection';

  // Added display name
  handleResourceSelection.displayName = 'handleResourceSelection';
'

    setFormValues(prev => ({
      ...prev,
      resourceId,
      resourceName,
    }));
  };
  
  // Toggle notification channel
  const handleToggleNotificationChannel = (channel) => {
  // Added display name
  handleToggleNotificationChannel.displayName = 'handleToggleNotificationChannel';

  // Added display name
  handleToggleNotificationChannel.displayName = 'handleToggleNotificationChannel';

  // Added display name
  handleToggleNotificationChannel.displayName = 'handleToggleNotificationChannel';

  // Added display name
  handleToggleNotificationChannel.displayName = 'handleToggleNotificationChannel';

  // Added display name
  handleToggleNotificationChannel.displayName = 'handleToggleNotificationChannel';
'

    setFormValues(prev => {
      const channels = [...prev.notificationChannels];
      
      if (channels.includes(channel)) {
        // Remove channel
        return {
          ...prev,
          notificationChannels: channels.filter(c => c !== channel)
        };
      } else {
        // Add channel
        return {
          ...prev,
          notificationChannels: [...channels, channel]
        };
      }
    });
  };
  
  // Submit alert form
  const handleSubmitAlert = async () => {
    try {
      // Create alert object
      const alertData = {
        ...formValues,
        threshold: Number(formValues.threshold),
        timeWindow: Number(formValues.timeWindow),
      };
      
      if (isEditMode && currentAlert) {
        // Update existing alert
        await updateAlert(currentAlert.id, alertData);
        showToast('Alert updated successfully', 'success');
'      } else {
        // Create new alert
        await createAlert(alertData);
        showToast('Alert created successfully', 'success');
'      }
      
      // Refresh alerts
      fetchAlerts();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving alert:', err);
'      showToast('Failed to save alert', 'error');
'    }
  };
  
  // Delete alert;
  const handleDeleteAlert = async (alertId) => {
    try {
      await deleteAlert(alertId);
      showToast('Alert deleted successfully', 'success');
'      
      // Refresh alerts
      fetchAlerts();
    } catch (err) {
      console.error('Error deleting alert:', err);
'      showToast('Failed to delete alert', 'error');
'    }
  };
  
  // Test alert
  const handleTestAlert = async (alertId) => {
    try {
      await testAlert(alertId);
      showToast('Test notification sent successfully', 'success');
'    } catch (err) {
      console.error('Error testing alert:', err);
'      showToast('Failed to send test notification', 'error');
'    }
  };
  
  // Toggle alert enabled status
  const handleToggleAlert = async (alert) => {
    try {
      const updatedAlert = {
        ...alert,
        enabled: !alert.enabled
      };
      
      await updateAlert(alert.id, updatedAlert);
      showToast('Alert ${updatedAlert.enabled ? 'enabled' : 'disabled'} successfully', 'success');
'      
      // Refresh alerts
      fetchAlerts();
    } catch (err) {
      console.error('Error toggling alert:', err);
'      showToast('Failed to update alert', 'error');
'    }
  };
  
  // Render severity badge
  const renderSeverityBadge = (severity) => {
  // Added display name
  renderSeverityBadge.displayName = 'renderSeverityBadge';

  // Added display name
  renderSeverityBadge.displayName = 'renderSeverityBadge';

  // Added display name
  renderSeverityBadge.displayName = 'renderSeverityBadge';

  // Added display name
  renderSeverityBadge.displayName = 'renderSeverityBadge';

  // Added display name
  renderSeverityBadge.displayName = 'renderSeverityBadge';
'

    const severityInfo = ALERT_SEVERITIES.find(s => s.value === severity) || ALERT_SEVERITIES[1]; // Default to error;
    
    return (
      <Chip
        size="small&quot;
"        label={severityInfo.label}
        color={severityInfo.color}
        icon={severityInfo.icon}
      /></Chip>
    );
  };
  
  // Render operator symbol
  const getOperatorSymbol = (operatorValue) => {
  // Added display name
  getOperatorSymbol.displayName = 'getOperatorSymbol';

  // Added display name
  getOperatorSymbol.displayName = 'getOperatorSymbol';

  // Added display name
  getOperatorSymbol.displayName = 'getOperatorSymbol';

  // Added display name
  getOperatorSymbol.displayName = 'getOperatorSymbol';

  // Added display name
  getOperatorSymbol.displayName = 'getOperatorSymbol';
'

    const operator = OPERATORS.find(op => op.value === operatorValue);
    return operator ? operator.symbol : '?';
'  };
  
  // Render condition description
  const renderCondition = (alert) => {
  // Added display name
  renderCondition.displayName = 'renderCondition';

  // Added display name
  renderCondition.displayName = 'renderCondition';

  // Added display name
  renderCondition.displayName = 'renderCondition';

  // Added display name
  renderCondition.displayName = 'renderCondition';

  // Added display name
  renderCondition.displayName = 'renderCondition';
'

    const metricLabel = availableMetrics.find(m => m.value === alert.metricName)?.label || alert.metricName;
    const aggregationLabel = AGGREGATIONS.find(a => a.value === alert.aggregation)?.label || alert.aggregation;
    const operatorSymbol = getOperatorSymbol(alert.operator);
    
    return (
      <Box>
        <Typography variant="body2&quot;>;
"          {aggregationLabel} of {metricLabel} {operatorSymbol} {alert.threshold}
        </Typography>
        <Typography variant="caption&quot; color="textSecondary">;
"          over {alert.timeWindow} minutes
        </Typography>
      </Box>
    );
  };
  
  // Render notification channels
  const renderNotificationChannels = (channels) => {
  // Added display name
  renderNotificationChannels.displayName = 'renderNotificationChannels';

  // Added display name
  renderNotificationChannels.displayName = 'renderNotificationChannels';

  // Added display name
  renderNotificationChannels.displayName = 'renderNotificationChannels';

  // Added display name
  renderNotificationChannels.displayName = 'renderNotificationChannels';

  // Added display name
  renderNotificationChannels.displayName = 'renderNotificationChannels';
'

    if (!channels || channels.length === 0) {
      return <Typography variant="body2&quot;>None</Typography>;
"    }
    
    return (
      <Stack direction="row&quot; spacing={1}>
"        {channels.map(channel => {
          const channelInfo = NOTIFICATION_CHANNELS.find(c => c.value === channel);
          return (
            <Chip
              key={channel}
              size="small&quot;
"              label={channelInfo ? channelInfo.label : channel}
              variant="outlined&quot;;
"            />
          );
        })}
      </Chip>
    );
  };
  
  // Render alert list
  const renderAlertList = () => {
  // Added display name
  renderAlertList.displayName = 'renderAlertList';

  // Added display name
  renderAlertList.displayName = 'renderAlertList';

  // Added display name
  renderAlertList.displayName = 'renderAlertList';

  // Added display name
  renderAlertList.displayName = 'renderAlertList';

  // Added display name
  renderAlertList.displayName = 'renderAlertList';
'

    if (loading) {
      return (
        <Box display="flex&quot; justifyContent="center" padding="xl&quot;>
"          <CircularProgress />
        </CircularProgress>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error&quot; style={{ margin: "24px 0' }}>
"          {error}
        </Alert>
      );
    }
    
    if (alerts.length === 0) {
      return (
        <Alert severity="info&quot; style={{ margin: "24px 0' }}>
"          No alerts configured. Click "Add Alert" to create a new alert.
"        </Alert>
      );
    }
    
    return (
      <TableContainer component={Paper} style={{ marginTop: '24px' }}>
'        <Table size="small&quot;>
"          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Resource</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Condition</TableCell>
              <TableCell>Notifications</TableCell>
              <TableCell align="right&quot;>Actions</TableCell>
"            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.map(alert => (
              <TableRow key={alert.id}>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small&quot;
"                        checked={alert.enabled}
                        onChange={() => handleToggleAlert(alert)}
                        color="primary&quot;
"                      />
                    }
                    label="&quot;
"                  />
                </FormControlLabel>
                <TableCell>
                  <Typography variant="body2&quot;>{alert.name}</Typography>;
"                </TableCell>
                <TableCell>
                  <Typography variant="body2&quot;>{alert.resourceName}</Typography>;
"                </TableCell>
                <TableCell>
                  {renderSeverityBadge(alert.severity)}
                </TableCell>
                <TableCell>
                  {renderCondition(alert)}
                </TableCell>
                <TableCell>
                  {renderNotificationChannels(alert.notificationChannels)}
                </TableCell>
                <TableCell align="right&quot;>
"                  <Stack direction="row&quot; spacing={1} justifyContent="flex-end">
"                    <Tooltip title="Test Alert&quot;>
"                      <IconButton
                        size="small&quot;
"                        onClick={() => handleTestAlert(alert.id)}
                      >
                        <NotificationsIcon fontSize="small&quot; />
"                      </NotificationsIcon>
                    </Tooltip>
                    <Tooltip title="Edit Alert&quot;>
"                      <IconButton
                        size="small&quot;
"                        onClick={() => handleOpenEditDialog(alert)}
                      >
                        <EditIcon fontSize="small&quot; />
"                      </EditIcon>
                    </Tooltip>
                    <Tooltip title="Delete Alert&quot;>;
"                      <IconButton
                        size="small&quot;
"                        onClick={() => handleDeleteAlert(alert.id)}
                      >
                        <DeleteIcon fontSize="small&quot; />;
"                      </DeleteIcon>;
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  return (
    <Card>
      <CardHeader
        title="Alert Configuration&quot;
"        subheader="Configure alerts for Azure resources&quot;
"        action={
          <Button
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            variant="contained&quot;;
"          >
            Add Alert
          </CardHeader>
        }
      />
      
      <Divider /></Divider>
      
      <CardContent>
        <Typography variant="body2&quot; paragraph>;
"          Set up alerts to be notified when your Azure resources exceed certain thresholds.
          You can configure alerts for various metrics and receive notifications through;
          different channels such as email, webhooks, or SMS.
        </Typography>
        
        {renderAlertList()}
      </CardContent>
      
      {/* Alert Form Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md&quot;
"        fullWidth
      >
        <DialogTitle>
          {isEditMode ? 'Edit Alert' : 'Create New Alert'}
'        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3} style={{ marginTop: '8px' }}>
'            {/* Alert Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Alert Name&quot;
"                value={formValues.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
'                required
                fullWidth
              />
            </TextField>
            
            {/* Alert Description */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Description (optional)&quot;
"                value={formValues.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
'                fullWidth
              />
            </TextField>
            
            {/* Resource Selection */}
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6&quot;>Resource Selection</Typography>;
"                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    {/* Resource Type */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="resource-type-label&quot;>Resource Type</InputLabel>
"                        <Select
                          labelId="resource-type-label&quot;
"                          value={selectedResourceType}
                          onChange={(e) => handleResourceTypeChange(e.target.value)}
                          label="Resource Type&quot;
"                          required
                        >
                          <MenuItem value="&quot;>Select a resource type</MenuItem>
"                          <MenuItem value="Microsoft.Web/sites&quot;>App Service</MenuItem>
"                          <MenuItem value="Microsoft.DBforPostgreSQL/servers&quot;>PostgreSQL Database</MenuItem>
"                          <MenuItem value="Microsoft.Storage/storageAccounts&quot;>Storage Account</MenuItem>
"                          <MenuItem value="Microsoft.KeyVault/vaults&quot;>Key Vault</MenuItem>
"                          <MenuItem value="Microsoft.Network/virtualNetworks&quot;>Virtual Network</MenuItem>
"                        </Select>
                      </FormControl>
                    </Grid>
                    
                    {/* Resource Name */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="resource-label&quot;>Resource</InputLabel>
"                        <Select
                          labelId="resource-label&quot;
"                          value={formValues.resourceId}
                          onChange={(e) => {
                            const resource = availableResources.find(r => r.id === e.target.value);
                            handleResourceSelection(e.target.value, resource ? resource.name : ');
'                          }}
                          label="Resource&quot;
"                          required
                          disabled={!selectedResourceType || availableResources.length === 0}
                        >
                          <MenuItem value="&quot;>Select a resource</MenuItem>
"                          {availableResources.map(resource => (
                            <MenuItem key={resource.id} value={resource.id}>
                              {resource.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    {/* Metric Name */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="metric-label&quot;>Metric</InputLabel>
"                        <Select
                          labelId="metric-label&quot;
"                          value={formValues.metricName}
                          onChange={(e) => handleFormChange('metricName', e.target.value)}
'                          label="Metric&quot;
"                          required
                          disabled={!selectedResourceType || !formValues.resourceId}
                        >
                          <MenuItem value="&quot;>Select a metric</MenuItem>
"                          {availableMetrics.map(metric => (
                            <MenuItem key={metric.value} value={metric.value}>
                              {metric.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    {/* Alert Severity */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="severity-label&quot;>Severity</InputLabel>
"                        <Select
                          labelId="severity-label&quot;
"                          value={formValues.severity}
                          onChange={(e) => handleFormChange('severity', e.target.value)}
'                          label="Severity&quot;
"                          required
                        >
                          {ALERT_SEVERITIES.map(severity => (
                            <MenuItem key={severity.value} value={severity.value}>
                              <Box display="flex&quot; alignItems="center" gap="8px&quot;>
"                                {severity.icon}
                                {severity.label}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
            
            {/* Alert Condition */}
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6&quot;>Alert Condition</Typography>;
"                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    {/* Condition components */}
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth>
                        <InputLabel id="aggregation-label&quot;>Aggregation</InputLabel>
"                        <Select
                          labelId="aggregation-label&quot;
"                          value={formValues.aggregation}
                          onChange={(e) => handleFormChange('aggregation', e.target.value)}
'                          label="Aggregation&quot;
"                          required
                        >
                          {AGGREGATIONS.map(agg => (
                            <MenuItem key={agg.value} value={agg.value}>
                              {agg.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth>
                        <InputLabel id="operator-label&quot;>Operator</InputLabel>
"                        <Select
                          labelId="operator-label&quot;
"                          value={formValues.operator}
                          onChange={(e) => handleFormChange('operator', e.target.value)}
'                          label="Operator&quot;
"                          required
                        >
                          {OPERATORS.map(op => (
                            <MenuItem key={op.value} value={op.value}>
                              {op.label} ({op.symbol})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        label="Threshold&quot;
"                        value={formValues.threshold}
                        onChange={(e) => handleFormChange('threshold', e.target.value)}
'                        required
                        fullWidth
                        type="number&quot;
"                      />
                    </TextField>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth>
                        <InputLabel id="time-window-label&quot;>Time Window</InputLabel>
"                        <Select
                          labelId="time-window-label&quot;
"                          value={formValues.timeWindow}
                          onChange={(e) => handleFormChange('timeWindow', e.target.value)}
'                          label="Time Window&quot;
"                          required
                        >
                          {TIME_WINDOWS.map(window => (
                            <MenuItem key={window.value} value={window.value}>
                              {window.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Paper variant="outlined&quot; style={{ padding: "16px', backgroundColor: '#f5f5f5' }}>;
"                        <Box display="flex&quot; alignItems="center" gap="8px&quot;>
"                          <TimelineIcon />
                          <Typography variant="body2&quot;>;
"                            Alert when the {formValues.aggregation} of {formValues.metricName
                              ? availableMetrics.find(m => m.value === formValues.metricName)?.label || formValues.metricName
                              : '[select metric]'} is {OPERATORS.find(op => op.value === formValues.operator)?.label || formValues.operator} {formValues.threshold} over {TIME_WINDOWS.find(w => w.value === formValues.timeWindow)?.label || '${formValues.timeWindow} minutes'}
'                          </Typography>
                        </TimelineIcon>
                      </Paper>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
            
            {/* Notification Settings */}
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6&quot;>Notification Settings</Typography>;
"                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    {/* Notification Channels */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2&quot; gutterBottom>;
"                        Notification Channels
                      </Typography>
                      <Box display="flex&quot; gap="16px" flexWrap="wrap&quot;>
"                        {NOTIFICATION_CHANNELS.map(channel => (
                          <FormControlLabel
                            key={channel.value}
                            control={
                              <Switch
                                checked={formValues.notificationChannels.includes(channel.value)}
                                onChange={() => handleToggleNotificationChannel(channel.value)}
                                color="primary&quot;
"                              />
                            }
                            label={channel.label}
                          />
                        ))}
                      </FormControlLabel>
                    </Grid>
                    
                    {/* Email Notification */}
                    {formValues.notificationChannels.includes('email') && (
'                      <Grid item xs={12}>
                        <TextField
                          label="Email Addresses (comma separated)&quot;
"                          value={formValues.notificationEmail}
                          onChange={(e) => handleFormChange('notificationEmail', e.target.value)}
'                          placeholder="admin@example.com, alert@example.com&quot;
"                          fullWidth
                          required
                        />
                      </TextField>
                    )}
                    
                    {/* Webhook Notification */}
                    {formValues.notificationChannels.includes('webhook') && (
'                      <Grid item xs={12}>
                        <TextField
                          label="Webhook URL&quot;
"                          value={formValues.notificationWebhook}
                          onChange={(e) => handleFormChange('notificationWebhook', e.target.value)}
'                          placeholder="https://example.com/webhook&quot;
"                          fullWidth
                          required
                        />
                      </TextField>
                    )}
                    
                    {/* SMS Notification */}
                    {formValues.notificationChannels.includes('sms') && (
'                      <Grid item xs={12}>
                        <TextField
                          label="Phone Numbers (comma separated)&quot;
"                          value={formValues.notificationSms}
                          onChange={(e) => handleFormChange('notificationSms', e.target.value)}
'                          placeholder="+1234567890, +0987654321&quot;
"                          fullWidth
                          required
                        />
                      </TextField>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
            
            {/* Alert Status */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formValues.enabled}
                    onChange={(e) => handleFormChange('enabled', e.target.checked)}
'                    color="primary&quot;
"                  />
                }
                label="Enable this alert&quot;
"              />
            </FormControlLabel>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined&quot;>;
"            Cancel
          </Button>
          <Button
            onClick={handleSubmitAlert}
            variant="contained&quot;;
"            color="primary&quot;
"            disabled={
              !formValues.name ||
              !formValues.resourceId ||
              !formValues.metricName ||
              (formValues.notificationChannels.includes('email') && !formValues.notificationEmail) ||
'              (formValues.notificationChannels.includes('webhook') && !formValues.notificationWebhook) ||
'              (formValues.notificationChannels.includes('sms') && !formValues.notificationSms)
'            }
          >
            {isEditMode ? 'Update Alert' : 'Create Alert'}
'          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default AlertConfiguration;