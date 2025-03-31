// AzureBlobConfiguration.jsx
// -----------------------------------------------------------------------------
// Configuration component for Azure Blob Storage connections

import React, { useState } from 'react';
import {MuiBox as MuiBox, Typography, Grid, Card, TextField, Radio, RadioGroup} from '../../design-system';
import InfoIcon from '@mui/icons-material/Info';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import MuiBox from '@mui/material/Box';

const AzureBlobConfiguration = ({
  config,
  onChange,
  errors = {},
  readOnly = false,
  isSuperUser = false,
}) => {
  // Added display name
  AzureBlobConfiguration.displayName = 'AzureBlobConfiguration';

  // Added display name
  AzureBlobConfiguration.displayName = 'AzureBlobConfiguration';

  // Added display name
  AzureBlobConfiguration.displayName = 'AzureBlobConfiguration';


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
    createContainerIfNotExists: false,
  };

  // Merge provided config with defaults
  const blobConfig = { ...defaultConfig, ...config };

  const handleChange = e => {
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
        sasToken: '',
      };
    }

    onChange(updatedConfig);
  };

  const toggleShowSecrets = () => {
  // Added display name
  toggleShowSecrets.displayName = 'toggleShowSecrets';

  // Added display name
  toggleShowSecrets.displayName = 'toggleShowSecrets';

  // Added display name
  toggleShowSecrets.displayName = 'toggleShowSecrets';


    setShowSecrets(!showSecrets);
  };

  // Authentication method options
  const authMethods = [
    { value: 'connectionString', label: 'Connection String' },
    { value: 'accountKey', label: 'Account Name & Key' },
    { value: 'sasToken', label: 'SAS Token' },
    { value: 'managedIdentity', label: 'Managed Identity' },
  ];

  // Field visibility based on selected auth method
  const showConnectionString = blobConfig.authMethod === 'connectionString';
  const showAccountKey = blobConfig.authMethod === 'accountKey';
  const showSasToken = blobConfig.authMethod === 'sasToken';
  const showManagedIdentity = blobConfig.authMethod === 'managedIdentity';
  const showAccountName =
    blobConfig.authMethod === 'accountKey' ||
    blobConfig.authMethod === 'sasToken' ||
    blobConfig.authMethod === 'managedIdentity';

  return (
    <Card style={{ marginTop: '16px', padding: '24px' }}>
      <Typography variant="subtitle1" style={{ marginBottom: '16px' }}>
        Azure Blob Storage Configuration
      </Typography>

      {isSuperUser && (
        <Grid.Container spacing="md">
          <Grid.Item xs={12}>
            <MuiBox style={{ marginBottom: '16px' }}>
              <Typography variant="subtitle2" style={{ marginBottom: '8px' }}>
                Authentication Method
              </Typography>
              <RadioGroup
                name="authMethod"
                value={blobConfig.authMethod}
                onChange={handleChange}
                layout="horizontal"
                disabled={readOnly}
              >
                {authMethods.map(method => (
                  <Radio
                    key={method.value}
                    value={method.value}
                    label={method.label}
                    disabled={readOnly}
                  />
                ))}
              </RadioGroup>
            </MuiBox>
          </Grid.Item>

          {/* Connection String */}
          {showConnectionString && (
            <Grid.Item xs={12}>
              <MuiBox style={{ marginBottom: '16px' }}>
                <Typography variant="body2" style={{ marginBottom: '4px', fontWeight: 'medium' }}>
                  Connection String
                </Typography>
                <MuiBox style={{ position: 'relative' }}>
                  <TextField
                    name="connectionString"
                    value={blobConfig.connectionString}
                    onChange={handleChange}
                    type={showSecrets ? 'text' : 'password'}
                    error={!!errors.connectionString}
                    disabled={readOnly}
                    fullWidth
                  />
                  <MuiBox 
                    style={{ 
                      position: 'absolute', 
                      right: '8px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <MuiBox
                      as="button"
                      onClick={toggleShowSecrets}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        border: 'none',
                        padding: '4px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '4px'
                      }}
                    >
                      {showSecrets ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </MuiBox>
                    <MuiBox
                      as="button"
                      title="The connection string for your Azure Storage account. Format: DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        border: 'none',
                        padding: '4px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <InfoIcon />
                    </MuiBox>
                  </MuiBox>
                </MuiBox>
                {errors.connectionString && (
                  <Typography variant="caption" style={{ color: '#d32f2f', marginTop: '4px' }}>
                    {errors.connectionString}
                  </Typography>
                )}
              </MuiBox>
            </Grid.Item>
          )}

          {/* Account Name */}
          {showAccountName && (
            <Grid.Item xs={12} md={showAccountKey ? 6 : 12}>
              <MuiBox style={{ marginBottom: '16px' }}>
                <Typography variant="body2" style={{ marginBottom: '4px', fontWeight: 'medium' }}>
                  Storage Account Name
                </Typography>
                <TextField
                  name="accountName"
                  value={blobConfig.accountName}
                  onChange={handleChange}
                  error={!!errors.accountName}
                  disabled={readOnly}
                  fullWidth
                />
                {errors.accountName && (
                  <Typography variant="caption" style={{ color: '#d32f2f', marginTop: '4px' }}>
                    {errors.accountName}
                  </Typography>
                )}
              </MuiBox>
            </Grid.Item>
          )}

          {/* Account Key */}
          {showAccountKey && (
            <Grid.Item xs={12} md={6}>
              <MuiBox style={{ marginBottom: '16px' }}>
                <Typography variant="body2" style={{ marginBottom: '4px', fontWeight: 'medium' }}>
                  Account Key
                </Typography>
                <MuiBox style={{ position: 'relative' }}>
                  <TextField
                    name="accountKey"
                    value={blobConfig.accountKey}
                    onChange={handleChange}
                    type={showSecrets ? 'text' : 'password'}
                    error={!!errors.accountKey}
                    disabled={readOnly}
                    fullWidth
                  />
                  <MuiBox 
                    style={{ 
                      position: 'absolute', 
                      right: '8px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <MuiBox
                      as="button"
                      onClick={toggleShowSecrets}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        border: 'none',
                        padding: '4px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {showSecrets ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </MuiBox>
                  </MuiBox>
                </MuiBox>
                {errors.accountKey && (
                  <Typography variant="caption" style={{ color: '#d32f2f', marginTop: '4px' }}>
                    {errors.accountKey}
                  </Typography>
                )}
              </MuiBox>
            </Grid.Item>
          )}

          {/* SAS Token */}
          {showSasToken && (
            <Grid.Item xs={12}>
              <MuiBox style={{ marginBottom: '16px' }}>
                <Typography variant="body2" style={{ marginBottom: '4px', fontWeight: 'medium' }}>
                  SAS Token
                </Typography>
                <MuiBox style={{ position: 'relative' }}>
                  <TextField
                    name="sasToken"
                    value={blobConfig.sasToken}
                    onChange={handleChange}
                    type={showSecrets ? 'text' : 'password'}
                    error={!!errors.sasToken}
                    disabled={readOnly}
                    fullWidth
                  />
                  <MuiBox 
                    style={{ 
                      position: 'absolute', 
                      right: '8px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <MuiBox
                      as="button"
                      onClick={toggleShowSecrets}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        border: 'none',
                        padding: '4px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '4px'
                      }}
                    >
                      {showSecrets ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </MuiBox>
                    <MuiBox
                      as="button"
                      title="A Shared Access Signature (SAS) token providing permissions to the storage account or container"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        border: 'none',
                        padding: '4px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <InfoIcon />
                    </MuiBox>
                  </MuiBox>
                </MuiBox>
                <Typography variant="caption" style={{ color: errors.sasToken ? '#d32f2f' : '#666666', marginTop: '4px' }}>
                  {errors.sasToken || "Include the leading '?' character"}
                </Typography>
              </MuiBox>
            </Grid.Item>
          )}

          {/* Managed Identity (no additional fields needed) */}
          {showManagedIdentity && (
            <Grid.Item xs={12}>
              <Typography variant="body2" style={{ color: '#666666', marginBottom: '16px' }}>
                Using Azure Managed Identity for authentication. No additional credentials required.
              </Typography>
            </Grid.Item>
          )}
        </Grid.Container>
      )}

      {/* Container Configuration - Available to all users */}
      <Grid.Container spacing="md" style={{ marginTop: '8px' }}>
        <Grid.Item xs={12} md={6}>
          <MuiBox style={{ marginBottom: '16px' }}>
            <Typography variant="body2" style={{ marginBottom: '4px', fontWeight: 'medium' }}>
              Container Name
            </Typography>
            <TextField
              name="containerName"
              value={blobConfig.containerName}
              onChange={handleChange}
              error={!!errors.containerName}
              disabled={readOnly}
              fullWidth
            />
            {errors.containerName && (
              <Typography variant="caption" style={{ color: '#d32f2f', marginTop: '4px' }}>
                {errors.containerName}
              </Typography>
            )}
          </MuiBox>
        </Grid.Item>

        <Grid.Item xs={12} md={6}>
          <MuiBox style={{ marginBottom: '16px' }}>
            <Typography variant="body2" style={{ marginBottom: '4px', fontWeight: 'medium' }}>
              File Pattern
            </Typography>
            <TextField
              name="filePattern"
              value={blobConfig.filePattern}
              onChange={handleChange}
              error={!!errors.filePattern}
              disabled={readOnly}
              fullWidth
            />
            <Typography variant="caption" style={{ color: errors.filePattern ? '#d32f2f' : '#666666', marginTop: '4px' }}>
              {errors.filePattern || 'Example: *.csv, employee-*.json'}
            </Typography>
          </MuiBox>
        </Grid.Item>

        <Grid.Item xs={12}>
          <MuiBox style={{ marginBottom: '16px' }}>
            <Typography variant="body2" style={{ marginBottom: '4px', fontWeight: 'medium' }}>
              Path (Optional)
            </Typography>
            <TextField
              name="path"
              value={blobConfig.path}
              onChange={handleChange}
              disabled={readOnly}
              fullWidth
            />
            <Typography variant="caption" style={{ color: '#666666', marginTop: '4px' }}>
              Optional folder path inside the container (e.g., 'daily/employees/')
            </Typography>
          </MuiBox>
        </Grid.Item>
      </Grid.Container>
    </Card>
  );
};

export default AzureBlobConfiguration;
