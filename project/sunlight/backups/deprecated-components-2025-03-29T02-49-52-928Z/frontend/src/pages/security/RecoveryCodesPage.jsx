import { Link, Typography, Paper } from '../../design-system';
import React from 'react';
import { Container, Breadcrumbs } from '../../design-system';
import { Link as RouterLink } from 'react-router-dom';
import RecoveryCodes from '@components/security/RecoveryCodes';

/**
 * Page container for the recovery codes component
 * Provides layout and context for managing MFA recovery codes
 */
const RecoveryCodesPage = () => {
  // Added display name
  RecoveryCodesPage.displayName = 'RecoveryCodesPage';

  // Added display name
  RecoveryCodesPage.displayName = 'RecoveryCodesPage';

  // Added display name
  RecoveryCodesPage.displayName = 'RecoveryCodesPage';

  // Added display name
  RecoveryCodesPage.displayName = 'RecoveryCodesPage';

  // Added display name
  RecoveryCodesPage.displayName = 'RecoveryCodesPage';


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
        <Typography color="text.primary">Recovery Codes</Typography>
      </Breadcrumbs>
      
      {/* Page content */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <RecoveryCodes />
      </Paper>
    </Container>
  );
};

export default RecoveryCodesPage;