import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Paper, Divider, Grid, List, ListItem, ListItemText, ListItemIcon, Checkbox, Button, TextField, FormControl, InputLabel, Select, MenuItem, Chip, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '../../../design-system';
import IconButton from '@mui/material/IconButton';;
import { 
import Box from '@mui/material/Box';
ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon 
} from '@mui/icons-material';

/**
 * Component for managing dataset-application associations
 */
const DatasetApplicationAssociation = ({
  datasets = [],
  applications = [],
  onAssociate,
  onDisassociate,
  isLoading = false,
  error = null
}) => {
  // Added display name
  DatasetApplicationAssociation.displayName = 'DatasetApplicationAssociation';

  // Added display name
  DatasetApplicationAssociation.displayName = 'DatasetApplicationAssociation';

  // Added display name
  DatasetApplicationAssociation.displayName = 'DatasetApplicationAssociation';

  // Added display name
  DatasetApplicationAssociation.displayName = 'DatasetApplicationAssociation';

  // Added display name
  DatasetApplicationAssociation.displayName = 'DatasetApplicationAssociation';


  // Selected items state
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const [selectedApplications, setSelectedApplications] = useState([]);
  
  // Search filters
  const [datasetFilter, setDatasetFilter] = useState('');
  const [applicationFilter, setApplicationFilter] = useState('');
  
  // Existing associations (from props)
  const [associations, setAssociations] = useState([]);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('associate'); // 'associate' or 'disassociate'
  
  // Initialize associations from props
  useEffect(() => {
    // Extract associations from applications and datasets
    const extractedAssociations = [];
    
    applications.forEach(app => {
      if (app.datasets && app.datasets.length > 0) {
        app.datasets.forEach(datasetId => {
          const dataset = datasets.find(d => d.id === datasetId);
          if (dataset) {
            extractedAssociations.push({
              applicationId: app.id,
              applicationName: app.name,
              datasetId: dataset.id,
              datasetName: dataset.name
            });
          }
        });
      }
    });
    
    setAssociations(extractedAssociations);
  }, [applications, datasets]);
  
  // Filtered datasets
  const filteredDatasets = datasets.filter(dataset => 
    dataset.name.toLowerCase().includes(datasetFilter.toLowerCase())
  );
  
  // Filtered applications
  const filteredApplications = applications.filter(app => 
    app.name.toLowerCase().includes(applicationFilter.toLowerCase())
  );
  
  // Handle dataset selection
  const handleDatasetSelect = useCallback((datasetId) => {
  // Added display name
  handleDatasetSelect.displayName = 'handleDatasetSelect';

    setSelectedDatasets(prev => {
      if (prev.includes(datasetId)) {
        return prev.filter(id => id !== datasetId);
      } else {
        return [...prev, datasetId];
      }
    });
  }, []);
  
  // Handle application selection
  const handleApplicationSelect = useCallback((appId) => {
  // Added display name
  handleApplicationSelect.displayName = 'handleApplicationSelect';

    setSelectedApplications(prev => {
      if (prev.includes(appId)) {
        return prev.filter(id => id !== appId);
      } else {
        return [...prev, appId];
      }
    });
  }, []);
  
  // Open association dialog
  const handleOpenAssociateDialog = () => {
  // Added display name
  handleOpenAssociateDialog.displayName = 'handleOpenAssociateDialog';

  // Added display name
  handleOpenAssociateDialog.displayName = 'handleOpenAssociateDialog';

  // Added display name
  handleOpenAssociateDialog.displayName = 'handleOpenAssociateDialog';

  // Added display name
  handleOpenAssociateDialog.displayName = 'handleOpenAssociateDialog';

  // Added display name
  handleOpenAssociateDialog.displayName = 'handleOpenAssociateDialog';


    setDialogMode('associate');
    setDialogOpen(true);
  };
  
  // Open disassociation dialog
  const handleOpenDisassociateDialog = () => {
  // Added display name
  handleOpenDisassociateDialog.displayName = 'handleOpenDisassociateDialog';

  // Added display name
  handleOpenDisassociateDialog.displayName = 'handleOpenDisassociateDialog';

  // Added display name
  handleOpenDisassociateDialog.displayName = 'handleOpenDisassociateDialog';

  // Added display name
  handleOpenDisassociateDialog.displayName = 'handleOpenDisassociateDialog';

  // Added display name
  handleOpenDisassociateDialog.displayName = 'handleOpenDisassociateDialog';


    setDialogMode('disassociate');
    setDialogOpen(true);
  };
  
  // Close dialog
  const handleCloseDialog = () => {
  // Added display name
  handleCloseDialog.displayName = 'handleCloseDialog';

  // Added display name
  handleCloseDialog.displayName = 'handleCloseDialog';

  // Added display name
  handleCloseDialog.displayName = 'handleCloseDialog';

  // Added display name
  handleCloseDialog.displayName = 'handleCloseDialog';

  // Added display name
  handleCloseDialog.displayName = 'handleCloseDialog';


    setDialogOpen(false);
  };
  
  // Handle association confirmation
  const handleConfirmAssociation = () => {
  // Added display name
  handleConfirmAssociation.displayName = 'handleConfirmAssociation';

  // Added display name
  handleConfirmAssociation.displayName = 'handleConfirmAssociation';

  // Added display name
  handleConfirmAssociation.displayName = 'handleConfirmAssociation';

  // Added display name
  handleConfirmAssociation.displayName = 'handleConfirmAssociation';

  // Added display name
  handleConfirmAssociation.displayName = 'handleConfirmAssociation';


    if (dialogMode === 'associate') {
      // Associate datasets with applications
      selectedDatasets.forEach(datasetId => {
        selectedApplications.forEach(appId => {
          // Check if association already exists
          const exists = associations.some(
            assoc => assoc.datasetId === datasetId && assoc.applicationId === appId
          );
          
          if (!exists) {
            onAssociate(appId, datasetId);
          }
        });
      });
    } else {
      // Disassociate datasets from applications
      selectedDatasets.forEach(datasetId => {
        selectedApplications.forEach(appId => {
          // Check if association exists
          const exists = associations.some(
            assoc => assoc.datasetId === datasetId && assoc.applicationId === appId
          );
          
          if (exists) {
            onDisassociate(appId, datasetId);
          }
        });
      });
    }
    
    // Reset selections and close dialog
    setSelectedDatasets([]);
    setSelectedApplications([]);
    setDialogOpen(false);
  };
  
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6&quot; component="h2" gutterBottom>
        Dataset-Application Associations
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      {error && (
        <Alert severity="error&quot; sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Actions */}
      <Box sx={{ mb: 3, display: "flex', gap: 2 }}>
        <Button
          variant="contained&quot;
          startIcon={<AddIcon />}
          onClick={handleOpenAssociateDialog}
          disabled={isLoading}
        >
          Associate
        </Button>
        
        <Button
          variant="outlined"
          color="secondary&quot;
          startIcon={<DeleteIcon />}
          onClick={handleOpenDisassociateDialog}
          disabled={isLoading}
        >
          Disassociate
        </Button>
      </Box>
      
      {/* Current Associations */}
      <Typography variant="subtitle1" gutterBottom>
        Current Associations
      </Typography>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : associations.length === 0 ? (
        <Alert severity="info&quot; sx={{ mb: 3 }}>
          No associations found. Use the Associate button to create new associations.
        </Alert>
      ) : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {applications.map(app => {
            // Get datasets associated with this application
            const appDatasets = associations
              .filter(assoc => assoc.applicationId === app.id)
              .map(assoc => {
                const dataset = datasets.find(d => d.id === assoc.datasetId);
                return dataset || { id: assoc.datasetId, name: assoc.datasetName };
              });
            
            if (appDatasets.length === 0) {
              return null;
            }
            
            return (
              <Grid item xs={12} sm={6} md={4} key={app.id}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {app.name}
                  </Typography>
                  
                  <Divider sx={{ mb: 1 }} />
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {appDatasets.map(dataset => (
                      <Chip 
                        key={dataset.id}
                        label={dataset.name}
                        onDelete={() => onDisassociate(app.id, dataset.id)}
                        disabled={isLoading}
                        size="small&quot;
                      />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
      
      {/* Association Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'associate' ? 'Associate Datasets with Applications' : 'Disassociate Datasets from Applications'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2}>
            {/* Dataset Selection */}
            <Grid item xs={12} md={5}>
              <Typography variant="subtitle2&quot; gutterBottom>
                Datasets
              </Typography>
              
              <TextField
                fullWidth
                placeholder="Search datasets..."
                value={datasetFilter}
                onChange={(e) => setDatasetFilter(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
                size="small&quot;
                margin="normal"
              />
              
              <Paper variant="outlined&quot; sx={{ maxHeight: 300, overflow: "auto', mt: 1 }}>
                <List dense>
                  {filteredDatasets.map(dataset => (
                    <ListItem
                      key={dataset.id}
                      button
                      onClick={() => handleDatasetSelect(dataset.id)}
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start&quot;
                          checked={selectedDatasets.includes(dataset.id)}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={dataset.name}
                        secondary={dataset.description || "'}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            
            {/* Arrows */}
            <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <ArrowForwardIcon color="primary&quot; fontSize="large" />
                <ArrowBackIcon color="primary&quot; fontSize="large" />
              </Box>
            </Grid>
            
            {/* Application Selection */}
            <Grid item xs={12} md={5}>
              <Typography variant="subtitle2&quot; gutterBottom>
                Applications
              </Typography>
              
              <TextField
                fullWidth
                placeholder="Search applications..."
                value={applicationFilter}
                onChange={(e) => setApplicationFilter(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
                size="small&quot;
                margin="normal"
              />
              
              <Paper variant="outlined&quot; sx={{ maxHeight: 300, overflow: "auto', mt: 1 }}>
                <List dense>
                  {filteredApplications.map(app => (
                    <ListItem
                      key={app.id}
                      button
                      onClick={() => handleApplicationSelect(app.id)}
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start&quot;
                          checked={selectedApplications.includes(app.id)}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={app.name}
                        secondary={app.description || "'}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            
            {/* Selection Summary */}
            <Grid item xs={12}>
              <Paper variant="outlined&quot; sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Items:
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2&quot;>
                      {selectedDatasets.length} dataset(s) selected
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {selectedApplications.length} application(s) selected
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAssociation}
            variant="contained&quot; 
            color={dialogMode === "associate' ? 'primary' : 'secondary'}
            disabled={selectedDatasets.length === 0 || selectedApplications.length === 0}
          >
            {dialogMode === 'associate' ? 'Associate' : 'Disassociate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

DatasetApplicationAssociation.propTypes = {
  datasets: PropTypes.array,
  applications: PropTypes.array,
  onAssociate: PropTypes.func.isRequired,
  onDisassociate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string
};

export default DatasetApplicationAssociation;