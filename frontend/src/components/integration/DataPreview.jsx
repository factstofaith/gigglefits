/**
 * DataPreview Component
 *
 * A comprehensive component for previewing datasets with virtual scrolling,
 * advanced filtering, schema validation, schema inference, and multiple view modes
 * (table/JSON). Designed to handle large datasets efficiently while providing rich
 * data exploration capabilities.
 *
 * @component
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FixedSizeList } from 'react-window';
import { debounce } from 'lodash';

// Import MUI components
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Divider,
  Switch,
  FormControlLabel,
  Grid,
  Collapse,
  Badge,
  LinearProgress,
  Skeleton,
  Popover,
  Checkbox,
  ListItemText,
  ListItemIcon
} from '@mui/material';

// Import icons
import {
  Search as SearchIcon,
  FilterAlt as FilterIcon, 
  ViewList as TableViewIcon,
  Code as JsonViewIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Assessment as StatsIcon,
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  CheckCircle as ValidIcon, 
  Settings as SettingsIcon,
  ClearAll as ClearAllIcon,
  Sort as SortIcon,
  InfoOutlined as InfoIcon,
  Schema as SchemaIcon,
  DataObject as DataQualityIcon,
  InsertDriveFile as FileTypeIcon
} from '@mui/icons-material';

// Import schema inference
import { inferSchema } from '../../utils/schemaInference';
import SchemaInferenceViewer from './SchemaInferenceViewer';
import DataQualityIndicator from './DataQualityIndicator';
import FileTypeDetector from './FileTypeDetector';
import { analyzeDataQuality } from '../../utils/dataQualityAnalyzer';
import { analyzeFile } from '../../utils/fileTypeDetector';

/**
 * JSONView Component - Displays data in JSON format with syntax highlighting
 */
const JSONView = ({ data, maxHeight }) => {
  // In a real implementation, you'd use a library like react-json-view
  // This is a simplified version for demonstration
  return (
    <Box 
      sx={{ 
        maxHeight, 
        overflow: 'auto',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        p: 2,
        '& pre': {
          margin: 0
        }
      }}
    >
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Box>
  );
};

/**
 * TableView Component - Displays data in tabular format with virtualization
 */
