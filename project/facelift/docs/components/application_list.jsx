import React, { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Menu,
  MenuItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Snackbar,
  Alert,
  Grid,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  Unpublished as UnpublishedIcon,
  History as HistoryIcon,
  FileCopy as DuplicateIcon,
  Share as ShareIcon,
  StarOutline as FavoriteIcon,
  Star as FavoriteFilledIcon,
  ArchiveOutlined as ArchiveIcon,
} from '@mui/icons-material';
import VirtualizedApplicationList from './virtualized_application_list';
import ApplicationListHeader from './application_list_header';
import ApplicationStatusSummary from './application_status_summary';
import ApplicationFilterPanel from './application_filter_panel';
import EmptyStatePrompt from './empty_state_prompt';
import ApplicationFormDialog from './application_form_dialog';
import ApplicationHistoryDialog from './application_history_dialog';

/**
 * ApplicationList component
 * 
 * A comprehensive application list component that integrates virtualized list,
 * header controls, status summary, and all related actions including creation,
 * editing, deletion, and lifecycle management.
 * 
 * This component uses virtualization for optimal performance with large datasets
 * and provides advanced filtering, sorting, and view controls.
 */
const ApplicationList = ({
  applications = [],
  isLoading = false,
  error = null,
  onCreateApplication,
  onUpdateApplication,
  onDeleteApplication,
  onPublishApplication,
  onUnpublishApplication,
  onFetchApplicationHistory,
  onDuplicateApplication,
  onOpenDetails,
  isAdmin = false,
  tenant = null,
  availableRoles = [],
  availableTimeZones = [],
}) => {
  // Local state
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [activeSort, setActiveSort] = useState('updated_desc');
  const [contextMenuAnchorEl, setContextMenuAnchorEl] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [showStatusSummary, setShowStatusSummary] = useState(true);

  // Define sort options
  const sortOptions = [
    { id: 'name_asc', label: 'Name (A-Z)', direction: 'asc' },
    { id: 'name_desc', label: 'Name (Z-A)', direction: 'desc' },
    { id: 'created_asc', label: 'Created (Oldest first)', direction: 'asc' },
    { id: 'created_desc', label: 'Created (Newest first)', direction: 'desc' },
    { id: 'updated_asc', label: 'Updated (Oldest first)', direction: 'asc' },
    { id: 'updated_desc', label: 'Updated (Newest first)', direction: 'desc' },
  ];

  // Apply filtering and sorting to applications
  const filteredApplications = useMemo(() => {
    // Start with all applications
    let filtered = [...applications];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(query) || 
        (app.description && app.description.toLowerCase().includes(query))
      );
    }
    
    // Apply active filters
    if (activeFilters.length) {
      filtered = filtered.filter(app => {
        return activeFilters.every(filter => {
          switch (filter.id) {
            case 'status':
              return app.status === filter.value;
            case 'type':
              return app.type === filter.value;
            case 'tag':
              return app.tags && app.tags.includes(filter.value);
            default:
              return true;
          }
        });
      });
    }
    
    // Apply sorting
    if (activeSort) {
      const [field, direction] = activeSort.split('_');
      filtered.sort((a, b) => {
        let valueA, valueB;
        
        // Get values based on the field
        switch (field) {
          case 'name':
            valueA = a.name.toLowerCase();
            valueB = b.name.toLowerCase();
            break;
          case 'created':
            valueA = new Date(a.created_at);
            valueB = new Date(b.created_at);
            break;
          case 'updated':
            valueA = new Date(a.updated_at);
            valueB = new Date(b.updated_at);
            break;
          default:
            valueA = a[field];
            valueB = b[field];
        }
        
        // Compare based on direction
        if (direction === 'asc') {
          return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        } else {
          return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
        }
      });
    }
    
    return filtered;
  }, [applications, searchQuery, activeFilters, activeSort]);

  // Handle application click
  const handleAppClick = useCallback((app) => {
    onOpenDetails(app);
  }, [onOpenDetails]);

  // Handle search change
  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  // Handle filter click
  const handleFilterClick = useCallback(() => {
    setIsFilterPanelOpen(true);
  }, []);

  // Handle filter apply
  const handleFilterApply = useCallback((filters) => {
    setActiveFilters(filters);
    setIsFilterPanelOpen(false);
  }, []);

  // Handle clear filter
  const handleClearFilter = useCallback((filterId) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
  }, []);

  // Handle clear all filters
  const handleClearAllFilters = useCallback(() => {
    setActiveFilters([]);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((sortId) => {
    setActiveSort(sortId);
  }, []);

  // Handle view mode change
  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // In a real implementation, this would trigger a data refresh
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      setNotification({
        open: true,
        message: 'Applications refreshed successfully',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to refresh applications',
        severity: 'error'
      });
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Handle context menu open
  const handleContextMenuOpen = useCallback((event, app) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenuAnchorEl(event.currentTarget);
    setSelectedApp(app);
  }, []);

  // Handle context menu close
  const handleContextMenuClose = useCallback(() => {
    setContextMenuAnchorEl(null);
  }, []);

  // Handle create application
  const handleCreateClick = useCallback(() => {
    setIsCreateDialogOpen(true);
  }, []);

  // Handle create application submit
  const handleCreateSubmit = useCallback(async (values) => {
    try {
      await onCreateApplication(values);
      setNotification({
        open: true,
        message: 'Application created successfully',
        severity: 'success'
      });
      return true;
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to create application: ${error.message}`,
        severity: 'error'
      });
      return false;
    }
  }, [onCreateApplication]);

  // Handle edit application
  const handleEditClick = useCallback(() => {
    setSelectedApp(prev => ({...prev})); // Create a copy to avoid reference issues
    setIsEditDialogOpen(true);
    handleContextMenuClose();
  }, [handleContextMenuClose]);

  // Handle edit application submit
  const handleEditSubmit = useCallback(async (values) => {
    try {
      await onUpdateApplication(values);
      setNotification({
        open: true,
        message: 'Application updated successfully',
        severity: 'success'
      });
      return true;
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to update application: ${error.message}`,
        severity: 'error'
      });
      return false;
    }
  }, [onUpdateApplication]);

  // Handle delete application
  const handleDeleteClick = useCallback(() => {
    setIsDeleteDialogOpen(true);
    handleContextMenuClose();
  }, [handleContextMenuClose]);

  // Handle delete application confirmation
  const handleDeleteConfirm = useCallback(async () => {
    try {
      await onDeleteApplication(selectedApp.id);
      setNotification({
        open: true,
        message: 'Application deleted successfully',
        severity: 'success'
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to delete application: ${error.message}`,
        severity: 'error'
      });
    }
  }, [selectedApp, onDeleteApplication]);

  // Handle publish application
  const handlePublishClick = useCallback(async () => {
    try {
      await onPublishApplication(selectedApp.id);
      setNotification({
        open: true,
        message: 'Application published successfully',
        severity: 'success'
      });
      handleContextMenuClose();
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to publish application: ${error.message}`,
        severity: 'error'
      });
    }
  }, [selectedApp, onPublishApplication, handleContextMenuClose]);

  // Handle unpublish application
  const handleUnpublishClick = useCallback(async () => {
    try {
      await onUnpublishApplication(selectedApp.id);
      setNotification({
        open: true,
        message: 'Application unpublished successfully',
        severity: 'success'
      });
      handleContextMenuClose();
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to unpublish application: ${error.message}`,
        severity: 'error'
      });
    }
  }, [selectedApp, onUnpublishApplication, handleContextMenuClose]);

  // Handle duplicate application
  const handleDuplicateClick = useCallback(async () => {
    try {
      await onDuplicateApplication(selectedApp.id);
      setNotification({
        open: true,
        message: 'Application duplicated successfully',
        severity: 'success'
      });
      handleContextMenuClose();
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to duplicate application: ${error.message}`,
        severity: 'error'
      });
    }
  }, [selectedApp, onDuplicateApplication, handleContextMenuClose]);

  // Handle history view
  const handleHistoryClick = useCallback(() => {
    setIsHistoryDialogOpen(true);
    handleContextMenuClose();
  }, [handleContextMenuClose]);

  // Handle status filter
  const handleStatusClick = useCallback((status) => {
    // Check if we already have a status filter
    const existingStatusFilter = activeFilters.find(f => f.id === 'status');
    
    if (existingStatusFilter) {
      // If we're clicking the same status, remove the filter
      if (existingStatusFilter.value === status) {
        handleClearFilter('status');
      } else {
        // Otherwise, update the filter value
        setActiveFilters(prev => 
          prev.map(f => f.id === 'status' ? { ...f, value: status } : f)
        );
      }
    } else {
      // Add a new status filter
      setActiveFilters(prev => [
        ...prev,
        {
          id: 'status',
          label: 'Status',
          value: status
        }
      ]);
    }
  }, [activeFilters, handleClearFilter]);

  // Handle notification close
  const handleNotificationClose = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Custom empty state for the list
  const emptyState = useMemo(() => (
    <EmptyStatePrompt
      title={searchQuery || activeFilters.length ? "No matching applications" : "No applications yet"}
      description={
        searchQuery || activeFilters.length
          ? "Try adjusting your search or filters to find what you're looking for."
          : "Create your first application to get started with the platform."
      }
      actionLabel={(!searchQuery && !activeFilters.length && isAdmin) ? "Create Application" : null}
      onAction={handleCreateClick}
    />
  ), [searchQuery, activeFilters.length, isAdmin, handleCreateClick]);

  return (
    <Box>
      {/* Header Controls */}
      <ApplicationListHeader
        title="Applications"
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onRefresh={handleRefresh}
        onCreateClick={handleCreateClick}
        onFilterClick={handleFilterClick}
        activeFilters={activeFilters}
        onClearFilter={handleClearFilter}
        onClearAllFilters={handleClearAllFilters}
        sortOptions={sortOptions}
        activeSort={activeSort}
        onSortChange={handleSortChange}
        totalCount={applications.length}
        isAdmin={isAdmin}
        refreshing={refreshing}
      />

      {/* Status Summary */}
      {showStatusSummary && (
        <Box sx={{ mb: 4 }}>
          <ApplicationStatusSummary
            applications={applications}
            isLoading={isLoading}
            error={error}
            onStatusClick={handleStatusClick}
          />
        </Box>
      )}

      {/* Main List */}
      <Box sx={{ mt: !showStatusSummary && isLoading ? 0 : 3 }}>
        <VirtualizedApplicationList
          applications={filteredApplications}
          isLoading={isLoading && !refreshing}
          error={error}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onAppClick={handleAppClick}
          onAppMenuOpen={handleContextMenuOpen}
          emptyState={emptyState}
        />
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={contextMenuAnchorEl}
        open={Boolean(contextMenuAnchorEl)}
        onClose={handleContextMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        {isAdmin && (
          <MenuItem onClick={handleEditClick}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Edit" />
          </MenuItem>
        )}
        
        {selectedApp && selectedApp.status === 'active' && isAdmin && (
          <MenuItem onClick={handleUnpublishClick}>
            <ListItemIcon>
              <UnpublishedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Unpublish" />
          </MenuItem>
        )}
        
        {selectedApp && (selectedApp.status === 'draft' || selectedApp.status === 'inactive') && isAdmin && (
          <MenuItem onClick={handlePublishClick}>
            <ListItemIcon>
              <PublishIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Publish" />
          </MenuItem>
        )}
        
        <MenuItem onClick={handleHistoryClick}>
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="View History" />
        </MenuItem>
        
        {isAdmin && (
          <>
            <MenuItem onClick={handleDuplicateClick}>
              <ListItemIcon>
                <DuplicateIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Duplicate" />
            </MenuItem>
            
            <MenuItem>
              <ListItemIcon>
                <ShareIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Share" />
            </MenuItem>
            
            <MenuItem>
              <ListItemIcon>
                {selectedApp && selectedApp.favorite ? 
                  <FavoriteFilledIcon fontSize="small" color="error" /> : 
                  <FavoriteIcon fontSize="small" />
                }
              </ListItemIcon>
              <ListItemText primary={selectedApp && selectedApp.favorite ? "Remove from Favorites" : "Add to Favorites"} />
            </MenuItem>
            
            <Divider />
            
            <MenuItem>
              <ListItemIcon>
                <ArchiveIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Archive" />
            </MenuItem>
            
            <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Delete" />
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the application "{selectedApp?.name}"?
          </Typography>
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            This action cannot be undone. All associated data will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Application Dialog */}
      <ApplicationFormDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateSubmit}
        availableRoles={availableRoles}
        availableTimeZones={availableTimeZones}
        dialogTitle="Create New Application"
      />

      {/* Edit Application Dialog */}
      <ApplicationFormDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleEditSubmit}
        application={selectedApp}
        availableRoles={availableRoles}
        availableTimeZones={availableTimeZones}
        dialogTitle={`Edit Application: ${selectedApp?.name}`}
      />

      {/* Filter Panel */}
      <ApplicationFilterPanel
        open={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        onApplyFilters={handleFilterApply}
        initialFilters={activeFilters}
        applications={applications}
      />

      {/* History Dialog */}
      {selectedApp && (
        <ApplicationHistoryDialog
          open={isHistoryDialogOpen}
          onClose={() => setIsHistoryDialogOpen(false)}
          applicationId={selectedApp.id}
          applicationName={selectedApp.name}
          fetchHistory={onFetchApplicationHistory}
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
          elevation={6}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

ApplicationList.propTypes = {
  /**
   * Array of application objects
   */
  applications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      type: PropTypes.string,
      status: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      updated_at: PropTypes.string.isRequired,
    })
  ),
  
  /**
   * Whether applications are loading
   */
  isLoading: PropTypes.bool,
  
  /**
   * Error object if an error occurred
   */
  error: PropTypes.object,
  
  /**
   * Callback function to create a new application
   */
  onCreateApplication: PropTypes.func.isRequired,
  
  /**
   * Callback function to update an application
   */
  onUpdateApplication: PropTypes.func.isRequired,
  
  /**
   * Callback function to delete an application
   */
  onDeleteApplication: PropTypes.func.isRequired,
  
  /**
   * Callback function to publish an application
   */
  onPublishApplication: PropTypes.func.isRequired,
  
  /**
   * Callback function to unpublish an application
   */
  onUnpublishApplication: PropTypes.func.isRequired,
  
  /**
   * Callback function to fetch application history
   */
  onFetchApplicationHistory: PropTypes.func.isRequired,
  
  /**
   * Callback function to duplicate an application
   */
  onDuplicateApplication: PropTypes.func,
  
  /**
   * Callback function to open application details
   */
  onOpenDetails: PropTypes.func.isRequired,
  
  /**
   * Whether the current user has admin permissions
   */
  isAdmin: PropTypes.bool,
  
  /**
   * Tenant object
   */
  tenant: PropTypes.object,
  
  /**
   * Available roles for permissions
   */
  availableRoles: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })),
  
  /**
   * Available time zones
   */
  availableTimeZones: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })),
};

export default ApplicationList;