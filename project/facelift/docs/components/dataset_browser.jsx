import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Grid,
  Typography,
  TextField,
  IconButton,
  Button,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Paper,
  Card,
  CardContent,
  Chip,
  Badge,
  useTheme,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Link as LinkIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  MoreVert as MoreVertIcon,
  Archive as ArchiveIcon,
  Visibility as ViewIcon,
  DownloadForOffline as ExportIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Sort as SortIcon,
  Apps as AppsIcon,
  Storage as StorageIcon,
  Api as ApiIcon,
  Database as DatabaseIcon,
  Description as DescriptionIcon,
  CloudQueue as CloudQueueIcon,
} from '@mui/icons-material';

import DatasetCard from './dataset_card';
import DatasetFormDialog from './dataset_form_dialog';
import { DATASET_SOURCE_TYPES, DATASET_TYPES, DATASET_STATUSES } from './dataset_model';
import useDatasetManagement from './use_dataset_management';

// Styled components
const BrowserHeader = styled(Box)(({ theme }) => ({
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

const ActionBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const TabBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
}));

const ViewToggleButton = styled(IconButton)(({ theme, active }) => ({
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  marginLeft: theme.spacing(1),
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0, 0.5, 1, 0),
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  textAlign: 'center',
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}));

/**
 * DatasetBrowser component
 * 
 * A comprehensive browser for datasets with filtering, searching, and management
 * capabilities, including the ability to associate datasets with applications.
 */
