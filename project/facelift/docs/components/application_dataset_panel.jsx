import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
  Grid,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Badge,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Storage as StorageIcon,
  CloudQueue as CloudQueueIcon,
  Api as ApiIcon,
  Database as DatabaseIcon,
  Description as DescriptionIcon,
  ErrorOutline as ErrorIcon,
  Check as CheckIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

import DatasetBrowser from './dataset_browser';
import DatasetCard from './dataset_card';
import useDatasetManagement from './use_dataset_management';
import {
  DATASET_ASSOCIATION_TYPES,
  getDatasetTypeName,
  getSourceTypeName,
  formatFileSize,
} from './dataset_model';

// Styled components
const PanelHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const AssociationTypeChip = styled(Chip)(({ theme, type }) => {
  // Color mapping
  const colorMap = {
    [DATASET_ASSOCIATION_TYPES.PRIMARY]: theme.palette.primary.main,
    [DATASET_ASSOCIATION_TYPES.SECONDARY]: theme.palette.secondary.main,
    [DATASET_ASSOCIATION_TYPES.REFERENCE]: theme.palette.info.main,
  };

  const color = colorMap[type] || theme.palette.grey[500];

  return {
    backgroundColor: `${color}20`, // 20% opacity
    color,
    fontWeight: 500,
  };
});

const NoDatasets = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}));

/**
 * ApplicationDatasetPanel component
 * 
 * A panel for managing dataset associations with an application.
 * Displays associated datasets and provides options to manage associations.
 */
