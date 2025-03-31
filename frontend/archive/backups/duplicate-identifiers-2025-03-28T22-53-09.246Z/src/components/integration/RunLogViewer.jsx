// RunLogViewer.jsx
// -----------------------------------------------------------------------------
// Component for viewing and filtering integration run logs

import React, { useState, useEffect } from 'react';
// Import design system components through the adapter layer
import { Box, Button, Typography, TextField, Chip, CircularProgress } from '../../design-system';

// Still using Material UI components until fully migrated
import { Card, CardContent, CardHeader, Divider, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, useTheme } from '../../design-system';
import IconButton from '@mui/material/IconButton';;

// Icons - keep Material UI icons for now
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Assignment as LogIcon,
  GetApp as DownloadIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// Import components
import StatusDisplay from '@components/common/StatusDisplay';

// Import services
import { getIntegrationRuns } from '@services/integrationService';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
// Status color mapper
const getStatusColor = status => {
  switch (status) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'running':
      return 'info';
    case 'pending':
      return 'default';
    default:
      return 'default';
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

// Format duration between two dates
const formatDuration = (startDate, endDate) => {
  // Added display name
  formatDuration.displayName = 'formatDuration';

  // Added display name
  formatDuration.displayName = 'formatDuration';

  // Added display name
  formatDuration.displayName = 'formatDuration';


  if (!startDate || !endDate) return 'N/A';

  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationMs = end - start;

  // If still running or invalid duration
  if (durationMs < 0) return 'N/A';

  // Format as minutes and seconds
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);

  if (minutes === 0) {
    return `${seconds}s';
  }
  return '${minutes}m ${seconds}s';
};

const RunLogViewer = ({ integrationId }) => {
  // Added display name
  RunLogViewer.displayName = 'RunLogViewer';

  // Added display name
  RunLogViewer.displayName = 'RunLogViewer';

  // Added display name
  RunLogViewer.displayName = 'RunLogViewer';


  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    search: ',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRun, setSelectedRun] = useState(null);

  // Fetch integration runs
  useEffect(() => {
    fetchRuns();
  }, [integrationId]);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      // Calculate pagination parameters
      const skip = page * rowsPerPage;
      const limit = rowsPerPage;

      const data = await getIntegrationRuns(integrationId, skip, limit);
      setRuns(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching integration runs:', err);
      setError('Failed to load integration run logs');
    } finally {
      setLoading(false);
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


    setPage(newPage);
    fetchRuns();
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    fetchRuns();
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
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

  // Apply filters to the runs
  const filteredRuns = runs.filter(run => {
    // Filter by status
    if (filters.status !== 'all' && run.status !== filters.status) {
      return false;
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const runDate = new Date(run.start_time);
      const diffDays = Math.floor((now - runDate) / (1000 * 60 * 60 * 24));

      if (filters.dateRange === 'today' && diffDays > 0) {
        return false;
      }

      if (filters.dateRange === 'week' && diffDays > 7) {
        return false;
      }

      if (filters.dateRange === 'month' && diffDays > 30) {
        return false;
      }
    }

    // Filter by search term (in error message or id)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const includesInError = run.error && run.error.toLowerCase().includes(searchTerm);
      const includesInId = run.id.toString().includes(searchTerm);

      if (!includesInError && !includesInId) {
        return false;
      }
    }

    return true;
  });

  // Export logs to CSV
  const exportLogsToCSV = () => {
  // Added display name
  exportLogsToCSV.displayName = 'exportLogsToCSV';

  // Added display name
  exportLogsToCSV.displayName = 'exportLogsToCSV';

  // Added display name
  exportLogsToCSV.displayName = 'exportLogsToCSV';


    if (runs.length === 0) return;

    // Create CSV content
    const headers = [
      'ID',
      'Status',
      'Start Time',
      'End Time',
      'Duration',
      'Records Processed',;
      'Error',;
    ];
    const rows = filteredRuns.map(run => [
      run.id,
      run.status,
      run.start_time,
      run.end_time || 'N/A',
      formatDuration(run.start_time, run.end_time),
      run.records_processed || 0,;
      run.error || ',;
    ]);

    // Add headers
    let csvContent = headers.join(',') + '\n';

    // Add rows
    rows.forEach(row => {
      // Handle values that might contain commas
      const formattedRow = row.map(value => {
        if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
          return '${value.replace(/"/g, '""')}';
        }
        return value;
      });
      csvContent += formattedRow.join(',') + '\n';
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'integration-${integrationId}-runs.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View run details
  const handleViewRunDetails = run => {
    setSelectedRun(run);
  };

  // Close run details modal
  const handleCloseRunDetails = () => {
  // Added display name
  handleCloseRunDetails.displayName = 'handleCloseRunDetails';

  // Added display name
  handleCloseRunDetails.displayName = 'handleCloseRunDetails';

  // Added display name
  handleCloseRunDetails.displayName = 'handleCloseRunDetails';


    setSelectedRun(null);
  };

  const theme = useTheme();
  
  return (
    <Card>
      <CardHeader
        title="Integration Run Logs"
        action={
          <Box style={{ display: 'flex', gap: '8px' }}>
            <Button 
              startIcon={<RefreshIcon />} 
              size="small" 
              onClick={fetchRuns} 
              disabled={loading}
              variant="outlined"
            >
              Refresh
            </Button>
            <Button
              startIcon={<FilterIcon />}
              size="small"
              onClick={() => setShowFilters(!showFilters)}
              variant="outlined"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button
              startIcon={<DownloadIcon />}
              size="small"
              onClick={exportLogsToCSV}
              disabled={runs.length === 0}
              variant="outlined"
            >
              Export
            </Button>
          </Box>
        }
      />

      <Divider />

      {/* Filters - keep Material UI Grid and Select components for complexity reasons */}
      {showFilters && (
        <Box style={{ 
          padding: '16px', 
          backgroundColor: theme.colors?.background?.paper || theme.palette.background.paper 
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} md={3}>
              <Box style={{ marginBottom: '8px' }}>
                <Typography variant="body2" style={{ marginBottom: '4px' }}>Status</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    id="status-filter"
                    value={filters.status}
                    onChange={e => handleFilterChange('status', e.target.value)}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="success">Success</MenuItem>
                    <MenuItem value="warning">Warning</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                    <MenuItem value="running">Running</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Box style={{ marginBottom: '8px' }}>
                <Typography variant="body2" style={{ marginBottom: '4px' }}>Date Range</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    id="date-range-filter"
                    value={filters.dateRange}
                    onChange={e => handleFilterChange('dateRange', e.target.value)}
                  >
                    <MenuItem value="all">All Time</MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="week">Last 7 Days</MenuItem>
                    <MenuItem value="month">Last 30 Days</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Box style={{ marginBottom: '8px' }}>
                <Typography variant="body2" style={{ marginBottom: '4px' }}>Search</Typography>
                <TextField
                  fullWidth
                  id="search-filter"
                  value={filters.search}
                  onChange={e => handleFilterChange('search', e.target.value)}
                  placeholder="Search by ID or error..."
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      <Divider />

      <CardContent style={{ padding: 0 }}>
        <StatusDisplay
          loading={loading}
          error={error}
          isEmpty={runs.length === 0}
          emptyMessage="No run logs available for this integration"
        >
          <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
            <Table style={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Records</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRuns.map(run => (
                  <TableRow 
                    key={run.id} 
                    style={{ 
                      '&:last-child td, &:last-child th': { border: 0 } 
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {run.id}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={run.status} 
                        size="small" 
                        color={getStatusColor(run.status)}
                      />
                    </TableCell>
                    <TableCell>{formatDate(run.start_time)}</TableCell>
                    <TableCell>{run.end_time ? formatDate(run.end_time) : 'Running...'}</TableCell>
                    <TableCell>{formatDuration(run.start_time, run.end_time)}</TableCell>
                    <TableCell>{run.records_processed || 0}</TableCell>
                    <TableCell align="right">
                      <Box
                        as="button"
                        onClick={() => handleViewRunDetails(run)}
                        aria-label="View details"
                        title="View details"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '4px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: theme.colors?.primary?.main || theme.palette.primary.main
                        }}
                      >
                        <InfoIcon fontSize="small" />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={runs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />

          {/* Run Details Dialog - Keep some Material UI components for complex interaction */}
          {selectedRun && (
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
              onClick={handleCloseRunDetails}
            >
              <Card
                style={{
                  width: '90%',
                  maxWidth: '800px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                }}
                onClick={e => e.stopPropagation()}
              >
                <CardHeader
                  title={'Run Details: #${selectedRun.id}'}
                  subheader={formatDate(selectedRun.start_time)}
                  action={
                    <Box
                      as="button"
                      onClick={handleCloseRunDetails}
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
                        variant="subtitle2" 
                        style={{ 
                          color: theme.colors?.text?.secondary || theme.palette.text.secondary 
                        }}
                      >
                        Status
                      </Typography>
                      <Chip
                        label={selectedRun.status}
                        color={getStatusColor(selectedRun.status)}
                        size="small"
                        style={{ marginTop: '4px' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography 
                        variant="subtitle2" 
                        style={{ 
                          color: theme.colors?.text?.secondary || theme.palette.text.secondary 
                        }}
                      >
                        Duration
                      </Typography>
                      <Typography variant="body2">
                        {formatDuration(selectedRun.start_time, selectedRun.end_time)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography 
                        variant="subtitle2" 
                        style={{ 
                          color: theme.colors?.text?.secondary || theme.palette.text.secondary 
                        }}
                      >
                        Start Time
                      </Typography>
                      <Typography variant="body2">{formatDate(selectedRun.start_time)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography 
                        variant="subtitle2" 
                        style={{ 
                          color: theme.colors?.text?.secondary || theme.palette.text.secondary 
                        }}
                      >
                        End Time
                      </Typography>
                      <Typography variant="body2">
                        {selectedRun.end_time ? formatDate(selectedRun.end_time) : 'Running...'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography 
                        variant="subtitle2" 
                        style={{ 
                          color: theme.colors?.text?.secondary || theme.palette.text.secondary 
                        }}
                      >
                        Records Processed
                      </Typography>
                      <Typography variant="body2">{selectedRun.records_processed || 0}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider style={{ margin: '8px 0' }} />
                    </Grid>

                    {selectedRun.warnings && selectedRun.warnings.length > 0 && (
                      <Grid item xs={12}>
                        <Typography 
                          variant="subtitle2" 
                          style={{ 
                            color: theme.colors?.status?.warning?.main || theme.palette.warning.main 
                          }}
                        >
                          Warnings
                        </Typography>
                        <Box
                          style={{
                            padding: '8px',
                            marginTop: '8px',
                            backgroundColor: theme.colors?.status?.warning?.lightest || theme.palette.warning.light,
                            border: '1px solid ${theme.colors?.status?.warning?.light || theme.palette.warning.main}',
                            borderRadius: '4px'
                          }}
                        >
                          <Box as="ul" style={{ margin: 0, paddingLeft: '20px' }}>
                            {selectedRun.warnings.map((warning, index) => (
                              <Box as="li" key={index}>
                                <Typography variant="body2">{warning}</Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Grid>
                    )}

                    {selectedRun.error && (
                      <Grid item xs={12}>
                        <Typography 
                          variant="subtitle2" 
                          style={{ 
                            color: theme.colors?.status?.error?.main || theme.palette.error.main 
                          }}
                        >
                          Error
                        </Typography>
                        <Box
                          style={{
                            padding: '8px',
                            marginTop: '8px',
                            backgroundColor: theme.colors?.status?.error?.lightest || theme.palette.error.light,
                            border: '1px solid ${theme.colors?.status?.error?.light || theme.palette.error.main}`,
                            borderRadius: '4px'
                          }}
                        >
                          <Typography variant="body2">{selectedRun.error}</Typography>
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

// Add displayName for improved debugging in React DevTools
RunLogViewer.displayName = 'RunLogViewer';

export default RunLogViewer;
