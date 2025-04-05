/**
 * AzureCredentialManager.jsx
 * 
 * A component for securely managing Azure Blob Storage credentials. It provides an
 * interface for entering, testing, and securely storing Azure credentials.
 */

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Card, CardContent, CardHeader, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, FormControlLabel, FormHelperText, Grid, IconButton, InputAdornment, MenuItem, Paper, Radio, RadioGroup, Select, Stack, Switch, TextField, Tooltip, Typography, Alert, AlertTitle, Collapse, Chip } from '@mui/material';

// Icons
import { Info as InfoIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon, Save as SaveIcon, Delete as DeleteIcon, CheckCircle as CheckCircleIcon, Error as ErrorIcon, LockOutlined as LockIcon, LockOpen as UnlockIcon, Refresh as RefreshIcon, Key as KeyIcon } from '@mui/icons-material';

// Services
import { credentialService } from "@/services/credentialService";

/**
 * AzureCredentialManager component for securely managing Azure Blob Storage credentials
 */
import { withErrorBoundary } from "@/error-handling/withErrorBoundary";
const AzureCredentialManager = ({
  onCredentialsSaved,
  onCredentialsLoaded,
  readOnly = false,
  showSaveControls = true,
  initialVisible = false
}) => {
  // Credential state
  const [credentials, setCredentials] = useState({
    authMethod: 'connectionString',
    connectionString: '',
    accountName: '',
    accountKey: '',
    sasToken: '',
    tenantId: '',
    clientId: '',
    clientSecret: '',
    useManagedIdentity: false
  });

  // UI state
  const [showSecrets, setShowSecrets] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(initialVisible);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Status messages
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  // Test result state
  const [testResult, setTestResult] = useState(null);

  /**
   * Fetch stored credentials on component mount
   */
  useEffect(() => {
    const loadCredentials = async () => {
      setLoading(true);
      try {
        // First check if credentials exist without requesting secrets
        const hasCredsResult = await credentialService.hasCredentials('azure');
        setHasStoredCredentials(hasCredsResult);

        // If credentials exist and component is expanded, load them
        if (hasCredsResult && expanded) {
          const result = await credentialService.getCredentials('azure', true);
          if (result.success && result.data) {
            // Determine the auth method from the credentials
            let authMethod = 'connectionString';
            if (result.data.connection_string) {
              authMethod = 'connectionString';
            } else if (result.data.sas_token) {
              authMethod = 'sasToken';
            } else if (result.data.client_id && result.data.client_secret) {
              authMethod = 'servicePrincipal';
            } else if (result.data.account_key) {
              authMethod = 'accountKey';
            } else {
              authMethod = 'managedIdentity';
            }
            const newCredentials = {
              authMethod,
              connectionString: result.data.connection_string || '',
              accountName: result.data.account_name || '',
              accountKey: result.data.account_key || '',
              sasToken: result.data.sas_token || '',
              tenantId: result.data.tenant_id || '',
              clientId: result.data.client_id || '',
              clientSecret: result.data.client_secret || '',
              useManagedIdentity: authMethod === 'managedIdentity'
            };
            setCredentials(newCredentials);
            setLastUpdated(result.data.last_updated);

            // Notify parent component
            if (onCredentialsLoaded) {
              onCredentialsLoaded(newCredentials);
            }
          }
        }
      } catch (err) {
        console.error('Error loading credentials:', err);
        setError('Failed to load stored credentials');
      } finally {
        setLoading(false);
      }
    };
    loadCredentials();
  }, [expanded, onCredentialsLoaded]);

  /**
   * Handle input change
   */
  const handleChange = e => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    // Update credentials state
    setCredentials(prev => {
      // If changing auth method, reset related fields
      if (name === 'authMethod') {
        const updated = {
          ...prev,
          [name]: newValue,
          // Reset all credential fields
          connectionString: '',
          accountKey: '',
          sasToken: '',
          clientId: '',
          clientSecret: ''
          // Keep account name for all methods
        };

        // Set managed identity flag
        if (newValue === 'managedIdentity') {
          updated.useManagedIdentity = true;
        } else {
          updated.useManagedIdentity = false;
        }
        return updated;
      }
      return {
        ...prev,
        [name]: newValue
      };
    });

    // Clear any status or error messages
    setStatus(null);
    setError(null);
    setTestResult(null);
  };

  /**
   * Toggle visibility of secret fields
   */
  const toggleShowSecrets = () => {
    setShowSecrets(!showSecrets);
  };

  /**
   * Toggle expansion of the credential form
   */
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  /**
   * Save credentials to secure storage
   */
  const saveCredentials = async () => {
    setSaving(true);
    setStatus(null);
    setError(null);
    try {
      // Convert credentials format for storage
      const storageCredentials = {
        connection_string: credentials.authMethod === 'connectionString' ? credentials.connectionString : '',
        account_name: credentials.accountName,
        account_key: credentials.authMethod === 'accountKey' ? credentials.accountKey : '',
        sas_token: credentials.authMethod === 'sasToken' ? credentials.sasToken : '',
        tenant_id: credentials.authMethod === 'servicePrincipal' ? credentials.tenantId : '',
        client_id: credentials.authMethod === 'servicePrincipal' ? credentials.clientId : '',
        client_secret: credentials.authMethod === 'servicePrincipal' ? credentials.clientSecret : '',
        use_managed_identity: credentials.authMethod === 'managedIdentity'
      };

      // Store credentials
      const result_1 = await credentialService.storeCredentials('azure', storageCredentials);
      if (result_1.success) {
        setStatus('Credentials saved successfully');
        setHasStoredCredentials(true);
        setLastUpdated(new Date().toISOString());

        // Notify parent component
        if (onCredentialsSaved) {
          onCredentialsSaved(credentials);
        }
      } else {
        setError(result_1.message || 'Failed to save credentials');
      }
    } catch (err) {
      console.error('Error saving credentials:', err);
      setError('An error occurred while saving credentials');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Delete stored credentials
   */
  const deleteCredentials = async () => {
    setLoading(true);
    setStatus(null);
    setError(null);
    try {
      const result_2 = await credentialService.deleteCredentials('azure');
      if (result_2.success) {
        setStatus('Credentials deleted successfully');
        setHasStoredCredentials(false);
        setLastUpdated(null);

        // Reset form
        setCredentials({
          authMethod: 'connectionString',
          connectionString: '',
          accountName: '',
          accountKey: '',
          sasToken: '',
          tenantId: '',
          clientId: '',
          clientSecret: '',
          useManagedIdentity: false
        });

        // Notify parent component
        if (onCredentialsSaved) {
          onCredentialsSaved(null);
        }
      } else {
        setError(result_2.message || 'Failed to delete credentials');
      }
    } catch (err) {
      console.error('Error deleting credentials:', err);
      setError('An error occurred while deleting credentials');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  /**
   * Test credentials by connecting to Azure
   */
  const testConnection = useCallback(async () => {
    setLoading(true);
    setStatus(null);
    setError(null);
    setTestResult(null);
    try {
      // Format credentials for testing
      const testCredentials = {
        connection_string: credentials.authMethod === 'connectionString' ? credentials.connectionString : '',
        account_name: credentials.accountName,
        account_key: credentials.authMethod === 'accountKey' ? credentials.accountKey : '',
        sas_token: credentials.authMethod === 'sasToken' ? credentials.sasToken : '',
        tenant_id: credentials.authMethod === 'servicePrincipal' ? credentials.tenantId : '',
        client_id: credentials.authMethod === 'servicePrincipal' ? credentials.clientId : '',
        client_secret: credentials.authMethod === 'servicePrincipal' ? credentials.clientSecret : '',
        use_managed_identity: credentials.authMethod === 'managedIdentity'
      };

      // Send test request
      const result_3 = await credentialService.testCredentials('azure', testCredentials);
      setTestResult(result_3);
      if (result_3.success) {
        setStatus('Connection successful');
      } else {
        setError(result_3.message || 'Connection failed');
      }
    } catch (err) {
      console.error('Error testing credentials:', err);
      setError('An error occurred during connection test');
      setTestResult({
        success: false,
        message: 'An error occurred during connection test',
        details: {
          error: err.message
        }
      });
    } finally {
      setLoading(false);
    }
  }, [credentials]);

  /**
   * Validate if credentials are complete for the selected auth method
   */
  const validateCredentials = useCallback(() => {
    switch (credentials.authMethod) {
      case 'connectionString':
        return credentials.connectionString.trim() !== '';
      case 'accountKey':
        return credentials.accountName.trim() !== '' && credentials.accountKey.trim() !== '';
      case 'sasToken':
        return credentials.accountName.trim() !== '' && credentials.sasToken.trim() !== '';
      case 'servicePrincipal':
        return credentials.accountName.trim() !== '' && credentials.tenantId.trim() !== '' && credentials.clientId.trim() !== '' && credentials.clientSecret.trim() !== '';
      case 'managedIdentity':
        return credentials.accountName.trim() !== '';
      default:
        return false;
    }
  }, [credentials]);

  // Check if credentials are valid
  const isValid = validateCredentials();

  /**
   * Format date for display
   */
  const formatDate = dateString => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (err) {
      return 'Unknown';
    }
  };

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
    value: 'servicePrincipal',
    label: 'Service Principal'
  }, {
    value: 'managedIdentity',
    label: 'Managed Identity'
  }];

  // Field visibility based on selected auth method
  const showConnectionString = credentials.authMethod === 'connectionString';
  const showAccountKey = credentials.authMethod === 'accountKey';
  const showSasToken = credentials.authMethod === 'sasToken';
  const showServicePrincipal = credentials.authMethod === 'servicePrincipal';
  const showAccountName = credentials.authMethod !== 'connectionString';
  return <Card variant="outlined">
      <CardHeader title={<Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
            <Box sx={{
        display: 'flex',
        alignItems: 'center'
      }}>
              <KeyIcon sx={{
          mr: 1,
          color: 'primary.main'
        }} />
              <Typography variant="h6">Azure Blob Storage Credentials</Typography>
              {hasStoredCredentials && <Chip label="Credentials Stored" color="success" size="small" icon={<LockIcon />} sx={{
          ml: 2
        }} />}


            </Box>
            <IconButton onClick={toggleExpanded}>
              {expanded ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Box>} subheader={hasStoredCredentials ? <Typography variant="body2" color="text.secondary">
              Last Updated: {formatDate(lastUpdated)}
            </Typography> : <Typography variant="body2" color="text.secondary">
              No stored credentials
            </Typography>} />



      
      <Collapse in={expanded}>
        <CardContent>
          {/* Authentication Method Selection */}
          <Box sx={{
          mb: 3
        }}>
            <Typography variant="subtitle2" gutterBottom>
              Authentication Method
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup row name="authMethod" value={credentials.authMethod} onChange={handleChange}>

                {authMethods.map(method => <FormControlLabel key={method.value} value={method.value} control={<Radio />} label={method.label} disabled={loading || readOnly} />)}


              </RadioGroup>
            </FormControl>
          </Box>
          
          <Grid container spacing={2}>
            {/* Connection String */}
            {showConnectionString && <Grid item xs={12}>
                <FormControl fullWidth>
                  <TextField name="connectionString" label="Connection String" value={credentials.connectionString} onChange={handleChange} type={showSecrets ? 'text' : 'password'} disabled={loading || readOnly} InputProps={{
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

                  <FormHelperText>
                    Full Azure Storage connection string with account name and key
                  </FormHelperText>
                </FormControl>
              </Grid>}

            
            {/* Account Name */}
            {showAccountName && <Grid item xs={12} md={showAccountKey || showSasToken ? 6 : 12}>
                <FormControl fullWidth>
                  <TextField name="accountName" label="Storage Account Name" value={credentials.accountName} onChange={handleChange} disabled={loading || readOnly} />

                  <FormHelperText>
                    Name of your Azure Storage account
                  </FormHelperText>
                </FormControl>
              </Grid>}

            
            {/* Account Key */}
            {showAccountKey && <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <TextField name="accountKey" label="Account Key" value={credentials.accountKey} onChange={handleChange} type={showSecrets ? 'text' : 'password'} disabled={loading || readOnly} InputProps={{
                endAdornment: <InputAdornment position="end">
                          <IconButton onClick={toggleShowSecrets} edge="end">

                            {showSecrets ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
              }} />

                  <FormHelperText>
                    Azure Storage account access key
                  </FormHelperText>
                </FormControl>
              </Grid>}

            
            {/* SAS Token */}
            {showSasToken && <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <TextField name="sasToken" label="SAS Token" value={credentials.sasToken} onChange={handleChange} type={showSecrets ? 'text' : 'password'} disabled={loading || readOnly} InputProps={{
                endAdornment: <InputAdornment position="end">
                          <IconButton onClick={toggleShowSecrets} edge="end">

                            {showSecrets ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
              }} />

                  <FormHelperText>
                    Shared Access Signature token (include the leading '?')
                  </FormHelperText>
                </FormControl>
              </Grid>}

            
            {/* Service Principal */}
            {showServicePrincipal && <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <TextField name="tenantId" label="Tenant ID" value={credentials.tenantId} onChange={handleChange} disabled={loading || readOnly} />

                    <FormHelperText>
                      Azure AD tenant ID
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <TextField name="clientId" label="Client ID" value={credentials.clientId} onChange={handleChange} disabled={loading || readOnly} />

                    <FormHelperText>
                      Azure AD application (client) ID
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <TextField name="clientSecret" label="Client Secret" value={credentials.clientSecret} onChange={handleChange} type={showSecrets ? 'text' : 'password'} disabled={loading || readOnly} InputProps={{
                  endAdornment: <InputAdornment position="end">
                            <IconButton onClick={toggleShowSecrets} edge="end">

                              {showSecrets ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                }} />

                    <FormHelperText>
                      Azure AD application client secret
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </>}

            
            {/* Managed Identity */}
            {credentials.authMethod === 'managedIdentity' && <Grid item xs={12}>
                <Paper variant="outlined" sx={{
              p: 2,
              bgcolor: 'background.default'
            }}>
                  <Typography variant="body2" color="textSecondary">
                    Using Azure Managed Identity for authentication. No additional credentials required.
                    The application will use the system-assigned identity in the Azure environment.
                  </Typography>
                </Paper>
              </Grid>}

          </Grid>
          
          {/* Status Messages */}
          {(status || error || testResult) && <Box sx={{
          mt: 3
        }}>
              {status && !error && <Alert severity="success" sx={{
            mb: 2
          }}>
                  {status}
                </Alert>}

              
              {error && <Alert severity="error" sx={{
            mb: 2
          }}>
                  {error}
                </Alert>}

              
              {testResult && <Alert severity={testResult.success ? 'success' : 'error'} sx={{
            mb: 2
          }}>

                  <AlertTitle>
                    {testResult.success ? 'Connection Test Successful' : 'Connection Test Failed'}
                  </AlertTitle>
                  <Typography variant="body2">
                    {testResult.message}
                  </Typography>
                  
                  {testResult.details && <Box sx={{
              mt: 1
            }}>
                      {testResult.success ? <>
                          {testResult.details.containers && <Typography variant="body2">
                              Found {testResult.details.containers} container(s)
                            </Typography>}

                          {testResult.details.account && <Typography variant="body2">
                              Account: {testResult.details.account}
                            </Typography>}

                          {testResult.details.permissions && <Typography variant="body2">
                              Permissions: {testResult.details.permissions.join(', ')}
                            </Typography>}

                        </> : <>
                          {testResult.details.error && <Typography variant="body2">
                              Error: {testResult.details.error}
                            </Typography>}

                          {testResult.details.code && <Typography variant="body2">
                              Code: {testResult.details.code}
                            </Typography>}

                        </>}

                    </Box>}

                </Alert>}

            </Box>}

          
          {/* Action Buttons */}
          {showSaveControls && <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 3
        }}>
              <Box>
                <Button variant="contained" color="primary" disabled={!isValid || loading || readOnly} onClick={testConnection} startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}>

                  Test Connection
                </Button>
              </Box>
              
              <Box>
                {hasStoredCredentials && <Button variant="outlined" color="error" onClick={() => setShowDeleteConfirm(true)} disabled={loading || readOnly} startIcon={<DeleteIcon />} sx={{
              mr: 1
            }}>

                    Delete
                  </Button>}

                
                <Button variant="contained" color="primary" disabled={!isValid || loading || readOnly} onClick={saveCredentials} startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}>

                  {saving ? 'Saving...' : hasStoredCredentials ? 'Update' : 'Save'}
                </Button>
              </Box>
            </Box>}

        </CardContent>
      </Collapse>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>

        <DialogTitle>Delete Credentials?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the stored Azure Blob Storage credentials? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)} autoFocus>
            Cancel
          </Button>
          <Button onClick={deleteCredentials} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>;
};
AzureCredentialManager.propTypes = {
  onCredentialsSaved: PropTypes.func,
  onCredentialsLoaded: PropTypes.func,
  readOnly: PropTypes.bool,
  showSaveControls: PropTypes.bool,
  initialVisible: PropTypes.bool
};
export default AzureCredentialManager;