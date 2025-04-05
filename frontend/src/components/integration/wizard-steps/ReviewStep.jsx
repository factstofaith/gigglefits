import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling"; /**
                                                                                      * Review Step
                                                                                      *
                                                                                      * Final step of the dataset creation wizard that shows a summary of all
                                                                                      * configured options and allows the user to create the dataset.
                                                                                      *
                                                                                      * @component
                                                                                      */
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Paper, Divider, Grid, Chip, Alert, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import DatasetIcon from '@mui/icons-material/Dataset';
import StorageIcon from '@mui/icons-material/Storage';
import SchemaIcon from '@mui/icons-material/Schema';
import SecurityIcon from '@mui/icons-material/Security';
import { DATASET_SOURCE_TYPES, DATASET_TYPES, getDataSourceOptions, getDatasetTypeOptions } from '../dataset_wizard_utils';

/**
 * Get the source type display name
 * @param {string} sourceType - Source type ID
 * @returns {string} Display name
 */
const getSourceTypeName = sourceType => {
  const option = getDataSourceOptions().find(opt => opt.id === sourceType);
  return option ? option.name : sourceType;
};

/**
 * Get the dataset type display name
 * @param {string} datasetType - Dataset type ID
 * @returns {string} Display name
 */
const getDatasetTypeName = datasetType => {
  const option = getDatasetTypeOptions().find(opt => opt.id === datasetType);
  return option ? option.name : datasetType;
};

/**
 * Get the permission display name
 * @param {string} permission - Permission level
 * @returns {string} Display name
 */
const getPermissionName = permission => {
  switch (permission) {
    case 'read':
      return 'Read Only';
    case 'write':
      return 'Read & Write';
    case 'admin':
      return 'Admin';
    default:
      return permission;
  }
};

/**
 * Review Step component
 *
 * @param {Object} props - Component props
 * @param {Object} props.formik - Formik instance
 * @returns {JSX.Element} The ReviewStep component
 */
