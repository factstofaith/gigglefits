import { Box, Typography } from '../../design-system';
import React from 'react';
import { Container } from '../../design-system';
import MFAVerification from '@components/security/MFAVerification';
import { Box } from '../../design-system';
// Design system import already exists;
;
/**
 * Page wrapper for the MFA verification component
 * Provides layout and additional context for the verification process
 */
const MFAVerificationPage = () => {
  // Added display name
  MFAVerificationPage.displayName = 'MFAVerificationPage';

  // Added display name
  MFAVerificationPage.displayName = 'MFAVerificationPage';

  // Added display name
  MFAVerificationPage.displayName = 'MFAVerificationPage';

  // Added display name
  MFAVerificationPage.displayName = 'MFAVerificationPage';

  // Added display name
  MFAVerificationPage.displayName = 'MFAVerificationPage';


  return (
    <Container maxWidth="lg&quot;>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1&quot; gutterBottom align="center">
          Security Verification
        </Typography>
        <Typography variant="body1&quot; paragraph align="center" sx={{ mb: 4 }}>
          Please complete the two-factor authentication process to continue
        </Typography>
        
        <MFAVerification />
      </Box>
    </Container>
  );
};

export default MFAVerificationPage;