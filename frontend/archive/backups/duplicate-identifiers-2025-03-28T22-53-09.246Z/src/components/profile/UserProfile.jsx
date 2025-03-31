import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, TextField, Grid, Avatar, Divider, LinearProgress, Alert, Tabs, Tab, Snackbar, FormHelperText, Badge, Card, CardContent } from '../../design-system';
import IconButton from '@mui/material/IconButton';;
import { 
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  CloseOutlined as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@contexts/UserContext';
import LinearProgress from '@mui/material/LinearProgress';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
/**
 * Component for viewing and editing user profile information
 */
const UserProfile = () => {
  // Added display name
  UserProfile.displayName = 'UserProfile';

  // Added display name
  UserProfile.displayName = 'UserProfile';

  // Added display name
  UserProfile.displayName = 'UserProfile';


  const { 
    user, 
    updateUserProfile,
    authError,
    clearAuthError,
    isLoading
  } = useUser();
  
  // Edit state
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    clientCompany: '',
    zohoAccount: '',
    position: '',
    department: '',
    phoneNumber: '',
    address: ''
  });
  
  // Validation errors
  const [formErrors, setFormErrors] = useState({});
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Local states
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [success, setSuccess] = useState(null);
  const [completeness, setCompleteness] = useState(0);
  
  const navigate = useNavigate();
  
  // Initialize form data from user object
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || '',
        clientCompany: user.client_company || '',
        zohoAccount: user.zoho_account || '',
        position: user.position || '',
        department: user.department || '',
        phoneNumber: user.phone_number || '',
        address: user.address || ''
      });
      
      // Calculate profile completeness
      calculateProfileCompleteness();
    }
  }, [user]);
  
  // Calculate profile completeness percentage
  const calculateProfileCompleteness = () => {
  // Added display name
  calculateProfileCompleteness.displayName = 'calculateProfileCompleteness';

  // Added display name
  calculateProfileCompleteness.displayName = 'calculateProfileCompleteness';

  // Added display name
  calculateProfileCompleteness.displayName = 'calculateProfileCompleteness';


    if (!user) return;
    
    const fields = [
      user.full_name,
      user.client_company,
      user.zoho_account,
      user.position,
      user.department,
      user.phone_number,
      user.address,
      user.profile_image
    ];
    
    const filledFields = fields.filter(field => field && field.trim().length > 0).length;
    const completenessValue = Math.floor((filledFields / fields.length) * 100);
    setCompleteness(completenessValue);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';


    setTabValue(newValue);
  };
  
  // Handle form field changes
  const handleChange = (e) => {
  // Added display name
  handleChange.displayName = 'handleChange';

  // Added display name
  handleChange.displayName = 'handleChange';

  // Added display name
  handleChange.displayName = 'handleChange';


    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when field is modified
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Handle profile image change
  const handleImageChange = (e) => {
  // Added display name
  handleImageChange.displayName = 'handleImageChange';

  // Added display name
  handleImageChange.displayName = 'handleImageChange';

  // Added display name
  handleImageChange.displayName = 'handleImageChange';


    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size and type
      if (file.size > 5000000) { // 5MB limit
        setFormErrors(prev => ({
          ...prev,
          profileImage: 'Image size should be less than 5MB'
        }));
        return;
      }
      
      if (!file.type.match('image.*')) {
        setFormErrors(prev => ({
          ...prev,
          profileImage: 'Please select an image file'
        }));
        return;
      }
      
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
      
      // Clear error if any
      if (formErrors.profileImage) {
        setFormErrors(prev => ({
          ...prev,
          profileImage: null
        }));
      }
    }
  };
  
  // Handle edit mode toggle
  const handleEditToggle = () => {
  // Added display name
  handleEditToggle.displayName = 'handleEditToggle';

  // Added display name
  handleEditToggle.displayName = 'handleEditToggle';

  // Added display name
  handleEditToggle.displayName = 'handleEditToggle';


    if (editMode) {
      // Cancel edit - reset form data
      if (user) {
        setFormData({
          fullName: user.full_name || '',
          clientCompany: user.client_company || '',
          zohoAccount: user.zoho_account || '',
          position: user.position || '',
          department: user.department || '',
          phoneNumber: user.phone_number || '',
          address: user.address || ''
        });
      }
      
      // Reset image preview if any
      if (previewImage && !user.profile_image) {
        setPreviewImage(null);
        setProfileImage(null);
      }
      
      // Clear errors
      setFormErrors({});
    }
    
    setEditMode(!editMode);
  };
  
  // Validate form data
  const validateForm = () => {
  // Added display name
  validateForm.displayName = 'validateForm';

  // Added display name
  validateForm.displayName = 'validateForm';

  // Added display name
  validateForm.displayName = 'validateForm';


    const errors = {};
    
    // Full name validation
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    // Client company validation
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
    
    try {
      clearAuthError();
      
      // Prepare form data for API
      const profileData = {
        full_name: formData.fullName,
        client_company: formData.clientCompany,
        zoho_account: formData.zohoAccount || null,
        position: formData.position || null,
        department: formData.department || null,
        phone_number: formData.phoneNumber || null,
        address: formData.address || null
      };
      
      // TODO: In real implementation, add handling for profile image upload
      // if (profileImage) {
      //   // Create a FormData object for file upload
      //   const imageFormData = new FormData();
      //   imageFormData.append('profile_image', profileImage);
      //   
      //   // Upload profile image
      //   // await userService.uploadProfileImage(imageFormData);
      // }
      
      // Update user profile
      await updateUserProfile(profileData);
      
      // Exit edit mode and show success message
      setEditMode(false);
      setSuccess('Profile updated successfully');
      
      // Calculate new completeness
      calculateProfileCompleteness();
    } catch (err) {
      console.error('Error updating profile:', err);
      // Error is handled by UserContext and set to authError
    }
  };
  
  // Handle security settings navigation
  const handleGoToSecuritySettings = () => {
  // Added display name
  handleGoToSecuritySettings.displayName = 'handleGoToSecuritySettings';

  // Added display name
  handleGoToSecuritySettings.displayName = 'handleGoToSecuritySettings';

  // Added display name
  handleGoToSecuritySettings.displayName = 'handleGoToSecuritySettings';


    navigate('/profile/security');
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
  // Added display name
  handleSnackbarClose.displayName = 'handleSnackbarClose';

  // Added display name
  handleSnackbarClose.displayName = 'handleSnackbarClose';

  // Added display name
  handleSnackbarClose.displayName = 'handleSnackbarClose';


    setSuccess(null);
  };
  
  // Get completeness color
  const getCompletenessColor = () => {
  // Added display name
  getCompletenessColor.displayName = 'getCompletenessColor';

  // Added display name
  getCompletenessColor.displayName = 'getCompletenessColor';

  // Added display name
  getCompletenessColor.displayName = 'getCompletenessColor';


    if (completeness < 50) return 'error';
    if (completeness < 80) return 'warning';
    return 'success';
  };
  
  // Get avatar letter if no image
  const getAvatarLetter = () => {
  // Added display name
  getAvatarLetter.displayName = 'getAvatarLetter';

  // Added display name
  getAvatarLetter.displayName = 'getAvatarLetter';

  // Added display name
  getAvatarLetter.displayName = 'getAvatarLetter';


    return user?.full_name?.charAt(0) || '?';
  };
  
  return (
    <Box>
      {/* Header with profile overview */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', mb: 3, gap: 2 }}>
        <Box sx={{ position: 'relative' }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              editMode && (
                <IconButton 
                  sx={{ 
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider'
                  }} 
                  component="label"
                  size="small"
                >
                  <PhotoCameraIcon fontSize="small" />
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleImageChange}
                    disabled={!editMode}
                  />
                </IconButton>
              )
            }
          >
            <Avatar
              sx={{ width: 100, height: 100 }}
              src={previewImage || user?.profile_image}
            >
              {getAvatarLetter()}
            </Avatar>
          </Badge>
        </Box>
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            {user?.full_name || 'User Profile'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
          
          {formErrors.profileImage && (
            <FormHelperText error>{formErrors.profileImage}</FormHelperText>
          )}
        </Box>
        
        <Box>
          {editMode ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleEditToggle}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={isLoading}
              >
                Save
              </Button>
            </Box>
          ) : (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEditToggle}
            >
              Edit Profile
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Loading indicator */}
      {isLoading && <LinearProgress sx={{ mb: 3 }} />}
      
      {/* Error message */}
      {authError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {authError}
        </Alert>
      )}
      
      {/* Success snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={success}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleSnackbarClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
      
      {/* Profile completeness card */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {completeness >= 80 ? (
              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            ) : (
              <WarningIcon color={getCompletenessColor()} sx={{ mr: 1 }} />
            )}
            <Typography variant="h6">
              Profile Completeness: {completeness}%
            </Typography>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={completeness} 
            color={getCompletenessColor()}
            sx={{ height: 8, borderRadius: 5, mb: 2 }}
          />
          
          <Typography variant="body2" color="text.secondary">
            {completeness < 100 
              ? 'Complete your profile to improve your account security and experience.' 
              : 'Your profile is complete! Thank you for providing all information.'}
          </Typography>
          
          <Button
            variant="text"
            color="primary"
            onClick={handleGoToSecuritySettings}
            sx={{ mt: 1 }}
          >
            Manage Security Settings
          </Button>
        </CardContent>
      </Card>
      
      {/* Profile tabs */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Personal Details" />
          <Tab label="Business Information" />
          <Tab label="Contact Information" />
        </Tabs>
        
        <Divider />
        
        {/* Personal Details tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={!!formErrors.fullName}
                  helperText={formErrors.fullName}
                  disabled={!editMode}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={user?.email || ''}
                  disabled
                  helperText="Email cannot be changed. Contact administrator for support."
                />
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Business Information tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Client Company"
                  name="clientCompany"
                  value={formData.clientCompany}
                  onChange={handleChange}
                  error={!!formErrors.clientCompany}
                  helperText={formErrors.clientCompany}
                  disabled={!editMode}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Zoho Account"
                  name="zohoAccount"
                  value={formData.zohoAccount}
                  onChange={handleChange}
                  error={!!formErrors.zohoAccount}
                  helperText={formErrors.zohoAccount}
                  disabled={!editMode}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Position/Role"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  error={!!formErrors.position}
                  helperText={formErrors.position}
                  disabled={!editMode}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  error={!!formErrors.department}
                  helperText={formErrors.department}
                  disabled={!editMode}
                />
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Contact Information tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  error={!!formErrors.phoneNumber}
                  helperText={formErrors.phoneNumber}
                  disabled={!editMode}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={!!formErrors.address}
                  helperText={formErrors.address}
                  disabled={!editMode}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default UserProfile;