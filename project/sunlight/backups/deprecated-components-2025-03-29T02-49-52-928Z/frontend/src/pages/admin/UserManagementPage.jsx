import { Box, Link, Typography, Paper } from '../../design-system';
import React from 'react';
;
;
import { Link as RouterLink } from 'react-router-dom';
import UserManagement from '@components/admin/UserManagement';
import { Breadcrumbs, Container } from '../../design-system';

/**
 * Page container for the user management component
 * Provides layout and context for the user management interface
 */
const UserManagementPage = () => {
  // Added display name
  UserManagementPage.displayName = 'UserManagementPage';

  // Added display name
  UserManagementPage.displayName = 'UserManagementPage';

  // Added display name
  UserManagementPage.displayName = 'UserManagementPage';

  // Added display name
  UserManagementPage.displayName = 'UserManagementPage';

  // Added display name
  UserManagementPage.displayName = 'UserManagementPage';


  return (
    <Container maxWidth="lg&quot; sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin" color="inherit&quot;>
          Admin
        </Link>
        <Typography color="text.primary">User Management</Typography>
      </Breadcrumbs>
      
      {/* Page content */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <UserManagement />
      </Paper>
    </Container>
  );
};

export default UserManagementPage;