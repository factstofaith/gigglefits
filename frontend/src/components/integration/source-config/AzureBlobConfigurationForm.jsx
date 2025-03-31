/**
 * Azure Blob Configuration Form
 *
 * Form component for configuring Azure Blob Storage as a data source.
 * Provides fields for storage account, container, blob path, and authentication settings.
 *
 * @component
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  FormControl,
  FormControlLabel,
  Switch,
  Grid,
  Typography,
  FormHelperText,
  Alert,
  Divider,
} from '@mui/material';

/**
 * Azure Blob Configuration Form component
 *
 * @param {Object} props - Component props
 * @param {Object} props.formik - Formik instance
 * @returns {JSX.Element} The AzureBlobConfigurationForm component
 */
const AzureBlobConfigurationForm = ({ formik }) => {
  // Ensure config object exists
  const config = formik.values.config || {};
  
  // Set initial values if not present
  if (!formik.values.config) {
    formik.setFieldValue('config', {
      storageAccount: '',
      containerName: '',
      blobPath: '',
      useManagedIdentity: false,
      connectionString: '',
    });
  }

  /**
   * Handle config field changes
   * @param {string} field - Field name
   * @param {any} value - New value
   */
  const handleConfigChange = (field, value) => {
    formik.setFieldValue(`config.${field}`, value);
  };

  /**
   * Toggle managed identity usage
   */
  const handleToggleManagedIdentity = () => {
    handleConfigChange('useManagedIdentity', !config.useManagedIdentity);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Azure Blob Storage Configuration
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Provide details to connect to your Azure Blob Storage. You can specify
        a specific blob or prefix path within the container.
      </Alert>

      <Grid container spacing={3}>
        {/* Storage Account */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="storageAccount"
            name="config.storageAccount"
            label="Storage Account"
            value={config.storageAccount || ''}
            onChange={(e) => handleConfigChange('storageAccount', e.target.value)}
            error={
              formik.touched.config?.storageAccount && Boolean(formik.errors.config?.storageAccount)
            }
            helperText={
              formik.touched.config?.storageAccount && formik.errors.config?.storageAccount
            }
            placeholder="mystorageaccount"
            required
          />
        </Grid>

        {/* Container Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="containerName"
            name="config.containerName"
            label="Container Name"
            value={config.containerName || ''}
            onChange={(e) => handleConfigChange('containerName', e.target.value)}
            error={
              formik.touched.config?.containerName && Boolean(formik.errors.config?.containerName)
            }
            helperText={
              formik.touched.config?.containerName && formik.errors.config?.containerName
            }
            placeholder="mycontainer"
            required
          />
        </Grid>

        {/* Blob Path */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="blobPath"
            name="config.blobPath"
            label="Blob Path"
            value={config.blobPath || ''}
            onChange={(e) => handleConfigChange('blobPath', e.target.value)}
            error={
              formik.touched.config?.blobPath && Boolean(formik.errors.config?.blobPath)
            }
            helperText={
              (formik.touched.config?.blobPath && formik.errors.config?.blobPath) ||
              "Specify a blob path or prefix (e.g., 'data/customers.csv' or 'data/')"
            }
            placeholder="data/customers.csv"
            required
          />
        </Grid>

        {/* Authentication */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Authentication
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <FormControlLabel
            control={
              <Switch
                checked={config.useManagedIdentity || false}
                onChange={handleToggleManagedIdentity}
                name="useManagedIdentity"
              />
            }
            label="Use Managed Identity (recommended for Azure deployments)"
          />

          {!config.useManagedIdentity && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="connectionString"
                  name="config.connectionString"
                  label="Connection String"
                  type="password"
                  value={config.connectionString || ''}
                  onChange={(e) => handleConfigChange('connectionString', e.target.value)}
                  error={
                    formik.touched.config?.connectionString &&
                    Boolean(formik.errors.config?.connectionString)
                  }
                  helperText={
                    (formik.touched.config?.connectionString && formik.errors.config?.connectionString) ||
                    "Connection string from the Azure Portal"
                  }
                  required
                />
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

AzureBlobConfigurationForm.propTypes = {
  formik: PropTypes.object.isRequired,
};

export default AzureBlobConfigurationForm;