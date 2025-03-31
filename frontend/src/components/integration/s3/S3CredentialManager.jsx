/**
 * S3CredentialManager.jsx
 * 
 * A component for securely managing AWS S3 credentials. It provides an
 * interface for entering, testing, and securely storing S3 credentials.
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  Alert,
  AlertTitle,
  Collapse,
  Chip,
  InputLabel,
} from '@mui/material';

// Icons
import {
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  LockOutlined as LockIcon,
  LockOpen as UnlockIcon,
  Refresh as RefreshIcon,
  Key as KeyIcon,
} from '@mui/icons-material';

// Services
import { credentialService } from '../../../services/credentialService';

// AWS Regions
const AWS_REGIONS = [
  { value: 'us-east-1', label: 'US East (N. Virginia)' },
  { value: 'us-east-2', label: 'US East (Ohio)' },
  { value: 'us-west-1', label: 'US West (N. California)' },
  { value: 'us-west-2', label: 'US West (Oregon)' },
  { value: 'af-south-1', label: 'Africa (Cape Town)' },
  { value: 'ap-east-1', label: 'Asia Pacific (Hong Kong)' },
  { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
  { value: 'ap-northeast-2', label: 'Asia Pacific (Seoul)' },
  { value: 'ap-northeast-3', label: 'Asia Pacific (Osaka)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
  { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
  { value: 'ca-central-1', label: 'Canada (Central)' },
  { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
  { value: 'eu-west-1', label: 'Europe (Ireland)' },
  { value: 'eu-west-2', label: 'Europe (London)' },
  { value: 'eu-west-3', label: 'Europe (Paris)' },
  { value: 'eu-north-1', label: 'Europe (Stockholm)' },
  { value: 'eu-south-1', label: 'Europe (Milan)' },
  { value: 'me-south-1', label: 'Middle East (Bahrain)' },
  { value: 'sa-east-1', label: 'South America (São Paulo)' },
];

/**
 * S3CredentialManager component for securely managing AWS S3 credentials
 */