const TableView = ({ 
  data, 
  columns, 
  sortConfig, 
  onSort, 
  virtualized = true,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  maxHeight = 400,
  expandedRows = {},
  onRowExpand,
  loading = false
}) => {
  // If no data, show placeholder
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No data available
        </Typography>
      </Box>
    );
  }

  // Calculate pagination - memoize to prevent recalculation on every render
  const paginatedData = useMemo(() => {
    return virtualized ? data : data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [virtualized, data, page, rowsPerPage]);
  
  // Format cell value based on type - memoize to prevent recreation on each render
  const formatCellValue = useCallback((value) => {
    if (value === null || value === undefined) {
      return (
        <Typography variant="body2" color="text.disabled">
          null
        </Typography>
      );
    }

    if (typeof value === 'object') {
      return (
        <Chip
          label={Array.isArray(value) ? `Array[${value.length}]` : 'Object'}
          size="small"
          variant="outlined"
        />
      );
    }

    if (typeof value === 'boolean') {
      return (
        <Chip
          label={value.toString()}
          size="small"
          color={value ? 'success' : 'default'}
          variant="outlined"
        />
      );
    }

    return String(value);
  }, []);

  // Handle column sorting
  const handleSort = (columnId) => {
    const direction = sortConfig?.field === columnId && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    onSort({ field: columnId, direction });
  };

  // Row renderer for virtualized list
  const Row = useCallback(({ index, style }) => {
    const row = paginatedData[index];
    const isExpanded = expandedRows[index];

    return (
      <Box sx={{ ...style, display: 'flex', flexDirection: 'column' }}>
        <TableRow hover>
          <TableCell padding="checkbox">
            <IconButton
              size="small"
              onClick={() => onRowExpand(index)}
            >
              {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          {columns.map((column) => (
            <TableCell key={column.id}>{formatCellValue(row[column.id])}</TableCell>
          ))}
        </TableRow>

        {isExpanded && (
          <TableRow>
            <TableCell colSpan={columns.length + 1}>
              <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Row Details
                </Typography>
                <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                  {JSON.stringify(row, null, 2)}
                </pre>
              </Box>
            </TableCell>
          </TableRow>
        )}
      </Box>
    );
  }, [paginatedData, columns, expandedRows, onRowExpand, formatCellValue]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {loading && <LinearProgress />}
      
      <TableContainer sx={{ maxHeight, flex: 1 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              {columns.map((column) => (
                <TableCell 
                  key={column.id}
                  onClick={() => handleSort(column.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle2">{column.label}</Typography>
                    {sortConfig?.field === column.id && (
                      <Box component="span" sx={{ ml: 0.5 }}>
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </Box>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          
          {virtualized ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length + 1} sx={{ p: 0, height: maxHeight - 56 }}>
                  <FixedSizeList
                    height={maxHeight - 56}
                    width="100%"
                    itemCount={paginatedData.length}
                    itemSize={53}
                    overscanCount={5}
                  >
                    {Row}
                  </FixedSizeList>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {paginatedData.map((row, index) => {
                const isExpanded = expandedRows[index];
                return (
                  <React.Fragment key={index}>
                    <TableRow hover>
                      <TableCell padding="checkbox">
                        <IconButton
                          size="small"
                          onClick={() => onRowExpand(index)}
                        >
                          {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      </TableCell>
                      {columns.map((column) => (
                        <TableCell key={column.id}>{formatCellValue(row[column.id])}</TableCell>
                      ))}
                    </TableRow>

                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={columns.length + 1}>
                          <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Row Details
                            </Typography>
                            <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                              {JSON.stringify(row, null, 2)}
                            </pre>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          )}
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={data.length}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Box>
  );
};

/**
 * DataPreview Component - Main component for previewing datasets
 */
const DataPreview = ({
  data = [],
  schema = null,
  isLoading = false,
  error = null,
  onRefresh = () => {},
  dataSource = '',
  maxHeight = 500,
  showDownload = true,
  showFilters = true,
  showValidation = true,
  showSchemaInference = true,
  showQualityIndicators = true,
  showFileTypeDetection = true,
  initialViewMode = 'table',
  ariaLabel = 'Data Preview',
  emptyMessage = 'No data available to preview',
  onDataUpdate = () => {},
  onSchemaInferred = () => {},
  onQualityAnalyzed = () => {},
  onFileTypeDetected = () => {},
}) => {
  // State for view management
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState({});
  const [sortConfig, setSortConfig] = useState(null);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterColumn, setFilterColumn] = useState('all');
  const [activeFilters, setActiveFilters] = useState({});
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  
  // State for stats and validation
  const [showStats, setShowStats] = useState(false);
  const [showValidationDetails, setShowValidationDetails] = useState(false);
  const validationResults = useRef({ valid: true, errors: [] });
  
  // State for schema inference
  const [inferredSchema, setInferredSchema] = useState(null);
  const [showSchemaViewer, setShowSchemaViewer] = useState(false);
  
  // State for data quality analysis
  const [qualityResults, setQualityResults] = useState(null);
  const [isAnalyzingQuality, setIsAnalyzingQuality] = useState(false);
  
  // State for file type detection
  const [fileTypeResult, setFileTypeResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Extract columns from data
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const firstRow = data[0];
    return Object.keys(firstRow).map(key => ({
      id: key,
      label: key,
      type: typeof firstRow[key]
    }));
  }, [data]);
  
  // Filter and sort data based on current configuration
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    let result = [...data];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(row => {
        if (filterColumn === 'all') {
          return Object.values(row).some(value => 
            String(value).toLowerCase().includes(term)
          );
        } else {
          return String(row[filterColumn] || '').toLowerCase().includes(term);
        }
      });
    }
    
    // Apply column-specific filters
    Object.entries(activeFilters).forEach(([columnId, filterValue]) => {
      if (filterValue) {
        result = result.filter(row => {
          const value = row[columnId];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });
    
    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.field];
        const bValue = b[sortConfig.field];
        
        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
        if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;
        
        // Sort based on type
        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        return sortConfig.direction === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      });
    }
    
    return result;
  }, [data, searchTerm, filterColumn, activeFilters, sortConfig]);
  
  // Calculate data statistics
  const stats = useMemo(() => {
    if (!data || data.length === 0) return {};
    
    const statsData = {};
    
    columns.forEach(column => {
      const values = data.map(row => row[column.id]);
      const numericValues = values.filter(v => typeof v === 'number');
      
      statsData[column.id] = {
        count: values.length,
        nullCount: values.filter(v => v === null || v === undefined).length,
        uniqueCount: new Set(values.map(v => String(v))).size,
        min: numericValues.length > 0 ? Math.min(...numericValues) : null,
        max: numericValues.length > 0 ? Math.max(...numericValues) : null,
        avg: numericValues.length > 0
          ? numericValues.reduce((acc, val) => acc + val, 0) / numericValues.length
          : null,
      };
    });
    
    return statsData;
  }, [data, columns]);
  
  // Validate data against schema
  useEffect(() => {
    if (!schema || !data || data.length === 0) {
      validationResults.current = { valid: true, errors: [] };
      return;
    }
    
    // Simple schema validation (in a real app, use a proper schema validator)
    const errors = [];
    let valid = true;
    
    data.forEach((row, rowIndex) => {
      if (schema.fields) {
        schema.fields.forEach(field => {
          const value = row[field.name];
          
          // Check required fields
          if (field.required && (value === null || value === undefined)) {
            valid = false;
            errors.push({
              row: rowIndex,
              field: field.name,
              message: `Required field "${field.name}" is missing in row ${rowIndex + 1}`
            });
          }
          
          // Check types
          if (value !== null && value !== undefined) {
            if (field.type === 'number' && typeof value !== 'number') {
              valid = false;
              errors.push({
                row: rowIndex,
                field: field.name,
                message: `Field "${field.name}" in row ${rowIndex + 1} should be a number but got ${typeof value}`
              });
            }
            
            if (field.type === 'string' && typeof value !== 'string') {
              valid = false;
              errors.push({
                row: rowIndex,
                field: field.name,
                message: `Field "${field.name}" in row ${rowIndex + 1} should be a string but got ${typeof value}`
              });
            }
            
            // Add more type validations as needed
          }
        });
      }
    });
    
    validationResults.current = { valid, errors };
  }, [data, schema]);
  
  // Perform initial schema inference when data is available
  useEffect(() => {
    if (!data || data.length === 0 || schema) {
      return;
    }
    
    let isComponentMounted = true;
    
    // If we don't have a schema but have data, infer it
    try {
      const inferred = inferSchema(data, {
        sampleSize: Math.min(1000, data.length),
        detectSpecialTypes: true,
        includeStatistics: true
      });
      
      // Only update state if the component is still mounted
      if (isComponentMounted) {
        setInferredSchema(inferred);
        onSchemaInferred(inferred);
      }
    } catch (error) {
      console.error('Error inferring schema:', error);
    }
    
    // Clean up function to set mounted flag to false when unmounting
    return () => {
      isComponentMounted = false;
    };
  }, [data, schema, onSchemaInferred]);
  
  // Perform data quality analysis when schema is available
  useEffect(() => {
    if (!data || data.length === 0 || (!schema && !inferredSchema)) {
      return;
    }
    
    setIsAnalyzingQuality(true);
    
    // Use setTimeout to avoid blocking UI
    const timer = setTimeout(() => {
      try {
        const schemaToUse = schema || inferredSchema;
        const qualityAnalysis = analyzeDataQuality(data, schemaToUse, {
          sampleSize: Math.min(1000, data.length),
          includeStatistics: true,
          detectOutliers: true
        });
        
        setQualityResults(qualityAnalysis);
        onQualityAnalyzed(qualityAnalysis);
      } catch (error) {
        console.error('Error analyzing data quality:', error);
      } finally {
        setIsAnalyzingQuality(false);
      }
    }, 0);
    
    // Clean up the timer when the component unmounts or dependencies change
    return () => clearTimeout(timer);
  }, [data, schema, inferredSchema, onQualityAnalyzed]);
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle row expansion
  const handleRowExpand = (rowIndex) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowIndex]: !prev[rowIndex]
    }));
  };
  
  // Handle search with debounce
  const debouncedSearch = useRef(null);
  
  // Set up debounced search function and clean it up on unmount
  useEffect(() => {
    debouncedSearch.current = debounce((value) => {
      setSearchTerm(value);
      setPage(0); // Reset to first page when searching
    }, 300);
    
    // Clean up debounced function on unmount to prevent memory leaks
    return () => {
      if (debouncedSearch.current) {
        debouncedSearch.current.cancel();
      }
    };
  }, []);
  
  const handleSearchChange = (event) => {
    if (debouncedSearch.current) {
      debouncedSearch.current(event.target.value);
    }
  };
  
  // Handle column filter changes
  const handleFilterColumnChange = (event) => {
    setFilterColumn(event.target.value);
  };
  
  // Handle adding column-specific filters
  const handleOpenFilterMenu = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  const handleCloseFilterMenu = () => {
    setFilterAnchorEl(null);
  };
  
  const handleFilterChange = (columnId, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [columnId]: value
    }));
    setPage(0); // Reset to first page when filtering
  };
  
  const handleClearFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    setFilterColumn('all');
    setPage(0);
  };
  
  // Handle data export
  const handleExportData = () => {
    const exportData = viewMode === 'table' ? processedData : data;
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    let url = null;
    
    try {
      url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `data-export-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      // Clean up
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
  };
  
  // Render filter badges for active filters
  const renderFilterBadges = () => {
    const filterEntries = Object.entries(activeFilters).filter(([_, value]) => !!value);
    
    if (filterEntries.length === 0 && !searchTerm) return null;
    
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {searchTerm && (
          <Chip 
            label={`Search: ${searchTerm}`}
            onDelete={() => {
              setSearchTerm('');
            }}
            size="small"
          />
        )}
        
        {filterEntries.map(([columnId, value]) => (
          <Chip 
            key={columnId}
            label={`${columnId}: ${value}`}
            onDelete={() => {
              setActiveFilters(prev => ({
                ...prev,
                [columnId]: ''
              }));
            }}
            size="small"
          />
        ))}
        
        {(filterEntries.length > 0 || searchTerm) && (
          <Button 
            size="small" 
            startIcon={<ClearAllIcon />}
            onClick={handleClearFilters}
          >
            Clear All
          </Button>
        )}
      </Box>
    );
  };
  
  // Render data statistics
  const renderDataStats = () => {
    if (!showStats) return null;
    
    return (
      <Collapse in={showStats}>
        <Box sx={{ mt: 2, mb: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data Statistics
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Column</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="right">Non-Null</TableCell>
                      <TableCell align="right">Unique</TableCell>
                      <TableCell align="right">Min</TableCell>
                      <TableCell align="right">Max</TableCell>
                      <TableCell align="right">Avg</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {columns.map((column) => (
                      <TableRow key={column.id}>
                        <TableCell component="th" scope="row">
                          <Tooltip title={`Type: ${column.type}`}>
                            <Typography variant="body2">{column.label}</Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">{stats[column.id]?.count || 0}</TableCell>
                        <TableCell align="right">
                          {stats[column.id] 
                            ? stats[column.id].count - stats[column.id].nullCount 
                            : 0}
                        </TableCell>
                        <TableCell align="right">{stats[column.id]?.uniqueCount || 0}</TableCell>
                        <TableCell align="right">
                          {stats[column.id]?.min !== null ? stats[column.id]?.min : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {stats[column.id]?.max !== null ? stats[column.id]?.max : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {stats[column.id]?.avg !== null 
                            ? stats[column.id]?.avg.toFixed(2) 
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Collapse>
    );
  };
  
  // Render validation results
  const renderValidationResults = () => {
    if (!showValidation || !showValidationDetails) return null;
    
    const { valid, errors } = validationResults.current;
    
    return (
      <Collapse in={showValidationDetails}>
        <Box sx={{ mt: 2, mb: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                {valid ? (
                  <>
                    <ValidIcon color="success" sx={{ mr: 1 }} />
                    Data Validation Passed
                  </>
                ) : (
                  <>
                    <ErrorIcon color="error" sx={{ mr: 1 }} />
                    Data Validation Failed
                  </>
                )}
              </Typography>
              
              {!valid && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Validation Errors
                  </Typography>
                  
                  <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {errors.map((error, index) => (
                      <Alert severity="error" key={index} sx={{ mb: 1 }}>
                        {error.message}
                      </Alert>
                    ))}
                  </Box>
                </Box>
              )}
              
              {valid && (
                <Alert severity="success">
                  All data conforms to the schema definition
                </Alert>
              )}
            </CardContent>
          </Card>
        </Box>
      </Collapse>
    );
  };

  // Render empty state
  if (!data || data.length === 0) {
    return (
      <Paper 
        sx={{ 
          p: 3, 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 300
        }}
      >
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {emptyMessage}
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={isLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={onRefresh}
          disabled={isLoading}
          sx={{ mt: 2 }}
        >
          {isLoading ? 'Loading...' : 'Load Data'}
        </Button>
      </Paper>
    );
  }

  // Render error state
  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">
          <AlertTitle>Error loading data</AlertTitle>
          {error}
        </Alert>
        
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Paper>
    );
  }

  // Main component render
  return (
    <Paper 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        maxHeight 
      }}
      aria-label={ariaLabel}
    >
      {/* Toolbar */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ mr: 1 }}>
            Data Preview
          </Typography>
          
          {dataSource && (
            <Chip 
              label={dataSource} 
              size="small" 
              sx={{ ml: 1 }}
            />
          )}
          
          <Badge 
            badgeContent={validationResults.current.errors.length} 
            color="error"
            max={99}
            sx={{ ml: 1 }}
          >
            <Chip 
              icon={validationResults.current.valid ? <ValidIcon /> : <ErrorIcon />}
              label="Validation" 
              color={validationResults.current.valid ? "success" : "error"}
              size="small"
              onClick={() => setShowValidationDetails(!showValidationDetails)}
              sx={{ ml: 1 }}
            />
          </Badge>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Table View">
            <IconButton 
              onClick={() => setViewMode('table')}
              color={viewMode === 'table' ? 'primary' : 'default'}
            >
              <TableViewIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="JSON View">
            <IconButton
              onClick={() => setViewMode('json')}
              color={viewMode === 'json' ? 'primary' : 'default'}
            >
              <JsonViewIcon />
            </IconButton>
          </Tooltip>
          
          {showSchemaInference && (
            <Tooltip title="Schema View">
              <IconButton
                onClick={() => setViewMode('schema')}
                color={viewMode === 'schema' ? 'primary' : 'default'}
              >
                <SchemaIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {showQualityIndicators && (
            <Tooltip title="Data Quality">
              <IconButton
                onClick={() => setViewMode('quality')}
                color={viewMode === 'quality' ? 'primary' : 'default'}
              >
                <Badge 
                  badgeContent={
                    qualityResults ? 
                      Math.round(qualityResults.overallQuality * 100) : null
                  }
                  color={
                    !qualityResults ? 'default' :
                    qualityResults.overallQuality >= 0.9 ? 'success' :
                    qualityResults.overallQuality >= 0.7 ? 'info' :
                    qualityResults.overallQuality >= 0.5 ? 'warning' : 'error'
                  }
                  invisible={!qualityResults}
                >
                  <DataQualityIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
          
          {showFileTypeDetection && (
            <Tooltip title="File Type Detection">
              <IconButton
                onClick={() => setViewMode('filetype')}
                color={viewMode === 'filetype' ? 'primary' : 'default'}
              >
                <Badge 
                  badgeContent={
                    fileTypeResult ? 
                      Math.round(fileTypeResult.confidence * 100) : null
                  }
                  color={
                    !fileTypeResult ? 'default' :
                    fileTypeResult.confidence >= 0.9 ? 'success' :
                    fileTypeResult.confidence >= 0.7 ? 'info' :
                    fileTypeResult.confidence >= 0.5 ? 'warning' : 'error'
                  }
                  invisible={!fileTypeResult}
                >
                  <FileTypeIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="Data Statistics">
            <IconButton
              onClick={() => setShowStats(!showStats)}
              color={showStats ? 'primary' : 'default'}
            >
              <StatsIcon />
            </IconButton>
          </Tooltip>
          
          {showDownload && (
            <Tooltip title="Download Data">
              <IconButton onClick={handleExportData}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={onRefresh}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Search and filters */}
      {showFilters && (
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <TextField
                placeholder="Search..."
                variant="outlined"
                size="small"
                fullWidth
                defaultValue=""
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="column-select-label">Column</InputLabel>
                <Select
                  labelId="column-select-label"
                  value={filterColumn}
                  label="Column"
                  onChange={handleFilterColumnChange}
                >
                  <MenuItem value="all">All Columns</MenuItem>
                  <Divider />
                  {columns.map((column) => (
                    <MenuItem key={column.id} value={column.id}>
                      {column.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={handleOpenFilterMenu}
                color={Object.values(activeFilters).some(Boolean) ? 'primary' : 'inherit'}
              >
                Filters
              </Button>
              
              <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleCloseFilterMenu}
                PaperProps={{
                  sx: { width: 300, maxHeight: 400 }
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Column Filters
                  </Typography>
                  
                  {columns.map((column) => (
                    <Box key={column.id} sx={{ mb: 2 }}>
                      <TextField
                        label={column.label}
                        size="small"
                        fullWidth
                        value={activeFilters[column.id] || ''}
                        onChange={(e) => handleFilterChange(column.id, e.target.value)}
                        variant="outlined"
                      />
                    </Box>
                  ))}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button 
                      onClick={handleClearFilters}
                      sx={{ mr: 1 }}
                    >
                      Clear All
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={handleCloseFilterMenu}
                    >
                      Apply
                    </Button>
                  </Box>
                </Box>
              </Menu>
            </Grid>
          </Grid>
          
          {/* Active filter badges */}
          {renderFilterBadges()}
        </Box>
      )}
      
      {/* Data statistics */}
      {renderDataStats()}
      
      {/* Validation results */}
      {renderValidationResults()}
      
      {/* Main content area */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {viewMode === 'table' ? (
          <TableView
            data={processedData}
            columns={columns}
            sortConfig={sortConfig}
            onSort={setSortConfig}
            virtualized={processedData.length > 100}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            maxHeight={maxHeight - 150}
            expandedRows={expandedRows}
            onRowExpand={handleRowExpand}
            loading={isLoading}
          />
        ) : viewMode === 'json' ? (
          <JSONView 
            data={data} 
            maxHeight={maxHeight - 150} 
          />
        ) : viewMode === 'schema' && showSchemaInference ? (
          <SchemaInferenceViewer
            data={data}
            inferredSchema={inferredSchema || schema}
            onSchemaChange={(newSchema) => {
              setInferredSchema(newSchema);
              onSchemaInferred(newSchema);
            }}
            maxHeight={maxHeight - 150}
            showConfidence={true}
            showStatistics={true}
            allowEditing={true}
          />
        ) : viewMode === 'quality' && showQualityIndicators ? (
          <DataQualityIndicator
            qualityResults={qualityResults}
            isLoading={isAnalyzingQuality}
            onRefresh={useCallback(() => {
              setIsAnalyzingQuality(true);
              const schemaToUse = schema || inferredSchema;
              
              const timer = setTimeout(() => {
                try {
                  const qualityAnalysis = analyzeDataQuality(data, schemaToUse, {
                    sampleSize: Math.min(1000, data.length),
                    includeStatistics: true,
                    detectOutliers: true
                  });
                  
                  setQualityResults(qualityAnalysis);
                  onQualityAnalyzed(qualityAnalysis);
                } catch (error) {
                  console.error('Error analyzing data quality:', error);
                } finally {
                  setIsAnalyzingQuality(false);
                }
              }, 0);
              
              return () => clearTimeout(timer);
            }, [data, schema, inferredSchema, onQualityAnalyzed])}
            maxHeight={maxHeight - 150}
            showFieldMetrics={true}
            showDimensionScores={true}
            showIssues={true}
          />
        ) : viewMode === 'filetype' && showFileTypeDetection ? (
          <FileTypeDetector
            file={selectedFile}
            onDetectionComplete={(result) => {
              setFileTypeResult(result);
              onFileTypeDetected(result);
            }}
            allowFileDrop={true}
            showDetailedResults={true}
            performDeepInspection={true}
          />
        ) : (
          <JSONView 
            data={data} 
            maxHeight={maxHeight - 150} 
          />
        )}
      </Box>
    </Paper>
  );
};

DataPreview.propTypes = {
  // Data props
  data: PropTypes.arrayOf(PropTypes.object),
  schema: PropTypes.object,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  
  // Callbacks
  onRefresh: PropTypes.func,
  onDataUpdate: PropTypes.func,
  onSchemaInferred: PropTypes.func,
  onQualityAnalyzed: PropTypes.func,
  onFileTypeDetected: PropTypes.func,
  
  // Display options
  dataSource: PropTypes.string,
  maxHeight: PropTypes.number,
  showDownload: PropTypes.bool,
  showFilters: PropTypes.bool,
  showValidation: PropTypes.bool,
  showSchemaInference: PropTypes.bool,
  showQualityIndicators: PropTypes.bool,
  showFileTypeDetection: PropTypes.bool,
  initialViewMode: PropTypes.oneOf(['table', 'json', 'schema', 'quality', 'filetype']),
  
  // Accessibility
  ariaLabel: PropTypes.string,
  
  // Content
  emptyMessage: PropTypes.string,
};

export default DataPreview;