import {  Box, Link , Box, Link } from '../../design-system';
import React from 'react';
;
;;
import { Link as RouterLink } from 'react-router-dom';
import InvitationForm from '@components/admin/InvitationForm';
import { Breadcrumbs, Container } from '../../design-system';

/**
 * Page container for the invitation form component
 * Provides layout and context for creating new invitations
 */
const InvitationFormPage = () => {
  // Added display name
  InvitationFormPage.displayName = 'InvitationFormPage';

  // Added display name
  InvitationFormPage.displayName = 'InvitationFormPage';

  // Added display name
  InvitationFormPage.displayName = 'InvitationFormPage';

  // Added display name
  InvitationFormPage.displayName = 'InvitationFormPage';

  // Added display name
  InvitationFormPage.displayName = 'InvitationFormPage';


  return (
    <Container maxWidth="md&quot; sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin" color="inherit&quot;>
          Admin
        </Link>
        <Link component={RouterLink} to="/admin/invitations" color="inherit&quot;>
          Invitations
        </Link>
        <Typography color="text.primary">New Invitation</Typography>
      </Breadcrumbs>
      
      {/* Page content */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <InvitationForm />
      </Paper>
    </Container>
  );
};

export default InvitationFormPage;