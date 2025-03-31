import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;;
import {
import { Alert, Badge, Box, Button, Card, CardActions, CardContent, CardHeader, Checkbox, Chip, CircularProgress, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Drawer, FormControl, FormControlLabel, FormHelperText, Grid, IconButton, InputLabel, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, MenuItem, Paper, Radio, RadioGroup, Select, Snackbar, Stack, Switch, Tab, Tabs, TextField, Tooltip, Typography, alpha, styled } from '../../design-system';
// Design system import already exists;
// Design system import already exists;
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  AccessTime as TimeIcon,
  CalendarMonth as CalendarIcon,
  NotificationImportant as ImportantIcon,
  Block as MuteIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Groups as GroupIcon,
  Send as SendIcon,
  Storage as StorageIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  Dashboard as DashboardIcon,
  Apps as AppsIcon,
  Category as CategoryIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
;
// Styled components
const NotificationContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`
}));

const NotificationHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}));

const NotificationContent = styled(Box)({
  flex: 1,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column'
});

const ConfigurationSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: alpha(theme.palette.background.default, 0.5)
}));

const NotificationList = styled(List)(({ theme }) => ({
  padding: 0,
  '& .MuiListItem-root': {
    borderBottom: `1px solid ${theme.palette.divider}`
  }
}));

const NotificationItem = styled(ListItem)(({ theme, severity }) => ({
  borderLeft: `4px solid ${
    severity === 'error' ? theme.palette.error.main :
    severity === 'warning' ? theme.palette.warning.main :
    severity === 'info' ? theme.palette.info.main :
    theme.palette.success.main
  }`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.default, 0.5)
  }
}));

const CategoryChip = styled(Chip)(({ theme, color }) => ({
  backgroundColor: color ? alpha(theme.palette[color].main, 0.1) : 'transparent',
  color: color ? theme.palette[color].main : theme.palette.text.primary,
  borderColor: color ? theme.palette[color].main : theme.palette.divider
}));

const EmptyStateContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: 40,
  height: '100%'
});

const ChannelCard = styled(Card)(({ theme, active }) => ({
  border: `1px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
}));

const TestNotificationButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(2),
  bottom: theme.spacing(2),
  zIndex: 1000
}));

/**
 * Component for configuring and managing file event notifications
 * 
 * Features:
 * - Configure notification channels (email, in-app, webhook)
 * - Set up notification rules based on event types
 * - Test notifications
 * - View notification history
 * - Manage notification preferences
 */
