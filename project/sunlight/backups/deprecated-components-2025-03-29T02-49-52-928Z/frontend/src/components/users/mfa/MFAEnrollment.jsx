import React, { useState } from 'react';
import { useUser } from '@contexts/UserContext';
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
import  from '@mui/material/';;
import { Alert, Box, Button, CircularProgress, Container, Grid, Paper, Step, StepLabel, Stepper, TextField, Typography } from '../../design-system';
// Design system import already exists;

// Steps in the MFA enrollment process
const steps = ['Introduction', 'Scan QR Code', 'Verify', 'Recovery Codes'];

/**
 * MFA Enrollment Component
 * 
 * A multi-step wizard for setting up MFA (Multi-Factor Authentication)
 */
const MFAEnrollment = () => {
  // Added display name
  MFAEnrollment.displayName = 'MFAEnrollment';

  // Added display name
  MFAEnrollment.displayName = 'MFAEnrollment';

  // Added display name
  MFAEnrollment.displayName = 'MFAEnrollment';

  // Added display name
  MFAEnrollment.displayName = 'MFAEnrollment';

  // Added display name
  MFAEnrollment.displayName = 'MFAEnrollment';


  // Get MFA functions from UserContext
  const {
    mfaEnabled,
    mfaVerified,
    mfaError,
    enrollMfa,
    verifyMfa,
    getRecoveryCodes,
    clearMfaError,
  } = useUser();

  // Component state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [error, setError] = useState('');

  // Handle moving to next step
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


    setActiveStep(prevStep => prevStep + 1);
  };

  // Handle moving to previous step
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


    setActiveStep(prevStep => prevStep - 1);
  };

  // Start MFA enrollment
  const handleStartEnrollment = async () => {
    setLoading(true);
    setError('');
    clearMfaError();

    try {
      const data = await enrollMfa();
      setEnrollmentData(data);
      handleNext();
    } catch (err) {
      setError('Failed to start MFA enrollment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify MFA code
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');
    clearMfaError();

    try {
      await verifyMfa(verificationCode);
      const recoveryCodesData = await getRecoveryCodes();
      setRecoveryCodes(recoveryCodesData.codes);
      handleNext();
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Copy recovery codes to clipboard
  const handleCopyRecoveryCodes = () => {
  // Added display name
  handleCopyRecoveryCodes.displayName = 'handleCopyRecoveryCodes';

  // Added display name
  handleCopyRecoveryCodes.displayName = 'handleCopyRecoveryCodes';

  // Added display name
  handleCopyRecoveryCodes.displayName = 'handleCopyRecoveryCodes';

  // Added display name
  handleCopyRecoveryCodes.displayName = 'handleCopyRecoveryCodes';

  // Added display name
  handleCopyRecoveryCodes.displayName = 'handleCopyRecoveryCodes';


    const codesText = recoveryCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    alert('Recovery codes copied to clipboard');
  };

  // Complete MFA setup
  const handleComplete = () => {
  // Added display name
  handleComplete.displayName = 'handleComplete';

  // Added display name
  handleComplete.displayName = 'handleComplete';

  // Added display name
  handleComplete.displayName = 'handleComplete';

  // Added display name
  handleComplete.displayName = 'handleComplete';

  // Added display name
  handleComplete.displayName = 'handleComplete';


    // Redirect to profile or dashboard
    window.location.href = '/profile';
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
          <Box sx={{ p: 3 }}>
            <Typography variant="h5&quot; gutterBottom>
              Enhance Your Account Security
            </Typography>
            <Typography paragraph>
              Multi-Factor Authentication adds an extra layer of security to your
              account by requiring a verification code in addition to your password.
            </Typography>
            <Typography paragraph>
              To complete setup, you"ll need:
            </Typography>
            <ul>
              <li>
                <Typography>
                  A smartphone with an authenticator app installed
                  (Google Authenticator, Microsoft Authenticator, Authy, etc.)
                </Typography>
              </li>
              <li>
                <Typography>
                  About 2 minutes to complete the setup process
                </Typography>
              </li>
            </ul>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained&quot;
                onClick={handleStartEnrollment}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Continue'}
              </Button>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5&quot; gutterBottom>
              Scan this QR code with your authenticator app
            </Typography>
            
            {enrollmentData && (
              <Box sx={{ textAlign: "center', my: 4 }}>
                <img
                  src={enrollmentData.qr_code}
                  alt="QR Code for MFA setup&quot;
                  style={{ maxWidth: "250px', margin: '0 auto' }}
                />
              </Box>
            )}
            
            <Typography variant="subtitle1&quot; gutterBottom>
              Can"t scan the code? Manual entry:
            </Typography>
            <Typography
              variant="body2&quot;
              sx={{
                backgroundColor: "#f5f5f5',
                p: 2,
                borderRadius: 1,
                fontFamily: 'monospace',
              }}
            >
              {enrollmentData?.manual_entry_key || 'Loading...'}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={handleBack}>Back</Button>
              <Button variant="contained&quot; onClick={handleNext}>
                I"ve scanned the code
              </Button>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5&quot; gutterBottom>
              Verify your setup
            </Typography>
            <Typography paragraph>
              Enter the 6-digit verification code from your authenticator app:
            </Typography>
            
            <TextField
              fullWidth
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              margin="normal&quot;
              inputProps={{
                maxLength: 6,
                inputMode: "numeric',
                pattern: '[0-9]*',
              }}
              placeholder="123456&quot;
            />
            
            <Box sx={{ display: "flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained&quot;
                onClick={handleVerifyCode}
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? <CircularProgress size={24} /> : "Verify'}
              </Button>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5&quot; gutterBottom>
              Save Your Recovery Codes
            </Typography>
            <Typography paragraph>
              If you lose access to your authenticator app, you can use one of these
              recovery codes to sign in. Each code can only be used once.
            </Typography>
            
            <Box
              sx={{
                backgroundColor: "#f5f5f5',
                p: 2,
                borderRadius: 1,
                fontFamily: 'monospace',
                my: 3,
              }}
            >
              {recoveryCodes.map((code, index) => (
                <Typography key={index} variant="body2&quot;>
                  • {code}
                </Typography>
              ))}
            </Box>
            
            <Typography variant="subtitle2" color="error&quot; paragraph>
              Important: Store these codes in a secure location!
            </Typography>
            
            <Button
              variant="outlined"
              onClick={handleCopyRecoveryCodes}
              sx={{ mr: 2 }}
            >
              Copy to Clipboard
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained&quot; onClick={handleComplete}>
                Complete Setup
              </Button>
            </Box>
          </Box>
        );

      default:
        return "Unknown step';
    }
  };

  return (
    <Container maxWidth="md&quot; sx={{ my: 4 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" component="h1&quot; gutterBottom>
            Set Up Multi-Factor Authentication
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {(error || mfaError) && (
            <Alert
              severity="error"
              onClose={() => {
                setError('');
                clearMfaError();
              }}
              sx={{ mb: 3 }}
            >
              {error || mfaError}
            </Alert>
          )}
          
          {getStepContent(activeStep)}
        </Box>
      </Paper>
    </Container>
  );
};

export default MFAEnrollment;