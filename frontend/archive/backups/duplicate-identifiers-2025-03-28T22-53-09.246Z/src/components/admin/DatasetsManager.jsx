// DatasetsManager.jsx
import React, { useState, useEffect } from 'react';
import { Box, Grid, Card } from '../../design-system';
import { Typography, Button } from '../../design-system';
import { TextField, Select, Switch } from '../../design-system';
import { Table, Chip } from '../../design-system';
import { Dialog, CircularProgress, Alert } from '../../design-system';
import { Tabs } from '../../design-system';
import { useTheme } from '@design-system/foundations/theme';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  Visibility as VisibilityIcon,
  Code as CodeIcon,
  Schema as SchemaIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  ExpandMore as ExpandMoreIcon,
  Apps as AppsIcon,
  Hub as HubIcon,
  SwapHoriz as IntegrationIcon,
  Apartment as TenantIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import useNotification from '@hooks/useNotification';
import { useResource } from '@contexts/ResourceContext';
import ResourceLoader from '@components/common/ResourceLoader';
import adminService from '@services/adminService';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
// Status chip color mapping
const statusColors = {
  active: 'success',
  draft: 'info',
  inactive: 'warning',
  deprecated: 'error',
};

// Data type display mapping
const dataTypeDisplay = {
  string: 'String',
  number: 'Number',
  integer: 'Integer',
  boolean: 'Boolean',
  date: 'Date',
  datetime: 'DateTime',
  array: 'Array',
  object: 'Object',
  binary: 'Binary',
};

