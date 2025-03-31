import {  Box, Link , Box, Link } from '../../design-system';
import React from 'react';
;
;;
import { Link as RouterLink } from 'react-router-dom';
import InvitationList from '@components/admin/InvitationList';
import { Breadcrumbs, Container } from '../../design-system';

/**
 * Page container for the invitation list component
 * Provides layout and context for the invitation management interface
 */
const InvitationListPage = () => {
  // Added display name
  InvitationListPage.displayName = 'InvitationListPage';

  // Added display name
  InvitationListPage.displayName = 'InvitationListPage';

  // Added display name
  InvitationListPage.displayName = 'InvitationListPage';

  // Added display name
  InvitationListPage.displayName = 'InvitationListPage';

  // Added display name
  InvitationListPage.displayName = 'InvitationListPage';


  return (
    <Container maxWidth="lg&quot; sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin" color="inherit&quot;>
          Admin
        </Link>
        <Typography color="text.primary">Invitations</Typography>
      </Breadcrumbs>
      
      {/* Page content */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <InvitationList />
      </Paper>
    </Container>
  );
};

export default InvitationListPage;