import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Chip, 
  Tooltip, 
  Typography, 
  useTheme,
  Badge,
  LinearProgress,
  Stack,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  Warning as WarningIcon,
  HourglassEmpty as HourglassEmptyIcon,
  QuestionMark as QuestionMarkIcon,
  History as HistoryIcon,
  Sync as SyncIcon,
  Notifications as NotificationsIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';

// Styled components
const StatusContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
}));

const StatusIconWrapper = styled(Box)(({ theme, status }) => {
  const getColor = () => {
    switch (status) {
      case 'active': return theme.palette.success.main;
      case 'draft': return theme.palette.info.main;
      case 'inactive': return theme.palette.error.main;
      case 'deprecated': return theme.palette.warning.main;
      case 'pending_review': return theme.palette.info.main;
      case 'error': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    padding: theme.spacing(1),
    backgroundColor: `${getColor()}20`, // 20% opacity
    color: getColor(),
    marginBottom: theme.spacing(1),
    position: 'relative',
  };
});

const DetailPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(1),
  width: '100%',
}));

/**
 * EnhancedStatusIndicator component
 * 
 * A comprehensive status indicator for applications that shows 
 * detailed status information including last update, execution status,
 * and other relevant metrics.
 */
const EnhancedStatusIndicator = ({
  status,
  lastUpdated,
  lastExecution,
  executionStatus,
  hasErrors = false,
  pendingChanges = false,
  usageMetrics = null,
  pendingNotifications = 0,
  dueForReview = false,
  variant = 'badge',
}) => {
  const theme = useTheme();

  // Define configuration for each status type
  const statusConfig = {
    draft: {
      label: 'Draft',
      color: 'info',
      icon: <EditIcon fontSize="medium" />,
      tooltip: 'This application is in draft mode and is not published to users',
      description: 'This application is in draft mode. It can be edited but is not available to end users.',
    },
    active: {
      label: 'Active',
      color: 'success',
      icon: <CheckCircleIcon fontSize="medium" />,
      tooltip: 'This application is active and available to users',
      description: 'This application is active and available to all authorized users.',
    },
    inactive: {
      label: 'Inactive',
      color: 'error',
      icon: <BlockIcon fontSize="medium" />,
      tooltip: 'This application is currently inactive and unavailable to users',
      description: 'This application is currently inactive. It exists but is not available to any users.',
    },
    deprecated: {
      label: 'Deprecated',
      color: 'warning',
      icon: <WarningIcon fontSize="medium" />,
      tooltip: 'This application is deprecated and will be removed in the future',
      description: 'This application is deprecated and scheduled for removal. Users should migrate to alternatives.',
    },
    pending_review: {
      label: 'Pending Review',
      color: 'info',
      icon: <HourglassEmptyIcon fontSize="medium" />,
      tooltip: 'This application is pending review before publication',
      description: 'This application is awaiting review before it can be published to users.',
    },
    error: {
      label: 'Error',
      color: 'error',
      icon: <ErrorIcon fontSize="medium" />,
      tooltip: 'This application is in an error state',
      description: 'This application is experiencing errors that need to be addressed.',
    },
  };

  // Use default configuration if status is not recognized
  const config = statusConfig[status] || {
    label: status || 'Unknown',
    color: 'default',
    icon: <QuestionMarkIcon fontSize="medium" />,
    tooltip: 'Unknown application status',
    description: 'The status of this application is unknown.',
  };

  // Render a simple badge variant
  if (variant === 'badge') {
    return (
      <Tooltip title={config.tooltip} arrow>
        <Badge
          badgeContent={
            hasErrors ? (
              <ErrorIcon fontSize="small" color="error" />
            ) : pendingChanges ? (
              <SyncIcon fontSize="small" color="info" />
            ) : pendingNotifications > 0 ? (
              <NotificationsIcon fontSize="small" color="primary" />
            ) : null
          }
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          overlap="circular"
        >
          <Chip
            label={config.label}
            color={config.color}
            size="small"
            icon={config.icon}
            variant="filled"
            sx={{ 
              minWidth: '90px',
              '.MuiChip-label': {
                fontWeight: 500,
              }
            }}
          />
        </Badge>
      </Tooltip>
    );
  }

  // Render a comprehensive detail variant
  return (
    <StatusContainer>
      <Tooltip title={config.tooltip} arrow>
        <Badge
          badgeContent={
            hasErrors ? (
              <ErrorIcon fontSize="small" color="error" />
            ) : pendingChanges ? (
              <SyncIcon fontSize="small" color="info" />
            ) : pendingNotifications > 0 ? (
              <NotificationsIcon fontSize="small" color="warning" />
            ) : null
          }
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          overlap="circular"
        >
          <StatusIconWrapper status={status}>
            {config.icon}
          </StatusIconWrapper>
        </Badge>
      </Tooltip>
      
      <Typography variant="subtitle1" fontWeight={500} color={theme.palette[config.color].main}>
        {config.label}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 0.5 }}>
        {config.description}
      </Typography>
      
      <DetailPaper variant="outlined">
        <Stack spacing={1.5}>
          {lastUpdated && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </Typography>
            </Box>
          )}
          
          {lastExecution && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HistoryIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                Last execution: {new Date(lastExecution).toLocaleString()}
              </Typography>
            </Box>
          )}
          
          {executionStatus && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">Execution status</Typography>
                <Typography variant="caption" fontWeight={500}>
                  {executionStatus.status}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={executionStatus.progress} 
                color={
                  executionStatus.status === 'running' ? 'primary' :
                  executionStatus.status === 'success' ? 'success' :
                  executionStatus.status === 'failed' ? 'error' : 'warning'
                }
              />
            </Box>
          )}
          
          {usageMetrics && (
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5 }}>Usage metrics</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Tooltip title="Total executions">
                  <Chip 
                    label={`${usageMetrics.executions} runs`} 
                    size="small" 
                    variant="outlined" 
                  />
                </Tooltip>
                <Tooltip title="Active users">
                  <Chip 
                    label={`${usageMetrics.users} users`} 
                    size="small" 
                    variant="outlined" 
                  />
                </Tooltip>
              </Box>
            </Box>
          )}
          
          {pendingNotifications > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <NotificationsIcon fontSize="small" sx={{ mr: 1, color: theme.palette.warning.main }} />
              <Typography variant="body2" color="warning.main">
                {pendingNotifications} pending notification{pendingNotifications !== 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
          
          {dueForReview && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WarningIcon fontSize="small" sx={{ mr: 1, color: theme.palette.warning.main }} />
              <Typography variant="body2" color="warning.main">
                Due for review
              </Typography>
            </Box>
          )}
        </Stack>
      </DetailPaper>
    </StatusContainer>
  );
};

