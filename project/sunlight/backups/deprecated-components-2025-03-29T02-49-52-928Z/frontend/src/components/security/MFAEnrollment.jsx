import React, { useState, useEffect } from 'react';
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
;
;
;
;
;
;;
import { ContentCopy as ContentCopyIcon, GetApp as DownloadIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@contexts/UserContext';
import { Alert, Box, Button, Card, CardContent, Checkbox, FormControlLabel, Grid, InputAdornment, LinearProgress, Link, Paper, Stack, Step, StepLabel, Stepper, TextField, Typography } from '../../design-system';
// Design system import already exists;
// Design system import already exists;

/**
 * Component for MFA enrollment process
 * Guides users through setting up MFA for their account
 * 
 * @param {Object} props Component props
 * @param {Function} props.onComplete Callback function called when MFA setup is complete
 */
const MFAEnrollment = ({ onComplete }) => {
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


  const [activeStep, setActiveStep] = useState(0);
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeData, setQrCodeData] = useState(null);
  const [secretKey, setSecretKey] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [recoveryCodesSaved, setRecoveryCodesSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { enrollMfa, verifyMfa, getRecoveryCodes, mfaEnabled, mfaError, clearMfaError } = useUser();
  
  // Initialize MFA enrollment on component mount
  useEffect(() => {
    // If user already has MFA enabled, redirect to MFA management
    if (mfaEnabled) {
      navigate('/profile/security');
      return;
    }
    
    // Start MFA enrollment process
    startMFAEnrollment();
  }, [mfaEnabled, navigate]);
  
  // Start MFA enrollment process
  const startMFAEnrollment = async () => {
    setLoading(true);
    try {
      clearMfaError();
      
      // Call API to begin enrollment
      const response = await enrollMfa();
      
      // Store QR code and secret key
      setQrCodeData(response.qrCode);
      setSecretKey(response.secret);
      
      setError(null);
    } catch (err) {
      console.error('Error starting MFA enrollment:', err);
      setError('Failed to start MFA enrollment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Verify the entered code
  const verifyCode = async () => {
    setLoading(true);
    try {
      clearMfaError();
      
      // Call API to verify code
      await verifyMfa(verificationCode);
      
      // Get recovery codes
      const recoveryResponse = await getRecoveryCodes();
      setRecoveryCodes(recoveryResponse.recoveryCodes);
      
      // Move to next step
      setActiveStep(1);
      setError(null);
    } catch (err) {
      console.error('Error verifying code:', err);
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle verification code change
  const handleVerificationCodeChange = (e) => {
  // Added display name
  handleVerificationCodeChange.displayName = 'handleVerificationCodeChange';

  // Added display name
  handleVerificationCodeChange.displayName = 'handleVerificationCodeChange';

  // Added display name
  handleVerificationCodeChange.displayName = 'handleVerificationCodeChange';

  // Added display name
  handleVerificationCodeChange.displayName = 'handleVerificationCodeChange';

  // Added display name
  handleVerificationCodeChange.displayName = 'handleVerificationCodeChange';


    // Remove any non-numeric characters
    const cleanedValue = e.target.value.replace(/[^0-9]/g, '');
    
    // Limit to 6 digits
    if (cleanedValue.length <= 6) {
      setVerificationCode(cleanedValue);
    }
  };
  
  // Handle copy recovery codes to clipboard
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
  };
  
  // Handle download recovery codes
  const handleDownloadRecoveryCodes = () => {
  // Added display name
  handleDownloadRecoveryCodes.displayName = 'handleDownloadRecoveryCodes';

  // Added display name
  handleDownloadRecoveryCodes.displayName = 'handleDownloadRecoveryCodes';

  // Added display name
  handleDownloadRecoveryCodes.displayName = 'handleDownloadRecoveryCodes';

  // Added display name
  handleDownloadRecoveryCodes.displayName = 'handleDownloadRecoveryCodes';

  // Added display name
  handleDownloadRecoveryCodes.displayName = 'handleDownloadRecoveryCodes';


    const codesText = recoveryCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mfa-recovery-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Handle completion of MFA setup
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


    if (onComplete) {
      // Call the onComplete callback if provided
      onComplete();
    } else {
      // Default behavior - navigate to security settings
      navigate('/profile/security');
    }
  };
  
  // Steps configuration
  const steps = ['Set Up Authenticator', 'Save Recovery Codes'];
  
  // Render step content based on current step
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
      // Step 1: Set up authenticator app
      case 0:
        return (
          <Box>
            <Typography variant="h6&quot; gutterBottom>
              Set Up Authenticator App
            </Typography>
            
            <Typography variant="body1" paragraph>
              To set up two-factor authentication, you'll need an authenticator app like Google Authenticator,
              Microsoft Authenticator, or Authy installed on your phone.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle1&quot; gutterBottom>
                  1. Scan this QR code with your authenticator app
                </Typography>
                
                {/* Display QR code image */}
                {qrCodeData && (
                  <Box 
                    component="img" 
                    src={qrCodeData}
                    alt="QR Code for MFA setup&quot;
                    sx={{ 
                      border: "1px solid #ddd', 
                      p: 2, 
                      borderRadius: 1,
                      maxWidth: '200px'
                    }}
                  />
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1&quot; gutterBottom>
                  Or manually enter this key in your app:
                </Typography>
                
                <TextField
                  fullWidth
                  value={secretKey}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={() => navigator.clipboard.writeText(secretKey)}
                          startIcon={<ContentCopyIcon />}
                          size="small&quot;
                        >
                          Copy
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  margin="normal"
                />
                
                <Typography variant="subtitle1&quot; gutterBottom sx={{ mt: 3 }}>
                  2. Enter the verification code shown in your app:
                </Typography>
                
                <TextField
                  fullWidth
                  label="Verification Code"
                  placeholder="Enter 6-digit code&quot;
                  value={verificationCode}
                  onChange={handleVerificationCodeChange}
                  inputProps={{ 
                    maxLength: 6,
                    inputMode: "numeric',
                    pattern: '[0-9]*'
                  }}
                  margin="normal&quot;
                  error={!!error}
                  helperText={error}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ display: "flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained&quot;
                color="primary"
                onClick={verifyCode}
                disabled={verificationCode.length !== 6 || loading}
              >
                Verify
              </Button>
            </Box>
            
            {loading && <LinearProgress sx={{ mt: 2 }} />}
          </Box>
        );
      
      // Step 2: Save recovery codes
      case 1:
        return (
          <Box>
            <Typography variant="h6&quot; gutterBottom>
              Save Your Recovery Codes
            </Typography>
            
            <Typography variant="body1" paragraph>
              Recovery codes allow you to access your account if you lose your phone or cannot use your
              authenticator app. Each code can only be used once. Keep these codes in a secure place.
            </Typography>
            
            <Alert severity="warning&quot; sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Important: Without these recovery codes, you may lose access to your account if you
                lose your phone.
              </Typography>
            </Alert>
            
            <Card variant="outlined&quot; sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  {recoveryCodes.map((code, index) => (
                    <Grid item xs={6} sm={4} key={index}>
                      <Typography variant="body2" fontFamily="monospace&quot;>
                        {code}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
            
            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
              <Button
                variant="outlined&quot;
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyRecoveryCodes}
              >
                Copy to Clipboard
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadRecoveryCodes}
              >
                Download as Text
              </Button>
            </Stack>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={recoveryCodesSaved}
                  onChange={(e) => setRecoveryCodesSaved(e.target.checked)}
                  color="primary&quot;
                />
              }
              label="I have saved my recovery codes in a secure location"
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained&quot;
                color="primary"
                onClick={handleComplete}
                disabled={!recoveryCodesSaved}
              >
                Complete Setup
              </Button>
            </Box>
          </Box>
        );
      
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Paper sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h5&quot; component="h1" gutterBottom>
        Set Up Two-Factor Authentication
      </Typography>
      
      {/* Display MFA error from context */}
      {mfaError && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {mfaError}
        </Alert>
      )}
      
      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 3 }}>
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
    </Paper>
  );
};

export default MFAEnrollment;