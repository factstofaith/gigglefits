// TenantsManager.jsx
import React, { useState, useEffect } from 'react';
import { Box } from '../../design-system';
import { Typography, Button } from '../../design-system';
import { TextField, Select } from '../../design-system';
import { Table } from '../../design-system';
import { Chip } from '../../design-system';
import { Dialog, CircularProgress, Alert } from '../../design-system';
import { Card } from '../../design-system';
import { Tabs } from '../../design-system';
import { useTheme } from '@design-system/foundations/theme';
import { Paper, TableBody, TableCell, TableContainer, TableHead, TableRow, InputAdornment, DialogTitle, DialogContent, DialogActions, Grid, Tooltip, Tab, CardContent, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, Divider } from '../../design-system';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Business as TenantIcon,
  Visibility as VisibilityIcon,
  Apps as AppsIcon,
  Storage as StorageIcon,
  Add as AddIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  Check as CheckIcon,
  DateRange as DateIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import useNotification from '@hooks/useNotification';
import { useResource } from '@contexts/ResourceContext';
import ResourceLoader from '@components/common/ResourceLoader';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
// Status chip color mapping
const statusColors = {
  active: 'success',
  trial: 'info',
  inactive: 'error',
};

// Create Tenant Dialog Component
const CreateTenantDialog = ({ open, onClose, onSave }) => {
  // Added display name
  CreateTenantDialog.displayName = 'CreateTenantDialog';

  // Added display name
  CreateTenantDialog.displayName = 'CreateTenantDialog';

  // Added display name
  CreateTenantDialog.displayName = 'CreateTenantDialog';


  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    admin_contact: '',
    status: 'active',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.domain) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error creating tenant:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle style={{ padding: '16px 24px' }}>Create New Tenant</DialogTitle>
      <DialogContent style={{ padding: '16px 24px' }}>
        <Grid container spacing={2} style={{ marginTop: '8px' }}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Tenant Name"
              fullWidth
              required
              value={formData.name}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="domain"
              label="Domain"
              fullWidth
              required
              value={formData.domain}
              onChange={handleInputChange}
              placeholder="example.com"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="admin_contact"
              label="Admin Contact Email"
              fullWidth
              value={formData.admin_contact}
              onChange={handleInputChange}
              placeholder="admin@example.com"
            />
          </Grid>
          <Grid item xs={12}>
            <Select
              name="status"
              label="Status"
              fullWidth
              value={formData.status}
              onChange={handleInputChange}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'trial', label: 'Trial' },
                { value: 'inactive', label: 'Inactive' }
              ]}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions style={{ padding: '16px 24px', justifyContent: 'flex-end' }}>
        <Button 
          onClick={onClose} 
          disabled={isSubmitting}
          variant="secondary"
          style={{ marginRight: '8px' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="primary"
          disabled={isSubmitting || !formData.name || !formData.domain}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={16} />
              Creating...
            </>
          ) : (
            <>
              <AddIcon fontSize="small" />
              Create Tenant
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// TenantsManager component
const TenantsManager = () => {
  // Added display name
  TenantsManager.displayName = 'TenantsManager';

  // Added display name
  TenantsManager.displayName = 'TenantsManager';

  // Added display name
  TenantsManager.displayName = 'TenantsManager';


  const { showToast, addNotification } = useNotification();
  const {
    tenants,
    applications,
    datasets,
    tenantLoading,
    tenantError,
    currentTenant,
    tenantResourcesLoading,
    tenantResourcesError,
    fetchTenants,
    fetchApplications,
    fetchDatasets,
    fetchTenantResources,
    createTenant,
    toggleApplication,
    toggleDataset,
    clearCurrentTenant,
  } = useResource();

  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Load resources
  useEffect(() => {
    fetchTenants();
    fetchApplications();
    fetchDatasets();
  }, [fetchTenants, fetchApplications, fetchDatasets]);

  // Handle search input
  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
  };

  // Filter tenants based on search term
  const filteredTenants = tenants.filter(
    tenant =>
      tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.id?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle dialog open for tenant details
  const handleOpenTenantDetails = async tenant => {
    setActiveTab(0);
    setOpenDialog(true);

    // Fetch applications and datasets for this tenant
    fetchTenantResources(tenant.id);
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
    clearCurrentTenant();
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

  // Handle refresh
  const handleRefresh = () => {
  // Added display name
  handleRefresh.displayName = 'handleRefresh';

  // Added display name
  handleRefresh.displayName = 'handleRefresh';

  // Added display name
  handleRefresh.displayName = 'handleRefresh';


    fetchTenants();
    showToast('Tenants refreshed', 'info');
  };

  // Handle application toggle for tenant
  const handleToggleApplication = async (tenantId, applicationId, hasAccess) => {
    try {
      await toggleApplication(tenantId, applicationId, hasAccess);
      showToast(
        hasAccess ? 'Application removed from tenant' : 'Application added to tenant',
        hasAccess ? 'info' : 'success'
      );
    } catch (error) {
      console.error('Error toggling application access:', error);
      showToast('Failed to update application access', 'error');
    }
  };

  // Handle dataset toggle for tenant
  const handleToggleDataset = async (tenantId, datasetId, hasAccess) => {
    try {
      await toggleDataset(tenantId, datasetId, hasAccess);
      showToast(
        hasAccess ? 'Dataset removed from tenant' : 'Dataset added to tenant',
        hasAccess ? 'info' : 'success'
      );
    } catch (error) {
      console.error('Error toggling dataset access:', error);
      showToast('Failed to update dataset access', 'error');
    }
  };

  // Handle create tenant
  const handleCreateTenant = async tenantData => {
    try {
      const newTenant = await createTenant(tenantData);
      showToast('Tenant created successfully', 'success');
      addNotification({
        title: 'New Tenant Created',
        message: `Tenant "${tenantData.name}" has been created successfully.`,
        type: 'success',
      });
      return newTenant;
    } catch (error) {
      console.error('Error creating tenant:', error);
      showToast('Failed to create tenant', 'error');
      throw error;
    }
  };

  const { theme } = useTheme();

  return (
    <Box>
      {/* Header with actions */}
      <Box 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px' 
        }}
      >
        <Typography variant="heading2">Manage Tenants</Typography>

        <Box style={{ display: 'flex', gap: '16px' }}>
          <Button 
            variant="secondary" 
            onClick={handleRefresh}
            style={{
              display: 'flex', 
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RefreshIcon fontSize="small" />
            Refresh
          </Button>

          <Button
            variant="primary"
            onClick={() => setCreateDialogOpen(true)}
            style={{
              display: 'flex', 
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AddIcon fontSize="small" />
            New Tenant
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search tenants..."
        value={searchTerm}
        onChange={handleSearchChange}
        style={{ marginBottom: '24px' }}
        startAdornment={<SearchIcon />}
      />

      {/* Tenants table */}
      <ResourceLoader
        loading={tenantLoading}
        error={tenantError}
        isEmpty={filteredTenants.length === 0}
        emptyMessage="No tenants found"
        onRetry={fetchTenants}
        useSkeleton={true}
        skeletonCount={3}
      >
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Domain</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTenants.map(tenant => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <Box 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center' 
                      }}
                    >
                      <TenantIcon 
                        style={{ 
                          marginRight: '8px', 
                          color: theme?.colors?.primary?.main || '#1976d2'
                        }}
                      />
                      <Typography variant="body1">{tenant.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{tenant.domain}</TableCell>
                  <TableCell>
                    <Chip
                      label={tenant.status?.charAt(0).toUpperCase() + tenant.status?.slice(1)}
                      color={statusColors[tenant.status] || 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    <Box 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end' 
                      }}
                    >
                      <Tooltip title="View Details">
                        <Box
                          as="button"
                          onClick={() => handleOpenTenantDetails(tenant)}
                          aria-label="View tenant details"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: 'none',
                            padding: '4px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginLeft: '4px'
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </Box>
                      </Tooltip>
                      <Tooltip title="Edit Tenant">
                        <Box
                          as="button"
                          onClick={() => {
                            /* TODO: Implement edit tenant */
                          }}
                          aria-label="Edit tenant"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: 'none',
                            padding: '4px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginLeft: '4px'
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </Box>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ResourceLoader>

      {/* Tenant Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {currentTenant && (
          <>
            <DialogTitle style={{ paddingBottom: '8px' }}>
              <Box 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center' 
                }}
              >
                <TenantIcon 
                  style={{ 
                    marginRight: '8px', 
                    color: theme?.colors?.primary?.main || '#1976d2' 
                  }} 
                />
                <Typography variant="heading3">{currentTenant.name}</Typography>
                <Chip
                  label={
                    currentTenant.status?.charAt(0).toUpperCase() + currentTenant.status?.slice(1)
                  }
                  color={statusColors[currentTenant.status] || 'default'}
                  size="small"
                  variant="outlined"
                  style={{ marginLeft: '16px' }}
                />
              </Box>
              <Typography 
                variant="body2" 
                style={{ 
                  color: theme?.colors?.text?.secondary || '#666666'
                }}
              >
                {currentTenant.domain} (ID: {currentTenant.id})
              </Typography>
            </DialogTitle>

            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              style={{ 
                borderBottom: `1px solid ${theme?.colors?.divider || '#e0e0e0'}`
              }}
            >
              <Tabs.Tab icon={<TenantIcon />} label="Details" />
              <Tabs.Tab icon={<AppsIcon />} label="Applications" />
              <Tabs.Tab icon={<StorageIcon />} label="Datasets" />
            </Tabs>

            <DialogContent style={{ padding: '16px 24px' }}>
              <ResourceLoader
                loading={tenantResourcesLoading}
                error={tenantResourcesError}
                onRetry={() => fetchTenantResources(currentTenant.id)}
              >
                {/* Details Tab */}
                {activeTab === 0 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Card style={{ border: `1px solid ${theme?.colors?.divider || '#e0e0e0'}` }}>
                        <CardContent>
                          <Typography variant="heading3" style={{ marginBottom: '16px' }}>
                            Tenant Information
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography 
                                variant="body2" 
                                style={{ 
                                  color: theme?.colors?.text?.secondary || '#666666',
                                  marginBottom: '4px'
                                }}
                              >
                                Admin Contact
                              </Typography>
                              <Typography variant="body1">
                                {currentTenant.admin_contact || 'Not specified'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography 
                                variant="body2" 
                                style={{ 
                                  color: theme?.colors?.text?.secondary || '#666666',
                                  marginBottom: '4px'
                                }}
                              >
                                Created
                              </Typography>
                              <Box style={{ display: 'flex', alignItems: 'center' }}>
                                <DateIcon
                                  fontSize="small"
                                  style={{ 
                                    marginRight: '4px', 
                                    color: theme?.colors?.text?.secondary || '#666666' 
                                  }}
                                />
                                <Typography variant="body1">
                                  {currentTenant.created_at
                                    ? new Date(currentTenant.created_at).toLocaleDateString()
                                    : 'N/A'}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography 
                                variant="body2" 
                                style={{ 
                                  color: theme?.colors?.text?.secondary || '#666666',
                                  marginBottom: '4px'
                                }}
                              >
                                Applications / Datasets
                              </Typography>
                              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Chip
                                  icon={<AppsIcon />}
                                  label={currentTenant.applications?.length || 0}
                                  size="small"
                                  color="primary"
                                />
                                <Chip
                                  icon={<StorageIcon />}
                                  label={currentTenant.datasets?.length || 0}
                                  size="small"
                                  color="secondary"
                                />
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12}>
                      <Alert severity="info">
                        <Typography variant="body2">
                          <strong>Note:</strong> Changes to tenant applications and datasets access
                          should be done through proper releases whenever possible to ensure
                          consistency.
                        </Typography>
                      </Alert>
                    </Grid>
                  </Grid>
                )}

                {/* Applications Tab */}
                {activeTab === 1 && (
                  <Box>
                    <Typography variant="subtitle1" style={{ marginBottom: '16px' }}>
                      Manage application access for this tenant
                    </Typography>

                    <List>
                      <Divider />
                      {applications.map(app => {
                        const hasAccess = currentTenant.applications?.some(a => a.id === app.id);
                        const primaryColor = theme?.colors?.primary?.main || '#1976d2';
                        const actionColor = theme?.colors?.text?.disabled || '#9e9e9e';

                        return (
                          <React.Fragment key={app.id}>
                            <ListItem>
                              <ListItemIcon>
                                <AppsIcon style={{ color: hasAccess ? primaryColor : actionColor }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={app.name}
                                secondary={
                                  <Box>
                                    <Chip
                                      label={app.status}
                                      size="small"
                                      color={statusColors[app.status] || 'default'}
                                      variant="outlined"
                                      style={{ marginRight: '8px' }}
                                    />
                                    {hasAccess && (
                                      <Chip
                                        icon={<CheckIcon />}
                                        label="Access Granted"
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                      />
                                    )}
                                  </Box>
                                }
                              />
                              <ListItemSecondaryAction>
                                <Tooltip title={hasAccess ? 'Remove Access' : 'Grant Access'}>
                                  <Box
                                    as="button"
                                    onClick={() => handleToggleApplication(currentTenant.id, app.id, hasAccess)}
                                    aria-label={hasAccess ? 'Remove application access' : 'Grant application access'}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      background: 'transparent',
                                      border: 'none',
                                      padding: '8px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      color: hasAccess ? 
                                        (theme?.colors?.error?.main || '#f44336') : 
                                        (theme?.colors?.success?.main || '#4caf50')
                                    }}
                                  >
                                    {hasAccess ? <LinkOffIcon /> : <LinkIcon />}
                                  </Box>
                                </Tooltip>
                              </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                          </React.Fragment>
                        );
                      })}
                    </List>

                    <Alert 
                      severity="warning" 
                      style={{ marginTop: '24px' }}
                    >
                      <Typography variant="body2">
                        <strong>Warning:</strong> Directly managing tenant application access
                        bypasses the release process. Consider using releases for better tracking
                        and auditability.
                      </Typography>
                    </Alert>
                  </Box>
                )}

                {/* Datasets Tab */}
                {activeTab === 2 && (
                  <Box>
                    <Typography variant="subtitle1" style={{ marginBottom: '16px' }}>
                      Manage dataset access for this tenant
                    </Typography>

                    <List>
                      <Divider />
                      {datasets.map(dataset => {
                        const hasAccess = currentTenant.datasets?.some(d => d.id === dataset.id);
                        const secondaryColor = theme?.colors?.secondary?.main || '#9c27b0';
                        const actionColor = theme?.colors?.text?.disabled || '#9e9e9e';

                        return (
                          <React.Fragment key={dataset.id}>
                            <ListItem>
                              <ListItemIcon>
                                <StorageIcon style={{ color: hasAccess ? secondaryColor : actionColor }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={dataset.name}
                                secondary={
                                  <Box>
                                    <Chip
                                      label={dataset.status}
                                      size="small"
                                      color={statusColors[dataset.status] || 'default'}
                                      variant="outlined"
                                      style={{ marginRight: '8px' }}
                                    />
                                    {hasAccess && (
                                      <Chip
                                        icon={<CheckIcon />}
                                        label="Access Granted"
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                      />
                                    )}
                                  </Box>
                                }
                              />
                              <ListItemSecondaryAction>
                                <Tooltip title={hasAccess ? 'Remove Access' : 'Grant Access'}>
                                  <Box
                                    as="button"
                                    onClick={() => handleToggleDataset(currentTenant.id, dataset.id, hasAccess)}
                                    aria-label={hasAccess ? 'Remove dataset access' : 'Grant dataset access'}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      background: 'transparent',
                                      border: 'none',
                                      padding: '8px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      color: hasAccess ? 
                                        (theme?.colors?.error?.main || '#f44336') : 
                                        (theme?.colors?.success?.main || '#4caf50')
                                    }}
                                  >
                                    {hasAccess ? <LinkOffIcon /> : <LinkIcon />}
                                  </Box>
                                </Tooltip>
                              </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                          </React.Fragment>
                        );
                      })}
                    </List>

                    <Alert 
                      severity="warning" 
                      style={{ marginTop: '24px' }}
                    >
                      <Typography variant="body2">
                        <strong>Warning:</strong> Directly managing tenant dataset access bypasses
                        the release process. Consider using releases for better tracking and
                        auditability.
                      </Typography>
                    </Alert>
                  </Box>
                )}
              </ResourceLoader>
            </DialogContent>

            <DialogActions style={{ padding: '16px 24px' }}>
              <Button 
                variant="secondary" 
                onClick={handleCloseDialog}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Tenant Dialog */}
      <CreateTenantDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSave={handleCreateTenant}
      />
    </Box>
  );
};

export default TenantsManager;