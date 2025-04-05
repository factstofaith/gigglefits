
import {
  ErrorBoundary,
  useErrorHandler,
  withErrorBoundary } from "@/error-handling/";
import React from 'react';import { Container, Typography, Box, Paper, Tabs, Tab, TextField, Button } from "@/design-system/optimized";import { useUser } from "@/contexts/UserContext";import { useNotification } from "@/contexts/NotificationContext"; /**
* User Settings Page - Allows users to manage their profile and settings
*/import { useHealthCheckHandler } from "@/error-handling/docker";import { HealthCheckProvider } from "@/error-handling/docker";
const UserSettingsPage = () => {
  const { state: user } = useUser();
  const { setState: setNotification } = useNotification();
  const [activeTab, setActiveTab] = React.useState(0);
  const [profile, setProfile] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProfileChange = (field) => (event) => {
    setProfile({
      ...profile,
      [field]: event.target.value
    });
  };

  const handleSaveProfile = () => {
    // In a real app, this would save to backend
    setNotification({
      type: 'success',
      message: 'Profile updated successfully',
      open: true
    });
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Settings
        </Typography>
        
        <Paper sx={{ mb: 4 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="settings tabs">
            <Tab label="Profile" />
            <Tab label="Preferences" />
            <Tab label="Security" />
            <Tab label="API Keys" />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {activeTab === 0 &&
            <Box
              component="form"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                maxWidth: 600
              }}>

                <Typography variant="h6" gutterBottom>
                  User Profile
                </Typography>
                
                <TextField
                label="Name"
                value={profile.name}
                onChange={handleProfileChange('name')}
                fullWidth />

                
                <TextField
                label="Email"
                value={profile.email}
                onChange={handleProfileChange('email')}
                fullWidth />

                
                <TextField
                label="Phone"
                value={profile.phone}
                onChange={handleProfileChange('phone')}
                fullWidth />

                
                <Box sx={{ mt: 2 }}>
                  <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveProfile}>

                    Save Profile
                  </Button>
                </Box>
              </Box>}

            
            {activeTab === 1 &&
            <Box>
                <Typography variant="h6" gutterBottom>
                  User Preferences
                </Typography>
                <Typography paragraph>
                  Configure interface and notification preferences.
                </Typography>
              </Box>}

            
            {activeTab === 2 &&
            <Box>
                <Typography variant="h6" gutterBottom>
                  Security Settings
                </Typography>
                <Typography paragraph>
                  Manage password, MFA, and account security.
                </Typography>
              </Box>}

            
            {activeTab === 3 &&
            <Box>
                <Typography variant="h6" gutterBottom>
                  API Keys
                </Typography>
                <Typography paragraph>
                  Manage API keys for programmatic access.
                </Typography>
              </Box>}

          </Box>
        </Paper>
      </Box>
    </Container>);

};

UserSettingsPage;const UserSettingsPageWithErrorBoundary = (props) => <ErrorBoundary boundary="UserSettingsPage" fallback={({ error, resetError }) => <div className="error-container">
            <h3>Error in UserSettingsPage</h3>
            <p>{error.message}</p>
            <button onClick={resetError}>Retry</button>
          </div>}>
        <UserSettingsPage {...props} />
      </ErrorBoundary>;export default UserSettingsPageWithErrorBoundary;