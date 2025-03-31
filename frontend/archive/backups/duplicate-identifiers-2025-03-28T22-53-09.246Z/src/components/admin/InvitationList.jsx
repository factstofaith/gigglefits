import React, { useState, useEffect } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Button, Chip, TextField, InputAdornment, Grid, Typography, Select, MenuItem, FormControl, InputLabel, Tooltip } from '../../design-system';
import IconButton from '@mui/material/IconButton';;
import { 
  Search as SearchIcon, 
  Refresh as RefreshIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Send as ResendIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { invitationService } from '@services/userManagementService';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
/**
 * Component for displaying and managing user invitations
 */
const InvitationList = () => {
  // Added display name
  InvitationList.displayName = 'InvitationList';

  // Added display name
  InvitationList.displayName = 'InvitationList';

  // Added display name
  InvitationList.displayName = 'InvitationList';


  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const navigate = useNavigate();
  
  // Fetch invitations on component mount
  useEffect(() => {
    fetchInvitations();
  }, [page, rowsPerPage, statusFilter]);
  
  // Fetch invitations from API
  const fetchInvitations = async () => {
    setLoading(true);
    try {
      // Prepare filter parameters
      const filters = {
        page: page + 1, // API uses 1-based indexing
        limit: rowsPerPage
      };
      
      // Add status filter if not 'all'
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      
      // Add search term if present
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      const response = await invitationService.getInvitations(filters);
      setInvitations(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setError('Failed to load invitations. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search form submission
  const handleSearch = (e) => {
  // Added display name
  handleSearch.displayName = 'handleSearch';

  // Added display name
  handleSearch.displayName = 'handleSearch';

  // Added display name
  handleSearch.displayName = 'handleSearch';


    e.preventDefault();
    setPage(0); // Reset to first page on new search
    fetchInvitations();
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (e) => {
  // Added display name
  handleStatusFilterChange.displayName = 'handleStatusFilterChange';

  // Added display name
  handleStatusFilterChange.displayName = 'handleStatusFilterChange';

  // Added display name
  handleStatusFilterChange.displayName = 'handleStatusFilterChange';


    setStatusFilter(e.target.value);
    setPage(0); // Reset to first page on filter change
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
  
  // Handle create invitation button click
  const handleCreateInvitation = () => {
  // Added display name
  handleCreateInvitation.displayName = 'handleCreateInvitation';

  // Added display name
  handleCreateInvitation.displayName = 'handleCreateInvitation';

  // Added display name
  handleCreateInvitation.displayName = 'handleCreateInvitation';


    navigate('/admin/invitations/new');
  };
  
  // Handle view invitation details
  const handleViewInvitation = (id) => {
  // Added display name
  handleViewInvitation.displayName = 'handleViewInvitation';

  // Added display name
  handleViewInvitation.displayName = 'handleViewInvitation';

  // Added display name
  handleViewInvitation.displayName = 'handleViewInvitation';


    navigate(`/admin/invitations/${id}`);
  };
  
  // Handle resend invitation
  const handleResendInvitation = async (id) => {
    try {
      await invitationService.resendInvitation(id);
      // Refresh the list
      fetchInvitations();
    } catch (err) {
      console.error('Error resending invitation:', err);
      setError('Failed to resend invitation. Please try again.');
    }
  };
  
  // Handle cancel invitation
  const handleCancelInvitation = async (id) => {
    if (window.confirm('Are you sure you want to cancel this invitation?')) {
      try {
        await invitationService.cancelInvitation(id);
        // Refresh the list
        fetchInvitations();
      } catch (err) {
        console.error('Error cancelling invitation:', err);
        setError('Failed to cancel invitation. Please try again.');
      }
    }
  };
  
  // Get status chip color based on invitation status
  const getStatusChipColor = (status) => {
  // Added display name
  getStatusChipColor.displayName = 'getStatusChipColor';

  // Added display name
  getStatusChipColor.displayName = 'getStatusChipColor';

  // Added display name
  getStatusChipColor.displayName = 'getStatusChipColor';


    switch (status) {
      case 'PENDING':
        return 'primary';
      case 'ACCEPTED':
        return 'success';
      case 'EXPIRED':
        return 'warning';
      case 'CANCELED':
        return 'error';
      default:
        return 'default';
    }
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Invitations
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateInvitation}
        >
          New Invitation
        </Button>
      </Box>
      
      {/* Filters and search */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Box component="form" onSubmit={handleSearch}>
            <TextField
              fullWidth
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="ACCEPTED">Accepted</MenuItem>
              <MenuItem value="EXPIRED">Expired</MenuItem>
              <MenuItem value="CANCELED">Canceled</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchInvitations}
            sx={{ height: '56px' }}
          >
            Refresh
          </Button>
        </Grid>
      </Grid>
      
      {/* Error message */}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {/* Invitations table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : invitations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No invitations found
                </TableCell>
              </TableRow>
            ) : (
              invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>{invitation.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={invitation.status}
                      color={getStatusChipColor(invitation.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{invitation.created_by_name}</TableCell>
                  <TableCell>{new Date(invitation.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    {invitation.status === 'PENDING'
                      ? new Date(invitation.expires_at).toLocaleString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewInvitation(invitation.id)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {invitation.status === 'PENDING' && (
                        <>
                          <Tooltip title="Resend Invitation">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleResendInvitation(invitation.id)}
                            >
                              <ResendIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Cancel Invitation">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleCancelInvitation(invitation.id)}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      
                      {invitation.status === 'EXPIRED' && (
                        <Tooltip title="Resend Invitation">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleResendInvitation(invitation.id)}
                          >
                            <ResendIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={invitations.length} // This should be the total count from API in a real implementation
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default InvitationList;