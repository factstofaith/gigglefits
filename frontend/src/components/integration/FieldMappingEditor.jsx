// FieldMappingEditor.jsx
// -----------------------------------------------------------------------------
// Component for editing field mappings between source and destination

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  FormHelperText,
  LinearProgress,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import { 
  getFieldMappings, 
  createFieldMapping, 
  updateFieldMapping, 
  deleteFieldMapping, 
  discoverFields 
} from '../../services/integrationService';

// Available transformation types
const TRANSFORMATION_TYPES = [
  { value: 'direct', label: 'Direct (No transformation)' },
  { value: 'uppercase', label: 'Convert to Uppercase' },
  { value: 'lowercase', label: 'Convert to Lowercase' },
  { value: 'trim', label: 'Trim Whitespace' },
  { value: 'format_date', label: 'Format Date' },
  { value: 'lookup', label: 'Lookup Value' },
  { value: 'concat', label: 'Concatenate Fields' },
  { value: 'split', label: 'Split Field' },
  { value: 'custom', label: 'Custom Function' }
];

export default function FieldMappingEditor({ integrationId, onUpdate }) {
  const [mappings, setMappings] = useState([]);
  const [sourceFields, setSourceFields] = useState([]);
  const [destinationFields, setDestinationFields] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentMapping, setCurrentMapping] = useState({
    source_field: '',
    destination_field: '',
    transformation: 'direct',
    required: false,
    description: ''
  });
  const [currentMappingId, setCurrentMappingId] = useState(null);
  const [loading, setLoading] = useState({
    mappings: false,
    sourceFields: false,
    destinationFields: false,
    saving: false
  });
  const [errors, setErrors] = useState({});

  // Load initial data
  useEffect(() => {
    if (integrationId) {
      fetchMappings();
      fetchSourceFields();
      fetchDestinationFields();
    }
  }, [integrationId]);

  // Fetch mappings from API
  const fetchMappings = async () => {
    if (!integrationId) return;
    
    try {
      setLoading(prev => ({ ...prev, mappings: true }));
      const data = await getFieldMappings(integrationId);
      setMappings(data || []);
    } catch (error) {
      console.error('Error fetching field mappings:', error);
    } finally {
      setLoading(prev => ({ ...prev, mappings: false }));
    }
  };

  // Discover source fields from API
  const fetchSourceFields = async () => {
    if (!integrationId) return;
    
    try {
      setLoading(prev => ({ ...prev, sourceFields: true }));
      const data = await discoverFields(integrationId, 'source');
      setSourceFields(data || []);
    } catch (error) {
      console.error('Error discovering source fields:', error);
    } finally {
      setLoading(prev => ({ ...prev, sourceFields: false }));
    }
  };

  // Discover destination fields from API
  const fetchDestinationFields = async () => {
    if (!integrationId) return;
    
    try {
      setLoading(prev => ({ ...prev, destinationFields: true }));
      const data = await discoverFields(integrationId, 'destination');
      setDestinationFields(data || []);
    } catch (error) {
      console.error('Error discovering destination fields:', error);
    } finally {
      setLoading(prev => ({ ...prev, destinationFields: false }));
    }
  };

  // Open the dialog to add a new mapping
  const handleAddMapping = () => {
    setEditMode(false);
    setCurrentMapping({
      source_field: '',
      destination_field: '',
      transformation: 'direct',
      required: false,
      description: ''
    });
    setCurrentMappingId(null);
    setErrors({});
    setDialogOpen(true);
  };

  // Open the dialog to edit an existing mapping
  const handleEditMapping = (mapping) => {
    setEditMode(true);
    setCurrentMapping({
      source_field: mapping.source_field,
      destination_field: mapping.destination_field,
      transformation: mapping.transformation,
      required: mapping.required,
      description: mapping.description || ''
    });
    setCurrentMappingId(mapping.id);
    setErrors({});
    setDialogOpen(true);
  };

  // Handle changes to the current mapping in the dialog
  const handleMappingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentMapping(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate the mapping form
  const validateMapping = () => {
    const newErrors = {};
    
    if (!currentMapping.source_field) {
      newErrors.source_field = 'Source field is required';
    }
    
    if (!currentMapping.destination_field) {
      newErrors.destination_field = 'Destination field is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save the current mapping (create or update)
  const handleSaveMapping = async () => {
    if (!validateMapping()) return;
    
    try {
      setLoading(prev => ({ ...prev, saving: true }));
      
      if (editMode && currentMappingId) {
        // Update existing mapping
        await updateFieldMapping(integrationId, currentMappingId, currentMapping);
      } else {
        // Create new mapping
        await createFieldMapping(integrationId, currentMapping);
      }
      
      // Refresh mappings list
      await fetchMappings();
      
      // Notify parent if callback provided
      if (onUpdate) {
        onUpdate();
      }
      
      // Close the dialog
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving field mapping:', error);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  // Delete a mapping
  const handleDeleteMapping = async (id) => {
    if (!window.confirm('Are you sure you want to delete this field mapping?')) {
      return;
    }
    
    try {
      await deleteFieldMapping(integrationId, id);
      
      // Refresh mappings list
      await fetchMappings();
      
      // Notify parent if callback provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting field mapping:', error);
    }
  };

  // Refresh field data from sources
  const handleRefreshFields = () => {
    fetchSourceFields();
    fetchDestinationFields();
  };

  return (
    <Box>
      <Card>
        <CardHeader
          title="Field Mappings"
          subheader="Configure how fields are mapped from source to destination"
          action={
            <Box display="flex" gap={1}>
              <Tooltip title="Refresh Fields">
                <IconButton onClick={handleRefreshFields} disabled={loading.sourceFields || loading.destinationFields}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddMapping}
              >
                Add Mapping
              </Button>
            </Box>
          }
        />
        
        {(loading.mappings || loading.sourceFields || loading.destinationFields) && (
          <LinearProgress />
        )}
        
        <CardContent>
          {mappings.length > 0 ? (
            <List>
              {mappings.map((mapping, index) => (
                <React.Fragment key={mapping.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        onClick={() => handleDeleteMapping(mapping.id)}
                        aria-label="Delete mapping"
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box 
                          display="flex" 
                          alignItems="center" 
                          gap={1} 
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleEditMapping(mapping)}
                        >
                          <Typography variant="body1">{mapping.source_field}</Typography>
                          <Typography variant="body2" color="text.secondary">→</Typography>
                          <Typography variant="body1">{mapping.destination_field}</Typography>
                          {mapping.required && (
                            <Typography variant="caption" sx={{ bgcolor: 'error.light', px: 1, borderRadius: 1 }}>
                              Required
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" display="block">
                            Transformation: {TRANSFORMATION_TYPES.find(t => t.value === mapping.transformation)?.label || mapping.transformation}
                          </Typography>
                          {mapping.description && (
                            <Typography variant="caption" display="block">
                              {mapping.description}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No field mappings defined yet. Click "Add Mapping" to create your first mapping.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Field Mapping Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? 'Edit Field Mapping' : 'Add Field Mapping'}
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={5}>
              <FormControl fullWidth margin="normal" error={!!errors.source_field}>
                <InputLabel>Source Field</InputLabel>
                <Select
                  name="source_field"
                  value={currentMapping.source_field}
                  onChange={handleMappingChange}
                  label="Source Field"
                  disabled={loading.sourceFields}
                >
                  {sourceFields.map(field => (
                    <MenuItem key={field.name} value={field.name}>
                      <Typography>
                        {field.name}
                        <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1 }}>
                          ({field.type})
                        </Typography>
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
                {errors.source_field && <FormHelperText>{errors.source_field}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h6">→</Typography>
            </Grid>
            
            <Grid item xs={12} sm={5}>
              <FormControl fullWidth margin="normal" error={!!errors.destination_field}>
                <InputLabel>Destination Field</InputLabel>
                <Select
                  name="destination_field"
                  value={currentMapping.destination_field}
                  onChange={handleMappingChange}
                  label="Destination Field"
                  disabled={loading.destinationFields}
                >
                  {destinationFields.map(field => (
                    <MenuItem key={field.name} value={field.name}>
                      <Typography>
                        {field.name}
                        <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1 }}>
                          ({field.type})
                        </Typography>
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
                {errors.destination_field && <FormHelperText>{errors.destination_field}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Transformation</InputLabel>
                <Select
                  name="transformation"
                  value={currentMapping.transformation}
                  onChange={handleMappingChange}
                  label="Transformation"
                >
                  {TRANSFORMATION_TYPES.map(option => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description (Optional)"
                name="description"
                value={currentMapping.description}
                onChange={handleMappingChange}
                fullWidth
                multiline
                rows={2}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl>
                <label>
                  <input
                    type="checkbox"
                    name="required"
                    checked={currentMapping.required}
                    onChange={handleMappingChange}
                  />
                  <Typography component="span" sx={{ ml: 1 }}>
                    This field is required
                  </Typography>
                </label>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveMapping}
            color="primary"
            disabled={loading.saving}
          >
            {loading.saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}