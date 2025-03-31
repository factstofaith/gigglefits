import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, TextField, Grid, Chip, Divider, LinearProgress, Alert, Avatar, Stack, FormControl, InputLabel, Select, MenuItem, Tabs, Tab, List, ListItem, ListItemText, ListItemSecondaryAction, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@design-system';
;
import { 
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  LockReset as LockResetIcon,
  Email as EmailIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { userService, mfaService } from '@services/userManagementService';
import { IconButton } from '../../design-system';
// Design system import already exists;
// Design system import already exists;
// Design system import already exists;
/**
 * Component for viewing and editing user details
 * Used by administrators to manage user information
 */
const UserDetail = () => {
  // Added display name
  UserDetail.displayName = 'UserDetail';

  // Added display name
  UserDetail.displayName = 'UserDetail';

  // Added display name
  UserDetail.displayName = 'UserDetail';

  // Added display name
  UserDetail.displayName = 'UserDetail';

  // Added display name
  UserDetail.displayName = 'UserDetail';


  // URL parameter
  const { id } = useParams();
  const navigate = useNavigate();
  
  // User data state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [loginHistory, setLoginHistory] = useState([]);
  
  // Edit state
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
    clientCompany: '',
    zohoAccount: '',
    position: '',
    department: '',
    phoneNumber: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState(null);
  const [confirmDialogTitle, setConfirmDialogTitle] = useState('');
  const [confirmDialogMessage, setConfirmDialogMessage] = useState('');
  
  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, [id]);
  
  // Fetch user data from API
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await userService.getUser(id);
      setUser(response.data);
      
      // Initialize form data with user data
      setFormData({
        fullName: response.data.full_name || '',
        email: response.data.email || '',
        role: response.data.role || 'USER',
        clientCompany: response.data.client_company || '',
        zohoAccount: response.data.zoho_account || '',
        position: response.data.position || '',
        department: response.data.department || '',
        phoneNumber: response.data.phone_number || ''
      });
      
      // Fetch login history
      fetchLoginHistory();
      
      setError(null);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch user's login history
  const fetchLoginHistory = async () => {
    try {
      const response = await userService.getLoginHistory(id);
      setLoginHistory(response.data.history || []);
    } catch (err) {
      console.error('Error fetching login history:', err);
      // Don't set an error state here as it's not critical
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';


    setTabValue(newValue);
  };
  
  // Handle edit mode toggle
  const handleEditToggle = () => {
  // Added display name
  handleEditToggle.displayName = 'handleEditToggle';

  // Added display name
  handleEditToggle.displayName = 'handleEditToggle';

  // Added display name
  handleEditToggle.displayName = 'handleEditToggle';

  // Added display name
  handleEditToggle.displayName = 'handleEditToggle';

  // Added display name
  handleEditToggle.displayName = 'handleEditToggle';


    setEditMode(!editMode);
    // Reset form data to original user data when cancelling edit
    if (editMode) {
      setFormData({
        fullName: user.full_name || '',
        email: user.email || '',
        role: user.role || 'USER',
        clientCompany: user.client_company || '',
        zohoAccount: user.zoho_account || '',
        position: user.position || '',
        department: user.department || '',
        phoneNumber: user.phone_number || ''
      });
      setFormErrors({});
    }
  };
  
  // Handle form field changes
  const handleFormChange = (e) => {
  // Added display name
  handleFormChange.displayName = 'handleFormChange';

  // Added display name
  handleFormChange.displayName = 'handleFormChange';

  // Added display name
  handleFormChange.displayName = 'handleFormChange';

  // Added display name
  handleFormChange.displayName = 'handleFormChange';

  // Added display name
  handleFormChange.displayName = 'handleFormChange';


    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when changed
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Validate form data
  const validateForm = () => {
  // Added display name
  validateForm.displayName = 'validateForm';

  // Added display name
  validateForm.displayName = 'validateForm';

  // Added display name
  validateForm.displayName = 'validateForm';

  // Added display name
  validateForm.displayName = 'validateForm';

  // Added display name
  validateForm.displayName = 'validateForm';


    const errors = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.role) {
      errors.role = 'Role is required';
    }
    
    if (!formData.clientCompany.trim()) {
      errors.clientCompany = 'Client company is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      // Prepare user data for API
      const userData = {
        full_name: formData.fullName,
        email: formData.email,
        role: formData.role,
        client_company: formData.clientCompany,
        zoho_account: formData.zohoAccount || null,
        position: formData.position || null,
        department: formData.department || null,
        phone_number: formData.phoneNumber || null
      };
      
      // Update user data
      const response = await userService.updateUser(id, userData);
      setUser(response.data);
      setEditMode(false);
      setError(null);
    } catch (err) {
      console.error('Error updating user data:', err);
      setError('Failed to update user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle user status change confirmation dialog
  const handleStatusChangeConfirm = () => {
  // Added display name
  handleStatusChangeConfirm.displayName = 'handleStatusChangeConfirm';

  // Added display name
  handleStatusChangeConfirm.displayName = 'handleStatusChangeConfirm';

  // Added display name
  handleStatusChangeConfirm.displayName = 'handleStatusChangeConfirm';

  // Added display name
  handleStatusChangeConfirm.displayName = 'handleStatusChangeConfirm';

  // Added display name
  handleStatusChangeConfirm.displayName = 'handleStatusChangeConfirm';


    const newStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    const isDisabling = newStatus === 'DISABLED';
    
    setConfirmDialogTitle(isDisabling ? 'Disable User' : 'Enable User');
    setConfirmDialogMessage(
      isDisabling 
        ? 'Are you sure you want to disable this user? They will no longer be able to log in.'
        : 'Are you sure you want to enable this user? They will be able to log in again.'
    );
    setConfirmDialogAction(() => () => handleUpdateUserStatus(newStatus));
    setConfirmDialogOpen(true);
  };
  
  // Handle delete user confirmation dialog
  const handleDeleteConfirm = () => {
  // Added display name
  handleDeleteConfirm.displayName = 'handleDeleteConfirm';

  // Added display name
  handleDeleteConfirm.displayName = 'handleDeleteConfirm';

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
    setConfirmDialogAction(() => handleDeleteUser);
    setConfirmDialogOpen(true);
  };
  
  // Handle reset MFA confirmation dialog
  const handleResetMFAConfirm = () => {
  // Added display name
  handleResetMFAConfirm.displayName = 'handleResetMFAConfirm';

  // Added display name
  handleResetMFAConfirm.displayName = 'handleResetMFAConfirm';

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
    setConfirmDialogAction(() => handleResetMFA);
    setConfirmDialogOpen(true);
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

  // Added display name
  handleConfirmDialogCancel.displayName = 'handleConfirmDialogCancel';

  // Added display name
  handleConfirmDialogCancel.displayName = 'handleConfirmDialogCancel';


    setConfirmDialogOpen(false);
  };
  
  // Update user status
  const handleUpdateUserStatus = async (status) => {
    setLoading(true);
    try {
      await userService.updateUserStatus(id, status);
      // Refresh user data
      fetchUserData();
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Failed to update user status.');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete user
  const handleDeleteUser = async () => {
    setLoading(true);
    try {
      await userService.deleteUser(id);
      // Navigate back to user list
      navigate('/admin/users');
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user.');
      setLoading(false);
    }
  };
  
  // Reset user MFA
  const handleResetMFA = async () => {
    setLoading(true);
    try {
      await mfaService.resetUserMFA(id);
      // Refresh user data
      fetchUserData();
    } catch (err) {
      console.error('Error resetting MFA:', err);
      setError('Failed to reset MFA.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle send new invitation
  const handleSendInvitation = () => {
  // Added display name
  handleSendInvitation.displayName = 'handleSendInvitation';

  // Added display name
  handleSendInvitation.displayName = 'handleSendInvitation';

  // Added display name
  handleSendInvitation.displayName = 'handleSendInvitation';

  // Added display name
  handleSendInvitation.displayName = 'handleSendInvitation';

  // Added display name
  handleSendInvitation.displayName = 'handleSendInvitation';


    navigate('/admin/invitations/new', { state: { email: user?.email } });
  };
  
  // Format date string
  const formatDate = (dateString) => {
  // Added display name
  formatDate.displayName = 'formatDate';

  // Added display name
  formatDate.displayName = 'formatDate';

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
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };
  
  // Render loading state
  if (loading && !user) {
    return (
      <Box>
        <Typography variant="h5&quot; component="h1" gutterBottom>
          User Details
        </Typography>
        <LinearProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error && !user) {
    return (
      <Box>
        <Typography variant="h5&quot; component="h1" gutterBottom>
          User Details
        </Typography>
        <Alert severity="error&quot; sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/admin/users')}
        >
          Back to User List
        </Button>
      </Box>
    );
  }
  
  // Get status color based on user status
  const getStatusColor = (status) => {
  // Added display name
  getStatusColor.displayName = 'getStatusColor';

  // Added display name
  getStatusColor.displayName = 'getStatusColor';

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
  
  return (
    <Box>
      {/* Header with user info and actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 60, 
              height: 60, 
              mr: 2,
              bgcolor: user?.status === 'ACTIVE' ? 'primary.main' : 'grey.500'
            }}
          >
            {user?.full_name?.charAt(0) || ''}
          </Avatar>
          <Box>
            <Typography variant="h5&quot; component="h1">
              {user?.full_name || 'User'}
            </Typography>
            <Chip 
              label={user?.status || 'UNKNOWN'} 
              color={getStatusColor(user?.status)}
              size="small&quot;
              sx={{ mr: 1 }}
            />
            <Chip 
              label={user?.role || "USER'} 
              variant="outlined&quot;
              size="small"
            />
          </Box>
        </Box>
        
        <Stack direction="row&quot; spacing={1}>
          {editMode ? (
            <>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleEditToggle}
              >
                Cancel
              </Button>
              <Button
                variant="contained&quot;
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={loading}
              >
                Save
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined&quot;
                startIcon={<EditIcon />}
                onClick={handleEditToggle}
              >
                Edit
              </Button>
              
              {user?.status === "ACTIVE' ? (
                <Button
                  variant="outlined&quot;
                  color="error"
                  startIcon={<BlockIcon />}
                  onClick={handleStatusChangeConfirm}
                >
                  Disable
                </Button>
              ) : (
                <Button
                  variant="outlined&quot;
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleStatusChangeConfirm}
                >
                  Enable
                </Button>
              )}
              
              <Button
                variant="outlined&quot;
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </>
          )}
        </Stack>
      </Box>
      
      {/* Error message */}
      {error && (
        <Alert severity="error&quot; sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Loading indicator */}
      {loading && <LinearProgress sx={{ mb: 3 }} />}
      
      {/* User details tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary&quot;
        >
          <Tab label="User Details" />
          <Tab label="Security&quot; />
          <Tab label="Login History" />
        </Tabs>
        <Divider />
        
        {/* User details tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6&quot; gutterBottom>
                  Basic Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName&quot;
                  value={formData.fullName}
                  onChange={handleFormChange}
                  disabled={!editMode}
                  error={!!formErrors.fullName}
                  helperText={formErrors.fullName}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email&quot;
                  value={formData.email}
                  onChange={handleFormChange}
                  disabled={!editMode}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!editMode} error={!!formErrors.role}>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label&quot;
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    label="Role&quot;
                  >
                    <MenuItem value="USER">User</MenuItem>
                    <MenuItem value="ADMIN&quot;>Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Status"
                  value={user?.status || ''}
                  disabled
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              {/* Business Information */}
              <Grid item xs={12}>
                <Typography variant="h6&quot; gutterBottom>
                  Business Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Client Company"
                  name="clientCompany&quot;
                  value={formData.clientCompany}
                  onChange={handleFormChange}
                  disabled={!editMode}
                  error={!!formErrors.clientCompany}
                  helperText={formErrors.clientCompany}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Zoho Account"
                  name="zohoAccount&quot;
                  value={formData.zohoAccount}
                  onChange={handleFormChange}
                  disabled={!editMode}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Position"
                  name="position&quot;
                  value={formData.position}
                  onChange={handleFormChange}
                  disabled={!editMode}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department&quot;
                  value={formData.department}
                  onChange={handleFormChange}
                  disabled={!editMode}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              {/* Contact Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number&quot;
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleFormChange}
                  disabled={!editMode}
                />
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Security tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6&quot; gutterBottom>
                  Multi-Factor Authentication
                </Typography>
                
                <Box sx={{ display: "flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1&quot; sx={{ mr: 2 }}>
                    Status:
                  </Typography>
                  {user?.mfa_enabled ? (
                    <Chip 
                      label="Enabled" 
                      color="success&quot; 
                      icon={<SecurityIcon />}
                    />
                  ) : (
                    <Chip 
                      label="Disabled" 
                      variant="outlined&quot;
                    />
                  )}
                </Box>
                
                {user?.mfa_enabled && (
                  <Button
                    variant="outlined"
                    startIcon={<LockResetIcon />}
                    onClick={handleResetMFAConfirm}
                    sx={{ mt: 1 }}
                  >
                    Reset MFA
                  </Button>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6&quot; gutterBottom>
                  Account Actions
                </Typography>
                
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button
                    variant="outlined&quot;
                    startIcon={<EmailIcon />}
                    onClick={handleSendInvitation}
                  >
                    Send New Invitation
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Login History tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Login History
            </Typography>
            
            {loginHistory.length === 0 ? (
              <Typography variant="body1&quot; color="text.secondary">
                No login history available
              </Typography>
            ) : (
              <List>
                {loginHistory.map((entry, index) => (
                  <ListItem key={index} divider={index < loginHistory.length - 1}>
                    <ListItemText
                      primary={entry.status === 'SUCCESS' ? 'Successful login' : 'Failed login attempt'}
                      secondary={formatDate(entry.timestamp)}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={entry.ip_address || 'Unknown IP'}
                        variant="outlined&quot;
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </Paper>
      
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
          <Button onClick={handleConfirmDialogCancel} color="primary&quot;>
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

export default UserDetail;