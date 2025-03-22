// AzureBlobConfiguration.jsx
// -----------------------------------------------------------------------------
// Configuration component for Azure Blob Storage connections

import React, { useState } from 'react';
import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const AzureBlobConfiguration = ({ 
  config, 
  onChange, 
  errors = {}, 
  readOnly = false,
  isSuperUser = false 
}) => {
  const [showSecrets, setShowSecrets] = useState(false);
  
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
  
  // Merge provided config with defaults
  const blobConfig = { ...defaultConfig, ...config };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // If auth method changes, reset related fields
    let updatedConfig = { ...blobConfig, [name]: newValue };
    
    if (name === 'authMethod') {
      updatedConfig = {
        ...updatedConfig,
        connectionString: '',
        accountName: '',
        accountKey: '',
        sasToken: ''
      };
    }
    
    onChange(updatedConfig);
  };
  
  const toggleShowSecrets = () => {
    setShowSecrets(!showSecrets);
  };
  
  // Authentication method options
  const authMethods = [
    { value: 'connectionString', label: 'Connection String' },
    { value: 'accountKey', label: 'Account Name & Key' },
    { value: 'sasToken', label: 'SAS Token' },
    { value: 'managedIdentity', label: 'Managed Identity' }
  ];
  
  // Field visibility based on selected auth method
  const showConnectionString = blobConfig.authMethod === 'connectionString';
  const showAccountKey = blobConfig.authMethod === 'accountKey';
  const showSasToken = blobConfig.authMethod === 'sasToken';
  const showManagedIdentity = blobConfig.authMethod === 'managedIdentity';
  const showAccountName = blobConfig.authMethod === 'accountKey' || 
                          blobConfig.authMethod === 'sasToken' || 
                          blobConfig.authMethod === 'managedIdentity';
  
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Azure Blob Storage Configuration
      </Typography>
      
      {isSuperUser && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <Typography variant="subtitle2">Authentication Method</Typography>
              <RadioGroup
                name="authMethod"
                value={blobConfig.authMethod}
                onChange={handleChange}
                row
                disabled={readOnly}
              >
                {authMethods.map(method => (
                  <FormControlLabel
                    key={method.value}
                    value={method.value}
                    control={<Radio />}
                    label={method.label}
                    disabled={readOnly}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>
          
          {/* Connection String */}
          {showConnectionString && (
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.connectionString}>
                <TextField
                  name="connectionString"
                  label="Connection String"
                  value={blobConfig.connectionString}
                  onChange={handleChange}
                  type={showSecrets ? 'text' : 'password'}
                  error={!!errors.connectionString}
                  helperText={errors.connectionString}
                  disabled={readOnly}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={toggleShowSecrets}
                          edge="end"
                        >
                          {showSecrets ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                        <Tooltip title="The connection string for your Azure Storage account. Format: DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net">
                          <IconButton edge="end">
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    )
                  }}
                />
              </FormControl>
            </Grid>
          )}
          
          {/* Account Name */}
          {showAccountName && (
            <Grid item xs={12} md={showAccountKey ? 6 : 12}>
              <FormControl fullWidth error={!!errors.accountName}>
                <TextField
                  name="accountName"
                  label="Storage Account Name"
                  value={blobConfig.accountName}
                  onChange={handleChange}
                  error={!!errors.accountName}
                  helperText={errors.accountName}
                  disabled={readOnly}
                />
              </FormControl>
            </Grid>
          )}
          
          {/* Account Key */}
          {showAccountKey && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.accountKey}>
                <TextField
                  name="accountKey"
                  label="Account Key"
                  value={blobConfig.accountKey}
                  onChange={handleChange}
                  type={showSecrets ? 'text' : 'password'}
                  error={!!errors.accountKey}
                  helperText={errors.accountKey}
                  disabled={readOnly}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={toggleShowSecrets}
                          edge="end"
                        >
                          {showSecrets ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </FormControl>
            </Grid>
          )}
          
          {/* SAS Token */}
          {showSasToken && (
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.sasToken}>
                <TextField
                  name="sasToken"
                  label="SAS Token"
                  value={blobConfig.sasToken}
                  onChange={handleChange}
                  type={showSecrets ? 'text' : 'password'}
                  error={!!errors.sasToken}
                  helperText={errors.sasToken || "Include the leading '?' character"}
                  disabled={readOnly}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={toggleShowSecrets}
                          edge="end"
                        >
                          {showSecrets ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                        <Tooltip title="A Shared Access Signature (SAS) token providing permissions to the storage account or container">
                          <IconButton edge="end">
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    )
                  }}
                />
              </FormControl>
            </Grid>
          )}
          
          {/* Managed Identity (no additional fields needed) */}
          {showManagedIdentity && (
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                Using Azure Managed Identity for authentication. No additional credentials required.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}
      
      {/* Container Configuration - Available to all users */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.containerName}>
            <TextField
              name="containerName"
              label="Container Name"
              value={blobConfig.containerName}
              onChange={handleChange}
              error={!!errors.containerName}
              helperText={errors.containerName}
              disabled={readOnly}
            />
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.filePattern}>
            <TextField
              name="filePattern"
              label="File Pattern"
              value={blobConfig.filePattern}
              onChange={handleChange}
              error={!!errors.filePattern}
              helperText={errors.filePattern || "Example: *.csv, employee-*.json"}
              disabled={readOnly}
            />
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <FormControl fullWidth>
            <TextField
              name="path"
              label="Path (Optional)"
              value={blobConfig.path}
              onChange={handleChange}
              helperText="Optional folder path inside the container (e.g., 'daily/employees/')"
              disabled={readOnly}
            />
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AzureBlobConfiguration;