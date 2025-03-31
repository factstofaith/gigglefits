// NotificationSettings.jsx
// -----------------------------------------------------------------------------
// Component for configuring integration notification settings

import React, { useState } from 'react';
import {MuiBox as MuiBox, Typography, Grid, TextField, Button, Dialog, Select} from '../../design-system';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import MuiBox from '@mui/material/Box';

const NotificationSettings = ({ notifications, onChange, errors = {}, readOnly = false }) => {
  // Added display name
  NotificationSettings.displayName = 'NotificationSettings';

  // Added display name
  NotificationSettings.displayName = 'NotificationSettings';

  // Added display name
  NotificationSettings.displayName = 'NotificationSettings';


  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newType, setNewType] = useState('all');

  // Default notification settings
  const defaultNotifications = {
    enabled: true,
    notifyOn: ['success', 'error', 'warning'],
    recipients: [],
    enableSummary: false,
    summarySchedule: 'daily',
  };

  // Merge with default settings
  const settings = { ...defaultNotifications, ...notifications };

  // Handle adding a new email recipient
  const handleAddRecipient = () => {
  // Added display name
  handleAddRecipient.displayName = 'handleAddRecipient';

  // Added display name
  handleAddRecipient.displayName = 'handleAddRecipient';

  // Added display name
  handleAddRecipient.displayName = 'handleAddRecipient';


    if (!newEmail.trim()) return;

    // Check if email is valid with a simple regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      // You could add validation error handling here
      return;
    }

    const newRecipient = {
      email: newEmail,
      type: newType,
    };

    const updatedSettings = {
      ...settings,
      recipients: [...settings.recipients, newRecipient],
    };

    onChange(updatedSettings);
    setNewEmail('');
    setShowAddDialog(false);
  };

  // Handle removing an email recipient
  const handleRemoveRecipient = email => {
    const updatedSettings = {
      ...settings,
      recipients: settings.recipients.filter(r => r.email !== email),
    };

    onChange(updatedSettings);
  };

  // Handle toggling notification settings
  const handleToggle = e => {
    const { name, checked } = e.target;
    const updatedSettings = { ...settings, [name]: checked };
    onChange(updatedSettings);
  };

  // Handle notification types
  const handleNotifyOnChange = event => {
    const updatedSettings = {
      ...settings,
      notifyOn: event.target.value,
    };
    onChange(updatedSettings);
  };

  // Handle summary schedule change
  const handleSummaryScheduleChange = event => {
    const updatedSettings = {
      ...settings,
      summarySchedule: event.target.value,
    };
    onChange(updatedSettings);
  };

  // Get label for notification type
  const getNotificationTypeLabel = type => {
    switch (type) {
      case 'all':
        return 'All Notifications';
      case 'error':
        return 'Errors Only';
      case 'success':
        return 'Success Only';
      case 'summary':
        return 'Summary Only';
      default:
        return type;
    }
  };

  return (
    <MuiBox style={{ marginTop: '16px' }}>
      <Typography variant="subtitle1" style={{ marginBottom: '16px' }}>
        Notification Settings
      </Typography>

      <Grid.Container spacing="md">
        <Grid.Item xs={12}>
          <MuiBox style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <MuiBox 
              as="label" 
              style={{ 
                display: 'flex',
                alignItems: 'center',
                cursor: !readOnly ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              <MuiBox
                as="input"
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => handleToggle({ target: { name: 'enabled', checked: e.target.checked } })}
                disabled={readOnly}
                style={{ 
                  marginRight: '8px',
                  width: '18px',
                  height: '18px' 
                }}
              />
              <Typography 
                variant="body1"
                style={{ fontWeight: 'medium' }}
              >
                Enable Notifications
              </Typography>
            </MuiBox>
          </MuiBox>
          <Typography 
            variant="body2" 
            style={{ 
              color: '#666666',
              marginBottom: '16px'
            }}
          >
            Send email notifications about integration runs
          </Typography>
        </Grid.Item>

        {settings.enabled && (
          <>
            <Grid.Item xs={12} sm={6}>
              <MuiBox style={{ marginBottom: '16px' }}>
                <Typography 
                  variant="body2" 
                  style={{ 
                    marginBottom: '4px', 
                    fontWeight: 'medium',
                    color: '#666666'
                  }}
                >
                  When to Send Notifications
                </Typography>
                <Select
                  multiple
                  value={settings.notifyOn}
                  onChange={handleNotifyOnChange}
                  disabled={readOnly}
                  options={[
                    { value: 'success', label: 'Successful Runs' },
                    { value: 'error', label: 'Errors' },
                    { value: 'warning', label: 'Warnings' },
                  ]}
                  fullWidth
                />
                <Typography 
                  variant="caption" 
                  style={{ 
                    color: '#666666', 
                    display: 'block', 
                    marginTop: '4px' 
                  }}
                >
                  Select when you want to receive notifications
                </Typography>
              </MuiBox>
            </Grid.Item>

            <Grid.Item xs={12} sm={6}>
              <MuiBox style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <MuiBox style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <MuiBox 
                    as="label" 
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      cursor: !readOnly ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                  >
                    <MuiBox
                      as="input"
                      type="checkbox"
                      checked={settings.enableSummary}
                      onChange={(e) => handleToggle({ target: { name: 'enableSummary', checked: e.target.checked } })}
                      disabled={readOnly}
                      style={{ 
                        marginRight: '8px',
                        width: '18px',
                        height: '18px' 
                      }}
                    />
                    <Typography 
                      variant="body1"
                      style={{ fontWeight: 'medium' }}
                    >
                      Enable Summary Reports
                    </Typography>
                  </MuiBox>
                </MuiBox>

                {settings.enableSummary && (
                  <MuiBox style={{ marginTop: '8px' }}>
                    <Typography 
                      variant="body2" 
                      style={{ 
                        marginBottom: '4px', 
                        fontWeight: 'medium',
                        color: '#666666'
                      }}
                    >
                      Summary Frequency
                    </Typography>
                    <Select
                      value={settings.summarySchedule}
                      onChange={handleSummaryScheduleChange}
                      disabled={readOnly}
                      options={[
                        { value: 'daily', label: 'Daily' },
                        { value: 'weekly', label: 'Weekly' },
                        { value: 'monthly', label: 'Monthly' },
                      ]}
                      fullWidth
                    />
                  </MuiBox>
                )}
              </MuiBox>
            </Grid.Item>

            <Grid.Item xs={12}>
              <MuiBox
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  padding: '16px',
                  backgroundColor: '#ffffff',
                  marginBottom: '16px'
                }}
              >
                <MuiBox
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <Typography variant="subtitle2">Email Recipients</Typography>

                  {!readOnly && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setShowAddDialog(true)}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <AddIcon style={{ marginRight: '4px', fontSize: '16px' }} />
                      Add Recipient
                    </Button>
                  )}
                </MuiBox>

                {settings.recipients.length === 0 ? (
                  <Typography
                    variant="body2"
                    style={{ 
                      color: '#666666', 
                      textAlign: 'center', 
                      padding: '16px' 
                    }}
                  >
                    No recipients added. Add email addresses to receive notifications.
                  </Typography>
                ) : (
                  <Grid.Container spacing="sm">
                    {settings.recipients.map((recipient, index) => (
                      <Grid.Item xs={12} key={index}>
                        <MuiBox
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            backgroundColor: '#f9f9f9',
                          }}
                        >
                          <MuiBox style={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon style={{ marginRight: '8px', color: '#757575' }} />
                            <MuiBox>
                              <Typography variant="body2">{recipient.email}</Typography>
                              <Typography 
                                variant="caption" 
                                style={{ color: '#666666' }}
                              >
                                {getNotificationTypeLabel(recipient.type)}
                              </Typography>
                            </MuiBox>
                          </MuiBox>

                          {!readOnly && (
                            <MuiBox
                              as="button"
                              onClick={() => handleRemoveRecipient(recipient.email)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'transparent',
                                border: 'none',
                                padding: '4px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                color: '#d32f2f'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(211, 47, 47, 0.08)'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <DeleteIcon style={{ fontSize: '16px' }} />
                            </MuiBox>
                          )}
                        </MuiBox>
                      </Grid.Item>
                    ))}
                  </Grid.Container>
                )}
              </MuiBox>
              {errors.recipients && (
                <Typography 
                  variant="caption" 
                  style={{ 
                    color: '#d32f2f', 
                    marginTop: '4px',
                    display: 'block'
                  }}
                >
                  {errors.recipients}
                </Typography>
              )}
            </Grid.Item>
          </>
        )}
      </Grid.Container>

      {/* Add recipient dialog */}
      <Dialog 
        open={showAddDialog} 
        onClose={() => setShowAddDialog(false)}
        title="Add Email Recipient"
        size="sm"
        actions={
          <>
            <Button 
              onClick={() => setShowAddDialog(false)} 
              variant="outlined"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddRecipient} 
              variant="contained"
            >
              Add
            </Button>
          </>
        }
      >
        <MuiBox style={{ marginBottom: '16px' }}>
          <Typography 
            variant="body2" 
            style={{ 
              marginBottom: '4px', 
              fontWeight: 'medium'
            }}
          >
            Email Address
          </Typography>
          <TextField
            autoFocus
            type="email"
            fullWidth
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
          />
        </MuiBox>

        <MuiBox style={{ marginBottom: '8px' }}>
          <Typography 
            variant="body2" 
            style={{ 
              marginBottom: '4px', 
              fontWeight: 'medium'
            }}
          >
            Notification Type
          </Typography>
          <Select
            value={newType}
            onChange={e => setNewType(e.target.value)}
            options={[
              { value: 'all', label: 'All Notifications' },
              { value: 'error', label: 'Errors Only' },
              { value: 'success', label: 'Success Only' },
              { value: 'summary', label: 'Summary Only' },
            ]}
            fullWidth
          />
        </MuiBox>
      </Dialog>
    </MuiBox>
  );
};

export default NotificationSettings;
