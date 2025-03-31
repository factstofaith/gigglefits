// AuthModal.jsx
// -----------------------------------------------------------------------------
// Authentication modal with support for standard login, Office 365, and Gmail
// Enhanced with accessibility features
// Migrated to use design system legacy components

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import PropTypes from 'prop-types';
import { announceToScreenReader, getFormControlProps } from '../../utils/accessibilityUtils';

// Design system legacy components
import {
  DialogLegacy as Dialog,
  DialogTitleLegacy as DialogTitle,
  DialogContentLegacy as DialogContent,
  DialogActionsLegacy as DialogActions,
  TextFieldLegacy as TextField,
  ButtonLegacy as Button,
  TypographyLegacy as Typography,
  DividerLegacy as Divider,
  AlertLegacy as Alert,
  BoxLegacy as Box,
  LinkLegacy as Link,
  IconButtonLegacy as IconButton,
  CircularProgressLegacy as CircularProgress,
  StackLegacy as Stack,
  PaperLegacy as Paper,
  FormHelperTextLegacy as FormHelperText,
} from '../../design-system/legacy';

import {
import Box from '@mui/material/Box';
  Close as CloseIcon,
  Business as MicrosoftIcon, // Replaced Microsoft with Business
  Email as EmailIcon,
} from '@mui/icons-material';

