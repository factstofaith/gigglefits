import React from 'react';
import PropTypes from 'prop-types';
import { Chip, Tooltip } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  Warning as WarningIcon,
  HourglassEmpty as HourglassEmptyIcon,
  QuestionMark as QuestionMarkIcon
} from '@mui/icons-material';

/**
 * ApplicationStatusBadge component
 * 
 * Displays a chip with the status of an application with appropriate
 * color and icon for each status type.
 */
const ApplicationStatusBadge = ({ status, size = 'small' }) => {
  // Define configuration for each status type
  const statusConfig = {
    draft: {
      label: 'Draft',
      color: 'info',
      icon: <EditIcon fontSize="small" />,
      tooltip: 'This application is in draft mode and is not published to users'
    },
    active: {
      label: 'Active',
      color: 'success',
      icon: <CheckCircleIcon fontSize="small" />,
      tooltip: 'This application is active and available to users'
    },
    inactive: {
      label: 'Inactive',
      color: 'error',
      icon: <BlockIcon fontSize="small" />,
      tooltip: 'This application is currently inactive and unavailable to users'
    },
    deprecated: {
      label: 'Deprecated',
      color: 'warning',
      icon: <WarningIcon fontSize="small" />,
      tooltip: 'This application is deprecated and will be removed in the future'
    },
    pending_review: {
      label: 'Pending Review',
      color: 'info',
      icon: <HourglassEmptyIcon fontSize="small" />,
      tooltip: 'This application is pending review before publication'
    }
  };

  // Use default configuration if status is not recognized
  const config = statusConfig[status] || {
    label: status || 'Unknown',
    color: 'default',
    icon: <QuestionMarkIcon fontSize="small" />,
    tooltip: 'Unknown application status'
  };

  return (
    <Tooltip title={config.tooltip} arrow>
      <Chip
        label={config.label}
        color={config.color}
        size={size}
        icon={config.icon}
        variant="filled"
      />
    </Tooltip>
  );
};

ApplicationStatusBadge.propTypes = {
  /**
   * The status of the application. Can be one of:
   * - draft: Application is in draft mode
   * - active: Application is active and published
   * - inactive: Application is inactive
   * - deprecated: Application is deprecated
   * - pending_review: Application is pending review
   */
  status: PropTypes.oneOf(['draft', 'active', 'inactive', 'deprecated', 'pending_review', '']),
  
  /**
   * Size of the chip. Can be 'small' or 'medium'.
   */
  size: PropTypes.oneOf(['small', 'medium'])
};

export default ApplicationStatusBadge;