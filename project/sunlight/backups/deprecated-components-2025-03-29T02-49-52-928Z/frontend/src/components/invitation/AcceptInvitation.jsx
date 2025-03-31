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
;;
import { 
  Email as EmailIcon, 
  Business as MicrosoftIcon,
  Google as GoogleIcon 
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { invitationService } from '@services/userManagementService';
import { Alert, Box, Button, Card, CardActions, CardContent, Container, Divider, Grid, LinearProgress, Paper, Stack, Typography } from '../../design-system';
// Design system import already exists;

/**
 * Component for verifying and accepting invitations
 * This is the landing page when a user clicks on an invitation link
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


  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();
  
  // Verify invitation token on component mount
  useEffect(() => {
    const verifyInvitation = async () => {
      setLoading(true);
      try {
        const response = await invitationService.verifyInvitation(token);
        setInvitation(response.data);
        setError(null);
      } catch (err) {
        console.error('Error verifying invitation:', err);
        if (err.response?.status === 410) {
          // Invitation expired
          setExpired(true);
          setError('This invitation has expired.');
        } else {
          setError(err.response?.data?.message || 'Invalid or expired invitation.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    verifyInvitation();
  }, [token]);
  
  // Handle continue with email
  const handleContinueWithEmail = () => {
  // Added display name
  handleContinueWithEmail.displayName = 'handleContinueWithEmail';

  // Added display name
  handleContinueWithEmail.displayName = 'handleContinueWithEmail';

  // Added display name
  handleContinueWithEmail.displayName = 'handleContinueWithEmail';

  // Added display name
  handleContinueWithEmail.displayName = 'handleContinueWithEmail';

  // Added display name
  handleContinueWithEmail.displayName = 'handleContinueWithEmail';


    // Store the token in session storage for the registration form
    sessionStorage.setItem('invitationToken', token);
    navigate('/invitation/complete');
  };
  
  // Handle continue with Office 365
  const handleContinueWithOffice365 = async () => {
    try {
      setLoading(true);
      // Get the OAuth URL from our backend
      const response = await invitationService.getOffice365AuthUrl(token);
      const { authUrl } = response.data;
      
      // Redirect to Microsoft OAuth page
      window.location.href = authUrl;
    } catch (err) {
      console.error('Error initiating Office 365 OAuth:', err);
      setError(err.response?.data?.message || 'Failed to initiate Office 365 login.');
      setLoading(false);
    }
  };
  
  // Handle continue with Gmail
  const handleContinueWithGmail = async () => {
    try {
      setLoading(true);
      // Get the OAuth URL from our backend
      const response = await invitationService.getGmailAuthUrl(token);
      const { authUrl } = response.data;
      
      // Redirect to Google OAuth page
      window.location.href = authUrl;
    } catch (err) {
      console.error('Error initiating Gmail OAuth:', err);
      setError(err.response?.data?.message || 'Failed to initiate Gmail login.');
      setLoading(false);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="sm&quot; sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: "center' }}>
          <Typography variant="h5&quot; gutterBottom>
            Verifying Invitation
          </Typography>
          <LinearProgress sx={{ mt: 3, mb: 3 }} />
          <Typography variant="body1">
            Please wait while we verify your invitation...
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Container maxWidth="sm&quot; sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: "center' }}>
          <Typography variant="h5&quot; gutterBottom color="error">
            {expired ? 'Invitation Expired' : 'Invalid Invitation'}
          </Typography>
          <Alert severity="error&quot; sx={{ mt: 3, mb: 3 }}>
            {error}
          </Alert>
          <Typography variant="body1" paragraph>
            {expired 
              ? 'This invitation has expired. Please contact the administrator for a new invitation.'
              : 'The invitation link you clicked is invalid. Please check your email for the correct link or contact the administrator.'}
          </Typography>
          <Button variant="contained&quot; color="primary" href="/&quot;>
            Return to Home
          </Button>
        </Paper>
      </Container>
    );
  }
  
  // Render invitation acceptance UI
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        <Typography variant="h4&quot; component="h1" gutterBottom>
          ✉️ Invitation
        </Typography>
        
        <Typography variant="h6&quot; gutterBottom sx={{ mt: 3 }}>
          You"ve been invited to join the TAP Integration Platform
          {invitation?.inviter && ` by ${invitation.inviter}`}.
        </Typography>
        
        <Typography variant="body1&quot; paragraph sx={{ mb: 4 }}>
          To accept this invitation and create your account, please select one of the options below:
        </Typography>
        
        <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined&quot; sx={{ height: "100%' }}>
              <CardContent>
                <MicrosoftIcon fontSize="large&quot; color="primary" />
                <Typography variant="h6&quot; sx={{ mt: 1 }}>
                  Continue with Office 365
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center', pb: 2 }}>
                <Button 
                  variant="contained&quot; 
                  onClick={handleContinueWithOffice365}
                  fullWidth
                >
                  Office 365
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <GoogleIcon fontSize="large&quot; color="error" />
                <Typography variant="h6&quot; sx={{ mt: 1 }}>
                  Continue with Gmail
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center', pb: 2 }}>
                <Button 
                  variant="contained&quot; 
                  onClick={handleContinueWithGmail}
                  fullWidth
                  color="error"
                >
                  Gmail
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card variant="outlined&quot; sx={{ height: "100%' }}>
              <CardContent>
                <EmailIcon fontSize="large&quot; color="action" />
                <Typography variant="h6&quot; sx={{ mt: 1 }}>
                  Continue with Email
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center', pb: 2 }}>
                <Button 
                  variant="contained&quot; 
                  onClick={handleContinueWithEmail}
                  fullWidth
                  color="secondary"
                >
                  Email
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
        
        <Divider sx={{ mt: 2, mb: 3 }} />
        
        <Typography variant="body2&quot; color="text.secondary">
          This invitation expires on: {invitation?.expires_at 
            ? new Date(invitation.expires_at).toLocaleString() 
            : 'Unknown'}
        </Typography>
      </Paper>
    </Container>
  );
};

export default AcceptInvitation;