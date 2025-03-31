import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, TablePagination, Chip, LinearProgress, Alert, TextField, Button, InputAdornment, Grid, FormControl, InputLabel, Select, MenuItem } from '../../design-system';
import IconButton from '@mui/material/IconButton';;
import { 
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useUser } from '@contexts/UserContext';
import { userService } from '@services/userManagementService';
import Tab from '@mui/material/Tab';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
/**
 * Component for displaying user login history
 * Shows a paginated table of login attempts with filtering options
 */
const LoginHistory = () => {
  // Added display name
  LoginHistory.displayName = 'LoginHistory';

  // Added display name
  LoginHistory.displayName = 'LoginHistory';

  // Added display name
  LoginHistory.displayName = 'LoginHistory';


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filtering state
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  
  const { user } = useUser();
  
  // Fetch login history on component mount and when filters or pagination change
  useEffect(() => {
    if (user?.id) {
      fetchLoginHistory();
    }
  }, [user, page, rowsPerPage, filters.status]);
  
  // Fetch login history from API
  const fetchLoginHistory = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Prepare filter params
      const params = {
        page: page + 1, // API uses 1-based indexing
        limit: rowsPerPage
      };
      
      // Add status filter if not 'all'
      if (filters.status !== 'all') {
        params.status = filters.status;
      }
      
      // Add date range filters if provided
      if (filters.dateFrom) {
        params.from_date = filters.dateFrom;
      }
      
      if (filters.dateTo) {
        params.to_date = filters.dateTo;
      }
      
      // Add search term if provided
      if (filters.search) {
        params.search = filters.search;
      }
      
      const response = await userService.getLoginHistory(user.id, params);
      setLoginHistory(response.data.history || []);
      setTotalCount(response.data.total || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching login history:', err);
      setError('Failed to load login history. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle pagination changes
  const handleChangePage = (event, newPage) => {
  // Added display name
  handleChangePage.displayName = 'handleChangePage';

  // Added display name
  handleChangePage.displayName = 'handleChangePage';

  // Added display name
  handleChangePage.displayName = 'handleChangePage';


    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
  // Added display name
  handleChangeRowsPerPage.displayName = 'handleChangeRowsPerPage';

  // Added display name
  handleChangeRowsPerPage.displayName = 'handleChangeRowsPerPage';

  // Added display name
  handleChangeRowsPerPage.displayName = 'handleChangeRowsPerPage';


    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
  // Added display name
  handleFilterChange.displayName = 'handleFilterChange';

  // Added display name
  handleFilterChange.displayName = 'handleFilterChange';

  // Added display name
  handleFilterChange.displayName = 'handleFilterChange';


    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle search
  const handleSearch = (e) => {
  // Added display name
  handleSearch.displayName = 'handleSearch';

  // Added display name
  handleSearch.displayName = 'handleSearch';

  // Added display name
  handleSearch.displayName = 'handleSearch';


    e.preventDefault();
    setPage(0); // Reset to first page
    fetchLoginHistory();
  };
  
  // Handle refresh
  const handleRefresh = () => {
  // Added display name
  handleRefresh.displayName = 'handleRefresh';

  // Added display name
  handleRefresh.displayName = 'handleRefresh';

  // Added display name
  handleRefresh.displayName = 'handleRefresh';


    fetchLoginHistory();
  };
  
  // Format date string
  const formatDate = (dateString) => {
  // Added display name
  formatDate.displayName = 'formatDate';

  // Added display name
  formatDate.displayName = 'formatDate';

  // Added display name
  formatDate.displayName = 'formatDate';


    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom>
        Login History
      </Typography>
      
      {/* Loading indicator */}
      {loading && <LinearProgress sx={{ mb: 3 }} />}
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Filters and search */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Box component="form" onSubmit={handleSearch}>
              <TextField
                fullWidth
                placeholder="Search by IP address"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton type="submit">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="SUCCESS">Successful</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="From Date"
              name="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="To Date"
              name="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ height: '56px' }}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Login history table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date & Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>User Agent</TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loginHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No login history found.
                </TableCell>
              </TableRow>
            ) : (
              loginHistory.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{formatDate(entry.timestamp)}</TableCell>
                  <TableCell>
                    <Chip
                      label={entry.status === 'SUCCESS' ? 'Successful' : 'Failed'}
                      color={entry.status === 'SUCCESS' ? 'success' : 'error'}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{entry.ip_address || 'Unknown'}</TableCell>
                  <TableCell>
                    {entry.user_agent ? 
                      entry.user_agent.substring(0, 30) + (entry.user_agent.length > 30 ? '...' : '') : 
                      'Unknown'
                    }
                  </TableCell>
                  <TableCell>{entry.location || 'Unknown'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default LoginHistory;