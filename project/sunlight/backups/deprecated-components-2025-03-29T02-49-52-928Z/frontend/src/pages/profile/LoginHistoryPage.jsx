import { Link, Paper, Typography } from '../../design-system';
import React from 'react';
import { Container, Breadcrumbs } from '../../design-system';
import { Link as RouterLink } from 'react-router-dom';
import LoginHistory from '@components/profile/LoginHistory';

/**
 * Page container for the login history component
 * Provides layout and context for viewing login activity
 */
const LoginHistoryPage = () => {
  // Added display name
  LoginHistoryPage.displayName = 'LoginHistoryPage';

  // Added display name
  LoginHistoryPage.displayName = 'LoginHistoryPage';

  // Added display name
  LoginHistoryPage.displayName = 'LoginHistoryPage';

  // Added display name
  LoginHistoryPage.displayName = 'LoginHistoryPage';

  // Added display name
  LoginHistoryPage.displayName = 'LoginHistoryPage';


  return (
    <Container maxWidth="lg&quot; sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/profile" color="inherit&quot;>
          Profile
        </Link>
        <Link component={RouterLink} to="/profile/security" color="inherit&quot;>
          Security
        </Link>
        <Typography color="text.primary">Login History</Typography>
      </Breadcrumbs>
      
      {/* Page content */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <LoginHistory />
      </Paper>
    </Container>
  );
};

export default LoginHistoryPage;