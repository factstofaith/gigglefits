import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Grid, FormControl, FormLabel, FormControlLabel, Radio, MenuItem, Select, InputLabel, FormHelperText, Alert, Checkbox, LinearProgress } from '../../design-system';
;;
import { useNavigate } from 'react-router-dom';
import { invitationService } from '@services/userManagementService';
import { RadioGroup } from '../../design-system';
// Design system import already exists;
// Design system import already exists;
// Removed duplicate import
// Removed duplicate import
/**
 * Component for creating new user invitations
 */
const InvitationForm = () => {
  // Added display name
  InvitationForm.displayName = 'InvitationForm';

  // Added display name
  InvitationForm.displayName = 'InvitationForm';

  // Added display name
  InvitationForm.displayName = 'InvitationForm';

  // Added display name
  InvitationForm.displayName = 'InvitationForm';

  // Added display name
  InvitationForm.displayName = 'InvitationForm';


  // Form state
  const [formData, setFormData] = useState({
    email: '',
    role: 'USER',
    expiration: '48',
    message: '',
    sendReminder: true
  });
  
  // Error state
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  
  // Handle form input changes
  const handleChange = (e) => {
  // Added display name
  handleChange.displayName = 'handleChange';

  // Added display name
  handleChange.displayName = 'handleChange';

  // Added display name
  handleChange.displayName = 'handleChange';

  // Added display name
  handleChange.displayName = 'handleChange';

  // Added display name
  handleChange.displayName = 'handleChange';


    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear field-specific error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
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


    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Role validation
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    // Expiration validation
    if (!formData.expiration) {
      newErrors.expiration = 'Expiration is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors/success
    setFormError(null);
    setFormSuccess(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data for API
      const invitationData = {
        email: formData.email,
        role: formData.role,
        expiration_hours: parseInt(formData.expiration, 10),
        custom_message: formData.message || null,
        send_reminder: formData.sendReminder
      };
      
      // Send invitation
      const response = await invitationService.createInvitation(invitationData);
      
      // Show success message
      setFormSuccess(`Invitation sent to ${formData.email}`);
      
      // Reset form after success
      setFormData({
        email: '',
        role: 'USER',
        expiration: '48',
        message: '',
        sendReminder: true
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/admin/invitations');
      }, 2000);
      
    } catch (err) {
      console.error('Error sending invitation:', err);
      setFormError(err.response?.data?.message || 'Failed to send invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel button click
  const handleCancel = () => {
  // Added display name
  handleCancel.displayName = 'handleCancel';

  // Added display name
  handleCancel.displayName = 'handleCancel';

  // Added display name
  handleCancel.displayName = 'handleCancel';

  // Added display name
  handleCancel.displayName = 'handleCancel';

  // Added display name
  handleCancel.displayName = 'handleCancel';


    navigate('/admin/invitations');
  };
  
  return (
    <Box>
      <Typography variant="h5&quot; component="h1" gutterBottom>
        New Invitation
      </Typography>
      
      {/* Success message */}
      {formSuccess && (
        <Alert severity="success&quot; sx={{ mb: 3 }}>
          {formSuccess}
        </Alert>
      )}
      
      {/* Error message */}
      {formError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {formError}
        </Alert>
      )}
      
      {/* Invitation form */}
      <Box component="form&quot; onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          {/* Email field */}
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="email"
              name="email&quot;
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={isSubmitting}
              autoFocus
            />
          </Grid>
          
          {/* Role selection */}
          <Grid item xs={12}>
            <FormControl component="fieldset&quot;>
              <FormLabel component="legend">Role</FormLabel>
              <RadioGroup
                row
                name="role&quot;
                value={formData.role}
                onChange={handleChange}
              >
                <FormControlLabel 
                  value="USER" 
                  control={<Radio />} 
                  label="User&quot; 
                  disabled={isSubmitting}
                />
                <FormControlLabel 
                  value="ADMIN" 
                  control={<Radio />} 
                  label="Admin&quot; 
                  disabled={isSubmitting}
                />
              </RadioGroup>
              {errors.role && (
                <FormHelperText error>{errors.role}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          {/* Expiration selection */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.expiration}>
              <InputLabel id="expiration-label">Expiration</InputLabel>
              <Select
                labelId="expiration-label&quot;
                id="expiration"
                name="expiration&quot;
                value={formData.expiration}
                onChange={handleChange}
                label="Expiration"
                disabled={isSubmitting}
              >
                <MenuItem value="24&quot;>24 hours</MenuItem>
                <MenuItem value="48">48 hours (default)</MenuItem>
                <MenuItem value="72&quot;>72 hours</MenuItem>
                <MenuItem value="168">7 days</MenuItem>
              </Select>
              {errors.expiration && (
                <FormHelperText>{errors.expiration}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          {/* Custom message */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="message&quot;
              name="message"
              label="Custom Message (Optional)&quot;
              value={formData.message}
              onChange={handleChange}
              multiline
              rows={4}
              placeholder="Enter a personalized message for the invitation email"
              disabled={isSubmitting}
            />
          </Grid>
          
          {/* Send reminder option */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.sendReminder}
                  onChange={handleChange}
                  name="sendReminder&quot;
                  color="primary"
                  disabled={isSubmitting}
                />
              }
              label="Send reminder if not accepted within 24 hours&quot;
            />
          </Grid>
          
          {/* Form submission progress */}
          {isSubmitting && (
            <Grid item xs={12}>
              <LinearProgress />
            </Grid>
          )}
          
          {/* Form actions */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined&quot;
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained&quot;
                color="primary"
                disabled={isSubmitting}
              >
                Send Invitation
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default InvitationForm;