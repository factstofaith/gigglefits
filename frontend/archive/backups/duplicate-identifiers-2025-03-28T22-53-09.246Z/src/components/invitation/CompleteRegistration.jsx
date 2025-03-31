import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Container, TextField, LinearProgress, Alert, Grid, Stepper, Step, StepLabel, FormControl, FormHelperText, InputAdornment } from '../../design-system';
import IconButton from '@mui/material/IconButton';;
import { 
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { invitationService } from '@services/userManagementService';
import MFAEnrollment from '@components/security/MFAEnrollment';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
/**
 * Component for completing registration after accepting an invitation
 * This is a multi-step form for creating a user account
 */
const CompleteRegistration = () => {
  // Added display name
  CompleteRegistration.displayName = 'CompleteRegistration';

  // Added display name
  CompleteRegistration.displayName = 'CompleteRegistration';

  // Added display name
  CompleteRegistration.displayName = 'CompleteRegistration';


  // States for invitation data and form
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form data for all steps
  const [formData, setFormData] = useState({
    // Account Information
    fullName: '',
    password: '',
    confirmPassword: '',
    
    // Business Information  
    clientCompany: '',
    zohoAccount: '',
    position: '',
    department: '',
    
    // Contact Information
    phoneNumber: '',
    address: ''
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  
  // Get token from session storage
  const token = sessionStorage.getItem('invitationToken');
  
  // Fetch invitation details on component mount
  useEffect(() => {
    const verifyInvitation = async () => {
      if (!token) {
        setError('No invitation token found. Please use the invitation link from your email.');
        setLoading(false);
        return;
      }
      
      try {
        const response = await invitationService.verifyInvitation(token);
        setInvitation(response.data);
        
        // Pre-populate email if available
        if (response.data.email) {
          setFormData(prev => ({
            ...prev,
            email: response.data.email
          }));
        }
        
        setError(null);
      } catch (err) {
        console.error('Error verifying invitation:', err);
        setError(err.response?.data?.message || 'Invalid or expired invitation.');
      } finally {
        setLoading(false);
      }
    };
    
    verifyInvitation();
  }, [token]);
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
  // Added display name
  togglePasswordVisibility.displayName = 'togglePasswordVisibility';

  // Added display name
  togglePasswordVisibility.displayName = 'togglePasswordVisibility';

  // Added display name
  togglePasswordVisibility.displayName = 'togglePasswordVisibility';


    setShowPassword(!showPassword);
  };
  
  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
  // Added display name
  toggleConfirmPasswordVisibility.displayName = 'toggleConfirmPasswordVisibility';

  // Added display name
  toggleConfirmPasswordVisibility.displayName = 'toggleConfirmPasswordVisibility';

  // Added display name
  toggleConfirmPasswordVisibility.displayName = 'toggleConfirmPasswordVisibility';


    setShowConfirmPassword(!showConfirmPassword);
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
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Validate step 1: Account Information
  const validateStep1 = () => {
  // Added display name
  validateStep1.displayName = 'validateStep1';

  // Added display name
  validateStep1.displayName = 'validateStep1';

  // Added display name
  validateStep1.displayName = 'validateStep1';


    const newErrors = {};
    
    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
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
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character';
    }
    
    // Confirm Password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate step 2: Business Information
  const validateStep2 = () => {
  // Added display name
  validateStep2.displayName = 'validateStep2';

  // Added display name
  validateStep2.displayName = 'validateStep2';

  // Added display name
  validateStep2.displayName = 'validateStep2';


    const newErrors = {};
    
    // Client Company validation
    if (!formData.clientCompany.trim()) {
      newErrors.clientCompany = 'Client company is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next button click
  const handleNext = () => {
  // Added display name
  handleNext.displayName = 'handleNext';

  // Added display name
  handleNext.displayName = 'handleNext';

  // Added display name
  handleNext.displayName = 'handleNext';


    // Validate current step
    let isValid = false;
    
    switch (activeStep) {
      case 0:
        isValid = validateStep1();
        break;
      case 1:
        isValid = validateStep2();
        break;
      default:
        isValid = true;
        break;
    }
    
    if (isValid) {
      if (activeStep === 2) {
        // Submit the form if on last step
        handleSubmit();
      } else {
        // Move to next step
        setActiveStep(prevStep => prevStep + 1);
      }
    }
  };
  
  // Handle back button click
  const handleBack = () => {
  // Added display name
  handleBack.displayName = 'handleBack';

  // Added display name
  handleBack.displayName = 'handleBack';

  // Added display name
  handleBack.displayName = 'handleBack';


    setActiveStep(prevStep => prevStep - 1);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Prepare data for API
      const accountData = {
        token,
        fullName: formData.fullName,
        password: formData.password,
        clientCompany: formData.clientCompany,
        zohoAccount: formData.zohoAccount || null,
        position: formData.position || null,
        department: formData.department || null,
        phoneNumber: formData.phoneNumber || null,
        address: formData.address || null
      };
      
      // Submit account creation
      const response = await invitationService.acceptInvitation(accountData);
      
      // Store the authentication token
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      // Move to MFA setup step
      setActiveStep(3);
      
    } catch (err) {
      console.error('Error creating account:', err);
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Steps configuration
  const steps = [
    'Account Information',
    'Business Information',
    'Contact Information',
    'MFA Setup',
    'Success'
  ];
  
  // Render loading state
  if (loading && activeStep !== 3 && activeStep !== 4) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            {activeStep === 0 ? 'Verifying Invitation' : 'Creating Your Account'}
          </Typography>
          <LinearProgress sx={{ mt: 3, mb: 3 }} />
          <Typography variant="body1">
            {activeStep === 0 ? 'Please wait while we verify your invitation...' : 'Processing your information...'}
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  // Render error state
  if (error && activeStep !== 3 && activeStep !== 4) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom color="error">
            Error
          </Typography>
          <Alert severity="error" sx={{ mt: 3, mb: 3 }}>
            {error}
          </Alert>
          <Typography variant="body1" paragraph>
            There was an error processing your invitation. Please try again or contact the administrator.
          </Typography>
          <Button variant="contained" color="primary" href="/">
            Return to Home
          </Button>
        </Paper>
      </Container>
    );
  }
  
  // Render Account Information step (Step 0)
  const renderAccountInformation = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Create Your Account
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          id="email"
          name="email"
          label="Email"
          value={invitation?.email || ''}
          disabled
          InputProps={{
            readOnly: true,
          }}
        />
        <FormHelperText>Verified from your invitation</FormHelperText>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          id="fullName"
          name="fullName"
          label="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          error={!!errors.fullName}
          helperText={errors.fullName}
          autoFocus
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          id="password"
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={togglePasswordVisibility}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle confirm password visibility"
                  onClick={toggleConfirmPasswordVisibility}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Grid>
    </Grid>
  );
  
  // Render Business Information step (Step 1)
  const renderBusinessInformation = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Business Information
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          id="clientCompany"
          name="clientCompany"
          label="Client Company"
          value={formData.clientCompany}
          onChange={handleChange}
          error={!!errors.clientCompany}
          helperText={errors.clientCompany}
          autoFocus
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="zohoAccount"
          name="zohoAccount"
          label="Zoho Account"
          value={formData.zohoAccount}
          onChange={handleChange}
          error={!!errors.zohoAccount}
          helperText={errors.zohoAccount}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="position"
          name="position"
          label="Role/Position"
          value={formData.position}
          onChange={handleChange}
          error={!!errors.position}
          helperText={errors.position}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="department"
          name="department"
          label="Department"
          value={formData.department}
          onChange={handleChange}
          error={!!errors.department}
          helperText={errors.department}
        />
      </Grid>
    </Grid>
  );
  
  // Render Contact Information step (Step 2)
  const renderContactInformation = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Contact Information
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="phoneNumber"
          name="phoneNumber"
          label="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
          error={!!errors.phoneNumber}
          helperText={errors.phoneNumber}
          autoFocus
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="address"
          name="address"
          label="Address"
          value={formData.address}
          onChange={handleChange}
          error={!!errors.address}
          helperText={errors.address}
          multiline
          rows={3}
        />
      </Grid>
    </Grid>
  );
  
  // Render Success step (Step 3)
  const renderSuccess = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
      
      <Typography variant="h5" gutterBottom>
        Account Created Successfully!
      </Typography>
      
      <Typography variant="body1" paragraph>
        Your account has been created and you can now log in to the platform.
      </Typography>
      
      <Box sx={{ mt: 4 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/login')}
          size="large"
        >
          Go to Login
        </Button>
      </Box>
    </Box>
  );
  
  // Handle MFA setup completion
  const handleMFAComplete = () => {
  // Added display name
  handleMFAComplete.displayName = 'handleMFAComplete';

  // Added display name
  handleMFAComplete.displayName = 'handleMFAComplete';

  // Added display name
  handleMFAComplete.displayName = 'handleMFAComplete';


    // Move to success step
    setActiveStep(4);
    
    // Clear token from session storage (we're done with it)
    sessionStorage.removeItem('invitationToken');
  };
  
  // Render MFA setup step (Step 3)
  const renderMFASetup = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Set Up Two-Factor Authentication
      </Typography>
      
      <Typography variant="body1" paragraph>
        For enhanced security, we require setting up two-factor authentication.
        This ensures that only you can access your account, even if your password is compromised.
      </Typography>
      
      <MFAEnrollment onComplete={handleMFAComplete} />
    </Box>
  );
  
  // Render step content based on active step
  const getStepContent = (step) => {
  // Added display name
  getStepContent.displayName = 'getStepContent';

  // Added display name
  getStepContent.displayName = 'getStepContent';

  // Added display name
  getStepContent.displayName = 'getStepContent';


    switch (step) {
      case 0:
        return renderAccountInformation();
      case 1:
        return renderBusinessInformation();
      case 2:
        return renderContactInformation();
      case 3:
        return renderMFASetup();
      case 4:
        return renderSuccess();
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        {/* Registration stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {/* Step content */}
        <Box sx={{ mt: 2, mb: 2 }}>
          {getStepContent(activeStep)}
        </Box>
        
        {/* Navigation buttons */}
        {(activeStep !== 3 && activeStep !== 4) && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={loading}
            >
              {activeStep === 2 ? 'Create Account' : 'Next'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CompleteRegistration;