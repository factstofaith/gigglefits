// IntegrationHealthBar.jsx
// -----------------------------------------------------------------------------
// A modern, color-coded status indicator for integration health

import React from 'react';
import { Box } from '../../design-system'
import { Chip } from '../../design-system'
import { useTheme } from '@design-system/foundations/theme';
import {
import { Box } from '../../design-system';
// Design system import already exists;
;
CheckCircle as HealthyIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

function IntegrationHealthBar({ health = 'healthy', size = 'medium', withLabel = true, tooltip }) {
  // Added display name
  IntegrationHealthBar.displayName = 'IntegrationHealthBar';

  const { theme } = useTheme();

  // Configuration based on health status
  const config = {
    healthy: {
      color: theme?.colors?.success?.main || '#27AE60',
      bgcolor: theme?.colors?.success?.light || '#E6F5EB',
      label: 'Healthy',
      icon: <HealthyIcon fontSize={size === 'small' ? 'small' : 'medium'} />,
      description: 'This integration is running normally with no issues',
    },
    warning: {
      color: theme?.colors?.warning?.main || '#F2994A',
      bgcolor: theme?.colors?.warning?.light || '#FDF4E7',
      label: 'At Risk',
      icon: <WarningIcon fontSize={size === 'small' ? 'small' : 'medium'} />,
      description: 'This integration has potential issues that need attention',
    },
    error: {
      color: theme?.colors?.error?.main || '#EB5757',
      bgcolor: theme?.colors?.error?.light || '#FCEDED',
      label: 'Error',
      icon: <ErrorIcon fontSize={size === 'small' ? 'small' : 'medium'} />,
      description: 'This integration has failed and requires immediate attention',
    },
  };

  // Get config based on health status (default to healthy if invalid)
  const statusConfig = config[health] || config.healthy;

  // Use tooltip text if provided, otherwise use default description
  const tooltipText = tooltip || statusConfig.description;

  const renderContent = () => {
  // Added display name
  renderContent.displayName = 'renderContent';

  // Added display name
  renderContent.displayName = 'renderContent';

  // Added display name
  renderContent.displayName = 'renderContent';

  // Added display name
  renderContent.displayName = 'renderContent';

  // Added display name
  renderContent.displayName = 'renderContent';


    if (size === 'dot') {
      // Simple colored dot indicator
      return (
        <Box
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: statusConfig.color,
            display: 'inline-block',
          }}
        />
      );
    }

    // Badge-style health indicator
    return (
      <Chip
        icon={statusConfig.icon}
        label={withLabel ? statusConfig.label : undefined}
        size={size}
        variant="outlined&quot;
        style={{
          background: `rgba(${hexToRGB(statusConfig.color)}, 0.12)`,
          color: statusConfig.color,
          fontWeight: 600,
          borderColor: `rgba(${hexToRGB(statusConfig.color)}, 0.3)`,
        }}
        iconStyle={{
          color: statusConfig.color,
        }}
      />
    );
  };

  return (
    <Box 
      title={tooltipText}
      style={{ display: "inline-block' }}
    >
      {renderContent()}
    </Box>
  );
}

// Helper function to convert hex color to RGB
function hexToRGB(hex) {
  // Added display name
  hexToRGB.displayName = 'hexToRGB';

  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `${r}, ${g}, ${b}`;
}

export default IntegrationHealthBar;
