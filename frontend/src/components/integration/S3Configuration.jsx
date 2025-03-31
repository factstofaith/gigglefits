/**
 * S3 Configuration Component
 *
 * A comprehensive component for configuring Amazon S3 as a data source.
 * Includes credential management, bucket browsing, and S3 object selection.
 * 
 * @component
 */

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
  Alert,
  Stack,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

// Icons
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  CloudDone as CloudDoneIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Storage as StorageIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';

// Components
import S3CredentialManager from './s3/S3CredentialManager';
import S3BucketBrowser from './s3/S3BucketBrowser';

// Utils
import { generateFileMetadata } from '../../utils/fileTypeUtils';

/**
 * Format file size to human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  return date.toLocaleString();
};

/**
 * S3Configuration component for configuring S3 as a data source
 * 
 * @param {Object} props - Component props
 * @returns {JSX.Element} The S3Configuration component
 */
const S3Configuration = ({ 
  onChange,
  value,
  readOnly = false,
}) => {
  // State for configuration
  const [config, setConfig] = useState({
    credentials: null,
    region: 'us-east-1',
    bucket: '',
    path: '',
    selectedObject: null,
  });

  // Browser visibility state
  const [showBrowser, setShowBrowser] = useState(false);
  
  // Loading state
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  
  // Error state
  const [error, setError] = useState(null);
  
  // Initialize config from props
  useEffect(() => {
    if (value) {
      setConfig(prevConfig => ({
        ...prevConfig,
        ...value,
      }));
    }
  }, [value]);
  
  /**
   * Handle credentials change from the credential manager
   */
  const handleCredentialsChange = useCallback((credentials) => {
    setConfig(prev => {
      const updated = {
        ...prev,
        credentials,
        region: credentials?.region || prev.region,
      };
      
      if (onChange) {
        onChange(updated);
      }
      
      return updated;
    });
    
    // Show the browser when credentials are saved
    if (credentials) {
      setShowBrowser(true);
    }
  }, [onChange]);
  
  /**
   * Handle bucket selection from the browser
   */
  const handleBucketSelect = useCallback((bucketName) => {
    setConfig(prev => {
      const updated = {
        ...prev,
        bucket: bucketName,
        path: '',
        selectedObject: null,
      };
      
      if (onChange) {
        onChange(updated);
      }
      
      return updated;
    });
  }, [onChange]);
  
  /**
   * Handle object selection from the browser
   */
  const handleObjectSelect = useCallback((objectInfo) => {
    setConfig(prev => {
      const updated = {
        ...prev,
        bucket: objectInfo.bucketName,
        path: objectInfo.key,
        selectedObject: objectInfo,
      };
      
      if (onChange) {
        onChange(updated);
      }
      
      return updated;
    });
  }, [onChange]);
  
  /**
   * Test the S3 connection
   */
  const testConnection = useCallback(async () => {
    if (!config.credentials || !config.bucket) {
      setError('Credentials and bucket are required to test connection');
      return;
    }
    
    setLoading(true);
    setError(null);
    setConnectionStatus(null);
    
    try {
      // Simulate API call for development environment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulated successful response
      const success = Math.random() > 0.2; // 80% chance of success
      
      if (success) {
        setConnectionStatus({
          success: true,
          message: 'Successfully connected to S3 bucket',
          details: {
            bucket: config.bucket,
            region: config.region,
            objectsCount: Math.floor(Math.random() * 100) + 1,
            lastAccessed: new Date().toISOString()
          }
        });
      } else {
        // Simulated error
        const errorTypes = [
          'Access Denied',
          'Bucket Not Found',
          'Network Error',
          'Configuration Error'
        ];
        const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
        
        setConnectionStatus({
          success: false,
          message: `Failed to connect to S3 bucket: ${errorType}`,
          details: {
            error: errorType,
            code: `S3Error${errorType.replace(/\s/g, '')}`
          }
        });
        
        setError(`Failed to connect to S3 bucket: ${errorType}`);
      }
    } catch (err) {
      console.error('Error testing S3 connection:', err);
      setError(err.message || 'An unexpected error occurred during connection test');
      setConnectionStatus({
        success: false,
        message: 'Connection test failed',
        details: {
          error: err.message
        }
      });
    } finally {
      setLoading(false);
    }
  }, [config.bucket, config.credentials, config.region]);
  
  // Prepare the browser config from the credentials
  const browserConfig = {
    region: config.region,
    credentials: config.credentials,
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Amazon S3 Configuration
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Configure connection to Amazon S3 for accessing and using S3 objects as data sources.
        First, set up your AWS credentials, then browse and select a bucket or specific object.
      </Alert>
      
      {/* Credentials Section */}
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="credentials-content"
          id="credentials-header"
        >
          <Typography sx={{ display: 'flex', alignItems: 'center' }}>
            <StorageIcon sx={{ mr: 1 }} />
            Step 1: Configure AWS Credentials
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <S3CredentialManager
            onCredentialsSaved={handleCredentialsChange}
            onCredentialsLoaded={handleCredentialsChange}
            readOnly={readOnly}
            showSaveControls={true}
            initialVisible={true}
          />
        </AccordionDetails>
      </Accordion>

      {/* Bucket and Object Selection */}
      <Accordion 
        expanded={showBrowser} 
        onChange={() => setShowBrowser(!showBrowser)}
        disabled={!config.credentials}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="browser-content"
          id="browser-header"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mr: 2 }}>
            <Typography sx={{ display: 'flex', alignItems: 'center' }}>
              <FileIcon sx={{ mr: 1 }} />
              Step 2: Select S3 Bucket or Object
            </Typography>
            
            {config.bucket && (
              <Chip 
                label={config.bucket}
                color="primary"
                size="small"
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBrowser(true);
                }}
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {config.credentials ? (
            <S3BucketBrowser
              config={browserConfig}
              onSelectBucket={handleBucketSelect}
              onSelectObject={handleObjectSelect}
              readOnly={readOnly}
              selectedBucket={config.bucket}
              selectedPrefix={config.path ? config.path.substring(0, config.path.lastIndexOf('/') + 1) : ''}
            />
          ) : (
            <Alert severity="warning">
              You need to configure and save AWS credentials first.
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>
      
      {/* Summary Section */}
      <Card variant="outlined" sx={{ mt: 3 }}>
        <CardHeader 
          title="Configuration Summary"
          action={
            <Button
              variant="outlined"
              color="primary"
              disabled={!config.credentials || !config.bucket || loading || readOnly}
              onClick={testConnection}
              startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
              size="small"
            >
              Test Connection
            </Button>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  AWS Region
                </Typography>
                <Typography variant="body2">
                  {config.region || 'Not configured'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  S3 Bucket
                </Typography>
                <Typography variant="body2">
                  {config.bucket || 'No bucket selected'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Object Path
                </Typography>
                <Typography variant="body2">
                  {config.path || 'No specific object selected'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Credentials Status
                </Typography>
                <Chip 
                  label={config.credentials ? "Configured" : "Not Configured"}
                  color={config.credentials ? "success" : "default"}
                  size="small"
                  icon={config.credentials ? <CheckCircleIcon /> : <InfoIcon />}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {/* Selected Object Preview */}
              {config.selectedObject && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Object
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    {/* Import the FileCard component for file preview */}
                    {(() => {
                      const FileCard = require('../common/FileCard').default;
                      
                      // Create a file-like object from the S3 object info
                      const fileObj = {
                        name: config.selectedObject.key.split('/').pop(),
                        type: config.selectedObject.contentType || '',
                        size: config.selectedObject.size || 0,
                        lastModified: config.selectedObject.lastModified || new Date().toISOString(),
                      };
                      
                      // Generate metadata
                      const metadata = generateFileMetadata(fileObj);
                      
                      return (
                        <FileCard
                          file={fileObj}
                          metadata={metadata}
                          showPreview={false}
                          variant="outlined"
                        />
                      );
                    })()}
                  </Paper>
                </Box>
              )}
              
              {/* Connection Status */}
              {connectionStatus && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Connection Test Result
                  </Typography>
                  <Alert 
                    severity={connectionStatus.success ? "success" : "error"}
                    icon={connectionStatus.success ? <CloudDoneIcon /> : <ErrorIcon />}
                  >
                    <Typography variant="body2">
                      {connectionStatus.message}
                    </Typography>
                    
                    {connectionStatus.details && connectionStatus.success && (
                      <Box sx={{ mt: 1, fontSize: '0.875rem' }}>
                        <Typography variant="body2" component="div">
                          <strong>Bucket:</strong> {connectionStatus.details.bucket}
                        </Typography>
                        <Typography variant="body2" component="div">
                          <strong>Region:</strong> {connectionStatus.details.region}
                        </Typography>
                        <Typography variant="body2" component="div">
                          <strong>Objects:</strong> {connectionStatus.details.objectsCount}
                        </Typography>
                        <Typography variant="body2" component="div">
                          <strong>Last Accessed:</strong> {formatDate(connectionStatus.details.lastAccessed)}
                        </Typography>
                      </Box>
                    )}
                  </Alert>
                </Box>
              )}
            </Grid>
          </Grid>
          
          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

S3Configuration.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.object,
  readOnly: PropTypes.bool,
};

export default S3Configuration;