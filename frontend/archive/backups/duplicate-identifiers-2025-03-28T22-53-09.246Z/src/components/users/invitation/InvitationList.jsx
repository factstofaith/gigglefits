import React, { useState, useEffect } from 'react';
import { invitationService } from '@services/userManagementService';
import { useUser } from '@contexts/UserContext';
import { Box, Button, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Typography, TextField, Chip, Tooltip, FormControl, InputLabel, Select, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Alert, CircularProgress } from '@design-system/adapter';
;
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { formatDistance } from 'date-fns';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
/**
 * InvitationList Component
 * 
 * Displays a list of user invitations with actions to manage them
 */
const InvitationList = () => {
  // Added display name
  InvitationList.displayName = 'InvitationList';

  // Added display name
  InvitationList.displayName = 'InvitationList';

  // Added display name
  InvitationList.displayName = 'InvitationList';


  const { isAdmin } = useUser();

  // State for invitations and pagination
  const [invitations, setInvitations] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for filtering
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for loading and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State for the confirmation dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [dialogAction, setDialogAction] = useState('');

  // Load invitations on component mount and when filters change
  useEffect(() => {
    fetchInvitations();
  }, [page, rowsPerPage, statusFilter]);

  // Fetch invitations from the API
  const fetchInvitations = async () => {
    setLoading(true);
    setError('');

    try {
      const filters = {
        skip: page * rowsPerPage,
        limit: rowsPerPage,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      };

      const response = await invitationService.getInvitations(filters);
      setInvitations(response.data.invitations);
      setTotalCount(response.data.total);
    } catch (err) {
      setError('Failed to load invitations. Please try again.');
      console.error('Error fetching invitations:', err);
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
  };

  // Handle rows per page change
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

  // Handle status filter change
  const handleStatusFilterChange = (event) => {
  // Added display name
  handleStatusFilterChange.displayName = 'handleStatusFilterChange';

  // Added display name
  handleStatusFilterChange.displayName = 'handleStatusFilterChange';

  // Added display name
  handleStatusFilterChange.displayName = 'handleStatusFilterChange';


    setStatusFilter(event.target.value);
    setPage(0);
  };

  // Handle search
  const handleSearch = (event) => {
  // Added display name
  handleSearch.displayName = 'handleSearch';

  // Added display name
  handleSearch.displayName = 'handleSearch';

  // Added display name
  handleSearch.displayName = 'handleSearch';


    if (event.key === 'Enter') {
      setSearchQuery(event.target.value);
      setPage(0);
      fetchInvitations();
    }
  };

  // Open the confirmation dialog
  const openDialog = (invitation, action) => {
  // Added display name
  openDialog.displayName = 'openDialog';

  // Added display name
  openDialog.displayName = 'openDialog';

  // Added display name
  openDialog.displayName = 'openDialog';


    setSelectedInvitation(invitation);
    setDialogAction(action);
    setDialogOpen(true);
  };

  // Close the confirmation dialog
  const closeDialog = () => {
  // Added display name
  closeDialog.displayName = 'closeDialog';

  // Added display name
  closeDialog.displayName = 'closeDialog';

  // Added display name
  closeDialog.displayName = 'closeDialog';


    setDialogOpen(false);
    setSelectedInvitation(null);
  };

  // Resend an invitation
  const handleResendInvitation = async () => {
    if (!selectedInvitation) return;
    
    setLoading(true);
    setError('');
    closeDialog();

    try {
      await invitationService.resendInvitation(selectedInvitation.id);
      fetchInvitations();
    } catch (err) {
      setError(`Failed to resend invitation to ${selectedInvitation.email}.`);
      console.error('Error resending invitation:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cancel an invitation
  const handleCancelInvitation = async () => {
    if (!selectedInvitation) return;
    
    setLoading(true);
    setError('');
    closeDialog();

    try {
      await invitationService.cancelInvitation(selectedInvitation.id);
      fetchInvitations();
    } catch (err) {
      setError(`Failed to cancel invitation to ${selectedInvitation.email}.`);
      console.error('Error cancelling invitation:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get the status chip color
  const getStatusColor = (status) => {
  // Added display name
  getStatusColor.displayName = 'getStatusColor';

  // Added display name
  getStatusColor.displayName = 'getStatusColor';

  // Added display name
  getStatusColor.displayName = 'getStatusColor';


    switch (status) {
      case 'PENDING':
        return 'primary';
      case 'ACCEPTED':
        return 'success';
      case 'EXPIRED':
        return 'error';
      case 'CANCELLED':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get the dialog content based on the action
  const getDialogContent = () => {
  // Added display name
  getDialogContent.displayName = 'getDialogContent';

  // Added display name
  getDialogContent.displayName = 'getDialogContent';

  // Added display name
  getDialogContent.displayName = 'getDialogContent';


    if (!selectedInvitation) return null;

    switch (dialogAction) {
      case 'resend':
        return {
          title: 'Resend Invitation',
          content: `Are you sure you want to resend the invitation to ${selectedInvitation.email}?`,
          confirmLabel: 'Resend',
          confirmAction: handleResendInvitation,
          color: 'primary',
        };
      case 'cancel':
        return {
          title: 'Cancel Invitation',
          content: `Are you sure you want to cancel the invitation to ${selectedInvitation.email}?`,
          confirmLabel: 'Cancel Invitation',
          confirmAction: handleCancelInvitation,
          color: 'error',
        };
      default:
        return null;
    }
  };

  const dialogConfig = getDialogContent();

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            User Invitations
          </Typography>
          
          <Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchInvitations}
              sx={{ mr: 1 }}
              disabled={loading}
            >
              Refresh
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              href="/admin/invitations/new"
            >
              New Invitation
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', mb: 3 }}>
          <TextField
            label="Search by email"
            variant="outlined"
            size="small"
            sx={{ mr: 2, flexGrow: 1 }}
            onKeyPress={handleSearch}
          />
          
          <FormControl variant="outlined" size="small" sx={{ width: 200 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="ACCEPTED">Accepted</MenuItem>
              <MenuItem value="EXPIRED">Expired</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Expires</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invitations.length === 0 ? (
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
                            color={getStatusColor(invitation.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{invitation.role}</TableCell>
                        <TableCell>
                          {formatDistance(new Date(invitation.created_at), new Date(), { 
                            addSuffix: true 
                          })}
                        </TableCell>
                        <TableCell>
                          {invitation.status === 'PENDING' 
                            ? formatDistance(new Date(invitation.expiration_date), new Date(), {
                                addSuffix: true,
                              })
                            : 'N/A'}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                // Navigate to detail page
                                window.location.href = `/admin/invitations/${invitation.id}`;
                              }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {invitation.status === 'PENDING' && (
                            <>
                              <Tooltip title="Resend">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => openDialog(invitation, 'resend')}
                                >
                                  <SendIcon />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Cancel">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => openDialog(invitation, 'cancel')}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          
                          {(invitation.status === 'EXPIRED' || invitation.status === 'CANCELLED') && (
                            <Tooltip title="Resend">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => openDialog(invitation, 'resend')}
                              >
                                <SendIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Paper>

      {/* Confirmation Dialog */}
      {dialogConfig && (
        <Dialog open={dialogOpen} onClose={closeDialog}>
          <DialogTitle>{dialogConfig.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>{dialogConfig.content}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button
              onClick={dialogConfig.confirmAction}
              color={dialogConfig.color}
              variant="contained"
            >
              {dialogConfig.confirmLabel}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default InvitationList;