import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Tabs,
  Tab,
  Divider,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Autocomplete,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Radio,
  RadioGroup,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Storage as StorageIcon,
  Database as DatabaseIcon,
  CloudQueue as CloudQueueIcon,
  Api as ApiIcon,
  Description as DescriptionIcon,
  Check as CheckIcon,
  Settings as SettingsIcon,
  Dns as DnsIcon,
} from '@mui/icons-material';
import { 
  datasetValidationSchema, 
  getDatasetInitialValues,
  hasFieldError,
  getFieldErrorMessage,
} from './form_validation';

// Custom styled components
const FormCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const FormCardTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  marginBottom: theme.spacing(2),
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  minWidth: 'auto',
  padding: theme.spacing(1, 2),
}));

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 0),
}));

const SourceOption = styled(Paper)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  cursor: 'pointer',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
  backgroundColor: selected ? theme.palette.primary.lighter : theme.palette.background.paper,
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: selected ? theme.palette.primary.lighter : theme.palette.action.hover,
  },
}));

const SourceIcon = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 32,
  color: theme.palette.primary.main,
}));

/**
 * DatasetForm component
 * 
 * A comprehensive form for creating and editing datasets,
 * with multiple tabs for organizing different configuration sections.
 */
const DatasetForm = ({
  dataset,
  applications = [],
  connections = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  availableRoles = [],
}) => {
  // State for the active tab
  const [activeTab, setActiveTab] = useState(0);
  
  // Dataset types
  const datasetTypes = [
    { id: 'csv', name: 'CSV File', description: 'Comma-separated values file' },
    { id: 'json', name: 'JSON', description: 'JavaScript Object Notation data' },
    { id: 'xml', name: 'XML', description: 'Extensible Markup Language data' },
    { id: 'database', name: 'Database', description: 'Database table or query result' },
    { id: 'api', name: 'API Response', description: 'Data from a REST API endpoint' },
    { id: 'custom', name: 'Custom', description: 'Custom data format' },
  ];
  
  // Source types
  const sourceTypes = [
    { 
      id: 's3', 
      name: 'Amazon S3', 
      description: 'Amazon Simple Storage Service',
      icon: <CloudQueueIcon fontSize="inherit" />,
      requiresConnection: true,
      requiresPath: true,
    },
    { 
      id: 'azureblob', 
      name: 'Azure Blob Storage', 
      description: 'Microsoft Azure Blob Storage',
      icon: <CloudQueueIcon fontSize="inherit" />,
      requiresConnection: true,
      requiresPath: true,
    },
    { 
      id: 'database', 
      name: 'Database', 
      description: 'SQL or NoSQL database',
      icon: <DatabaseIcon fontSize="inherit" />,
      requiresConnection: true,
      requiresQuery: true,
    },
    { 
      id: 'api', 
      name: 'REST API', 
      description: 'External REST API endpoint',
      icon: <ApiIcon fontSize="inherit" />,
      requiresConnection: true,
      requiresEndpoint: true,
    },
    { 
      id: 'filesystem', 
      name: 'Local File System', 
      description: 'Files from the local file system',
      icon: <DescriptionIcon fontSize="inherit" />,
      requiresConnection: false,
      requiresPath: true,
    },
  ];
  
  // Common suggested tags
  const suggestedTags = [
    'ETL', 'Data', 'Analysis', 'Reporting', 'API', 
    'Finance', 'HR', 'Sales', 'Marketing', 'Operations',
    'CSV', 'JSON', 'XML', 'Database', 'Production',
    'Development', 'Testing', 'Staging'
  ];
  
  // Initialize form with formik
  const formik = useFormik({
    initialValues: dataset ? { ...dataset } : getDatasetInitialValues(),
    validationSchema: datasetValidationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
    enableReinitialize: true,
  });
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Helper function to find connection name by ID
  const getConnectionName = (connectionId) => {
    const connection = connections.find(conn => conn.id === connectionId);
    return connection ? connection.name : connectionId;
  };
  
  // Helper function to find application name by ID
  const getApplicationName = (applicationId) => {
    const application = applications.find(app => app.id === applicationId);
    return application ? application.name : applicationId;
  };
  
  // Helper to get current source type configuration
  const getCurrentSourceType = () => {
    return sourceTypes.find(type => type.id === formik.values.config.source.type) || {};
  };
  
  // Helper to check if field should be shown based on source type
  const shouldShowField = (fieldType) => {
    const currentSourceType = getCurrentSourceType();
    
    switch (fieldType) {
      case 'connection':
        return currentSourceType.requiresConnection;
      case 'path':
        return currentSourceType.requiresPath;
      case 'query':
        return currentSourceType.requiresQuery;
      case 'endpoint':
        return currentSourceType.requiresEndpoint;
      default:
        return false;
    }
  };
  
  // Add a new field to schema
  const handleAddField = () => {
    const currentFields = formik.values.config.schema.fields || [];
    formik.setFieldValue('config.schema.fields', [
      ...currentFields,
      { name: '', type: 'string', required: false, defaultValue: '', description: '' }
    ]);
  };
  
  // Remove a field from schema
  const handleRemoveField = (index) => {
    const currentFields = formik.values.config.schema.fields || [];
    const newFields = [...currentFields];
    newFields.splice(index, 1);
    formik.setFieldValue('config.schema.fields', newFields);
  };
  
  // Handle selecting a source type
  const handleSourceTypeSelect = (typeId) => {
    formik.setFieldValue('config.source.type', typeId);
    
    // Reset related fields when changing source type
    formik.setFieldValue('config.source.connectionId', null);
    formik.setFieldValue('config.source.path', '');
    formik.setFieldValue('config.source.query', '');
    formik.setFieldValue('config.source.endpoint', '');
  };
  
  // Render form sections based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Basic Information
        return (
          <TabPanel>
            <FormCard>
              <CardContent>
                <FormCardTitle variant="h6">Basic Information</FormCardTitle>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      label="Dataset Name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                      required
                      placeholder="Enter dataset name"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="description"
                      name="description"
                      label="Description"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={formik.touched.description && formik.errors.description}
                      multiline
                      rows={3}
                      placeholder="Describe this dataset's purpose and contents"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl 
                      fullWidth
                      error={formik.touched.type && Boolean(formik.errors.type)}
                      required
                    >
                      <InputLabel id="type-label">Dataset Type</InputLabel>
                      <Select
                        labelId="type-label"
                        id="type"
                        name="type"
                        value={formik.values.type}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Dataset Type"
                      >
                        {datasetTypes.map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            <Box>
                              <Typography variant="subtitle2">{type.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {type.description}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.type && formik.errors.type && (
                        <FormHelperText>{formik.errors.type}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="application-label">Associated Application</InputLabel>
                      <Select
                        labelId="application-label"
                        id="applicationId"
                        name="applicationId"
                        value={formik.values.applicationId || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Associated Application"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {applications.map((app) => (
                          <MenuItem key={app.id} value={app.id}>
                            {app.name}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        Optionally associate this dataset with an application
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      id="tags"
                      options={suggestedTags}
                      value={formik.values.tags}
                      freeSolo
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={option}
                            {...getTagProps({ index })}
                            size="small"
                          />
                        ))
                      }
                      onChange={(event, newValue) => {
                        formik.setFieldValue('tags', newValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tags"
                          placeholder="Add tags"
                          helperText="Tags help categorize and find your dataset"
                          error={formik.touched.tags && Boolean(formik.errors.tags)}
                        />
                      )}
                    />
                    {formik.touched.tags && formik.errors.tags && (
                      <FormHelperText error>{formik.errors.tags}</FormHelperText>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </FormCard>
          </TabPanel>
        );
        
      case 1: // Source Configuration
        return (
          <TabPanel>
            <FormCard>
              <CardContent>
                <FormCardTitle variant="h6">Source Type</FormCardTitle>
                
                <Grid container spacing={2}>
                  {sourceTypes.map((type) => (
                    <Grid item xs={12} sm={6} key={type.id}>
                      <SourceOption
                        selected={formik.values.config.source.type === type.id}
                        onClick={() => handleSourceTypeSelect(type.id)}
                      >
                        <SourceIcon>
                          {type.icon}
                        </SourceIcon>
                        <Box>
                          <Typography variant="subtitle1">{type.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {type.description}
                          </Typography>
                        </Box>
                      </SourceOption>
                    </Grid>
                  ))}
                </Grid>
                
                {formik.touched.config?.source?.type && formik.errors.config?.source?.type && (
                  <FormHelperText error sx={{ mt: 1 }}>
                    {formik.errors.config.source.type}
                  </FormHelperText>
                )}
              </CardContent>
            </FormCard>
            
            {formik.values.config.source.type && (
              <FormCard>
                <CardContent>
                  <FormCardTitle variant="h6">Source Configuration</FormCardTitle>
                  
                  <Grid container spacing={3}>
                    {shouldShowField('connection') && (
                      <Grid item xs={12}>
                        <FormControl
                          fullWidth
                          error={hasFieldError(formik, 'config.source.connectionId')}
                          required
                        >
                          <InputLabel id="connection-label">Connection</InputLabel>
                          <Select
                            labelId="connection-label"
                            id="config.source.connectionId"
                            name="config.source.connectionId"
                            value={formik.values.config.source.connectionId || ''}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            label="Connection"
                          >
                            <MenuItem value="">
                              <em>Select a connection</em>
                            </MenuItem>
                            {connections
                              .filter(conn => conn.type === formik.values.config.source.type)
                              .map((conn) => (
                                <MenuItem key={conn.id} value={conn.id}>
                                  {conn.name}
                                </MenuItem>
                              ))}
                          </Select>
                          {hasFieldError(formik, 'config.source.connectionId') && (
                            <FormHelperText>
                              {getFieldErrorMessage(formik, 'config.source.connectionId')}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                    )}
                    
                    {shouldShowField('path') && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          id="config.source.path"
                          name="config.source.path"
                          label="Path"
                          value={formik.values.config.source.path}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={hasFieldError(formik, 'config.source.path')}
                          helperText={
                            hasFieldError(formik, 'config.source.path')
                              ? getFieldErrorMessage(formik, 'config.source.path')
                              : `Path to the ${formik.values.type} file or directory`
                          }
                          required
                        />
                      </Grid>
                    )}
                    
                    {shouldShowField('query') && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          id="config.source.query"
                          name="config.source.query"
                          label="SQL Query"
                          value={formik.values.config.source.query}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={hasFieldError(formik, 'config.source.query')}
                          helperText={
                            hasFieldError(formik, 'config.source.query')
                              ? getFieldErrorMessage(formik, 'config.source.query')
                              : 'SQL query to execute on the database'
                          }
                          multiline
                          rows={4}
                          required
                        />
                      </Grid>
                    )}
                    
                    {shouldShowField('endpoint') && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          id="config.source.endpoint"
                          name="config.source.endpoint"
                          label="API Endpoint"
                          value={formik.values.config.source.endpoint}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={hasFieldError(formik, 'config.source.endpoint')}
                          helperText={
                            hasFieldError(formik, 'config.source.endpoint')
                              ? getFieldErrorMessage(formik, 'config.source.endpoint')
                              : 'URL of the API endpoint'
                          }
                          required
                        />
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </FormCard>
            )}
          </TabPanel>
        );
        
      case 2: // Schema
        return (
          <TabPanel>
            <FormCard>
              <CardContent>
                <FormCardTitle variant="h6">Schema Detection</FormCardTitle>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          id="config.schema.autoDetect"
                          name="config.schema.autoDetect"
                          checked={formik.values.config.schema.autoDetect}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      }
                      label="Auto-detect schema"
                    />
                    <Typography variant="caption" color="text.secondary" display="block">
                      If enabled, the system will automatically detect the schema from the data source
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </FormCard>
            
            {!formik.values.config.schema.autoDetect && (
              <FormCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <FormCardTitle variant="h6" sx={{ mb: 0 }}>Fields</FormCardTitle>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={handleAddField}
                      variant="outlined"
                      size="small"
                    >
                      Add Field
                    </Button>
                  </Box>
                  
                  {formik.values.config.schema.fields.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No fields defined. Click "Add Field" to define schema fields.
                    </Typography>
                  ) : (
                    <div>
                      {formik.values.config.schema.fields.map((field, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 2,
                            mb: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                          }}
                        >
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Field Name"
                                value={field.name}
                                onChange={(e) => {
                                  const newFields = [...formik.values.config.schema.fields];
                                  newFields[index] = { ...field, name: e.target.value };
                                  formik.setFieldValue('config.schema.fields', newFields);
                                }}
                                error={
                                  hasFieldError(formik, `config.schema.fields[${index}].name`)
                                }
                                helperText={
                                  hasFieldError(formik, `config.schema.fields[${index}].name`)
                                    ? getFieldErrorMessage(formik, `config.schema.fields[${index}].name`)
                                    : ''
                                }
                                required
                              />
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                              <FormControl 
                                fullWidth
                                error={
                                  hasFieldError(formik, `config.schema.fields[${index}].type`)
                                }
                              >
                                <InputLabel>Field Type</InputLabel>
                                <Select
                                  value={field.type}
                                  onChange={(e) => {
                                    const newFields = [...formik.values.config.schema.fields];
                                    newFields[index] = { ...field, type: e.target.value };
                                    formik.setFieldValue('config.schema.fields', newFields);
                                  }}
                                  label="Field Type"
                                  required
                                >
                                  <MenuItem value="string">String</MenuItem>
                                  <MenuItem value="number">Number</MenuItem>
                                  <MenuItem value="boolean">Boolean</MenuItem>
                                  <MenuItem value="date">Date</MenuItem>
                                  <MenuItem value="object">Object</MenuItem>
                                  <MenuItem value="array">Array</MenuItem>
                                </Select>
                                {hasFieldError(formik, `config.schema.fields[${index}].type`) && (
                                  <FormHelperText>
                                    {getFieldErrorMessage(formik, `config.schema.fields[${index}].type`)}
                                  </FormHelperText>
                                )}
                              </FormControl>
                            </Grid>
                            
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Description"
                                value={field.description || ''}
                                onChange={(e) => {
                                  const newFields = [...formik.values.config.schema.fields];
                                  newFields[index] = { ...field, description: e.target.value };
                                  formik.setFieldValue('config.schema.fields', newFields);
                                }}
                              />
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Default Value"
                                value={field.defaultValue || ''}
                                onChange={(e) => {
                                  const newFields = [...formik.values.config.schema.fields];
                                  newFields[index] = { ...field, defaultValue: e.target.value };
                                  formik.setFieldValue('config.schema.fields', newFields);
                                }}
                              />
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={field.required || false}
                                    onChange={(e) => {
                                      const newFields = [...formik.values.config.schema.fields];
                                      newFields[index] = { ...field, required: e.target.checked };
                                      formik.setFieldValue('config.schema.fields', newFields);
                                    }}
                                  />
                                }
                                label="Required Field"
                              />
                            </Grid>
                          </Grid>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                            <Button
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleRemoveField(index)}
                              size="small"
                            >
                              Remove Field
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </div>
                  )}
                  
                  {hasFieldError(formik, 'config.schema.fields') && (
                    <FormHelperText error>
                      {getFieldErrorMessage(formik, 'config.schema.fields')}
                    </FormHelperText>
                  )}
                </CardContent>
              </FormCard>
            )}
          </TabPanel>
        );
        
      case 3: // Permissions
        return (
          <TabPanel>
            <FormCard>
              <CardContent>
                <FormCardTitle variant="h6">Visibility Settings</FormCardTitle>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          id="permissions.visibleToAllUsers"
                          name="permissions.visibleToAllUsers"
                          checked={formik.values.permissions.visibleToAllUsers}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      }
                      label="Visible to all users"
                    />
                    <Typography variant="caption" color="text.secondary" display="block">
                      If disabled, you can restrict visibility to specific roles
                    </Typography>
                  </Grid>
                  
                  {!formik.values.permissions.visibleToAllUsers && (
                    <Grid item xs={12}>
                      <FormControl 
                        fullWidth
                        error={hasFieldError(formik, 'permissions.specificRoles')}
                        required
                      >
                        <InputLabel id="roles-label">Visible to Specific Roles</InputLabel>
                        <Select
                          labelId="roles-label"
                          id="permissions.specificRoles"
                          name="permissions.specificRoles"
                          multiple
                          value={formik.values.permissions.specificRoles}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          label="Visible to Specific Roles"
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => {
                                const role = availableRoles.find(r => r.id === value) || { name: value };
                                return (
                                  <Chip key={value} label={role.name} size="small" />
                                );
                              })}
                            </Box>
                          )}
                        >
                          {availableRoles.map((role) => (
                            <MenuItem key={role.id} value={role.id}>
                              {role.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {hasFieldError(formik, 'permissions.specificRoles') && (
                          <FormHelperText>
                            {getFieldErrorMessage(formik, 'permissions.specificRoles')}
                          </FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <FormCardTitle variant="h6">Access Control</FormCardTitle>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          id="permissions.readOnly"
                          name="permissions.readOnly"
                          checked={formik.values.permissions.readOnly}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      }
                      label="Read-only mode"
                    />
                    <Typography variant="caption" color="text.secondary" display="block">
                      If enabled, users can only read the dataset but not modify it
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </FormCard>
          </TabPanel>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        indicatorColor="primary"
        textColor="primary"
        aria-label="dataset form tabs"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <StyledTab label="Basic Information" />
        <StyledTab label="Source" />
        <StyledTab label="Schema" />
        <StyledTab label="Permissions" />
      </Tabs>
      
      {renderTabContent()}
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          startIcon={<CancelIcon />}
          disabled={isSubmitting}
          sx={{ mr: 2 }}
        >
          Cancel
        </Button>
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : dataset ? 'Update Dataset' : 'Create Dataset'}
        </Button>
      </Box>
    </Box>
  );
};

DatasetForm.propTypes = {
  /**
   * Dataset data for editing (null for creating a new dataset)
   */
  dataset: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    type: PropTypes.string,
    applicationId: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    config: PropTypes.shape({
      source: PropTypes.shape({
        type: PropTypes.string,
        connectionId: PropTypes.string,
        path: PropTypes.string,
        query: PropTypes.string,
        endpoint: PropTypes.string,
      }),
      schema: PropTypes.shape({
        autoDetect: PropTypes.bool,
        fields: PropTypes.arrayOf(
          PropTypes.shape({
            name: PropTypes.string,
            type: PropTypes.string,
            required: PropTypes.bool,
            defaultValue: PropTypes.string,
            description: PropTypes.string,
          })
        ),
      }),
    }),
    permissions: PropTypes.shape({
      visibleToAllUsers: PropTypes.bool,
      specificRoles: PropTypes.arrayOf(PropTypes.string),
      readOnly: PropTypes.bool,
    }),
  }),
  
  /**
   * Available applications to associate with the dataset
   */
  applications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  
  /**
   * Available connections for data sources
   */
  connections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    })
  ),
  
  /**
   * Callback function when form is submitted
   */
  onSubmit: PropTypes.func.isRequired,
  
  /**
   * Callback function when form is cancelled
   */
  onCancel: PropTypes.func.isRequired,
  
  /**
   * Whether the form is currently submitting
   */
  isSubmitting: PropTypes.bool,
  
  /**
   * Available roles for role-based permissions
   */
  availableRoles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

DatasetForm.defaultProps = {
  dataset: null,
  applications: [],
  connections: [],
  isSubmitting: false,
  availableRoles: [
    { id: 'admin', name: 'Administrator' },
    { id: 'power_user', name: 'Power User' },
    { id: 'standard_user', name: 'Standard User' },
    { id: 'read_only', name: 'Read Only' },
  ],
};

export default DatasetForm;