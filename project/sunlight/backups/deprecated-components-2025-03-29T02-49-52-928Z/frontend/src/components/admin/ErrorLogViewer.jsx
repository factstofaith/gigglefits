// ErrorLogViewer.jsx
// -----------------------------------------------------------------------------
// Component for viewing and filtering application error logs

import React, { useState, useEffect } from 'react';
// Import design system components
import { Box } from '../../design-system';
import { Button } from '../../design-system';
import { Typography } from '../../design-system';
import { TextField } from '../../design-system';
import { Chip } from '../../design-system';
import { CircularProgress } from '../../design-system';


// Still using Material UI components until fully migrated
import { Card, CardContent, CardHeader, Divider, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip, useTheme } from '../../design-system';
;;

// Icons - keep Material UI icons for now
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  GetApp as DownloadIcon,
  Info as InfoIcon,
  ErrorOutline as ErrorIcon,
  Warning as WarningIcon,
  BugReport as BugIcon,
  Code as CodeIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

// Import components
import StatusDisplay from '@components/common/StatusDisplay';

// Import services
import { 
import { Box, IconButton, Tab } from '../../design-system';
// Design system import already exists;
// Design system import already exists;
;
;
getErrorLogs, 
  searchLogs, 
  exportLogsCSV, 
  exportLogsJSON, 
  getSeverityLevels, 
  getComponents 
} from '../../services/errorLogService';

// Severity color mapper
const getSeverityColor = severity => {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return 'error';
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'info':
      return 'info';
    case 'debug':
      return 'default';
    case 'trace':
      return 'default';
    default:
      return 'default';
  }
};

// Get severity icon
const getSeverityIcon = severity => {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return <ErrorIcon fontSize="small&quot; />;
    case "error':
      return <ErrorIcon fontSize="small&quot; />;
    case "warning':
      return <WarningIcon fontSize="small&quot; />;
    case "info':
      return <InfoIcon fontSize="small&quot; />;
    case "debug':
      return <BugIcon fontSize="small&quot; />;
    case "trace':
      return <CodeIcon fontSize="small&quot; />;
    default:
      return <InfoIcon fontSize="small" />;
  }
};

