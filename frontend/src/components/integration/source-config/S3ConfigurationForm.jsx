/**
 * S3 Configuration Form
 *
 * Form component for configuring Amazon S3 as a data source.
 * Provides fields for bucket, region, path, and authentication settings.
 *
 * @component
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  FormControl,
  FormControlLabel,
  Switch,
  Grid,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Divider,
} from '@mui/material';

/**
 * List of AWS regions
 */
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
 * S3 Configuration Form component
 *
 * @param {Object} props - Component props
 * @param {Object} props.formik - Formik instance
 * @returns {JSX.Element} The S3ConfigurationForm component
 */
const S3ConfigurationForm = ({ formik }) => {
  // Ensure config object exists
  const config = formik.values.config || {};
  
  // Set initial values if not present
  if (!formik.values.config) {
    formik.setFieldValue('config', {
      bucket: '',
      region: 'us-east-1',
      path: '',
      useIAMRole: false,
      accessKeyId: '',
      secretAccessKey: '',
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
   * Toggle IAM role usage
   */
  const handleToggleIAMRole = () => {
    handleConfigChange('useIAMRole', !config.useIAMRole);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Amazon S3 Configuration
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Provide details to connect to your Amazon S3 bucket. You can specify
        a specific object or prefix path within the bucket.
      </Alert>

      <Grid container spacing={3}>
        {/* Bucket Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="bucket"
            name="config.bucket"
            label="Bucket Name"
            value={config.bucket || ''}
            onChange={(e) => handleConfigChange('bucket', e.target.value)}
            error={
              formik.touched.config?.bucket && Boolean(formik.errors.config?.bucket)
            }
            helperText={
              formik.touched.config?.bucket && formik.errors.config?.bucket
            }
            placeholder="my-data-bucket"
            required
          />
        </Grid>

        {/* Region */}
        <Grid item xs={12} sm={6}>
          <FormControl 
            fullWidth
            error={
              formik.touched.config?.region && Boolean(formik.errors.config?.region)
            }
          >
            <InputLabel id="region-label">AWS Region</InputLabel>
            <Select
              labelId="region-label"
              id="region"
              name="config.region"
              value={config.region || ''}
              onChange={(e) => handleConfigChange('region', e.target.value)}
              label="AWS Region"
              required
            >
              {AWS_REGIONS.map((region) => (
                <MenuItem key={region.value} value={region.value}>
                  {region.label}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.config?.region && formik.errors.config?.region && (
              <FormHelperText>{formik.errors.config.region}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Path */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="path"
            name="config.path"
            label="Path"
            value={config.path || ''}
            onChange={(e) => handleConfigChange('path', e.target.value)}
            error={
              formik.touched.config?.path && Boolean(formik.errors.config?.path)
            }
            helperText={
              (formik.touched.config?.path && formik.errors.config?.path) ||
              "Specify a file path or prefix (e.g., 'data/customers.csv' or 'data/')"
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
                checked={config.useIAMRole || false}
                onChange={handleToggleIAMRole}
                name="useIAMRole"
              />
            }
            label="Use IAM Role (recommended for EC2/Lambda deployments)"
          />

          {!config.useIAMRole && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="accessKeyId"
                  name="config.accessKeyId"
                  label="Access Key ID"
                  value={config.accessKeyId || ''}
                  onChange={(e) => handleConfigChange('accessKeyId', e.target.value)}
                  error={
                    formik.touched.config?.accessKeyId &&
                    Boolean(formik.errors.config?.accessKeyId)
                  }
                  helperText={
                    formik.touched.config?.accessKeyId && formik.errors.config?.accessKeyId
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="secretAccessKey"
                  name="config.secretAccessKey"
                  label="Secret Access Key"
                  type="password"
                  value={config.secretAccessKey || ''}
                  onChange={(e) => handleConfigChange('secretAccessKey', e.target.value)}
                  error={
                    formik.touched.config?.secretAccessKey &&
                    Boolean(formik.errors.config?.secretAccessKey)
                  }
                  helperText={
                    formik.touched.config?.secretAccessKey &&
                    formik.errors.config?.secretAccessKey
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

S3ConfigurationForm.propTypes = {
  formik: PropTypes.object.isRequired,
};

export default S3ConfigurationForm;