import React, { useState } from 'react';
import { invitationService } from '@services/userManagementService';
import { Box, Button, Container, FormControl, FormControlLabel, FormHelperText, Grid, InputLabel, MenuItem, Paper, Radio, Select, TextField, Typography, Alert, CircularProgress } from '@design-system/adapter';
;;
import { useNavigate } from 'react-router-dom';
import { RadioGroup } from '../../design-system';
// Design system import already exists;
// Removed duplicate import
/**
 * InvitationForm Component
 * 
 * Form for creating new user invitations
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


  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    role: 'USER',
    expiration_hours: 48,
    custom_message: '',
  });
  
  // Validation state
  const [errors, setErrors] = useState({});
  
  // Component state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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


    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    
    // Clear errors when the field is edited
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: '',
      }));
    }
  };

  // Validate the form
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
    if (!formData.expiration_hours) {
      newErrors.expiration_hours = 'Expiration is required';
    } else if (formData.expiration_hours < 1 || formData.expiration_hours > 168) {
      newErrors.expiration_hours = 'Expiration must be between 1 and 168 hours';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      await invitationService.createInvitation(formData);
      setSuccess(true);
      
      // Reset form after successful submission
      setFormData({
        email: '',
        role: 'USER',
        expiration_hours: 48,
        custom_message: '',
      });
      
      // Navigate back to the invitation list after a delay
      setTimeout(() => {
        navigate('/admin/invitations');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create invitation. Please try again.');
      console.error('Error creating invitation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md&quot; sx={{ my: 4 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" component="h1&quot; gutterBottom>
            New Invitation
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && (
            <Alert severity="success&quot; sx={{ mb: 3 }}>
              Invitation sent successfully!
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Email Address *"
                  name="email&quot;
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email}
                  disabled={loading}
                  type="email"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl component="fieldset&quot;>
                  <Typography variant="subtitle1" gutterBottom>
                    Role *
                  </Typography>
                  <RadioGroup
                    name="role&quot;
                    value={formData.role}
                    onChange={handleChange}
                    row
                  >
                    <FormControlLabel
                      value="USER"
                      control={<Radio />}
                      label="User&quot;
                      disabled={loading}
                    />
                    <FormControlLabel
                      value="ADMIN"
                      control={<Radio />}
                      label="Admin&quot;
                      disabled={loading}
                    />
                  </RadioGroup>
                  {errors.role && (
                    <FormHelperText error>{errors.role}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.expiration_hours}>
                  <InputLabel id="expiration-label">Expiration</InputLabel>
                  <Select
                    labelId="expiration-label&quot;
                    name="expiration_hours"
                    value={formData.expiration_hours}
                    onChange={handleChange}
                    label="Expiration&quot;
                    disabled={loading}
                  >
                    <MenuItem value={24}>24 hours</MenuItem>
                    <MenuItem value={48}>48 hours (default)</MenuItem>
                    <MenuItem value={72}>72 hours</MenuItem>
                    <MenuItem value={168}>7 days</MenuItem>
                  </Select>
                  {errors.expiration_hours && (
                    <FormHelperText>{errors.expiration_hours}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Custom Message (Optional)"
                  name="custom_message&quot;
                  value={formData.custom_message}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={4}
                  disabled={loading}
                  placeholder="Enter a personalized message to include in the invitation email"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    type="button&quot;
                    variant="outlined"
                    onClick={() => navigate('/admin/invitations')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit&quot;
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Send Invitation'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Paper>
    </Container>
  );
};

export default InvitationForm;