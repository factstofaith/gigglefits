/**
 * Local File Configuration Form
 *
 * Form component for configuring local file uploads as a data source.
 * Provides fields for file upload and path.
 *
 * @component
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, Grid, Typography, Button, Alert, Paper, IconButton, LinearProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';

/**
 * Local File Configuration Form component
 *
 * @param {Object} props - Component props
 * @param {Object} props.formik - Formik instance
 * @returns {JSX.Element} The LocalFileConfigurationForm component
 */
import { withErrorBoundary } from "@/error-handling/withErrorBoundary";
const LocalFileConfigurationForm = ({
  formik
}) => {
  // Simulate file upload functionality
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Ensure config object exists
  const config = formik.values.config || {};

  // Set initial values if not present
  if (!formik.values.config) {
    formik.setFieldValue('config', {
      filePath: '',
      originalFileName: '',
      fileSize: 0,
      fileType: ''
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
   * Handle file selection
   * @param {Event} event - Change event
   */
  const handleFileChange = event => {
    const file = event.target.files[0];
    if (file) {
      // Start mock upload
      setIsUploading(true);
      setUploadProgress(0);
      setUploadedFile(file);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prevProgress => {
          const newProgress = prevProgress + 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            setIsUploading(false);

            // Update form values with file info
            handleConfigChange('filePath', `/uploads/${file.name}`);
            handleConfigChange('originalFileName', file.name);
            handleConfigChange('fileSize', file.size);
            handleConfigChange('fileType', file.type);
            return 100;
          }
          return newProgress;
        });
      }, 300);
    }
  };

  /**
   * Clear uploaded file
   */
  const handleClearFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    handleConfigChange('filePath', '');
    handleConfigChange('originalFileName', '');
    handleConfigChange('fileSize', 0);
    handleConfigChange('fileType', '');
  };

  /**
   * Format file size for display
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size
   */
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  return <Box>
      <Typography variant="h6" gutterBottom>
        Local File Upload
      </Typography>
      
      <Alert severity="info" sx={{
      mb: 3
    }}>
        Upload a local file to use as a data source. Supported file types include CSV, JSON, XML, Excel, and more.
      </Alert>

      <Grid container spacing={3}>
        {/* File Upload */}
        <Grid item xs={12}>
          {!uploadedFile ? <Paper variant="outlined" sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed #ccc',
          cursor: 'pointer',
          height: 200
        }} component="label">

              <input type="file" hidden onChange={handleFileChange} accept=".csv,.json,.xml,.xls,.xlsx,.parquet,.avro,.txt" />

              <CloudUploadIcon color="primary" sx={{
            fontSize: 48,
            mb: 2
          }} />
              <Typography variant="h6" color="primary">
                Click to upload or drag and drop
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{
            mt: 1
          }}>
                CSV, JSON, XML, Excel, Parquet, Avro, Text files
              </Typography>
            </Paper> : <Paper variant="outlined" sx={{
          p: 3
        }}>
              <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}>
                <Box sx={{
              display: 'flex',
              alignItems: 'center'
            }}>
                  <DescriptionIcon color="primary" sx={{
                mr: 2
              }} />
                  <Box>
                    <Typography variant="subtitle1">{uploadedFile.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatFileSize(uploadedFile.size)} • {uploadedFile.type || 'Unknown type'}
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={handleClearFile} color="error" disabled={isUploading}>
                  <DeleteIcon />
                </IconButton>
              </Box>
              
              {isUploading && <Box sx={{
            width: '100%',
            mt: 1
          }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="body2" color="text.secondary" align="center" sx={{
              mt: 1
            }}>
                    Uploading... {uploadProgress}%
                  </Typography>
                </Box>}

            </Paper>}

        </Grid>

        {/* File Path - Read only, set by upload */}
        <Grid item xs={12}>
          <TextField fullWidth id="filePath" name="config.filePath" label="File Path" value={config.filePath || ''} onChange={e => handleConfigChange('filePath', e.target.value)} InputProps={{
          readOnly: true
        }} helperText="Path to the uploaded file (automatically set)" />

        </Grid>

        {/* Option to re-upload */}
        {uploadedFile && <Grid item xs={12}>
            <Button variant="outlined" startIcon={<CloudUploadIcon />} component="label">

              Upload a different file
              <input type="file" hidden onChange={handleFileChange} accept=".csv,.json,.xml,.xls,.xlsx,.parquet,.avro,.txt" />

            </Button>
          </Grid>}

      </Grid>
    </Box>;
};
LocalFileConfigurationForm.propTypes = {
  formik: PropTypes.object.isRequired
};
export default LocalFileConfigurationForm;