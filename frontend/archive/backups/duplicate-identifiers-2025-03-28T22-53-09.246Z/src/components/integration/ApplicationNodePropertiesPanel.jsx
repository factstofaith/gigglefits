/**
 * @component ApplicationNodePropertiesPanel
 * @description Specialized properties panel for Application nodes that allows configuration
 * of application connections, authentication, and settings.
 */

import React, { useState, useEffect, useCallback } from 'react';

// Import all design system components from the adapter layer
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  Chip,
  Switch,
  CircularProgress,
  Alert,
  Card,
  Tabs,
  useTheme
} from '../../design-system/adapter';

// Import icons
import AppsIcon from '@mui/icons-material/Apps';
import RefreshIcon from '@mui/icons-material/Refresh';
import ApiIcon from '@mui/icons-material/Api';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SettingsIcon from '@mui/icons-material/Settings';
import LinkIcon from '@mui/icons-material/Link';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
/**
 * Connection Status Component
 */
const ConnectionStatus = ({ status, onTest, loading }) => {
  // Added display name
  ConnectionStatus.displayName = 'ConnectionStatus';

  // Added display name
  ConnectionStatus.displayName = 'ConnectionStatus';

  // Added display name
  ConnectionStatus.displayName = 'ConnectionStatus';


  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 1.5, 
        borderRadius: 1,
        bgcolor: status === 'connected' 
          ? `${theme.palette.success.main}10` 
          : status === 'error' 
            ? `${theme.palette.error.main}10`
            : theme.palette.background.light,
        border: '1px solid',
        borderColor: status === 'connected' 
          ? theme.palette.success.main
          : status === 'error'
            ? theme.palette.error.main
            : theme.palette.divider,
        mb: 2
      }}
    >
      <Box 
        sx={{ 
          width: 12, 
          height: 12, 
          borderRadius: '50%', 
          bgcolor: status === 'connected' 
            ? theme.palette.success.main 
            : status === 'error'
              ? theme.palette.error.main
              : theme.palette.text.secondary,
          mr: 1.5
        }} 
      />
      
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {status === 'connected' 
            ? 'Connected' 
            : status === 'error'
              ? 'Connection Error'
              : 'Not Connected'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {status === 'connected' 
            ? 'Successfully connected to the application' 
            : status === 'error'
              ? 'Failed to establish connection'
              : 'Click Test Connection to verify connectivity'}
        </Typography>
      </Box>
      
      <Button 
        variant={status === 'connected' ? 'outlined' : 'contained'} 
        size="small" 
        color={status === 'error' ? 'error' : 'primary'}
        startIcon={loading ? <CircularProgress size={16} /> : <PlayArrowIcon />}
        onClick={onTest}
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </Button>
    </Box>
  );
};

/**
 * Authentication Form Component
 */
