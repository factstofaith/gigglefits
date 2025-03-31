import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invitationService } from '@services/userManagementService';
import { ;
  Box , Box} from '@mui/material';
;
;
;
;
;
;
;
;
;
;
;
;
import  from '@mui/material/';;
import { Alert, Box, Button, CircularProgress, Container, Divider, Grid, Paper, Step, StepLabel, Stepper, TextField, Typography } from '../../design-system';
// Design system import already exists;

// Steps in the invitation acceptance process
const steps = ['Verify Invitation', 'Create Account', 'Complete Profile'];

/**
 * AcceptInvitation Component
 * 
 * A component for accepting an invitation and creating a user account
 */
const AcceptInvitation = () => {
  // Added display name
  AcceptInvitation.displayName = 'AcceptInvitation';

  // Added display name
  AcceptInvitation.displayName = 'AcceptInvitation';

  // Added display name
  AcceptInvitation.displayName = 'AcceptInvitation';

  // Added display name
  AcceptInvitation.displayName = 'AcceptInvitation';

  // Added display name
  AcceptInvitation.displayName = 'AcceptInvitation';


  const { token } = useParams();
  const navigate = useNavigate();
  
  // Component state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invitation, setInvitation] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    token: token || '',
    name: '',
    password: '',
    confirmPassword: '',
    client_company: '',
    zoho_account: '',
    contact_information: {
      phone: '',
      position: '',
      department: '',
    },
  });
  
  // Validation state
  const [errors, setErrors] = useState({});

  // Verify the invitation token on component mount
  useEffect(() => {
    if (token) {
      verifyInvitation(token);
    }
  }, [token]);

  // Verify invitation token
  const verifyInvitation = async (tokenToVerify) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await invitationService.verifyInvitation(tokenToVerify);
      setInvitation(response.data);
      // If the token is valid, move to the next step
      setActiveStep(1);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired invitation. Please contact your administrator.');
      console.error('Error verifying invitation:', err);
    } finally {
      setLoading(false);
    }
  };

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
    
    // Handle nested contact_information fields
    if (name.startsWith('contact_')) {
      const contactField = name.replace('contact_', '');
      setFormData((prevData) => ({
        ...prevData,
        contact_information: {
          ...prevData.contact_information,
          [contactField]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
    
    // Clear errors when the field is edited
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: '',
      }));
    }
  };

  // Validate the account creation form
  const validateAccountForm = () => {
  // Added display name
  validateAccountForm.displayName = 'validateAccountForm';

  // Added display name
  validateAccountForm.displayName = 'validateAccountForm';

  // Added display name
  validateAccountForm.displayName = 'validateAccountForm';

  // Added display name
  validateAccountForm.displayName = 'validateAccountForm';

  // Added display name
  validateAccountForm.displayName = 'validateAccountForm';


    const newErrors = {};
    
    // Name validation
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate the profile form
  const validateProfileForm = () => {
  // Added display name
  validateProfileForm.displayName = 'validateProfileForm';

  // Added display name
  validateProfileForm.displayName = 'validateProfileForm';

  // Added display name
  validateProfileForm.displayName = 'validateProfileForm';

  // Added display name
  validateProfileForm.displayName = 'validateProfileForm';

  // Added display name
  validateProfileForm.displayName = 'validateProfileForm';


    // Profile fields are optional, so no validation required
    return true;
  };

  // Handle next step
  const handleNext = () => {
  // Added display name
  handleNext.displayName = 'handleNext';

  // Added display name
  handleNext.displayName = 'handleNext';

  // Added display name
  handleNext.displayName = 'handleNext';

  // Added display name
  handleNext.displayName = 'handleNext';

  // Added display name
  handleNext.displayName = 'handleNext';


    if (activeStep === 1) {
      // Validate account form before proceeding
      if (!validateAccountForm()) {
        return;
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };

  // Handle back step
  const handleBack = () => {
  // Added display name
  handleBack.displayName = 'handleBack';

  // Added display name
  handleBack.displayName = 'handleBack';

  // Added display name
  handleBack.displayName = 'handleBack';

  // Added display name
  handleBack.displayName = 'handleBack';

  // Added display name
  handleBack.displayName = 'handleBack';


    setActiveStep((prevStep) => prevStep - 1);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation
    if (!validateProfileForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Prepare the data for submission
    const submissionData = {
      token: token,
      name: formData.name,
      password: formData.password,
      client_company: formData.client_company || null,
      zoho_account: formData.zoho_account || null,
      contact_information: formData.contact_information,
    };
    
    try {
      await invitationService.acceptInvitation(submissionData);
      
      // Redirect to login page after successful account creation
      navigate('/login', { 
        state: { 
          message: 'Account created successfully! You can now log in.' 
        } 
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create account. Please try again.');
      console.error('Error accepting invitation:', err);
    } finally {
      setLoading(false);
    }
  };

  // Render step content based on active step
  const getStepContent = (step) => {
  // Added display name
  getStepContent.displayName = 'getStepContent';

  // Added display name
  getStepContent.displayName = 'getStepContent';

  // Added display name
  getStepContent.displayName = 'getStepContent';

  // Added display name
  getStepContent.displayName = 'getStepContent';

  // Added display name
  getStepContent.displayName = 'getStepContent';


    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5&quot; gutterBottom>
              Verifying your invitation...
            </Typography>
            
            {loading ? (
              <CircularProgress sx={{ my: 3 }} />
            ) : (
              <>
                {error ? (
                  <Alert severity="error" sx={{ mt: 3 }}>
                    {error}
                  </Alert>
                ) : (
                  <Typography paragraph>
                    Please wait while we verify your invitation link.
                  </Typography>
                )}
                
                <Box sx={{ mt: 3 }}>
                  <TextField
                    label="Invitation Token&quot;
                    value={formData.token}
                    onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                    fullWidth
                    margin="normal"
                    disabled={loading}
                  />
                  
                  <Button
                    variant="contained&quot;
                    onClick={() => verifyInvitation(formData.token)}
                    disabled={loading || !formData.token}
                    sx={{ mt: 2 }}
                  >
                    Verify Token
                  </Button>
                </Box>
              </>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Create Your Account
            </Typography>
            
            <Typography paragraph>
              You've been invited to join the platform. Please create your account to continue.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Email&quot;
                  value={invitation?.email || "'}
                  fullWidth
                  disabled
                  margin="normal&quot;
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Full Name *"
                  name="name&quot;
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  error={!!errors.name}
                  helperText={errors.name}
                  disabled={loading}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Password *&quot;
                  name="password"
                  type="password&quot;
                  value={formData.password}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password}
                  disabled={loading}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Confirm Password *&quot;
                  name="confirmPassword"
                  type="password&quot;
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  disabled={loading}
                  required
                />
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained&quot; onClick={handleNext}>
                Continue
              </Button>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Complete Your Profile
            </Typography>
            
            <Typography paragraph>
              Please provide some additional information to complete your profile.
              These details are optional and can be updated later.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Client Company&quot;
                  name="client_company"
                  value={formData.client_company}
                  onChange={handleChange}
                  fullWidth
                  margin="normal&quot;
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Zoho Account"
                  name="zoho_account&quot;
                  value={formData.zoho_account}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ mb: 2 }}>
                  <Typography variant="subtitle2&quot;>Contact Information</Typography>
                </Divider>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  label="Phone Number"
                  name="contact_phone&quot;
                  value={formData.contact_information.phone}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  label="Position&quot;
                  name="contact_position"
                  value={formData.contact_information.position}
                  onChange={handleChange}
                  fullWidth
                  margin="normal&quot;
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  label="Department"
                  name="contact_department&quot;
                  value={formData.contact_information.department}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  disabled={loading}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                type="submit&quot;
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Account'}
              </Button>
            </Box>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md&quot; sx={{ my: 4 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" component="h1&quot; gutterBottom align="center">
            Welcome to TAP Integration Platform
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ py: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {error && activeStep !== 0 && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {getStepContent(activeStep)}
        </Box>
      </Paper>
    </Container>
  );
};

export default AcceptInvitation;