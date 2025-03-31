import { Link, Typography, Paper } from '../../design-system';
import React from 'react';
import { Container, Breadcrumbs } from '../../design-system';
import { Link as RouterLink } from 'react-router-dom';
import MFAEnrollment from '@components/security/MFAEnrollment';

/**
 * Page wrapper for the MFA enrollment component
 * Provides layout and context for setting up two-factor authentication
 */
const MFAEnrollmentPage = () => {
  // Added display name
  MFAEnrollmentPage.displayName = 'MFAEnrollmentPage';

  // Added display name
  MFAEnrollmentPage.displayName = 'MFAEnrollmentPage';

  // Added display name
  MFAEnrollmentPage.displayName = 'MFAEnrollmentPage';

  // Added display name
  MFAEnrollmentPage.displayName = 'MFAEnrollmentPage';

  // Added display name
  MFAEnrollmentPage.displayName = 'MFAEnrollmentPage';


  return (
    <Container maxWidth="md&quot; sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/profile" color="inherit&quot;>
          Profile
        </Link>
        <Link component={RouterLink} to="/profile/security" color="inherit&quot;>
          Security
        </Link>
        <Typography color="text.primary">Two-Factor Authentication</Typography>
      </Breadcrumbs>
      
      {/* Page content */}
      <MFAEnrollment />
    </Container>
  );
};

export default MFAEnrollmentPage;