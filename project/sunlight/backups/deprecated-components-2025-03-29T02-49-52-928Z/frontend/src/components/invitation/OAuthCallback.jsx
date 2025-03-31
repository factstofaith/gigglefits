import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Container, LinearProgress, Alert } from '../../design-system';
import { invitationService } from '@services/userManagementService';
// Design system import already exists;
// Design system import already exists;
// Removed duplicate import
// Removed duplicate import
/**
 * Component to handle OAuth callback and complete authentication
 * This component processes the callback from Office 365 or Gmail OAuth
 */
const OAuthCallback = () => {
  // Added display name
  OAuthCallback.displayName = 'OAuthCallback';

  // Added display name
  OAuthCallback.displayName = 'OAuthCallback';

  // Added display name
  OAuthCallback.displayName = 'OAuthCallback';

  // Added display name
  OAuthCallback.displayName = 'OAuthCallback';

  // Added display name
  OAuthCallback.displayName = 'OAuthCallback';


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { provider } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const completeOAuth = async () => {
      try {
        // Parse query parameters from the URL
        const query = new URLSearchParams(location.search);
        const code = query.get('code');
        const state = query.get('state');
        const error = query.get('error');
        
        // Check for OAuth errors
        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }
        
        if (!code) {
          throw new Error('No authorization code received');
        }
        
        // Parse state parameter which contains the invitation token
        if (!state) {
          throw new Error('Invalid state parameter');
        }
        
        // Extract invitation token from state
        const token = state.split('_')[0]; // Format: token_randomString
        
        // Exchange code for token and complete authentication
        const response = await invitationService.completeOAuthAuthentication(
          provider, code, token, state
        );
        
        // Store authentication token
        localStorage.setItem('token', response.data.token);
        
        // Check if MFA enrollment is required
        if (response.data.requiresMFA) {
          navigate('/mfa/setup');
        } else {
          // Redirect to home page or welcome page
          navigate('/welcome');
        }
        
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Authentication failed. Please try again.');
        setLoading(false);
      }
    };
    
    completeOAuth();
  }, [provider, location, navigate]);
  
  // Show loading UI while processing
  if (loading) {
    return (
      <Container maxWidth="sm&quot; sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: "center' }}>
          <Typography variant="h5&quot; gutterBottom>
            Completing Authentication
          </Typography>
          <LinearProgress sx={{ mt: 3, mb: 3 }} />
          <Typography variant="body1">
            Please wait while we complete your authentication...
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  // Show error UI if there's an error
  return (
    <Container maxWidth="sm&quot; sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, textAlign: "center' }}>
        <Typography variant="h5&quot; gutterBottom color="error">
          Authentication Failed
        </Typography>
        <Alert severity="error&quot; sx={{ mt: 3, mb: 3 }}>
          {error}
        </Alert>
        <Typography variant="body1" paragraph>
          There was a problem completing your authentication. You can try again or use a different sign-in method.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2&quot; color="text.secondary">
            <a href="/">Return to home page</a>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default OAuthCallback;