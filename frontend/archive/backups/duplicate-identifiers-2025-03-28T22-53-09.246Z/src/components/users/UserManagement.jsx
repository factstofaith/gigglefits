import React, { useState, useEffect } from 'react';
import { userService, mfaService } from '@services/userManagementService';
import { useUser } from '@contexts/UserContext';
import { Box, Button, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Typography, TextField, Chip, Tooltip, FormControl, InputLabel, Select, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Alert, CircularProgress } from '../../design-system';
import IconButton from '@mui/material/IconButton';;
import {
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { formatDistance } from 'date-fns';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
/**
 * UserManagement Component
 * 
 * Admin interface for managing users with filtering, pagination, and actions
 */
const UserManagement = () => {
  // Added display name
  UserManagement.displayName = 'UserManagement';

  // Added display name
  UserManagement.displayName = 'UserManagement';

  // Added display name
  UserManagement.displayName = 'UserManagement';


  const { isAdmin } = useUser();

  // State for users and pagination
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for filtering
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for loading and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State for action dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogAction, setDialogAction] = useState('');

  // Check if user is an admin
  useEffect(() => {
    if (!isAdmin) {
      setError('You do not have permission to access this page.');
      return;
    }
    
    fetchUsers();
  }, [isAdmin, page, rowsPerPage, statusFilter, roleFilter]);

  // Fetch users from the API
  const fetchUsers = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    setError('');

    try {
      const filters = {
        skip: page * rowsPerPage,
        limit: rowsPerPage,
        status: statusFilter || undefined,
        role: roleFilter || undefined,
        search: searchQuery || undefined,
      };

      const response = await userService.getUsers(filters);
      setUsers(response.data.users);
      setTotalCount(response.data.total);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Error fetching users:', err);
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

  // Handle role filter change
  const handleRoleFilterChange = (event) => {
  // Added display name
  handleRoleFilterChange.displayName = 'handleRoleFilterChange';

  // Added display name
  handleRoleFilterChange.displayName = 'handleRoleFilterChange';

  // Added display name
  handleRoleFilterChange.displayName = 'handleRoleFilterChange';


    setRoleFilter(event.target.value);
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
      fetchUsers();
    }
  };

  // Open the action dialog
  const openDialog = (user, action) => {
  // Added display name
  openDialog.displayName = 'openDialog';

  // Added display name
  openDialog.displayName = 'openDialog';

  // Added display name
  openDialog.displayName = 'openDialog';


    setSelectedUser(user);
    setDialogAction(action);
    setDialogOpen(true);
  };

  // Close the action dialog
  const closeDialog = () => {
  // Added display name
  closeDialog.displayName = 'closeDialog';

  // Added display name
  closeDialog.displayName = 'closeDialog';

  // Added display name
  closeDialog.displayName = 'closeDialog';


    setDialogOpen(false);
    setSelectedUser(null);
  };

  // Enable a user
  const handleEnableUser = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    setError('');
    closeDialog();

    try {
      await userService.updateUserStatus(selectedUser.id, 'ACTIVE');
      fetchUsers();
    } catch (err) {
      setError(`Failed to enable user ${selectedUser.name}.`);
      console.error('Error enabling user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Disable a user
  const handleDisableUser = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    setError('');
    closeDialog();

    try {
      await userService.updateUserStatus(selectedUser.id, 'DISABLED');
      fetchUsers();
    } catch (err) {
      setError(`Failed to disable user ${selectedUser.name}.`);
      console.error('Error disabling user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    setError('');
    closeDialog();

    try {
      await userService.deleteUser(selectedUser.id);
      fetchUsers();
    } catch (err) {
      setError(`Failed to delete user ${selectedUser.name}.`);
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset MFA for a user
  const handleResetMFA = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    setError('');
    closeDialog();

    try {
      await mfaService.resetUserMFA(selectedUser.id);
      fetchUsers();
    } catch (err) {
      setError(`Failed to reset MFA for user ${selectedUser.name}.`);
      console.error('Error resetting MFA:', err);
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
      case 'ACTIVE':
        return 'success';
      case 'DISABLED':
        return 'error';
      case 'PENDING':
        return 'warning';
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


    if (!selectedUser) return null;

    switch (dialogAction) {
      case 'enable':
        return {
          title: 'Enable User',
          content: `Are you sure you want to enable ${selectedUser.name}?`,
          confirmLabel: 'Enable',
          confirmAction: handleEnableUser,
          color: 'success',
        };
      case 'disable':
        return {
          title: 'Disable User',
          content: `Are you sure you want to disable ${selectedUser.name}? This will prevent them from logging in.`,
          confirmLabel: 'Disable',
          confirmAction: handleDisableUser,
          color: 'warning',
        };
      case 'delete':
        return {
          title: 'Delete User',
          content: `Are you sure you want to delete ${selectedUser.name}? This action cannot be undone.`,
          confirmLabel: 'Delete',
          confirmAction: handleDeleteUser,
          color: 'error',
        };
      case 'resetMFA':
        return {
          title: 'Reset MFA',
          content: `Are you sure you want to reset MFA for ${selectedUser.name}? This will disable MFA for this user and they will need to set it up again.`,
          confirmLabel: 'Reset MFA',
          confirmAction: handleResetMFA,
          color: 'primary',
        };
      default:
        return null;
    }
  };

  const dialogConfig = getDialogContent();

  if (!isAdmin) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          You do not have permission to access this page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            User Management
          </Typography>
          
          <Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchUsers}
              sx={{ mr: 1 }}
              disabled={loading}
            >
              Refresh
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              href="/admin/invitations/new"
            >
              Invite User
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', mb: 3 }}>
          <TextField
            label="Search by name, email, or company"
            variant="outlined"
            size="small"
            sx={{ mr: 2, flexGrow: 1 }}
            onKeyPress={handleSearch}
          />
          
          <FormControl variant="outlined" size="small" sx={{ width: 150, mr: 2 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="DISABLED">Disabled</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" size="small" sx={{ width: 150 }}>
            <InputLabel id="role-filter-label">Role</InputLabel>
            <Select
              labelId="role-filter-label"
              id="role-filter"
              value={roleFilter}
              onChange={handleRoleFilterChange}
              label="Role"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="USER">User</MenuItem>
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
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.account_status}
                            color={getStatusColor(user.account_status)}
                            size="small"
                          />
                          {user.mfa_enabled && (
                            <Tooltip title="MFA Enabled">
                              <Chip
                                icon={<SecurityIcon />}
                                label="MFA"
                                color="info"
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell>{user.client_company || '-'}</TableCell>
                        <TableCell>
                          {user.last_login
                            ? formatDistance(new Date(user.last_login), new Date(), {
                                addSuffix: true,
                              })
                            : 'Never'}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                // Navigate to user detail page
                                window.location.href = `/admin/users/${user.id}`;
                              }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Edit User">
                            <IconButton
                              size="small"
                              onClick={() => {
                                // Navigate to edit user page
                                window.location.href = `/admin/users/${user.id}/edit`;
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {user.account_status === 'ACTIVE' ? (
                            <Tooltip title="Disable User">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => openDialog(user, 'disable')}
                              >
                                <LockIcon />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Enable User">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => openDialog(user, 'enable')}
                              >
                                <LockOpenIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          <Tooltip title="Reset MFA">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => openDialog(user, 'resetMFA')}
                              disabled={!user.mfa_enabled}
                            >
                              <SecurityIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Delete User">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => openDialog(user, 'delete')}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
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

      {/* Action Dialog */}
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

export default UserManagement;