// FieldMappingEditor.jsx
// -----------------------------------------------------------------------------
// Component for editing field mappings between source and destination

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  List,
  Button,
  Select,
  TextField,
  Dialog,
  Switch
} from '../../design-system';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

import {
import Box from '@mui/material/Box';
  getFieldMappings,
  createFieldMapping,
  updateFieldMapping,
  deleteFieldMapping,
  discoverFields,
  getTransformations,
} from '../../services/integrationService';

// Fallback transformation types if API fails
const FALLBACK_TRANSFORMATIONS = [;
  { name: 'direct', description: 'Direct (No transformation)' },
  { name: 'uppercase', description: 'Convert to Uppercase' },
  { name: 'lowercase', description: 'Convert to Lowercase' },
  { name: 'trim', description: 'Trim Whitespace' },
];

// Helper to get field type
const getFieldType = (fieldName, fields) => {
  // Added display name
  getFieldType.displayName = 'getFieldType';

  // Added display name
  getFieldType.displayName = 'getFieldType';

  // Added display name
  getFieldType.displayName = 'getFieldType';


  const field = fields.find(f => f.name === fieldName);
  return field ? field.type : 'string';
};

export default function FieldMappingEditor({ integrationId, onUpdate }) {
  // Added display name
  FieldMappingEditor.displayName = 'FieldMappingEditor';

  const [mappings, setMappings] = useState([]);
  const [sourceFields, setSourceFields] = useState([]);
  const [destinationFields, setDestinationFields] = useState([]);
  const [transformations, setTransformations] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentMapping, setCurrentMapping] = useState({
    source_field: ',
    destination_field: '',
    transformation: 'direct',
    transform_params: {},
    required: false,
    description: ',
  });
  const [currentMappingId, setCurrentMappingId] = useState(null);
  const [loading, setLoading] = useState({
    mappings: false,
    sourceFields: false,
    destinationFields: false,
    transformations: false,
    saving: false,
  });
  const [errors, setErrors] = useState({});
  const [filterableTransformations, setFilterableTransformations] = useState([]);

  // Load initial data
  useEffect(() => {
    if (integrationId) {
      fetchMappings();
      fetchSourceFields();
      fetchDestinationFields();
      fetchTransformations();
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

  // Fetch available transformations
  const fetchTransformations = async () => {
    try {
      setLoading(prev => ({ ...prev, transformations: true }));
      const data = await getTransformations();
      setTransformations(data || FALLBACK_TRANSFORMATIONS);
    } catch (error) {
      console.error('Error fetching transformations:', error);
      setTransformations(FALLBACK_TRANSFORMATIONS);
    } finally {
      setLoading(prev => ({ ...prev, transformations: false }));
    }
  };

  // Filter transformations based on field type
  useEffect(() => {
    if (currentMapping.source_field) {
      const fieldType = getFieldType(currentMapping.source_field, sourceFields);

      try {
        const fetchFilteredTransformations = async () => {
          const data = await getTransformations(fieldType);
          setFilterableTransformations(data);
        };

        fetchFilteredTransformations();
      } catch (error) {
        console.error('Error fetching transformations for type ${fieldType}:', error);
        setFilterableTransformations(transformations);
      }
    } else {
      setFilterableTransformations(transformations);
    }
  }, [currentMapping.source_field, sourceFields]);

  // Open the dialog to add a new mapping
  const handleAddMapping = () => {
  // Added display name
  handleAddMapping.displayName = 'handleAddMapping';

  // Added display name
  handleAddMapping.displayName = 'handleAddMapping';

  // Added display name
  handleAddMapping.displayName = 'handleAddMapping';


    setEditMode(false);
    setCurrentMapping({
      source_field: ',
      destination_field: '',
      transformation: 'direct',
      transform_params: {},
      required: false,
      description: ',
    });
    setCurrentMappingId(null);
    setErrors({});
    setDialogOpen(true);
  };

  // Open the dialog to edit an existing mapping
  const handleEditMapping = mapping => {
    setEditMode(true);
    setCurrentMapping({
      source_field: mapping.source_field,
      destination_field: mapping.destination_field,
      transformation: mapping.transformation || 'direct',
      transform_params: mapping.transform_params || {},
      required: mapping.required,
      description: mapping.description || ',
    });
    setCurrentMappingId(mapping.id);
    setErrors({});
    setDialogOpen(true);
  };

  // Handle changes to the current mapping in the dialog
  const handleMappingChange = e => {
    const { name, value, type, checked } = e.target;

    // If transformation changes, reset the parameters
    if (name === 'transformation') {
      setCurrentMapping(prev => ({
        ...prev,
        [name]: value,
        transform_params: {}, // Reset params when transformation changes
      }));
    } else {
      setCurrentMapping(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle changes to transformation parameters
  const handleParamChange = (paramName, value) => {
  // Added display name
  handleParamChange.displayName = 'handleParamChange';

  // Added display name
  handleParamChange.displayName = 'handleParamChange';

  // Added display name
  handleParamChange.displayName = 'handleParamChange';


    setCurrentMapping(prev => ({
      ...prev,
      transform_params: {
        ...prev.transform_params,
        [paramName]: value,
      },
    }));
  };

  // Validate the mapping form
  const validateMapping = () => {
  // Added display name
  validateMapping.displayName = 'validateMapping';

  // Added display name
  validateMapping.displayName = 'validateMapping';

  // Added display name
  validateMapping.displayName = 'validateMapping';


    const newErrors = {};

    if (!currentMapping.source_field) {
      newErrors.source_field = 'Source field is required';
    }

    if (!currentMapping.destination_field) {
      newErrors.destination_field = 'Destination field is required';
    }

    // Check for required transformation parameters
    const currentTransformation = transformations.find(
      t => t.name === currentMapping.transformation;
    );
    if (currentTransformation && currentTransformation.params) {
      currentTransformation.params.forEach(param => {
        if (param.required && !currentMapping.transform_params[param.name]) {
          newErrors['param_${param.name}'] = '${param.name} is required';
        }
      });
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
        await createFieldMapping(integrationId, {
          ...currentMapping,
          integration_id: integrationId,
        });
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

      // Add error handling to display error to user
      setErrors(prev => ({
        ...prev,
        form: 'Failed to save field mapping. Please check your inputs and try again.',
      }));

      // Keep dialog open so user can fix issues
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  // Delete a mapping
  const handleDeleteMapping = async id => {
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
  // Added display name
  handleRefreshFields.displayName = 'handleRefreshFields';

  // Added display name
  handleRefreshFields.displayName = 'handleRefreshFields';

  // Added display name
  handleRefreshFields.displayName = 'handleRefreshFields';


    fetchSourceFields();
    fetchDestinationFields();
    fetchTransformations();
  };

  // Get the current transformation's parameters
  const getCurrentTransformationParams = () => {
  // Added display name
  getCurrentTransformationParams.displayName = 'getCurrentTransformationParams';

  // Added display name
  getCurrentTransformationParams.displayName = 'getCurrentTransformationParams';

  // Added display name
  getCurrentTransformationParams.displayName = 'getCurrentTransformationParams';


    const transformation = transformations.find(t => t.name === currentMapping.transformation);
    return transformation ? transformation.params || [] : [];
  };

  // Render parameter input based on param type
  const renderParamInput = param => {
    const value = currentMapping.transform_params[param.name] ?? param.default ?? ';
    const error = errors['param_${param.name}'];

    switch (param.type) {
      case 'boolean':
        return (
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              as="label" 
              style={{ 
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <Switch
                checked={Boolean(value)}
                onChange={e => handleParamChange(param.name, e.target.checked)}
              />
              <Typography style={{ marginLeft: '8px' }}>
                {param.description}
              </Typography>
            </Box>
          </Box>
        );

      case 'number':
        return (
          <Box style={{ marginBottom: '8px' }}>
            <Typography 
              variant="body2" 
              style={{ marginBottom: '4px', fontWeight: 'medium' }}
            >
              {param.description}
            </Typography>
            <TextField
              value={value}
              onChange={e => handleParamChange(param.name, Number(e.target.value))}
              type="number"
              fullWidth
              error={!!error}
            />
            {error && (
              <Typography variant="caption" style={{ color: '#d32f2f', marginTop: '4px' }}>
                {error}
              </Typography>
            )}
          </Box>
        );

      case 'object':
        // For object types, provide a JSON editor
        return (
          <Box style={{ marginBottom: '8px' }}>
            <Typography 
              variant="body2" 
              style={{ marginBottom: '4px', fontWeight: 'medium' }}
            >
              {param.description}
            </Typography>
            <TextField
              value={typeof value === 'object' ? JSON.stringify(value) : value}
              onChange={e => {
                try {
                  // Try to parse as JSON
                  const jsonValue = JSON.parse(e.target.value);
                  handleParamChange(param.name, jsonValue);
                } catch {
                  // If not valid JSON, keep as string
                  handleParamChange(param.name, e.target.value);
                }
              }}
              fullWidth
              multiline
              rows={3}
              error={!!error}
            />
            <Typography 
              variant="caption" 
              style={{ 
                color: error ? '#d32f2f' : '#666666', 
                marginTop: '4px' 
              }}
            >
              {error ? error : 'Enter as JSON: { "key": "value" }'}
            </Typography>
          </Box>
        );

      default: // string or any other type
        return (
          <Box style={{ marginBottom: '8px' }}>
            <Typography 
              variant="body2" 
              style={{ marginBottom: '4px', fontWeight: 'medium' }}
            >
              {param.description}
            </Typography>
            <TextField
              value={value}
              onChange={e => handleParamChange(param.name, e.target.value)}
              fullWidth
              error={!!error}
            />
            {error && (
              <Typography variant="caption" style={{ color: '#d32f2f', marginTop: '4px' }}>
                {error}
              </Typography>
            )}
          </Box>
        );
    }
  };

  // Get transformation description for display
  const getTransformationDescription = transformName => {
    const transformation = transformations.find(t => t.name === transformName);
    return transformation ? transformation.description : transformName;
  };

  // Render transformation parameters for a mapping
  const renderMappingDetails = mapping => {
    const transformation = transformations.find(t => t.name === mapping.transformation);
    const params = mapping.transform_params || {};

    if (!transformation || !transformation.params || Object.keys(params).length === 0) {
      return null;
    }

    return (
      <Box style={{ marginTop: '8px' }}>
        {Object.entries(params).map(([key, value]) => {
          const param = transformation.params.find(p => p.name === key);
          if (!param) return null;

          return (
            <Typography key={key} variant="caption" style={{ display: 'block', color: '#666666' }}>
              <span style={{ fontWeight: 'medium' }}>{param.description}:</span>{' '}
              {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
            </Typography>
          );
        })}
      </Box>
    );
  };

  return (
    <Box>
      <Card>
        <Card.Header
          title="Field Mappings"
          subheader="Configure how fields are mapped from source to destination"
          action={
            <Box style={{ display: 'flex', gap: '8px' }}>
              <Box
                as="button"
                title="Refresh Fields"
                onClick={handleRefreshFields}
                disabled={loading.sourceFields || loading.destinationFields}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <RefreshIcon />
              </Box>
              <Button
                variant="contained"
                size="small"
                onClick={handleAddMapping}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <AddIcon style={{ marginRight: '4px', fontSize: '18px' }} />
                Add Mapping
              </Button>
            </Box>
          }
        />

        {(loading.mappings || loading.sourceFields || loading.destinationFields) && (
          <Box style={{ width: '100%', height: '4px', backgroundColor: '#e0e0e0', position: 'relative' }}>
            <Box style={{ 
              position: 'absolute',
              height: '100%',
              width: '30%',
              backgroundColor: '#1976d2',
              animation: 'loading 1.5s infinite ease-in-out'
            }} />
          </Box>
        )}

        <Card.Content>
          {mappings.length > 0 ? (
            <List>
              {mappings.map((mapping, index) => (
                <React.Fragment key={mapping.id}>
                  {index > 0 && <Box style={{ height: '1px', backgroundColor: '#e0e0e0', margin: '0 16px' }} />}
                  <List.Item>
                    <Box style={{ 
                      display: 'flex', 
                      width: '100%', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <Box 
                        style={{ 
                          flex: 1, 
                          cursor: 'pointer' 
                        }}
                        onClick={() => handleEditMapping(mapping)}
                      >
                        <Box 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            marginBottom: '4px' 
                          }}
                        >
                          <Typography variant="body1">{mapping.source_field}</Typography>
                          <Typography variant="body2" style={{ color: '#666666' }}>
                            →
                          </Typography>
                          <Typography variant="body1">{mapping.destination_field}</Typography>
                          {mapping.required && (
                            <Box 
                              style={{ 
                                border: '1px solid #d32f2f', 
                                borderRadius: '16px', 
                                padding: '0 8px', 
                                fontSize: '12px', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                height: '20px',
                                color: '#d32f2f'
                              }}
                            >
                              Required
                            </Box>
                          )}
                          <Box 
                            style={{ 
                              border: '1px solid #1976d2', 
                              borderRadius: '16px', 
                              padding: '0 8px', 
                              fontSize: '12px', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              height: '20px',
                              color: '#1976d2'
                            }}
                          >
                            {getTransformationDescription(mapping.transformation)}
                          </Box>
                        </Box>
                        {mapping.description && (
                          <Typography 
                            variant="caption" 
                            style={{ 
                              display: 'block', 
                              color: '#666666' 
                            }}
                          >
                            {mapping.description}
                          </Typography>
                        )}
                        {renderMappingDetails(mapping)}
                      </Box>
                      <Box
                        as="button"
                        onClick={() => handleDeleteMapping(mapping.id)}
                        aria-label="Delete mapping"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'transparent',
                          border: 'none',
                          padding: '8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#d32f2f'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(211, 47, 47, 0.08)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <DeleteIcon />
                      </Box>
                    </Box>
                  </List.Item>
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box style={{ padding: '24px', textAlign: 'center' }}>
              <Typography style={{ color: '#666666' }}>
                No field mappings defined yet. Click "Add Mapping" to create your first mapping.
              </Typography>
            </Box>
          )}
        </Card.Content>
      </Card>

      {/* Field Mapping Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        size="lg"
        title={editMode ? 'Edit Field Mapping' : 'Add Field Mapping'}
      >
        <Box style={{ padding: '16px' }}>
          <Grid.Container spacing="md">
            <Grid.Item xs={12} sm={5}>
              <Box style={{ marginBottom: '16px' }}>
                <Typography 
                  variant="body2" 
                  style={{ marginBottom: '4px', fontWeight: 'medium' }}
                >
                  Source Field
                </Typography>
                <Select
                  name="source_field"
                  value={currentMapping.source_field}
                  onChange={handleMappingChange}
                  disabled={loading.sourceFields}
                  error={!!errors.source_field}
                  fullWidth
                  options={sourceFields.map(field => ({
                    value: field.name,
                    label: '${field.name} (${field.type})',
                    description: field.description
                  }))}
                />
                {errors.source_field && (
                  <Typography variant="caption" style={{ color: '#d32f2f', marginTop: '4px' }}>
                    {errors.source_field}
                  </Typography>
                )}
              </Box>
            </Grid.Item>

            <Grid.Item
              xs={12}
              sm={2}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Typography variant="h6">→</Typography>
            </Grid.Item>

            <Grid.Item xs={12} sm={5}>
              <Box style={{ marginBottom: '16px' }}>
                <Typography 
                  variant="body2" 
                  style={{ marginBottom: '4px', fontWeight: 'medium' }}
                >
                  Destination Field
                </Typography>
                <Select
                  name="destination_field"
                  value={currentMapping.destination_field}
                  onChange={handleMappingChange}
                  disabled={loading.destinationFields}
                  error={!!errors.destination_field}
                  fullWidth
                  options={destinationFields.map(field => ({
                    value: field.name,
                    label: '${field.name} (${field.type})',
                    description: field.description
                  }))}
                />
                {errors.destination_field && (
                  <Typography variant="caption" style={{ color: '#d32f2f', marginTop: '4px' }}>
                    {errors.destination_field}
                  </Typography>
                )}
              </Box>
            </Grid.Item>

            <Grid.Item xs={12}>
              <Box style={{ marginBottom: '16px' }}>
                <Typography 
                  variant="body2" 
                  style={{ marginBottom: '4px', fontWeight: 'medium' }}
                >
                  Transformation
                </Typography>
                <Select
                  name="transformation"
                  value={currentMapping.transformation}
                  onChange={handleMappingChange}
                  fullWidth
                  options={filterableTransformations.map(transformation => ({
                    value: transformation.name,
                    label: transformation.description || transformation.name,
                  }))}
                />
              </Box>
            </Grid.Item>

            {/* Transformation Parameters */}
            {getCurrentTransformationParams().length > 0 && (
              <Grid.Item xs={12}>
                <Box 
                  style={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '4px', 
                    marginBottom: '16px' 
                  }}
                >
                  <Box 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderBottom: '1px solid #e0e0e0',
                      cursor: 'pointer'
                    }}
                  >
                    <Typography variant="subtitle2">Transformation Settings</Typography>
                    <ExpandMoreIcon />
                  </Box>
                  <Box style={{ padding: '16px' }}>
                    <Grid.Container spacing="md">
                      {getCurrentTransformationParams().map(param => (
                        <Grid.Item xs={12} sm={param.type === 'object' ? 12 : 6} key={param.name}>
                          {renderParamInput(param)}
                        </Grid.Item>
                      ))}
                    </Grid.Container>
                  </Box>
                </Box>
              </Grid.Item>
            )}

            <Grid.Item xs={12}>
              <Box style={{ marginBottom: '16px' }}>
                <Typography 
                  variant="body2" 
                  style={{ marginBottom: '4px', fontWeight: 'medium' }}
                >
                  Description (Optional)
                </Typography>
                <TextField
                  name="description"
                  value={currentMapping.description}
                  onChange={handleMappingChange}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Box>
            </Grid.Item>

            <Grid.Item xs={12}>
              <Box style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <Box 
                  as="label" 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <Switch
                    name="required"
                    checked={currentMapping.required}
                    onChange={handleMappingChange}
                  />
                  <Typography style={{ marginLeft: '8px' }}>
                    This field is required
                  </Typography>
                </Box>
                <Box
                  as="span"
                  title="If marked as required, the integration will fail if this field is not present in the source data"
                  style={{ marginLeft: '8px', display: 'flex', alignItems: 'center' }}
                >
                  <InfoIcon style={{ fontSize: '18px', color: '#757575' }} />
                </Box>
              </Box>
            </Grid.Item>
          </Grid.Container>
        </Box>
        
        <Box style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px', borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" style={{ marginRight: '8px' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveMapping}
            disabled={loading.saving}
          >
            {loading.saving ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}
