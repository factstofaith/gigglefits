import {  Box, Link , Box, Link } from '../../design-system';
import React from 'react';
;
;;
import { Link as RouterLink } from 'react-router-dom';
import MFASettings from '@components/admin/MFASettings';
import { Breadcrumbs, Container } from '../../design-system';

/**
 * Page container for the MFA settings component
 * Provides layout and context for administrators to manage system-wide MFA policies
 */
const MFASettingsPage = () => {
  // Added display name
  MFASettingsPage.displayName = 'MFASettingsPage';

  // Added display name
  MFASettingsPage.displayName = 'MFASettingsPage';

  // Added display name
  MFASettingsPage.displayName = 'MFASettingsPage';

  // Added display name
  MFASettingsPage.displayName = 'MFASettingsPage';

  // Added display name
  MFASettingsPage.displayName = 'MFASettingsPage';


  return (
    <Container maxWidth="lg&quot; sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin" color="inherit&quot;>
          Admin
        </Link>
        <Typography color="text.primary">MFA Settings</Typography>
      </Breadcrumbs>
      
      {/* Page content */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <MFASettings />
      </Paper>
    </Container>
  );
};

export default MFASettingsPage;