const S3CredentialManager = ({ 
  onCredentialsSaved,
  onCredentialsLoaded,
  readOnly = false,
  showSaveControls = true,
  initialVisible = false,
}) => {
  // Credential state
  const [credentials, setCredentials] = useState({
    authMethod: 'accessKey',
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
    profile: '',
    useIAMRole: false,
    assumeRoleArn: '',
    externalId: '',
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
        const hasCredsResult = await credentialService.hasCredentials('s3');
        setHasStoredCredentials(hasCredsResult);
        
        // If credentials exist and component is expanded, load them
        if (hasCredsResult && expanded) {
          const result = await credentialService.getCredentials('s3', true);
          
          if (result.success && result.data) {
            // Determine the auth method from the credentials
            let authMethod = 'accessKey';
            if (result.data.access_key_id && result.data.secret_access_key) {
              authMethod = 'accessKey';
            } else if (result.data.profile) {
              authMethod = 'profile';
            } else {
              authMethod = 'iamRole';
            }
            
            const newCredentials = {
              authMethod,
              accessKeyId: result.data.access_key_id || '',
              secretAccessKey: result.data.secret_access_key || '',
              region: result.data.region || 'us-east-1',
              profile: result.data.profile || '',
              useIAMRole: authMethod === 'iamRole',
              assumeRoleArn: result.data.assume_role_arn || '',
              externalId: result.data.external_id || '',
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
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // Update credentials state
    setCredentials(prev => {
      // If changing auth method, reset related fields
      if (name === 'authMethod') {
        const updated = { 
          ...prev, 
          [name]: newValue,
          // Reset all credential fields
          accessKeyId: '',
          secretAccessKey: '',
          profile: '',
          assumeRoleArn: '',
          externalId: '',
          // Keep region for all methods
        };
        
        // Set IAM role flag
        if (newValue === 'iamRole') {
          updated.useIAMRole = true;
        } else {
          updated.useIAMRole = false;
        }
        
        return updated;
      }
      
      return { ...prev, [name]: newValue };
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
        access_key_id: credentials.authMethod === 'accessKey' ? credentials.accessKeyId : '',
        secret_access_key: credentials.authMethod === 'accessKey' ? credentials.secretAccessKey : '',
        region: credentials.region,
        profile: credentials.authMethod === 'profile' ? credentials.profile : '',
        use_iam_role: credentials.authMethod === 'iamRole',
        assume_role_arn: credentials.assumeRoleArn,
        external_id: credentials.externalId,
      };
      
      // Store credentials
      const result = await credentialService.storeCredentials('s3', storageCredentials);
      
      if (result.success) {
        setStatus('Credentials saved successfully');
        setHasStoredCredentials(true);
        setLastUpdated(new Date().toISOString());
        
        // Notify parent component
        if (onCredentialsSaved) {
          onCredentialsSaved(credentials);
        }
      } else {
        setError(result.message || 'Failed to save credentials');
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
      const result = await credentialService.deleteCredentials('s3');
      
      if (result.success) {
        setStatus('Credentials deleted successfully');
        setHasStoredCredentials(false);
        setLastUpdated(null);
        
        // Reset form
        setCredentials({
          authMethod: 'accessKey',
          accessKeyId: '',
          secretAccessKey: '',
          region: 'us-east-1',
          profile: '',
          useIAMRole: false,
          assumeRoleArn: '',
          externalId: '',
        });
        
        // Notify parent component
        if (onCredentialsSaved) {
          onCredentialsSaved(null);
        }
      } else {
        setError(result.message || 'Failed to delete credentials');
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
   * Test credentials by connecting to S3
   */
  const testConnection = useCallback(async () => {
    setLoading(true);
    setStatus(null);
    setError(null);
    setTestResult(null);
    
    try {
      // Format credentials for testing
      const testCredentials = {
        access_key_id: credentials.authMethod === 'accessKey' ? credentials.accessKeyId : '',
        secret_access_key: credentials.authMethod === 'accessKey' ? credentials.secretAccessKey : '',
        region: credentials.region,
        profile: credentials.authMethod === 'profile' ? credentials.profile : '',
        use_iam_role: credentials.authMethod === 'iamRole',
        assume_role_arn: credentials.assumeRoleArn,
        external_id: credentials.externalId,
      };
      
      // Send test request
      const result = await credentialService.testCredentials('s3', testCredentials);
      
      setTestResult(result);
      
      if (result.success) {
        setStatus('Connection successful');
      } else {
        setError(result.message || 'Connection failed');
      }
    } catch (err) {
      console.error('Error testing credentials:', err);
      setError('An error occurred during connection test');
      setTestResult({
        success: false,
        message: 'An error occurred during connection test',
        details: {
          error: err.message,
        },
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
      case 'accessKey':
        return credentials.accessKeyId.trim() !== '' && 
               credentials.secretAccessKey.trim() !== '' &&
               credentials.region.trim() !== '';
      case 'profile':
        return credentials.profile.trim() !== '' &&
               credentials.region.trim() !== '';
      case 'iamRole':
        return credentials.region.trim() !== '';
      default:
        return false;
    }
  }, [credentials]);
  
  // Check if credentials are valid
  const isValid = validateCredentials();
  
  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (err) {
      return 'Unknown';
    }
  };
  
  // Authentication method options
  const authMethods = [
    { value: 'accessKey', label: 'Access Key' },
    { value: 'profile', label: 'AWS Profile' },
    { value: 'iamRole', label: 'IAM Role' },
  ];
  
  // Field visibility based on selected auth method
  const showAccessKey = credentials.authMethod === 'accessKey';
  const showProfile = credentials.authMethod === 'profile';
  const showAssumeRole = credentials.assumeRoleArn.trim() !== '';
  
  return (
    <Card variant="outlined">
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <KeyIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">AWS S3 Credentials</Typography>
              {hasStoredCredentials && (
                <Chip 
                  label="Credentials Stored" 
                  color="success" 
                  size="small" 
                  icon={<LockIcon />}
                  sx={{ ml: 2 }}
                />
              )}
            </Box>
            <IconButton onClick={toggleExpanded}>
              {expanded ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Box>
        }
        subheader={
          hasStoredCredentials ? (
            <Typography variant="body2" color="text.secondary">
              Last Updated: {formatDate(lastUpdated)}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No stored credentials
            </Typography>
          )
        }
      />
      
      <Collapse in={expanded}>
        <CardContent>
          {/* Authentication Method Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Authentication Method
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                row
                name="authMethod"
                value={credentials.authMethod}
                onChange={handleChange}
              >
                {authMethods.map((method) => (
                  <FormControlLabel
                    key={method.value}
                    value={method.value}
                    control={<Radio />}
                    label={method.label}
                    disabled={loading || readOnly}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
          
          <Grid container spacing={2}>
            {/* Region Selection (common to all auth methods) */}
            <Grid item xs={12} md={showAccessKey ? 6 : 12}>
              <FormControl fullWidth>
                <InputLabel id="region-label">AWS Region</InputLabel>
                <Select
                  labelId="region-label"
                  id="region"
                  name="region"
                  value={credentials.region}
                  onChange={handleChange}
                  label="AWS Region"
                  disabled={loading || readOnly}
                >
                  {AWS_REGIONS.map((region) => (
                    <MenuItem key={region.value} value={region.value}>
                      {region.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  AWS region where your S3 buckets are located
                </FormHelperText>
              </FormControl>
            </Grid>
            
            {/* Access Key Credentials */}
            {showAccessKey && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <TextField
                      name="accessKeyId"
                      label="Access Key ID"
                      value={credentials.accessKeyId}
                      onChange={handleChange}
                      disabled={loading || readOnly}
                    />
                    <FormHelperText>
                      AWS IAM Access Key ID
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <TextField
                      name="secretAccessKey"
                      label="Secret Access Key"
                      value={credentials.secretAccessKey}
                      onChange={handleChange}
                      type={showSecrets ? 'text' : 'password'}
                      disabled={loading || readOnly}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={toggleShowSecrets}
                              edge="end"
                            >
                              {showSecrets ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                            <Tooltip title="Your AWS Secret Access Key. This is sensitive information that should be kept secure.">
                              <IconButton edge="end">
                                <InfoIcon />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )
                      }}
                    />
                    <FormHelperText>
                      AWS IAM Secret Access Key
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </>
            )}
            
            {/* Profile-based authentication */}
            {showProfile && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <TextField
                    name="profile"
                    label="AWS Profile Name"
                    value={credentials.profile}
                    onChange={handleChange}
                    disabled={loading || readOnly}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Profile name from AWS credentials file (~/.aws/credentials)">
                            <IconButton edge="end">
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      )
                    }}
                  />
                  <FormHelperText>
                    Named profile from AWS credentials file (for local development)
                  </FormHelperText>
                </FormControl>
              </Grid>
            )}
            
            {/* IAM Role */}
            {credentials.authMethod === 'iamRole' && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2" color="textSecondary">
                    Using IAM Role for authentication. No additional credentials required.
                    The application will use the IAM role attached to the environment where it's running.
                  </Typography>
                </Paper>
              </Grid>
            )}
            
            {/* Advanced Options - Assume Role (optional for all auth methods) */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Divider textAlign="left">
                <Typography variant="body2" color="text.secondary">
                  Advanced Options
                </Typography>
              </Divider>
              
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    name="assumeRoleArn"
                    label="Assume Role ARN (Optional)"
                    value={credentials.assumeRoleArn}
                    onChange={handleChange}
                    disabled={loading || readOnly}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="The Amazon Resource Name (ARN) of the role to assume">
                            <IconButton edge="end">
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      )
                    }}
                  />
                  <FormHelperText>
                    ARN of an IAM role to assume (for cross-account access)
                  </FormHelperText>
                </FormControl>
                
                {showAssumeRole && (
                  <FormControl fullWidth>
                    <TextField
                      name="externalId"
                      label="External ID (Optional)"
                      value={credentials.externalId}
                      onChange={handleChange}
                      disabled={loading || readOnly}
                    />
                    <FormHelperText>
                      External ID for the assume role request (if required)
                    </FormHelperText>
                  </FormControl>
                )}
              </Box>
            </Grid>
          </Grid>
          
          {/* Status Messages */}
          {(status || error || testResult) && (
            <Box sx={{ mt: 3 }}>
              {status && !error && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {status}
                </Alert>
              )}
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              {testResult && (
                <Alert 
                  severity={testResult.success ? 'success' : 'error'} 
                  sx={{ mb: 2 }}
                >
                  <AlertTitle>
                    {testResult.success ? 'Connection Test Successful' : 'Connection Test Failed'}
                  </AlertTitle>
                  <Typography variant="body2">
                    {testResult.message}
                  </Typography>
                  
                  {testResult.details && (
                    <Box sx={{ mt: 1 }}>
                      {testResult.success ? (
                        <>
                          {testResult.details.buckets && (
                            <Typography variant="body2">
                              Found {testResult.details.buckets} bucket(s)
                            </Typography>
                          )}
                          {testResult.details.region && (
                            <Typography variant="body2">
                              Region: {testResult.details.region}
                            </Typography>
                          )}
                          {testResult.details.permissions && (
                            <Typography variant="body2">
                              Permissions: {testResult.details.permissions.join(', ')}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <>
                          {testResult.details.error && (
                            <Typography variant="body2">
                              Error: {testResult.details.error}
                            </Typography>
                          )}
                          {testResult.details.code && (
                            <Typography variant="body2">
                              Code: {testResult.details.code}
                            </Typography>
                          )}
                        </>
                      )}
                    </Box>
                  )}
                </Alert>
              )}
            </Box>
          )}
          
          {/* Action Buttons */}
          {showSaveControls && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!isValid || loading || readOnly}
                  onClick={testConnection}
                  startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                >
                  Test Connection
                </Button>
              </Box>
              
              <Box>
                {hasStoredCredentials && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={loading || readOnly}
                    startIcon={<DeleteIcon />}
                    sx={{ mr: 1 }}
                  >
                    Delete
                  </Button>
                )}
                
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!isValid || loading || readOnly}
                  onClick={saveCredentials}
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {saving ? 'Saving...' : (hasStoredCredentials ? 'Update' : 'Save')}
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Collapse>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      >
        <DialogTitle>Delete Credentials?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the stored AWS S3 credentials? This action cannot be undone.
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
    </Card>
  );
};

S3CredentialManager.propTypes = {
  onCredentialsSaved: PropTypes.func,
  onCredentialsLoaded: PropTypes.func,
  readOnly: PropTypes.bool,
  showSaveControls: PropTypes.bool,
  initialVisible: PropTypes.bool,
};

export default S3CredentialManager;