// DatasetsManager component
const DatasetsManager = () => {
  // Added display name
  DatasetsManager.displayName = 'DatasetsManager';

  // Added display name
  DatasetsManager.displayName = 'DatasetsManager';

  // Added display name
  DatasetsManager.displayName = 'DatasetsManager';


  const { showToast, addNotification } = useNotification();

  // Get resource context data
  const {
    datasets,
    applications,
    tenants,
    currentDataset,
    datasetLoading,
    datasetError,
    applicationLoading,
    tenantLoading,
    fetchDatasets,
    fetchApplications,
    fetchTenants,
    fetchDatasetById,
    createDataset: contextCreateDataset,
    updateDataset: contextUpdateDataset,
    deleteDataset: contextDeleteDataset,
    clearCurrentDataset,
  } = useResource();

  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [currentFields, setCurrentFields] = useState([]);
  const [datasetTenants, setDatasetTenants] = useState([]);
  const [tenantUpdateLoading, setTenantUpdateLoading] = useState(false);
  const [newField, setNewField] = useState({
    name: '',
    type: 'string',
    required: false,
    is_primary_key: false,
    description: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    source_application_id: '',
    status: 'draft',
    is_public: false,
  });
  const [datasetRelations, setDatasetRelations] = useState({
    applications: [],
    integrations: [],
  });

  // Load datasets, applications, and tenants
  useEffect(() => {
    fetchDatasets();
    fetchApplications();
    fetchTenants();
  }, [fetchDatasets, fetchApplications, fetchTenants]);

  // Handle search input
  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
  };

  // Filter datasets based on search term
  const filteredDatasets = datasets.filter(
    dataset =>
      dataset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.source_application_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.id?.toString().includes(searchTerm)
  );

  // Handle refresh button
  const handleRefresh = () => {
  // Added display name
  handleRefresh.displayName = 'handleRefresh';

  // Added display name
  handleRefresh.displayName = 'handleRefresh';

  // Added display name
  handleRefresh.displayName = 'handleRefresh';


    fetchDatasets();
    showToast('Datasets refreshed', 'info');
  };

  // Handle dialog open for new dataset
  const handleOpenCreateDialog = () => {
  // Added display name
  handleOpenCreateDialog.displayName = 'handleOpenCreateDialog';

  // Added display name
  handleOpenCreateDialog.displayName = 'handleOpenCreateDialog';

  // Added display name
  handleOpenCreateDialog.displayName = 'handleOpenCreateDialog';


    clearCurrentDataset();
    setFormData({
      name: '',
      description: '',
      source_application_id: '',
      status: 'draft',
      is_public: false,
    });
    setCurrentFields([]);
    setActiveTab(0);
    setOpenDialog(true);
  };

  // Handle dialog open for editing
  const handleOpenEditDialog = dataset => {
    setFormData({
      id: dataset.id,
      name: dataset.name,
      description: dataset.description,
      source_application_id: dataset.source_application_id,
      status: dataset.status,
      is_public: dataset.is_public,
    });
    setCurrentFields(dataset.fields ? [...dataset.fields] : []);
    setActiveTab(0);
    setOpenDialog(true);

    // In a real implementation, fetch relations data
    if (dataset.id) {
      // This would be an API call in production
      // For now use sample data
      setDatasetRelations({
        applications: [
          { id: 1, name: 'Salesforce', description: 'CRM integration' },
          { id: 3, name: 'MySQL Database', description: 'Customer database' },
        ],
        integrations: [
          { id: 1, name: 'Sales to Warehouse ETL', health: 'healthy' },
          { id: 2, name: 'Contact Sync', health: 'warning' },
        ],
      });
    }
  };

  // Handle dialog close
  const handleCloseDialog = () => {
  // Added display name
  handleCloseDialog.displayName = 'handleCloseDialog';

  // Added display name
  handleCloseDialog.displayName = 'handleCloseDialog';

  // Added display name
  handleCloseDialog.displayName = 'handleCloseDialog';


    setOpenDialog(false);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';


    setActiveTab(newValue);
  };

  // Handle input change
  const handleInputChange = e => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle field input change
  const handleFieldInputChange = e => {
    const { name, value, checked, type } = e.target;
    setNewField(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle add field
  const handleAddField = () => {
  // Added display name
  handleAddField.displayName = 'handleAddField';

  // Added display name
  handleAddField.displayName = 'handleAddField';

  // Added display name
  handleAddField.displayName = 'handleAddField';


    if (!newField.name) return;

    setCurrentFields(prev => [...prev, { ...newField }]);
    setNewField({
      name: '',
      type: 'string',
      required: false,
      is_primary_key: false,
      description: '',
    });
  };

  // Handle delete field
  const handleDeleteField = index => {
    setCurrentFields(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission for creating/updating dataset
  const handleSubmit = async () => {
    if (!formData.name) {
      showToast('Dataset name is required', 'error');
      return;
    }

    const datasetData = {
      ...formData,
      fields: currentFields,
    };

    try {
      if (formData.id) {
        // Update existing dataset
        await contextUpdateDataset(formData.id, datasetData);
        showToast('Dataset updated successfully', 'success');
      } else {
        // Create new dataset
        await contextCreateDataset(datasetData);
        showToast('Dataset created successfully', 'success');
        addNotification({
          title: 'New Dataset Created`,
          message: `Dataset "${formData.name}" has been created successfully.`,
          type: `success',
        });
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving dataset:', error);
      showToast('Failed to save dataset', 'error');
    }
  };

  // Handle delete dataset
  const handleDeleteDataset = async id => {
    if (
      !window.confirm('Are you sure you want to delete this dataset? This action cannot be undone.')
    ) {
      return;
    }

    try {
      await contextDeleteDataset(id);
      showToast('Dataset deleted successfully', 'success');

      // If detail dialog is open for this dataset, close it
      if (detailDialogOpen && currentDataset?.id === id) {
        handleCloseDetails();
      }
    } catch (error) {
      console.error('Error deleting dataset:', error);
      showToast('Failed to delete dataset', 'error`);
    }
  };

  // Handle opening dataset detail dialog
  const handleOpenDetails = async dataset => {
    await fetchDatasetById(dataset.id);
    setDetailDialogOpen(true);
    fetchDatasetTenants(dataset.id);
  };

  // Fetch dataset tenants
  const fetchDatasetTenants = async datasetId => {
    setTenantUpdateLoading(true);
    try {
      // In a real application, this would fetch tenants that have access to this dataset
      // For now, simulate with sample data

      // For each tenant, check if they have access to this dataset
      const tenantsWithAccess = [];
      for (const tenant of tenants) {
        try {
          const tenantDatasets = await adminService.getTenantDatasets(tenant.id);
          if (tenantDatasets.some(ds => ds.id === datasetId)) {
            tenantsWithAccess.push(tenant);
          }
        } catch (error) {
          console.error(`Error checking tenant ${tenant.id} datasets:`, error);
        }
      }

      setDatasetTenants(tenantsWithAccess);
    } catch (error) {
      console.error(`Error fetching dataset tenants:', error);
      showToast('Failed to load tenant information', 'error');
    } finally {
      setTenantUpdateLoading(false);
    }
  };

  // Close dataset detail dialog
  const handleCloseDetails = () => {
  // Added display name
  handleCloseDetails.displayName = 'handleCloseDetails';

  // Added display name
  handleCloseDetails.displayName = 'handleCloseDetails';

  // Added display name
  handleCloseDetails.displayName = 'handleCloseDetails`;


    setDetailDialogOpen(false);
    clearCurrentDataset();
  };

  // Handle tenant access toggle
  const handleToggleTenantAssociation = async (tenant, hasAccess) => {
    if (!currentDataset) return;

    setTenantUpdateLoading(true);
    try {
      if (hasAccess) {
        // Remove dataset from tenant
        await adminService.removeDatasetFromTenant(tenant.id, currentDataset.id);
        setDatasetTenants(prev => prev.filter(t => t.id !== tenant.id));
        showToast(`Removed dataset access from tenant `${tenant.name}`, `info`);
      } else {
        // Add dataset to tenant
        await adminService.addDatasetToTenant(tenant.id, currentDataset.id);
        setDatasetTenants(prev => [...prev, tenant]);
        showToast(`Granted dataset access to tenant `${tenant.name}`, `success');
      }
    } catch (error) {
      console.error('Error updating tenant association:', error);
      showToast('Failed to update tenant access', 'error');
    } finally {
      setTenantUpdateLoading(false);
    }
  };

  const { theme } = useTheme();
  
  return (
    <Box>
      {/* Header with actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Manage Datasets</Typography>

        <Box display="flex" style={{ gap: '16px' }}>
          <Button variant="outlined" onClick={handleRefresh}>
            <Box as="span" display="flex" alignItems="center">
              <RefreshIcon style={{ marginRight: '8px' }} />
              Refresh
            </Box>
          </Button>

          <Button variant="contained" onClick={handleOpenCreateDialog}>
            <Box as="span" display="flex" alignItems="center">
              <AddIcon style={{ marginRight: '8px' }} />
              New Dataset
            </Box>
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search datasets..."
        value={searchTerm}
        onChange={handleSearchChange}
        style={{ marginBottom: '24px' }}
        startAdornment={<SearchIcon />}
      />

      {/* Datasets table */}
      <ResourceLoader
        loading={datasetLoading}
        error={datasetError}
        isEmpty={filteredDatasets.length === 0}
        emptyMessage="No datasets found"
        onRetry={fetchDatasets}
        useSkeleton={true}
        skeletonCount={3}
      >
        <Card>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Cell>Name</Table.Cell>
                <Table.Cell>Source Application</Table.Cell>
                <Table.Cell>Fields</Table.Cell>
                <Table.Cell>Status</Table.Cell>
                <Table.Cell>Visibility</Table.Cell>
                <Table.Cell>Created</Table.Cell>
                <Table.Cell align="right">Actions</Table.Cell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredDatasets.map(dataset => (
                <Table.Row key={dataset.id}>
                  <Table.Cell>
                    <Box display="flex" alignItems="center">
                      <StorageIcon style={{ marginRight: '8px', color: theme?.colors?.secondary?.main || '#9c27b0' }} />
                      <Typography variant="body1">{dataset.name}</Typography>
                    </Box>
                  </Table.Cell>
                  <Table.Cell>{dataset.source_application_name}</Table.Cell>
                  <Table.Cell>{dataset.fields?.length || 0}</Table.Cell>
                  <Table.Cell>
                    <Chip
                      label={dataset.status?.charAt(0).toUpperCase() + dataset.status?.slice(1)}
                      color={statusColors[dataset.status] || 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </Table.Cell>
                  <Table.Cell>
                    {dataset.is_public ? (
                      <Chip label="Public" size="small" color="success" />
                    ) : (
                      <Chip label="Private" size="small" color="default" />
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {dataset.created_at ? new Date(dataset.created_at).toLocaleDateString() : 'N/A'}
                  </Table.Cell>
                  <Table.Cell align="right">
                    <Box display="flex" justifyContent="flex-end">
                      <Box
                        as="button"
                        aria-label="View Details"
                        title="View Details"
                        onClick={() => handleOpenDetails(dataset)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '4px',
                          margin: '0 4px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <VisibilityIcon style={{ fontSize: '20px' }} />
                      </Box>
                      <Box
                        as="button"
                        aria-label="View Schema"
                        title="View Schema"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '4px',
                          margin: '0 4px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <SchemaIcon style={{ fontSize: '20px' }} />
                      </Box>
                      <Box
                        as="button"
                        aria-label="Edit"
                        title="Edit"
                        onClick={() => handleOpenEditDialog(dataset)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '4px',
                          margin: '0 4px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <EditIcon style={{ fontSize: '20px' }} />
                      </Box>
                      <Box
                        as="button"
                        aria-label="Delete"
                        title="Delete"
                        onClick={() => handleDeleteDataset(dataset.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '4px',
                          margin: '0 4px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: theme?.colors?.error?.main || '#d32f2f'
                        }}
                      >
                        <DeleteIcon style={{ fontSize: '20px' }} />
                      </Box>
                    </Box>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      </ResourceLoader>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        size="lg"
        title={formData.id ? 'Edit Dataset' : 'Create New Dataset'}
        actions={
          <>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSubmit}
            >
              <Box as="span" display="flex" alignItems="center">
                <SaveIcon style={{ marginRight: '8px' }} />
                {formData.id ? 'Update Dataset' : 'Create Dataset'}
              </Box>
            </Button>
          </>
        }
      >
        <Box borderBottom="1px solid" borderColor="divider" mb={3}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
          >
            <Tabs.Tab icon={<StorageIcon style={{ marginRight: '8px' }} />} label="Basic Info" />
            <Tabs.Tab icon={<SchemaIcon style={{ marginRight: '8px' }} />} label="Fields" />
            <Tabs.Tab icon={<CodeIcon style={{ marginRight: '8px' }} />} label="Sample Data" />
          </Tabs>
        </Box>

        {/* Basic Info Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box mb={2}>
                <Typography variant="subtitle2" component="label" htmlFor="dataset-name" gutterBottom>
                  Dataset Name *
                </Typography>
                <TextField
                  id="dataset-name"
                  name="name"
                  fullWidth
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box mb={2}>
                <Typography variant="subtitle2" component="label" htmlFor="dataset-description" gutterBottom>
                  Description
                </Typography>
                <TextField
                  id="dataset-description"
                  name="description"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.description || ''}
                  onChange={handleInputChange}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box mb={2}>
                <Typography variant="subtitle2" component="label" htmlFor="source-application" gutterBottom>
                  Source Application
                </Typography>
                <Select
                  id="source-application"
                  name="source_application_id"
                  fullWidth
                  value={formData.source_application_id || ''}
                  onChange={handleInputChange}
                >
                  {applications.map(app => (
                    <Select.Option key={app.id} value={app.id}>
                      {app.name}
                    </Select.Option>
                  ))}
                </Select>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box mb={2}>
                <Typography variant="subtitle2" component="label" htmlFor="dataset-status" gutterBottom>
                  Status
                </Typography>
                <Select
                  id="dataset-status"
                  name="status"
                  fullWidth
                  value={formData.status || 'draft'}
                  onChange={handleInputChange}
                >
                  <Select.Option value="draft">Draft</Select.Option>
                  <Select.Option value="active">Active</Select.Option>
                  <Select.Option value="inactive">Inactive</Select.Option>
                  <Select.Option value="deprecated">Deprecated</Select.Option>
                </Select>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box mb={2} display="flex" alignItems="center">
                <Switch
                  name="is_public"
                  checked={formData.is_public || false}
                  onChange={handleInputChange}
                />
                <Box ml={1}>
                  <Typography variant="body2">
                    Make this dataset available to all tenants
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    When enabled, all tenants can access this dataset without explicit association
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                {formData.id
                  ? 'Updating a dataset might affect existing integrations. Make sure to test thoroughly before deploying to production.'
                  : 'New datasets need to be included in a release before they are available to tenants.'}
              </Alert>
            </Grid>
          </Grid>
        )}

          {/* Fields Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Fields
              </Typography>

              <Card style={{ marginBottom: '24px' }}>
                <Table>
                  <Table.Head>
                    <Table.Row>
                      <Table.Cell>Name</Table.Cell>
                      <Table.Cell>Type</Table.Cell>
                      <Table.Cell>Required</Table.Cell>
                      <Table.Cell>Primary Key</Table.Cell>
                      <Table.Cell>Actions</Table.Cell>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {currentFields.length === 0 ? (
                      <Table.Row>
                        <Table.Cell colSpan={5} align="center">
                          No fields defined. Add fields below.
                        </Table.Cell>
                      </Table.Row>
                    ) : (
                      currentFields.map((field, index) => (
                        <Table.Row key={index}>
                          <Table.Cell>{field.name}</Table.Cell>
                          <Table.Cell>{dataTypeDisplay[field.type] || field.type}</Table.Cell>
                          <Table.Cell>
                            {field.required ? (
                              <Chip label="Required" size="small" color="primary" />
                            ) : (
                              <Chip label="Optional" size="small" variant="outlined" />
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {field.is_primary_key ? (
                              <Chip label="Primary Key" size="small" color="secondary" />
                            ) : (
                              <Typography variant="body2">—</Typography>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            <Box
                              as="button"
                              aria-label="Delete field"
                              title="Delete field"
                              onClick={() => handleDeleteField(index)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                padding: '4px',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: theme?.colors?.error?.main || '#d32f2f'
                              }}
                            >
                              <DeleteIcon style={{ fontSize: '20px' }} />
                            </Box>
                          </Table.Cell>
                        </Table.Row>
                      ))
                    )}
                  </Table.Body>
                </Table>
              </Card>

              <Typography variant="subtitle1" gutterBottom>Add New Field</Typography>
              <Grid container spacing={2} style={{ marginTop: '8px' }}>
                <Grid item xs={12} sm={3}>
                  <Box mb={2}>
                    <Typography variant="subtitle2" component="label" htmlFor="field-name" gutterBottom>
                      Field Name *
                    </Typography>
                    <TextField
                      id="field-name"
                      name="name"
                      fullWidth
                      value={newField.name}
                      onChange={handleFieldInputChange}
                      required
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box mb={2}>
                    <Typography variant="subtitle2" component="label" htmlFor="field-type" gutterBottom>
                      Type
                    </Typography>
                    <Select
                      id="field-type"
                      name="type"
                      fullWidth
                      value={newField.type}
                      onChange={handleFieldInputChange}
                      size="small"
                    >
                      <Select.Option value="string">String</Select.Option>
                      <Select.Option value="number">Number</Select.Option>
                      <Select.Option value="integer">Integer</Select.Option>
                      <Select.Option value="boolean">Boolean</Select.Option>
                      <Select.Option value="date">Date</Select.Option>
                      <Select.Option value="datetime">DateTime</Select.Option>
                      <Select.Option value="array">Array</Select.Option>
                      <Select.Option value="object">Object</Select.Option>
                    </Select>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box mb={2} display="flex" alignItems="center">
                    <Switch
                      name="required"
                      checked={newField.required}
                      onChange={handleFieldInputChange}
                      size="small"
                    />
                    <Typography variant="body2" style={{ marginLeft: '8px' }}>
                      Required
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box mb={2} display="flex" alignItems="center">
                    <Switch
                      name="is_primary_key"
                      checked={newField.is_primary_key}
                      onChange={handleFieldInputChange}
                      size="small"
                    />
                    <Typography variant="body2" style={{ marginLeft: '8px' }}>
                      Primary Key
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box mb={2}>
                    <Typography variant="subtitle2" component="label" htmlFor="field-description" gutterBottom>
                      Description
                    </Typography>
                    <TextField
                      id="field-description"
                      name="description"
                      fullWidth
                      size="small"
                      value={newField.description}
                      onChange={handleFieldInputChange}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    onClick={handleAddField}
                    disabled={!newField.name}
                  >
                    <Box as="span" display="flex" alignItems="center">
                      <AddIcon style={{ marginRight: '8px' }} />
                      Add Field
                    </Box>
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Sample Data Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Sample Data
              </Typography>
              <Alert severity="info" style={{ marginBottom: '16px' }}>
                <Typography variant="body2">
                  Provide sample data to help users understand the structure and format of this
                  dataset.
                </Typography>
              </Alert>
              <TextField
                fullWidth
                multiline
                rows={10}
                placeholder='[
  {
    "id": "sample-id-1",
    "name": "Sample Name",
    "created_at": "2025-01-15T12:00:00Z"
  }
]'
                style={{ fontFamily: 'monospace' }}
              />
            </Box>
          )}
      </Dialog>

      {/* Dataset Detail Dialog */}
      {currentDataset && (
        <Dialog 
          open={detailDialogOpen} 
          onClose={handleCloseDetails} 
          size="lg"
          title={
            <Box display="flex" alignItems="center">
              <Box display="flex" alignItems="center">
                <StorageIcon style={{ marginRight: '8px', color: theme?.colors?.secondary?.main || '#9c27b0' }} />
                <Typography variant="h6">{currentDataset.name}</Typography>
                <Chip
                  label={currentDataset.status?.charAt(0).toUpperCase() + currentDataset.status?.slice(1)}
                  color={statusColors[currentDataset.status] || 'default'}
                  size="small"
                  variant="outlined"
                  style={{ marginLeft: '16px' }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" style={{ marginTop: '4px' }}>
                {currentDataset.source_application_name} (ID: {currentDataset.id})
              </Typography>
            </Box>
          }
          actions={
            <Button onClick={handleCloseDetails}>Close</Button>
          }
        >
          <Box borderBottom="1px solid" borderColor="divider" mb={3}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
            >
              <Tabs.Tab icon={<StorageIcon style={{ marginRight: '8px' }} />} label="Details" />
              <Tabs.Tab icon={<SchemaIcon style={{ marginRight: '8px' }} />} label="Schema" />
              <Tabs.Tab icon={<AppsIcon style={{ marginRight: '8px' }} />} label="Used By" />
              <Tabs.Tab icon={<TenantIcon style={{ marginRight: '8px' }} />} label="Tenants" />
            </Tabs>
          </Box>

          {/* Details Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2">
                  {currentDataset.description || 'No description provided'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Source Application
                </Typography>
                <Typography variant="body2">
                  {currentDataset.source_application_name || 'Unknown'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Public
                </Typography>
                <Typography variant="body2">{currentDataset.is_public ? 'Yes' : 'No'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Created
                </Typography>
                <Typography variant="body2">
                  {currentDataset.created_at
                    ? new Date(currentDataset.created_at).toLocaleString()
                    : 'Unknown'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Field Count
                </Typography>
                <Typography variant="body2">
                  {currentDataset.fields?.length || 0} fields
                </Typography>
              </Grid>
              <Grid item xs={12} style={{ marginTop: '16px' }}>
                <Box display="flex" style={{ gap: '16px' }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      handleOpenEditDialog(currentDataset);
                      handleCloseDetails();
                    }}
                  >
                    <Box as="span" display="flex" alignItems="center">
                      <EditIcon style={{ marginRight: '8px' }} />
                      Edit Dataset
                    </Box>
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      handleDeleteDataset(currentDataset.id);
                      handleCloseDetails();
                    }}
                  >
                    <Box as="span" display="flex" alignItems="center">
                      <DeleteIcon style={{ marginRight: '8px' }} />
                      Delete Dataset
                    </Box>
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}

          {/* Schema Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Dataset Schema
              </Typography>

              <Card style={{ marginBottom: '24px' }}>
                <Table>
                  <Table.Head>
                    <Table.Row>
                      <Table.Cell>Field Name</Table.Cell>
                      <Table.Cell>Type</Table.Cell>
                      <Table.Cell>Required</Table.Cell>
                      <Table.Cell>Primary Key</Table.Cell>
                      <Table.Cell>Description</Table.Cell>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {!currentDataset.fields?.length ? (
                      <Table.Row>
                        <Table.Cell colSpan={5} align="center">
                          No fields defined for this dataset.
                        </Table.Cell>
                      </Table.Row>
                    ) : (
                      currentDataset.fields.map((field, index) => (
                        <Table.Row key={index}>
                          <Table.Cell>{field.name}</Table.Cell>
                          <Table.Cell>{dataTypeDisplay[field.type] || field.type}</Table.Cell>
                          <Table.Cell>
                            {field.required ? (
                              <Chip label="Required" size="small" color="primary" />
                            ) : (
                              <Chip label="Optional" size="small" variant="outlined" />
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {field.is_primary_key ? (
                              <Chip label="Primary Key" size="small" color="secondary" />
                            ) : (
                              <Typography variant="body2">—</Typography>
                            )}
                          </Table.Cell>
                          <Table.Cell>{field.description || '—'}</Table.Cell>
                        </Table.Row>
                      ))
                    )}
                  </Table.Body>
                </Table>
              </Card>
            </Box>
          )}

          {/* Used By Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Applications Using This Dataset
              </Typography>

              <Card style={{ marginBottom: '16px' }}>
                <Box padding="16px">
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="space-between"
                    style={{ 
                      padding: '8px 16px`, 
                      borderBottom: `1px solid ${theme?.colors?.divider || '#e0e0e0'}`
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1">
                        <strong>Applications</strong> ({datasetRelations.applications?.length || 0})
                      </Typography>
                    </Box>
                    <Box
                      as="button"
                      aria-label="Expand"
                      title="Expand"
                      style={{
                        background: `transparent',
                        border: 'none',
                        padding: '4px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <ExpandMoreIcon style={{ fontSize: '20px' }} />
                    </Box>
                  </Box>
                  
                  <Box padding="16px">
                    {!datasetRelations.applications?.length ? (
                      <Typography variant="body2" color="text.secondary">
                        No applications are using this dataset.
                      </Typography>
                    ) : (
                      datasetRelations.applications.map(app => (
                        <Box 
                          key={app.id} 
                          display="flex" 
                          alignItems="center" 
                          style={{ 
                            padding: '12px 8px`, 
                            borderBottom: `1px solid ${theme?.colors?.divider || '#e0e0e0'}`
                          }}
                        >
                          <Box 
                            style={{ 
                              marginRight: `16px',
                              color: theme?.colors?.primary?.main || '#1976d2'
                            }}
                          >
                            <AppsIcon />
                          </Box>
                          <Box>
                            <Typography variant="body1">{app.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{app.description}</Typography>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>
              </Card>

              <Card>
                <Box padding="16px">
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="space-between"
                    style={{ 
                      padding: '8px 16px`, 
                      borderBottom: `1px solid ${theme?.colors?.divider || '#e0e0e0'}`
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1">
                        <strong>Integrations</strong> ({datasetRelations.integrations?.length || 0})
                      </Typography>
                    </Box>
                    <Box
                      as="button"
                      aria-label="Expand"
                      title="Expand"
                      style={{
                        background: `transparent',
                        border: 'none',
                        padding: '4px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <ExpandMoreIcon style={{ fontSize: '20px' }} />
                    </Box>
                  </Box>
                  
                  <Box padding="16px">
                    {!datasetRelations.integrations?.length ? (
                      <Typography variant="body2" color="text.secondary">
                        No integrations are using this dataset.
                      </Typography>
                    ) : (
                      datasetRelations.integrations.map(integration => (
                        <Box 
                          key={integration.id} 
                          display="flex" 
                          alignItems="center" 
                          style={{ 
                            padding: '12px 8px`, 
                            borderBottom: `1px solid ${theme?.colors?.divider || '#e0e0e0'}`
                          }}
                        >
                          <Box 
                            style={{ 
                              marginRight: `16px',
                              color: theme?.colors?.secondary?.main || '#9c27b0'
                            }}
                          >
                            <IntegrationIcon />
                          </Box>
                          <Box>
                            <Typography variant="body1">{integration.name}</Typography>
                            <Typography variant="body2" color="text.secondary">Health: {integration.health}</Typography>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>
              </Card>
            </Box>
          )}

          {/* Tenants Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Manage tenant access to this dataset
              </Typography>
              <Alert severity="info" style={{ marginBottom: '16px' }}>
                <Typography variant="body2">
                  Control which tenants have access to this dataset. Note that public datasets are
                  accessible to all tenants regardless of these settings.
                </Typography>
              </Alert>

              <ResourceLoader
                loading={tenantUpdateLoading}
                error={null}
                isEmpty={tenants.length === 0}
                emptyMessage="No tenants available"
              >
                <Card>
                  {tenants.map((tenant, index) => {
                    const hasAccess = datasetTenants.some(t => t.id === tenant.id);

                    return (
                      <Box key={tenant.id}>
                        {index > 0 && <Box 
                          style={{
                            height: '1px',
                            backgroundColor: theme?.colors?.divider || '#e0e0e0',
                            margin: '0 16px'
                          }}
                        />}
                        <Box 
                          display="flex" 
                          alignItems="center" 
                          justifyContent="space-between"
                          padding="16px"
                        >
                          <Box display="flex" alignItems="center">
                            <Box 
                              style={{ 
                                marginRight: '16px',
                                color: hasAccess 
                                  ? (theme?.colors?.primary?.main || '#1976d2') 
                                  : (theme?.colors?.text?.secondary || '#666')
                              }}
                            >
                              <TenantIcon />
                            </Box>
                            <Box>
                              <Typography variant="body1">{tenant.name}</Typography>
                              <Typography variant="body2" color="text.secondary">{tenant.identifier}</Typography>
                            </Box>
                          </Box>
                          <Box
                            as="button"
                            aria-label={hasAccess ? 'Remove Access' : 'Grant Access'}
                            title={hasAccess ? 'Remove Access' : 'Grant Access'}
                            onClick={() => handleToggleTenantAssociation(tenant, hasAccess)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              padding: '8px',
                              cursor: 'pointer',
                              borderRadius: '50%',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: hasAccess 
                                ? (theme?.colors?.error?.main || '#d32f2f')
                                : (theme?.colors?.success?.main || '#2e7d32')
                            }}
                          >
                            {hasAccess ? <LinkOffIcon /> : <LinkIcon />}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Card>
              </ResourceLoader>
            </Box>
          )}
        </Dialog>
      )}
    </Box>
  );
};

export default DatasetsManager;