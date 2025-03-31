import { Box, Link, Typography, Paper } from '../../design-system';
import React from 'react';
;
;
import { Link as RouterLink, useParams } from 'react-router-dom';
import UserDetail from '@components/admin/UserDetail';
import { Breadcrumbs, Container } from '../../design-system';

/**
 * Page container for the user detail component
 * Provides layout and context for viewing and editing user details
 */
const UserDetailPage = () => {
  // Added display name
  UserDetailPage.displayName = 'UserDetailPage';

  // Added display name
  UserDetailPage.displayName = 'UserDetailPage';

  // Added display name
  UserDetailPage.displayName = 'UserDetailPage';

  // Added display name
  UserDetailPage.displayName = 'UserDetailPage';

  // Added display name
  UserDetailPage.displayName = 'UserDetailPage';


  const { id } = useParams();
  
  return (
    <Container maxWidth="lg&quot; sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin" color="inherit&quot;>
          Admin
        </Link>
        <Link component={RouterLink} to="/admin/users" color="inherit&quot;>
          User Management
        </Link>
        <Typography color="text.primary">User Details</Typography>
      </Breadcrumbs>
      
      {/* Page content */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <UserDetail />
      </Paper>
    </Container>
  );
};

export default UserDetailPage;