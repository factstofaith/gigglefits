require('dotenv').config();

/**
 * AzureBlobConfiguration.jsx
 * -----------------------------------------------------------------------------
 * Enhanced configuration component for Azure Blob Storage connections
 * with integrated container browser functionality.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, FormHelperText, Grid, IconButton, InputAdornment, InputLabel, LinearProgress, MenuItem, Paper, Radio, RadioGroup, Select, Snackbar, Tab, Tabs, TextField, Tooltip, Typography, Alert, AlertTitle } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import StorageIcon from '@mui/icons-material/Storage';
import FolderIcon from '@mui/icons-material/Folder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import KeyIcon from '@mui/icons-material/Key';

// Import components
import AzureBlobContainerBrowser from './azure/AzureBlobContainerBrowser';
import AzureCredentialManager from './azure/AzureCredentialManager';

/**
 * Azure Blob Configuration Component with integrated browser functionality
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.config - Current configuration values
 * @param {Function} props.onChange - Callback when configuration changes
 * @param {Object} props.errors - Validation errors
 * @param {boolean} props.readOnly - Whether the component is in read-only mode
 * @param {boolean} props.isSuperUser - Whether the user has super user permissions
 */
const AzureBlobConfiguration = ({
  config,
  onChange,
  errors = {},
  readOnly = false,
  isSuperUser = false
}) => {
  // State for secrets visibility
  const [showSecrets, setShowSecrets] = useState(false);

  // State for container browser dialog
  const [browserOpen, setBrowserOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // State for connection testing
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testSnackbarOpen, setTestSnackbarOpen] = useState(false);

  // State for pattern preview
  const [showPatternPreview, setShowPatternPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [patternMatches, setPatternMatches] = useState([]);

  // Default configuration structure
  const defaultConfig = {
    authMethod: 'connectionString',
    connectionString: '',
    accountName: '',
    accountKey: '',
    sasToken: '',
    useManagedIdentity: false,
    containerName: '',
    filePattern: '*.csv',
    path: '',
    createContainerIfNotExists: false
  };

  // State for stored credentials
  const [hasCredentials, setHasCredentials] = useState(false);
  const [showCredentialManager, setShowCredentialManager] = useState(false);

  // Merge provided config with defaults
  const blobConfig = {
    ...defaultConfig,
    ...config
  };

  /**
   * Handle change in form fields
   */
  const handleChange = e => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    // If auth method changes, reset related fields
    let updatedConfig = {
      ...blobConfig,
      [name]: newValue
    };
    if (name === 'authMethod') {
      updatedConfig = {
        ...updatedConfig,
        connectionString: '',
        accountName: '',
        accountKey: '',
        sasToken: ''
      };
    }

    // Clear any existing test result when configuration changes
    setTestResult(null);
    onChange(updatedConfig);
  };

  /**
   * Toggle visibility of secret fields
   */
  const toggleShowSecrets = () => {
    setShowSecrets(!showSecrets);
  };

  /**
   * Toggle visibility of credential manager
   */
  const toggleCredentialManager = () => {
    setShowCredentialManager(!showCredentialManager);
  };

  /**
   * Handle credentials loaded from credential manager
   */
  const handleCredentialsLoaded = credentials => {
    if (!credentials) return;

    // Update configuration from loaded credentials
    const updatedConfig = {
      ...blobConfig
    };

    // Set authentication method
    if (credentials.connectionString) {
      updatedConfig.authMethod = 'connectionString';
      updatedConfig.connectionString = credentials.connectionString;
    } else if (credentials.sasToken) {
      updatedConfig.authMethod = 'sasToken';
      updatedConfig.accountName = credentials.accountName;
      updatedConfig.sasToken = credentials.sasToken;
    } else if (credentials.accountKey) {
      updatedConfig.authMethod = 'accountKey';
      updatedConfig.accountName = credentials.accountName;
      updatedConfig.accountKey = credentials.accountKey;
    } else if (credentials.useManagedIdentity) {
      updatedConfig.authMethod = 'managedIdentity';
      updatedConfig.accountName = credentials.accountName;
      updatedConfig.useManagedIdentity = true;
    }

    // Update configuration
    onChange(updatedConfig);

    // Update UI state
    setHasCredentials(true);
  };

  /**
   * Handle opening of container browser
   */
  const handleOpenBrowser = () => {
    setBrowserOpen(true);
  };

  /**
   * Handle closing of container browser
   */
  const handleCloseBrowser = () => {
    setBrowserOpen(false);
  };

  /**
   * Handle tab change in browser dialog
   */
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  /**
   * Handle container selection from browser
   */
  const handleSelectContainer = useCallback(containerName => {
    if (containerName) {
      onChange({
        ...blobConfig,
        containerName
      });
    }
  }, [blobConfig, onChange]);

  /**
   * Handle blob selection from browser
   */
  const handleSelectBlob = useCallback(blobInfo => {
    if (blobInfo) {
      // Extract the path from the blob name
      const fullPath = blobInfo.blobName;
      const containerName = blobInfo.containerName;

      // Get the directory path by removing the filename
      const lastSlashIndex = fullPath.lastIndexOf('/');
      const directoryPath = lastSlashIndex > 0 ? fullPath.substring(0, lastSlashIndex + 1) : '';

      // Extract a pattern based on the file name
      const fileName = lastSlashIndex > 0 ? fullPath.substring(lastSlashIndex + 1) : fullPath;

      // Determine a reasonable pattern based on file extension
      const dotIndex = fileName.lastIndexOf('.');
      const fileExtension = dotIndex > 0 ? fileName.substring(dotIndex) : '';
      const filePattern = fileExtension ? `*${fileExtension}` : fileName;
      onChange({
        ...blobConfig,
        containerName,
        path: directoryPath,
        filePattern
      });
    }
  }, [blobConfig, onChange]);

  /**
   * Test the Azure connection with comprehensive diagnostics
   */
  const testConnection = useCallback(async () => {
    // Don't test if required fields are missing
    if (!canTest()) return;
    setTesting(true);
    setTestResult(null);
    try {
      // Simulate API call to test connection
      console.log('Testing connection with config:', blobConfig);

      // In a production environment, this would call a real API endpoint
      // For our development environment, we'll simulate detailed test steps
      const result = await new Promise(resolve => {
        // Create a function to simulate step-by-step testing
        const runDiagnostics = async () => {
          const diagnosticSteps = [];
          let success = false;
          let message = '';
          let details = {};

          // Step 1: Validate configuration format
          await sleep(400); // Simulate network delay
          if (blobConfig.authMethod === 'connectionString') {
            const hasAccountName = blobConfig.connectionString.includes('AccountName=');
            const hasAccountKey = blobConfig.connectionString.includes('AccountKey=');
            const hasEndpoint = blobConfig.connectionString.includes('EndpointSuffix=') || blobConfig.connectionString.includes('BlobEndpoint=');
            diagnosticSteps.push({
              name: 'Validate connection string format',
              success: hasAccountName && hasAccountKey && hasEndpoint,
              message: hasAccountName && hasAccountKey && hasEndpoint ? 'Connection string format is valid' : 'Connection string is missing required components',
              details: {
                hasAccountName,
                hasAccountKey,
                hasEndpoint
              }
            });
            if (!hasAccountName || !hasAccountKey || !hasEndpoint) {
              return {
                success: false,
                message: 'Invalid connection string format',
                diagnosticSteps,
                details: {
                  missingComponents: [...(!hasAccountName ? ['AccountName'] : []), ...(!hasAccountKey ? ['AccountKey'] : []), ...(!hasEndpoint ? ['EndpointSuffix or BlobEndpoint'] : [])]
                }
              };
            }
          } else if (blobConfig.authMethod === 'accountKey') {
            const validAccountName = blobConfig.accountName.length > 3;
            const validAccountKey = blobConfig.accountKey.length > 10;
            diagnosticSteps.push({
              name: 'Validate account credentials',
              success: validAccountName && validAccountKey,
              message: validAccountName && validAccountKey ? 'Account name and key format validated' : 'Invalid account name or key format',
              details: {
                accountNameValid: validAccountName,
                accountKeyValid: validAccountKey
              }
            });
            if (!validAccountName || !validAccountKey) {
              return {
                success: false,
                message: 'Invalid account credentials',
                diagnosticSteps,
                details: {
                  issues: [...(!validAccountName ? ['Account name is too short or invalid'] : []), ...(!validAccountKey ? ['Account key is too short or invalid'] : [])]
                }
              };
            }
          } else if (blobConfig.authMethod === 'sasToken') {
            const validAccountName = blobConfig.accountName.length > 3;
            const validSasToken = blobConfig.sasToken.startsWith('?') && blobConfig.sasToken.includes('sig=');
            diagnosticSteps.push({
              name: 'Validate SAS token',
              success: validAccountName && validSasToken,
              message: validAccountName && validSasToken ? 'Account name and SAS token format validated' : 'Invalid SAS token format',
              details: {
                accountNameValid: validAccountName,
                sasTokenValid: validSasToken
              }
            });
            if (!validAccountName || !validSasToken) {
              return {
                success: false,
                message: 'Invalid SAS token configuration',
                diagnosticSteps,
                details: {
                  issues: [...(!validAccountName ? ['Account name is too short or invalid'] : []), ...(!validSasToken ? ['SAS token must start with ? and include a signature (sig=)'] : [])]
                }
              };
            }
          } else if (blobConfig.authMethod === 'managedIdentity') {
            const validAccountName = blobConfig.accountName.length > 3;
            diagnosticSteps.push({
              name: 'Validate managed identity configuration',
              success: validAccountName,
              message: validAccountName ? 'Account name format validated' : 'Invalid account name for managed identity',
              details: {
                accountNameValid: validAccountName
              }
            });
            if (!validAccountName) {
              return {
                success: false,
                message: 'Invalid managed identity configuration',
                diagnosticSteps,
                details: {
                  issues: ['Account name is required even when using managed identity']
                }
              };
            }
          }

          // Step 2: Test connection to account
          await sleep(600);
          const accountConnected = Math.random() > 0.1; // 90% success rate for demo

          diagnosticSteps.push({
            name: 'Connect to storage account',
            success: accountConnected,
            message: accountConnected ? 'Successfully connected to storage account' : 'Failed to connect to storage account',
            details: {
              timestamp: new Date().toISOString(),
              authMethod: blobConfig.authMethod
            }
          });
          if (!accountConnected) {
            return {
              success: false,
              message: 'Could not connect to storage account',
              diagnosticSteps,
              details: {
                possibleIssues: ['Network connectivity problem', 'Invalid credentials', 'Account firewall restrictions', 'Account may not exist']
              }
            };
          }

          // Step 3: Test container access
          await sleep(500);
          const containerExists = blobConfig.containerName !== '' && Math.random() > 0.1; // 90% success if container specified

          diagnosticSteps.push({
            name: 'Verify container access',
            success: containerExists,
            message: blobConfig.containerName ? containerExists ? `Container '${blobConfig.containerName}' exists and is accessible` : `Container '${blobConfig.containerName}' does not exist or is not accessible` : 'No container specified, skipping container verification',
            details: {
              containerName: blobConfig.containerName || 'Not specified',
              createIfNotExists: blobConfig.createContainerIfNotExists
            }
          });
          if (blobConfig.containerName && !containerExists && !blobConfig.createContainerIfNotExists) {
            return {
              success: false,
              message: `Container '${blobConfig.containerName}' does not exist or is not accessible`,
              diagnosticSteps,
              details: {
                recommendation: 'Enable "Create container if it doesn\'t exist" option or choose an existing container'
              }
            };
          }

          // Step 4: Test file pattern matching
          await sleep(400);
          const hasFilePattern = blobConfig.filePattern && blobConfig.filePattern.trim() !== '';
          const validPattern = hasFilePattern && !blobConfig.filePattern.includes('\\');
          diagnosticSteps.push({
            name: 'Validate file pattern',
            success: !hasFilePattern || validPattern,
            message: !hasFilePattern ? 'No file pattern specified, will match all files' : validPattern ? `File pattern '${blobConfig.filePattern}' is valid` : `File pattern '${blobConfig.filePattern}' contains invalid characters`,
            details: {
              pattern: blobConfig.filePattern || 'Not specified',
              valid: !hasFilePattern || validPattern
            }
          });

          // Step 5: Perform permissions check
          await sleep(600);
          const hasReadPermission = true; // In real implementation, check actual permissions
          const hasWritePermission = blobConfig.authMethod !== 'sasToken' || blobConfig.sasToken.includes('sp=') && blobConfig.sasToken.includes('w');
          diagnosticSteps.push({
            name: 'Verify storage permissions',
            success: hasReadPermission,
            message: hasReadPermission ? hasWritePermission ? 'Account has read and write permissions' : 'Account has read permissions only' : 'Account lacks required read permissions',
            details: {
              permissions: {
                read: hasReadPermission,
                write: hasWritePermission
              }
            }
          });
          if (!hasReadPermission) {
            return {
              success: false,
              message: 'Account lacks required read permissions',
              diagnosticSteps,
              details: {
                recommendation: 'Ensure the credentials have at least read access to the storage account'
              }
            };
          }

          // All tests passed
          return {
            success: true,
            message: 'Connection successful! All diagnostics passed.',
            diagnosticSteps,
            details: {
              timestamp: new Date().toISOString(),
              readPermission: hasReadPermission,
              writePermission: hasWritePermission,
              containerExists: containerExists || !blobConfig.containerName
            }
          };
        };

        // Execute the diagnostics
        setTimeout(async () => {
          const diagnosticResult = await runDiagnostics();
          resolve(diagnosticResult);
        }, 500);
      });
      setTestResult(result);
      setTestSnackbarOpen(true);
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestResult({
        success: false,
        message: error.message || 'An unexpected error occurred',
        diagnosticSteps: [{
          name: 'Initialize connection test',
          success: false,
          message: 'Error occurred during test initialization',
          details: {
            error: error.message || 'Unknown error'
          }
        }]
      });
      setTestSnackbarOpen(true);
    } finally {
      setTesting(false);
    }
  }, [blobConfig]);

  // Helper function to simulate async operations
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Preview files matching the pattern
   */
  const previewPattern = useCallback(async () => {
    if (!blobConfig.containerName || !blobConfig.filePattern) return;
    setPreviewLoading(true);
    setPatternMatches([]);
    try {
      // Simulate API call to get matching files
      console.log(`Previewing pattern: ${blobConfig.filePattern} in container: ${blobConfig.containerName} with path: ${blobConfig.path}`);

      // Simulation delay
      const result = await new Promise(resolve => {
        setTimeout(() => {
          // Convert glob pattern to regex for simple simulation
          const pattern = blobConfig.filePattern.replace(/\./g, '\\.').replace(/\*/g, '.*');
          const regex = new RegExp(`^${pattern}$`);

          // Sample files that might be in the container
          const sampleFiles = ['data.csv', 'sample.csv', 'employees.csv', 'data.json', 'employees.json', 'report.pdf', 'summary.xlsx', 'log.txt'];

          // Filter files by pattern
          const matches = sampleFiles.filter(file => regex.test(file)).map(file => ({
            name: blobConfig.path ? `${blobConfig.path}${file}` : file,
            size: Math.floor(Math.random() * 1024 * 1024),
            // Random size up to 1MB
            lastModified: new Date().toISOString()
          }));
          resolve(matches);
        }, 1000);
      });
      setPatternMatches(result);
      setShowPatternPreview(true);
    } catch (error) {
      console.error('Error previewing pattern:', error);
    } finally {
      setPreviewLoading(false);
    }
  }, [blobConfig.containerName, blobConfig.filePattern, blobConfig.path]);

  /**
   * Check if connection can be tested
   */
  const canTest = useCallback(() => {
    if (blobConfig.authMethod === 'connectionString') {
      return blobConfig.connectionString.length > 0;
    } else if (blobConfig.authMethod === 'accountKey') {
      return blobConfig.accountName.length > 0 && blobConfig.accountKey.length > 0;
    } else if (blobConfig.authMethod === 'sasToken') {
      return blobConfig.accountName.length > 0 && blobConfig.sasToken.length > 0;
    } else if (blobConfig.authMethod === 'managedIdentity') {
      return blobConfig.accountName.length > 0;
    }
    return false;
  }, [blobConfig]);

  // Authentication method options
  const authMethods = [{
    value: 'connectionString',
    label: 'Connection String'
  }, {
    value: 'accountKey',
    label: 'Account Name & Key'
  }, {
    value: 'sasToken',
    label: 'SAS Token'
  }, {
    value: 'managedIdentity',
    label: 'Managed Identity'
  }];

  // Field visibility based on selected auth method
  const showConnectionString = blobConfig.authMethod === 'connectionString';
  const showAccountKey = blobConfig.authMethod === 'accountKey';
  const showSasToken = blobConfig.authMethod === 'sasToken';
  const showManagedIdentity = blobConfig.authMethod === 'managedIdentity';
  const showAccountName = blobConfig.authMethod === 'accountKey' || blobConfig.authMethod === 'sasToken' || blobConfig.authMethod === 'managedIdentity';
  return <Box sx={{
    mt: 2
  }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1">
          Azure Blob Storage Configuration
        </Typography>
        
        <Box>
          {!readOnly && <>
              <Button variant="outlined" color="primary" onClick={testConnection} disabled={testing || !canTest()} startIcon={testing ? <CircularProgress size={20} /> : testResult ? testResult.success ? <CheckCircleIcon /> : <ErrorIcon /> : null} sx={{
            mr: 1
          }}>

                {testing ? 'Testing...' : 'Test Connection'}
              </Button>
              
              <Button variant="outlined" color={hasCredentials ? "success" : "primary"} onClick={toggleCredentialManager} startIcon={<KeyIcon />} disabled={testing} sx={{
            mr: 1
          }}>

                {hasCredentials ? 'Manage Credentials' : 'Set Up Credentials'}
              </Button>
            </>}

          
          <Button variant="contained" color="primary" onClick={handleOpenBrowser} startIcon={<StorageIcon />} disabled={readOnly || testing}>

            Browse Storage
          </Button>
        </Box>
      </Box>
      
      {/* Credential Manager Section */}
      {showCredentialManager && <Box mb={3}>
          <AzureCredentialManager onCredentialsLoaded={handleCredentialsLoaded} onCredentialsSaved={handleCredentialsLoaded} readOnly={readOnly} initialVisible={true} />

        </Box>}

      
      {/* Authentication section */}
      {isSuperUser && <Paper elevation={0} variant="outlined" sx={{
      p: 2,
      mb: 3
    }}>
          <Typography variant="subtitle2" gutterBottom>
            Authentication Settings
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Authentication Method
                </Typography>
                <RadioGroup name="authMethod" value={blobConfig.authMethod} onChange={handleChange} row disabled={readOnly}>

                  {authMethods.map(method => <FormControlLabel key={method.value} value={method.value} control={<Radio />} label={method.label} disabled={readOnly} />)}


                </RadioGroup>
              </FormControl>
            </Grid>
            
            {/* Connection String */}
            {showConnectionString && <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.connectionString}>
                  <TextField name="connectionString" label="Connection String" value={blobConfig.connectionString} onChange={handleChange} type={showSecrets ? 'text' : 'password'} error={!!errors.connectionString} helperText={errors.connectionString} disabled={readOnly} InputProps={{
              endAdornment: <InputAdornment position="end">
                          <IconButton onClick={toggleShowSecrets} edge="end">

                            {showSecrets ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                          <Tooltip title="The connection string for your Azure Storage account. Format: DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net">
                            <IconButton edge="end">
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
            }} />

                </FormControl>
              </Grid>}

            
            {/* Account Name */}
            {showAccountName && <Grid item xs={12} md={showAccountKey ? 6 : 12}>
                <FormControl fullWidth error={!!errors.accountName}>
                  <TextField name="accountName" label="Storage Account Name" value={blobConfig.accountName} onChange={handleChange} error={!!errors.accountName} helperText={errors.accountName} disabled={readOnly} />

                </FormControl>
              </Grid>}

            
            {/* Account Key */}
            {showAccountKey && <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.accountKey}>
                  <TextField name="accountKey" label="Account Key" value={blobConfig.accountKey} onChange={handleChange} type={showSecrets ? 'text' : 'password'} error={!!errors.accountKey} helperText={errors.accountKey} disabled={readOnly} InputProps={{
              endAdornment: <InputAdornment position="end">
                          <IconButton onClick={toggleShowSecrets} edge="end">

                            {showSecrets ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
            }} />

                </FormControl>
              </Grid>}

            
            {/* SAS Token */}
            {showSasToken && <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.sasToken}>
                  <TextField name="sasToken" label="SAS Token" value={blobConfig.sasToken} onChange={handleChange} type={showSecrets ? 'text' : 'password'} error={!!errors.sasToken} helperText={errors.sasToken || "Include the leading '?' character"} disabled={readOnly} InputProps={{
              endAdornment: <InputAdornment position="end">
                          <IconButton onClick={toggleShowSecrets} edge="end">

                            {showSecrets ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                          <Tooltip title="A Shared Access Signature (SAS) token providing permissions to the storage account or container">
                            <IconButton edge="end">
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
            }} />

                </FormControl>
              </Grid>}

            
            {/* Managed Identity (no additional fields needed) */}
            {showManagedIdentity && <Grid item xs={12}>
                <Paper variant="outlined" sx={{
            p: 2,
            bgcolor: 'background.default'
          }}>
                  <Typography variant="body2" color="textSecondary">
                    Using Azure Managed Identity for authentication. No additional credentials required.
                    The application will use the identity assigned to the deployment environment.
                  </Typography>
                </Paper>
              </Grid>}

          </Grid>
        </Paper>}

      
      {/* Container Configuration - Available to all users */}
      <Paper elevation={0} variant="outlined" sx={{
      p: 2
    }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2">
            Container Settings
          </Typography>
          
          {!readOnly && canTest() && <Button variant="outlined" size="small" onClick={testConnection} disabled={testing} startIcon={testing ? <CircularProgress size={16} /> : testResult ? testResult.success ? <CheckCircleIcon size="small" /> : <ErrorIcon size="small" /> : null}>

              Test Connection
            </Button>}

        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.containerName}>
              <TextField name="containerName" label="Container Name" value={blobConfig.containerName} onChange={handleChange} error={!!errors.containerName} helperText={errors.containerName || "Name of the Azure Blob container"} disabled={readOnly} InputProps={{
              endAdornment: blobConfig.containerName ? <InputAdornment position="end">
                      <Tooltip title="Browse container">
                        <IconButton edge="end" onClick={handleOpenBrowser} disabled={readOnly}>

                          <StorageIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment> : null
            }} />

            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.filePattern}>
              <TextField name="filePattern" label="File Pattern" value={blobConfig.filePattern} onChange={handleChange} error={!!errors.filePattern} helperText={errors.filePattern || "Example: *.csv, employee-*.json"} disabled={readOnly} InputProps={{
              endAdornment: blobConfig.containerName && blobConfig.filePattern ? <InputAdornment position="end">
                      <Tooltip title="Preview matching files">
                        <IconButton edge="end" onClick={previewPattern} disabled={readOnly || previewLoading}>

                          <SearchIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment> : null
            }} />

            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth>
              <TextField name="path" label="Path (Optional)" value={blobConfig.path} onChange={handleChange} helperText="Optional folder path inside the container (e.g., 'daily/employees/')" disabled={readOnly} InputProps={{
              endAdornment: blobConfig.path ? <InputAdornment position="end">
                      <Tooltip title="Browse this path">
                        <IconButton edge="end" onClick={handleOpenBrowser} disabled={readOnly}>

                          <FolderIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment> : null
            }} />

            </FormControl>
          </Grid>
          
          {!readOnly && <Grid item xs={12}>
              <FormControl fullWidth>
                <FormControlLabel control={<Checkbox name="createContainerIfNotExists" checked={blobConfig.createContainerIfNotExists} onChange={handleChange} disabled={readOnly} />} label="Create container if it doesn't exist" />

                <FormHelperText>
                  If enabled, the system will attempt to create the container when the integration runs
                </FormHelperText>
              </FormControl>
            </Grid>}

        </Grid>
        
        {/* Pattern Preview Section */}
        {patternMatches.length > 0 && <Box mt={2}>
            <Divider sx={{
          mb: 2
        }} />
            <Typography variant="subtitle2" gutterBottom>
              Preview of Files Matching Pattern
            </Typography>
            
            <Box sx={{
          maxHeight: '200px',
          overflow: 'auto',
          mb: 1
        }}>
              <List dense>
                {patternMatches.map((file, idx) => <ListItem key={idx}>
                    <ListItemIcon>
                      <FileIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={file.name} secondary={`${formatFileSize(file.size)} • ${formatDate(file.lastModified)}`} />

                  </ListItem>)}

              </List>
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="textSecondary">
                {patternMatches.length} file(s) match your pattern
              </Typography>
              <Button size="small" onClick={() => setPatternMatches([])} startIcon={<CloseIcon />}>

                Close Preview
              </Button>
            </Box>
          </Box>}

      </Paper>
      
      {/* Container Browser Dialog */}
      <Dialog open={browserOpen} onClose={handleCloseBrowser} fullWidth maxWidth="lg" sx={{
      '& .MuiDialog-paper': {
        height: '80vh'
      }
    }}>

        <DialogTitle>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Browse Containers" />
            <Tab label="Connection Settings" disabled={!canTest()} />
          </Tabs>
        </DialogTitle>
        
        <DialogContent dividers sx={{
        height: '100%',
        p: 0
      }}>
          {activeTab === 0 && <Box sx={{
          height: '100%'
        }}>
              <AzureBlobContainerBrowser config={blobConfig} onSelectContainer={handleSelectContainer} onSelectBlob={handleSelectBlob} readOnly={readOnly} selectedContainer={blobConfig.containerName} selectedPath={blobConfig.path} />

            </Box>}

          
          {activeTab === 1 && <Box sx={{
          p: 3
        }}>
              <Typography variant="h6" gutterBottom>
                Connection Diagnostics
              </Typography>
              
              {/* Show connection settings summary */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{
                p: 2
              }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Authentication Method
                    </Typography>
                    <Chip label={authMethods.find(m => m.value === blobConfig.authMethod)?.label} color="primary" variant="outlined" />

                    
                    <Divider sx={{
                  my: 2
                }} />
                    
                    {/* Show relevant connection settings based on auth method */}
                    {showConnectionString && <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Connection String
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {showSecrets ? blobConfig.connectionString : '•••••••••••••••••••••••••••••'}
                        </Typography>
                      </Box>}

                    
                    {showAccountName && <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Storage Account Name
                        </Typography>
                        <Typography variant="body2">
                          {blobConfig.accountName}
                        </Typography>
                      </Box>}

                    
                    {showAccountKey && <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Account Key
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {showSecrets ? blobConfig.accountKey : '•••••••••••••••••••••••••••••'}
                        </Typography>
                      </Box>}

                    
                    {showSasToken && <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          SAS Token
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {showSecrets ? blobConfig.sasToken : '•••••••••••••••••••••••••••••'}
                        </Typography>
                      </Box>}

                    
                    {showManagedIdentity && <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Managed Identity
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Using the system-assigned managed identity
                        </Typography>
                      </Box>}

                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Button variant="contained" color="primary" onClick={testConnection} disabled={testing || !canTest()} startIcon={testing ? <CircularProgress size={20} /> : null} fullWidth>

                    {testing ? 'Testing Connection...' : 'Test Connection'}
                  </Button>
                  
                  {testResult && <Box sx={{
                mt: 2
              }}>
                      <Alert severity={testResult.success ? 'success' : 'error'} sx={{
                  mb: 2
                }} action={<IconButton aria-label="close" color="inherit" size="small" onClick={() => setTestResult(null)}>

                            <CloseIcon fontSize="inherit" />
                          </IconButton>}>


                        {testResult.message}
                      </Alert>
                      
                      {/* Detailed diagnostic results */}
                      {testResult.diagnosticSteps && <Paper variant="outlined" sx={{
                  p: 2
                }}>
                          <Typography variant="h6" gutterBottom>
                            Diagnostic Results
                          </Typography>
                          <List dense>
                            {testResult.diagnosticSteps.map((step, index) => <ListItem key={index} divider={index < testResult.diagnosticSteps.length - 1} sx={{
                      py: 1.5,
                      backgroundColor: step.success ? 'success.lighter' : index === testResult.diagnosticSteps.findIndex(s => !s.success) ? 'error.lighter' : 'inherit'
                    }}>

                                <ListItemIcon>
                                  {step.success ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />}

                                </ListItemIcon>
                                <ListItemText primary={step.name} secondary={step.message} primaryTypographyProps={{
                        fontWeight: 'medium'
                      }} />

                                <Tooltip title={<Box>
                                      <Typography variant="subtitle2">Details</Typography>
                                      <pre style={{
                          whiteSpace: 'pre-wrap',
                          fontSize: '0.8rem'
                        }}>
                                        {JSON.stringify(step.details, null, 2)}
                                      </pre>
                                    </Box>}>


                                  <IconButton size="small">
                                    <InfoIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </ListItem>)}

                          </List>
                          
                          {/* Recommendations */}
                          {testResult.details && testResult.details.recommendation && <Box sx={{
                    mt: 2,
                    bgcolor: 'info.lighter',
                    p: 2,
                    borderRadius: 1
                  }}>
                              <Typography variant="subtitle2" color="info.dark">
                                Recommendation
                              </Typography>
                              <Typography variant="body2">
                                {testResult.details.recommendation}
                              </Typography>
                            </Box>}

                          
                          {/* Possible Issues */}
                          {testResult.details && testResult.details.possibleIssues && <Box sx={{
                    mt: 2,
                    bgcolor: 'warning.lighter',
                    p: 2,
                    borderRadius: 1
                  }}>
                              <Typography variant="subtitle2" color="warning.dark">
                                Possible Issues
                              </Typography>
                              <List dense disablePadding>
                                {testResult.details.possibleIssues.map((issue, index) => <ListItem key={index} disableGutters>
                                    <ListItemIcon sx={{
                          minWidth: 24
                        }}>
                                      <WarningIcon fontSize="small" color="warning" />
                                    </ListItemIcon>
                                    <ListItemText primary={issue} primaryTypographyProps={{
                          variant: 'body2'
                        }} />

                                  </ListItem>)}

                              </List>
                            </Box>}

                          
                          {/* Missing Components */}
                          {testResult.details && testResult.details.missingComponents && <Box sx={{
                    mt: 2,
                    bgcolor: 'error.lighter',
                    p: 2,
                    borderRadius: 1
                  }}>
                              <Typography variant="subtitle2" color="error.dark">
                                Missing Components
                              </Typography>
                              <List dense disablePadding>
                                {testResult.details.missingComponents.map((component, index) => <ListItem key={index} disableGutters>
                                    <ListItemIcon sx={{
                          minWidth: 24
                        }}>
                                      <ErrorOutlineIcon fontSize="small" color="error" />
                                    </ListItemIcon>
                                    <ListItemText primary={component} primaryTypographyProps={{
                          variant: 'body2'
                        }} />

                                  </ListItem>)}

                              </List>
                            </Box>}

                          
                          {/* Issues */}
                          {testResult.details && testResult.details.issues && <Box sx={{
                    mt: 2,
                    bgcolor: 'error.lighter',
                    p: 2,
                    borderRadius: 1
                  }}>
                              <Typography variant="subtitle2" color="error.dark">
                                Validation Issues
                              </Typography>
                              <List dense disablePadding>
                                {testResult.details.issues.map((issue, index) => <ListItem key={index} disableGutters>
                                    <ListItemIcon sx={{
                          minWidth: 24
                        }}>
                                      <ErrorOutlineIcon fontSize="small" color="error" />
                                    </ListItemIcon>
                                    <ListItemText primary={issue} primaryTypographyProps={{
                          variant: 'body2'
                        }} />

                                  </ListItem>)}

                              </List>
                            </Box>}

                        </Paper>}

                    </Box>}

                </Grid>
              </Grid>
            </Box>}

        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseBrowser}>Close</Button>
          
          {activeTab === 0 && <Button onClick={() => {
          handleCloseBrowser();
        }} color="primary" variant="contained">

              Apply Selection
            </Button>}

        </DialogActions>
      </Dialog>
      
      {/* Test Connection Result Snackbar */}
      <Snackbar open={testSnackbarOpen} autoHideDuration={6000} onClose={() => setTestSnackbarOpen(false)} anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right'
    }}>

        <Alert onClose={() => setTestSnackbarOpen(false)} severity={testResult?.success ? 'success' : 'error'} sx={{
        width: '100%'
      }} action={<Button color="inherit" size="small" onClick={() => {
        setTestSnackbarOpen(false);
        setActiveTab(1); // Switch to the Connection Settings tab
      }}>

              See Details
            </Button>}>


          <AlertTitle>
            {testResult?.success ? 'Connection Successful' : 'Connection Failed'}
          </AlertTitle>
          {testResult?.message}
          {testResult?.diagnosticSteps && <Typography variant="caption" display="block" sx={{
          mt: 1
        }}>
              {testResult.diagnosticSteps.filter(step => step.success).length} of {testResult.diagnosticSteps.length} diagnostic checks passed
            </Typography>}

        </Alert>
      </Snackbar>
    </Box>;
};

// Helper functions for formatted display
export default withErrorBoundary(AzureBlobConfiguration, {
  fallback: (error, resetErrorBoundary) => <div className="error-boundary-fallback"><h3>Something went wrong</h3><p>{error.message}</p><button onClick={resetErrorBoundary}>Try again</button></div>
});

// Helper function for formatting file sizes
const formatFileSize = bytes => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
const formatDate = dateString => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleString();
};

// Additional imports
import Checkbox from '@mui/material/Checkbox';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import FileIcon from '@mui/icons-material/InsertDriveFile';
// CloseIcon already imported on line 49
import WarningIcon from '@mui/icons-material/Warning';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { withErrorBoundary } from "@/error-handling/withErrorBoundary";