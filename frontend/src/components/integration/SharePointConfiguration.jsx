/**
 * SharePoint Configuration Component
 *
 * A comprehensive component for configuring SharePoint integration using Microsoft Graph API.
 * Combines credential management and SharePoint browsing capabilities.
 *
 * @component
 */

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Divider,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Check as CheckIcon,
  CloudDone as CloudDoneIcon,
  Settings as SettingsIcon,
  Web as WebIcon,
  Article as LibraryIcon,
  Folder as FolderIcon,
  Description as FileIcon,
} from '@mui/icons-material';

// Import subcomponents
import SharePointCredentialManager from './sharepoint/SharePointCredentialManager';
import SharePointBrowser from './sharepoint/SharePointBrowser';

/**
 * SharePoint Configuration Component
 */
const SharePointConfiguration = ({
  value = {},
  onChange = () => {},
  readOnly = false,
}) => {
  // Component state
  const [credentials, setCredentials] = useState(value.credentials || {});
  const [selectedSite, setSelectedSite] = useState(value.site || null);
  const [selectedLibrary, setSelectedLibrary] = useState(value.library || null);
  const [selectedFolder, setSelectedFolder] = useState(value.folder || null);
  const [selectedFile, setSelectedFile] = useState(value.file || null);
  
  // UI state
  const [activeTab, setActiveTab] = useState(0);
  const [testResults, setTestResults] = useState(null);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  /**
   * Handle credentials change
   */
  const handleCredentialsChange = useCallback((newCredentials) => {
    setCredentials(newCredentials);
    
    onChange({
      ...value,
      credentials: newCredentials,
      site: selectedSite,
      library: selectedLibrary,
      folder: selectedFolder,
      file: selectedFile,
    });
  }, [onChange, selectedFile, selectedFolder, selectedLibrary, selectedSite, value]);
  
  /**
   * Test credentials using Microsoft Graph API
   */
  const testCredentials = useCallback(async () => {
    setTesting(true);
    setTestResults(null);
    setError(null);
    
    try {
      console.log('Testing SharePoint credentials:', credentials);
      
      // In a real production environment, we would use a backend API endpoint
      // that securely handles Microsoft Graph API authentication and requests.
      // The frontend would just call an API like `/api/sharepoint/test-credentials`
      
      // This simulates what our backend API would do with the Microsoft Graph API:
      const testCredentialsWithGraphAPI = async (creds) => {
        // Step 1: Get access token for the tenant
        const getAccessToken = async () => {
          // In production: This would be a secure API call that gets a token
          // The token acquisition would happen server-side for security
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              // Validate credentials based on the auth method
              if (creds.authMethod === 'oauth') {
                if (!creds.tenantId || !creds.clientId || !creds.clientSecret) {
                  reject(new Error('Missing required OAuth credentials'));
                  return;
                }
                
                // Simulate successful OAuth token acquisition
                resolve({
                  access_token: `mock_${creds.clientId}_token`,
                  token_type: 'Bearer',
                  expires_in: 3600,
                  ext_expires_in: 3600,
                  scope: 'Sites.Read.All'
                });
              } 
              else if (creds.authMethod === 'app') {
                if (!creds.tenantId || !creds.appId || !creds.appSecret) {
                  reject(new Error('Missing required App credentials'));
                  return;
                }
                
                // Simulate successful app-only token acquisition
                resolve({
                  access_token: `mock_${creds.appId}_token`,
                  token_type: 'Bearer',
                  expires_in: 3600,
                  ext_expires_in: 3600
                });
              } 
              else if (creds.authMethod === 'certificate') {
                if (!creds.tenantId || !creds.clientId || !creds.certificateThumbprint || !creds.certificatePrivateKey) {
                  reject(new Error('Missing required certificate credentials'));
                  return;
                }
                
                // Simulate successful certificate-based token acquisition
                resolve({
                  access_token: `mock_${creds.clientId}_cert_token`,
                  token_type: 'Bearer',
                  expires_in: 3600,
                  ext_expires_in: 3600
                });
              }
              else {
                reject(new Error('Invalid authentication method'));
              }
            }, 600);
          });
        };
        
        // Step 2: Make a test API call to Microsoft Graph with the token
        const testGraphAPI = async (token) => {
          // In production: This would be a real fetch call to Microsoft Graph API
          // GET /sites?search=* or GET /me/followedSites
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              // Simulate a successful Graph API response with data
              resolve({
                // This follows the Microsoft Graph API response format
                value: [
                  {
                    id: "sample-site-1",
                    displayName: "Test Connection Site",
                    webUrl: `https://${creds.tenantId.replace('.onmicrosoft.com', '')}.sharepoint.com/sites/test`,
                    siteCollection: {
                      hostname: `${creds.tenantId.replace('.onmicrosoft.com', '')}.sharepoint.com`
                    }
                  }
                ],
                // Include permission scopes we have access to
                "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#sites",
              });
            }, 500);
          });
        };
        
        // Step 3: Execute full test sequence
        // a) Get token
        const tokenResponse = await getAccessToken();
        
        // b) Test token with Graph API call
        const graphResponse = await testGraphAPI(tokenResponse.access_token);
        
        // c) Return full test results
        return {
          status: 'success',
          message: `Successfully connected to SharePoint using ${creds.authMethod === 'oauth' ? 'OAuth' : creds.authMethod === 'app' ? 'App-only authentication' : 'certificate-based authentication'}`,
          details: {
            tenant: creds.tenantId,
            ...(creds.authMethod === 'oauth' ? {
              clientId: creds.clientId,
              scope: 'Sites.Read.All',
            } : creds.authMethod === 'app' ? {
              appId: creds.appId,
            } : {
              clientId: creds.clientId,
              thumbprint: creds.certificateThumbprint,
            }),
            resource: creds.resourceUrl || 'https://graph.microsoft.com',
            // Include token expiration and scope information
            token: {
              type: tokenResponse.token_type,
              expires_in: tokenResponse.expires_in,
              scopes: tokenResponse.scope?.split(' ') || ['Sites.Read.All'],
            },
            // Include sample API response
            apiTest: {
              endpoint: '/sites',
              sitesFound: graphResponse.value.length,
              firstSite: graphResponse.value[0]?.displayName || 'No sites found'
            }
          }
        };
      };
      
      // Execute the test
      try {
        const result = await testCredentialsWithGraphAPI(credentials);
        setTestResults(result);
      } catch (testError) {
        setTestResults({
          status: 'error',
          message: testError.message || 'Failed to authenticate with Microsoft Graph API',
          details: {
            error: testError.message,
            credentials: {
              authMethod: credentials.authMethod,
              tenantId: credentials.tenantId,
              // Don't include secrets in error reports
              hasClientId: !!credentials.clientId,
              hasClientSecret: !!credentials.clientSecret,
              hasAppId: !!credentials.appId,
              hasAppSecret: !!credentials.appSecret,
              hasCertThumbprint: !!credentials.certificateThumbprint,
            }
          }
        });
      }
    } catch (err) {
      console.error('Error testing credentials:', err);
      setError(err.message || 'An error occurred while testing credentials');
      setTestResults({ status: 'error', message: err.message || 'Unknown error' });
    } finally {
      setTesting(false);
    }
  }, [credentials]);
  
  /**
   * Handle site selection
   */
  const handleSiteSelect = useCallback((site) => {
    setSelectedSite(site);
    setSelectedLibrary(null);
    setSelectedFolder(null);
    setSelectedFile(null);
    
    onChange({
      ...value,
      credentials,
      site,
      library: null,
      folder: null,
      file: null,
    });
  }, [credentials, onChange, value]);
  
  /**
   * Handle library selection
   */
  const handleLibrarySelect = useCallback((library) => {
    setSelectedLibrary(library);
    setSelectedFolder(null);
    setSelectedFile(null);
    
    onChange({
      ...value,
      credentials,
      site: selectedSite,
      library,
      folder: null,
      file: null,
    });
  }, [credentials, onChange, selectedSite, value]);
  
  /**
   * Handle folder selection
   */
  const handleFolderSelect = useCallback((folder) => {
    setSelectedFolder(folder);
    setSelectedFile(null);
    
    onChange({
      ...value,
      credentials,
      site: selectedSite,
      library: selectedLibrary,
      folder,
      file: null,
    });
  }, [credentials, onChange, selectedLibrary, selectedSite, value]);
  
  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
    
    onChange({
      ...value,
      credentials,
      site: selectedSite,
      library: selectedLibrary,
      folder: selectedFolder,
      file,
    });
  }, [credentials, onChange, selectedFolder, selectedLibrary, selectedSite, value]);
  
  // Determine if we have valid credentials for browser
  const hasValidCredentials = Boolean(
    credentials && credentials.tenantId && (
      (credentials.authMethod === 'oauth' && credentials.clientId && credentials.clientSecret) ||
      (credentials.authMethod === 'app' && credentials.appId && credentials.appSecret) ||
      (credentials.authMethod === 'certificate' && credentials.clientId && credentials.certificateThumbprint)
    )
  );
  
  // Check if a site is selected
  const hasSiteSelected = Boolean(selectedSite);
  
  // Check if a library is selected
  const hasLibrarySelected = Boolean(selectedLibrary);
  
  // Check if a folder is selected
  const hasFolderSelected = Boolean(selectedFolder);
  
  // Check if a file is selected
  const hasFileSelected = Boolean(selectedFile);
  
  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <WebIcon sx={{ mr: 1 }} /> 
          SharePoint Configuration
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Configure SharePoint integration using Microsoft Graph API for accessing sites, document libraries, and files.
        </Typography>
        
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label="Credentials" />
          <Tab 
            label="Browse" 
            disabled={!hasValidCredentials || readOnly}
          />
          <Tab 
            label="Selection" 
            disabled={!hasFileSelected && !hasFolderSelected && !hasLibrarySelected && !hasSiteSelected}
          />
        </Tabs>
        
        {/* Credentials Tab */}
        <Box sx={{ display: activeTab === 0 ? 'block' : 'none', mt: 2 }}>
          <SharePointCredentialManager
            credentials={credentials}
            onChange={handleCredentialsChange}
            onTest={testCredentials}
            testResults={testResults}
            loading={testing}
            disabled={readOnly}
          />
          
          <Button
            sx={{ mt: 2 }}
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
          </Button>
          
          <Collapse in={showAdvanced}>
            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>Advanced Configuration</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Alert severity="info">
                    <AlertTitle>Microsoft Graph API Usage</AlertTitle>
                    This component uses the Microsoft Graph API instead of the legacy SharePoint REST API, 
                    providing better performance, more capabilities, and improved security. 
                    Make sure your app registration has the appropriate permissions.
                  </Alert>
                </Grid>
                
                {/* Additional advanced options would go here */}
              </Grid>
            </Paper>
          </Collapse>
        </Box>
        
        {/* Browse Tab */}
        <Box sx={{ display: activeTab === 1 ? 'block' : 'none', mt: 2 }}>
          {hasValidCredentials ? (
            <Box sx={{ height: 500 }}>
              <SharePointBrowser
                credentials={credentials}
                onSelectSite={handleSiteSelect}
                onSelectLibrary={handleLibrarySelect}
                onSelectFolder={handleFolderSelect}
                onSelectFile={handleFileSelect}
                readOnly={readOnly}
                selectedSite={selectedSite?.id || ''}
                selectedLibrary={selectedLibrary?.id || ''}
                selectedFolder={selectedFolder?.id || ''}
              />
            </Box>
          ) : (
            <Alert severity="warning">
              <AlertTitle>Credentials Required</AlertTitle>
              Please configure valid SharePoint credentials in the Credentials tab before browsing.
            </Alert>
          )}
        </Box>
        
        {/* Selection Tab */}
        <Box sx={{ display: activeTab === 2 ? 'block' : 'none', mt: 2 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Selected Items</Typography>
            
            <Grid container spacing={2}>
              {selectedSite && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WebIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body1" fontWeight="medium">
                        Site: {selectedSite.name}
                      </Typography>
                    </Box>
                    {selectedSite.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {selectedSite.description}
                      </Typography>
                    )}
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      URL: {selectedSite.webUrl || selectedSite.url}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              
              {selectedLibrary && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LibraryIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body1" fontWeight="medium">
                        Library: {selectedLibrary.name}
                      </Typography>
                    </Box>
                    {selectedLibrary.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {selectedLibrary.description}
                      </Typography>
                    )}
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Items: {selectedLibrary.itemCount || 0}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              
              {selectedFolder && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FolderIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body1" fontWeight="medium">
                        Folder: {selectedFolder.name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Path: {selectedFolder.webUrl}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              
              {selectedFile && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FileIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body1" fontWeight="medium">
                        File: {selectedFile.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Type: {selectedFile.contentType || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Size: {formatFileSize(selectedFile.size || 0)}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      URL: {selectedFile.webUrl}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              
              {!selectedSite && !selectedLibrary && !selectedFolder && !selectedFile && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    No items selected. Please browse and select SharePoint items.
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                setSelectedSite(null);
                setSelectedLibrary(null);
                setSelectedFolder(null);
                setSelectedFile(null);
                
                onChange({
                  ...value,
                  credentials,
                  site: null,
                  library: null,
                  folder: null,
                  file: null,
                });
              }}
              sx={{ mr: 1 }}
            >
              Clear Selection
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<CloudDoneIcon />}
              disabled={!hasValidCredentials || (!hasFileSelected && !hasFolderSelected && !hasLibrarySelected && !hasSiteSelected)}
              onClick={() => {
                // In a real application, this might save the configuration or proceed to the next step
                console.log('SharePoint configuration completed:', {
                  credentials,
                  site: selectedSite,
                  library: selectedLibrary,
                  folder: selectedFolder,
                  file: selectedFile,
                });
              }}
            >
              Confirm Selection
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * Format file size to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

SharePointConfiguration.propTypes = {
  /**
   * The configuration value
   */
  value: PropTypes.shape({
    credentials: PropTypes.object,
    site: PropTypes.object,
    library: PropTypes.object,
    folder: PropTypes.object,
    file: PropTypes.object,
  }),
  
  /**
   * Callback when configuration changes
   */
  onChange: PropTypes.func,
  
  /**
   * Whether the component is in read-only mode
   */
  readOnly: PropTypes.bool,
};

export default SharePointConfiguration;