const ApplicationDatasetPanel = ({
  application,
  tenantId,
  allApplications = [],
  onUpdateApplication,
  isAdmin = false,
}) => {
  // State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [selectedAssociationType, setSelectedAssociationType] = useState(DATASET_ASSOCIATION_TYPES.SECONDARY);
  const [activeTab, setActiveTab] = useState('all');
  const [favoriteDatasets, setFavoriteDatasets] = useState([]);
  
  // Theme
  const theme = useTheme();
  
  // Get datasets using custom hook
  const {
    datasets,
    isLoading,
    error,
    fetchDatasets,
    associateDatasetWithApplication,
    removeDatasetApplicationAssociation,
    getDatasetsByApplication,
  } = useDatasetManagement(tenantId);
  
  // Load datasets on mount
  useEffect(() => {
    if (tenantId) {
      fetchDatasets();
    }
  }, [tenantId, fetchDatasets]);
  
  // Get associated datasets
  const associatedDatasets = useMemo(() => {
    return getDatasetsByApplication(application.id);
  }, [getDatasetsByApplication, application.id]);
  
  // Filter datasets by tab
  const filteredDatasets = useMemo(() => {
    if (activeTab === 'all') {
      return associatedDatasets;
    }
    
    return associatedDatasets.filter(dataset => {
      const association = dataset.applicationAssociations.find(
        a => a.applicationId === application.id
      );
      
      return association && association.associationType === activeTab;
    });
  }, [associatedDatasets, activeTab, application.id]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle open add dialog
  const handleOpenAddDialog = () => {
    setIsAddDialogOpen(true);
  };
  
  // Handle dataset selection from the browser
  const handleDatasetSelect = (dataset) => {
    setSelectedDataset(dataset);
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(true);
  };
  
  // Handle open edit dialog
  const handleOpenEditAssociation = (dataset) => {
    setSelectedDataset(dataset);
    const association = dataset.applicationAssociations.find(
      a => a.applicationId === application.id
    );
    setSelectedAssociationType(association ? association.associationType : DATASET_ASSOCIATION_TYPES.SECONDARY);
    setIsEditDialogOpen(true);
  };
  
  // Handle save association
  const handleSaveAssociation = async () => {
    if (!selectedDataset) return;
    
    try {
      await associateDatasetWithApplication(
        selectedDataset.id,
        application.id,
        application.name,
        selectedAssociationType
      );
      
      setIsEditDialogOpen(false);
      setSelectedDataset(null);
    } catch (error) {
      console.error('Failed to save association:', error);
    }
  };
  
  // Handle remove association
  const handleRemoveAssociation = async (datasetId) => {
    try {
      await removeDatasetApplicationAssociation(datasetId, application.id);
    } catch (error) {
      console.error('Failed to remove association:', error);
    }
  };
  
  // Get counts by association type
  const associationCounts = useMemo(() => {
    const counts = {
      all: associatedDatasets.length,
      [DATASET_ASSOCIATION_TYPES.PRIMARY]: 0,
      [DATASET_ASSOCIATION_TYPES.SECONDARY]: 0,
      [DATASET_ASSOCIATION_TYPES.REFERENCE]: 0,
    };
    
    associatedDatasets.forEach(dataset => {
      const association = dataset.applicationAssociations.find(
        a => a.applicationId === application.id
      );
      
      if (association && counts[association.associationType] !== undefined) {
        counts[association.associationType]++;
      }
    });
    
    return counts;
  }, [associatedDatasets, application.id]);
  
  // Get association type label
  const getAssociationTypeLabel = (type) => {
    switch (type) {
      case DATASET_ASSOCIATION_TYPES.PRIMARY:
        return 'Primary';
      case DATASET_ASSOCIATION_TYPES.SECONDARY:
        return 'Secondary';
      case DATASET_ASSOCIATION_TYPES.REFERENCE:
        return 'Reference';
      default:
        return type;
    }
  };
  
  // Get association type description
  const getAssociationTypeDescription = (type) => {
    switch (type) {
      case DATASET_ASSOCIATION_TYPES.PRIMARY:
        return 'Main dataset created or modified by this application';
      case DATASET_ASSOCIATION_TYPES.SECONDARY:
        return 'Secondary dataset used and modified by this application';
      case DATASET_ASSOCIATION_TYPES.REFERENCE:
        return 'Reference dataset used but not modified by this application';
      default:
        return '';
    }
  };
  
  return (
    <Box>
      <PanelHeader>
        <Typography variant="h5">
          Datasets
          <Chip
            label={associatedDatasets.length}
            color="primary"
            size="small"
            sx={{ ml: 1 }}
          />
        </Typography>
        
        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Add Dataset
          </Button>
        )}
      </PanelHeader>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading datasets: {error}
        </Alert>
      )}
      
      {/* Dataset types tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          aria-label="dataset association tabs"
        >
          <Tab 
            label={`All (${associationCounts.all})`} 
            value="all" 
          />
          <Tab 
            label={`Primary (${associationCounts[DATASET_ASSOCIATION_TYPES.PRIMARY]})`} 
            value={DATASET_ASSOCIATION_TYPES.PRIMARY} 
          />
          <Tab 
            label={`Secondary (${associationCounts[DATASET_ASSOCIATION_TYPES.SECONDARY]})`} 
            value={DATASET_ASSOCIATION_TYPES.SECONDARY} 
          />
          <Tab 
            label={`Reference (${associationCounts[DATASET_ASSOCIATION_TYPES.REFERENCE]})`} 
            value={DATASET_ASSOCIATION_TYPES.REFERENCE} 
          />
        </Tabs>
      </Box>
      
      {/* Loading state */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredDatasets.length === 0 ? (
        <NoDatasets>
          <StorageIcon sx={{ fontSize: 64, color: 'action.active', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No datasets associated
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {activeTab === 'all' 
              ? 'This application has no associated datasets.'
              : `No ${getAssociationTypeLabel(activeTab).toLowerCase()} datasets associated with this application.`}
          </Typography>
          {isAdmin && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
            >
              Add Dataset
            </Button>
          )}
        </NoDatasets>
      ) : (
        <Grid container spacing={3}>
          {filteredDatasets.map(dataset => {
            const association = dataset.applicationAssociations.find(
              a => a.applicationId === application.id
            );
            
            return (
              <Grid item xs={12} sm={6} md={4} key={dataset.id}>
                <Card variant="outlined">
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Tooltip title={getAssociationTypeDescription(association.associationType)}>
                        <AssociationTypeChip
                          label={getAssociationTypeLabel(association.associationType)}
                          size="small"
                          type={association.associationType}
                        />
                      </Tooltip>
                      
                      <Typography variant="caption" color="text.secondary">
                        Added: {new Date(association.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5 }}>
                      {dataset.name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {dataset.description || 'No description provided'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Box sx={{ mr: 0.5, color: 'primary.main' }}>
                        {dataset.sourceType === 'database' ? (
                          <DatabaseIcon fontSize="small" />
                        ) : dataset.sourceType === 'api' ? (
                          <ApiIcon fontSize="small" />
                        ) : dataset.sourceType === 's3' || dataset.sourceType === 'azureblob' ? (
                          <CloudQueueIcon fontSize="small" />
                        ) : (
                          <DescriptionIcon fontSize="small" />
                        )}
                      </Box>
                      
                      <Typography variant="body2" noWrap>
                        {getDatasetTypeName(dataset.type)}
                      </Typography>
                    </Box>
                    
                    {dataset.recordCount > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        {dataset.recordCount.toLocaleString()} records
                        {dataset.size > 0 && ` • ${formatFileSize(dataset.size)}`}
                      </Typography>
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    {isAdmin && (
                      <>
                        <Button 
                          size="small" 
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenEditAssociation(dataset)}
                        >
                          Edit
                        </Button>
                        
                        <Button
                          size="small"
                          color="error"
                          startIcon={<LinkOffIcon />}
                          onClick={() => handleRemoveAssociation(dataset.id)}
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      
      {/* Add Dataset Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Add Dataset to Application</DialogTitle>
        <DialogContent sx={{ height: '70vh' }}>
          <DatasetBrowser
            tenantId={tenantId}
            applications={allApplications}
            showApplicationAssociations={true}
            onDatasetSelect={handleDatasetSelect}
            isAdmin={isAdmin}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Association Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      >
        <DialogTitle>
          {selectedDataset?.applicationAssociations.some(a => a.applicationId === application.id)
            ? 'Edit Dataset Association'
            : 'Add Dataset Association'}
        </DialogTitle>
        <DialogContent>
          {selectedDataset && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                {selectedDataset.name}
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="association-type-label">Association Type</InputLabel>
                <Select
                  labelId="association-type-label"
                  value={selectedAssociationType}
                  onChange={(e) => setSelectedAssociationType(e.target.value)}
                  label="Association Type"
                >
                  <MenuItem value={DATASET_ASSOCIATION_TYPES.PRIMARY}>
                    <Box>
                      <Typography variant="subtitle2">Primary</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Main dataset created or modified by this application
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value={DATASET_ASSOCIATION_TYPES.SECONDARY}>
                    <Box>
                      <Typography variant="subtitle2">Secondary</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Secondary dataset used and modified by this application
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value={DATASET_ASSOCIATION_TYPES.REFERENCE}>
                    <Box>
                      <Typography variant="subtitle2">Reference</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Reference dataset used but not modified by this application
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              
              {selectedAssociationType === DATASET_ASSOCIATION_TYPES.PRIMARY && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Setting as primary means this application is the main producer or owner of this dataset.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveAssociation}
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

ApplicationDatasetPanel.propTypes = {
  /**
   * Application object
   */
  application: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  
  /**
   * Tenant ID
   */
  tenantId: PropTypes.string.isRequired,
  
  /**
   * All available applications
   */
  allApplications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  
  /**
   * Callback when application is updated
   */
  onUpdateApplication: PropTypes.func,
  
  /**
   * Whether the current user has admin permissions
   */
  isAdmin: PropTypes.bool,
};

export default ApplicationDatasetPanel;