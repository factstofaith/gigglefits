import { Typography, Paper } from '../../design-system';
import React from 'react';
import { Container, Breadcrumbs } from '../../design-system';
import UserProfile from '@components/profile/UserProfile';

/**
 * Page container for the user profile component
 * Provides layout and context for viewing and editing user profile information
 */
const UserProfilePage = () => {
  // Added display name
  UserProfilePage.displayName = 'UserProfilePage';

  // Added display name
  UserProfilePage.displayName = 'UserProfilePage';

  // Added display name
  UserProfilePage.displayName = 'UserProfilePage';

  // Added display name
  UserProfilePage.displayName = 'UserProfilePage';

  // Added display name
  UserProfilePage.displayName = 'UserProfilePage';


  return (
    <Container maxWidth="lg&quot; sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Typography color="text.primary">Profile</Typography>
      </Breadcrumbs>
      
      {/* Page content */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <UserProfile />
      </Paper>
    </Container>
  );
};

export default UserProfilePage;