const DatasetBrowser = ({
  tenantId,
  applications = [],
  showApplicationAssociations = true,
  selectedApplicationId = null,
  onDatasetSelect,
  isAdmin = false,
}) => {
  // State management
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssociationDialogOpen, setIsAssociationDialogOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [favoriteDatasets, setFavoriteDatasets] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  
  const theme = useTheme();
  
  // Custom hook for dataset management
  const {
    datasets,
    isLoading,
    error,
    fetchDatasets,
    createDataset,
    updateDataset,
    deleteDataset,
    associateDatasetWithApplication,
    removeDatasetApplicationAssociation,
  } = useDatasetManagement(tenantId);
  
  // Filter and sort datasets
  const filteredDatasets = useMemo(() => {
    let result = [...datasets];
    
    // Filter by selected application if specified
    if (selectedApplicationId) {
      result = result.filter(dataset =>
        dataset.applicationAssociations.some(
          assoc => assoc.applicationId === selectedApplicationId
        )
      );
    }
    
    // Filter by active tab
    if (activeTab !== 'all') {
      if (activeTab === 'favorites') {
        result = result.filter(dataset => favoriteDatasets.includes(dataset.id));
      } else {
        result = result.filter(dataset => dataset.status === activeTab);
      }
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(dataset =>
        dataset.name.toLowerCase().includes(query) ||
        (dataset.description && dataset.description.toLowerCase().includes(query))
      );
    }
    
    // Apply additional filters
    if (activeFilters.length > 0) {
      result = result.filter(dataset => {
        return activeFilters.every(filter => {
          switch (filter.type) {
            case 'source':
              return dataset.sourceType === filter.value;
            case 'type':
              return dataset.type === filter.value;
            case 'tag':
              return dataset.tags && dataset.tags.includes(filter.value);
            default:
              return true;
          }
        });
      });
    }
    
    // Sort by last updated by default
    result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    return result;
  }, [datasets, selectedApplicationId, activeTab, searchQuery, activeFilters, favoriteDatasets]);
  
  // Load datasets on mount
  useEffect(() => {
    if (tenantId) {
      fetchDatasets();
    }
  }, [tenantId, fetchDatasets]);
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  // Handle dataset click
  const handleDatasetClick = (dataset) => {
    if (onDatasetSelect) {
      onDatasetSelect(dataset);
    }
  };
  
  // Handle menu open
  const handleMenuOpen = (event, dataset) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedDataset(dataset);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = (datasetId, isFavorite) => {
    if (isFavorite) {
      setFavoriteDatasets(prev => [...prev, datasetId]);
      setNotification({
        open: true,
        message: 'Dataset added to favorites',
        severity: 'success',
      });
    } else {
      setFavoriteDatasets(prev => prev.filter(id => id !== datasetId));
      setNotification({
        open: true,
        message: 'Dataset removed from favorites',
        severity: 'info',
      });
    }
  };
  
  // Handle create dataset
  const handleCreateClick = () => {
    setIsCreateDialogOpen(true);
  };
  
  // Handle create dataset submit
  const handleCreateSubmit = async (values) => {
    try {
      await createDataset(values);
      setIsCreateDialogOpen(false);
      setNotification({
        open: true,
        message: 'Dataset created successfully',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to create dataset: ${error.message}`,
        severity: 'error',
      });
    }
  };
  
  // Handle edit dataset
  const handleEditClick = () => {
    setIsEditDialogOpen(true);
    handleMenuClose();
  };
  
  // Handle edit dataset submit
  const handleEditSubmit = async (values) => {
    try {
      await updateDataset(values);
      setIsEditDialogOpen(false);
      setNotification({
        open: true,
        message: 'Dataset updated successfully',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to update dataset: ${error.message}`,
        severity: 'error',
      });
    }
  };
  
  // Handle delete dataset
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
    handleMenuClose();
  };
  
  // Handle confirm delete
  const handleConfirmDelete = async () => {
    try {
      await deleteDataset(selectedDataset.id);
      setIsDeleteDialogOpen(false);
      setNotification({
        open: true,
        message: 'Dataset deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to delete dataset: ${error.message}`,
        severity: 'error',
      });
    }
  };
  
  // Handle duplicate dataset
  const handleDuplicateClick = async () => {
    try {
      const newDataset = { ...selectedDataset };
      delete newDataset.id;
      newDataset.name = `${newDataset.name} (Copy)`;
      newDataset.applicationAssociations = [...newDataset.applicationAssociations];
      
      await createDataset(newDataset);
      handleMenuClose();
      setNotification({
        open: true,
        message: 'Dataset duplicated successfully',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to duplicate dataset: ${error.message}`,
        severity: 'error',
      });
    }
  };
  
  // Handle associate dataset
  const handleAssociateClick = () => {
    setIsAssociationDialogOpen(true);
    handleMenuClose();
  };
  
  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Handle refresh
  const handleRefresh = () => {
    fetchDatasets();
    setNotification({
      open: true,
      message: 'Datasets refreshed',
      severity: 'info',
    });
  };
  
  // Handle add filter
  const handleAddFilter = (type, value, label) => {
    // Check if filter already exists
    const exists = activeFilters.some(
      filter => filter.type === type && filter.value === value
    );
    
    if (!exists) {
      setActiveFilters([...activeFilters, { type, value, label }]);
    }
  };
  
  // Handle remove filter
  const handleRemoveFilter = (filterToRemove) => {
    setActiveFilters(
      activeFilters.filter(
        filter => 
          !(filter.type === filterToRemove.type && filter.value === filterToRemove.value)
      )
    );
  };
  
  // Handle clear all filters
  const handleClearFilters = () => {
    setActiveFilters([]);
    setSearchQuery('');
  };
  
  // Get count of datasets by status for tabs
  const statusCounts = useMemo(() => {
    const counts = {
      all: datasets.length,
      active: 0,
      draft: 0,
      deprecated: 0,
      archived: 0,
      error: 0,
      favorites: favoriteDatasets.length,
    };
    
    datasets.forEach(dataset => {
      if (counts[dataset.status] !== undefined) {
        counts[dataset.status]++;
      }
    });
    
    return counts;
  }, [datasets, favoriteDatasets.length]);
  
  // Render empty state
  const renderEmptyState = () => {
    if (searchQuery || activeFilters.length > 0) {
      return (
        <EmptyState>
          <StorageIcon sx={{ fontSize: 64, color: 'action.active', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No datasets match your search
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Try adjusting your search criteria or clearing filters.
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<CloseIcon />}
            onClick={handleClearFilters}
          >
            Clear All Filters
          </Button>
        </EmptyState>
      );
    }
    
    return (
      <EmptyState>
        <StorageIcon sx={{ fontSize: 64, color: 'action.active', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No datasets available
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Create your first dataset to get started.
        </Typography>
        {isAdmin && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
          >
            Create Dataset
          </Button>
        )}
      </EmptyState>
    );
  };
  
  return (
    <Box>
      {/* Header */}
      <BrowserHeader>
        <Typography variant="h4">Datasets</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isAdmin && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
              sx={{ mr: 1 }}
            >
              Create Dataset
            </Button>
          )}
          <Tooltip title="Refresh datasets">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </BrowserHeader>
      
      {/* Action Bar */}
      <ActionBar>
        <SearchField
          placeholder="Search datasets..."
          value={searchQuery}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  edge="end"
                  aria-label="clear search"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Filter">
            <IconButton onClick={() => {}} sx={{ mr: 1 }}>
              <Badge
                badgeContent={activeFilters.length}
                color="primary"
                invisible={activeFilters.length === 0}
              >
                <FilterListIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Sort">
            <IconButton onClick={() => {}} sx={{ mr: 1 }}>
              <SortIcon />
            </IconButton>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          
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
      </ActionBar>
      
      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Filters:
          </Typography>
          
          {activeFilters.map((filter, index) => (
            <FilterChip
              key={`${filter.type}-${filter.value}`}
              label={`${filter.label}`}
              size="small"
              onDelete={() => handleRemoveFilter(filter)}
            />
          ))}
          
          <FilterChip
            label="Clear All"
            size="small"
            onClick={handleClearFilters}
          />
        </Box>
      )}
      
      {/* Tabs */}
      <TabBar>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          aria-label="dataset status tabs"
        >
          <Tab
            label={`All (${statusCounts.all})`}
            value="all"
          />
          <Tab
            label={`Active (${statusCounts.active})`}
            value="active"
          />
          <Tab
            label={`Draft (${statusCounts.draft})`}
            value="draft"
          />
          <Tab
            label={`Deprecated (${statusCounts.deprecated})`}
            value="deprecated"
          />
          {favoriteDatasets.length > 0 && (
            <Tab
              label={`Favorites (${statusCounts.favorites})`}
              value="favorites"
              icon={<StarIcon fontSize="small" />}
              iconPosition="start"
            />
          )}
        </Tabs>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Filter by S3 source">
            <IconButton
              size="small"
              onClick={() => handleAddFilter('source', DATASET_SOURCE_TYPES.S3, 'S3')}
              color={activeFilters.some(f => f.type === 'source' && f.value === DATASET_SOURCE_TYPES.S3) 
                ? 'primary' 
                : 'default'}
            >
              <CloudQueueIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Filter by API source">
            <IconButton
              size="small"
              onClick={() => handleAddFilter('source', DATASET_SOURCE_TYPES.API, 'API')}
              color={activeFilters.some(f => f.type === 'source' && f.value === DATASET_SOURCE_TYPES.API) 
                ? 'primary' 
                : 'default'}
            >
              <ApiIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Filter by Database source">
            <IconButton
              size="small"
              onClick={() => handleAddFilter('source', DATASET_SOURCE_TYPES.DATABASE, 'Database')}
              color={activeFilters.some(f => f.type === 'source' && f.value === DATASET_SOURCE_TYPES.DATABASE) 
                ? 'primary' 
                : 'default'}
            >
              <DatabaseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Filter by File source">
            <IconButton
              size="small"
              onClick={() => handleAddFilter('source', DATASET_SOURCE_TYPES.FILE, 'File')}
              color={activeFilters.some(f => f.type === 'source' && f.value === DATASET_SOURCE_TYPES.FILE) 
                ? 'primary' 
                : 'default'}
            >
              <DescriptionIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </TabBar>
      
      {/* Loading state */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Error state */}
      {error && (
        <Box sx={{ py: 2 }}>
          <Alert severity="error">
            Error loading datasets: {error}
          </Alert>
        </Box>
      )}
      
      {/* Dataset grid */}
      {!isLoading && !error && (
        <>
          {filteredDatasets.length === 0 ? (
            renderEmptyState()
          ) : (
            viewMode === 'grid' ? (
              <Grid container spacing={3}>
                {filteredDatasets.map((dataset) => (
                  <Grid item xs={12} sm={6} md={4} key={dataset.id}>
                    <Box 
                      onClick={() => handleDatasetClick(dataset)} 
                      sx={{ height: '100%', cursor: 'pointer' }}
                    >
                      <DatasetCard
                        dataset={dataset}
                        onMenuOpen={handleMenuOpen}
                        onFavoriteToggle={handleFavoriteToggle}
                        isFavorite={favoriteDatasets.includes(dataset.id)}
                        showApplications={showApplicationAssociations}
                        variant="grid"
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box>
                {filteredDatasets.map((dataset) => (
                  <Box 
                    key={dataset.id} 
                    onClick={() => handleDatasetClick(dataset)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <DatasetCard
                      dataset={dataset}
                      onMenuOpen={handleMenuOpen}
                      onFavoriteToggle={handleFavoriteToggle}
                      isFavorite={favoriteDatasets.includes(dataset.id)}
                      showApplications={showApplicationAssociations}
                      variant="list"
                    />
                  </Box>
                ))}
              </Box>
            )
          )}
        </>
      )}
      
      {/* Dataset Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={() => { handleDatasetClick(selectedDataset); handleMenuClose(); }}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        
        {isAdmin && (
          <MenuItem onClick={handleEditClick}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={handleDuplicateClick}>
          <ListItemIcon>
            <DuplicateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        
        {showApplicationAssociations && (
          <MenuItem onClick={handleAssociateClick}>
            <ListItemIcon>
              <LinkIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Manage Associations</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={() => { 
          handleFavoriteToggle(
            selectedDataset.id, 
            !favoriteDatasets.includes(selectedDataset.id)
          ); 
          handleMenuClose(); 
        }}>
          <ListItemIcon>
            {favoriteDatasets.includes(selectedDataset?.id) ? (
              <StarIcon fontSize="small" color="warning" />
            ) : (
              <StarBorderIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {favoriteDatasets.includes(selectedDataset?.id) 
              ? 'Remove from Favorites' 
              : 'Add to Favorites'}
          </ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => { handleMenuClose(); }}>
          <ListItemIcon>
            <ExportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export</ListItemText>
        </MenuItem>
        
        <Divider />
        
        {isAdmin && (
          <>
            <MenuItem onClick={() => { handleMenuClose(); }}>
              <ListItemIcon>
                <ArchiveIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Archive</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
      
      {/* Create Dataset Dialog */}
      <DatasetFormDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateSubmit}
        applications={applications}
        dialogTitle="Create New Dataset"
      />
      
      {/* Edit Dataset Dialog */}
      {selectedDataset && (
        <DatasetFormDialog
          open={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSubmit={handleEditSubmit}
          dataset={selectedDataset}
          applications={applications}
          dialogTitle={`Edit Dataset: ${selectedDataset.name}`}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the dataset "{selectedDataset?.name}"?
          </Typography>
          {selectedDataset?.applicationAssociations?.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This dataset is associated with {selectedDataset.applicationAssociations.length} application(s).
              Deleting it may affect those applications.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Application Association Dialog - Placeholder */}
      <Dialog
        open={isAssociationDialogOpen}
        onClose={() => setIsAssociationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Manage Dataset Associations</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Associate "{selectedDataset?.name}" with applications:
          </Typography>
          
          {/* This would be replaced with a full association UI component */}
          <Box sx={{ my: 2 }}>
            <Typography variant="body2" paragraph>
              Current associations:
            </Typography>
            
            {selectedDataset?.applicationAssociations?.length > 0 ? (
              <Grid container spacing={1}>
                {selectedDataset.applicationAssociations.map(assoc => (
                  <Grid item key={assoc.applicationId}>
                    <Chip
                      label={assoc.applicationName}
                      onDelete={() => {}}
                      color="primary"
                      variant="outlined"
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No associations yet
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAssociationDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
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
  );
};

DatasetBrowser.propTypes = {
  /**
   * Tenant ID
   */
  tenantId: PropTypes.string.isRequired,
  
  /**
   * Available applications for association
   */
  applications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  
  /**
   * Whether to show application associations
   */
  showApplicationAssociations: PropTypes.bool,
  
  /**
   * Selected application ID to filter datasets
   */
  selectedApplicationId: PropTypes.string,
  
  /**
   * Callback when a dataset is selected
   */
  onDatasetSelect: PropTypes.func,
  
  /**
   * Whether the current user has admin permissions
   */
  isAdmin: PropTypes.bool,
};

export default DatasetBrowser;