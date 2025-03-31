import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Grid,
  Divider,
  Tabs,
  Tab,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Paper,
  Autocomplete,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Public as PublicIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  History as HistoryIcon,
  Code as CodeIcon,
  Storage as StorageIcon,
  PlayArrow as PlayArrowIcon,
  Publish as PublishIcon,
  Unpublished as UnpublishedIcon,
} from '@mui/icons-material';
import ApplicationStatusBadge from './ApplicationStatusBadge';

// Styled components
const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 0),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 500,
}));

const DetailItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

/**
 * ApplicationDetailView component
 * 
 * Displays detailed information about an application in a tabbed dialog,
 * with editing capabilities and action buttons for lifecycle management.
 */
const ApplicationDetailView = ({ open, onClose, application, onUpdate, tenant }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Available application types
  const applicationTypes = [
    { id: 'api_integration', name: 'API Integration', description: 'Connect to external APIs and services' },
    { id: 'data_transformation', name: 'Data Transformation', description: 'Transform and map data between formats' },
    { id: 'etl_process', name: 'ETL Process', description: 'Extract, transform and load data workflows' },
    { id: 'reporting', name: 'Reporting', description: 'Generate reports and visualizations' },
    { id: 'analytics', name: 'Analytics', description: 'Perform data analysis and insights' },
    { id: 'custom', name: 'Custom', description: 'Custom application type' },
  ];

  // User roles for permission assignment
  const availableRoles = [
    { id: 'admin', name: 'Administrator' },
    { id: 'power_user', name: 'Power User' },
    { id: 'standard_user', name: 'Standard User' },
    { id: 'read_only', name: 'Read Only' },
  ];

  // Tags for application categorization
  const suggestedTags = [
    'Integration', 'ETL', 'Data', 'Analysis', 'Reporting', 'API',
    'Finance', 'HR', 'Sales', 'Marketing', 'Operations', 'Production',
    'Development', 'Testing', 'Production'
  ];

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Application name is required')
      .min(3, 'Name must be at least 3 characters')
      .max(50, 'Name must be less than 50 characters'),
    description: Yup.string()
      .max(200, 'Description must be less than 200 characters'),
    type: Yup.string()
      .required('Application type is required'),
    config: Yup.object({
      autoPublish: Yup.boolean(),
      requireApproval: Yup.boolean(),
      executionMode: Yup.string().required('Execution mode is required'),
      maxConcurrentRuns: Yup.number()
        .when('executionMode', {
          is: 'parallel',
          then: Yup.number()
            .required('Required for parallel execution')
            .min(1, 'Must be at least 1')
            .max(10, 'Must be at most 10'),
          otherwise: Yup.number().nullable(),
        }),
    }),
    permissions: Yup.object({
      visibleToAllUsers: Yup.boolean(),
      specificRoles: Yup.array().when('visibleToAllUsers', {
        is: false,
        then: Yup.array()
          .min(1, 'At least one role must be selected')
          .required('Required when not visible to all users'),
        otherwise: Yup.array().nullable(),
      }),
    }),
    tags: Yup.array()
      .max(10, 'Maximum 10 tags allowed'),
  });

  // Initialize form with formik
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: application?.name || '',
      description: application?.description || '',
      type: application?.type || '',
      config: {
        autoPublish: application?.config?.autoPublish || false,
        requireApproval: application?.config?.requireApproval || true,
        executionMode: application?.config?.executionMode || 'sequential',
        maxConcurrentRuns: application?.config?.maxConcurrentRuns || 1,
      },
      permissions: {
        visibleToAllUsers: application?.permissions?.visibleToAllUsers || true,
        specificRoles: application?.permissions?.specificRoles || [],
      },
      tags: application?.tags || [],
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setError(null);

      try {
        // Format the data for API submission
        const applicationData = {
          ...application,
          ...values,
          updated_at: new Date().toISOString(),
        };
        
        await onUpdate(applicationData);
        setIsEditing(false);
      } catch (err) {
        setError(err.message || 'Failed to update application');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle dialog close
  const handleClose = () => {
    if (isEditing) {
      // Ask for confirmation if in edit mode
      if (window.confirm('Are you sure you want to close? Unsaved changes will be lost.')) {
        setIsEditing(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Get type name for display
  const getTypeName = (typeId) => {
    const type = applicationTypes.find(t => t.id === typeId);
    return type ? type.name : typeId;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="application-detail-dialog-title"
    >
      <DialogTitle id="application-detail-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isEditing ? (
              <Typography variant="h6" component="div">
                Edit Application
              </Typography>
            ) : (
              <>
                <Typography variant="h6" component="div">
                  {application?.name}
                </Typography>
                <Box sx={{ ml: 2 }}>
                  <ApplicationStatusBadge status={application?.status} />
                </Box>
              </>
            )}
          </Box>
          <IconButton edge="end" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="application detail tabs"
        >
          <Tab label="Overview" />
          <Tab label="Configuration" />
          <Tab label="Permissions" />
          <Tab label="Datasets" />
          <Tab label="History" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel hidden={activeTab !== 0}>
          {isEditing ? (
            <form>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label="Application Name"
                    variant="outlined"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="description"
                    name="description"
                    label="Description"
                    variant="outlined"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                    multiline
                    rows={3}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl
                    fullWidth
                    error={formik.touched.type && Boolean(formik.errors.type)}
                    required
                  >
                    <InputLabel id="application-type-label">Application Type</InputLabel>
                    <Select
                      labelId="application-type-label"
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
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </form>
          ) : (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <DetailItem>
                    <Typography variant="subtitle2" color="text.secondary">
                      Application ID
                    </Typography>
                    <Typography variant="body1">
                      {application?.id}
                    </Typography>
                  </DetailItem>
                  
                  <DetailItem>
                    <Typography variant="subtitle2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1">
                      {application?.name}
                    </Typography>
                  </DetailItem>
                  
                  <DetailItem>
                    <Typography variant="subtitle2" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body1">
                      {getTypeName(application?.type)}
                    </Typography>
                  </DetailItem>
                  
                  <DetailItem>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <ApplicationStatusBadge status={application?.status} />
                  </DetailItem>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <DetailItem>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(application?.created_at)}
                    </Typography>
                  </DetailItem>
                  
                  <DetailItem>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(application?.updated_at)}
                    </Typography>
                  </DetailItem>
                  
                  <DetailItem>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tenant
                    </Typography>
                    <Typography variant="body1">
                      {tenant?.name || application?.tenant_id || 'N/A'}
                    </Typography>
                  </DetailItem>
                  
                  <DetailItem>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                      {application?.tags && application.tags.length > 0 ? (
                        application.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No tags
                        </Typography>
                      )}
                    </Box>
                  </DetailItem>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ mb: 2 }} />
                  <DetailItem>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {application?.description || 'No description provided'}
                    </Typography>
                  </DetailItem>
                </Grid>
              </Grid>
            </Box>
          )}
        </TabPanel>

        {/* Configuration Tab */}
        <TabPanel hidden={activeTab !== 1}>
          {isEditing ? (
            <form>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <SectionTitle variant="subtitle1">
                    Execution Configuration
                  </SectionTitle>
                  
                  <FormControl
                    fullWidth
                    error={
                      formik.touched.config?.executionMode && 
                      Boolean(formik.errors.config?.executionMode)
                    }
                    sx={{ mb: 3 }}
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
                      <MenuItem value="sequential">Sequential</MenuItem>
                      <MenuItem value="parallel">Parallel</MenuItem>
                      <MenuItem value="event_driven">Event Driven</MenuItem>
                    </Select>
                    {formik.touched.config?.executionMode && formik.errors.config?.executionMode && (
                      <FormHelperText>{formik.errors.config.executionMode}</FormHelperText>
                    )}
                  </FormControl>
                  
                  {formik.values.config.executionMode === 'parallel' && (
                    <TextField
                      fullWidth
                      id="config.maxConcurrentRuns"
                      name="config.maxConcurrentRuns"
                      label="Maximum Concurrent Runs"
                      type="number"
                      variant="outlined"
                      value={formik.values.config.maxConcurrentRuns}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.config?.maxConcurrentRuns && 
                        Boolean(formik.errors.config?.maxConcurrentRuns)
                      }
                      helperText={
                        formik.touched.config?.maxConcurrentRuns && 
                        formik.errors.config?.maxConcurrentRuns
                      }
                      InputProps={{ inputProps: { min: 1, max: 10 } }}
                      required
                    />
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <SectionTitle variant="subtitle1">
                    Publication Settings
                  </SectionTitle>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            id="config.autoPublish"
                            name="config.autoPublish"
                            checked={formik.values.config.autoPublish}
                            onChange={formik.handleChange}
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
                </Grid>
              </Grid>
            </form>
          ) : (
            <Box>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Execution Settings
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DetailItem>
                        <Typography variant="subtitle2" color="text.secondary">
                          Execution Mode
                        </Typography>
                        <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                          {application?.config?.executionMode?.replace('_', ' ') || 'Sequential'}
                        </Typography>
                      </DetailItem>
                    </Grid>
                    
                    {application?.config?.executionMode === 'parallel' && (
                      <Grid item xs={12} sm={6}>
                        <DetailItem>
                          <Typography variant="subtitle2" color="text.secondary">
                            Maximum Concurrent Runs
                          </Typography>
                          <Typography variant="body1">
                            {application?.config?.maxConcurrentRuns || 1}
                          </Typography>
                        </DetailItem>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Publication Settings
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DetailItem>
                        <Typography variant="subtitle2" color="text.secondary">
                          Auto-publish
                        </Typography>
                        <Typography variant="body1">
                          {application?.config?.autoPublish ? 'Enabled' : 'Disabled'}
                        </Typography>
                      </DetailItem>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <DetailItem>
                        <Typography variant="subtitle2" color="text.secondary">
                          Require Approval
                        </Typography>
                        <Typography variant="body1">
                          {application?.config?.requireApproval ? 'Enabled' : 'Disabled'}
                        </Typography>
                      </DetailItem>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}
        </TabPanel>

        {/* Permissions Tab */}
        <TabPanel hidden={activeTab !== 2}>
          {isEditing ? (
            <form>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <SectionTitle variant="subtitle1">
                    Visibility Settings
                  </SectionTitle>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        id="permissions.visibleToAllUsers"
                        name="permissions.visibleToAllUsers"
                        checked={formik.values.permissions.visibleToAllUsers}
                        onChange={formik.handleChange}
                      />
                    }
                    label="Visible to all users"
                  />
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    If disabled, you can restrict visibility to specific roles
                  </Typography>
                  
                  {!formik.values.permissions.visibleToAllUsers && (
                    <FormControl 
                      fullWidth
                      error={
                        formik.touched.permissions?.specificRoles && 
                        Boolean(formik.errors.permissions?.specificRoles)
                      }
                    >
                      <InputLabel id="specific-roles-label">Visible to Roles</InputLabel>
                      <Select
                        labelId="specific-roles-label"
                        id="permissions.specificRoles"
                        name="permissions.specificRoles"
                        multiple
                        value={formik.values.permissions.specificRoles}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Visible to Roles"
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => {
                              const role = availableRoles.find(r => r.id === value);
                              return (
                                <Chip key={value} label={role ? role.name : value} size="small" />
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
                      {formik.touched.permissions?.specificRoles && formik.errors.permissions?.specificRoles && (
                        <FormHelperText>{formik.errors.permissions.specificRoles}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                </Grid>
              </Grid>
            </form>
          ) : (
            <Box>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Visibility Settings
                  </Typography>
                  
                  <DetailItem>
                    <Typography variant="subtitle2" color="text.secondary">
                      Visible to All Users
                    </Typography>
                    <Typography variant="body1">
                      {application?.permissions?.visibleToAllUsers ? 'Yes' : 'No'}
                    </Typography>
                  </DetailItem>
                  
                  {!application?.permissions?.visibleToAllUsers && (
                    <DetailItem>
                      <Typography variant="subtitle2" color="text.secondary">
                        Visible to Specific Roles
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                        {application?.permissions?.specificRoles && application.permissions.specificRoles.length > 0 ? (
                          application.permissions.specificRoles.map((roleId) => {
                            const role = availableRoles.find(r => r.id === roleId);
                            return (
                              <Chip key={roleId} label={role ? role.name : roleId} size="small" />
                            );
                          })
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No roles specified
                          </Typography>
                        )}
                      </Box>
                    </DetailItem>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}
        </TabPanel>

        {/* Datasets Tab */}
        <TabPanel hidden={activeTab !== 3}>
          <Box>
            <SectionTitle variant="subtitle1">
              Associated Datasets
            </SectionTitle>
            
            {application?.datasets && application.datasets.length > 0 ? (
              <List>
                {application.datasets.map((dataset) => (
                  <ListItem key={dataset.id} divider>
                    <ListItemText
                      primary={dataset.name}
                      secondary={`Type: ${dataset.type} | Last Updated: ${formatDate(dataset.updated_at)}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="view dataset">
                        <VisibilityIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No datasets associated with this application
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                >
                  Add Dataset
                </Button>
              </Paper>
            )}
          </Box>
        </TabPanel>

        {/* History Tab */}
        <TabPanel hidden={activeTab !== 4}>
          <Box>
            <SectionTitle variant="subtitle1">
              Application History
            </SectionTitle>
            
            {application?.history && application.history.length > 0 ? (
              <List>
                {application.history.map((event) => (
                  <ListItem key={event.id} divider>
                    <ListItemText
                      primary={
                        <Typography variant="body1">
                          {event.event_type === 'created' && 'Application Created'}
                          {event.event_type === 'edited' && 'Application Edited'}
                          {event.event_type === 'published' && 'Application Published'}
                          {event.event_type === 'unpublished' && 'Application Unpublished'}
                          {event.event_type === 'deleted' && 'Application Deleted'}
                          {event.event_type === 'restored' && 'Application Restored'}
                          {event.event_type === 'status_changed' && 'Status Changed'}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {formatDate(event.timestamp)}
                          </Typography>
                          {event.user && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              By: {event.user.name}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    {event.status && (
                      <ApplicationStatusBadge status={event.status} />
                    )}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No history available
                </Typography>
              </Paper>
            )}
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <Box>
          {!isEditing && (
            <>
              {application?.status === 'draft' || application?.status === 'inactive' ? (
                <Button
                  startIcon={<PublishIcon />}
                  variant="outlined"
                  color="primary"
                  sx={{ mr: 1 }}
                >
                  Publish
                </Button>
              ) : application?.status === 'active' ? (
                <Button
                  startIcon={<UnpublishedIcon />}
                  variant="outlined"
                  color="warning"
                  sx={{ mr: 1 }}
                >
                  Unpublish
                </Button>
              ) : null}
              
              <Button
                startIcon={<PlayArrowIcon />}
                variant="outlined"
                color="success"
                sx={{ mr: 1 }}
              >
                Run
              </Button>
            </>
          )}
        </Box>
        
        <Box>
          {isEditing ? (
            <>
              <Button
                onClick={() => setIsEditing(false)}
                color="inherit"
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                onClick={formik.handleSubmit}
                variant="contained"
                color="primary"
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              <Button
                startIcon={<EditIcon />}
                variant="contained"
                color="primary"
                onClick={() => setIsEditing(true)}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              <Button
                onClick={handleClose}
              >
                Close
              </Button>
            </>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

ApplicationDetailView.propTypes = {
  /**
   * Whether the dialog is open
   */
  open: PropTypes.bool.isRequired,
  
  /**
   * Callback function called when the dialog is closed
   */
  onClose: PropTypes.func.isRequired,
  
  /**
   * The application object to display
   */
  application: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    type: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
    tenant_id: PropTypes.string,
    config: PropTypes.shape({
      autoPublish: PropTypes.bool,
      requireApproval: PropTypes.bool,
      executionMode: PropTypes.string,
      maxConcurrentRuns: PropTypes.number,
    }),
    permissions: PropTypes.shape({
      visibleToAllUsers: PropTypes.bool,
      specificRoles: PropTypes.arrayOf(PropTypes.string),
    }),
    tags: PropTypes.arrayOf(PropTypes.string),
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        type: PropTypes.string,
        updated_at: PropTypes.string,
      })
    ),
    history: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        event_type: PropTypes.string.isRequired,
        timestamp: PropTypes.string.isRequired,
        status: PropTypes.string,
        user: PropTypes.shape({
          id: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
        }),
      })
    ),
  }),
  
  /**
   * Callback function called when the application is updated
   * @param {Object} applicationData - The updated application data
   * @returns {Promise} Promise resolving when the application is updated
   */
  onUpdate: PropTypes.func.isRequired,
  
  /**
   * The tenant object for which the application belongs to
   */
  tenant: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
};

export default ApplicationDetailView;