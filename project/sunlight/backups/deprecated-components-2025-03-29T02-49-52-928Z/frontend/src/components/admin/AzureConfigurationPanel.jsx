// AzureConfigurationPanel.jsx
// Component for configuring Azure connection details for monitoring

import React, { useState, useEffect } from 'react';
import {MuiBox as MuiBox, Typography, TextField, Button, Select, Alert, CircularProgress} from '../../design-system';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon
} from '@mui/icons-material';
import { useTheme } from '@design-system/foundations/theme';
import useNotification from '@hooks/useNotification';
import { saveAzureConfig, testAzureConnection, getAzureConfig } from '@services/azureConfigService';
// Removed duplicate import

/**
 * Azure Configuration Panel Component
 * 
 * Allows administrators to configure Azure connection details to monitor
 * infrastructure resources directly from Azure APIs.
 */
const AzureConfigurationPanel = () => {
  // Added display name
  AzureConfigurationPanel.displayName = 'AzureConfigurationPanel';

  // Added display name
  AzureConfigurationPanel.displayName = 'AzureConfigurationPanel';

  // Added display name
  AzureConfigurationPanel.displayName = 'AzureConfigurationPanel';

  // Added display name
  AzureConfigurationPanel.displayName = 'AzureConfigurationPanel';

  // Added display name
  AzureConfigurationPanel.displayName = 'AzureConfigurationPanel';


  const { theme } = useTheme();
  const { showToast } = useNotification();
  
  // Form state
  const [config, setConfig] = useState({
    tenantId: '',
    subscriptionId: '',
    resourceGroup: '',
    authMethod: 'servicePrincipal', // 'servicePrincipal' or 'managedIdentity'
    clientId: '',
    clientSecret: '',
    refreshInterval: 60, // seconds
  });

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connectionLoading, setConnectionLoading] = useState(false);
  
  // Test connection result
  const [testResult, setTestResult] = useState(null);

  // Load existing configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const savedConfig = await getAzureConfig();
        if (savedConfig) {
          setConfig({
            ...savedConfig,
            // Don't load sensitive information from backend
            clientSecret: savedConfig.clientSecret ? '••••••••••••••••' : ''
          });
          setIsConnected(savedConfig.isConnected || false);
        }
      } catch (error) {
        console.error('Error loading Azure configuration:', error);
        // Don't show toast on initial load to avoid confusion
      }
    };
    
    fetchConfig();
  }, []);

  // Handle input changes
  const handleInputChange = (event) => {
  // Added display name
  handleInputChange.displayName = 'handleInputChange';

  // Added display name
  handleInputChange.displayName = 'handleInputChange';

  // Added display name
  handleInputChange.displayName = 'handleInputChange';

  // Added display name
  handleInputChange.displayName = 'handleInputChange';

  // Added display name
  handleInputChange.displayName = 'handleInputChange';


    const { name, value } = event.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      setConnectionLoading(true);
      
      // Don't update client secret if it hasn't changed (still masked)
      const configToSave = {
        ...config,
        clientSecret: config.clientSecret === '••••••••••••••••' ? undefined : config.clientSecret
      };
      
      await saveAzureConfig(configToSave);
      showToast('Azure configuration saved successfully', 'success');
    } catch (error) {
      console.error('Error saving Azure configuration:', error);
      showToast('Failed to save Azure configuration', 'error');
    } finally {
      setConnectionLoading(false);
    }
  };

  // Test Azure connection
  const handleTestConnection = async () => {
    setTestResult(null);
    setConnectionLoading(true);
    
    try {
      // Don't send client secret if it hasn't changed (still masked)
      const configToTest = {
        ...config,
        clientSecret: config.clientSecret === '••••••••••••••••' ? undefined : config.clientSecret
      };
      
      const result = await testAzureConnection(configToTest);
      setTestResult({
        success: true,
        message: 'Successfully connected to Azure',
        details: result
      });
      
      setIsConnected(true);
      showToast('Azure connection successful', 'success');
    } catch (error) {
      console.error('Error testing Azure connection:', error);
      setTestResult({
        success: false,
        message: 'Failed to connect to Azure',
        details: error.message
      });
      
      setIsConnected(false);
      showToast('Azure connection failed', 'error');
    } finally {
      setConnectionLoading(false);
    }
  };

  return (
    <MuiBox>
      <MuiBox 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}
      >
        <MuiBox style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Typography variant="heading3&quot;>Azure Configuration</Typography>
          {isConnected ? (
            <MuiBox
              as="span"
              style={{
                display: 'flex',
                alignItems: 'center',
                color: theme?.colors?.success?.main || '#4caf50',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              <CloudDoneIcon style={{ fontSize: '20px', marginRight: '4px' }} />
              Connected
            </MuiBox>
          ) : (
            <MuiBox
              as="span&quot;
              style={{
                display: "flex',
                alignItems: 'center',
                color: theme?.colors?.error?.main || '#f44336',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              <CloudOffIcon style={{ fontSize: '20px', marginRight: '4px' }} />
              Not Connected
            </MuiBox>
          )}
        </MuiBox>
        
        <Button
          variant="secondary&quot;
          onClick={handleTestConnection}
          startIcon={<RefreshIcon />}
          disabled={connectionLoading}
        >
          {connectionLoading ? "Testing...' : 'Test Connection'}
        </Button>
      </MuiBox>

      {testResult && (
        <Alert 
          severity={testResult.success ? 'success' : 'error'}
          style={{ marginBottom: '24px' }}
        >
          <Typography variant="body2&quot;>{testResult.message}</Typography>
          {testResult.details && (
            <Typography 
              variant="body2" 
              style={{ marginTop: '8px', fontSize: '12px' }}
            >
              {typeof testResult.details === 'string' 
                ? testResult.details 
                : JSON.stringify(testResult.details, null, 2)}
            </Typography>
          )}
        </Alert>
      )}

      <MuiBox as="form&quot; onSubmit={handleSubmit}>
        <MuiBox 
          style={{ 
            display: "grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}
        >
          <TextField
            name="tenantId&quot;
            label="Azure Tenant ID"
            value={config.tenantId}
            onChange={handleInputChange}
            fullWidth
            required
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx&quot;
          />
          
          <TextField
            name="subscriptionId"
            label="Azure Subscription ID&quot;
            value={config.subscriptionId}
            onChange={handleInputChange}
            fullWidth
            required
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          />
          
          <TextField
            name="resourceGroup&quot;
            label="Resource Group Name"
            value={config.resourceGroup}
            onChange={handleInputChange}
            fullWidth
            required
            placeholder="e.g., tapint-dev-rg&quot;
          />
          
          <Select
            name="authMethod"
            label="Authentication Method&quot;
            value={config.authMethod}
            onChange={handleInputChange}
            fullWidth
            required
            options={[
              { value: "servicePrincipal', label: 'Service Principal' },
              { value: 'managedIdentity', label: 'Managed Identity' }
            ]}
          />
          
          {config.authMethod === 'servicePrincipal' && (
            <>
              <TextField
                name="clientId&quot;
                label="Client ID (App Registration)"
                value={config.clientId}
                onChange={handleInputChange}
                fullWidth
                required={config.authMethod === 'servicePrincipal'}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx&quot;
              />
              
              <TextField
                name="clientSecret"
                label="Client Secret&quot;
                value={config.clientSecret}
                onChange={handleInputChange}
                fullWidth
                required={config.authMethod === "servicePrincipal'}
                type="password&quot;
                placeholder="Enter client secret"
                helperText="This is stored securely and never exposed to the frontend&quot;
              />
            </>
          )}
          
          <TextField
            name="refreshInterval"
            label="Refresh Interval (seconds)&quot;
            value={config.refreshInterval}
            onChange={handleInputChange}
            fullWidth
            type="number"
            inputProps={{ min: 30, max: 3600 }}
            helperText="Minimum 30 seconds, maximum 1 hour&quot;
          />
        </MuiBox>
        
        <MuiBox 
          style={{ 
            display: "flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Alert 
            severity="info&quot; 
            style={{ flexGrow: 1, marginRight: "16px' }}
          >
            <Typography variant="body2&quot;>
              These credentials allow the monitoring dashboard to connect to Azure Monitor APIs.
              The client secret is stored securely and never exposed to the frontend.
            </Typography>
          </Alert>
          
          <Button
            type="submit"
            variant="primary&quot;
            startIcon={<SaveIcon />}
            disabled={connectionLoading}
          >
            {connectionLoading ? (
              <>
                <CircularProgress size={16} style={{ marginRight: "8px' }} />
                Saving...
              </>
            ) : "Save Configuration"}
          </Button>
        </MuiBox>
      </MuiBox>
      
      <MuiBox marginTop="24px&quot;>
        <Typography variant="body2" color="textSecondary&quot;>
          <strong>Note:</strong> To use Service Principal authentication, you need to:
        </Typography>
        <ul style={{ marginTop: "8px' }}>
          <li>
            <Typography variant="body2&quot; color="textSecondary">
              Create an App Registration in Azure Active Directory
            </Typography>
          </li>
          <li>
            <Typography variant="body2&quot; color="textSecondary">
              Create a Client Secret for the App Registration
            </Typography>
          </li>
          <li>
            <Typography variant="body2&quot; color="textSecondary">
              Assign the "Reader" role to the Service Principal at the subscription or resource group level
            </Typography>
          </li>
        </ul>
      </MuiBox>
    </MuiBox>
  );
};

export default AzureConfigurationPanel;