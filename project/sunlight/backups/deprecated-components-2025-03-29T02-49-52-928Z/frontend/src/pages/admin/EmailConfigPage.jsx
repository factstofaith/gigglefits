import {  Box, Link , Box, Link } from '../../design-system';
import React from 'react';
;
;;
import { Link as RouterLink } from 'react-router-dom';
import EmailConfiguration from '@components/admin/EmailConfiguration';
import { Breadcrumbs, Container } from '../../design-system';

/**
 * Page container for the email configuration component
 * Provides layout and context for email settings management
 */
const EmailConfigPage = () => {
  // Added display name
  EmailConfigPage.displayName = 'EmailConfigPage';

  // Added display name
  EmailConfigPage.displayName = 'EmailConfigPage';

  // Added display name
  EmailConfigPage.displayName = 'EmailConfigPage';

  // Added display name
  EmailConfigPage.displayName = 'EmailConfigPage';

  // Added display name
  EmailConfigPage.displayName = 'EmailConfigPage';


  return (
    <Container maxWidth="lg&quot; sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin" color="inherit&quot;>
          Admin
        </Link>
        <Typography color="text.primary">Email Configuration</Typography>
      </Breadcrumbs>
      
      {/* Page content */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <EmailConfiguration />
      </Paper>
    </Container>
  );
};

export default EmailConfigPage;