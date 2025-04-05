import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling"; /**
                                                                                      * SchemaInferenceViewer Component
                                                                                      * 
                                                                                      * Displays inferred schema with field types, confidence levels,
                                                                                      * and allows users to review and adjust the schema.
                                                                                      */
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types'; // Import MUI components
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, FormControl, InputLabel, Slider, Switch, FormControlLabel, TextField, Button, IconButton, Chip, Tooltip, Card, CardContent, Alert, Collapse, Divider, Grid, Badge, LinearProgress } from '@mui/material';

// Import icons
import { Edit as EditIcon, Check as CheckIcon, Save as SaveIcon, Refresh as RefreshIcon, CheckCircle as ValidIcon, Warning as WarningIcon, Help as HelpIcon, Info as InfoIcon, FilterAlt as FilterIcon, KeyboardArrowDown as ExpandIcon, KeyboardArrowUp as CollapseIcon, Delete as DeleteIcon, Settings as SettingsIcon, Download as DownloadIcon } from '@mui/icons-material';

// Import schema inference utilities
import { inferSchema, DATA_TYPES, CONFIDENCE_THRESHOLD, convertToSchemaDefinition, getSchemaDescription } from "@/utils/schemaInference";

/**
 * Schema Field Row Component
 * Displays a single field in the schema with editing capabilities
 */