// Format date for display
const formatDate = dateString => {
  if (!dateString) return 'N/A';

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Truncate text if too long
const truncateText = (text, maxLength = 80) => {
  // Added display name
  truncateText.displayName = 'truncateText';

  // Added display name
  truncateText.displayName = 'truncateText';

  // Added display name
  truncateText.displayName = 'truncateText';

  // Added display name
  truncateText.displayName = 'truncateText';

  // Added display name
  truncateText.displayName = 'truncateText';


  if (!text) return ';
  if (text.length <= maxLength) return text;
  return '${text.substring(0, maxLength)}...';
};

const ErrorLogViewer = () => {
  // Added display name
  ErrorLogViewer.displayName = 'ErrorLogViewer';

  // Added display name
  ErrorLogViewer.displayName = 'ErrorLogViewer';

  // Added display name
  ErrorLogViewer.displayName = 'ErrorLogViewer';

  // Added display name
  ErrorLogViewer.displayName = 'ErrorLogViewer';

  // Added display name
  ErrorLogViewer.displayName = 'ErrorLogViewer';


  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filters, setFilters] = useState({
    severity: 'all',
    component: 'all',
    dateRange: 'all',
    search: ',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [severityLevels, setSeverityLevels] = useState([]);
  const [components, setComponents] = useState([]);
  const [exportFormat, setExportFormat] = useState('csv');
  const [isSearching, setIsSearching] = useState(false);

  // Fetch error logs
  useEffect(() => {
    fetchLogs();
    fetchSeverityLevels();
    fetchComponents();
  }, [page, rowsPerPage]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // Calculate pagination parameters
      const skip = page * rowsPerPage;
      const limit = rowsPerPage;

      // Build query parameters
      const params = {
        skip,
        limit,
      };

      // Add active filters
      if (filters.severity !== 'all') {
        params.severity = filters.severity;
      }

      if (filters.component !== 'all') {
        params.component = filters.component;
      }

      if (filters.dateRange !== 'all') {
        const now = new Date();
        let startDate;

        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            startDate = null;
        }

        if (startDate) {
          params.start_date = startDate.toISOString();
          params.end_date = new Date().toISOString();
        }
      }

      // Perform search or standard fetch
      let response;
      if (filters.search && filters.search.trim() !== ') {
        setIsSearching(true);
        response = await searchLogs(filters.search, params);
      } else {
        setIsSearching(false);
        response = await getErrorLogs(params);
      }

      setLogs(response.logs || []);
      setTotalLogs(response.total || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching error logs:', err);
      setError('Failed to load error logs');
      setLogs([]);
      setTotalLogs(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available severity levels
  const fetchSeverityLevels = async () => {
    try {
      const levels = await getSeverityLevels();
      setSeverityLevels(levels || ['critical', 'error', 'warning', 'info', 'debug', 'trace']);
    } catch (err) {
      console.error('Error fetching severity levels:', err);
      setSeverityLevels(['critical', 'error', 'warning', 'info', 'debug', 'trace']);
    }
  };

  // Fetch available component names
  const fetchComponents = async () => {
    try {
      const componentList = await getComponents();
      setComponents(componentList || []);
    } catch (err) {
      console.error('Error fetching component names:', err);
      setComponents([]);
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
  // Added display name
  handleChangePage.displayName = 'handleChangePage';

  // Added display name
  handleChangePage.displayName = 'handleChangePage';

  // Added display name
  handleChangePage.displayName = 'handleChangePage';

  // Added display name
  handleChangePage.displayName = 'handleChangePage';

  // Added display name
  handleChangePage.displayName = 'handleChangePage';


    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
  // Added display name
  handleFilterChange.displayName = 'handleFilterChange';

  // Added display name
  handleFilterChange.displayName = 'handleFilterChange';

  // Added display name
  handleFilterChange.displayName = 'handleFilterChange';

  // Added display name
  handleFilterChange.displayName = 'handleFilterChange';

  // Added display name
  handleFilterChange.displayName = 'handleFilterChange';


    setFilters({
      ...filters,
      [filterName]: value,
    });
    setPage(0);
  };

  // Apply filters and refresh logs
  const applyFilters = () => {
  // Added display name
  applyFilters.displayName = 'applyFilters';

  // Added display name
  applyFilters.displayName = 'applyFilters';

  // Added display name
  applyFilters.displayName = 'applyFilters';

  // Added display name
  applyFilters.displayName = 'applyFilters';

  // Added display name
  applyFilters.displayName = 'applyFilters';


    fetchLogs();
  };

  // Reset all filters
  const resetFilters = () => {
  // Added display name
  resetFilters.displayName = 'resetFilters';

  // Added display name
  resetFilters.displayName = 'resetFilters';

  // Added display name
  resetFilters.displayName = 'resetFilters';

  // Added display name
  resetFilters.displayName = 'resetFilters';

  // Added display name
  resetFilters.displayName = 'resetFilters';


    setFilters({
      severity: 'all',
      component: 'all',
      dateRange: 'all',
      search: ',
    });
    setPage(0);
    fetchLogs();
  };

  // Handle search input
  const handleSearchChange = (event) => {
  // Added display name
  handleSearchChange.displayName = 'handleSearchChange';

  // Added display name
  handleSearchChange.displayName = 'handleSearchChange';

  // Added display name
  handleSearchChange.displayName = 'handleSearchChange';

  // Added display name
  handleSearchChange.displayName = 'handleSearchChange';

  // Added display name
  handleSearchChange.displayName = 'handleSearchChange';


    handleFilterChange('search', event.target.value);
  };

  // Perform search on enter key
  const handleSearchKeyDown = (event) => {
  // Added display name
  handleSearchKeyDown.displayName = 'handleSearchKeyDown';

  // Added display name
  handleSearchKeyDown.displayName = 'handleSearchKeyDown';

  // Added display name
  handleSearchKeyDown.displayName = 'handleSearchKeyDown';

  // Added display name
  handleSearchKeyDown.displayName = 'handleSearchKeyDown';

  // Added display name
  handleSearchKeyDown.displayName = 'handleSearchKeyDown';


    if (event.key === 'Enter') {
      applyFilters();
    }
  };

  // Export logs to selected format
  const handleExportLogs = async () => {
    try {
      // Build query parameters based on current filters
      const params = {};

      if (filters.severity !== 'all') {
        params.severity = filters.severity;
      }

      if (filters.component !== 'all') {
        params.component = filters.component;
      }

      if (filters.dateRange !== 'all') {
        const now = new Date();
        let startDate;

        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            startDate = null;
        }

        if (startDate) {
          params.start_date = startDate.toISOString();
          params.end_date = new Date().toISOString();
        }
      }

      if (filters.search && filters.search.trim() !== ') {
        params.search = filters.search;
      }

      // Export based on selected format
      if (exportFormat === 'csv') {
        await exportLogsCSV(params);
      } else if (exportFormat === 'json') {
        await exportLogsJSON(params);
      }
    } catch (err) {
      console.error('Error exporting logs:', err);
      // Show error notification
      // This would use the notification system in a real implementation
    }
  };

  // View log details
  const handleViewLogDetails = log => {
    setSelectedLog(log);
  };

  // Close log details modal
  const handleCloseLogDetails = () => {
  // Added display name
  handleCloseLogDetails.displayName = 'handleCloseLogDetails';

  // Added display name
  handleCloseLogDetails.displayName = 'handleCloseLogDetails';

  // Added display name
  handleCloseLogDetails.displayName = 'handleCloseLogDetails';

  // Added display name
  handleCloseLogDetails.displayName = 'handleCloseLogDetails';

  // Added display name
  handleCloseLogDetails.displayName = 'handleCloseLogDetails';


    setSelectedLog(null);
  };

  const theme = useTheme();
  
  return (
    <Card>
      <CardHeader
        title="Application Error Logs&quot;
        action={
          <Box style={{ display: "flex', gap: '8px' }}>
            <Button 
              startIcon={<RefreshIcon />} 
              size="small&quot; 
              onClick={fetchLogs} 
              disabled={loading}
              variant="outlined"
            >
              Refresh
            </Button>
            <Button
              startIcon={<FilterIcon />}
              size="small&quot;
              onClick={() => setShowFilters(!showFilters)}
              variant="outlined"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <FormControl size="small&quot; style={{ minWidth: "100px' }}>
              <Select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                variant="outlined&quot;
                size="small"
              >
                <MenuItem value="csv&quot;>CSV</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
              </Select>
            </FormControl>
            <Button
              startIcon={<DownloadIcon />}
              size="small&quot;
              onClick={handleExportLogs}
              disabled={loading || logs.length === 0}
              variant="outlined"
            >
              Export
            </Button>
          </Box>
        }
      />

      <Divider />

      {/* Filters */}
      {showFilters && (
        <Box style={{ 
          padding: '16px', 
          backgroundColor: theme.colors?.background?.paper || theme.palette.background.paper 
        }}>
          <Grid container spacing={2} alignItems="center&quot;>
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <Box style={{ marginBottom: "8px' }}>
                <Typography variant="body2&quot; style={{ marginBottom: "4px' }}>Severity</Typography>
                <FormControl fullWidth size="small&quot;>
                  <Select
                    id="severity-filter"
                    value={filters.severity}
                    onChange={e => handleFilterChange('severity', e.target.value)}
                  >
                    <MenuItem value="all&quot;>All Severities</MenuItem>
                    {severityLevels.map(level => (
                      <MenuItem key={level} value={level}>
                        <Box display="flex" alignItems="center&quot; gap="4px">
                          {getSeverityIcon(level)}
                          <span style={{ textTransform: 'capitalize' }}>{level}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <Box style={{ marginBottom: '8px' }}>
                <Typography variant="body2&quot; style={{ marginBottom: "4px' }}>Component</Typography>
                <FormControl fullWidth size="small&quot;>
                  <Select
                    id="component-filter"
                    value={filters.component}
                    onChange={e => handleFilterChange('component', e.target.value)}
                  >
                    <MenuItem value="all&quot;>All Components</MenuItem>
                    {components.map(component => (
                      <MenuItem key={component} value={component}>
                        {component}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <Box style={{ marginBottom: "8px' }}>
                <Typography variant="body2&quot; style={{ marginBottom: "4px' }}>Date Range</Typography>
                <FormControl fullWidth size="small&quot;>
                  <Select
                    id="date-range-filter"
                    value={filters.dateRange}
                    onChange={e => handleFilterChange('dateRange', e.target.value)}
                  >
                    <MenuItem value="all&quot;>All Time</MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="week&quot;>Last 7 Days</MenuItem>
                    <MenuItem value="month">Last 30 Days</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <Box style={{ marginBottom: '8px' }}>
                <Typography variant="body2&quot; style={{ marginBottom: "4px' }}>Search</Typography>
                <TextField
                  fullWidth
                  id="search-filter&quot;
                  value={filters.search}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search message, component, ID..."
                  size="small&quot;
                  InputProps={{
                    endAdornment: filters.search ? (
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          handleFilterChange('search', ');
                          fetchLogs();
                        }}
                      >
                        <ClearIcon fontSize="small&quot; />
                      </IconButton>
                    ) : (
                      <IconButton size="small" onClick={applyFilters}>
                        <SearchIcon fontSize="small&quot; />
                      </IconButton>
                    ),
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={2}>
              <Box display="flex" gap="8px&quot;>
                <Button
                  variant="contained"
                  size="small&quot;
                  onClick={applyFilters}
                  disabled={loading}
                  fullWidth
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outlined"
                  size="small&quot;
                  onClick={resetFilters}
                  disabled={loading}
                >
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      <Divider />

      {/* Active filters summary */}
      {(filters.severity !== "all' || filters.component !== 'all' || filters.dateRange !== 'all' || filters.search) && (
        <Box 
          style={{ 
            padding: '8px 16px', 
            backgroundColor: theme.colors?.background?.default || theme.palette.background.default,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center'
          }}
        >
          <Typography variant="body2&quot; style={{ marginRight: "8px' }}>Active filters:</Typography>
          
          {filters.severity !== 'all' && (
            <Chip 
              label={'Severity: ${filters.severity}'}
              size="small&quot;
              color={getSeverityColor(filters.severity)}
              onDelete={() => {
                handleFilterChange("severity', 'all');
                fetchLogs();
              }}
            />
          )}
          
          {filters.component !== 'all' && (
            <Chip 
              label={'Component: ${filters.component}'}
              size="small&quot;
              onDelete={() => {
                handleFilterChange("component', 'all');
                fetchLogs();
              }}
            />
          )}
          
          {filters.dateRange !== 'all' && (
            <Chip 
              label={'Date: ${filters.dateRange === 'today' ? 'Today' : 
                filters.dateRange === 'week' ? 'Last 7 days' : 
                filters.dateRange === 'month' ? 'Last 30 days' : filters.dateRange}'}
              size="small&quot;
              onDelete={() => {
                handleFilterChange("dateRange', 'all');
                fetchLogs();
              }}
            />
          )}
          
          {filters.search && (
            <Chip 
              label={'Search: ${truncateText(filters.search, 20)}'}
              size="small&quot;
              icon={<SearchIcon fontSize="small" />}
              onDelete={() => {
                handleFilterChange('search', ');
                fetchLogs();
              }}
            />
          )}
          
          {(filters.severity !== 'all' || filters.component !== 'all' || filters.dateRange !== 'all' || filters.search) && (
            <Button 
              size="small&quot;
              variant="text"
              onClick={resetFilters}
            >
              Clear All
            </Button>
          )}
        </Box>
      )}

      <CardContent style={{ padding: 0 }}>
        <StatusDisplay
          loading={loading}
          error={error}
          isEmpty={logs.length === 0}
          emptyMessage={isSearching ? "No logs found matching your search criteria" : "No error logs available"}
        >
          <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
            <Table style={{ minWidth: 650 }} size="small&quot;>
              <TableHead>
                <TableRow>
                  <TableCell width="90px">Severity</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell width="140px&quot;>Component</TableCell>
                  <TableCell width="180px">Timestamp</TableCell>
                  <TableCell align="right&quot; width="80px">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map(log => (
                  <TableRow 
                    key={log.id} 
                    style={{ 
                      '&:last-child td, &:last-child th': { border: 0 } 
                    }}
                  >
                    <TableCell>
                      <Chip 
                        label={log.severity} 
                        size="small&quot; 
                        color={getSeverityColor(log.severity)}
                        icon={getSeverityIcon(log.severity)}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Click for details" arrow>
                        <Typography 
                          variant="body2&quot; 
                          style={{ 
                            cursor: "pointer',
                            textDecoration: 'underline',
                            color: theme.colors?.text?.primary || theme.palette.text.primary
                          }}
                          onClick={() => handleViewLogDetails(log)}
                        >
                          {truncateText(log.message, 100)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{log.component}</TableCell>
                    <TableCell>{formatDate(log.timestamp)}</TableCell>
                    <TableCell align="right&quot;>
                      <Tooltip title="View details">
                        <IconButton 
                          size="small&quot;
                          onClick={() => handleViewLogDetails(log)}
                          aria-label="View details"
                        >
                          <InfoIcon fontSize="small&quot; />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={totalLogs}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />

          {/* Log Details Dialog */}
          {selectedLog && (
            <Box
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1300,
              }}
              onClick={handleCloseLogDetails}
            >
              <Card
                style={{
                  width: '90%',
                  maxWidth: '900px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                }}
                onClick={e => e.stopPropagation()}
              >
                <CardHeader
                  title={
                    <Box display="flex&quot; alignItems="center" gap="8px&quot;>
                      <Chip 
                        label={selectedLog.severity} 
                        size="small" 
                        color={getSeverityColor(selectedLog.severity)}
                        icon={getSeverityIcon(selectedLog.severity)}
                      />
                      <Typography variant="h6&quot;>Error Log Details</Typography>
                    </Box>
                  }
                  subheader={formatDate(selectedLog.timestamp)}
                  action={
                    <Box
                      as="button"
                      onClick={handleCloseLogDetails}
                      aria-label="close"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '4px',
                        fontSize: '24px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ×
                    </Box>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography 
                        variant="subtitle2&quot; 
                        style={{ 
                          color: theme.colors?.text?.secondary || theme.palette.text.secondary 
                        }}
                      >
                        Log ID
                      </Typography>
                      <Typography variant="body2">{selectedLog.id}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography 
                        variant="subtitle2&quot; 
                        style={{ 
                          color: theme.colors?.text?.secondary || theme.palette.text.secondary 
                        }}
                      >
                        Component
                      </Typography>
                      <Typography variant="body2">{selectedLog.component}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography 
                        variant="subtitle2&quot; 
                        style={{ 
                          color: theme.colors?.text?.secondary || theme.palette.text.secondary 
                        }}
                      >
                        Message
                      </Typography>
                      <Typography variant="body2">{selectedLog.message}</Typography>
                    </Grid>
                    
                    {selectedLog.stack_trace && (
                      <Grid item xs={12}>
                        <Typography 
                          variant="subtitle2&quot; 
                          style={{ 
                            color: theme.colors?.text?.secondary || theme.palette.text.secondary 
                          }}
                        >
                          Stack Trace
                        </Typography>
                        <Box
                          style={{
                            padding: "12px',
                            backgroundColor: theme.colors?.background?.paper || theme.palette.background.paper,
                            border: '1px solid ${theme.colors?.divider || theme.palette.divider}',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            overflowX: 'auto',
                            maxHeight: '300px',
                            overflowY: 'auto',
                          }}
                        >
                          {selectedLog.stack_trace}
                        </Box>
                      </Grid>
                    )}

                    {selectedLog.context && (
                      <Grid item xs={12}>
                        <Typography 
                          variant="subtitle2&quot; 
                          style={{ 
                            color: theme.colors?.text?.secondary || theme.palette.text.secondary 
                          }}
                        >
                          Context
                        </Typography>
                        <Box
                          style={{
                            padding: "12px',
                            backgroundColor: theme.colors?.background?.paper || theme.palette.background.paper,
                            border: '1px solid ${theme.colors?.divider || theme.palette.divider}',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {typeof selectedLog.context === 'object' 
                            ? JSON.stringify(selectedLog.context, null, 2) 
                            : selectedLog.context}
                        </Box>
                      </Grid>
                    )}

                    {selectedLog.additional_data && (
                      <Grid item xs={12}>
                        <Typography 
                          variant="subtitle2&quot; 
                          style={{ 
                            color: theme.colors?.text?.secondary || theme.palette.text.secondary 
                          }}
                        >
                          Additional Data
                        </Typography>
                        <Box
                          style={{
                            padding: "12px',
                            backgroundColor: theme.colors?.background?.paper || theme.palette.background.paper,
                            border: '1px solid ${theme.colors?.divider || theme.palette.divider}',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {typeof selectedLog.additional_data === 'object' 
                            ? JSON.stringify(selectedLog.additional_data, null, 2) 
                            : selectedLog.additional_data}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}
        </StatusDisplay>
      </CardContent>
    </Card>
  );
};

export default ErrorLogViewer;