const ReviewStep = ({
  formik
}) => {
  const values = formik.values;
  const hasValidationErrors = Object.keys(formik.errors).length > 0;

  /**
   * Render basic information section
   * @returns {JSX.Element} The basic info section
   */
  const renderBasicInfo = () => <Paper variant="outlined" sx={{
    p: 2,
    mb: 3
  }}>
      <Typography variant="h6" gutterBottom>
        <DatasetIcon sx={{
        mr: 1,
        verticalAlign: 'middle'
      }} />
        Basic Information
      </Typography>
      <Divider sx={{
      mb: 2
    }} />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Dataset Name
          </Typography>
          <Typography variant="body1">{values.name}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Dataset Type
          </Typography>
          <Typography variant="body1">{getDatasetTypeName(values.type)}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary">
            Description
          </Typography>
          <Typography variant="body1">{values.description}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary">
            Tags
          </Typography>
          <Box sx={{
          mt: 0.5
        }}>
            {values.tags.length > 0 ? values.tags.map((tag, index) => <Chip key={index} label={tag} size="small" sx={{
            mr: 0.5,
            mb: 0.5
          }} />) : <Typography variant="body2" color="text.secondary">
                No tags specified
              </Typography>}

          </Box>
        </Grid>
      </Grid>
    </Paper>;

  /**
   * Render source configuration section
   * @returns {JSX.Element} The source config section
   */
  const renderSourceConfig = () => {
    // Different display based on source type
    const renderSourceDetails = () => {
      switch (values.sourceType) {
        case DATASET_SOURCE_TYPES.S3:
          return <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Bucket
                </Typography>
                <Typography variant="body1">
                  {values.config.bucket || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Region
                </Typography>
                <Typography variant="body1">
                  {values.config.region || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Path
                </Typography>
                <Typography variant="body1">
                  {values.config.path || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Authentication
                </Typography>
                <Typography variant="body1">
                  {values.config.useIAMRole ? 'Using IAM Role' : 'Using Access Key'}
                </Typography>
              </Grid>
            </Grid>;
        case DATASET_SOURCE_TYPES.AZURE_BLOB:
          return <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Storage Account
                </Typography>
                <Typography variant="body1">
                  {values.config.storageAccount || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Container
                </Typography>
                <Typography variant="body1">
                  {values.config.containerName || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Blob Path
                </Typography>
                <Typography variant="body1">
                  {values.config.blobPath || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Authentication
                </Typography>
                <Typography variant="body1">
                  {values.config.useManagedIdentity ? 'Using Managed Identity' : 'Using Connection String'}
                </Typography>
              </Grid>
            </Grid>;

        // Add cases for other source types as needed

        default:
          return <Typography variant="body2" color="text.secondary">
              Configuration details for {getSourceTypeName(values.sourceType)}
            </Typography>;
      }
    };
    return <Paper variant="outlined" sx={{
      p: 2,
      mb: 3
    }}>
        <Typography variant="h6" gutterBottom>
          <StorageIcon sx={{
          mr: 1,
          verticalAlign: 'middle'
        }} />
          Source Configuration
        </Typography>
        <Divider sx={{
        mb: 2
      }} />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Source Type
            </Typography>
            <Typography variant="body1">
              {getSourceTypeName(values.sourceType)}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{
        mt: 2
      }}>{renderSourceDetails()}</Box>
      </Paper>;
  };

  /**
   * Render schema configuration section
   * @returns {JSX.Element} The schema config section
   */
  const renderSchemaConfig = () => <Paper variant="outlined" sx={{
    p: 2,
    mb: 3
  }}>
      <Typography variant="h6" gutterBottom>
        <SchemaIcon sx={{
        mr: 1,
        verticalAlign: 'middle'
      }} />
        Schema Configuration
      </Typography>
      <Divider sx={{
      mb: 2
    }} />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary">
            Schema Definition Method
          </Typography>
          <Typography variant="body1" sx={{
          textTransform: 'capitalize'
        }}>
            {values.schemaDefinitionMethod} Discovery
          </Typography>
        </Grid>

        {values.schemaDefinitionMethod === 'manual' && values.schema.length > 0 && <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Fields
            </Typography>
            <List dense>
              {values.schema.map((field, index) => <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary={<>
                        <strong>{field.name}</strong> ({field.type})
                        {field.required && <Chip label="Required" size="small" color="primary" sx={{
                ml: 1
              }} />}


                      </>} secondary={field.description || 'No description'} />

                </ListItem>)}

            </List>
          </Grid>}


        {values.schemaDefinitionMethod === 'auto' && <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Sample Data
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {values.sampleData ? `${values.sampleData.substring(0, 100)}...` : 'No sample data provided'}
            </Typography>
          </Grid>}


        {values.schemaDefinitionMethod === 'upload' && <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Schema File
            </Typography>
            <Typography variant="body1">
              {values.schemaFile ? values.schemaFile.name : 'No file uploaded'}
            </Typography>
          </Grid>}

      </Grid>
    </Paper>;

  /**
   * Render permissions section
   * @returns {JSX.Element} The permissions section
   */
  const renderPermissions = () => <Paper variant="outlined" sx={{
    p: 2,
    mb: 3
  }}>
      <Typography variant="h6" gutterBottom>
        <SecurityIcon sx={{
        mr: 1,
        verticalAlign: 'middle'
      }} />
        Access Permissions
      </Typography>
      <Divider sx={{
      mb: 2
    }} />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary">
            Access Level
          </Typography>
          <Typography variant="body1" sx={{
          textTransform: 'capitalize'
        }}>
            {values.accessLevel}
          </Typography>
        </Grid>

        {values.accessLevel === 'shared' && <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Shared With
            </Typography>
            {values.sharedWith.length > 0 ? <List dense>
                {values.sharedWith.map(user => <ListItem key={user.userId}>
                    <ListItemText primary={user.userName} secondary={<>
                          {user.userEmail} -{' '}
                          <Typography component="span" variant="body2" color="primary">

                            {getPermissionName(user.permission)}
                          </Typography>
                        </>} />


                  </ListItem>)}

              </List> : <Typography variant="body2" color="text.secondary">
                No users added
              </Typography>}

          </Grid>}

      </Grid>
    </Paper>;
  return <Box>
      {hasValidationErrors && <Alert severity="warning" sx={{
      mb: 3
    }} icon={<WarningIcon />} action={<Typography variant="body2">
              Please go back and fix the errors before creating the dataset.
            </Typography>}>


          <Typography variant="subtitle2">
            There are validation errors in your dataset configuration
          </Typography>
        </Alert>}


      {renderBasicInfo()}
      {renderSourceConfig()}
      {renderSchemaConfig()}
      {renderPermissions()}

      <Alert severity="info" sx={{
      mt: 2
    }}>
        Please review all information carefully before creating the dataset.
        Once created, some properties may not be easily changed.
      </Alert>
    </Box>;
};
ReviewStep.propTypes = {
  formik: PropTypes.object.isRequired
};
export default withErrorBoundary(ReviewStep, {
  boundary: 'ReviewStep'
});