EnhancedStatusIndicator.propTypes = {
  /**
   * The status of the application
   */
  status: PropTypes.oneOf([
    'draft', 
    'active', 
    'inactive', 
    'deprecated', 
    'pending_review', 
    'error', 
    ''
  ]).isRequired,
  
  /**
   * ISO datetime string of when the application was last updated
   */
  lastUpdated: PropTypes.string,
  
  /**
   * ISO datetime string of when the application was last executed
   */
  lastExecution: PropTypes.string,
  
  /**
   * Current execution status and progress
   */
  executionStatus: PropTypes.shape({
    status: PropTypes.oneOf(['idle', 'running', 'success', 'failed', 'warning']),
    progress: PropTypes.number,
  }),
  
  /**
   * Whether the application has errors
   */
  hasErrors: PropTypes.bool,
  
  /**
   * Whether the application has pending changes
   */
  pendingChanges: PropTypes.bool,
  
  /**
   * Usage metrics for the application
   */
  usageMetrics: PropTypes.shape({
    executions: PropTypes.number,
    users: PropTypes.number,
  }),
  
  /**
   * Number of pending notifications for this application
   */
  pendingNotifications: PropTypes.number,
  
  /**
   * Whether the application is due for review
   */
  dueForReview: PropTypes.bool,
  
  /**
   * Variant of the status indicator to render
   */
  variant: PropTypes.oneOf(['badge', 'detail']),
};

export default EnhancedStatusIndicator;