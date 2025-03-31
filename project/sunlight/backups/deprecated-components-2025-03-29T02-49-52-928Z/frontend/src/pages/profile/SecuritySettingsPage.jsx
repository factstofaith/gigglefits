import { Box, Link, Typography, Paper } from '../../design-system';
import React from 'react';
;
;;
import { Link as RouterLink } from 'react-router-dom';
import SecuritySettings from '@components/profile/SecuritySettings';
import { Breadcrumbs, Container } from '../../design-system';

/**
 * Page container for the security settings component
 * Provides layout and context for managing security settings
 */
const SecuritySettingsPage = () => {
  // Added display name
  SecuritySettingsPage.displayName = 'SecuritySettingsPage';

  // Added display name
  SecuritySettingsPage.displayName = 'SecuritySettingsPage';

  // Added display name
  SecuritySettingsPage.displayName = 'SecuritySettingsPage';

  // Added display name
  SecuritySettingsPage.displayName = 'SecuritySettingsPage';

  // Added display name
  SecuritySettingsPage.displayName = 'SecuritySettingsPage';


  return (
    <Container maxWidth="lg&quot; sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/profile" color="inherit&quot;>
          Profile
        </Link>
        <Typography color="text.primary">Security Settings</Typography>
      </Breadcrumbs>
      
      {/* Page content */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <SecuritySettings />
      </Paper>
    </Container>
  );
};

export default SecuritySettingsPage;