const AuthenticationForm = ({ 
  authType, 
  authConfig, 
  onChange, 
  onChangeType, 
  readOnly = false
}) => {
  // Added display name
  AuthenticationForm.displayName = 'AuthenticationForm';

  // Added display name
  AuthenticationForm.displayName = 'AuthenticationForm';

  // Added display name
  AuthenticationForm.displayName = 'AuthenticationForm';


  const theme = useTheme();
  
  const handleAuthChange = (field, value) => {
  // Added display name
  handleAuthChange.displayName = 'handleAuthChange';

  // Added display name
  handleAuthChange.displayName = 'handleAuthChange';

  // Added display name
  handleAuthChange.displayName = 'handleAuthChange';


    onChange({
      ...authConfig,
      [field]: value
    });
  };
  
  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Authentication Method
        </Typography>
        
        <Select
          value={authType || 'none'}
          onChange={(e) => onChangeType(e.target.value)}
          fullWidth
          disabled={readOnly}
        >
          <Select.Option value="none">No Authentication</Select.Option>
          <Select.Option value="basic">Basic Auth</Select.Option>
          <Select.Option value="oauth2">OAuth 2.0</Select.Option>
          <Select.Option value="api_key">API Key</Select.Option>
          <Select.Option value="bearer">Bearer Token</Select.Option>
        </Select>
      </Box>
      
      {authType === 'basic' && (
        <Box>
          <TextField
            label="Username"
            value={authConfig?.username || ''}
            onChange={(e) => handleAuthChange('username', e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={readOnly}
          />
          
          <TextField
            label="Password"
            type="password"
            value={authConfig?.password || ''}
            onChange={(e) => handleAuthChange('password', e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={readOnly}
          />
        </Box>
      )}
      
      {authType === 'api_key' && (
        <Box>
          <TextField
            label="API Key"
            value={authConfig?.apiKey || ''}
            onChange={(e) => handleAuthChange('apiKey', e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={readOnly}
          />
          
          <TextField
            label="API Key Header Name"
            value={authConfig?.apiKeyHeaderName || 'X-API-Key'}
            onChange={(e) => handleAuthChange('apiKeyHeaderName', e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={readOnly}
          />
        </Box>
      )}
      
      {authType === 'bearer' && (
        <Box>
          <TextField
            label="Bearer Token"
            value={authConfig?.token || ''}
            onChange={(e) => handleAuthChange('token', e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={readOnly}
          />
        </Box>
      )}
      
      {authType === 'oauth2' && (
        <Box>
          <TextField
            label="Client ID"
            value={authConfig?.clientId || ''}
            onChange={(e) => handleAuthChange('clientId', e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={readOnly}
          />
          
          <TextField
            label="Client Secret"
            type="password"
            value={authConfig?.clientSecret || ''}
            onChange={(e) => handleAuthChange('clientSecret', e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={readOnly}
          />
          
          <TextField
            label="Token URL"
            value={authConfig?.tokenUrl || ''}
            onChange={(e) => handleAuthChange('tokenUrl', e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={readOnly}
          />
          
          <TextField
            label="Authorization URL"
            value={authConfig?.authUrl || ''}
            onChange={(e) => handleAuthChange('authUrl', e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={readOnly}
          />
          
          <TextField
            label="Scope"
            value={authConfig?.scope || ''}
            onChange={(e) => handleAuthChange('scope', e.target.value)}
            placeholder="read write"
            fullWidth
            sx={{ mb: 2 }}
            disabled={readOnly}
          />
        </Box>
      )}
      
      {authType !== 'none' && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Credentials are stored securely and encrypted in the database. Only authorized users can view this information.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

/**
 * Connection Form Component
 */
const ConnectionForm = ({ 
  connectionConfig, 
  onChange, 
  applicationType, 
  readOnly = false 
}) => {
  // Added display name
  ConnectionForm.displayName = 'ConnectionForm';

  // Added display name
  ConnectionForm.displayName = 'ConnectionForm';

  // Added display name
  ConnectionForm.displayName = 'ConnectionForm';


  const handleConnectionChange = (field, value) => {
  // Added display name
  handleConnectionChange.displayName = 'handleConnectionChange';

  // Added display name
  handleConnectionChange.displayName = 'handleConnectionChange';

  // Added display name
  handleConnectionChange.displayName = 'handleConnectionChange';


    onChange({
      ...connectionConfig,
      [field]: value
    });
  };
  
  return (
    <Box>
      <TextField
        label="Connection Name"
        value={connectionConfig?.name || ''}
        onChange={(e) => handleConnectionChange('name', e.target.value)}
        placeholder="My Application Connection"
        fullWidth
        sx={{ mb: 2 }}
        disabled={readOnly}
      />
      
      <TextField
        label="Base URL"
        value={connectionConfig?.baseUrl || ''}
        onChange={(e) => handleConnectionChange('baseUrl', e.target.value)}
        placeholder={
          applicationType === 'api' 
            ? 'https://api.example.com/v1' 
            : applicationType === 'database'
              ? 'jdbc:postgresql://localhost:5432/mydatabase'
              : 'https://example.com'
        }
        fullWidth
        sx={{ mb: 2 }}
        disabled={readOnly}
      />
      
      {applicationType === 'api' && (
        <>
          <Select
            label="API Type"
            value={connectionConfig?.apiType || 'rest'}
            onChange={(e) => handleConnectionChange('apiType', e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={readOnly}
          >
            <Select.Option value="rest">REST</Select.Option>
            <Select.Option value="graphql">GraphQL</Select.Option>
            <Select.Option value="soap">SOAP</Select.Option>
            <Select.Option value="odata">OData</Select.Option>
          </Select>
          
          <TextField
            label="Default Headers"
            value={connectionConfig?.headers || ''}
            onChange={(e) => handleConnectionChange('headers', e.target.value)}
            placeholder="Content-Type: application/json\nAccept: application/json"
            multiline
            rows={3}
            fullWidth
            sx={{ mb: 2 }}
            disabled={readOnly}
          />
        </>
      )}
      
      {applicationType === 'database' && (
        <>
          <Select
            label="Database Type"
            value={connectionConfig?.dbType || 'postgresql'}
            onChange={(e) => handleConnectionChange('dbType', e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={readOnly}
          >
            <Select.Option value="postgresql">PostgreSQL</Select.Option>
            <Select.Option value="mysql">MySQL</Select.Option>
            <Select.Option value="sqlserver">SQL Server</Select.Option>
            <Select.Option value="oracle">Oracle</Select.Option>
            <Select.Option value="mongodb">MongoDB</Select.Option>
          </Select>
          
          <TextField
            label="Database Name"
            value={connectionConfig?.dbName || ''}
            onChange={(e) => handleConnectionChange('dbName', e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={readOnly}
          />
          
          <TextField
            label="Schema/Collection"
            value={connectionConfig?.schema || ''}
            onChange={(e) => handleConnectionChange('schema', e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={readOnly}
          />
        </>
      )}
      
      <Switch
        label="Use Connection Pooling"
        checked={connectionConfig?.useConnectionPool || false}
        onChange={(e) => handleConnectionChange('useConnectionPool', e.target.checked)}
        disabled={readOnly}
      />
    </Box>
  );
};

/**
 * Dataset Associations Component
 */
const DatasetAssociations = ({ 
  associatedDatasets = [], 
  availableDatasets = [], 
  onAssociateDataset, 
  onRemoveDataset,
  readOnly = false
}) => {
  // Added display name
  DatasetAssociations.displayName = 'DatasetAssociations';

  // Added display name
  DatasetAssociations.displayName = 'DatasetAssociations';

  // Added display name
  DatasetAssociations.displayName = 'DatasetAssociations';


  const theme = useTheme();
  const [selectedDataset, setSelectedDataset] = useState('');
  
  // Filter out already associated datasets
  const datasets = availableDatasets.filter(
    dataset => !associatedDatasets.some(d => d.id === dataset.id)
  );
  
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Associated Datasets
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Connect this application to datasets to define the data structures it can access
      </Typography>
      
      {/* Currently associated datasets */}
      {associatedDatasets.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          {associatedDatasets.map(dataset => (
            <Box 
              key={dataset.id}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                p: 1.5,
                mb: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'background.hover'
                }
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: 'primary.lighter',
                  mr: 1.5
                }}
              >
                <StorageIcon sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {dataset.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {dataset.fields?.length || 0} fields
                </Typography>
              </Box>
              
              {!readOnly && (
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  onClick={() => onRemoveDataset(dataset.id)}
                >
                  Remove
                </Button>
              )}
            </Box>
          ))}
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          No datasets associated with this application. Associate datasets to define
          the data structure this application can access.
        </Alert>
      )}
      
      {/* Add new dataset association */}
      {!readOnly && datasets.length > 0 && (
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Select
            placeholder="Select dataset to associate"
            value={selectedDataset}
            onChange={(e) => setSelectedDataset(e.target.value)}
            options={datasets.map(dataset => ({
              value: dataset.id,
              label: dataset.name
            }))}
            fullWidth
            sx={{ mr: 1 }}
          />
          
          <Button 
            variant="contained" 
            onClick={() => {
              if (selectedDataset) {
                onAssociateDataset(selectedDataset);
                setSelectedDataset('');
              }
            }}
            disabled={!selectedDataset}
          >
            Associate
          </Button>
        </Box>
      )}
    </Box>
  );
};

/**
 * Main Application Node Properties Panel Component
 */
const ApplicationNodePropertiesPanel = ({ 
  nodeData, 
  onUpdateNode, 
  readOnly = false,
  isAdmin = false,
  availableDatasets = [] // Typically fetched by parent
}) => {
  // Added display name
  ApplicationNodePropertiesPanel.displayName = 'ApplicationNodePropertiesPanel';

  // Added display name
  ApplicationNodePropertiesPanel.displayName = 'ApplicationNodePropertiesPanel';

  // Added display name
  ApplicationNodePropertiesPanel.displayName = 'ApplicationNodePropertiesPanel';


  const theme = useTheme();
  
  // State variables
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(nodeData?.connectionStatus || 'disconnected');
  
  // Local state to track node data changes
  const [formData, setFormData] = useState({
    name: nodeData?.name || '',
    description: nodeData?.description || '',
    applicationType: nodeData?.applicationType || 'api',
    authType: nodeData?.authType || 'none',
    authConfig: nodeData?.authConfig || {},
    connectionConfig: nodeData?.connectionConfig || {},
    associatedDatasets: nodeData?.associatedDatasets || []
  });
  
  // Initialize form data from node data
  useEffect(() => {
    if (nodeData) {
      setFormData({
        name: nodeData.name || '',
        description: nodeData.description || '',
        applicationType: nodeData.applicationType || 'api',
        authType: nodeData.authType || 'none',
        authConfig: nodeData.authConfig || {},
        connectionConfig: nodeData.connectionConfig || {},
        associatedDatasets: nodeData.associatedDatasets || []
      });
      
      setConnectionStatus(nodeData.connectionStatus || 'disconnected');
    }
  }, [nodeData]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';


    setActiveTab(newValue);
  };
  
  // Handle form field changes
  const handleFormChange = (field, value) => {
  // Added display name
  handleFormChange.displayName = 'handleFormChange';

  // Added display name
  handleFormChange.displayName = 'handleFormChange';

  // Added display name
  handleFormChange.displayName = 'handleFormChange';


    const newFormData = {
      ...formData,
      [field]: value
    };
    
    setFormData(newFormData);
    
    // Update the node
    onUpdateNode({
      ...nodeData,
      ...newFormData,
      label: newFormData.name || 'Application', // Update label to match name
    });
  };
  
  // Handle authentication config changes
  const handleAuthConfigChange = (config) => {
  // Added display name
  handleAuthConfigChange.displayName = 'handleAuthConfigChange';

  // Added display name
  handleAuthConfigChange.displayName = 'handleAuthConfigChange';

  // Added display name
  handleAuthConfigChange.displayName = 'handleAuthConfigChange';


    handleFormChange('authConfig', config);
  };
  
  // Handle connection config changes
  const handleConnectionConfigChange = (config) => {
  // Added display name
  handleConnectionConfigChange.displayName = 'handleConnectionConfigChange';

  // Added display name
  handleConnectionConfigChange.displayName = 'handleConnectionConfigChange';

  // Added display name
  handleConnectionConfigChange.displayName = 'handleConnectionConfigChange';


    handleFormChange('connectionConfig', config);
  };
  
  // Handle authentication type change
  const handleAuthTypeChange = (type) => {
  // Added display name
  handleAuthTypeChange.displayName = 'handleAuthTypeChange';

  // Added display name
  handleAuthTypeChange.displayName = 'handleAuthTypeChange';

  // Added display name
  handleAuthTypeChange.displayName = 'handleAuthTypeChange';


    handleFormChange('authType', type);
    // Reset auth config when type changes
    handleFormChange('authConfig', {});
  };
  
  // Handle application type change
  const handleApplicationTypeChange = (type) => {
  // Added display name
  handleApplicationTypeChange.displayName = 'handleApplicationTypeChange';

  // Added display name
  handleApplicationTypeChange.displayName = 'handleApplicationTypeChange';

  // Added display name
  handleApplicationTypeChange.displayName = 'handleApplicationTypeChange';


    handleFormChange('applicationType', type);
    // Reset connection config when type changes
    handleFormChange('connectionConfig', {});
  };
  
  // Handle test connection
  const handleTestConnection = useCallback(async () => {
  // Added display name
  handleTestConnection.displayName = 'handleTestConnection';

    setTestingConnection(true);
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate success/failure (randomly for demo)
    const success = Math.random() > 0.3;
    
    setConnectionStatus(success ? 'connected' : 'error');
    handleFormChange('connectionStatus', success ? 'connected' : 'error');
    
    setTestingConnection(false);
  }, [formData.connectionConfig, formData.authConfig, formData.authType]);
  
  // Handle dataset association
  const handleAssociateDataset = (datasetId) => {
  // Added display name
  handleAssociateDataset.displayName = 'handleAssociateDataset';

  // Added display name
  handleAssociateDataset.displayName = 'handleAssociateDataset';

  // Added display name
  handleAssociateDataset.displayName = 'handleAssociateDataset';


    const dataset = availableDatasets.find(d => d.id === datasetId);
    if (!dataset) return;
    
    const newDatasets = [...formData.associatedDatasets, dataset];
    handleFormChange('associatedDatasets', newDatasets);
  };
  
  // Handle dataset removal
  const handleRemoveDataset = (datasetId) => {
  // Added display name
  handleRemoveDataset.displayName = 'handleRemoveDataset';

  // Added display name
  handleRemoveDataset.displayName = 'handleRemoveDataset';

  // Added display name
  handleRemoveDataset.displayName = 'handleRemoveDataset';


    const newDatasets = formData.associatedDatasets.filter(d => d.id !== datasetId);
    handleFormChange('associatedDatasets', newDatasets);
  };
  
  // Icon for the application type
  const ApplicationTypeIcon = 
    formData.applicationType === 'api' ? ApiIcon :
    formData.applicationType === 'database' ? StorageIcon :
    AppsIcon;
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with application info */}
      <Box 
        sx={{ 
          px: 2, 
          py: 2, 
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: `primary.lighter`,
              mr: 2
            }}
          >
            <ApplicationTypeIcon sx={{ color: 'primary.main' }} />
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <TextField
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="Application Name"
              variant="standard"
              fullWidth
              sx={{ mb: 0.5, fontWeight: 'bold', fontSize: '1.1rem' }}
              InputProps={{ 
                sx: { fontSize: '1.1rem', fontWeight: 'bold' } 
              }}
              disabled={readOnly}
            />
            
            <Select
              value={formData.applicationType}
              onChange={(e) => handleApplicationTypeChange(e.target.value)}
              variant="standard"
              size="small"
              disabled={readOnly}
            >
              <Select.Option value="api">API Application</Select.Option>
              <Select.Option value="database">Database Application</Select.Option>
              <Select.Option value="custom">Custom Application</Select.Option>
            </Select>
          </Box>
        </Box>
        
        <TextField
          label="Description"
          value={formData.description}
          onChange={(e) => handleFormChange('description', e.target.value)}
          multiline
          rows={2}
          fullWidth
          disabled={readOnly}
        />
      </Box>
      
      {/* Tabs for different sections */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tabs.Tab label="Connection" icon={<LinkIcon />} />
          <Tabs.Tab label="Authentication" icon={<VpnKeyIcon />} />
          <Tabs.Tab label="Datasets" icon={<StorageIcon />} />
          {isAdmin && <Tabs.Tab label="Advanced" icon={<SettingsIcon />} />}
        </Tabs>
      </Box>
      
      {/* Tab content (scrollable) */}
      <Box 
        sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: 2
        }}
      >
        {/* Connection Tab */}
        {activeTab === 0 && (
          <Box>
            <ConnectionStatus 
              status={connectionStatus}
              onTest={handleTestConnection}
              loading={testingConnection}
            />
            
            <ConnectionForm 
              connectionConfig={formData.connectionConfig}
              onChange={handleConnectionConfigChange}
              applicationType={formData.applicationType}
              readOnly={readOnly}
            />
          </Box>
        )}
        
        {/* Authentication Tab */}
        {activeTab === 1 && (
          <AuthenticationForm 
            authType={formData.authType}
            authConfig={formData.authConfig}
            onChange={handleAuthConfigChange}
            onChangeType={handleAuthTypeChange}
            readOnly={readOnly}
          />
        )}
        
        {/* Datasets Tab */}
        {activeTab === 2 && (
          <DatasetAssociations 
            associatedDatasets={formData.associatedDatasets}
            availableDatasets={availableDatasets}
            onAssociateDataset={handleAssociateDataset}
            onRemoveDataset={handleRemoveDataset}
            readOnly={readOnly}
          />
        )}
        
        {/* Advanced Tab (Admin only) */}
        {activeTab === 3 && isAdmin && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Advanced Settings
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              These settings should only be modified by administrators
            </Typography>
            
            <Switch
              label="Enable Caching"
              checked={formData.enableCaching || false}
              onChange={(e) => handleFormChange('enableCaching', e.target.checked)}
              disabled={readOnly}
              sx={{ mb: 1.5 }}
            />
            
            <Switch
              label="Enable Logging"
              checked={formData.enableLogging || false}
              onChange={(e) => handleFormChange('enableLogging', e.target.checked)}
              disabled={readOnly}
              sx={{ mb: 1.5 }}
            />
            
            <Switch
              label="Enable Metrics"
              checked={formData.enableMetrics || false}
              onChange={(e) => handleFormChange('enableMetrics', e.target.checked)}
              disabled={readOnly}
              sx={{ mb: 1.5 }}
            />
            
            <TextField
              label="Timeout (ms)"
              type="number"
              value={formData.timeout || 30000}
              onChange={(e) => handleFormChange('timeout', parseInt(e.target.value))}
              fullWidth
              sx={{ mb: 2, mt: 1 }}
              inputProps={{ min: 1000, max: 120000 }}
              disabled={readOnly}
            />
            
            <TextField
              label="Retry Attempts"
              type="number"
              value={formData.retryAttempts || 3}
              onChange={(e) => handleFormChange('retryAttempts', parseInt(e.target.value))}
              fullWidth
              sx={{ mb: 2 }}
              inputProps={{ min: 0, max: 10 }}
              disabled={readOnly}
            />
            
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Changes to these settings may affect all integrations using this application.
              </Typography>
            </Alert>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ApplicationNodePropertiesPanel;