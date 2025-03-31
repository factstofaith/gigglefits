/**
 * @component DataPreview
 * @description An enhanced data preview component that provides tabular and JSON views 
 * of datasets with virtualization for performance, comprehensive filtering, and 
 * data validation features.
 * @typedef {import('../../types/display').DataPreviewProps} DataPreviewProps
 * @type {React.FC<DataPreviewProps>}
 */
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Paper, 
  Typography, 
  Divider, 
  Tabs,
  Tab,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '../../design-system/adapter';
import { FixedSizeList } from 'react-window';
import { getAriaAttributes } from '@utils/accessibilityUtils';

// Icons (imported directly to avoid MUI import issues)
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { ReactJsonAdapter } from '@utils/react-compat-adapters';
import { Box, Tab } from '../../design-system';
// Design system import already exists;
// Design system import already exists;
;
;
/**
 * DataPreviewAdapted - Enhanced data preview component with virtualization
 * for better performance with large datasets
 */
const DataPreview = React.memo(({
  data = null,
  schema = null,
  isLoading = false,
  error = null,
  onRefresh,
  dataSource = '',
  maxHeight = 400,
  showDownload = true,
  showFilters = true,
  showValidation = true,
  initialViewMode = 'table',
  // Accessibility props
  ariaLabel,
  // Additional props
  ...rest
}) => {
  // State
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [filters, setFilters] = useState({});
  const [filterField, setFilterField] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [validationResults, setValidationResults] = useState({
    valid: true,
    errors: [],
    warnings: []
  });
  
  // Get accessibility attributes
  const ariaAttributes = getAriaAttributes({
    label: ariaLabel || 'Data Preview',
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
  const handleAddFilter = () => {
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


    if (!filterField || !filterValue) return;
    
    setFilters(prev => ({
      ...prev,
      [filterField]: filterValue
    }));
    
    setFilterField('');
    setFilterValue('');
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
  
  // Toggle row expansion
  const toggleRowExpansion = (rowIndex) => {
  // Added display name
  toggleRowExpansion.displayName = 'toggleRowExpansion';

  // Added display name
  toggleRowExpansion.displayName = 'toggleRowExpansion';

  // Added display name
  toggleRowExpansion.displayName = 'toggleRowExpansion';

  // Added display name
  toggleRowExpansion.displayName = 'toggleRowExpansion';

  // Added display name
  toggleRowExpansion.displayName = 'toggleRowExpansion';


    setExpandedRows(prev => ({
      ...prev,
      [rowIndex]: !prev[rowIndex]
    }));
  };
  
  // Apply filters to data
  const filteredData = useMemo(() => {
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
  const columns = useMemo(() => {
    // Define function display name for debugging
    const columnsFunction = () => {
  // Added display name
  columnsFunction.displayName = 'columnsFunction';

  // Added display name
  columnsFunction.displayName = 'columnsFunction';

  // Added display name
  columnsFunction.displayName = 'columnsFunction';

  // Added display name
  columnsFunction.displayName = 'columnsFunction';
}; 
    columnsFunction.displayName = 'columns';

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
    if (!showValidation || !data || !schema || !schema.fields) {
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
            case 'string':
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
            case 'array':
              isValid = Array.isArray(item[field.name]);
              break;
            default:
              break;
          }
          
          if (!isValid) {
            errors.push({
              row: index,
              field: field.name,
              message: `Field "${field.name}" in row ${index + 1} has type "${typeof item[field.name]}" but expected "${field.type}"`
            });
          }
        }
        
        // Check format constraints if applicable
        if (field.format && item[field.name]) {
          let formatValid = true;
          
          switch (field.format) {
            case 'email':
              formatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item[field.name]);
              break;
            case 'uri':
              try {
                new URL(item[field.name]);
              } catch {
                formatValid = false;
              }
              break;
            case 'uuid':
              formatValid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item[field.name]);
              break;
            default:
              break;
          }
          
          if (!formatValid) {
            warnings.push({
              row: index,
              field: field.name,
              message: `Field "${field.name}" in row ${index + 1} does not match format "${field.format}"`
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
  }, [data, schema, showValidation]);
  
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
  handleDownload.displayName = 'handleDownload';


    if (!data) return;
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-preview-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render cell value
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
    
    if (typeof value === 'object') {
      return <Chip 
        size="small&quot; 
        label={Array.isArray(value) ? `Array(${value.length})` : "Object"}
        variant="outlined&quot;
      />;
    }
    
    if (Array.isArray(value)) {
      return <Chip 
        size="small" 
        label={`Array(${value.length})`}
        variant="outlined&quot;
      />;
    }
    
    if (typeof value === "boolean') {
      return value ? 'true' : 'false';
    }
    
    return value.toString();
  };

  // Virtualized row renderer for table view
  const RowRenderer = ({ index, style }) => {
  // Added display name
  RowRenderer.displayName = 'RowRenderer';

  // Added display name
  RowRenderer.displayName = 'RowRenderer';

  // Added display name
  RowRenderer.displayName = 'RowRenderer';

  // Added display name
  RowRenderer.displayName = 'RowRenderer';

  // Added display name
  RowRenderer.displayName = 'RowRenderer';


    const row = filteredData[index];
    const isExpanded = !!expandedRows[index];
    
    return (
      <div style={{ ...style, display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          display: 'flex',
          borderBottom: '1px solid rgba(224, 224, 224, 1)',
          height: '42px'
        }}>
          <div style={{ width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button 
              size="small&quot; 
              variant="text" 
              onClick={() => toggleRowExpansion(index)}
              style={{ minWidth: 'auto', padding: '4px' }}
            >
              {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </Button>
          </div>
          
          {columns.map(column => (
            <div key={column.id} style={{ 
              flex: 1, 
              padding: '6px 16px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center'
            }}>
              {renderCellValue(row[column.id], column.type)}
            </div>
          ))}
        </div>
        
        {isExpanded && (
          <div style={{ 
            padding: '8px 16px 8px 56px',
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            borderBottom: '1px solid rgba(224, 224, 224, 1)'
          }}>
            <Typography variant="subtitle2&quot; gutterBottom>
              Row {index + 1} Details
            </Typography>
            <ReactJsonAdapter 
              src={row} 
              name={false} 
              collapsed={2}
              enableClipboard={false}
              displayDataTypes={false}
              style={{ fontSize: "12px' }}
            />
          </div>
        )}
      </div>
    );
  };
  
  // Calculate row height for virtualized list
  const getRowHeight = (index) => {
  // Added display name
  getRowHeight.displayName = 'getRowHeight';

  // Added display name
  getRowHeight.displayName = 'getRowHeight';

  // Added display name
  getRowHeight.displayName = 'getRowHeight';

  // Added display name
  getRowHeight.displayName = 'getRowHeight';

  // Added display name
  getRowHeight.displayName = 'getRowHeight';


    return expandedRows[index] ? 300 : 42; // Base height + expanded content
  };

  // Render the component
  return (
    <Paper elevation={2} sx={{ p: 3, ...rest.style }} {...ariaAttributes}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6&quot; component="h2">
          Data Preview {dataSource && `- ${dataSource}`}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
          
          {showDownload && (
            <Button
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              disabled={isLoading || !data}
            >
              Download
            </Button>
          )}
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
          {showValidation && schema && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Validation Results:
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
                      <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
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
          {showFilters && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2&quot; gutterBottom>
                Filters:
              </Typography>
              
              <Box sx={{ display: "flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
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
              
              <Box sx={{ display: "flex', gap: 2, alignItems: 'flex-end' }}>
                <FormControl size="small&quot; sx={{ minWidth: 180 }}>
                  <InputLabel>Field</InputLabel>
                  <Select
                    value={filterField}
                    label="Field"
                    onChange={(e) => setFilterField(e.target.value)}
                  >
                    <MenuItem value="&quot;>
                      <em>Select field</em>
                    </MenuItem>
                    
                    {columns.map(column => (
                      <MenuItem key={column.id} value={column.id}>
                        {column.label} ({column.type})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  label="Value"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  size="small&quot;
                  disabled={!filterField}
                />
                
                <Button 
                  startIcon={<FilterListIcon />}
                  variant="outlined"
                  size="small&quot;
                  onClick={handleAddFilter}
                  disabled={!filterField || !filterValue}
                >
                  Add Filter
                </Button>
              </Box>
            </Box>
          )}
          
          {/* Table View */}
          {viewMode === "table' && (
            <Box sx={{ height: maxHeight, overflow: 'hidden' }}>
              {/* Table Header */}
              <Box sx={{ 
                display: 'flex',
                borderBottom: '1px solid rgba(224, 224, 224, 1)',
                backgroundColor: 'background.paper',
                fontWeight: 'bold'
              }}>
                <Box sx={{ width: '40px' }}></Box>
                {columns.map(column => (
                  <Box key={column.id} sx={{ 
                    flex: 1, 
                    padding: '6px 16px',
                    fontWeight: 'bold'
                  }}>
                    <Tooltip title={`Type: ${column.type}`}>
                      <Typography variant="body2&quot; fontWeight="medium">
                        {column.label}
                      </Typography>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
              
              {/* Virtualized Table Body */}
              {filteredData.length > 0 ? (
                <FixedSizeList
                  height={maxHeight - 42} // Subtract header height
                  width="100%&quot;
                  itemCount={filteredData.length}
                  itemSize={42} // Default row height
                  itemKey={(index) => index}
                  estimatedItemSize={42}
                >
                  {RowRenderer}
                </FixedSizeList>
              ) : (
                <Box sx={{ 
                  display: "flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100px'
                }}>
                  <Typography variant="body2&quot; color="text.secondary">
                    No data to display
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          
          {/* JSON View */}
          {viewMode === 'json' && (
            <Box 
              sx={{ 
                maxHeight: maxHeight, 
                overflow: 'auto', 
                p: 2, 
                backgroundColor: 'background.paper',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <ReactJsonAdapter 
                src={filteredData} 
                name={false} 
                collapsed={1}
                enableClipboard={false}
                style={{ fontSize: '13px' }}
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
});

DataPreviewAdapted.propTypes = {
  // Data props
  data: PropTypes.array,
  schema: PropTypes.object,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  onRefresh: PropTypes.func.isRequired,
  dataSource: PropTypes.string,
  
  // Display props
  maxHeight: PropTypes.number,
  showDownload: PropTypes.bool,
  showFilters: PropTypes.bool,
  showValidation: PropTypes.bool,
  initialViewMode: PropTypes.oneOf(['table', 'json']),
  
  // Accessibility props
  ariaLabel: PropTypes.string,
};

DataPreview.displayName = 'DataPreview';

export default DataPreview;