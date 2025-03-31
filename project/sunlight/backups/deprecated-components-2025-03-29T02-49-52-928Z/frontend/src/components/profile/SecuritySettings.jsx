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
;
;
;
;
;
;;
import { 
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon, 
  Cancel as CancelIcon,
  ContentCopy as ContentCopyIcon,
  GetApp as DownloadIcon,
  Refresh as RefreshIcon,
  VerifiedUser as VerifiedUserIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@contexts/UserContext';
import { userService } from '@services/userManagementService';
import { Alert, Box, Button, Card, CardActions, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, IconButton, LinearProgress, List, ListItem, ListItemSecondaryAction, ListItemText, Paper, Snackbar, Typography } from '../../design-system';
// Design system import already exists;
// Design system import already exists;

/**
 * Component for managing user security settings
 * Handles MFA configuration, recovery codes, and password changes
 */
const SecuritySettings = () => {
  // Added display name
  SecuritySettings.displayName = 'SecuritySettings';

  // Added display name
  SecuritySettings.displayName = 'SecuritySettings';

  // Added display name
  SecuritySettings.displayName = 'SecuritySettings';

  // Added display name
  SecuritySettings.displayName = 'SecuritySettings';

  // Added display name
  SecuritySettings.displayName = 'SecuritySettings';


  const [loading, setLoading] = useState(false);
  const [loginHistory, setLoginHistory] = useState([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState(null);
  const [confirmDialogTitle, setConfirmDialogTitle] = useState('');
  const [confirmDialogMessage, setConfirmDialogMessage] = useState('');
  
  const navigate = useNavigate();
  const { 
    user, 
    mfaEnabled, 
    fetchMfaStatus, 
    disableMfa, 
    getRecoveryCodes,
    regenerateRecoveryCodes,
    mfaError,
    clearMfaError
  } = useUser();
  
  // Fetch login history on component mount
  useEffect(() => {
    fetchLoginHistory();
  }, [user]);
  
  // Fetch login history from API
  const fetchLoginHistory = async () => {
    if (!user?.id) return;
    
    try {
      const response = await userService.getLoginHistory(user.id, { limit: 5 });
      setLoginHistory(response.data.history || []);
    } catch (err) {
      console.error('Error fetching login history:', err);
    }
  };
  
  // Handle MFA setup button click
  const handleSetupMFA = () => {
  // Added display name
  handleSetupMFA.displayName = 'handleSetupMFA';

  // Added display name
  handleSetupMFA.displayName = 'handleSetupMFA';

  // Added display name
  handleSetupMFA.displayName = 'handleSetupMFA';

  // Added display name
  handleSetupMFA.displayName = 'handleSetupMFA';

  // Added display name
  handleSetupMFA.displayName = 'handleSetupMFA';


    navigate('/mfa/setup');
  };
  
  // Handle view recovery codes button click
  const handleViewRecoveryCodes = async () => {
    setLoading(true);
    try {
      clearMfaError();
      
      const response = await getRecoveryCodes();
      setRecoveryCodes(response.recoveryCodes);
      setShowRecoveryCodes(true);
    } catch (err) {
      console.error('Error fetching recovery codes:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle regenerate recovery codes button click
  const handleRegenerateCodesConfirm = () => {
  // Added display name
  handleRegenerateCodesConfirm.displayName = 'handleRegenerateCodesConfirm';

  // Added display name
  handleRegenerateCodesConfirm.displayName = 'handleRegenerateCodesConfirm';

  // Added display name
  handleRegenerateCodesConfirm.displayName = 'handleRegenerateCodesConfirm';

  // Added display name
  handleRegenerateCodesConfirm.displayName = 'handleRegenerateCodesConfirm';

  // Added display name
  handleRegenerateCodesConfirm.displayName = 'handleRegenerateCodesConfirm';


    setConfirmDialogTitle('Regenerate Recovery Codes');
    setConfirmDialogMessage(
      'Are you sure you want to regenerate your recovery codes? Your existing codes will be invalidated.'
    );
    setConfirmDialogAction(() => handleRegenerateRecoveryCodes);
    setConfirmDialogOpen(true);
  };
  
  // Handle regenerate recovery codes
  const handleRegenerateRecoveryCodes = async () => {
    setLoading(true);
    try {
      clearMfaError();
      
      const response = await regenerateRecoveryCodes();
      setRecoveryCodes(response.recoveryCodes);
      setShowRecoveryCodes(true);
      
      // Show success message
      setSnackbarMessage('Recovery codes regenerated successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error regenerating recovery codes:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle disable MFA button click
  const handleDisableMFAConfirm = () => {
  // Added display name
  handleDisableMFAConfirm.displayName = 'handleDisableMFAConfirm';

  // Added display name
  handleDisableMFAConfirm.displayName = 'handleDisableMFAConfirm';

  // Added display name
  handleDisableMFAConfirm.displayName = 'handleDisableMFAConfirm';

  // Added display name
  handleDisableMFAConfirm.displayName = 'handleDisableMFAConfirm';

  // Added display name
  handleDisableMFAConfirm.displayName = 'handleDisableMFAConfirm';


    setConfirmDialogTitle('Disable Two-Factor Authentication');
    setConfirmDialogMessage(
      'Are you sure you want to disable two-factor authentication? This will reduce the security of your account.'
    );
    setConfirmDialogAction(() => handleDisableMFA);
    setConfirmDialogOpen(true);
  };
  
  // Handle disable MFA
  const handleDisableMFA = async () => {
    setLoading(true);
    try {
      clearMfaError();
      
      await disableMfa();
      
      // Refresh MFA status
      await fetchMfaStatus();
      
      // Show success message
      setSnackbarMessage('Two-factor authentication disabled successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error disabling MFA:', err);
    } finally {
      setLoading(false);
    }
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
  
  // Handle recovery codes dialog close
  const handleRecoveryCodesClose = () => {
  // Added display name
  handleRecoveryCodesClose.displayName = 'handleRecoveryCodesClose';

  // Added display name
  handleRecoveryCodesClose.displayName = 'handleRecoveryCodesClose';

  // Added display name
  handleRecoveryCodesClose.displayName = 'handleRecoveryCodesClose';

  // Added display name
  handleRecoveryCodesClose.displayName = 'handleRecoveryCodesClose';

  // Added display name
  handleRecoveryCodesClose.displayName = 'handleRecoveryCodesClose';


    setShowRecoveryCodes(false);
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
    
    setSnackbarMessage('Recovery codes copied to clipboard');
    setSnackbarOpen(true);
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
    
    setSnackbarMessage('Recovery codes downloaded');
    setSnackbarOpen(true);
  };
  
  // Handle change password button click
  const handleChangePassword = () => {
  // Added display name
  handleChangePassword.displayName = 'handleChangePassword';

  // Added display name
  handleChangePassword.displayName = 'handleChangePassword';

  // Added display name
  handleChangePassword.displayName = 'handleChangePassword';

  // Added display name
  handleChangePassword.displayName = 'handleChangePassword';

  // Added display name
  handleChangePassword.displayName = 'handleChangePassword';


    navigate('/profile/change-password');
  };
  
  // Handle view full login history button click
  const handleViewFullHistory = () => {
  // Added display name
  handleViewFullHistory.displayName = 'handleViewFullHistory';

  // Added display name
  handleViewFullHistory.displayName = 'handleViewFullHistory';

  // Added display name
  handleViewFullHistory.displayName = 'handleViewFullHistory';

  // Added display name
  handleViewFullHistory.displayName = 'handleViewFullHistory';

  // Added display name
  handleViewFullHistory.displayName = 'handleViewFullHistory';


    navigate('/profile/login-history');
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
  // Added display name
  handleSnackbarClose.displayName = 'handleSnackbarClose';

  // Added display name
  handleSnackbarClose.displayName = 'handleSnackbarClose';

  // Added display name
  handleSnackbarClose.displayName = 'handleSnackbarClose';

  // Added display name
  handleSnackbarClose.displayName = 'handleSnackbarClose';

  // Added display name
  handleSnackbarClose.displayName = 'handleSnackbarClose';


    setSnackbarOpen(false);
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
  
  return (
    <Box>
      <Typography variant="h5&quot; component="h1" gutterBottom>
        Security Settings
      </Typography>
      
      {/* Loading indicator */}
      {loading && <LinearProgress sx={{ mb: 3 }} />}
      
      {/* MFA error */}
      {mfaError && (
        <Alert severity="error&quot; sx={{ mb: 3 }}>
          {mfaError}
        </Alert>
      )}
      
      {/* Two-Factor Authentication */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Two-Factor Authentication
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined&quot;>
              <CardContent>
                <Box sx={{ display: "flex', alignItems: 'center', mb: 2 }}>
                  <SecurityIcon color="primary&quot; sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {mfaEnabled ? 'Enabled' : 'Not Enabled'}
                  </Typography>
                </Box>
                
                <Typography variant="body2&quot; color="text.secondary">
                  {mfaEnabled 
                    ? 'Your account is protected with two-factor authentication. You will need to enter a verification code from your authenticator app when you sign in.'
                    : 'Two-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password.'}
                </Typography>
              </CardContent>
              <CardActions>
                {mfaEnabled ? (
                  <>
                    <Button 
                      size="small&quot; 
                      onClick={handleViewRecoveryCodes}
                      startIcon={<VerifiedUserIcon />}
                    >
                      View Recovery Codes
                    </Button>
                    <Button 
                      size="small" 
                      color="error&quot; 
                      onClick={handleDisableMFAConfirm}
                      startIcon={<CancelIcon />}
                    >
                      Disable
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="small" 
                    color="primary&quot; 
                    onClick={handleSetupMFA}
                    startIcon={<CheckCircleIcon />}
                  >
                    Enable
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
          
          {mfaEnabled && (
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <RefreshIcon color="primary&quot; sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Recovery Codes
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2&quot; color="text.secondary">
                    Recovery codes allow you to access your account if you lose your phone or cannot use your authenticator app. Each code can only be used once.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small&quot; 
                    onClick={handleRegenerateCodesConfirm}
                  >
                    Regenerate Codes
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )}
        </Grid>
      </Paper>
      
      {/* Password Settings */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Password
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2&quot; color="text.secondary">
            It's a good practice to change your password periodically and to use a unique password for different accounts.
          </Typography>
        </Box>
        
        <Button 
          variant="outlined&quot;
          onClick={handleChangePassword}
        >
          Change Password
        </Button>
      </Paper>
      
      {/* Login History */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6&quot; gutterBottom>
            Recent Login Activity
          </Typography>
          
          <Button 
            variant="text"
            endIcon={<HistoryIcon />}
            onClick={handleViewFullHistory}
          >
            View Full History
          </Button>
        </Box>
        
        {loginHistory.length === 0 ? (
          <Typography variant="body2&quot; color="text.secondary">
            No recent login activity
          </Typography>
        ) : (
          <List>
            {loginHistory.map((entry, index) => (
              <ListItem 
                key={index} 
                divider={index < loginHistory.length - 1}
                sx={{ py: 1 }}
              >
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
      </Paper>
      
      {/* Recovery Codes Dialog */}
      <Dialog
        open={showRecoveryCodes}
        onClose={handleRecoveryCodesClose}
        maxWidth="sm&quot;
        fullWidth
      >
        <DialogTitle>Recovery Codes</DialogTitle>
        <DialogContent>
          <DialogContentText color="error" paragraph>
            <strong>Important:</strong> Keep these codes in a safe place. Each code can only be used once to log in if you lose access to your authenticator app.
          </DialogContentText>
          
          <Paper variant="outlined&quot; sx={{ p: 2, mb: 2, bgcolor: "background.default' }}>
            <Grid container spacing={2}>
              {recoveryCodes.map((code, index) => (
                <Grid item xs={6} sm={4} key={index}>
                  <Typography variant="body2&quot; fontFamily="monospace">
                    {code}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="outlined&quot;
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyRecoveryCodes}
            >
              Copy
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadRecoveryCodes}
            >
              Download
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRecoveryCodesClose}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirmation Dialog */}
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
          <Button onClick={handleConfirmDialogCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDialogConfirm} 
            color="primary&quot; 
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for success messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="inherit&quot;
            onClick={handleSnackbarClose}
          >
            <CancelIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default SecuritySettings;