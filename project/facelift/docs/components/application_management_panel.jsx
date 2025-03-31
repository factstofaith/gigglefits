import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useContext } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Tabs, 
  Tab, 
  Grid, 
  IconButton, 
  Chip, 
  Tooltip, 
  TextField, 
  Menu, 
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  Unpublished as UnpublishedIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { UserContext } from '../../contexts/UserContext';
import { ConfigContext } from '../../contexts/ConfigContext';
import ApplicationCreationDialog from './ApplicationCreationDialog';
import ApplicationDetailView from './ApplicationDetailView';
import ApplicationStatusBadge from './ApplicationStatusBadge';
import ApplicationFilterPanel from './ApplicationFilterPanel';
import EmptyStatePrompt from '../common/EmptyStatePrompt';
import ErrorBoundary from '../common/ErrorBoundary';
import ApplicationHistoryDialog from './ApplicationHistoryDialog';
import useApplicationManagement from '../../hooks/useApplicationManagement';
import { trackEvent } from '../../services/analyticsService';

// Styled components for enhanced visuals
const StyledCard = styled(Card)(({ theme, status }) => ({
  position: 'relative',
  transition: 'transform 0.2s, box-shadow 0.2s',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
  borderLeft: status === 'active' 
    ? `4px solid ${theme.palette.success.main}` 
    : status === 'draft' 
      ? `4px solid ${theme.palette.info.main}` 
      : status === 'deprecated' 
        ? `4px solid ${theme.palette.warning.main}` 
        : status === 'inactive' 
          ? `4px solid ${theme.palette.error.main}` 
          : `4px solid ${theme.palette.grey[400]}`
}));

const ApplicationHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const SearchField = styled(TextField)(({ theme }) => ({
  width: '300px',
  marginRight: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 2,
  }
}));

const ViewToggleButton = styled(IconButton)(({ theme, active }) => ({
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  marginLeft: theme.spacing(1),
}));

/**
 * ApplicationManagementPanel component
 * 
 * Comprehensive admin panel for managing applications with filtering, search,
 * and lifecycle management capabilities.
 * 
 * Features:
 * - Application listing with different view modes (grid/list)
 * - Status filtering (all, draft, active, inactive, deprecated)
 * - Search functionality
 * - Application creation
 * - Application publishing/unpublishing
 * - Application editing
 * - Application deletion
 * - Lifecycle management
 */
