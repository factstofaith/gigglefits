import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';;
import { 
  Storage as StorageIcon,
  Folder as FolderIcon, 
  Description as FileIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  LockOutlined as LockIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  FolderOpen as BrowseIcon
} from '@mui/icons-material';

import StorageFileBrowserPanel from './StorageFileBrowserPanel';
import FileMonitoringSystem from './FileMonitoringSystem';
import FileTriggerMechanism from './FileTriggerMechanism';
import FileNotificationSystem from './FileNotificationSystem';
/**
 * Configuration panel for storage components (source/destination)
 */
const StorageConfigPanel = ({ 
  node, 
  onChange, 
  onTestConnection, 
  isLoading = false, 
  connectionStatus = null,
  nodeType = 'source'
}) => {
  // Added display name
  StorageConfigPanel.displayName = 'StorageConfigPanel';

  // Added display name
  StorageConfigPanel.displayName = 'StorageConfigPanel';

  // Added display name
  StorageConfigPanel.displayName = 'StorageConfigPanel';

  // Added display name
  StorageConfigPanel.displayName = 'StorageConfigPanel';

  // Added display name
  StorageConfigPanel.displayName = 'StorageConfigPanel';


  // State for form data
  const [formData, setFormData] = useState({
    storageType: 's3',
    containerName: '',
    resourcePath: '',
    fileFormat: 'csv',
    writeMode: 'overwrite',
    credentials: {
      // AWS S3 fields
      awsAccessKeyId: '',
      awsSecretAccessKey: '',
      awsRegion: '',
      // Azure fields
      azureConnectionString: '',
      azureAccountName: '',
      azureAccountKey: '',
      // SharePoint fields
      sharepointSiteUrl: '',
      sharepointClientId: '',
      sharepointClientSecret: '',
      sharepointTenantId: '',
      // Auth mode selection
      authMode: 'key' // 'key', 'connection', 'managed', etc.
    },
    advanced: {
      enableCompression: false,
      pollingInterval: 60,
      maxRetries: 3,
      timeout: 120
    }
  });

  // Tabs state
  const [activeTab, setActiveTab] = useState(0);

  // Validation state
  const [validation, setValidation] = useState({
    containerName: { valid: true, message: '' },
    resourcePath: { valid: true, message: '' }
  });

  // Credentials fields visibility state
  const [showCredentials, setShowCredentials] = useState(false);
  
  // File browser dialog state
  const [fileBrowserOpen, setFileBrowserOpen] = useState(false);

  // State for monitoring and triggers
  const [monitoringConfig, setMonitoringConfig] = useState({
    enabled: false,
    pollingInterval: 60,
    filePatterns: '*.*',
    includeSubfolders: true,
    monitorCreated: true,
    monitorModified: true,
    monitorDeleted: false,
    notifyOnChanges: true,
    triggerWorkflowOnChanges: false
  });
  
  const [triggers, setTriggers] = useState([]);
  
  // State for notifications
  const [notificationConfig, setNotificationConfig] = useState({
    enabled: false,
    channels: {
      email: {
        enabled: true,
        recipients: [],
        digestEnabled: false,
        digestFrequency: 'daily'
      },
      inApp: {
        enabled: true,
        showPopup: true,
        soundEnabled: false
      },
      webhook: {
        enabled: false,
        url: '',
        headers: {},
        formatJson: true
      },
      slack: {
        enabled: false,
        webhookUrl: '',
        channel: ''
      }
    },
    rules: {
      fileCreated: {
        enabled: true,
        severity: 'info',
        channels: ['email', 'inApp']
      },
      fileModified: {
        enabled: true,
        severity: 'info',
        channels: ['inApp']
      },
      fileDeleted: {
        enabled: true,
        severity: 'warning',
        channels: ['email', 'inApp']
      },
      triggerExecuted: {
        enabled: true,
        severity: 'info',
        channels: ['inApp']
      },
      error: {
        enabled: true,
        severity: 'error',
        channels: ['email', 'inApp', 'webhook']
      }
    }
  });

  // Initialize form with node data if available
  useEffect(() => {
    if (node && node.data) {
      setFormData(prevData => ({
        ...prevData,
        storageType: node.data.storageType || prevData.storageType,
        containerName: node.data.containerName || prevData.containerName,
        resourcePath: node.data.resourcePath || prevData.resourcePath,
        fileFormat: node.data.fileFormat || prevData.fileFormat,
        writeMode: node.data.writeMode || prevData.writeMode,
        credentials: {
          ...prevData.credentials,
          ...(node.data.credentials || {})
        },
        advanced: {
          ...prevData.advanced,
          ...(node.data.advanced || {})
        }
      }));
      
      // Initialize monitoring config and triggers if available
      if (node.data.monitoring) {
        setMonitoringConfig(node.data.monitoring);
      }
      
      if (node.data.triggers && Array.isArray(node.data.triggers)) {
        setTriggers(node.data.triggers);
      }
      
      // Initialize notification config if available
      if (node.data.notifications) {
        setNotificationConfig(node.data.notifications);
      }
    }
  }, [node]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';


    setActiveTab(newValue);
  };
  
  // Handle monitoring config change
  const handleMonitoringConfigChange = (newConfig) => {
  // Added display name
  handleMonitoringConfigChange.displayName = 'handleMonitoringConfigChange';

  // Added display name
  handleMonitoringConfigChange.displayName = 'handleMonitoringConfigChange';

  // Added display name
  handleMonitoringConfigChange.displayName = 'handleMonitoringConfigChange';

  // Added display name
  handleMonitoringConfigChange.displayName = 'handleMonitoringConfigChange';

  // Added display name
  handleMonitoringConfigChange.displayName = 'handleMonitoringConfigChange';


    setMonitoringConfig(newConfig);
  };
  
  // Handle triggers change
  const handleTriggersChange = (newData) => {
  // Added display name
  handleTriggersChange.displayName = 'handleTriggersChange';

  // Added display name
  handleTriggersChange.displayName = 'handleTriggersChange';

  // Added display name
  handleTriggersChange.displayName = 'handleTriggersChange';

  // Added display name
  handleTriggersChange.displayName = 'handleTriggersChange';

  // Added display name
  handleTriggersChange.displayName = 'handleTriggersChange';


    if (newData.triggers) {
      setTriggers(newData.triggers);
    }
    
    if (newData.monitoringConfig) {
      setMonitoringConfig(newData.monitoringConfig);
    }
  };
  
  // Handle trigger activation
  const handleTriggerActivated = (triggerEvent) => {
  // Added display name
  handleTriggerActivated.displayName = 'handleTriggerActivated';

  // Added display name
  handleTriggerActivated.displayName = 'handleTriggerActivated';

  // Added display name
  handleTriggerActivated.displayName = 'handleTriggerActivated';

  // Added display name
  handleTriggerActivated.displayName = 'handleTriggerActivated';

  // Added display name
  handleTriggerActivated.displayName = 'handleTriggerActivated';


    // In a real implementation, this would notify the flow canvas
    // or trigger a flow execution
  };
  
  // Handle notification config change
  const handleNotificationConfigChange = (newConfig) => {
  // Added display name
  handleNotificationConfigChange.displayName = 'handleNotificationConfigChange';

  // Added display name
  handleNotificationConfigChange.displayName = 'handleNotificationConfigChange';

  // Added display name
  handleNotificationConfigChange.displayName = 'handleNotificationConfigChange';

  // Added display name
  handleNotificationConfigChange.displayName = 'handleNotificationConfigChange';

  // Added display name
  handleNotificationConfigChange.displayName = 'handleNotificationConfigChange';


    setNotificationConfig(newConfig);
  };
  
  // Handle test notification
  const handleSendTestNotification = (notification) => {
  // Added display name
  handleSendTestNotification.displayName = 'handleSendTestNotification';

  // Added display name
  handleSendTestNotification.displayName = 'handleSendTestNotification';

  // Added display name
  handleSendTestNotification.displayName = 'handleSendTestNotification';

  // Added display name
  handleSendTestNotification.displayName = 'handleSendTestNotification';

  // Added display name
  handleSendTestNotification.displayName = 'handleSendTestNotification';


    // In a real implementation, this would send a notification through the configured channels
  };

  // Handle form changes
  const handleChange = useCallback((e) => {
  // Added display name
  handleChange.displayName = 'handleChange';

    const { name, value, type, checked } = e.target;
    
    setFormData(prevData => {
      const newData = { ...prevData };
      
      // Handle nested properties
      if (name.includes('.')) {
        const [section, field] = name.split('.');
        newData[section] = {
          ...newData[section],
          [field]: type === 'checkbox' ? checked : value
        };
      } else {
        newData[name] = type === 'checkbox' ? checked : value;
      }
      
      return newData;
    });
    
    // Clear validation errors when user changes a field
    if (validation[name]) {
      setValidation(prev => ({
        ...prev,
        [name]: { valid: true, message: '' }
      }));
    }
  }, [validation]);

  // Handle form submission
  const handleSubmit = useCallback(() => {
  // Added display name
  handleSubmit.displayName = 'handleSubmit';

    // Validate form
    const newValidation = { ...validation };
    let isValid = true;

    if (!formData.containerName.trim()) {
      newValidation.containerName = { valid: false, message: 'Container name is required' };
      isValid = false;
    }

    if (nodeType === 'destination' && !formData.resourcePath.trim()) {
      newValidation.resourcePath = { valid: false, message: 'Resource path is required for destination' };
      isValid = false;
    }

    setValidation(newValidation);

    if (isValid) {
      // Add monitoring, triggers, and notifications to the data
      const completeData = {
        ...formData,
        monitoring: monitoringConfig,
        triggers: triggers,
        notifications: notificationConfig
      };
      
      onChange(completeData);
    }
  }, [formData, validation, onChange, nodeType, monitoringConfig, triggers, notificationConfig]);

  // Handle test connection
  const handleTestConnection = useCallback(() => {
  // Added display name
  handleTestConnection.displayName = 'handleTestConnection';

    onTestConnection(formData);
  }, [formData, onTestConnection]);
  
  // Handle file selection from browser
  const handleFileSelect = useCallback((file) => {
  // Added display name
  handleFileSelect.displayName = 'handleFileSelect';

    if (file && file.type === 'file') {
      setFormData(prev => ({
        ...prev,
        resourcePath: file.path
      }));
      
      // Clear any validation errors
      if (validation.resourcePath && !validation.resourcePath.valid) {
        setValidation(prev => ({
          ...prev,
          resourcePath: { valid: true, message: '' }
        }));
      }
      
      setFileBrowserOpen(false);
    }
  }, [validation]);
  
  // Open file browser
  const handleOpenFileBrowser = useCallback(() => {
  // Added display name
  handleOpenFileBrowser.displayName = 'handleOpenFileBrowser';

    setFileBrowserOpen(true);
  }, []);

  // Connection status visualization
  const renderConnectionStatus = () => {
  // Added display name
  renderConnectionStatus.displayName = 'renderConnectionStatus';

  // Added display name
  renderConnectionStatus.displayName = 'renderConnectionStatus';

  // Added display name
  renderConnectionStatus.displayName = 'renderConnectionStatus';

  // Added display name
  renderConnectionStatus.displayName = 'renderConnectionStatus';

  // Added display name
  renderConnectionStatus.displayName = 'renderConnectionStatus';


    if (!connectionStatus) return null;

    if (connectionStatus.status === 'success') {
      return (
        <Alert severity="success&quot; sx={{ mt: 2 }}>
          <Box sx={{ display: "flex', alignItems: 'center' }}>
            <CheckIcon color="success&quot; sx={{ mr: 1 }} />
            <Typography variant="body2">
              {connectionStatus.message || 'Connection successful'}
            </Typography>
          </Box>
        </Alert>
      );
    } else {
      return (
        <Alert severity="error&quot; sx={{ mt: 2 }}>
          <Box sx={{ display: "flex', alignItems: 'center' }}>
            <CloseIcon color="error&quot; sx={{ mr: 1 }} />
            <Typography variant="body2">
              {connectionStatus.message || 'Connection failed'}
            </Typography>
          </Box>
        </Alert>
      );
    }
  };

  // Get icon for storage type
  const getStorageIcon = (type) => {
  // Added display name
  getStorageIcon.displayName = 'getStorageIcon';

  // Added display name
  getStorageIcon.displayName = 'getStorageIcon';

  // Added display name
  getStorageIcon.displayName = 'getStorageIcon';

  // Added display name
  getStorageIcon.displayName = 'getStorageIcon';

  // Added display name
  getStorageIcon.displayName = 'getStorageIcon';


    switch(type) {
      case 's3':
        return nodeType === 'source' ? 
          <CloudUploadIcon fontSize="small&quot; sx={{ mr: 1 }} /> : 
          <CloudDownloadIcon fontSize="small" sx={{ mr: 1 }} />;
      case 'azure':
        return <StorageIcon fontSize="small&quot; sx={{ mr: 1 }} />;
      case "sharepoint':
        return <FolderIcon fontSize="small&quot; sx={{ mr: 1 }} />;
      default:
        return <StorageIcon fontSize="small" sx={{ mr: 1 }} />;
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Typography variant="h6&quot; sx={{ mb: 2, display: "flex', alignItems: 'center' }}>
        {getStorageIcon(formData.storageType)}
        {nodeType === 'source' ? 'Storage Source Configuration' : 'Storage Destination Configuration'}
      </Typography>
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="General&quot; />
        <Tab label="Connection" />
        <Tab label="Advanced&quot; />
        <Tab label="Monitoring" />
        <Tab label="Triggers&quot; />
        <Tab label="Notifications" />
      </Tabs>
      
      {/* General Tab */}
      {activeTab === 0 && (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Storage Type</InputLabel>
                <Select
                  name="storageType&quot;
                  value={formData.storageType}
                  onChange={handleChange}
                  label="Storage Type"
                >
                  <MenuItem value="s3&quot;>AWS S3</MenuItem>
                  <MenuItem value="azure">Azure Blob Storage</MenuItem>
                  <MenuItem value="sharepoint&quot;>SharePoint</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Container Name"
                name="containerName&quot;
                value={formData.containerName}
                onChange={handleChange}
                error={!validation.containerName.valid}
                helperText={validation.containerName.message}
                InputProps={{
                  startAdornment: <FolderIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />,
                }}
                placeholder={
                  formData.storageType === 's3' ? 'Bucket name' : 
                  formData.storageType === 'azure' ? 'Container name' : 
                  'Document library'
                }
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Resource Path&quot;
                name="resourcePath"
                value={formData.resourcePath}
                onChange={handleChange}
                error={!validation.resourcePath.valid}
                helperText={validation.resourcePath.message || 
                  (nodeType === 'source' ? 'Path to source file or folder (optional)' : 'Path for destination file (required)')
                }
                InputProps={{
                  startAdornment: <FileIcon fontSize="small&quot; sx={{ mr: 1, color: "action.active' }} />,
                  endAdornment: (
                    <IconButton 
                      size="small&quot; 
                      onClick={handleOpenFileBrowser}
                      title="Browse files"
                    >
                      <BrowseIcon />
                    </IconButton>
                  )
                }}
                placeholder="path/to/file.csv&quot;
              />
            </Grid>
            
            {nodeType === "destination' && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>File Format</InputLabel>
                    <Select
                      name="fileFormat&quot;
                      value={formData.fileFormat}
                      onChange={handleChange}
                      label="File Format"
                    >
                      <MenuItem value="csv&quot;>CSV</MenuItem>
                      <MenuItem value="json">JSON</MenuItem>
                      <MenuItem value="excel&quot;>Excel</MenuItem>
                      <MenuItem value="parquet">Parquet</MenuItem>
                      <MenuItem value="avro&quot;>Avro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Write Mode</InputLabel>
                    <Select
                      name="writeMode"
                      value={formData.writeMode}
                      onChange={handleChange}
                      label="Write Mode&quot;
                    >
                      <MenuItem value="overwrite">Overwrite</MenuItem>
                      <MenuItem value="append&quot;>Append</MenuItem>
                      <MenuItem value="backup">Backup Existing</MenuItem>
                    </Select>
                    <FormHelperText>
                      {formData.writeMode === 'overwrite' ? 'Overwrite existing file' :
                       formData.writeMode === 'append' ? 'Append to existing file' :
                       'Create backup of existing file'}
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      )}
      
      {/* Connection Tab */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1&quot;>
              Credentials
            </Typography>
            
            <Button
              startIcon={showCredentials ? <LockIcon /> : <EditIcon />}
              size="small"
              onClick={() => setShowCredentials(!showCredentials)}
            >
              {showCredentials ? 'Hide Credentials' : 'Show/Edit Credentials'}
            </Button>
          </Box>
          
          {showCredentials ? (
            <Box sx={{ mb: 3 }}>
              {formData.storageType === 's3' && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Authentication Method</InputLabel>
                      <Select
                        name="credentials.authMode&quot;
                        value={formData.credentials.authMode}
                        onChange={handleChange}
                        label="Authentication Method"
                      >
                        <MenuItem value="key&quot;>Access Keys</MenuItem>
                        <MenuItem value="profile">Profile</MenuItem>
                        <MenuItem value="role&quot;>IAM Role</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {formData.credentials.authMode === "key' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="AWS Access Key ID&quot;
                          name="credentials.awsAccessKeyId"
                          value={formData.credentials.awsAccessKeyId}
                          onChange={handleChange}
                          type="password&quot;
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="AWS Secret Access Key"
                          name="credentials.awsSecretAccessKey&quot;
                          value={formData.credentials.awsSecretAccessKey}
                          onChange={handleChange}
                          type="password"
                        />
                      </Grid>
                    </>
                  )}
                  
                  {formData.credentials.authMode === 'profile' && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="AWS Profile Name&quot;
                        name="credentials.awsProfileName"
                        value={formData.credentials.awsProfileName || ''}
                        onChange={handleChange}
                      />
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="AWS Region&quot;
                      name="credentials.awsRegion"
                      value={formData.credentials.awsRegion}
                      onChange={handleChange}
                      placeholder="us-east-1&quot;
                    />
                  </Grid>
                </Grid>
              )}
              
              {formData.storageType === "azure' && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Authentication Method</InputLabel>
                      <Select
                        name="credentials.authMode&quot;
                        value={formData.credentials.authMode}
                        onChange={handleChange}
                        label="Authentication Method"
                      >
                        <MenuItem value="connection&quot;>Connection String</MenuItem>
                        <MenuItem value="key">Account Key</MenuItem>
                        <MenuItem value="sas&quot;>SAS Token</MenuItem>
                        <MenuItem value="managed">Managed Identity</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {formData.credentials.authMode === 'connection' && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Azure Connection String&quot;
                        name="credentials.azureConnectionString"
                        value={formData.credentials.azureConnectionString}
                        onChange={handleChange}
                        type="password&quot;
                      />
                    </Grid>
                  )}
                  
                  {(formData.credentials.authMode === "key' || formData.credentials.authMode === 'sas') && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Azure Account Name&quot;
                          name="credentials.azureAccountName"
                          value={formData.credentials.azureAccountName}
                          onChange={handleChange}
                        />
                      </Grid>
                      
                      {formData.credentials.authMode === 'key' && (
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Azure Account Key&quot;
                            name="credentials.azureAccountKey"
                            value={formData.credentials.azureAccountKey}
                            onChange={handleChange}
                            type="password&quot;
                          />
                        </Grid>
                      )}
                      
                      {formData.credentials.authMode === "sas' && (
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Azure SAS Token&quot;
                            name="credentials.azureSasToken"
                            value={formData.credentials.azureSasToken}
                            onChange={handleChange}
                            type="password&quot;
                          />
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>
              )}
              
              {formData.storageType === "sharepoint' && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Authentication Method</InputLabel>
                      <Select
                        name="credentials.authMode&quot;
                        value={formData.credentials.authMode}
                        onChange={handleChange}
                        label="Authentication Method"
                      >
                        <MenuItem value="app&quot;>App (Client ID/Secret)</MenuItem>
                        <MenuItem value="user">User (Username/Password)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="SharePoint Site URL&quot;
                      name="credentials.sharepointSiteUrl"
                      value={formData.credentials.sharepointSiteUrl}
                      onChange={handleChange}
                      placeholder="https://contoso.sharepoint.com/sites/sitename&quot;
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tenant ID"
                      name="credentials.sharepointTenantId&quot;
                      value={formData.credentials.sharepointTenantId}
                      onChange={handleChange}
                    />
                  </Grid>
                  
                  {formData.credentials.authMode === "app' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Client ID&quot;
                          name="credentials.sharepointClientId"
                          value={formData.credentials.sharepointClientId}
                          onChange={handleChange}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Client Secret&quot;
                          name="credentials.sharepointClientSecret"
                          value={formData.credentials.sharepointClientSecret}
                          onChange={handleChange}
                          type="password&quot;
                        />
                      </Grid>
                    </>
                  )}
                  
                  {formData.credentials.authMode === "user' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Username&quot;
                          name="credentials.sharepointUsername"
                          value={formData.credentials.sharepointUsername}
                          onChange={handleChange}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Password&quot;
                          name="credentials.sharepointPassword"
                          value={formData.credentials.sharepointPassword}
                          onChange={handleChange}
                          type="password&quot;
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              )}
            </Box>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              Credentials are hidden. Click "Show/Edit Credentials" to view or modify.
            </Alert>
          )}
          
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined&quot;
              startIcon={isLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
              onClick={handleTestConnection}
              disabled={isLoading}
            >
              Test Connection
            </Button>
          </Box>
          
          {renderConnectionStatus()}
        </Box>
      )}
      
      {/* Advanced Tab */}
      {activeTab === 2 && (
        <Box>
          <Grid container spacing={2}>
            {nodeType === "source' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Polling Interval (seconds)&quot;
                    name="advanced.pollingInterval"
                    type="number&quot;
                    value={formData.advanced.pollingInterval}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 5 } }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.advanced.enablePolling || false}
                        onChange={handleChange}
                        name="advanced.enablePolling"
                      />
                    }
                    label="Enable polling for changes&quot;
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Timeout (seconds)"
                name="advanced.timeout&quot;
                type="number"
                value={formData.advanced.timeout}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 10 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Retries&quot;
                name="advanced.maxRetries"
                type="number&quot;
                value={formData.advanced.maxRetries}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.advanced.enableCompression || false}
                    onChange={handleChange}
                    name="advanced.enableCompression"
                  />
                }
                label="Enable compression&quot;
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Recovery Options
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.advanced.enableErrorRecovery || false}
                    onChange={handleChange}
                    name="advanced.enableErrorRecovery&quot;
                  />
                }
                label="Enable error recovery"
              />
            </Grid>
            
            {nodeType === 'destination' && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.advanced.createParentDirectories || false}
                      onChange={handleChange}
                      name="advanced.createParentDirectories&quot;
                    />
                  }
                  label="Create parent directories if they don't exist"
                />
              </Grid>
            )}
          </Grid>
        </Box>
      )}
      
      {/* Monitoring Tab */}
      {activeTab === 3 && (
        <Box sx={{ height: 500 }}>
          <FileMonitoringSystem
            storageType={formData.storageType}
            containerName={formData.containerName}
            resourcePath={formData.resourcePath}
            credentials={formData.credentials}
            initialConfig={monitoringConfig}
            onChange={handleMonitoringConfigChange}
            height="100%&quot;
          />
        </Box>
      )}
      
      {/* Triggers Tab */}
      {activeTab === 4 && (
        <Box sx={{ height: 500 }}>
          <FileTriggerMechanism
            storageType={formData.storageType}
            containerName={formData.containerName}
            resourcePath={formData.resourcePath}
            credentials={formData.credentials}
            initialTriggers={triggers}
            onChange={handleTriggersChange}
            onTriggerActivated={handleTriggerActivated}
            height="100%"
          />
        </Box>
      )}
      
      {/* Notifications Tab */}
      {activeTab === 5 && (
        <Box sx={{ height: 500 }}>
          <FileNotificationSystem
            storageType={formData.storageType}
            containerName={formData.containerName}
            resourcePath={formData.resourcePath}
            credentials={formData.credentials}
            initialConfig={notificationConfig}
            onChange={handleNotificationConfigChange}
            onSendTestNotification={handleSendTestNotification}
            height="100%&quot;
          />
        </Box>
      )}
      
      <Box sx={{ mt: 3, display: "flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained&quot;
          onClick={handleSubmit}
          startIcon={<SaveIcon />}
          disabled={isLoading}
        >
          Save Configuration
        </Button>
      </Box>
      
      {/* File Browser Dialog */}
      <Dialog
        open={fileBrowserOpen}
        onClose={() => setFileBrowserOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, height: 600 }}>
          <StorageFileBrowserPanel
            storageType={formData.storageType}
            containerName={formData.containerName}
            credentials={formData.credentials}
            mode="selector&quot;
            onFileSelect={handleFileSelect}
            onDismiss={() => setFileBrowserOpen(false)}
            height="100%"
            title={nodeType === 'source' ? 'Select Source File' : 'Select Destination Path'}
          />
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

StorageConfigPanel.propTypes = {
  node: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onTestConnection: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  connectionStatus: PropTypes.shape({
    status: PropTypes.string,
    message: PropTypes.string
  }),
  nodeType: PropTypes.oneOf(['source', 'destination'])
};

export default StorageConfigPanel;