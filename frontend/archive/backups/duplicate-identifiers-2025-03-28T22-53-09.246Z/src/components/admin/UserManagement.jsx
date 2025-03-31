import React, { useState, useEffect } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Button, Chip, TextField, InputAdornment, Grid, Typography, Select, MenuItem, FormControl, InputLabel, Menu, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Tooltip } from '../../design-system';
import IconButton from '@mui/material/IconButton';;
import { 
  Search as SearchIcon, 
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  MoreVert as MoreVertIcon,
  Security as SecurityIcon,
  LockReset as LockResetIcon,
  Mail as MailIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { userService, mfaService } from '@services/userManagementService';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
/**
 * Component for displaying and managing users
 * Includes filtering, sorting, and bulk operations
 */
const UserManagement = () => {
  // Added display name
  UserManagement.displayName = 'UserManagement';

  // Added display name
  UserManagement.displayName = 'UserManagement';

  // Added display name
  UserManagement.displayName = 'UserManagement';


  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Action menu state
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  // Dialog states
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState(null);
  const [confirmDialogTitle, setConfirmDialogTitle] = useState('');
  const [confirmDialogMessage, setConfirmDialogMessage] = useState('');
  
  const navigate = useNavigate();
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, statusFilter, roleFilter]);
  
  // Fetch users from API
  const fetchUsers = async () => {
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
      
      // Add role filter if not 'all'
      if (roleFilter !== 'all') {
        filters.role = roleFilter;
      }
      
      // Add search term if present
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      const response = await userService.getUsers(filters);
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
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
    fetchUsers();
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
  
  // Handle role filter change
  const handleRoleFilterChange = (e) => {
  // Added display name
  handleRoleFilterChange.displayName = 'handleRoleFilterChange';

  // Added display name
  handleRoleFilterChange.displayName = 'handleRoleFilterChange';

  // Added display name
  handleRoleFilterChange.displayName = 'handleRoleFilterChange';


    setRoleFilter(e.target.value);
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
  
  // Handle action menu open
  const handleActionMenuOpen = (event, userId) => {
  // Added display name
  handleActionMenuOpen.displayName = 'handleActionMenuOpen';

  // Added display name
  handleActionMenuOpen.displayName = 'handleActionMenuOpen';

  // Added display name
  handleActionMenuOpen.displayName = 'handleActionMenuOpen';


    setActionMenuAnchor(event.currentTarget);
    setSelectedUserId(userId);
  };
  
  // Handle action menu close
  const handleActionMenuClose = () => {
  // Added display name
  handleActionMenuClose.displayName = 'handleActionMenuClose';

  // Added display name
  handleActionMenuClose.displayName = 'handleActionMenuClose';

  // Added display name
  handleActionMenuClose.displayName = 'handleActionMenuClose';


    setActionMenuAnchor(null);
    setSelectedUserId(null);
  };
  
  // Handle edit user
  const handleEditUser = () => {
  // Added display name
  handleEditUser.displayName = 'handleEditUser';

  // Added display name
  handleEditUser.displayName = 'handleEditUser';

  // Added display name
  handleEditUser.displayName = 'handleEditUser';


    handleActionMenuClose();
    navigate(`/admin/users/${selectedUserId}`);
  };
  
  // Handle user status change confirmation dialog
  const handleStatusChangeConfirm = (userId, status) => {
  // Added display name
  handleStatusChangeConfirm.displayName = 'handleStatusChangeConfirm';

  // Added display name
  handleStatusChangeConfirm.displayName = 'handleStatusChangeConfirm';

  // Added display name
  handleStatusChangeConfirm.displayName = 'handleStatusChangeConfirm';


    const isDisabling = status === 'DISABLED';
    
    setConfirmDialogTitle(isDisabling ? 'Disable User' : 'Enable User');
    setConfirmDialogMessage(
      isDisabling 
        ? 'Are you sure you want to disable this user? They will no longer be able to log in.'
        : 'Are you sure you want to enable this user? They will be able to log in again.'
    );
    setConfirmDialogAction(() => () => handleUpdateUserStatus(userId, status));
    setConfirmDialogOpen(true);
    handleActionMenuClose();
  };
  
  // Handle delete user confirmation dialog
  const handleDeleteConfirm = (userId) => {
  // Added display name
  handleDeleteConfirm.displayName = 'handleDeleteConfirm';

  // Added display name
  handleDeleteConfirm.displayName = 'handleDeleteConfirm';

  // Added display name
  handleDeleteConfirm.displayName = 'handleDeleteConfirm';


    setConfirmDialogTitle('Delete User');
    setConfirmDialogMessage(
      'Are you sure you want to delete this user? This action cannot be undone.'
    );
    setConfirmDialogAction(() => () => handleDeleteUser(userId));
    setConfirmDialogOpen(true);
    handleActionMenuClose();
  };
  
  // Handle reset MFA confirmation dialog
  const handleResetMFAConfirm = (userId) => {
  // Added display name
  handleResetMFAConfirm.displayName = 'handleResetMFAConfirm';

  // Added display name
  handleResetMFAConfirm.displayName = 'handleResetMFAConfirm';

  // Added display name
  handleResetMFAConfirm.displayName = 'handleResetMFAConfirm';


    setConfirmDialogTitle('Reset MFA');
    setConfirmDialogMessage(
      'Are you sure you want to reset MFA for this user? This will disable MFA and require them to set it up again.'
    );
    setConfirmDialogAction(() => () => handleResetMFA(userId));
    setConfirmDialogOpen(true);
    handleActionMenuClose();
  };
  
  // Handle dialog confirmation
  const handleConfirmDialogConfirm = async () => {
    if (confirmDialogAction) {
      await confirmDialogAction();
    }
    setConfirmDialogOpen(false);
  };
  
  // Handle dialog cancellation
  const handleConfirmDialogCancel = () => {
  // Added display name
  handleConfirmDialogCancel.displayName = 'handleConfirmDialogCancel';

  // Added display name
  handleConfirmDialogCancel.displayName = 'handleConfirmDialogCancel';

  // Added display name
  handleConfirmDialogCancel.displayName = 'handleConfirmDialogCancel';


    setConfirmDialogOpen(false);
  };
  
  // Update user status
  const handleUpdateUserStatus = async (userId, status) => {
    try {
      await userService.updateUserStatus(userId, status);
      // Refresh user list
      fetchUsers();
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Failed to update user status.');
    }
  };
  
  // Delete user
  const handleDeleteUser = async (userId) => {
    try {
      await userService.deleteUser(userId);
      // Refresh user list
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user.');
    }
  };
  
  // Reset user MFA
  const handleResetMFA = async (userId) => {
    try {
      await mfaService.resetUserMFA(userId);
      // Refresh user list
      fetchUsers();
    } catch (err) {
      console.error('Error resetting MFA:', err);
      setError('Failed to reset MFA.');
    }
  };
  
  // Get status chip color based on user status
  const getStatusChipColor = (status) => {
  // Added display name
  getStatusChipColor.displayName = 'getStatusChipColor';

  // Added display name
  getStatusChipColor.displayName = 'getStatusChipColor';

  // Added display name
  getStatusChipColor.displayName = 'getStatusChipColor';


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
  
  // Format date string
  const formatDate = (dateString) => {
  // Added display name
  formatDate.displayName = 'formatDate';

  // Added display name
  formatDate.displayName = 'formatDate';

  // Added display name
  formatDate.displayName = 'formatDate';


    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1">
          User Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<MailIcon />}
          onClick={() => navigate('/admin/invitations/new')}
        >
          Invite User
        </Button>
      </Box>
      
      {/* Filters and search */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Box component="form" onSubmit={handleSearch}>
            <TextField
              fullWidth
              placeholder="Search by name or email..."
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
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="DISABLED">Disabled</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel id="role-filter-label">Role</InputLabel>
            <Select
              labelId="role-filter-label"
              value={roleFilter}
              onChange={handleRoleFilterChange}
              label="Role"
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="USER">User</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
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
      
      {/* Users table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>MFA</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={getStatusChipColor(user.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {user.mfa_enabled ? 
                      <Chip label="Enabled" color="success" size="small" /> : 
                      <Chip label="Disabled" size="small" />
                    }
                  </TableCell>
                  <TableCell>{formatDate(user.last_login)}</TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="more"
                      onClick={(e) => handleActionMenuOpen(e, user.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
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
        count={users.length} // This should be the total count from API in a real implementation
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      
      {/* Action menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={handleEditUser}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        
        {users.find(u => u.id === selectedUserId)?.status === 'ACTIVE' ? (
          <MenuItem onClick={() => handleStatusChangeConfirm(selectedUserId, 'DISABLED')}>
            <ListItemIcon>
              <BlockIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Disable User</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleStatusChangeConfirm(selectedUserId, 'ACTIVE')}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Enable User</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={() => handleResetMFAConfirm(selectedUserId)}>
          <ListItemIcon>
            <SecurityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reset MFA</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleDeleteConfirm(selectedUserId)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Confirmation dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleConfirmDialogCancel}
      >
        <DialogTitle>{confirmDialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDialogConfirm} color="error" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;