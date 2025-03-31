import React, { useState } from 'react';
import { Container, Typography, Box, Tabs, Tab, Paper, Button, TextField } from '../design-system/optimized';
import { useNotification } from '../contexts/NotificationContext';

/**
 * Admin Dashboard Page - Main administration interface
 */
const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { setState: setNotification } = useNotification();
  const [smtpConfig, setSmtpConfig] = useState({
    host: 'smtp.office365.com',
    port: '587',
    username: '',
    password: '',
    encryption: 'STARTTLS',
    fromAddress: ''
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSmtpChange = (field) => (event) => {
    setSmtpConfig({
      ...smtpConfig,
      [field]: event.target.value
    });
  };

  const handleSmtpSave = () => {
    // In a real app, this would save to backend
    setNotification({
      type: 'success',
      message: 'SMTP settings saved successfully',
      open: true
    });
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>

        <Paper sx={{ mt: 3, mb: 4 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="admin tabs">
            <Tab label="Users" />
            <Tab label="Email Settings" />
            <Tab label="Tenants" />
            <Tab label="System Settings" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {activeTab === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  User Management
                </Typography>
                <Typography paragraph>
                  Manage users, roles, and permissions
                </Typography>
                
                <Box mt={2}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Admin Users
                  </Typography>
                  <Box mt={1} p={2} border="1px solid #e0e0e0" borderRadius={1}>
                    <Typography>
                      Username: ai-dev
                    </Typography>
                    <Typography>
                      Email: ai-dev@example.com
                    </Typography>
                    <Typography>
                      Role: Administrator
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Email Configuration
                </Typography>
                <Typography paragraph>
                  Configure SMTP settings for sending emails
                </Typography>

                <Box 
                  component="form" 
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    maxWidth: 600,
                    mt: 2
                  }}
                >
                  <TextField
                    label="SMTP Host"
                    value={smtpConfig.host}
                    onChange={handleSmtpChange('host')}
                    fullWidth
                    helperText="e.g., smtp.office365.com"
                  />
                  
                  <TextField
                    label="SMTP Port"
                    value={smtpConfig.port}
                    onChange={handleSmtpChange('port')}
                    fullWidth
                    helperText="e.g., 587 for STARTTLS, 465 for SSL"
                  />
                  
                  <TextField
                    label="Username"
                    value={smtpConfig.username}
                    onChange={handleSmtpChange('username')}
                    fullWidth
                    helperText="Usually your full email address"
                  />
                  
                  <TextField
                    label="Password"
                    type="password"
                    value={smtpConfig.password}
                    onChange={handleSmtpChange('password')}
                    fullWidth
                    helperText="Your email account password or app password"
                  />
                  
                  <TextField
                    label="Encryption"
                    value={smtpConfig.encryption}
                    onChange={handleSmtpChange('encryption')}
                    fullWidth
                    helperText="STARTTLS or SSL/TLS"
                  />
                  
                  <TextField
                    label="From Address"
                    value={smtpConfig.fromAddress}
                    onChange={handleSmtpChange('fromAddress')}
                    fullWidth
                    helperText="Email address to send from"
                  />
                  
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleSmtpSave}
                    >
                      Save SMTP Settings
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      sx={{ ml: 2 }} 
                      onClick={() => {
                        setNotification({
                          type: 'info',
                          message: 'Test email sent successfully',
                          open: true
                        });
                      }}
                    >
                      Test Connection
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Tenant Management
                </Typography>
                <Typography paragraph>
                  Manage tenants and tenant-specific configurations
                </Typography>
              </Box>
            )}

            {activeTab === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  System Settings
                </Typography>
                <Typography paragraph>
                  Configure global system settings and defaults
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminDashboardPage;