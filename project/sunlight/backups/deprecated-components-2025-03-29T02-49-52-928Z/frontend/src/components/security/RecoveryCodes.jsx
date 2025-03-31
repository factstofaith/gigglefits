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
import { 
  ContentCopy as ContentCopyIcon,
  GetApp as DownloadIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@contexts/UserContext';
import { Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, IconButton, LinearProgress, Paper, Snackbar, Stack, Typography } from '../../design-system';
// Design system import already exists;
// Design system import already exists;
/**
 * Component for managing MFA recovery codes
 * Allows users to view, copy, download, and regenerate recovery codes
 */
const RecoveryCodes = () => {
  // Added display name
  RecoveryCodes.displayName = 'RecoveryCodes';

  // Added display name
  RecoveryCodes.displayName = 'RecoveryCodes';

  // Added display name
  RecoveryCodes.displayName = 'RecoveryCodes';

  // Added display name
  RecoveryCodes.displayName = 'RecoveryCodes';

  // Added display name
  RecoveryCodes.displayName = 'RecoveryCodes';


  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const navigate = useNavigate();
  const { 
    mfaEnabled, 
    getRecoveryCodes, 
    regenerateRecoveryCodes,
    mfaError, 
    clearMfaError 
  } = useUser();
  
  // Fetch recovery codes on component mount
  useEffect(() => {
    // Redirect if MFA is not enabled
    if (mfaEnabled === false) {
      navigate('/profile/security');
      return;
    }
    
    fetchRecoveryCodes();
  }, [mfaEnabled, navigate]);
  
  // Fetch recovery codes from API
  const fetchRecoveryCodes = async () => {
    setLoading(true);
    try {
      clearMfaError();
      
      const response = await getRecoveryCodes();
      setRecoveryCodes(response.recoveryCodes || []);
    } catch (err) {
      console.error('Error fetching recovery codes:', err);
    } finally {
      setLoading(false);
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
  
  // Open regenerate confirmation dialog
  const handleOpenRegenerateDialog = () => {
  // Added display name
  handleOpenRegenerateDialog.displayName = 'handleOpenRegenerateDialog';

  // Added display name
  handleOpenRegenerateDialog.displayName = 'handleOpenRegenerateDialog';

  // Added display name
  handleOpenRegenerateDialog.displayName = 'handleOpenRegenerateDialog';

  // Added display name
  handleOpenRegenerateDialog.displayName = 'handleOpenRegenerateDialog';

  // Added display name
  handleOpenRegenerateDialog.displayName = 'handleOpenRegenerateDialog';


    setRegenerateDialogOpen(true);
  };
  
  // Close regenerate confirmation dialog
  const handleCloseRegenerateDialog = () => {
  // Added display name
  handleCloseRegenerateDialog.displayName = 'handleCloseRegenerateDialog';

  // Added display name
  handleCloseRegenerateDialog.displayName = 'handleCloseRegenerateDialog';

  // Added display name
  handleCloseRegenerateDialog.displayName = 'handleCloseRegenerateDialog';

  // Added display name
  handleCloseRegenerateDialog.displayName = 'handleCloseRegenerateDialog';

  // Added display name
  handleCloseRegenerateDialog.displayName = 'handleCloseRegenerateDialog';


    setRegenerateDialogOpen(false);
  };
  
  // Handle regenerate recovery codes
  const handleRegenerateRecoveryCodes = async () => {
    setLoading(true);
    try {
      clearMfaError();
      
      // Regenerate recovery codes
      const response = await regenerateRecoveryCodes();
      setRecoveryCodes(response.recoveryCodes || []);
      
      // Close dialog and show success message
      setRegenerateDialogOpen(false);
      setSnackbarMessage('Recovery codes regenerated successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error regenerating recovery codes:', err);
    } finally {
      setLoading(false);
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

  // Added display name
  handleBack.displayName = 'handleBack';

  // Added display name
  handleBack.displayName = 'handleBack';


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

  // Added display name
  handleSnackbarClose.displayName = 'handleSnackbarClose';

  // Added display name
  handleSnackbarClose.displayName = 'handleSnackbarClose';


    setSnackbarOpen(false);
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5&quot; component="h1">
          Recovery Codes
        </Typography>
      </Box>
      
      {/* Loading indicator */}
      {loading && <LinearProgress sx={{ mb: 3 }} />}
      
      {/* Error message */}
      {mfaError && (
        <Alert severity="error&quot; sx={{ mb: 3 }}>
          {mfaError}
        </Alert>
      )}
      
      {/* Important notice */}
      <Alert 
        severity="warning" 
        icon={<WarningIcon />}
        sx={{ mb: 3 }}
      >
        <Typography variant="subtitle2&quot; sx={{ fontWeight: "bold' }}>
          Important: Keep these recovery codes in a safe place
        </Typography>
        <Typography variant="body2&quot;>
          These recovery codes allow you to sign in if you lose access to your authenticator app.
          Each code can only be used once, and they are the only way to regain access to your account
          if you lose your authentication device.
        </Typography>
      </Alert>
      
      {/* Recovery codes display */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Your Recovery Codes
        </Typography>
        
        {recoveryCodes.length === 0 ? (
          <Typography variant="body1&quot; color="text.secondary">
            No recovery codes available. Please regenerate recovery codes.
          </Typography>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {recoveryCodes.map((code, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Card variant="outlined&quot;>
                    <CardContent sx={{ 
                      py: 2, 
                      textAlign: "center',
                      fontFamily: 'monospace',
                      fontSize: '1rem'
                    }}>
                      {code}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="outlined&quot;
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyRecoveryCodes}
              >
                Copy All Codes
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadRecoveryCodes}
              >
                Download as Text
              </Button>
            </Stack>
          </>
        )}
      </Paper>
      
      {/* Regenerate option */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6&quot; gutterBottom>
          Regenerate Recovery Codes
        </Typography>
        
        <Typography variant="body2" color="text.secondary&quot; paragraph>
          If you"ve used up your recovery codes or want to generate new ones for security purposes,
          you can generate new recovery codes. This will invalidate all existing recovery codes.
        </Typography>
        
        <Button
          variant="contained&quot;
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleOpenRegenerateDialog}
          disabled={loading}
        >
          Generate New Codes
        </Button>
      </Paper>
      
      {/* Regenerate confirmation dialog */}
      <Dialog
        open={regenerateDialogOpen}
        onClose={handleCloseRegenerateDialog}
      >
        <DialogTitle>Regenerate Recovery Codes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to regenerate your recovery codes? This will invalidate all existing
            recovery codes. Make sure you have access to your authenticator app before proceeding.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRegenerateDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleRegenerateRecoveryCodes} 
            color="primary&quot; 
            autoFocus
          >
            Regenerate
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="inherit&quot;
            onClick={handleSnackbarClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default RecoveryCodes;