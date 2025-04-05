import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling"; /**
                                                                                      * SharePoint Credential Manager Component
                                                                                      *
                                                                                      * A component for managing and storing SharePoint/Microsoft Graph API credentials
                                                                                      * with support for various authentication methods.
                                                                                      *
                                                                                      * @component
                                                                                      */
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Card, CardActions, CardContent, CircularProgress, Collapse, Divider, FormControl, FormControlLabel, FormHelperText, Grid, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Radio, RadioGroup, Select, Stack, Switch, Tab, Tabs, TextField, Tooltip, Typography, Alert, AlertTitle, Paper } from '@mui/material';
import { CheckCircle as CheckCircleIcon, ErrorOutline as ErrorOutlineIcon, Help as HelpIcon, Key as KeyIcon, Refresh as RefreshIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon, VerifiedUser as VerifiedUserIcon, Link as LinkIcon, AccountCircle as AccountCircleIcon, Apps as AppsIcon, Security as SecurityIcon, Terminal as TerminalIcon, AddCircleOutline as AddCircleOutlineIcon, Settings as SettingsIcon, InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material';

/**
 * SharePoint Credential Manager Component
 */
import { ENV } from "@/utils/environmentConfig";
const SharePointCredentialManager = ({
  credentials = {},
  onChange = () => {},
  onTest = () => {},
  testResults = null,
  loading = false,
  disabled = false
}) => {
  const [formError, setFormError] = useState(null);
  // Authentication method state
  const [authMethod, setAuthMethod] = useState(credentials?.authMethod || 'oauth');

  // OAuth credentials
  const [tenantId, setTenantId] = useState(credentials?.tenantId || '');
  const [clientId, setClientId] = useState(credentials?.clientId || '');
  const [clientSecret, setClientSecret] = useState(credentials?.clientSecret || '');
  const [showClientSecret, setShowClientSecret] = useState(false);

  // App-only credentials
  const [appId, setAppId] = useState(credentials?.appId || '');
  const [appSecret, setAppSecret] = useState(credentials?.appSecret || '');
  const [showAppSecret, setShowAppSecret] = useState(false);

  // Certificate credentials
  const [certificateThumbprint, setCertificateThumbprint] = useState(credentials?.certificateThumbprint || '');
  const [certificatePrivateKey, setCertificatePrivateKey] = useState(credentials?.certificatePrivateKey || '');
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  // General settings
  const [resourceUrl, setResourceUrl] = useState(credentials?.resourceUrl || 'https://graph.microsoft.com');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle authentication method change
   */
  const handleAuthMethodChange = event => {
    setAuthMethod(event.target.value);
  };

  /**
   * Update credentials when values change
   */
  useEffect(() => {
    // Common parameters for all auth methods
    const baseCredentials = {
      authMethod,
      resourceUrl
    };

    // Method-specific parameters
    let methodCredentials = {};
    if (authMethod === 'oauth') {
      methodCredentials = {
        tenantId,
        clientId,
        clientSecret
      };
    } else if (authMethod === 'app') {
      methodCredentials = {
        tenantId,
        appId,
        appSecret
      };
    } else if (authMethod === 'certificate') {
      methodCredentials = {
        tenantId,
        clientId,
        certificateThumbprint,
        certificatePrivateKey
      };
    }

    // Only update if at least the tenant ID is provided
    if (tenantId) {
      onChange({
        ...baseCredentials,
        ...methodCredentials
      });
    }
  }, [authMethod, tenantId, clientId, clientSecret, appId, appSecret, certificateThumbprint, certificatePrivateKey, resourceUrl, onChange]);

  /**
   * Test the credentials
   */
  const handleTest = useCallback(() => {
    setError(null);
    onTest();
  }, [onTest]);

  /**
   * Generate test credentials for development
   */
  const generateTestCredentials = useCallback(() => {
    // Only allow in development environment
    if (ENV.NODE_ENV !== 'development' && ENV.NODE_ENV !== 'test') {
      setError('Test credentials can only be generated in development environment');
      return;
    }

    // Use environment variables for credentials
    if (authMethod === 'oauth') {
      setTenantId(ENV.REACT_APP_SHAREPOINT_TENANT_ID || '');
      setClientId(ENV.REACT_APP_SHAREPOINT_CLIENT_ID || '');
      setClientSecret(ENV.REACT_APP_SHAREPOINT_CLIENT_SECRET || '');
    } else if (authMethod === 'app') {
      setTenantId(ENV.REACT_APP_SHAREPOINT_TENANT_ID || '');
      setAppId(ENV.REACT_APP_SHAREPOINT_APP_ID || '');
      setAppSecret(ENV.REACT_APP_SHAREPOINT_APP_SECRET || '');
    } else if (authMethod === 'certificate') {
      setTenantId(ENV.REACT_APP_SHAREPOINT_TENANT_ID || '');
      setClientId(ENV.REACT_APP_SHAREPOINT_CLIENT_ID || '');
      setCertificateThumbprint(ENV.REACT_APP_SHAREPOINT_CERT_THUMBPRINT || '');
      setCertificatePrivateKey(ENV.REACT_APP_SHAREPOINT_PRIVATE_KEY || '');
    }
    setResourceUrl('https://graph.microsoft.com');
  }, [authMethod]);
  return <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          SharePoint Connection Credentials
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Configure Microsoft SharePoint credentials using the Microsoft Graph API for secure access to sites and document libraries.
        </Typography>
        
        {/* Authentication Method Selection */}
        <FormControl component="fieldset" sx={{
        mb: 3
      }} disabled={disabled || loading}>
          <Typography variant="subtitle2" gutterBottom>
            Authentication Method
          </Typography>
          <RadioGroup name="auth-method" value={authMethod} onChange={handleAuthMethodChange} row>

            <FormControlLabel value="oauth" control={<Radio />} label={<Box sx={{
            display: 'flex',
            alignItems: 'center'
          }}>
                  <AccountCircleIcon fontSize="small" sx={{
              mr: 0.5
            }} />
                  <Typography variant="body2">OAuth 2.0</Typography>
                </Box>} />


            <FormControlLabel value="app" control={<Radio />} label={<Box sx={{
            display: 'flex',
            alignItems: 'center'
          }}>
                  <AppsIcon fontSize="small" sx={{
              mr: 0.5
            }} />
                  <Typography variant="body2">App-only authentication</Typography>
                </Box>} />


            <FormControlLabel value="certificate" control={<Radio />} label={<Box sx={{
            display: 'flex',
            alignItems: 'center'
          }}>
                  <SecurityIcon fontSize="small" sx={{
              mr: 0.5
            }} />
                  <Typography variant="body2">Certificate-based</Typography>
                </Box>} />


          </RadioGroup>
        </FormControl>
        
        <Divider sx={{
        my: 2
      }} />
        
        {/* Common Fields - Tenant ID */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField id="tenant-id" label="Tenant ID or Domain" fullWidth value={tenantId} onChange={e => setTenantId(e.target.value)} disabled={disabled || loading} required variant="outlined" placeholder="contoso.onmicrosoft.com" helperText="Enter your Microsoft 365 tenant ID or domain name" InputProps={{
            startAdornment: <InputAdornment position="start">
                    <LinkIcon fontSize="small" />
                  </InputAdornment>
          }} />

          </Grid>
        </Grid>
        
        {/* OAuth 2.0 Fields */}
        {authMethod === 'oauth' && <Grid container spacing={2} sx={{
        mt: 1
      }}>
            <Grid item xs={12} md={6}>
              <TextField id="client-id" label="Application (client) ID" fullWidth value={clientId} onChange={e => setClientId(e.target.value)} disabled={disabled || loading} required variant="outlined" placeholder="12345678-1234-1234-1234-123456789012" helperText="Client ID from Azure App Registration" InputProps={{
            startAdornment: <InputAdornment position="start">
                      <AppsIcon fontSize="small" />
                    </InputAdornment>
          }} />

            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl variant="outlined" fullWidth required>
                <InputLabel htmlFor="client-secret">Client Secret</InputLabel>
                <OutlinedInput id="client-secret" type={showClientSecret ? 'text' : 'password'} value={clientSecret} onChange={e => setClientSecret(e.target.value)} disabled={disabled || loading} placeholder="Enter client secret" startAdornment={<InputAdornment position="start">
                      <KeyIcon fontSize="small" />
                    </InputAdornment>} endAdornment={<InputAdornment position="end">
                      <IconButton aria-label="toggle secret visibility" onClick={() => setShowClientSecret(!showClientSecret)} edge="end">

                        {showClientSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>} label="Client Secret" />

                <FormHelperText>
                  Secret value from Azure App Registration
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>}

        
        {/* App-only Authentication Fields */}
        {authMethod === 'app' && <Grid container spacing={2} sx={{
        mt: 1
      }}>
            <Grid item xs={12} md={6}>
              <TextField id="app-id" label="App ID" fullWidth value={appId} onChange={e => setAppId(e.target.value)} disabled={disabled || loading} required variant="outlined" placeholder="87654321-4321-4321-4321-210987654321" helperText="Application ID from Azure App Registration" InputProps={{
            startAdornment: <InputAdornment position="start">
                      <AppsIcon fontSize="small" />
                    </InputAdornment>
          }} />

            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl variant="outlined" fullWidth required>
                <InputLabel htmlFor="app-secret">App Secret</InputLabel>
                <OutlinedInput id="app-secret" type={showAppSecret ? 'text' : 'password'} value={appSecret} onChange={e => setAppSecret(e.target.value)} disabled={disabled || loading} placeholder="Enter app secret" startAdornment={<InputAdornment position="start">
                      <KeyIcon fontSize="small" />
                    </InputAdornment>} endAdornment={<InputAdornment position="end">
                      <IconButton aria-label="toggle secret visibility" onClick={() => setShowAppSecret(!showAppSecret)} edge="end">

                        {showAppSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>} label="App Secret" />

                <FormHelperText>
                  App secret value from Azure App Registration
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>}

        
        {/* Certificate-based Authentication Fields */}
        {authMethod === 'certificate' && <Grid container spacing={2} sx={{
        mt: 1
      }}>
            <Grid item xs={12} md={6}>
              <TextField id="client-id-cert" label="Application (client) ID" fullWidth value={clientId} onChange={e => setClientId(e.target.value)} disabled={disabled || loading} required variant="outlined" placeholder="12345678-1234-1234-1234-123456789012" helperText="Client ID from Azure App Registration" InputProps={{
            startAdornment: <InputAdornment position="start">
                      <AppsIcon fontSize="small" />
                    </InputAdornment>
          }} />

            </Grid>
            <Grid item xs={12} md={6}>
              <TextField id="certificate-thumbprint" label="Certificate Thumbprint" fullWidth value={certificateThumbprint} onChange={e => setCertificateThumbprint(e.target.value)} disabled={disabled || loading} required variant="outlined" placeholder="1234567890ABCDEF1234567890ABCDEF12345678" helperText="Thumbprint of the certificate registered in Azure AD" InputProps={{
            startAdornment: <InputAdornment position="start">
                      <VerifiedUserIcon fontSize="small" />
                    </InputAdornment>
          }} />

            </Grid>
            <Grid item xs={12}>
              <FormControl variant="outlined" fullWidth required>
                <InputLabel htmlFor="certificate-private-key">Certificate Private Key</InputLabel>
                <OutlinedInput id="certificate-private-key" type={showPrivateKey ? 'text' : 'password'} value={certificatePrivateKey} onChange={e => setCertificatePrivateKey(e.target.value)} disabled={disabled || loading} placeholder="-----BEGIN PRIVATE KEY-----..." multiline rows={3} startAdornment={<InputAdornment position="start">
                      <KeyIcon fontSize="small" />
                    </InputAdornment>} endAdornment={<InputAdornment position="end">
                      <IconButton aria-label="toggle private key visibility" onClick={() => setShowPrivateKey(!showPrivateKey)} edge="end">

                        {showPrivateKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>} label="Certificate Private Key" />

                <FormHelperText>
                  Private key in PEM format
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>}

        
        {/* Advanced Options */}
        <Box sx={{
        mt: 3
      }}>
          <Button startIcon={<SettingsIcon />} onClick={() => setAdvancedOpen(!advancedOpen)} size="small" color="primary" disabled={disabled || loading}>

            {advancedOpen ? 'Hide Advanced Options' : 'Show Advanced Options'}
          </Button>
          
          <Collapse in={advancedOpen}>
            <Paper variant="outlined" sx={{
            p: 2,
            mt: 2
          }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField id="resource-url" label="Resource URL" fullWidth value={resourceUrl} onChange={e => setResourceUrl(e.target.value)} disabled={disabled || loading} variant="outlined" placeholder="https://graph.microsoft.com" helperText="The Microsoft Graph API endpoint (default: https://graph.microsoft.com)" InputProps={{
                  startAdornment: <InputAdornment position="start">
                          <LinkIcon fontSize="small" />
                        </InputAdornment>
                }} />

                </Grid>
                
                {ENV.NODE_ENV === 'development' && <Grid item xs={12}>
                    <Button variant="outlined" color="secondary" onClick={generateTestCredentials} startIcon={<TerminalIcon />} size="small" disabled={disabled || loading}>

                      Generate Test Credentials
                    </Button>
                    <Typography variant="caption" display="block" sx={{
                  mt: 1
                }}>
                      For development environment only: Creates simulated credentials for testing
                    </Typography>
                  </Grid>}

              </Grid>
            </Paper>
          </Collapse>
        </Box>
        
        {/* Error Display */}
        {error && <Alert severity="error" sx={{
        mt: 2
      }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>}

        
        {/* Test Results */}
        {testResults && <Alert severity={testResults.status === 'success' ? 'success' : 'error'} sx={{
        mt: 2
      }}>

            <AlertTitle>
              {testResults.status === 'success' ? 'Connection Successful' : 'Connection Failed'}
            </AlertTitle>
            {testResults.message}
            
            {testResults.details && <Box sx={{
          mt: 1
        }}>
                <Typography variant="body2" fontWeight="bold">Details:</Typography>
                <Box component="pre" sx={{
            mt: 1,
            p: 1,
            bgcolor: 'background.paper',
            borderRadius: 1,
            fontSize: '0.75rem',
            maxHeight: '150px',
            overflow: 'auto'
          }}>
                  {typeof testResults.details === 'string' ? testResults.details : JSON.stringify(testResults.details, null, 2)}
                </Box>
              </Box>}

          </Alert>}

      </CardContent>
      
      <CardActions sx={{
      p: 2,
      pt: 0
    }}>
        <Button variant="contained" color="primary" onClick={handleTest} disabled={disabled || loading || !tenantId || authMethod === 'oauth' && (!clientId || !clientSecret) || authMethod === 'app' && (!appId || !appSecret) || authMethod === 'certificate' && (!clientId || !certificateThumbprint || !certificatePrivateKey)} startIcon={loading ? <CircularProgress size={20} /> : <VerifiedUserIcon />}>

          {loading ? 'Testing Connection...' : 'Test Connection'}
        </Button>
        
        <Tooltip title="Information about required permissions">
          <IconButton color="info" aria-label="help" onClick={() => {
          // Open help documentation in a new tab or show info dialog
          window.open('https://docs.microsoft.com/en-us/graph/permissions-reference', '_blank');
        }}>

            <InfoOutlinedIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>;
};
SharePointCredentialManager.propTypes = {
  /**
   * The current credential configuration
   */
  credentials: PropTypes.shape({
    authMethod: PropTypes.string,
    tenantId: PropTypes.string,
    clientId: PropTypes.string,
    clientSecret: PropTypes.string,
    appId: PropTypes.string,
    appSecret: PropTypes.string,
    certificateThumbprint: PropTypes.string,
    certificatePrivateKey: PropTypes.string,
    resourceUrl: PropTypes.string
  }),
  /**
   * Callback when credentials change
   */
  onChange: PropTypes.func,
  /**
   * Callback when test button is clicked
   */
  onTest: PropTypes.func,
  /**
   * Results from testing the connection
   */
  testResults: PropTypes.shape({
    status: PropTypes.string,
    message: PropTypes.string,
    details: PropTypes.any
  }),
  /**
   * Whether the component is in a loading state
   */
  loading: PropTypes.bool,
  /**
   * Whether the component is disabled
   */
  disabled: PropTypes.bool
};
export default SharePointCredentialManager;