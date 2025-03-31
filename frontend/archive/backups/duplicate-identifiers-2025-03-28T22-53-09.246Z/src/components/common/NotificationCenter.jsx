// NotificationCenter.jsx
import React, { useState } from 'react';

// Design system components
import { Box } from '../../design-system'
import { Typography, Button } from '../../design-system'
import { Avatar, Badge } from '../../design-system'
import { Menu } from '../../design-system'
import { useTheme } from '@design-system/foundations/theme';

// Still using some Material UI components until design system equivalents are ready
import { List, ListItem, ListItemText, Tooltip } from '../../design-system';
import IconButton from '@mui/material/IconButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';;
import {
  Notifications as NotificationsIcon,
  CheckCircleOutline as SuccessIcon,
  ErrorOutline as ErrorIcon,
  WarningAmber as WarningIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import useNotification from '@hooks/useNotification';
import { formatDistanceToNow } from 'date-fns';
import Box from '@mui/material/Box';
const NotificationCenter = () => {
  // Added display name
  NotificationCenter.displayName = 'NotificationCenter';

  // Added display name
  NotificationCenter.displayName = 'NotificationCenter';

  // Added display name
  NotificationCenter.displayName = 'NotificationCenter';


  const { theme } = useTheme();
  const { notifications, unreadCount, removeNotification, markAsRead, markAllAsRead, clearAll } =
    useNotification();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Handle menu open
  const handleClick = event => {
    setAnchorEl(event.currentTarget);
    // Mark all as read when opening the menu
    if (unreadCount > 0) {
      markAllAsRead();
    }
  };

  // Handle menu close
  const handleClose = () => {
  // Added display name
  handleClose.displayName = 'handleClose';

  // Added display name
  handleClose.displayName = 'handleClose';

  // Added display name
  handleClose.displayName = 'handleClose';


    setAnchorEl(null);
  };

  // Get the appropriate icon based on notification type
  const getNotificationIcon = type => {
    switch (type) {
      case 'success':
        return <SuccessIcon style={{ color: theme?.colors?.success?.main || '#2e7d32' }} />;
      case 'error':
        return <ErrorIcon style={{ color: theme?.colors?.error?.main || '#d32f2f' }} />;
      case 'warning':
        return <WarningIcon style={{ color: theme?.colors?.warning?.main || '#ed6c02' }} />;
      case 'info':
      default:
        return <InfoIcon style={{ color: theme?.colors?.info?.main || '#0288d1' }} />;
    }
  };

  // Format notification timestamp
  const formatTimestamp = timestamp => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton color="inherit" onClick={handleClick} style={{ position: 'relative' }}>
          <Badge badgeContent={unreadCount} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        style={{
          width: 360,
          maxHeight: 480,
          overflow: 'auto',
          marginTop: '12px',
          boxShadow: theme?.shadows?.[3] || '0 4px 20px 0 rgba(0,0,0,0.1)',
        }}
        placement="bottom-end"
      >
        <Box style={{ 
          padding: '16px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Typography variant="h6">Notifications</Typography>
          <Box>
            <Tooltip title="Mark all as read">
              <IconButton size="small" onClick={markAllAsRead} disabled={unreadCount === 0}>
                <DoneAllIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear all">
              <IconButton size="small" onClick={clearAll} disabled={notifications.length === 0}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box 
          style={{ 
            height: '1px', 
            backgroundColor: theme?.colors?.divider || '#e0e0e0', 
            width: '100%' 
          }} 
        />

        {notifications.length === 0 ? (
          <Box style={{ padding: '24px', textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              style={{ color: theme?.colors?.text?.secondary || '#666666' }}
            >
              No notifications
            </Typography>
          </Box>
        ) : (
          <>
            <List style={{ padding: 0 }}>
              {notifications.map(notification => {
                // Determine notification type colors
                const typeColor = theme?.colors?.[notification.type || 'info']?.main || 
                  (notification.type === 'success' ? '#2e7d32' : 
                   notification.type === 'error' ? '#d32f2f' :
                   notification.type === 'warning' ? '#ed6c02' : '#0288d1');
                   
                const typeLightColor = theme?.colors?.[notification.type || 'info']?.light || 
                  (notification.type === 'success' ? '#e8f5e9' : 
                   notification.type === 'error' ? '#ffebee' :
                   notification.type === 'warning' ? '#fff3e0' : '#e1f5fe');
                   
                const hoverColor = theme?.colors?.action?.hover || 'rgba(0, 0, 0, 0.04)';
                
                return (
                  <ListItem
                    key={notification.id}
                    alignItems="flex-start"
                    style={{
                      borderLeft: `3px solid ${typeColor}`,
                      backgroundColor: notification.read ? 'transparent' : hoverColor,
                    }}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => removeNotification(notification.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar 
                        style={{ 
                          backgroundColor: typeLightColor 
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle2"
                          style={{ fontWeight: notification.read ? 'normal' : 'bold' }}
                        >
                          {notification.title || 'Notification'}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            style={{ 
                              color: theme?.colors?.text?.primary || '#000000',
                              display: 'block', 
                              marginBottom: '4px' 
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            style={{ color: theme?.colors?.text?.secondary || '#666666' }}
                          >
                            {formatTimestamp(notification.timestamp)}
                          </Typography>
                          {notification.actionLabel && (
                            <Button
                              size="small"
                              style={{ marginTop: '8px' }}
                              onClick={() => {
                                notification.onActionClick?.();
                                handleClose();
                              }}
                            >
                              {notification.actionLabel}
                            </Button>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>

            {notifications.length > 5 && (
              <Box style={{ padding: '16px', textAlign: 'center' }}>
                <Button size="small" onClick={handleClose}>
                  View All
                </Button>
              </Box>
            )}
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationCenter;
