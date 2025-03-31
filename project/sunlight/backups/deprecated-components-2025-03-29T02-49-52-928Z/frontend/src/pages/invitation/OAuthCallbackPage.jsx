// OAuthCallbackPage.jsx
// -----------------------------------------------------------------------------
// Page component to handle OAuth callback and process authentication

import React from 'react';
import OAuthCallback from '@components/invitation/OAuthCallback';
import { Box } from '../../design-system';
import { Box } from '../../design-system';
// Design system import already exists;
;

/**
 * Page component that wraps the OAuth callback handler
 * Processes the redirect URL after OAuth authentication with providers like Office 365 or Gmail
 */
const OAuthCallbackPage = () => {
  // Added display name
  OAuthCallbackPage.displayName = 'OAuthCallbackPage';

  // Added display name
  OAuthCallbackPage.displayName = 'OAuthCallbackPage';

  // Added display name
  OAuthCallbackPage.displayName = 'OAuthCallbackPage';

  // Added display name
  OAuthCallbackPage.displayName = 'OAuthCallbackPage';

  // Added display name
  OAuthCallbackPage.displayName = 'OAuthCallbackPage';


  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <OAuthCallback />
    </Box>
  );
};

export default OAuthCallbackPage;