function AuthModal({ isOpen, onClose, onLoginSuccess, initialMode = 'login' }) {
  // Added display name
  AuthModal.displayName = 'AuthModal';

  // Auth state
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [username, setUsername] = useState(');
  const [password, setPassword] = useState(');
  const [confirmPass, setConfirmPass] = useState(');
  const [errorMessage, setErrorMessage] = useState(');
  const [isLoading, setIsLoading] = useState(false);

  // Refs for focus management
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPassRef = useRef(null);
  const submitButtonRef = useRef(null);

  const navigate = useNavigate();

  // Toggle between login and register
  const toggleMode = () => {
  // Added display name
  toggleMode.displayName = 'toggleMode';

  // Added display name
  toggleMode.displayName = 'toggleMode';

  // Added display name
  toggleMode.displayName = 'toggleMode';

  // Added display name
  toggleMode.displayName = 'toggleMode';

  // Added display name
  toggleMode.displayName = 'toggleMode';


    setMode(prev => (prev === 'login' ? 'register' : 'login'));
    setErrorMessage(');
    setPassword(');
    setConfirmPass(');
    setUsername(');

    // Announce mode change to screen readers
    announceToScreenReader(`Mode changed to ${mode === 'login' ? 'registration' : 'login'}');
  };

  // Set focus to first field when modal opens
  useEffect(() => {
    if (isOpen && usernameRef.current) {
      setTimeout(() => {
        usernameRef.current.focus();
      }, 100);
    }
  }, [isOpen, mode]);

  // Announce errors to screen readers
  useEffect(() => {
    if (errorMessage) {
      announceToScreenReader(errorMessage, true);
    }
  }, [errorMessage]);

  // Standard login/register
  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(');

    try {
      if (mode === 'login') {
        // Login with username and password
        const user = await authService.login(username, password);
        if (onLoginSuccess) {
          onLoginSuccess(user); // Pass the user back to parent
        }
        onClose();
        navigate('/integrations');
        announceToScreenReader('Login successful! Redirecting to integrations page.');
      } else {
        // Register validation
        if (password !== confirmPass) {
          setErrorMessage('Passwords do not match');
          setIsLoading(false);
          return;
        }

        // Mock registration - in a real app would call backend API
        // After registration, auto-login
        await authService.login(username, password);
        onClose();
        navigate('/integrations');
        announceToScreenReader('Registration successful! Redirecting to integrations page.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Office 365 login
  const handleOffice365Login = async () => {
    setIsLoading(true);
    setErrorMessage(');
    announceToScreenReader('Logging in with Microsoft Office 365...');

    try {
      await authService.loginWithOffice365();
      onClose();
      navigate('/integrations');
      announceToScreenReader('Microsoft login successful! Redirecting to integrations page.');
    } catch (err) {
      setErrorMessage(err.message || 'Office 365 authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Gmail login
  const handleGmailLogin = async () => {
    setIsLoading(true);
    setErrorMessage(');
    announceToScreenReader('Logging in with Gmail...');

    try {
      await authService.loginWithGmail();
      onClose();
      navigate('/integrations');
      announceToScreenReader('Gmail login successful! Redirecting to integrations page.');
    } catch (err) {
      setErrorMessage(err.message || 'Gmail authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate unique IDs for accessibility
  const formId = 'auth-form';
  const usernameId = '${formId}-username';
  const passwordId = '${formId}-password';
  const confirmPassId = '${formId}-confirm-password';
  const errorId = '${formId}-error';

  // Get form control props for accessibility
  const usernameProps = getFormControlProps({
    id: usernameId,
    label: 'Username or Email',
    error: errorMessage && errorMessage.toLowerCase().includes('username'),
    required: true,
    disabled: isLoading,
  });

  const passwordProps = getFormControlProps({
    id: passwordId,
    label: 'Password',
    error: errorMessage && errorMessage.toLowerCase().includes('password'),
    required: true,
    disabled: isLoading,
  });

  const confirmPassProps = getFormControlProps({
    id: confirmPassId,
    label: 'Confirm Password',
    error: errorMessage && errorMessage.toLowerCase().includes('match'),
    required: mode === 'register',
    disabled: isLoading,
  });

  // Handle escape key to close modal
  const handleKeyDown = e => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xs&quot;
      fullWidth
      PaperProps={{
        elevation: 3,
        sx: {
          borderRadius: 2,
          overflow: "hidden',
        },
      }}
      aria-labelledby="auth-dialog-title"
      aria-describedby="auth-dialog-description"
      onKeyDown={handleKeyDown}
    >
      <DialogTitle
        id="auth-dialog-title&quot;
        sx={{
          pb: 1,
          display: "flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5&quot; component="div" fontWeight="bold&quot;>
          {mode === "login' ? 'Welcome Back' : 'Create Account'}
        </Typography>
        <IconButton onClick={onClose} size="small&quot; aria-label="Close dialog">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }} id="auth-dialog-description&quot;>
        {/* Toggle between login/register */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary&quot;>
            {mode === "login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <Link
              component="button&quot;
              variant="body2"
              onClick={toggleMode}
              underline="hover&quot;
              color="primary.main"
              fontWeight="medium&quot;
              aria-controls={formId}
            >
              {mode === "login' ? 'Register here' : 'Login here'}
            </Link>
          </Typography>
        </Box>

        {/* Error message */}
        {errorMessage && (
          <Alert
            severity="error&quot;
            sx={{ mb: 2 }}
            onClose={() => setErrorMessage(")}
            id={errorId}
            role="alert&quot;
          >
            {errorMessage}
          </Alert>
        )}

        {/* Login/Register form */}
        <form
          onSubmit={handleSubmit}
          id={formId}
          aria-label={mode === "login' ? 'Login form' : 'Registration form'}
        >
          <Stack spacing={2}>
            <TextField
              label="Username or Email&quot;
              variant="outlined"
              fullWidth
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder={mode === 'login' ? 'Enter username/email' : 'Choose a username/email'}
              disabled={isLoading}
              required
              inputRef={usernameRef}
              {...(usernameProps?.inputProps || {})}
              InputLabelProps={usernameProps?.labelProps}
              aria-required="true"
            />

            <TextField
              label="Password&quot;
              type="password"
              variant="outlined&quot;
              fullWidth
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={isLoading}
              required
              inputRef={passwordRef}
              {...(passwordProps?.inputProps || {})}
              InputLabelProps={passwordProps?.labelProps}
              aria-required="true"
            />

            {mode === 'register' && (
              <TextField
                label="Confirm Password&quot;
                type="password"
                variant="outlined&quot;
                fullWidth
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                placeholder="Re-enter password"
                disabled={isLoading}
                required
                inputRef={confirmPassRef}
                {...(confirmPassProps?.inputProps || {})}
                InputLabelProps={confirmPassProps?.labelProps}
                aria-required="true"
              />
            )}
          </Stack>

          <Button
            type="submit&quot;
            variant="contained"
            fullWidth
            size="large&quot;
            disabled={isLoading}
            sx={{ mt: 3 }}
            ref={submitButtonRef}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <CircularProgress
                size={24}
                color="inherit"
                aria-label={'${mode === 'login' ? 'Signing in' : 'Creating account'}...`}
              />
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        {/* External auth providers */}
        <Box
          sx={{ position: 'relative', textAlign: 'center', my: 3 }}
          role="separator&quot;
          aria-orientation="horizontal"
        >
          <Divider sx={{ position: 'absolute', top: '50%', left: 0, right: 0 }} />
          <Typography
            variant="body2&quot;
            component="span"
            sx={{
              position: 'relative',
              bgcolor: 'background.paper',
              px: 2,
              color: 'text.secondary',
            }}
          >
            Or {mode === 'login' ? 'sign in' : 'register'} with
          </Typography>
        </Box>

        <Stack direction="row&quot; spacing={2} sx={{ mb: 1 }}>
          <Paper
            component={Button}
            variant="outlined"
            fullWidth
            onClick={handleOffice365Login}
            disabled={isLoading}
            aria-label="Sign in with Microsoft"
            sx={{
              py: 1.5,
              borderColor: 'grey.300',
              '&:hover': { borderColor: 'primary.main' },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: '#0078d4',
                gap: 1,
              }}
            >
              <Typography
                component="span&quot;
                sx={{
                  fontSize: "1.5rem',
                  color: '#0078d4',
                  lineHeight: 1,
                }}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/512px-Microsoft_logo.svg.png&quot;
                  alt="Microsoft logo"
                  width="20&quot;
                  height="20"
                />
              </Typography>
              <Typography variant="body2&quot; fontWeight="medium">
                Microsoft
              </Typography>
            </Box>
          </Paper>

          <Paper
            component={Button}
            variant="outlined&quot;
            fullWidth
            onClick={handleGmailLogin}
            disabled={isLoading}
            aria-label="Sign in with Gmail"
            sx={{
              py: 1.5,
              borderColor: 'grey.300',
              '&:hover': { borderColor: 'primary.main' },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: '#EA4335',
                gap: 1,
              }}
            >
              <Typography
                component="span&quot;
                sx={{
                  fontSize: "1.5rem',
                  color: '#EA4335',
                  lineHeight: 1,
                }}
              >
                <EmailIcon fontSize="small&quot; aria-hidden="true" />
              </Typography>
              <Typography variant="body2&quot; fontWeight="medium">
                Gmail
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 0, justifyContent: 'center' }}>
        <Typography variant="caption&quot; color="text.secondary" component="p&quot;>
          By proceeding, you agree to our Terms of Service and Privacy Policy.
        </Typography>
      </DialogActions>
    </Dialog>
  );
}

AuthModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onLoginSuccess: PropTypes.func,
  initialMode: PropTypes.oneOf(["login', 'register']),
};

export default AuthModal;