const ApplicationManagementPanel = ({ tenant }) => {
  // State management
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  
  // Contexts
  const { user } = useContext(UserContext);
  const { config } = useContext(ConfigContext);
  
  // Custom hooks for data management
  const { 
    applications, 
    isLoading, 
    error, 
    fetchApplications, 
    createApplication, 
    updateApplication,
    deleteApplication,
    publishApplication,
    unpublishApplication,
    fetchApplicationHistory
  } = useApplicationManagement(tenant?.id);

  // Fetch applications on mount and when tenant changes
  useEffect(() => {
    if (tenant?.id) {
      fetchApplications();
    }
  }, [tenant?.id, fetchApplications]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    trackEvent('application_filter_changed', { filter: newValue });
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle view mode toggle
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    trackEvent('application_view_mode_changed', { mode });
  };

  // Handle application creation
  const handleCreateApplication = async (applicationData) => {
    try {
      await createApplication(applicationData);
      setIsCreateDialogOpen(false);
      setNotification({
        open: true,
        message: 'Application created successfully',
        severity: 'success'
      });
      trackEvent('application_created');
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to create application: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Handle application selection for details view
  const handleAppClick = (app) => {
    setSelectedApp(app);
    setSelectedAppId(app.id);
    setIsDetailViewOpen(true);
    trackEvent('application_details_viewed', { application_id: app.id });
  };

  // Handle application menu open
  const handleMenuOpen = (event, app) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedApp(app);
  };

  // Handle application menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle application edit
  const handleEditClick = () => {
    handleMenuClose();
    setIsDetailViewOpen(true);
    trackEvent('application_edit_started', { application_id: selectedApp?.id });
  };

  // Handle application delete dialog open
  const handleDeleteClick = () => {
    handleMenuClose();
    setIsDeleteDialogOpen(true);
  };

  // Handle application deletion
  const handleDeleteConfirm = async () => {
    try {
      await deleteApplication(selectedApp.id);
      setIsDeleteDialogOpen(false);
      setNotification({
        open: true,
        message: 'Application deleted successfully',
        severity: 'success'
      });
      trackEvent('application_deleted', { application_id: selectedApp?.id });
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to delete application: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Handle application publish
  const handlePublishClick = async () => {
    handleMenuClose();
    try {
      await publishApplication(selectedApp.id);
      setNotification({
        open: true,
        message: 'Application published successfully',
        severity: 'success'
      });
      trackEvent('application_published', { application_id: selectedApp?.id });
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to publish application: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Handle application unpublish
  const handleUnpublishClick = async () => {
    handleMenuClose();
    try {
      await unpublishApplication(selectedApp.id);
      setNotification({
        open: true,
        message: 'Application unpublished successfully',
        severity: 'success'
      });
      trackEvent('application_unpublished', { application_id: selectedApp?.id });
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to unpublish application: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Handle application history view
  const handleHistoryClick = () => {
    handleMenuClose();
    setIsHistoryDialogOpen(true);
    trackEvent('application_history_viewed', { application_id: selectedApp?.id });
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // Filter applications based on active tab and search query
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Filter by status
      const statusMatch = activeTab === 'all' || app.status === activeTab;
      
      // Filter by search query
      const searchMatch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return statusMatch && searchMatch;
    });
  }, [applications, activeTab, searchQuery]);

  // Determine if the user has admin permissions
  const hasAdminPermissions = useMemo(() => {
    return user?.role === 'admin' || user?.role === 'super_admin';
  }, [user]);

  // Render application grid or list view
  const renderApplications = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 4 }}>
          <Alert severity="error">
            Error loading applications: {error.message}
          </Alert>
        </Box>
      );
    }

    if (filteredApplications.length === 0) {
      return (
        <EmptyStatePrompt
          title="No applications found"
          description={
            searchQuery 
              ? "No applications match your search criteria. Try adjusting your filters or search query."
              : activeTab !== 'all'
                ? `No applications with '${activeTab}' status found.`
                : "Create your first application to get started."
          }
          actionLabel="Create Application"
          onAction={() => setIsCreateDialogOpen(true)}
          showAction={hasAdminPermissions}
          icon={<ViewListIcon sx={{ fontSize: 64 }} color="primary" />}
        />
      );
    }

    if (viewMode === 'grid') {
      return (
        <Grid container spacing={3}>
          {filteredApplications.map((app) => (
            <Grid item xs={12} sm={6} md={4} key={app.id}>
              <StyledCard 
                status={app.status}
                onClick={() => handleAppClick(app)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" noWrap title={app.name}>
                      {app.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, app)}
                      aria-label="application actions"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {app.description || 'No description provided'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <ApplicationStatusBadge status={app.status} />
                    <Typography variant="caption" color="text.secondary">
                      Updated: {new Date(app.updated_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      );
    } else {
      return (
        <Box>
          {filteredApplications.map((app) => (
            <StyledCard 
              key={app.id} 
              status={app.status}
              onClick={() => handleAppClick(app)}
              sx={{ mb: 2 }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6">{app.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {app.description || 'No description provided'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ApplicationStatusBadge status={app.status} />
                    <Chip 
                      label={app.type} 
                      size="small" 
                      variant="outlined" 
                      sx={{ ml: 1 }} 
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mx: 2 }}>
                      Updated: {new Date(app.updated_at).toLocaleDateString()}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, app)}
                      aria-label="application actions"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          ))}
        </Box>
      );
    }
  };

  return (
    <ErrorBoundary>
      <Box sx={{ p: 3 }}>
        <ApplicationHeader>
          <Typography variant="h4">Application Management</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {hasAdminPermissions && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Create Application
              </Button>
            )}
            <IconButton 
              onClick={() => fetchApplications()}
              aria-label="refresh applications"
              title="Refresh applications"
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        </ApplicationHeader>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            aria-label="application status tabs"
          >
            <Tab label="All" value="all" />
            <Tab label="Draft" value="draft" />
            <Tab label="Active" value="active" />
            <Tab label="Inactive" value="inactive" />
            <Tab label="Deprecated" value="deprecated" />
          </Tabs>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SearchField
              placeholder="Search applications..."
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
            
            <Tooltip title="Filter applications">
              <IconButton 
                onClick={() => setIsFilterPanelOpen(true)}
                aria-label="filter applications"
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Grid view">
              <ViewToggleButton 
                active={viewMode === 'grid' ? 1 : 0}
                onClick={() => handleViewModeChange('grid')}
                aria-label="grid view"
              >
                <ViewModuleIcon />
              </ViewToggleButton>
            </Tooltip>
            
            <Tooltip title="List view">
              <ViewToggleButton 
                active={viewMode === 'list' ? 1 : 0}
                onClick={() => handleViewModeChange('list')}
                aria-label="list view"
              >
                <ViewListIcon />
              </ViewToggleButton>
            </Tooltip>
          </Box>
        </Box>

        {renderApplications()}

        {/* Application action menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem onClick={handleEditClick}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          
          {selectedApp?.status === 'draft' || selectedApp?.status === 'inactive' ? (
            <MenuItem onClick={handlePublishClick}>
              <PublishIcon fontSize="small" sx={{ mr: 1 }} />
              Publish
            </MenuItem>
          ) : selectedApp?.status === 'active' ? (
            <MenuItem onClick={handleUnpublishClick}>
              <UnpublishedIcon fontSize="small" sx={{ mr: 1 }} />
              Unpublish
            </MenuItem>
          ) : null}
          
          <MenuItem onClick={handleHistoryClick}>
            <HistoryIcon fontSize="small" sx={{ mr: 1 }} />
            View History
          </MenuItem>
          
          <MenuItem onClick={handleDeleteClick}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" />
            <Typography color="error">Delete</Typography>
          </MenuItem>
        </Menu>

        {/* Create Application Dialog */}
        <ApplicationCreationDialog
          open={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreateApplication}
          tenant={tenant}
        />

        {/* Application Detail View */}
        {selectedApp && (
          <ApplicationDetailView
            open={isDetailViewOpen}
            onClose={() => setIsDetailViewOpen(false)}
            application={selectedApp}
            onUpdate={updateApplication}
            tenant={tenant}
          />
        )}

        {/* Application Filter Panel */}
        <ApplicationFilterPanel
          open={isFilterPanelOpen}
          onClose={() => setIsFilterPanelOpen(false)}
          onApplyFilters={() => {/* Apply filters logic */}}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          aria-labelledby="delete-dialog-title"
        >
          <DialogTitle id="delete-dialog-title">Delete Application</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the application "{selectedApp?.name}"? This action cannot be undone.
            </Typography>
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              Warning: Deleting this application will also remove all associated integrations and configurations.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Application History Dialog */}
        {selectedApp && (
          <ApplicationHistoryDialog
            open={isHistoryDialogOpen}
            onClose={() => setIsHistoryDialogOpen(false)}
            applicationId={selectedApp.id}
            fetchHistory={fetchApplicationHistory}
          />
        )}

        {/* Notifications */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleNotificationClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleNotificationClose} 
            severity={notification.severity}
            variant="filled"
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </ErrorBoundary>
  );
};

ApplicationManagementPanel.propTypes = {
  tenant: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })
};

export default ApplicationManagementPanel;