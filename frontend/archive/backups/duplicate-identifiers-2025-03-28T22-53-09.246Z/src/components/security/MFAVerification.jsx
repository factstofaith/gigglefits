import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Container, LinearProgress, Alert, Link } from '../../design-system';
import { useUser } from '@contexts/UserContext';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
/**
 * MFA verification component used during login process
 * Handles TOTP code verification or recovery code usage
 * Includes support for MFA bypass from token
 */
const MFAVerification = () => {
  // Added display name
  MFAVerification.displayName = 'MFAVerification';

  // Added display name
  MFAVerification.displayName = 'MFAVerification';

  // Added display name
  MFAVerification.displayName = 'MFAVerification';


  const [code, setCode] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBypassChecked, setIsBypassChecked] = useState(false);
  
  const { verifyMfa, clearMfaError, mfaError } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page we should redirect to after successful verification
  const from = location.state?.from || '/';
  
  // Check for MFA bypass on component mount
  useEffect(() => {
    const checkMfaBypass = () => {
  // Added display name
  checkMfaBypass.displayName = 'checkMfaBypass';

  // Added display name
  checkMfaBypass.displayName = 'checkMfaBypass';

  // Added display name
  checkMfaBypass.displayName = 'checkMfaBypass';


      // If bypass_mfa is set in localStorage (from token payload), skip MFA verification
      const bypassMfa = localStorage.getItem('bypass_mfa');
      
      if (bypassMfa === 'true' && !isBypassChecked) {
        setIsBypassChecked(true);
        navigate(from, { replace: true });
      }
    };
    
    checkMfaBypass();
  }, [navigate, from, isBypassChecked]);
  
  const handleSubmitCode = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Clear any previous errors
      clearMfaError();
      
      // Call API to verify MFA code
      await verifyMfa(code);
      
      // If successful, navigate to the intended destination
      navigate(from, { replace: true });
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSubmitRecovery = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Clear any previous errors
      clearMfaError();
      
      // Call API to verify recovery code
      // Note: In a real implementation, you might have a different endpoint/method for recovery codes
      await verifyMfa(recoveryCode);
      
      // If successful, navigate to the intended destination
      navigate(from, { replace: true });
    } catch (err) {
      setError('Invalid recovery code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const toggleRecoveryMode = () => {
  // Added display name
  toggleRecoveryMode.displayName = 'toggleRecoveryMode';

  // Added display name
  toggleRecoveryMode.displayName = 'toggleRecoveryMode';

  // Added display name
  toggleRecoveryMode.displayName = 'toggleRecoveryMode';


    setShowRecovery(!showRecovery);
    setError(null);
  };
  
  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Two-Factor Authentication
        </Typography>
        
        {/* Display error message if verification fails */}
        {(error || mfaError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || mfaError}
          </Alert>
        )}
        
        {!showRecovery ? (
          // Verification code form
          <Box component="form" onSubmit={handleSubmitCode} noValidate>
            <Typography variant="body1" gutterBottom>
              Please enter the verification code from your authenticator app.
            </Typography>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="code"
              label="Verification Code"
              name="code"
              autoComplete="one-time-code"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputProps={{ 
                maxLength: 6, 
                inputMode: 'numeric',
                pattern: '[0-9]*' 
              }}
              disabled={isSubmitting}
            />
            
            {isSubmitting && <LinearProgress sx={{ mt: 2, mb: 2 }} />}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting || code.length < 6}
            >
              Verify
            </Button>
            
            <Box textAlign="center">
              <Link 
                component="button" 
                variant="body2" 
                onClick={toggleRecoveryMode}
                underline="hover"
              >
                Lost access to your authenticator app? Use a recovery code.
              </Link>
            </Box>
          </Box>
        ) : (
          // Recovery code form
          <Box component="form" onSubmit={handleSubmitRecovery} noValidate>
            <Typography variant="body1" gutterBottom>
              Please enter one of your recovery codes.
            </Typography>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="recoveryCode"
              label="Recovery Code"
              name="recoveryCode"
              autoFocus
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value)}
              disabled={isSubmitting}
            />
            
            {isSubmitting && <LinearProgress sx={{ mt: 2, mb: 2 }} />}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting || recoveryCode.length < 8}
            >
              Verify
            </Button>
            
            <Box textAlign="center">
              <Link 
                component="button" 
                variant="body2" 
                onClick={toggleRecoveryMode}
                underline="hover"
              >
                Back to verification code
              </Link>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default MFAVerification;