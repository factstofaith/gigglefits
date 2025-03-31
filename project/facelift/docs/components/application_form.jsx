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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { 
  applicationValidationSchema, 
  getApplicationInitialValues,
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

/**
 * ApplicationForm component
 * 
 * A comprehensive form for creating and editing applications,
 * with multiple tabs for organizing different configuration sections.
 */
const ApplicationForm = ({
  application,
  onSubmit,
  onCancel,
  isSubmitting = false,
  availableRoles = [],
  availableTimeZones = [],
}) => {
  // State for the active tab
  const [activeTab, setActiveTab] = useState(0);
  
  // Application types
  const applicationTypes = [
    { id: 'api_integration', name: 'API Integration', description: 'Connect to external APIs and services' },
    { id: 'data_transformation', name: 'Data Transformation', description: 'Transform and map data between formats' },
    { id: 'etl_process', name: 'ETL Process', description: 'Extract, transform and load data workflows' },
    { id: 'reporting', name: 'Reporting', description: 'Generate reports and visualizations' },
    { id: 'analytics', name: 'Analytics', description: 'Perform data analysis and insights' },
    { id: 'custom', name: 'Custom', description: 'Create a custom application type' },
  ];
  
  // Execution mode options
  const executionModes = [
    { value: 'sequential', label: 'Sequential', description: 'Execute steps one after another' },
    { value: 'parallel', label: 'Parallel', description: 'Execute multiple steps concurrently' },
    { value: 'event_driven', label: 'Event Driven', description: 'Trigger execution based on events' },
  ];
  
  // Log level options
  const logLevels = [
    { value: 'debug', label: 'Debug' },
    { value: 'info', label: 'Info' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' },
  ];
  
  // Common suggested tags
  const suggestedTags = [
    'Integration', 'ETL', 'Data', 'Analysis', 'Reporting', 'API', 
    'Finance', 'HR', 'Sales', 'Marketing', 'Operations', 'Production',
    'Development', 'Testing', 'Production'
  ];
  
  // Initialize form with formik
  const formik = useFormik({
    initialValues: application ? { ...application } : getApplicationInitialValues(),
    validationSchema: applicationValidationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
    enableReinitialize: true,
  });
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Add a new custom header
  const handleAddCustomHeader = () => {
    const currentHeaders = formik.values.advanced?.customHeaders || [];
    formik.setFieldValue('advanced.customHeaders', [
      ...currentHeaders,
      { key: '', value: '' }
    ]);
  };
  
  // Remove a custom header
  const handleRemoveCustomHeader = (index) => {
    const currentHeaders = formik.values.advanced?.customHeaders || [];
    const newHeaders = [...currentHeaders];
    newHeaders.splice(index, 1);
    formik.setFieldValue('advanced.customHeaders', newHeaders);
  };
  
  // Add a notification email
  const handleAddNotificationEmail = () => {
    if (formik.values.advanced.notificationEmails.includes('')) {
      return; // Don't add another empty email if one already exists
    }
    formik.setFieldValue('advanced.notificationEmails', [
      ...formik.values.advanced.notificationEmails,
      ''
    ]);
  };
  
  // Update a notification email
  const handleUpdateNotificationEmail = (index, value) => {
    const newEmails = [...formik.values.advanced.notificationEmails];
    newEmails[index] = value;
    formik.setFieldValue('advanced.notificationEmails', newEmails);
  };
  
  // Remove a notification email
  const handleRemoveNotificationEmail = (index) => {
    const newEmails = [...formik.values.advanced.notificationEmails];
    newEmails.splice(index, 1);
    formik.setFieldValue('advanced.notificationEmails', newEmails);
  };
  
  // Prepare timezone options
  const timezones = availableTimeZones.length > 0 
    ? availableTimeZones 
    : [
        { value: 'UTC', label: 'UTC' },
        { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
        { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
        { value: 'America/Denver', label: 'America/Denver (MST/MDT)' },
        { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT)' },
        { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
        { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
        { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
        { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' },
      ];
  
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
                      label="Application Name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                      required
                      placeholder="Enter application name"
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
                      placeholder="Describe the purpose of this application"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl 
                      fullWidth
                      error={formik.touched.type && Boolean(formik.errors.type)}
                      required
                    >
                      <InputLabel id="type-label">Application Type</InputLabel>
                      <Select
                        labelId="type-label"
                        id="type"
                        name="type"
                        value={formik.values.type}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Application Type"
                      >
                        {applicationTypes.map((type) => (
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
                          helperText="Tags help categorize and find your application"
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
        
      case 1: // Configuration
        return (
          <TabPanel>
            <FormCard>
              <CardContent>
                <FormCardTitle variant="h6">Execution Configuration</FormCardTitle>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      error={
                        hasFieldError(formik, 'config.executionMode')
                      }
                      required
                    >
                      <InputLabel id="execution-mode-label">Execution Mode</InputLabel>
                      <Select
                        labelId="execution-mode-label"
                        id="config.executionMode"
                        name="config.executionMode"
                        value={formik.values.config.executionMode}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Execution Mode"
                      >
                        {executionModes.map((mode) => (
                          <MenuItem key={mode.value} value={mode.value}>
                            <Box>
                              <Typography variant="subtitle2">{mode.label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {mode.description}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {hasFieldError(formik, 'config.executionMode') && (
                        <FormHelperText>
                          {getFieldErrorMessage(formik, 'config.executionMode')}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  
                  {formik.values.config.executionMode === 'parallel' && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="config.maxConcurrentRuns"
                        name="config.maxConcurrentRuns"
                        label="Maximum Concurrent Runs"
                        type="number"
                        value={formik.values.config.maxConcurrentRuns}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={hasFieldError(formik, 'config.maxConcurrentRuns')}
                        helperText={
                          hasFieldError(formik, 'config.maxConcurrentRuns')
                            ? getFieldErrorMessage(formik, 'config.maxConcurrentRuns')
                            : 'Maximum number of concurrent executions'
                        }
                        InputProps={{ inputProps: { min: 1, max: 20 } }}
                        required
                      />
                    </Grid>
                  )}
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="config.timeout"
                      name="config.timeout"
                      label="Execution Timeout (seconds)"
                      type="number"
                      value={formik.values.config.timeout}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={hasFieldError(formik, 'config.timeout')}
                      helperText={
                        hasFieldError(formik, 'config.timeout')
                          ? getFieldErrorMessage(formik, 'config.timeout')
                          : 'Maximum execution time in seconds (0 for no timeout)'
                      }
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="config.retryCount"
                      name="config.retryCount"
                      label="Retry Count"
                      type="number"
                      value={formik.values.config.retryCount}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={hasFieldError(formik, 'config.retryCount')}
                      helperText={
                        hasFieldError(formik, 'config.retryCount')
                          ? getFieldErrorMessage(formik, 'config.retryCount')
                          : 'Number of retry attempts on failure'
                      }
                      InputProps={{ inputProps: { min: 0, max: 10 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="config.retryDelay"
                      name="config.retryDelay"
                      label="Retry Delay (seconds)"
                      type="number"
                      value={formik.values.config.retryDelay}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={hasFieldError(formik, 'config.retryDelay')}
                      helperText={
                        hasFieldError(formik, 'config.retryDelay')
                          ? getFieldErrorMessage(formik, 'config.retryDelay')
                          : 'Delay between retry attempts in seconds'
                      }
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </FormCard>
            
            <FormCard>
              <CardContent>
                <FormCardTitle variant="h6">Publication Settings</FormCardTitle>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          id="config.autoPublish"
                          name="config.autoPublish"
                          checked={formik.values.config.autoPublish}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      }
                      label="Auto-publish application"
                    />
                    <Typography variant="caption" color="text.secondary" display="block">
                      If enabled, the application will be immediately available after creation
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          id="config.requireApproval"
                          name="config.requireApproval"
                          checked={formik.values.config.requireApproval}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          disabled={!formik.values.config.autoPublish}
                        />
                      }
                      label="Require approval before publishing"
                    />
                    <Typography variant="caption" color="text.secondary" display="block">
                      If enabled, an administrator must approve the application before it's published
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </FormCard>
          </TabPanel>
        );
        
      case 2: // Permissions
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
                          id="permissions.viewOnly"
                          name="permissions.viewOnly"
                          checked={formik.values.permissions.viewOnly}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      }
                      label="View-only mode"
                    />
                    <Typography variant="caption" color="text.secondary" display="block">
                      If enabled, users can only view the application but not modify it
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          id="permissions.requireExplicitGrant"
                          name="permissions.requireExplicitGrant"
                          checked={formik.values.permissions.requireExplicitGrant}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      }
                      label="Require explicit access grant"
                    />
                    <Typography variant="caption" color="text.secondary" display="block">
                      If enabled, users must be explicitly granted access to this application
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </FormCard>
          </TabPanel>
        );
        
      case 3: // Schedule
        return (
          <TabPanel>
            <FormCard>
              <CardContent>
                <FormCardTitle variant="h6">Scheduling</FormCardTitle>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          id="schedule.enabled"
                          name="schedule.enabled"
                          checked={formik.values.schedule.enabled}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      }
                      label="Enable scheduled execution"
                    />
                    <Typography variant="caption" color="text.secondary" display="block">
                      If enabled, the application will run automatically on a schedule
                    </Typography>
                  </Grid>
                  
                  {formik.values.schedule.enabled && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          id="schedule.cronExpression"
                          name="schedule.cronExpression"
                          label="CRON Expression"
                          value={formik.values.schedule.cronExpression}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={hasFieldError(formik, 'schedule.cronExpression')}
                          helperText={
                            hasFieldError(formik, 'schedule.cronExpression')
                              ? getFieldErrorMessage(formik, 'schedule.cronExpression')
                              : 'CRON expression for scheduled execution (e.g., "0 0 * * *" for daily at midnight)'
                          }
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <FormControl 
                          fullWidth
                          error={hasFieldError(formik, 'schedule.timezone')}
                          required
                        >
                          <InputLabel id="timezone-label">Timezone</InputLabel>
                          <Select
                            labelId="timezone-label"
                            id="schedule.timezone"
                            name="schedule.timezone"
                            value={formik.values.schedule.timezone}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            label="Timezone"
                          >
                            {timezones.map((tz) => (
                              <MenuItem key={tz.value} value={tz.value}>
                                {tz.label}
                              </MenuItem>
                            ))}
                          </Select>
                          {hasFieldError(formik, 'schedule.timezone') && (
                            <FormHelperText>
                              {getFieldErrorMessage(formik, 'schedule.timezone')}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </FormCard>
          </TabPanel>
        );
        
      case 4: // Advanced
        return (
          <TabPanel>
            <FormCard>
              <CardContent>
                <FormCardTitle variant="h6">Advanced Settings</FormCardTitle>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl 
                      fullWidth
                      error={hasFieldError(formik, 'advanced.logLevel')}
                    >
                      <InputLabel id="log-level-label">Log Level</InputLabel>
                      <Select
                        labelId="log-level-label"
                        id="advanced.logLevel"
                        name="advanced.logLevel"
                        value={formik.values.advanced.logLevel}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Log Level"
                      >
                        {logLevels.map((level) => (
                          <MenuItem key={level.value} value={level.value}>
                            {level.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {hasFieldError(formik, 'advanced.logLevel') && (
                        <FormHelperText>
                          {getFieldErrorMessage(formik, 'advanced.logLevel')}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
                
                <Box mt={3}>
                  <FormCardTitle variant="subtitle1">
                    Notification Emails
                    <IconButton
                      size="small"
                      onClick={handleAddNotificationEmail}
                      color="primary"
                      aria-label="Add email"
                      sx={{ ml: 1 }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </FormCardTitle>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Email addresses that will receive notifications about this application
                  </Typography>
                  
                  {formik.values.advanced.notificationEmails.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No notification emails configured
                    </Typography>
                  ) : (
                    formik.values.advanced.notificationEmails.map((email, index) => (
                      <Box
                        key={index}
                        display="flex"
                        alignItems="center"
                        mb={1}
                      >
                        <EmailIcon color="action" sx={{ mr: 1 }} />
                        <TextField
                          fullWidth
                          size="small"
                          value={email}
                          onChange={(e) => handleUpdateNotificationEmail(index, e.target.value)}
                          placeholder="Email address"
                          error={
                            hasFieldError(formik, `advanced.notificationEmails[${index}]`)
                          }
                          helperText={
                            hasFieldError(formik, `advanced.notificationEmails[${index}]`)
                              ? getFieldErrorMessage(formik, `advanced.notificationEmails[${index}]`)
                              : ''
                          }
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveNotificationEmail(index)}
                          color="error"
                          aria-label="Remove email"
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))
                  )}
                </Box>
                
                <Box mt={3}>
                  <FormCardTitle variant="subtitle1">
                    Custom Headers
                    <IconButton
                      size="small"
                      onClick={handleAddCustomHeader}
                      color="primary"
                      aria-label="Add header"
                      sx={{ ml: 1 }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </FormCardTitle>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Custom HTTP headers to include in API requests
                  </Typography>
                  
                  {formik.values.advanced.customHeaders.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No custom headers configured
                    </Typography>
                  ) : (
                    formik.values.advanced.customHeaders.map((header, index) => (
                      <Box
                        key={index}
                        display="flex"
                        alignItems="center"
                        mb={1}
                      >
                        <TextField
                          size="small"
                          value={header.key}
                          onChange={(e) => {
                            const newHeaders = [...formik.values.advanced.customHeaders];
                            newHeaders[index] = { ...header, key: e.target.value };
                            formik.setFieldValue('advanced.customHeaders', newHeaders);
                          }}
                          placeholder="Header key"
                          sx={{ mr: 1, width: '40%' }}
                          error={
                            hasFieldError(formik, `advanced.customHeaders[${index}].key`)
                          }
                          helperText={
                            hasFieldError(formik, `advanced.customHeaders[${index}].key`)
                              ? getFieldErrorMessage(formik, `advanced.customHeaders[${index}].key`)
                              : ''
                          }
                        />
                        <ArrowForwardIcon color="action" sx={{ mx: 1 }} />
                        <TextField
                          size="small"
                          value={header.value}
                          onChange={(e) => {
                            const newHeaders = [...formik.values.advanced.customHeaders];
                            newHeaders[index] = { ...header, value: e.target.value };
                            formik.setFieldValue('advanced.customHeaders', newHeaders);
                          }}
                          placeholder="Header value"
                          sx={{ flex: 1 }}
                          error={
                            hasFieldError(formik, `advanced.customHeaders[${index}].value`)
                          }
                          helperText={
                            hasFieldError(formik, `advanced.customHeaders[${index}].value`)
                              ? getFieldErrorMessage(formik, `advanced.customHeaders[${index}].value`)
                              : ''
                          }
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveCustomHeader(index)}
                          color="error"
                          aria-label="Remove header"
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))
                  )}
                </Box>
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
        aria-label="application form tabs"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <StyledTab label="Basic Information" />
        <StyledTab label="Configuration" />
        <StyledTab label="Permissions" />
        <StyledTab label="Schedule" />
        <StyledTab label="Advanced" />
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
          {isSubmitting ? 'Saving...' : application ? 'Update Application' : 'Create Application'}
        </Button>
      </Box>
    </Box>
  );
};

ApplicationForm.propTypes = {
  /**
   * Application data for editing (null for creating a new application)
   */
  application: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    type: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    config: PropTypes.shape({
      autoPublish: PropTypes.bool,
      requireApproval: PropTypes.bool,
      executionMode: PropTypes.string,
      maxConcurrentRuns: PropTypes.number,
      timeout: PropTypes.number,
      retryCount: PropTypes.number,
      retryDelay: PropTypes.number,
    }),
    permissions: PropTypes.shape({
      visibleToAllUsers: PropTypes.bool,
      specificRoles: PropTypes.arrayOf(PropTypes.string),
      viewOnly: PropTypes.bool,
      requireExplicitGrant: PropTypes.bool,
    }),
    schedule: PropTypes.shape({
      enabled: PropTypes.bool,
      cronExpression: PropTypes.string,
      timezone: PropTypes.string,
    }),
    advanced: PropTypes.shape({
      logLevel: PropTypes.string,
      notificationEmails: PropTypes.arrayOf(PropTypes.string),
      customHeaders: PropTypes.arrayOf(
        PropTypes.shape({
          key: PropTypes.string,
          value: PropTypes.string,
        })
      ),
    }),
  }),
  
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
  
  /**
   * Available timezones for scheduling
   */
  availableTimeZones: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
};

ApplicationForm.defaultProps = {
  application: null,
  isSubmitting: false,
  availableRoles: [
    { id: 'admin', name: 'Administrator' },
    { id: 'power_user', name: 'Power User' },
    { id: 'standard_user', name: 'Standard User' },
    { id: 'read_only', name: 'Read Only' },
  ],
  availableTimeZones: [],
};

export default ApplicationForm;