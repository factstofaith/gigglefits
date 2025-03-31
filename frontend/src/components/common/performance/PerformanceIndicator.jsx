/**
 * Performance Indicator Component
 * 
 * A component for displaying performance health in the UI.
 * Part of the zero technical debt performance implementation.
 * 
 * @module components/common/performance/PerformanceIndicator
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  IconButton, 
  Tooltip, 
  Menu, 
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Divider
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewListIcon from '@mui/icons-material/ViewList';

import { usePerformanceMonitoring } from './PerformanceMonitoringProvider';

/**
 * Performance Indicator Component
 * 
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const PerformanceIndicator = ({ 
  size = 'medium', 
  showBadge = true,
  showTooltip = true,
  showMenu = true,
  hideInProduction = true
}) => {
  // Get performance context
  const { 
    isMonitoringEnabled, 
    toggleMonitoring, 
    checkPerformance, 
    resetMetrics, 
    generateReport,
    violationCount,
    isDevelopment
  } = usePerformanceMonitoring();
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // Don't render in production if hideInProduction is true
  if (hideInProduction && !isDevelopment) {
    return null;
  }
  
  // Handle menu open
  const handleClick = (event) => {
    if (showMenu) {
      setAnchorEl(event.currentTarget);
    }
  };
  
  // Handle menu close
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Handle monitoring toggle
  const handleToggleMonitoring = () => {
    toggleMonitoring();
    handleClose();
  };
  
  // Handle reset metrics
  const handleResetMetrics = () => {
    resetMetrics();
    handleClose();
  };
  
  // Handle refresh check
  const handleRefresh = () => {
    checkPerformance();
    handleClose();
  };
  
  // Handle report generation
  const handleGenerateReport = () => {
    const reportHtml = generateReport();
    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open in new tab
    window.open(url, '_blank');
    
    // Cleanup URL object
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
    handleClose();
  };
  
  // Determine display elements based on violation count
  let icon = <CheckCircleIcon color="success" />;
  let color = 'success';
  let tooltipText = 'Performance: All budgets met';
  
  if (violationCount > 0) {
    if (violationCount > 5) {
      icon = <ErrorIcon color="error" />;
      color = 'error';
      tooltipText = `Performance: ${violationCount} budget violations detected`;
    } else {
      icon = <WarningIcon color="warning" />;
      color = 'warning';
      tooltipText = `Performance: ${violationCount} budget violations detected`;
    }
  }
  
  // If monitoring is disabled, use different icon
  if (!isMonitoringEnabled) {
    icon = <SpeedIcon color="disabled" />;
    tooltipText = 'Performance monitoring is disabled';
  }
  
  // Determine icon size
  const iconProps = {
    fontSize: size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium'
  };
  
  // Render icon with optional badge and tooltip
  const renderIcon = () => {
    const baseIcon = React.cloneElement(icon, iconProps);
    
    // Add badge if needed
    const badgedIcon = showBadge && violationCount > 0 && isMonitoringEnabled
      ? (
        <Badge 
          badgeContent={violationCount > 99 ? '99+' : violationCount} 
          color={color}
          overlap="circular"
        >
          {baseIcon}
        </Badge>
      )
      : baseIcon;
    
    // Add tooltip if needed
    if (showTooltip) {
      return (
        <Tooltip title={tooltipText}>
          <IconButton 
            color={isMonitoringEnabled ? color : 'default'} 
            onClick={handleClick}
            size={size}
          >
            {badgedIcon}
          </IconButton>
        </Tooltip>
      );
    }
    
    return (
      <IconButton 
        color={isMonitoringEnabled ? color : 'default'} 
        onClick={handleClick}
        size={size}
      >
        {badgedIcon}
      </IconButton>
    );
  };
  
  return (
    <>
      {renderIcon()}
      
      {showMenu && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          <MenuItem disabled>
            <Typography variant="caption" color="textSecondary">
              Performance Monitoring
            </Typography>
          </MenuItem>
          
          <MenuItem onClick={handleToggleMonitoring}>
            <ListItemIcon>
              {isMonitoringEnabled ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText>
              {isMonitoringEnabled ? 'Disable Monitoring' : 'Enable Monitoring'}
            </ListItemText>
          </MenuItem>
          
          <MenuItem onClick={handleRefresh} disabled={!isMonitoringEnabled}>
            <ListItemIcon>
              <RefreshIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              Check Performance
            </ListItemText>
          </MenuItem>
          
          <MenuItem onClick={handleResetMetrics} disabled={!isMonitoringEnabled}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              Reset Metrics
            </ListItemText>
          </MenuItem>
          
          <Divider />
          
          <MenuItem onClick={handleGenerateReport} disabled={!isMonitoringEnabled}>
            <ListItemIcon>
              <ViewListIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              Generate Report
            </ListItemText>
          </MenuItem>
        </Menu>
      )}
    </>
  );
};

PerformanceIndicator.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showBadge: PropTypes.bool,
  showTooltip: PropTypes.bool,
  showMenu: PropTypes.bool,
  hideInProduction: PropTypes.bool
};

export default PerformanceIndicator;