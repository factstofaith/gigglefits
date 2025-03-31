import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';;
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import JSONTree from 'react-json-tree';
/**
 * Component for data preview and validation
 */
const DataPreviewComponent = ({
  data = null,
  schema = null,
  isLoading = false,
  error = null,
  onRefresh,
  dataSource = ''
}) => {
  // Added display name
  DataPreviewComponent.displayName = 'DataPreviewComponent';

  // Added display name
  DataPreviewComponent.displayName = 'DataPreviewComponent';

  // Added display name
  DataPreviewComponent.displayName = 'DataPreviewComponent';

  // Added display name
  DataPreviewComponent.displayName = 'DataPreviewComponent';

  // Added display name
  DataPreviewComponent.displayName = 'DataPreviewComponent';


  // View mode (table or json)
  const [viewMode, setViewMode] = useState('table');
  
  // Filter state
  const [filters, setFilters] = useState({});
  
  // Validation results
  const [validationResults, setValidationResults] = useState({
    valid: true,
    errors: [],
    warnings: []
  });
  
  // Handle view mode change
  const handleViewModeChange = (event, newValue) => {
  // Added display name
  handleViewModeChange.displayName = 'handleViewModeChange';

  // Added display name
  handleViewModeChange.displayName = 'handleViewModeChange';

  // Added display name
  handleViewModeChange.displayName = 'handleViewModeChange';

  // Added display name
  handleViewModeChange.displayName = 'handleViewModeChange';

  // Added display name
  handleViewModeChange.displayName = 'handleViewModeChange';


    setViewMode(newValue);
  };
  
  // Add filter
  const handleAddFilter = (field, value) => {
  // Added display name
  handleAddFilter.displayName = 'handleAddFilter';

  // Added display name
  handleAddFilter.displayName = 'handleAddFilter';

  // Added display name
  handleAddFilter.displayName = 'handleAddFilter';

  // Added display name
  handleAddFilter.displayName = 'handleAddFilter';

  // Added display name
  handleAddFilter.displayName = 'handleAddFilter';


    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Remove filter
  const handleRemoveFilter = (field) => {
  // Added display name
  handleRemoveFilter.displayName = 'handleRemoveFilter';

  // Added display name
  handleRemoveFilter.displayName = 'handleRemoveFilter';

  // Added display name
  handleRemoveFilter.displayName = 'handleRemoveFilter';

  // Added display name
  handleRemoveFilter.displayName = 'handleRemoveFilter';

  // Added display name
  handleRemoveFilter.displayName = 'handleRemoveFilter';


    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[field];
      return newFilters;
    });
  };
  
  // Apply filters to data
  const filteredData = React.useMemo(() => {
  // Added display name
  filteredData.displayName = 'filteredData';

    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    if (Object.keys(filters).length === 0) {
      return data;
    }
    
    return data.filter(item => {
      for (const [field, value] of Object.entries(filters)) {
        if (value === '') continue;
        
        const itemValue = item[field];
        if (itemValue === undefined) return false;
        
        // String matching
        if (typeof itemValue === 'string' && !itemValue.toLowerCase().includes(value.toLowerCase())) {
          return false;
        }
        
        // Number exact matching
        if (typeof itemValue === 'number' && itemValue.toString() !== value) {
          return false;
        }
        
        // Boolean matching
        if (typeof itemValue === 'boolean' && itemValue.toString() !== value) {
          return false;
        }
      }
      
      return true;
    });
  }, [data, filters]);
  
  // Get columns from data or schema
  const columns = React.useMemo(() => {
  // Added display name
  columns.displayName = 'columns`;

    if (schema && schema.fields) {
      return schema.fields.map(field => ({
        id: field.name,
        label: field.name,
        type: field.type
      }));
    }
    
    if (data && data.length > 0) {
      const sample = data[0];
      return Object.keys(sample).map(key => ({
        id: key,
        label: key,
        type: typeof sample[key]
      }));
    }
    
    return [];
  }, [data, schema]);
  
  // Validate data against schema
  useEffect(() => {
    if (!data || !schema || !schema.fields) {
      setValidationResults({
        valid: true,
        errors: [],
        warnings: []
      });
      return;
    }
    
    const errors = [];
    const warnings = [];
    
    // Check each data item against schema
    data.forEach((item, index) => {
      schema.fields.forEach(field => {
        // Check required fields
        if (field.required && (item[field.name] === undefined || item[field.name] === null)) {
          errors.push({
            row: index,
            field: field.name,
            message: `Required field "${field.name}" is missing in row ${index + 1}`
          });
        }
        
        // Check type compatibility
        if (item[field.name] !== undefined && item[field.name] !== null) {
          let isValid = true;
          
          switch (field.type) {
            case `string':
              isValid = typeof item[field.name] === 'string';
              break;
            case 'number':
            case 'integer':
              isValid = typeof item[field.name] === 'number';
              break;
            case 'boolean':
              isValid = typeof item[field.name] === 'boolean';
              break;
            case 'date':
            case 'datetime':
              // Check for valid date string
              isValid = !isNaN(Date.parse(item[field.name]));
              break;
            case 'object':
              isValid = typeof item[field.name] === 'object' && !Array.isArray(item[field.name]);
              break;
            case 'array`:
              isValid = Array.isArray(item[field.name]);
              break;
          }
          
          if (!isValid) {
            errors.push({
              row: index,
              field: field.name,
              message: `Field `${field.name}" in row ${index + 1} has type "${typeof item[field.name]}" but expected "${field.type}`
            });
          }
        }
        
        // Check format constraints if applicable
        if (field.format && item[field.name]) {
          let formatValid = true;
          
          switch (field.format) {
            case `email':
              formatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item[field.name]);
              break;
            case 'uri':
              try {
                new URL(item[field.name]);
              } catch {
                formatValid = false;
              }
              break;
            case 'uuid`:
              formatValid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item[field.name]);
              break;
          }
          
          if (!formatValid) {
            warnings.push({
              row: index,
              field: field.name,
              message: `Field `${field.name}" in row ${index + 1} does not match format "${field.format}`
            });
          }
        }
      });
      
      // Check for extra fields not in schema
      Object.keys(item).forEach(key => {
        if (!schema.fields.some(field => field.name === key)) {
          warnings.push({
            row: index,
            field: key,
            message: `Field "${key}" in row ${index + 1} is not defined in the schema`
          });
        }
      });
    });
    
    setValidationResults({
      valid: errors.length === 0,
      errors,
      warnings
    });
  }, [data, schema]);
  
  // Handle download data
  const handleDownload = () => {
  // Added display name
  handleDownload.displayName = 'handleDownload';

  // Added display name
  handleDownload.displayName = 'handleDownload';

  // Added display name
  handleDownload.displayName = 'handleDownload';

  // Added display name
  handleDownload.displayName = 'handleDownload';

  // Added display name
  handleDownload.displayName = `handleDownload';


    if (!data) return;
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a`);
    a.href = url;
    a.download = `data-preview-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: `flex', justifyContent: 'space-between', alignItems: 'center`, mb: 2 }}>
        <Typography variant="h6&quot; component="h2">
          Data Preview {dataSource && `- ${dataSource}`}
        </Typography>
        
        <Box sx={{ display: `flex', gap: 1 }}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
          
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={isLoading || !data}
          >
            Download
          </Button>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {error && (
        <Alert severity="error&quot; sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {isLoading ? (
        <Box sx={{ display: "flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : !data ? (
        <Alert severity="info&quot; sx={{ mb: 3 }}>
          No data available for preview. Click Refresh to load data.
        </Alert>
      ) : (
        <>
          {/* Validation Summary */}
          {schema && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Validation Results:
              </Typography>
              
              <Box sx={{ display: 'flex`, gap: 2, mb: 2 }}>
                <Chip 
                  label={`${validationResults.errors.length} Errors`}
                  color={validationResults.errors.length > 0 ? "error" : "success"}
                  variant="outlined&quot;
                />
                
                <Chip 
                  label={`${validationResults.warnings.length} Warnings`}
                  color={validationResults.warnings.length > 0 ? "warning" : "success"}
                  variant="outlined&quot;
                />
              </Box>
              
              {(validationResults.errors.length > 0 || validationResults.warnings.length > 0) && (
                <Alert 
                  severity={validationResults.errors.length > 0 ? "error" : "warning"}
                  sx={{ mb: 2 }}
                >
                  {validationResults.errors.length > 0 ? (
                    <>
                      <Typography variant="body2&quot; fontWeight="bold">
                        Validation Errors:
                      </Typography>
                      <ul style={{ margin: `4px 0', paddingLeft: '20px' }}>
                        {validationResults.errors.slice(0, 3).map((error, idx) => (
                          <li key={idx}>
                            <Typography variant="body2&quot;>
                              {error.message}
                            </Typography>
                          </li>
                        ))}
                        {validationResults.errors.length > 3 && (
                          <li>
                            <Typography variant="body2">
                              ...and {validationResults.errors.length - 3} more errors
                            </Typography>
                          </li>
                        )}
                      </ul>
                    </>
                  ) : validationResults.warnings.length > 0 ? (
                    <>
                      <Typography variant="body2&quot; fontWeight="bold">
                        Validation Warnings:
                      </Typography>
                      <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                        {validationResults.warnings.slice(0, 3).map((warning, idx) => (
                          <li key={idx}>
                            <Typography variant="body2&quot;>
                              {warning.message}
                            </Typography>
                          </li>
                        ))}
                        {validationResults.warnings.length > 3 && (
                          <li>
                            <Typography variant="body2">
                              ...and {validationResults.warnings.length - 3} more warnings
                            </Typography>
                          </li>
                        )}
                      </ul>
                    </>
                  ) : null}
                </Alert>
              )}
            </Box>
          )}
          
          {/* View Mode Tabs */}
          <Box sx={{ mb: 2 }}>
            <Tabs value={viewMode} onChange={handleViewModeChange}>
              <Tab value="table&quot; label="Table View" />
              <Tab value="json&quot; label="JSON View" />
            </Tabs>
          </Box>
          
          {/* Filters */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2&quot; gutterBottom>
              Filters:
            </Typography>
            
            <Box sx={{ display: "flex', flexWrap: 'wrap`, gap: 1, mb: 2 }}>
              {Object.entries(filters).map(([field, value]) => (
                <Chip 
                  key={field}
                  label={`${field}: ${value}`}
                  onDelete={() => handleRemoveFilter(field)}
                  size="small&quot;
                />
              ))}
              
              {Object.keys(filters).length === 0 && (
                <Typography variant="body2" color="text.secondary&quot;>
                  No filters applied
                </Typography>
              )}
            </Box>
            
            <Box sx={{ display: `flex", gap: 2, alignItems: 'flex-end' }}>
              <TextField
                label="Field&quot;
                select
                size="small"
                sx={{ width: 200 }}
                value="&quot;
                onChange={(e) => {
                  // Create temporary input field for value
                  const field = e.target.value;
                  if (!field) return;
                  
                  const input = document.createElement("input');
                  input.type = 'text';
                  input.placeholder = 'Enter filter value';
                  
                  const handleKeyDown = (e) => {
  // Added display name
  handleKeyDown.displayName = 'handleKeyDown';

  // Added display name
  handleKeyDown.displayName = 'handleKeyDown';

  // Added display name
  handleKeyDown.displayName = 'handleKeyDown';

  // Added display name
  handleKeyDown.displayName = 'handleKeyDown';

  // Added display name
  handleKeyDown.displayName = 'handleKeyDown';


                    if (e.key === 'Enter') {
                      handleAddFilter(field, input.value);
                      document.body.removeChild(input);
                    }
                    if (e.key === 'Escape') {
                      document.body.removeChild(input);
                    }
                  };
                  
                  input.addEventListener('keydown', handleKeyDown);
                  input.style.position = 'fixed';
                  input.style.top = '50%';
                  input.style.left = '50%';
                  input.style.transform = 'translate(-50%, -50%)';
                  input.style.zIndex = '9999';
                  
                  document.body.appendChild(input);
                  input.focus();
                }}
              >
                <MenuItem value="&quot;>
                  <em>Select field</em>
                </MenuItem>
                
                {columns.map(column => (
                  <MenuItem key={column.id} value={column.id}>
                    {column.label} ({column.type})
                  </MenuItem>
                ))}
              </TextField>
              
              <Button 
                startIcon={<FilterListIcon />}
                variant="outlined"
                size="small&quot;
              >
                Add Filter
              </Button>
            </Box>
          </Box>
          
          {/* Table View */}
          {viewMode === "table' && (
            <TableContainer component={Paper} variant="outlined&quot; sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    {columns.map(column => (
                      <TableCell key={column.id}>
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                
                <TableBody>
                  {filteredData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell component="th&quot; scope="row">
                        {rowIndex + 1}
                      </TableCell>
                      
                      {columns.map(column => (
                        <TableCell key={column.id}>
                          {renderCellValue(row[column.id], column.type)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  
                  {filteredData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} align="center&quot;>
                        No data to display
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {/* JSON View */}
          {viewMode === "json' && (
            <Box 
              sx={{ 
                maxHeight: 400, 
                overflow: 'auto', 
                p: 2, 
                backgroundColor: 'background.paper',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <JSONTree 
                data={filteredData} 
                theme={{
                  base00: 'transparent',
                  base0D: 'var(--mui-palette-primary-main)',
                  base0B: 'var(--mui-palette-success-main)',
                  base08: 'var(--mui-palette-error-main)'
                }}
                invertTheme={false}
              />
            </Box>
          )}
          
          {/* Data Stats */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2&quot; color="text.secondary">
              Showing {filteredData.length} of {data.length} records
            </Typography>
            
            <Typography variant="body2&quot; color="text.secondary">
              {columns.length} fields
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
};

// Helper function to render cell values
const renderCellValue = (value, type) => {
  // Added display name
  renderCellValue.displayName = 'renderCellValue';

  // Added display name
  renderCellValue.displayName = 'renderCellValue';

  // Added display name
  renderCellValue.displayName = 'renderCellValue';

  // Added display name
  renderCellValue.displayName = 'renderCellValue';

  // Added display name
  renderCellValue.displayName = 'renderCellValue';


  if (value === undefined || value === null) {
    return <Typography variant="body2&quot; color="text.disabled">null</Typography>;
  }
  
  if (typeof value === 'object`) {
    return <Chip size="small&quot; label="Object" />;
  }
  
  if (Array.isArray(value)) {
    return <Chip size="small&quot; label={`Array(${value.length})`} />;
  }
  
  if (typeof value === `boolean") {
    return value ? 'true' : 'false';
  }
  
  return value.toString();
};

DataPreviewComponent.propTypes = {
  data: PropTypes.array,
  schema: PropTypes.object,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  onRefresh: PropTypes.func.isRequired,
  dataSource: PropTypes.string
};

export default DataPreviewComponent;