const FileNotificationSystem = ({
  storageType = 's3',
  containerName = '',
  resourcePath = '',
  credentials = {},
  onChange = null,
  height = 500,
  initialConfig = {},
  onSendTestNotification = null
}) => {
  // Added display name
  FileNotificationSystem.displayName = 'FileNotificationSystem';

  // Added display name
  FileNotificationSystem.displayName = 'FileNotificationSystem';

  // Added display name
  FileNotificationSystem.displayName = 'FileNotificationSystem';

  // Added display name
  FileNotificationSystem.displayName = 'FileNotificationSystem';

  // Added display name
  FileNotificationSystem.displayName = 'FileNotificationSystem';


  // State for notification configuration
  const [notificationConfig, setNotificationConfig] = useState({
    enabled: false,
    channels: {
      email: {
        enabled: true,
        recipients: [],
        digestEnabled: false,
        digestFrequency: 'daily'
      },
      inApp: {
        enabled: true,
        showPopup: true,
        soundEnabled: false
      },
      webhook: {
        enabled: false,
        url: '',
        headers: {},
        formatJson: true
      },
      slack: {
        enabled: false,
        webhookUrl: '',
        channel: ''
      }
    },
    rules: {
      fileCreated: {
        enabled: true,
        severity: 'info',
        channels: ['email', 'inApp']
      },
      fileModified: {
        enabled: true,
        severity: 'info',
        channels: ['inApp']
      },
      fileDeleted: {
        enabled: true,
        severity: 'warning',
        channels: ['email', 'inApp']
      },
      triggerExecuted: {
        enabled: true,
        severity: 'info',
        channels: ['inApp']
      },
      error: {
        enabled: true,
        severity: 'error',
        channels: ['email', 'inApp', 'webhook']
      }
    },
    preferences: {
      batchNotifications: false,
      batchInterval: 15, // minutes
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    },
    filtering: {
      filePatterns: '*.*',
      minSeverity: 'info',
      categories: ['file', 'trigger', 'error']
    },
    ...initialConfig
  });
  
  // State for notification history
  const [notifications, setNotifications] = useState([]);
  
  // State for UI
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState('email');
  const [recipientInput, setRecipientInput] = useState('');
  const [addRecipientError, setAddRecipientError] = useState(null);
  const [testNotificationDialogOpen, setTestNotificationDialogOpen] = useState(false);
  const [testNotificationType, setTestNotificationType] = useState('fileCreated');
  
  // Initialize with provided config
  useEffect(() => {
    if (initialConfig && Object.keys(initialConfig).length > 0) {
      setNotificationConfig(prev => ({
        ...prev,
        ...initialConfig
      }));
    }
    
    // Generate some mock notification history
    const mockNotifications = generateMockNotifications();
    setNotifications(mockNotifications);
  }, [initialConfig]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';


    setActiveTab(newValue);
  };
  
  // Handle channel selection
  const handleChannelSelect = (channel) => {
  // Added display name
  handleChannelSelect.displayName = 'handleChannelSelect';

  // Added display name
  handleChannelSelect.displayName = 'handleChannelSelect';

  // Added display name
  handleChannelSelect.displayName = 'handleChannelSelect';

  // Added display name
  handleChannelSelect.displayName = 'handleChannelSelect';

  // Added display name
  handleChannelSelect.displayName = 'handleChannelSelect';


    setSelectedChannel(channel);
  };
  
  // Handle enabling/disabling notifications
  const handleToggleNotifications = (event) => {
  // Added display name
  handleToggleNotifications.displayName = 'handleToggleNotifications';

  // Added display name
  handleToggleNotifications.displayName = 'handleToggleNotifications';

  // Added display name
  handleToggleNotifications.displayName = 'handleToggleNotifications';

  // Added display name
  handleToggleNotifications.displayName = 'handleToggleNotifications';

  // Added display name
  handleToggleNotifications.displayName = 'handleToggleNotifications';


    const enabled = event.target.checked;
    setNotificationConfig(prev => ({
      ...prev,
      enabled
    }));
    
    // Notify parent of change
    if (onChange) {
      onChange({
        ...notificationConfig,
        enabled
      });
    }
  };
  
  // Handle channel toggle
  const handleToggleChannel = (channel) => {
  // Added display name
  handleToggleChannel.displayName = 'handleToggleChannel';

  // Added display name
  handleToggleChannel.displayName = 'handleToggleChannel';

  // Added display name
  handleToggleChannel.displayName = 'handleToggleChannel';

  // Added display name
  handleToggleChannel.displayName = 'handleToggleChannel';

  // Added display name
  handleToggleChannel.displayName = 'handleToggleChannel';


    setNotificationConfig(prev => {
      const newConfig = {
        ...prev,
        channels: {
          ...prev.channels,
          [channel]: {
            ...prev.channels[channel],
            enabled: !prev.channels[channel].enabled
          }
        }
      };
      
      // Notify parent of change
      if (onChange) {
        onChange(newConfig);
      }
      
      return newConfig;
    });
  };
  
  // Handle rule toggle
  const handleToggleRule = (rule) => {
  // Added display name
  handleToggleRule.displayName = 'handleToggleRule';

  // Added display name
  handleToggleRule.displayName = 'handleToggleRule';

  // Added display name
  handleToggleRule.displayName = 'handleToggleRule';

  // Added display name
  handleToggleRule.displayName = 'handleToggleRule';

  // Added display name
  handleToggleRule.displayName = 'handleToggleRule';


    setNotificationConfig(prev => {
      const newConfig = {
        ...prev,
        rules: {
          ...prev.rules,
          [rule]: {
            ...prev.rules[rule],
            enabled: !prev.rules[rule].enabled
          }
        }
      };
      
      // Notify parent of change
      if (onChange) {
        onChange(newConfig);
      }
      
      return newConfig;
    });
  };
  
  // Handle rule severity change
  const handleRuleSeverityChange = (rule, severity) => {
  // Added display name
  handleRuleSeverityChange.displayName = 'handleRuleSeverityChange';

  // Added display name
  handleRuleSeverityChange.displayName = 'handleRuleSeverityChange';

  // Added display name
  handleRuleSeverityChange.displayName = 'handleRuleSeverityChange';

  // Added display name
  handleRuleSeverityChange.displayName = 'handleRuleSeverityChange';

  // Added display name
  handleRuleSeverityChange.displayName = 'handleRuleSeverityChange';


    setNotificationConfig(prev => {
      const newConfig = {
        ...prev,
        rules: {
          ...prev.rules,
          [rule]: {
            ...prev.rules[rule],
            severity
          }
        }
      };
      
      // Notify parent of change
      if (onChange) {
        onChange(newConfig);
      }
      
      return newConfig;
    });
  };
  
  // Handle rule channel change
  const handleRuleChannelToggle = (rule, channel) => {
  // Added display name
  handleRuleChannelToggle.displayName = 'handleRuleChannelToggle';

  // Added display name
  handleRuleChannelToggle.displayName = 'handleRuleChannelToggle';

  // Added display name
  handleRuleChannelToggle.displayName = 'handleRuleChannelToggle';

  // Added display name
  handleRuleChannelToggle.displayName = 'handleRuleChannelToggle';

  // Added display name
  handleRuleChannelToggle.displayName = 'handleRuleChannelToggle';


    setNotificationConfig(prev => {
      const channels = [...prev.rules[rule].channels];
      const index = channels.indexOf(channel);
      
      if (index === -1) {
        channels.push(channel);
      } else {
        channels.splice(index, 1);
      }
      
      const newConfig = {
        ...prev,
        rules: {
          ...prev.rules,
          [rule]: {
            ...prev.rules[rule],
            channels
          }
        }
      };
      
      // Notify parent of change
      if (onChange) {
        onChange(newConfig);
      }
      
      return newConfig;
    });
  };
  
  // Handle preference change
  const handlePreferenceChange = (preference, value) => {
  // Added display name
  handlePreferenceChange.displayName = 'handlePreferenceChange';

  // Added display name
  handlePreferenceChange.displayName = 'handlePreferenceChange';

  // Added display name
  handlePreferenceChange.displayName = 'handlePreferenceChange';

  // Added display name
  handlePreferenceChange.displayName = 'handlePreferenceChange';

  // Added display name
  handlePreferenceChange.displayName = 'handlePreferenceChange';


    setNotificationConfig(prev => {
      // Handle nested preferences
      if (preference.includes('.')) {
        const [parent, child] = preference.split('.');
        
        const newConfig = {
          ...prev,
          preferences: {
            ...prev.preferences,
            [parent]: {
              ...prev.preferences[parent],
              [child]: value
            }
          }
        };
        
        // Notify parent of change
        if (onChange) {
          onChange(newConfig);
        }
        
        return newConfig;
      } else {
        const newConfig = {
          ...prev,
          preferences: {
            ...prev.preferences,
            [preference]: value
          }
        };
        
        // Notify parent of change
        if (onChange) {
          onChange(newConfig);
        }
        
        return newConfig;
      }
    });
  };
  
  // Handle filtering change
  const handleFilteringChange = (filter, value) => {
  // Added display name
  handleFilteringChange.displayName = 'handleFilteringChange';

  // Added display name
  handleFilteringChange.displayName = 'handleFilteringChange';

  // Added display name
  handleFilteringChange.displayName = 'handleFilteringChange';

  // Added display name
  handleFilteringChange.displayName = 'handleFilteringChange';

  // Added display name
  handleFilteringChange.displayName = 'handleFilteringChange';


    setNotificationConfig(prev => {
      const newConfig = {
        ...prev,
        filtering: {
          ...prev.filtering,
          [filter]: value
        }
      };
      
      // Notify parent of change
      if (onChange) {
        onChange(newConfig);
      }
      
      return newConfig;
    });
  };
  
  // Handle channel config change
  const handleChannelConfigChange = (channel, key, value) => {
  // Added display name
  handleChannelConfigChange.displayName = 'handleChannelConfigChange';

  // Added display name
  handleChannelConfigChange.displayName = 'handleChannelConfigChange';

  // Added display name
  handleChannelConfigChange.displayName = 'handleChannelConfigChange';

  // Added display name
  handleChannelConfigChange.displayName = 'handleChannelConfigChange';

  // Added display name
  handleChannelConfigChange.displayName = 'handleChannelConfigChange';


    setNotificationConfig(prev => {
      const newConfig = {
        ...prev,
        channels: {
          ...prev.channels,
          [channel]: {
            ...prev.channels[channel],
            [key]: value
          }
        }
      };
      
      // Notify parent of change
      if (onChange) {
        onChange(newConfig);
      }
      
      return newConfig;
    });
  };
  
  // Handle adding email recipient
  const handleAddRecipient = () => {
  // Added display name
  handleAddRecipient.displayName = 'handleAddRecipient';

  // Added display name
  handleAddRecipient.displayName = 'handleAddRecipient';

  // Added display name
  handleAddRecipient.displayName = 'handleAddRecipient';

  // Added display name
  handleAddRecipient.displayName = 'handleAddRecipient';

  // Added display name
  handleAddRecipient.displayName = 'handleAddRecipient';


    // Validate email
    if (!recipientInput.trim()) {
      setAddRecipientError('Email address is required');
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientInput.trim())) {
      setAddRecipientError('Invalid email address');
      return;
    }
    
    // Check for duplicates
    if (notificationConfig.channels.email.recipients.includes(recipientInput.trim())) {
      setAddRecipientError('This email is already in the list');
      return;
    }
    
    setNotificationConfig(prev => {
      const newRecipients = [...prev.channels.email.recipients, recipientInput.trim()];
      
      const newConfig = {
        ...prev,
        channels: {
          ...prev.channels,
          email: {
            ...prev.channels.email,
            recipients: newRecipients
          }
        }
      };
      
      // Notify parent of change
      if (onChange) {
        onChange(newConfig);
      }
      
      return newConfig;
    });
    
    // Clear input and error
    setRecipientInput('');
    setAddRecipientError(null);
  };
  
  // Handle removing email recipient
  const handleRemoveRecipient = (email) => {
  // Added display name
  handleRemoveRecipient.displayName = 'handleRemoveRecipient';

  // Added display name
  handleRemoveRecipient.displayName = 'handleRemoveRecipient';

  // Added display name
  handleRemoveRecipient.displayName = 'handleRemoveRecipient';

  // Added display name
  handleRemoveRecipient.displayName = 'handleRemoveRecipient';

  // Added display name
  handleRemoveRecipient.displayName = 'handleRemoveRecipient';


    setNotificationConfig(prev => {
      const newRecipients = prev.channels.email.recipients.filter(r => r !== email);
      
      const newConfig = {
        ...prev,
        channels: {
          ...prev.channels,
          email: {
            ...prev.channels.email,
            recipients: newRecipients
          }
        }
      };
      
      // Notify parent of change
      if (onChange) {
        onChange(newConfig);
      }
      
      return newConfig;
    });
  };
  
  // Handle save configuration
  const handleSaveConfig = () => {
  // Added display name
  handleSaveConfig.displayName = 'handleSaveConfig';

  // Added display name
  handleSaveConfig.displayName = 'handleSaveConfig';

  // Added display name
  handleSaveConfig.displayName = 'handleSaveConfig';

  // Added display name
  handleSaveConfig.displayName = 'handleSaveConfig';

  // Added display name
  handleSaveConfig.displayName = 'handleSaveConfig';


    setLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess('Notification settings saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      // Notify parent of change
      if (onChange) {
        onChange(notificationConfig);
      }
    }, 1000);
  };
  
  // Handle send test notification
  const handleSendTestNotification = () => {
  // Added display name
  handleSendTestNotification.displayName = 'handleSendTestNotification';

  // Added display name
  handleSendTestNotification.displayName = 'handleSendTestNotification';

  // Added display name
  handleSendTestNotification.displayName = 'handleSendTestNotification';

  // Added display name
  handleSendTestNotification.displayName = 'handleSendTestNotification';

  // Added display name
  handleSendTestNotification.displayName = 'handleSendTestNotification';


    setLoading(true);
    setError(null);
    
    // Create test notification data
    const testNotification = {
      type: testNotificationType,
      timestamp: new Date(),
      source: {
        type: storageType,
        containerName,
        path: resourcePath
      },
      file: {
        name: 'test-file.csv',
        path: resourcePath ? `${resourcePath}/test-file.csv` : 'test-file.csv'
      },
      severity: notificationConfig.rules[testNotificationType].severity,
      message: `Test notification for ${testNotificationType} event`
    };
    
    // Simulate API call
    setTimeout(() => {
      // Add to notifications
      setNotifications([testNotification, ...notifications]);
      
      setLoading(false);
      setSuccess('Test notification sent successfully');
      setTestNotificationDialogOpen(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      // Call parent callback
      if (onSendTestNotification) {
        onSendTestNotification(testNotification);
      }
    }, 1000);
  };
  
  // Helper function to generate mock notifications
  const generateMockNotifications = () => {
  // Added display name
  generateMockNotifications.displayName = 'generateMockNotifications';

  // Added display name
  generateMockNotifications.displayName = 'generateMockNotifications';

  // Added display name
  generateMockNotifications.displayName = 'generateMockNotifications';

  // Added display name
  generateMockNotifications.displayName = 'generateMockNotifications';

  // Added display name
  generateMockNotifications.displayName = 'generateMockNotifications';


    const mockEvents = [
      { type: 'fileCreated', severity: 'info', message: 'New file uploaded' },
      { type: 'fileModified', severity: 'info', message: 'File content updated' },
      { type: 'fileDeleted', severity: 'warning', message: 'File deleted' },
      { type: 'triggerExecuted', severity: 'info', message: 'Workflow trigger executed' },
      { type: 'error', severity: 'error', message: 'Error accessing storage' }
    ];
    
    const mockFiles = [
      { name: 'data.csv', path: 'data.csv' },
      { name: 'report.xlsx', path: 'reports/report.xlsx' },
      { name: 'config.json', path: 'config/config.json' },
      { name: 'users.xml', path: 'data/users.xml' }
    ];
    
    // Generate 10 random notifications
    return Array.from({ length: 10 }, (_, i) => {
      const eventIndex = Math.floor(Math.random() * mockEvents.length);
      const fileIndex = Math.floor(Math.random() * mockFiles.length);
      const event = mockEvents[eventIndex];
      const file = mockFiles[fileIndex];
      
      // Random date within the last 7 days
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 7));
      date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
      
      return {
        id: Date.now() - i,
        type: event.type,
        severity: event.severity,
        message: event.message,
        file,
        timestamp: date,
        source: {
          type: storageType,
          containerName,
          path: resourcePath
        },
        read: Math.random() > 0.5
      };
    }).sort((a, b) => b.timestamp - a.timestamp);
  };
  
  // Get friendly name for event type
  const getEventTypeName = (type) => {
  // Added display name
  getEventTypeName.displayName = 'getEventTypeName';

  // Added display name
  getEventTypeName.displayName = 'getEventTypeName';

  // Added display name
  getEventTypeName.displayName = 'getEventTypeName';

  // Added display name
  getEventTypeName.displayName = 'getEventTypeName';

  // Added display name
  getEventTypeName.displayName = 'getEventTypeName';


    switch (type) {
      case 'fileCreated':
        return 'File Created';
      case 'fileModified':
        return 'File Modified';
      case 'fileDeleted':
        return 'File Deleted';
      case 'triggerExecuted':
        return 'Trigger Executed';
      case 'error':
        return 'Error';
      default:
        return type;
    }
  };
  
  // Get icon for event type
  const getEventTypeIcon = (type, severity) => {
  // Added display name
  getEventTypeIcon.displayName = 'getEventTypeIcon';

  // Added display name
  getEventTypeIcon.displayName = 'getEventTypeIcon';

  // Added display name
  getEventTypeIcon.displayName = 'getEventTypeIcon';

  // Added display name
  getEventTypeIcon.displayName = 'getEventTypeIcon';

  // Added display name
  getEventTypeIcon.displayName = 'getEventTypeIcon';


    switch (type) {
      case 'fileCreated':
        return <CheckCircle color="success&quot; />;
      case "fileModified':
        return <Info color="info&quot; />;
      case "fileDeleted':
        return <Warning color="warning&quot; />;
      case "triggerExecuted':
        return <PlayArrow color="primary&quot; />;
      case "error':
        return <Error color="error&quot; />;
      default:
        return <NotificationsIcon />;
    }
  };
  
  // Format date for display
  const formatDate = (date) => {
  // Added display name
  formatDate.displayName = "formatDate';

  // Added display name
  formatDate.displayName = 'formatDate';

  // Added display name
  formatDate.displayName = 'formatDate';

  // Added display name
  formatDate.displayName = 'formatDate';

  // Added display name
  formatDate.displayName = 'formatDate';


    if (!date) return '';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };
  
  // Calculate notifications by severity
  const notificationCounts = {
    total: notifications.length,
    error: notifications.filter(n => n.severity === 'error').length,
    warning: notifications.filter(n => n.severity === 'warning').length,
    info: notifications.filter(n => n.severity === 'info').length,
    unread: notifications.filter(n => !n.read).length
  };
  
  return (
    <NotificationContainer elevation={1} style={{ height }}>
      <NotificationHeader>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Badge 
            badgeContent={notificationCounts.unread} 
            color="error&quot;
            sx={{ mr: 1 }}
          >
            <NotificationsActiveIcon />
          </Badge>
          <Typography variant="h6">
            File Notifications
          </Typography>
        </Box>
        
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={notificationConfig.enabled}
                onChange={handleToggleNotifications}
                color="primary&quot;
              />
            }
            label={notificationConfig.enabled ? "Enabled" : "Disabled"}
          />
        </Box>
      </NotificationHeader>
      
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        indicatorColor="primary&quot;
        textColor="primary"
        variant="fullWidth&quot;
      >
        <Tab label="Channels" />
        <Tab label="Rules&quot; />
        <Tab label="History" />
        <Tab label="Settings&quot; />
      </Tabs>
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ m: 1 }}
          action={
            <IconButton
              color="inherit&quot;
              size="small"
              onClick={() => setSuccess(null)}
            >
              <CloseIcon fontSize="small&quot; />
            </IconButton>
          }
        >
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ m: 1 }}
          action={
            <IconButton
              color="inherit&quot;
              size="small"
              onClick={() => setError(null)}
            >
              <CloseIcon fontSize="small&quot; />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}
      
      <NotificationContent>
        {/* Channels Tab */}
        {activeTab === 0 && (
          <Box>
            <ConfigurationSection>
              <Typography variant="subtitle1" gutterBottom>
                Notification Channels
              </Typography>
              <Typography variant="body2&quot; color="textSecondary" gutterBottom>
                Configure where and how notifications are delivered.
              </Typography>
            </ConfigurationSection>
            
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {/* Email Channel */}
                <Grid item xs={12} sm={6} md={3}>
                  <ChannelCard 
                    active={selectedChannel === 'email'}
                    onClick={() => handleChannelSelect('email')}
                  >
                    <CardHeader
                      avatar={<EmailIcon color={notificationConfig.channels.email.enabled ? "primary" : "disabled"} />}
                      title="Email Notifications&quot;
                      action={
                        <Switch
                          checked={notificationConfig.channels.email.enabled}
                          onChange={() => handleToggleChannel("email')}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                    />
                    <CardContent>
                      <Typography variant="body2&quot; color="textSecondary">
                        Send notifications to specified email addresses.
                      </Typography>
                      {notificationConfig.channels.email.recipients.length > 0 && (
                        <Typography variant="body2&quot; sx={{ mt: 1 }}>
                          {notificationConfig.channels.email.recipients.length} recipient(s)
                        </Typography>
                      )}
                    </CardContent>
                  </ChannelCard>
                </Grid>
                
                {/* In-App Channel */}
                <Grid item xs={12} sm={6} md={3}>
                  <ChannelCard 
                    active={selectedChannel === "inApp'}
                    onClick={() => handleChannelSelect('inApp')}
                  >
                    <CardHeader
                      avatar={<NotificationsIcon color={notificationConfig.channels.inApp.enabled ? "primary" : "disabled"} />}
                      title="In-App Notifications&quot;
                      action={
                        <Switch
                          checked={notificationConfig.channels.inApp.enabled}
                          onChange={() => handleToggleChannel("inApp')}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                    />
                    <CardContent>
                      <Typography variant="body2&quot; color="textSecondary">
                        Show notifications within the application interface.
                      </Typography>
                      <Typography variant="body2&quot; sx={{ mt: 1 }}>
                        {notificationConfig.channels.inApp.showPopup ? "Popup enabled' : 'No popup'}
                      </Typography>
                    </CardContent>
                  </ChannelCard>
                </Grid>
                
                {/* Webhook Channel */}
                <Grid item xs={12} sm={6} md={3}>
                  <ChannelCard 
                    active={selectedChannel === 'webhook'}
                    onClick={() => handleChannelSelect('webhook')}
                  >
                    <CardHeader
                      avatar={<SendIcon color={notificationConfig.channels.webhook.enabled ? "primary" : "disabled"} />}
                      title="Webhook&quot;
                      action={
                        <Switch
                          checked={notificationConfig.channels.webhook.enabled}
                          onChange={() => handleToggleChannel("webhook')}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                    />
                    <CardContent>
                      <Typography variant="body2&quot; color="textSecondary">
                        Send notifications to external webhook endpoints.
                      </Typography>
                      {notificationConfig.channels.webhook.url && (
                        <Typography variant="body2&quot; sx={{ mt: 1 }} noWrap>
                          {notificationConfig.channels.webhook.url}
                        </Typography>
                      )}
                    </CardContent>
                  </ChannelCard>
                </Grid>
                
                {/* Slack Channel */}
                <Grid item xs={12} sm={6} md={3}>
                  <ChannelCard 
                    active={selectedChannel === "slack'}
                    onClick={() => handleChannelSelect('slack')}
                  >
                    <CardHeader
                      avatar={<ChatIcon color={notificationConfig.channels.slack.enabled ? "primary" : "disabled"} />}
                      title="Slack&quot;
                      action={
                        <Switch
                          checked={notificationConfig.channels.slack.enabled}
                          onChange={() => handleToggleChannel("slack')}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                    />
                    <CardContent>
                      <Typography variant="body2&quot; color="textSecondary">
                        Send notifications to Slack channels.
                      </Typography>
                      {notificationConfig.channels.slack.channel && (
                        <Typography variant="body2&quot; sx={{ mt: 1 }}>
                          {notificationConfig.channels.slack.channel}
                        </Typography>
                      )}
                    </CardContent>
                  </ChannelCard>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  {selectedChannel === 'email' && 'Email Configuration'}
                  {selectedChannel === 'inApp' && 'In-App Notification Settings'}
                  {selectedChannel === 'webhook' && 'Webhook Configuration'}
                  {selectedChannel === 'slack' && 'Slack Configuration'}
                </Typography>
                
                {/* Email Configuration */}
                {selectedChannel === 'email' && (
                  <Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2&quot; gutterBottom>
                          Recipients
                        </Typography>
                        
                        <Box sx={{ display: "flex', mb: 2 }}>
                          <TextField
                            label="Email Address&quot;
                            value={recipientInput}
                            onChange={(e) => {
                              setRecipientInput(e.target.value);
                              setAddRecipientError(null);
                            }}
                            error={!!addRecipientError}
                            helperText={addRecipientError}
                            sx={{ flex: 1, mr: 1 }}
                            disabled={!notificationConfig.channels.email.enabled}
                          />
                          <Button
                            variant="contained"
                            onClick={handleAddRecipient}
                            startIcon={<AddIcon />}
                            disabled={!notificationConfig.channels.email.enabled}
                          >
                            Add
                          </Button>
                        </Box>
                        
                        {notificationConfig.channels.email.recipients.length > 0 ? (
                          <Box sx={{ mb: 2 }}>
                            <List dense>
                              {notificationConfig.channels.email.recipients.map((email) => (
                                <ListItem key={email}>
                                  <ListItemIcon>
                                    <EmailIcon />
                                  </ListItemIcon>
                                  <ListItemText primary={email} />
                                  <ListItemSecondaryAction>
                                    <IconButton
                                      edge="end&quot;
                                      onClick={() => handleRemoveRecipient(email)}
                                      disabled={!notificationConfig.channels.email.enabled}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </ListItemSecondaryAction>
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        ) : (
                          <Alert severity="info" sx={{ mb: 2 }}>
                            No recipients configured. Add email addresses to receive notifications.
                          </Alert>
                        )}
                      </Grid>
                      
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={notificationConfig.channels.email.digestEnabled}
                              onChange={(e) => handleChannelConfigChange('email', 'digestEnabled', e.target.checked)}
                              disabled={!notificationConfig.channels.email.enabled}
                            />
                          }
                          label="Send digest (combine multiple notifications)&quot;
                        />
                      </Grid>
                      
                      {notificationConfig.channels.email.digestEnabled && (
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Digest Frequency</InputLabel>
                            <Select
                              value={notificationConfig.channels.email.digestFrequency}
                              onChange={(e) => handleChannelConfigChange("email', 'digestFrequency', e.target.value)}
                              label="Digest Frequency&quot;
                              disabled={!notificationConfig.channels.email.enabled}
                            >
                              <MenuItem value="hourly">Hourly</MenuItem>
                              <MenuItem value="daily&quot;>Daily</MenuItem>
                              <MenuItem value="weekly">Weekly</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                )}
                
                {/* In-App Configuration */}
                {selectedChannel === 'inApp' && (
                  <Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={notificationConfig.channels.inApp.showPopup}
                              onChange={(e) => handleChannelConfigChange('inApp', 'showPopup', e.target.checked)}
                              disabled={!notificationConfig.channels.inApp.enabled}
                            />
                          }
                          label="Show popup notifications&quot;
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={notificationConfig.channels.inApp.soundEnabled}
                              onChange={(e) => handleChannelConfigChange("inApp', 'soundEnabled', e.target.checked)}
                              disabled={!notificationConfig.channels.inApp.enabled}
                            />
                          }
                          label="Enable notification sounds&quot;
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
                
                {/* Webhook Configuration */}
                {selectedChannel === "webhook' && (
                  <Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="Webhook URL&quot;
                          value={notificationConfig.channels.webhook.url}
                          onChange={(e) => handleChannelConfigChange("webhook', 'url', e.target.value)}
                          fullWidth
                          disabled={!notificationConfig.channels.webhook.enabled}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={notificationConfig.channels.webhook.formatJson}
                              onChange={(e) => handleChannelConfigChange('webhook', 'formatJson', e.target.checked)}
                              disabled={!notificationConfig.channels.webhook.enabled}
                            />
                          }
                          label="Format payload as JSON&quot;
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
                
                {/* Slack Configuration */}
                {selectedChannel === "slack' && (
                  <Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="Slack Webhook URL&quot;
                          value={notificationConfig.channels.slack.webhookUrl}
                          onChange={(e) => handleChannelConfigChange("slack', 'webhookUrl', e.target.value)}
                          fullWidth
                          disabled={!notificationConfig.channels.slack.enabled}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Channel&quot;
                          value={notificationConfig.channels.slack.channel}
                          onChange={(e) => handleChannelConfigChange("slack', 'channel', e.target.value)}
                          fullWidth
                          placeholder="#channel or @username&quot;
                          disabled={!notificationConfig.channels.slack.enabled}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
        
        {/* Rules Tab */}
        {activeTab === 1 && (
          <Box>
            <ConfigurationSection>
              <Typography variant="subtitle1" gutterBottom>
                Notification Rules
              </Typography>
              <Typography variant="body2&quot; color="textSecondary" gutterBottom>
                Configure which events trigger notifications and their delivery channels.
              </Typography>
            </ConfigurationSection>
            
            <Box sx={{ p: 2 }}>
              <Paper variant="outlined&quot; sx={{ mb: 3 }}>
                <List>
                  {/* File Created Rule */}
                  <ListItem divider>
                    <ListItemIcon>
                      <CheckCircle color={notificationConfig.rules.fileCreated.enabled ? "success" : "disabled"} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="File Created&quot;
                      secondary="Notify when a new file is added to storage"
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormControl sx={{ minWidth: 120, mr: 2 }}>
                        <InputLabel>Severity</InputLabel>
                        <Select
                          value={notificationConfig.rules.fileCreated.severity}
                          onChange={(e) => handleRuleSeverityChange('fileCreated', e.target.value)}
                          label="Severity&quot;
                          size="small"
                          disabled={!notificationConfig.rules.fileCreated.enabled}
                        >
                          <MenuItem value="info&quot;>Info</MenuItem>
                          <MenuItem value="warning">Warning</MenuItem>
                          <MenuItem value="error&quot;>Error</MenuItem>
                        </Select>
                      </FormControl>
                      <Switch
                        checked={notificationConfig.rules.fileCreated.enabled}
                        onChange={() => handleToggleRule("fileCreated')}
                        edge="end&quot;
                      />
                    </Box>
                  </ListItem>
                  
                  <Collapse in={notificationConfig.rules.fileCreated.enabled}>
                    <Box sx={{ pl: 4, pr: 2, py: 1, bgcolor: "background.default' }}>
                      <Typography variant="subtitle2&quot; gutterBottom>
                        Notification Channels
                      </Typography>
                      <Box sx={{ display: "flex', flexWrap: 'wrap', gap: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={notificationConfig.rules.fileCreated.channels.includes('email')}
                              onChange={() => handleRuleChannelToggle('fileCreated', 'email')}
                              disabled={!notificationConfig.channels.email.enabled}
                            />
                          }
                          label="Email&quot;
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={notificationConfig.rules.fileCreated.channels.includes("inApp')}
                              onChange={() => handleRuleChannelToggle('fileCreated', 'inApp')}
                              disabled={!notificationConfig.channels.inApp.enabled}
                            />
                          }
                          label="In-App&quot;
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={notificationConfig.rules.fileCreated.channels.includes("webhook')}
                              onChange={() => handleRuleChannelToggle('fileCreated', 'webhook')}
                              disabled={!notificationConfig.channels.webhook.enabled}
                            />
                          }
                          label="Webhook&quot;
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={notificationConfig.rules.fileCreated.channels.includes("slack')}
                              onChange={() => handleRuleChannelToggle('fileCreated', 'slack')}
                              disabled={!notificationConfig.channels.slack.enabled}
                            />
                          }
                          label="Slack&quot;
                        />
                      </Box>
                    </Box>
                  </Collapse>
                  
                  {/* File Modified Rule */}
                  <ListItem divider>
                    <ListItemIcon>
                      <Info color={notificationConfig.rules.fileModified.enabled ? "info" : "disabled"} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="File Modified&quot;
                      secondary="Notify when a file is modified in storage"
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormControl sx={{ minWidth: 120, mr: 2 }}>
                        <InputLabel>Severity</InputLabel>
                        <Select
                          value={notificationConfig.rules.fileModified.severity}
                          onChange={(e) => handleRuleSeverityChange('fileModified', e.target.value)}
                          label="Severity&quot;
                          size="small"
                          disabled={!notificationConfig.rules.fileModified.enabled}
                        >
                          <MenuItem value="info&quot;>Info</MenuItem>
                          <MenuItem value="warning">Warning</MenuItem>
                          <MenuItem value="error&quot;>Error</MenuItem>
                        </Select>
                      </FormControl>
                      <Switch
                        checked={notificationConfig.rules.fileModified.enabled}
                        onChange={() => handleToggleRule("fileModified')}
                        edge="end&quot;
                      />
                    </Box>
                  </ListItem>
                  
                  <Collapse in={notificationConfig.rules.fileModified.enabled}>
                    <Box sx={{ pl: 4, pr: 2, py: 1, bgcolor: "background.default' }}>
                      <Typography variant="subtitle2&quot; gutterBottom>
                        Notification Channels
                      </Typography>
                      <Box sx={{ display: "flex', flexWrap: 'wrap', gap: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={notificationConfig.rules.fileModified.channels.includes('email')}
                              onChange={() => handleRuleChannelToggle('fileModified', 'email')}
                              disabled={!notificationConfig.channels.email.enabled}
                            />
                          }
                          label="Email&quot;
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={notificationConfig.rules.fileModified.channels.includes("inApp')}
                              onChange={() => handleRuleChannelToggle('fileModified', 'inApp')}
                              disabled={!notificationConfig.channels.inApp.enabled}
                            />
                          }
                          label="In-App&quot;
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={notificationConfig.rules.fileModified.channels.includes("webhook')}
                              onChange={() => handleRuleChannelToggle('fileModified', 'webhook')}
                              disabled={!notificationConfig.channels.webhook.enabled}
                            />
                          }
                          label="Webhook&quot;
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={notificationConfig.rules.fileModified.channels.includes("slack')}
                              onChange={() => handleRuleChannelToggle('fileModified', 'slack')}
                              disabled={!notificationConfig.channels.slack.enabled}
                            />
                          }
                          label="Slack&quot;
                        />
                      </Box>
                    </Box>
                  </Collapse>
                  
                  {/* File Deleted Rule */}
                  <ListItem divider>
                    <ListItemIcon>
                      <Warning color={notificationConfig.rules.fileDeleted.enabled ? "warning" : "disabled"} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="File Deleted&quot;
                      secondary="Notify when a file is deleted from storage"
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormControl sx={{ minWidth: 120, mr: 2 }}>
                        <InputLabel>Severity</InputLabel>
                        <Select
                          value={notificationConfig.rules.fileDeleted.severity}
                          onChange={(e) => handleRuleSeverityChange('fileDeleted', e.target.value)}
                          label="Severity&quot;
                          size="small"
                          disabled={!notificationConfig.rules.fileDeleted.enabled}
                        >
                          <MenuItem value="info&quot;>Info</MenuItem>
                          <MenuItem value="warning">Warning</MenuItem>
                          <MenuItem value="error&quot;>Error</MenuItem>
                        </Select>
                      </FormControl>
                      <Switch
                        checked={notificationConfig.rules.fileDeleted.enabled}
                        onChange={() => handleToggleRule("fileDeleted')}
                        edge="end&quot;
                      />
                    </Box>
                  </ListItem>
                  
                  <Collapse in={notificationConfig.rules.fileDeleted.enabled}>
                    <Box sx={{ pl: 4, pr: 2, py: 1, bgcolor: "background.default' }}>
                      <Typography variant="subtitle2&quot; gutterBottom>
                        Notification Channels
                      </Typography>
                      <Box sx={{ display: "flex', flexWrap: 'wrap', gap: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={notificationConfig.rules.fileDeleted.channels.includes('email')}
                              onChange={() => handleRuleChannelToggle('fileDeleted', 'email')}
                              disabled={!notificationConfig.channels.email.enabled}
                            />
                          }
                          label="Email&quot;
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={notificationConfig.rules.fileDeleted.channels.includes("inApp')}
                              onChange={() => handleRuleChannelToggle('fileDeleted', 'inApp')}
                              disabled={!notificationConfig.channels.inApp.enabled}
                            />
                          }
                          label="In-App&quot;
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={notificationConfig.rules.fileDeleted.channels.includes("webhook')}
                              onChange={() => handleRuleChannelToggle('fileDeleted', 'webhook')}
                              disabled={!notificationConfig.channels.webhook.enabled}
                            />
                          }
                          label="Webhook&quot;
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={notificationConfig.rules.fileDeleted.channels.includes("slack')}
                              onChange={() => handleRuleChannelToggle('fileDeleted', 'slack')}
                              disabled={!notificationConfig.channels.slack.enabled}
                            />
                          }
                          label="Slack&quot;
                        />
                      </Box>
                    </Box>
                  </Collapse>
                  
                  {/* Trigger Executed Rule */}
                  <ListItem divider>
                    <ListItemIcon>
                      <PlayArrow color={notificationConfig.rules.triggerExecuted.enabled ? "primary" : "disabled"} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Trigger Executed&quot;
                      secondary="Notify when a workflow trigger executes"
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormControl sx={{ minWidth: 120, mr: 2 }}>
                        <InputLabel>Severity</InputLabel>
                        <Select
                          value={notificationConfig.rules.triggerExecuted.severity}
                          onChange={(e) => handleRuleSeverityChange('triggerExecuted', e.target.value)}
                          label="Severity&quot;
                          size="small"
                          disabled={!notificationConfig.rules.triggerExecuted.enabled}
                        >
                          <MenuItem value="info&quot;>Info</MenuItem>
                          <MenuItem value="warning">Warning</MenuItem>
                          <MenuItem value="error&quot;>Error</MenuItem>
                        </Select>
                      </FormControl>
                      <Switch
                        checked={notificationConfig.rules.triggerExecuted.enabled}
                        onChange={() => handleToggleRule("triggerExecuted')}
                        edge="end&quot;
                      />
                    </Box>
                  </ListItem>
                  
                  <Collapse in={notificationConfig.rules.triggerExecuted.enabled}>
                    <Box sx={{ pl: 4, pr: 2, py: 1, bgcolor: "background.default' }}>
                      <Typography variant="subtitle2&quot; gutterBottom>
                        Notification Channels
                      </Typography>
                      <Box sx={{ display: "flex', flexWrap: 'wrap', gap: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={notificationConfig.rules.triggerExecuted.channels.includes('email')}
                              onChange={() => handleRuleChannelToggle('triggerExecuted', 'email')}
                              disabled={!notificationConfig.channels.email.enabled}
                            />
                          }
                          label="Email&quot;
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={notificationConfig.rules.triggerExecuted.channels.includes("inApp')}
                              onChange={() => handleRuleChannelToggle('triggerExecuted', 'inApp')}
                              disabled={!notificationConfig.channels.inApp.enabled}
                            />
                          }
                          label="In-App&quot;
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={notificationConfig.rules.triggerExecuted.channels.includes("webhook')}
                              onChange={() => handleRuleChannelToggle('triggerExecuted', 'webhook')}
                              disabled={!notificationConfig.channels.webhook.enabled}
                            />
                          }
                          label="Webhook&quot;
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={notificationConfig.rules.triggerExecuted.channels.includes("slack')}
                              onChange={() => handleRuleChannelToggle('triggerExecuted', 'slack')}
                              disabled={!notificationConfig.channels.slack.enabled}
                            />
                          }
                          label="Slack&quot;
                        />
                      </Box>
                    </Box>
                  </Collapse>
                  
                  {/* Error Rule */}
                  <ListItem>
                    <ListItemIcon>
                      <Error color={notificationConfig.rules.error.enabled ? "error" : "disabled"} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Error Notification&quot;
                      secondary="Notify when an error occurs in storage operations"
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormControl sx={{ minWidth: 120, mr: 2 }}>
                        <InputLabel>Severity</InputLabel>
                        <Select
                          value={notificationConfig.rules.error.severity}
                          onChange={(e) => handleRuleSeverityChange('error', e.target.value)}
                          label="Severity&quot;
                          size="small"
                          disabled={!notificationConfig.rules.error.enabled}
                        >
                          <MenuItem value="info&quot;>Info</MenuItem>
                          <MenuItem value="warning">Warning</MenuItem>
                          <MenuItem value="error&quot;>Error</MenuItem>
                        </Select>
                      </FormControl>
                      <Switch
                        checked={notificationConfig.rules.error.enabled}
                        onChange={() => handleToggleRule("error')}
                        edge="end&quot;
                      />
                    </Box>
                  </ListItem>
                  
                  <Collapse in={notificationConfig.rules.error.enabled}>
                    <Box sx={{ pl: 4, pr: 2, py: 1, bgcolor: "background.default' }}>
                      <Typography variant="subtitle2&quot; gutterBottom>
                        Notification Channels
                      </Typography>
                      <Box sx={{ display: "flex', flexWrap: 'wrap', gap: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={notificationConfig.rules.error.channels.includes('email')}
                              onChange={() => handleRuleChannelToggle('error', 'email')}
                              disabled={!notificationConfig.channels.email.enabled}
                            />
                          }
                          label="Email&quot;
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={notificationConfig.rules.error.channels.includes("inApp')}
                              onChange={() => handleRuleChannelToggle('error', 'inApp')}
                              disabled={!notificationConfig.channels.inApp.enabled}
                            />
                          }
                          label="In-App&quot;
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={notificationConfig.rules.error.channels.includes("webhook')}
                              onChange={() => handleRuleChannelToggle('error', 'webhook')}
                              disabled={!notificationConfig.channels.webhook.enabled}
                            />
                          }
                          label="Webhook&quot;
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={notificationConfig.rules.error.channels.includes("slack')}
                              onChange={() => handleRuleChannelToggle('error', 'slack')}
                              disabled={!notificationConfig.channels.slack.enabled}
                            />
                          }
                          label="Slack&quot;
                        />
                      </Box>
                    </Box>
                  </Collapse>
                </List>
              </Paper>
            </Box>
          </Box>
        )}
        
        {/* History Tab */}
        {activeTab === 2 && (
          <Box>
            <ConfigurationSection>
              <Grid container alignItems="center" justifyContent="space-between&quot;>
                <Grid item>
                  <Typography variant="subtitle1" gutterBottom>
                    Notification History
                  </Typography>
                  <Typography variant="body2&quot; color="textSecondary">
                    View past notifications and their status.
                  </Typography>
                </Grid>
                <Grid item>
                  <Stack direction="row&quot; spacing={1}>
                    <Chip 
                      label={`${notificationCounts.total} Total`}
                      variant="outlined"
                      size="small&quot;
                    />
                    <Chip 
                      label={`${notificationCounts.error} Errors`}
                      color="error"
                      variant="outlined&quot;
                      size="small"
                    />
                    <Chip 
                      label={`${notificationCounts.warning} Warnings`}
                      color="warning&quot;
                      variant="outlined"
                      size="small&quot;
                    />
                    <Chip 
                      label={`${notificationCounts.unread} Unread`}
                      color="primary"
                      variant="outlined&quot;
                      size="small"
                    />
                  </Stack>
                </Grid>
              </Grid>
            </ConfigurationSection>
            
            {notifications.length === 0 ? (
              <EmptyStateContainer>
                <NotificationsOffIcon fontSize="large&quot; color="disabled" sx={{ mb: 2 }} />
                <Typography variant="h6&quot;>No notifications yet</Typography>
                <Typography variant="body2" color="textSecondary&quot; align="center">
                  Notifications will appear here when file events occur.
                </Typography>
                <Button
                  variant="outlined&quot;
                  startIcon={<NotificationsActiveIcon />}
                  sx={{ mt: 2 }}
                  onClick={() => setTestNotificationDialogOpen(true)}
                >
                  Send Test Notification
                </Button>
              </EmptyStateContainer>
            ) : (
              <Box>
                <NotificationList>
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      severity={notification.severity}
                      sx={{ opacity: notification.read ? 0.7 : 1 }}
                    >
                      <ListItemIcon>
                        {getEventTypeIcon(notification.type, notification.severity)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex', alignItems: 'center' }}>
                            <Typography 
                              variant="subtitle2&quot; 
                              component="span"
                              sx={{ mr: 1 }}
                            >
                              {notification.message}
                            </Typography>
                            {!notification.read && (
                              <Chip
                                label="New&quot;
                                size="small"
                                color="primary&quot;
                                sx={{ height: 20 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary&quot;>
                              {notification.file.name} {notification.file.path && `(${notification.file.path})`}
                            </Typography>
                            <Typography variant="body2" color="textSecondary&quot;>
                              {formatDate(notification.timestamp)}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: "flex', alignItems: 'center' }}>
                        <CategoryChip
                          label={getEventTypeName(notification.type)}
                          size="small&quot;
                          color={
                            notification.severity === "error' ? 'error' :
                            notification.severity === 'warning' ? 'warning' :
                            'primary'
                          }
                          variant="outlined&quot;
                        />
                      </Box>
                    </NotificationItem>
                  ))}
                </NotificationList>
              </Box>
            )}
          </Box>
        )}
        
        {/* Settings Tab */}
        {activeTab === 3 && (
          <Box>
            <ConfigurationSection>
              <Typography variant="subtitle1" gutterBottom>
                Notification Settings
              </Typography>
              <Typography variant="body2&quot; color="textSecondary" gutterBottom>
                Configure global notification preferences and filtering options.
              </Typography>
            </ConfigurationSection>
            
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2&quot; gutterBottom>
                Global Preferences
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationConfig.preferences.batchNotifications}
                          onChange={(e) => handlePreferenceChange('batchNotifications', e.target.checked)}
                        />
                      }
                      label="Batch notifications (reduce frequency)&quot;
                    />
                  </Grid>
                  
                  {notificationConfig.preferences.batchNotifications && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Batch Interval (minutes)"
                        type="number&quot;
                        value={notificationConfig.preferences.batchInterval}
                        onChange={(e) => handlePreferenceChange("batchInterval', parseInt(e.target.value) || 15)}
                        fullWidth
                        InputProps={{ inputProps: { min: 1, max: 1440 } }}
                      />
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationConfig.preferences.quietHours.enabled}
                          onChange={(e) => handlePreferenceChange('quietHours.enabled', e.target.checked)}
                        />
                      }
                      label="Enable quiet hours (suppress notifications during set hours)&quot;
                    />
                  </Grid>
                  
                  {notificationConfig.preferences.quietHours.enabled && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Start Time"
                          type="time&quot;
                          value={notificationConfig.preferences.quietHours.start}
                          onChange={(e) => handlePreferenceChange("quietHours.start', e.target.value)}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="End Time&quot;
                          type="time"
                          value={notificationConfig.preferences.quietHours.end}
                          onChange={(e) => handlePreferenceChange('quietHours.end', e.target.value)}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Paper>
              
              <Typography variant="subtitle2&quot; gutterBottom>
                Notification Filtering
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="File Patterns to Monitor&quot;
                      value={notificationConfig.filtering.filePatterns}
                      onChange={(e) => handleFilteringChange("filePatterns', e.target.value)}
                      fullWidth
                      helperText="Use wildcards like *.csv or data_*.json (comma-separated)&quot;
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Minimum Severity Level</InputLabel>
                      <Select
                        value={notificationConfig.filtering.minSeverity}
                        onChange={(e) => handleFilteringChange("minSeverity', e.target.value)}
                        label="Minimum Severity Level&quot;
                      >
                        <MenuItem value="info">Info (All notifications)</MenuItem>
                        <MenuItem value="warning&quot;>Warning and above</MenuItem>
                        <MenuItem value="error">Error only</MenuItem>
                      </Select>
                      <FormHelperText>Only notifications at or above this severity will be sent</FormHelperText>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2&quot; gutterBottom>
                      Notification Categories
                    </Typography>
                    <Box sx={{ display: "flex', flexWrap: 'wrap', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={notificationConfig.filtering.categories.includes('file')}
                            onChange={(e) => {
                              const newCategories = e.target.checked
                                ? [...notificationConfig.filtering.categories, 'file']
                                : notificationConfig.filtering.categories.filter(c => c !== 'file');
                              handleFilteringChange('categories', newCategories);
                            }}
                          />
                        }
                        label="File Events&quot;
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={notificationConfig.filtering.categories.includes("trigger')}
                            onChange={(e) => {
                              const newCategories = e.target.checked
                                ? [...notificationConfig.filtering.categories, 'trigger']
                                : notificationConfig.filtering.categories.filter(c => c !== 'trigger');
                              handleFilteringChange('categories', newCategories);
                            }}
                          />
                        }
                        label="Trigger Events&quot;
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={notificationConfig.filtering.categories.includes("error')}
                            onChange={(e) => {
                              const newCategories = e.target.checked
                                ? [...notificationConfig.filtering.categories, 'error']
                                : notificationConfig.filtering.categories.filter(c => c !== 'error');
                              handleFilteringChange('categories', newCategories);
                            }}
                          />
                        }
                        label="Errors&quot;
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </Box>
        )}
      </NotificationContent>
      
      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider', display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined&quot;
          startIcon={<NotificationsActiveIcon />}
          onClick={() => setTestNotificationDialogOpen(true)}
        >
          Test Notification
        </Button>
        
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSaveConfig}
          disabled={loading}
        >
          Save Settings
        </Button>
      </Box>
      
      {/* Test Notification Dialog */}
      <Dialog
        open={testNotificationDialogOpen}
        onClose={() => setTestNotificationDialogOpen(false)}
        maxWidth="sm&quot;
        fullWidth
      >
        <DialogTitle>
          Send Test Notification
        </DialogTitle>
        
        <DialogContent dividers>
          <Typography gutterBottom>
            Send a test notification to verify your configuration is working correctly.
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Event Type</InputLabel>
            <Select
              value={testNotificationType}
              onChange={(e) => setTestNotificationType(e.target.value)}
              label="Event Type"
            >
              <MenuItem value="fileCreated&quot;>File Created</MenuItem>
              <MenuItem value="fileModified">File Modified</MenuItem>
              <MenuItem value="fileDeleted&quot;>File Deleted</MenuItem>
              <MenuItem value="triggerExecuted">Trigger Executed</MenuItem>
              <MenuItem value="error&quot;>Error</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Notification will be sent to:
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {notificationConfig.rules[testNotificationType].channels.map(channel => (
                <Chip
                  key={channel}
                  label={
                    channel === 'email' ? 'Email' :
                    channel === 'inApp' ? 'In-App' :
                    channel === 'webhook' ? 'Webhook' :
                    channel === 'slack' ? 'Slack' : 
                    channel
                  }
                  color="primary&quot;
                  size="small"
                  disabled={!notificationConfig.channels[channel].enabled}
                />
              ))}
              
              {notificationConfig.rules[testNotificationType].channels.length === 0 && (
                <Typography variant="body2&quot; color="error">
                  No channels configured for this event type
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button
            onClick={() => setTestNotificationDialogOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendTestNotification}
            variant="contained&quot;
            color="primary"
            disabled={loading || notificationConfig.rules[testNotificationType].channels.length === 0}
            startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
          >
            Send Test
          </Button>
        </DialogActions>
      </Dialog>
    </NotificationContainer>
  );
};

FileNotificationSystem.propTypes = {
  storageType: PropTypes.oneOf(['s3', 'azure', 'sharepoint']),
  containerName: PropTypes.string,
  resourcePath: PropTypes.string,
  credentials: PropTypes.object,
  onChange: PropTypes.func,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  initialConfig: PropTypes.object,
  onSendTestNotification: PropTypes.func
};

export default FileNotificationSystem;