const SchemaFieldRow = ({
  field,
  onFieldUpdate,
  onFieldRemove,
  showConfidence,
  showStats,
  allTypes = Object.values(DATA_TYPES)
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedField, setEditedField] = useState({
    ...field
  });

  // Handle field type change
  const handleTypeChange = event => {
    setEditedField({
      ...editedField,
      type: event.target.value
    });
  };

  // Handle required toggle
  const handleRequiredChange = event => {
    setEditedField({
      ...editedField,
      required: event.target.checked
    });
  };

  // Save field changes
  const handleSave = () => {
    onFieldUpdate(field.name, editedField);
    setIsEditing(false);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditedField({
      ...field
    });
    setIsEditing(false);
  };

  // Get color based on confidence
  const getConfidenceColor = confidence => {
    if (confidence >= CONFIDENCE_THRESHOLD.HIGH) return 'success';
    if (confidence >= CONFIDENCE_THRESHOLD.MEDIUM) return 'info';
    if (confidence >= CONFIDENCE_THRESHOLD.LOW) return 'warning';
    return 'error';
  };

  // Format confidence as percentage
  const formatConfidence = confidence => {
    return `${(confidence * 100).toFixed(0)}%`;
  };

  // Render field statistics if available
  const renderFieldStatistics = () => {
    if (!showStats || !field.statistics) return null;
    const stats = field.statistics;

    // Different statistics based on field type
    switch (field.type) {
      case DATA_TYPES.NUMBER:
      case DATA_TYPES.INTEGER:
      case DATA_TYPES.CURRENCY:
      case DATA_TYPES.PERCENTAGE:
        return <Box sx={{
          fontSize: '0.75rem',
          color: 'text.secondary',
          mt: 0.5
        }}>
            {stats.min !== undefined && stats.max !== undefined && <Typography variant="caption" display="block">
                Range: {stats.min} to {stats.max}
              </Typography>}

            {stats.avg !== undefined && <Typography variant="caption" display="block">
                Avg: {stats.avg.toFixed(2)}
                {stats.stdDev ? ` (±${stats.stdDev.toFixed(2)})` : ''}
              </Typography>}

          </Box>;
      case DATA_TYPES.STRING:
      case DATA_TYPES.EMAIL:
      case DATA_TYPES.URL:
        return <Box sx={{
          fontSize: '0.75rem',
          color: 'text.secondary',
          mt: 0.5
        }}>
            {stats.minLength !== undefined && stats.maxLength !== undefined && <Typography variant="caption" display="block">
                Length: {stats.minLength} to {stats.maxLength} chars
              </Typography>}

            {stats.uniqueCount !== undefined && stats.nonNullCount !== undefined && <Typography variant="caption" display="block">
                Unique: {stats.uniqueCount}/{stats.nonNullCount} values
              </Typography>}

          </Box>;
      case DATA_TYPES.DATE:
      case DATA_TYPES.DATETIME:
        return <Box sx={{
          fontSize: '0.75rem',
          color: 'text.secondary',
          mt: 0.5
        }}>
            {stats.minDate && stats.maxDate && <Typography variant="caption" display="block">
                Range: {new Date(stats.minDate).toLocaleDateString()} to {new Date(stats.maxDate).toLocaleDateString()}
              </Typography>}

            {stats.dateRange !== undefined && <Typography variant="caption" display="block">
                Span: {stats.dateRange} days
              </Typography>}

          </Box>;
      default:
        return <Box sx={{
          fontSize: '0.75rem',
          color: 'text.secondary',
          mt: 0.5
        }}>
            {stats.uniqueCount !== undefined && stats.nonNullCount !== undefined && <Typography variant="caption" display="block">
                Unique: {stats.uniqueCount}/{stats.nonNullCount} values
              </Typography>}

            {stats.nullPercentage !== undefined && <Typography variant="caption" display="block">
                Null: {stats.nullPercentage.toFixed(1)}%
              </Typography>}

          </Box>;
    }
  };
  return <TableRow hover sx={{
    '&:last-child td, &:last-child th': {
      border: 0
    }
  }}>
      <TableCell component="th" scope="row">
        {field.name}
        {field.isPrimaryKeyCandidate && <Tooltip title="Potential Primary Key">
            <Chip label="PK" size="small" color="primary" variant="outlined" sx={{
          ml: 1
        }} />

          </Tooltip>}

      </TableCell>
      
      <TableCell>
        {isEditing ? <FormControl fullWidth size="small">
            <Select value={editedField.type} onChange={handleTypeChange} displayEmpty>

              {allTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}

            </Select>
          </FormControl> : <Chip label={field.type} size="small" color={field.confidence >= CONFIDENCE_THRESHOLD.HIGH ? "primary" : "default"} />}


        
        {field.alternativeTypes && field.alternativeTypes.length > 0 && !isEditing && <Box sx={{
        mt: 0.5
      }}>
            {field.alternativeTypes.slice(0, 2).map(alt => <Chip key={alt.type} label={alt.type} size="small" variant="outlined" sx={{
          mr: 0.5,
          mt: 0.5,
          fontSize: '0.65rem'
        }} />)}


            {field.alternativeTypes.length > 2 && <Chip label={`+${field.alternativeTypes.length - 2} more`} size="small" variant="outlined" sx={{
          mt: 0.5,
          fontSize: '0.65rem'
        }} />}


          </Box>}

      </TableCell>
      
      {showConfidence && <TableCell align="center">
          <Chip label={formatConfidence(field.confidence)} size="small" color={getConfidenceColor(field.confidence)} />

        </TableCell>}

      
      <TableCell align="center">
        {isEditing ? <FormControlLabel control={<Switch checked={editedField.required} onChange={handleRequiredChange} size="small" />} label="" /> : field.required ? <Chip label="Required" size="small" color="primary" /> : <Chip label="Optional" size="small" variant="outlined" />}


      </TableCell>
      
      {showStats && <TableCell>
          {renderFieldStatistics()}
        </TableCell>}

      
      <TableCell align="right">
        {isEditing ? <Box>
            <IconButton size="small" onClick={handleSave}>
              <CheckIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleCancel}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box> : <Box>
            <IconButton size="small" onClick={() => setIsEditing(true)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onFieldRemove(field.name)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>}

      </TableCell>
    </TableRow>;
};

/**
 * SchemaInferenceViewer Component
 * Main component for displaying and editing inferred schema
 */
const SchemaInferenceViewer = ({
  data = [],
  inferredSchema = null,
  onSchemaChange = () => {},
  maxHeight = 500,
  showConfidence = true,
  showStatistics = true,
  allowEditing = true,
  sampleSize = 1000,
  confidenceThreshold = CONFIDENCE_THRESHOLD.MEDIUM
}) => {
  const [formError, setFormError] = useState(null);
  // Schema state
  const [schema, setSchema] = useState(null);
  const [isInferring, setIsInferring] = useState(false);
  const [settings, setSettings] = useState({
    sampleSize,
    confidenceThreshold,
    detectSpecialTypes: true,
    includeStatistics: true
  });
  const [showSettings, setShowSettings] = useState(false);

  // Infer schema if not provided
  useEffect(() => {
    if (!data || data.length === 0) {
      setSchema(null);
      return;
    }
    if (inferredSchema) {
      setSchema(inferredSchema);
      return;
    }
    setIsInferring(true);

    // Use setTimeout to avoid blocking UI, with cleanup for memory leaks
    const timer = setTimeout(() => {
      try {
        const inferred = inferSchema(data, settings);
        setSchema(inferred);
        onSchemaChange(inferred);
      } catch (error) {
        console.error('Error inferring schema:', error);
      } finally {
        setIsInferring(false);
      }
    }, 0);

    // Cleanup the timer when component unmounts or dependencies change
    return () => clearTimeout(timer);
  }, [data, inferredSchema, settings, onSchemaChange]);

  // Handle field update - memoized to prevent recreation on each render
  const handleFieldUpdate = React.useCallback((fieldName, updatedField) => {
    if (!schema || !schema.fields) return;
    const updatedFields = schema.fields.map(field => field.name === fieldName ? updatedField : field);
    const updatedSchema = {
      ...schema,
      fields: updatedFields
    };
    setSchema(updatedSchema);
    onSchemaChange(updatedSchema);
  }, [schema, onSchemaChange]);

  // Handle field removal - memoized to prevent recreation on each render
  const handleFieldRemove = React.useCallback(fieldName => {
    if (!schema || !schema.fields) return;
    const updatedFields = schema.fields.filter(field => field.name !== fieldName);
    const updatedSchema = {
      ...schema,
      fields: updatedFields
    };
    setSchema(updatedSchema);
    onSchemaChange(updatedSchema);
  }, [schema, onSchemaChange]);

  // Handle refresh schema - memoized to prevent recreation on each render
  const handleRefreshSchema = React.useCallback(() => {
    setIsInferring(true);
    const timer = setTimeout(() => {
      try {
        const inferred = inferSchema(data, settings);
        setSchema(inferred);
        onSchemaChange(inferred);
      } catch (error) {
        console.error('Error inferring schema:', error);
      } finally {
        setIsInferring(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [data, settings, onSchemaChange]);

  // Handle settings change - memoized to prevent recreation on each render
  const handleSettingChange = React.useCallback((setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  }, []);

  // Convert schema to JSON - memoized to prevent recreation on each render
  const handleExportSchema = React.useCallback(() => {
    if (!schema) return;
    let url = null;
    try {
      const jsonSchema = convertToSchemaDefinition(schema, {
        requiredByDefault: false,
        format: 'jsonSchema'
      });
      const blob = new Blob([JSON.stringify(jsonSchema, null, 2)], {
        type: 'application/json'
      });
      url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `schema-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
    } catch (error) {
      console.error('Error exporting schema:', error);
    } finally {
      // Clean up resources
      if (url) {
        URL.revokeObjectURL(url);
      }

      // Make sure the element is removed from the DOM
      const links = document.querySelectorAll('a[download]');
      links.forEach(link => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      });
    }
  }, [schema]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!schema || !schema.fields) {
      return {
        total: 0,
        highConfidence: 0,
        mediumConfidence: 0,
        lowConfidence: 0
      };
    }
    const total = schema.fields.length;
    const highConfidence = schema.fields.filter(f => f.confidence >= CONFIDENCE_THRESHOLD.HIGH).length;
    const mediumConfidence = schema.fields.filter(f => f.confidence >= CONFIDENCE_THRESHOLD.MEDIUM && f.confidence < CONFIDENCE_THRESHOLD.HIGH).length;
    const lowConfidence = schema.fields.filter(f => f.confidence < CONFIDENCE_THRESHOLD.MEDIUM).length;
    return {
      total,
      highConfidence,
      mediumConfidence,
      lowConfidence
    };
  }, [schema]);

  // If no data or schema, show empty state
  if ((!data || data.length === 0) && !schema) {
    return <Paper sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: 300
    }}>

        <Typography variant="body1" color="text.secondary" gutterBottom>
          No data available for schema inference
        </Typography>
      </Paper>;
  }
  return <Paper sx={{
    maxHeight
  }}>
      {/* Header */}
      <Box sx={{
      p: 2,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid',
      borderColor: 'divider'
    }}>

        <Box>
          <Typography variant="h6">
            Schema Inference
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {schema?.recordCount ? `Inferred from ${schema.sampledRecordCount} of ${schema.recordCount} records` : 'No schema detected'}

          </Typography>
        </Box>
        
        <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
          <Tooltip title="Regenerate Schema">
            <IconButton onClick={handleRefreshSchema} disabled={isInferring || !data || data.length === 0}>

              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Settings">
            <IconButton onClick={() => setShowSettings(!showSettings)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Export Schema as JSON Schema">
            <IconButton onClick={handleExportSchema} disabled={!schema || !schema.fields || schema.fields.length === 0}>

              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Settings Panel */}
      <Collapse in={showSettings}>
        <Box sx={{
        p: 2,
        bgcolor: 'action.hover'
      }}>
          <Typography variant="subtitle1" gutterBottom>
            Schema Inference Settings
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" gutterBottom>
                Sample Size
              </Typography>
              <Slider value={settings.sampleSize} min={100} max={Math.max(1000, data?.length || 0)} step={100} valueLabelDisplay="auto" onChange={(_, value) => handleSettingChange('sampleSize', value)} disabled={isInferring} />

            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" gutterBottom>
                Confidence Threshold
              </Typography>
              <Slider value={settings.confidenceThreshold} min={0.3} max={0.9} step={0.1} valueLabelFormat={value => `${(value * 100).toFixed(0)}%`} valueLabelDisplay="auto" onChange={(_, value) => handleSettingChange('confidenceThreshold', value)} disabled={isInferring} />

            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel control={<Switch checked={settings.detectSpecialTypes} onChange={e => handleSettingChange('detectSpecialTypes', e.target.checked)} disabled={isInferring} />} label="Detect Special Types (Email, URL, Date, etc.)" />

            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel control={<Switch checked={settings.includeStatistics} onChange={e => handleSettingChange('includeStatistics', e.target.checked)} disabled={isInferring} />} label="Include Field Statistics" />

            </Grid>
          </Grid>
        </Box>
      </Collapse>
      
      {/* Schema summary */}
      {schema && schema.fields && schema.fields.length > 0 && <Box sx={{
      p: 2,
      borderBottom: '1px solid',
      borderColor: 'divider'
    }}>
          <Grid container spacing={2}>
            <Grid item>
              <Chip icon={<InfoIcon />} label={`${summary.total} Fields`} color="primary" />

            </Grid>
            <Grid item>
              <Chip icon={<ValidIcon />} label={`${summary.highConfidence} High Confidence`} color="success" variant="outlined" />

            </Grid>
            <Grid item>
              <Chip icon={<InfoIcon />} label={`${summary.mediumConfidence} Medium Confidence`} color="info" variant="outlined" />

            </Grid>
            <Grid item>
              <Chip icon={<WarningIcon />} label={`${summary.lowConfidence} Low Confidence`} color="warning" variant="outlined" />

            </Grid>
          </Grid>
        </Box>}

      
      {/* Loading indicator */}
      {isInferring && <Box sx={{
      width: '100%'
    }}>
          <LinearProgress />
          <Typography variant="body2" sx={{
        p: 2,
        textAlign: 'center'
      }}>
            Analyzing data and inferring schema...
          </Typography>
        </Box>}

      
      {/* Schema table */}
      {schema && schema.fields && schema.fields.length > 0 ? <TableContainer sx={{
      maxHeight: maxHeight - 150
    }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Field Name</TableCell>
                <TableCell>Type</TableCell>
                {showConfidence && <TableCell align="center">Confidence</TableCell>}
                <TableCell align="center">Required</TableCell>
                {showStatistics && <TableCell>Statistics</TableCell>}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schema.fields.map(field => <SchemaFieldRow key={field.name} field={field} onFieldUpdate={handleFieldUpdate} onFieldRemove={handleFieldRemove} showConfidence={showConfidence} showStats={showStatistics} allTypes={Object.values(DATA_TYPES)} />)}


            </TableBody>
          </Table>
        </TableContainer> : !isInferring && <Box sx={{
      p: 3,
      textAlign: 'center'
    }}>
            <Typography variant="body1" color="text.secondary">
              No schema could be inferred. Please check your data.
            </Typography>
          </Box>}


    </Paper>;
};
SchemaInferenceViewer.propTypes = {
  // Data inputs
  data: PropTypes.arrayOf(PropTypes.object),
  inferredSchema: PropTypes.object,
  // Callbacks
  onSchemaChange: PropTypes.func,
  // Display options
  maxHeight: PropTypes.number,
  showConfidence: PropTypes.bool,
  showStatistics: PropTypes.bool,
  allowEditing: PropTypes.bool,
  // Inference settings
  sampleSize: PropTypes.number,
  confidenceThreshold: PropTypes.number
};
export default SchemaInferenceViewer;