// UserProfile.jsx
// -----------------------------------------------------------------------------
// User profile settings component
// Migrated to use design system components

import React, { useState, useEffect } from 'react';
import { Box } from '../../design-system';
import { Typography, Button } from '../../design-system';
import { TextField, Select, Switch, FormField } from '../../design-system';
import { Avatar, Chip } from '../../design-system';
import { CircularProgress, Alert } from '../../design-system';
import { Card } from '../../design-system';
import { useTheme } from '@design-system/foundations/theme';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import EmailIcon from '@mui/icons-material/Email';
import NotificationsIcon from '@mui/icons-material/Notifications';
import authService from '@services/authService';
// Design system import already exists;
// Removed duplicate import
const UserProfile = () => {
  // Added display name
  UserProfile.displayName = 'UserProfile';

  // Added display name
  UserProfile.displayName = 'UserProfile';

  // Added display name
  UserProfile.displayName = 'UserProfile';

  // Added display name
  UserProfile.displayName = 'UserProfile';

  // Added display name
  UserProfile.displayName = 'UserProfile';


  const { theme } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  // Profile edit state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    jobTitle: '',
    department: '',
    phone: '',
    timezone: 'UTC',
    notificationPreferences: {
      emailNotifications: true,
      integrationRunAlerts: true,
      integrationErrorAlerts: true,
      systemUpdates: false,
      weeklyDigest: true,
    },
  });

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const user = await authService.getCurrentUser();
        setCurrentUser(user);

        // Initialize profile form with user data
        if (user) {
          setProfile({
            name: user.name || '',
            email: user.email || '',
            jobTitle: user.jobTitle || '',
            department: user.department || '',
            phone: user.phone || '',
            timezone: user.timezone || 'UTC',
            notificationPreferences: user.notificationPreferences || {
              emailNotifications: true,
              integrationRunAlerts: true,
              integrationErrorAlerts: true,
              systemUpdates: false,
              weeklyDigest: true,
            },
          });
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to load user profile data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle profile update
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);

      // In a real app, this would call an API to update the user profile
      // For now we just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local user data
      const updatedUser = { ...currentUser, ...profile };
      setCurrentUser(updatedUser);

      // Show success message
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      setSaving(false);
    } catch (err) {
      setError('Failed to update profile');
      setSaving(false);
    }
  };

  // Handle input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  // Handle notification preference changes
  const handleNotificationChange = e => {
    const { name, checked } = e.target;
    setProfile({
      ...profile,
      notificationPreferences: {
        ...profile.notificationPreferences,
        [name]: checked,
      },
    });
  };

  // Define timezones
  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];

  // Show loading state
  if (loading) {
    return (
      <Box style={{ }
        display: 'flex', 
        justifyContent: 'center', 
        padding: theme?.spacing?.xl || '32px' 
      }}></Box>
        <CircularProgress size="large&quot; />
      </Box>
    );
  }

  return (
    <Card style={{ borderRadius: theme?.borderRadius?.md || "8px' }}></Card>
      <Box style={{ padding: theme?.spacing?.md || '16px', paddingBottom: 0 }}></Box>
        <Typography variant="h6&quot;>User Profile</Typography>
        <Typography 
          variant="body2" 
          style={{ color: theme?.colors?.text?.secondary || '#666' }}
        ></Typography>
          Manage your account information and preferences
        </Typography>
      </Box>

      <Box 
        style={{ }
          height: '1px', 
          backgroundColor: theme?.colors?.divider || '#e0e0e0', 
          marginTop: theme?.spacing?.md || '16px' 
        }} />

      <Box style={{ padding: theme?.spacing?.md || '16px' }}></Box>
        {error && (
          <Alert 
            severity="error&quot; 
            style={{ marginBottom: theme?.spacing?.md || "16px' }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success&quot; 
            style={{ marginBottom: theme?.spacing?.md || "16px' }}
          >
            Profile updated successfully!
          </Alert>
        )}

        <Box style={{ marginBottom: theme?.spacing?.md || '16px' }}></Box>
          <div style={{ }
            display: 'grid', 
            gridTemplateColumns: 'repeat(12, 1fr)', 
            gap: theme?.spacing?.md || '16px' 
          }}>
            <div style={{ }
              gridColumn: { xs: 'span 12', md: 'span 3' }, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center' 
            }}>
              <Avatar
                size="large&quot;
                style={{}
                  width: "100px',
                  height: '100px',
                  fontSize: '2.5rem',
                  marginBottom: theme?.spacing?.md || '16px',
                }}
              >
                {profile.name?.charAt(0) || 'U'}
              </Avatar>
              <Typography variant="subtitle1&quot; style={{ fontWeight: "bold' }}></Typography>
                {profile.name}
              </Typography>
              <Typography 
                variant="body2&quot; 
                style={{ color: theme?.colors?.text?.secondary || "#666' }}
              ></Typography>
                {profile.email}
              </Typography>
              {currentUser?.role === 'admin' && (
                <Chip 
                  label="Admin&quot; 
                  size="small" 
                  style={{ }
                    marginTop: theme?.spacing?.sm || '8px',
                    backgroundColor: theme?.colors?.primary?.main || '#1976d2',
                    color: '#fff'
                  }} 
                />
              )}
              <Button 
                variant="outlined&quot; 
                size="small" 
                style={{ marginTop: theme?.spacing?.md || '16px' }}
              ></Button>
                Change Picture
              </Button>
            </div>

            <div style={{ gridColumn: { xs: 'span 12', md: 'span 9' } }}>
              <Box
                style={{}
                  display: 'flex',
                  borderBottom: `1px solid ${theme?.colors?.divider || '#e0e0e0'}`,
                  marginBottom: theme?.spacing?.md || '16px',
                }}
              ></Box>
                <Button
                  variant="text&quot;
                  onClick={() =></Button> setActiveTab("general')}
                  style={{}
                    marginRight: theme?.spacing?.md || '16px',
                    paddingBottom: theme?.spacing?.sm || '8px',
                    borderBottom: activeTab === 'general' ? `2px solid ${theme?.colors?.primary?.main || '#1976d2'}` : 'none',
                    borderRadius: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme?.spacing?.xs || '4px',
                  }}
                >
                  <PersonIcon style={{ fontSize: '20px' }} /> General
                </Button>
                <Button
                  variant="text&quot;
                  onClick={() =></Button> setActiveTab("notifications')}
                  style={{}
                    marginRight: theme?.spacing?.md || '16px',
                    paddingBottom: theme?.spacing?.sm || '8px',
                    borderBottom: activeTab === 'notifications' ? `2px solid ${theme?.colors?.primary?.main || '#1976d2'}` : 'none',
                    borderRadius: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme?.spacing?.xs || '4px',
                  }}
                >
                  <NotificationsIcon style={{ fontSize: '20px' }} /> Notifications
                </Button>
                <Button
                  variant="text&quot;
                  onClick={() =></Button> setActiveTab("security')}
                  style={{}
                    marginRight: theme?.spacing?.md || '16px',
                    paddingBottom: theme?.spacing?.sm || '8px',
                    borderBottom: activeTab === 'security' ? `2px solid ${theme?.colors?.primary?.main || '#1976d2'}` : 'none',
                    borderRadius: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme?.spacing?.xs || '4px',
                  }}
                >
                  <SecurityIcon style={{ fontSize: '20px' }} /> Security
                </Button>
              </Box>

              {/* General Tab */}
              {activeTab === 'general' && (
                <div style={{ }
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(12, 1fr)', 
                  gap: theme?.spacing?.md || '16px' 
                }}>
                  <div style={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                    <FormField label="Name&quot; fullWidth>
                      <TextField
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        fullWidth />
                    </FormField>
                  </div>
                  <div style={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                    <FormField label="Email&quot; fullWidth>
                      <TextField
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                        fullWidth
                        startAdornment={<EmailIcon style={{ marginRight: theme?.spacing?.sm || '8px', color: theme?.colors?.action?.active || '#757575' }} />}
                      />
                    </FormField>
                  </div>
                  <div style={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                    <FormField label="Job Title&quot; fullWidth>
                      <TextField
                        name="jobTitle"
                        value={profile.jobTitle}
                        onChange={handleChange}
                        fullWidth />
                    </FormField>
                  </div>
                  <div style={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                    <FormField label="Department&quot; fullWidth>
                      <TextField
                        name="department"
                        value={profile.department}
                        onChange={handleChange}
                        fullWidth />
                    </FormField>
                  </div>
                  <div style={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                    <FormField label="Phone&quot; fullWidth>
                      <TextField
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        fullWidth />
                    </FormField>
                  </div>
                  <div style={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                    <FormField label="Timezone&quot; fullWidth>
                      <Select
                        name="timezone"
                        value={profile.timezone}
                        onChange={handleChange}
                        fullWidth
                      ></Select>
                        {timezones.map(tz => (
                          <option key={tz} value={tz}>
                            {tz}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div style={{ }
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(12, 1fr)', 
                  gap: theme?.spacing?.md || '16px' 
                }}>
                  <div style={{ gridColumn: 'span 12' }}>
                    <Typography 
                      variant="subtitle1&quot; 
                      style={{ marginBottom: theme?.spacing?.sm || "8px' }}
                    ></Typography>
                      Email Notification Settings
                    </Typography>
                  </div>
                  <div style={{ gridColumn: 'span 12' }}>
                    <Box style={{ marginBottom: theme?.spacing?.md || '16px' }}></Box>
                      <Switch
                        checked={profile.notificationPreferences.emailNotifications}
                        onChange={handleNotificationChange}
                        name="emailNotifications&quot;
                        label="Email Notifications"
                        helperText="Receive notifications via email&quot;
                      />
                    </Box>
                  </div>
                  <div style={{ gridColumn: "span 12' }}>
                    <Box style={{ marginBottom: theme?.spacing?.md || '16px' }}></Box>
                      <Switch
                        checked={profile.notificationPreferences.integrationRunAlerts}
                        onChange={handleNotificationChange}
                        name="integrationRunAlerts&quot;
                        label="Integration Run Alerts"
                        helperText="Get notified when your integrations run&quot;
                      />
                    </Box>
                  </div>
                  <div style={{ gridColumn: "span 12' }}>
                    <Box style={{ marginBottom: theme?.spacing?.md || '16px' }}></Box>
                      <Switch
                        checked={profile.notificationPreferences.integrationErrorAlerts}
                        onChange={handleNotificationChange}
                        name="integrationErrorAlerts&quot;
                        label="Integration Error Alerts"
                        helperText="Get notified when your integrations have errors&quot;
                      />
                    </Box>
                  </div>
                  <div style={{ gridColumn: "span 12' }}>
                    <Box style={{ marginBottom: theme?.spacing?.md || '16px' }}></Box>
                      <Switch
                        checked={profile.notificationPreferences.systemUpdates}
                        onChange={handleNotificationChange}
                        name="systemUpdates&quot;
                        label="System Updates"
                        helperText="Receive notifications about system updates and maintenance&quot;
                      />
                    </Box>
                  </div>
                  <div style={{ gridColumn: "span 12' }}>
                    <Box style={{ marginBottom: theme?.spacing?.md || '16px' }}></Box>
                      <Switch
                        checked={profile.notificationPreferences.weeklyDigest}
                        onChange={handleNotificationChange}
                        name="weeklyDigest&quot;
                        label="Weekly Digest"
                        helperText="Receive a weekly summary of your integration activities&quot;
                      />
                    </Box>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security' && (
                <div style={{ }
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(12, 1fr)', 
                  gap: theme?.spacing?.md || '16px' 
                }}>
                  <div style={{ gridColumn: 'span 12' }}>
                    <Typography 
                      variant="subtitle1&quot; 
                      style={{ marginBottom: theme?.spacing?.sm || "8px' }}
                    ></Typography>
                      Password & Security
                    </Typography>
                  </div>
                  <div style={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                    <FormField label="Current Password&quot; fullWidth>
                      <TextField
                        type="password"
                        name="currentPassword&quot;
                        fullWidth />
                    </FormField>
                  </div>
                  <div style={{ gridColumn: { xs: "span 12', sm: 'span 6' } }}>
                    <Box style={{ height: '56px' }} /> {/* Spacer */}
                  </div>
                  <div style={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                    <FormField label="New Password&quot; fullWidth>
                      <TextField 
                        type="password" 
                        name="newPassword&quot; 
                        fullWidth />
                    </FormField>
                  </div>
                  <div style={{ gridColumn: { xs: "span 12', sm: 'span 6' } }}>
                    <FormField label="Confirm New Password&quot; fullWidth>
                      <TextField
                        type="password"
                        name="confirmPassword&quot;
                        fullWidth />
                    </FormField>
                  </div>
                  <div style={{ gridColumn: "span 12' }}>
                    <Box 
                      style={{ }
                        height: '1px', 
                        backgroundColor: theme?.colors?.divider || '#e0e0e0', 
                        margin: `${theme?.spacing?.md || '16px'} 0` 
                      }} />
                    <Typography 
                      variant="subtitle1&quot; 
                      style={{ marginBottom: theme?.spacing?.sm || "8px' }}
                    ></Typography>
                      Two-Factor Authentication
                    </Typography>
                    <Switch
                      checked={false}
                      disabled
                      label="Enable Two-Factor Authentication (Coming Soon)&quot;
                      helperText="Add an extra layer of security to your account"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Box>

        <Box style={{ }
          display: 'flex', 
          justifyContent: 'flex-end', 
          marginTop: theme?.spacing?.md || '16px' 
        }}></Box>
          <Button
            variant="primary&quot;
            onClick={handleSaveProfile}
            disabled={saving}
            style={{ }
              display: "flex', 
              alignItems: 'center', 
              gap: theme?.spacing?.xs || '4px' 
            }}
          ></Button>
            <SaveIcon style={{ fontSize: '20px' }} />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

export default UserProfile;
