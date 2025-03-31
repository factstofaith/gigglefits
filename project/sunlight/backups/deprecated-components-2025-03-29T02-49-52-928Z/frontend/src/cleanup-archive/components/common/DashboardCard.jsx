// DashboardCard.jsx
// -----------------------------------------------------------------------------
// Modern dashboard card with icon, title, and data display

import React from 'react';
import { Box, Card } from '../../../design-system'
import { Typography } from '../../../design-system'
import { Skeleton } from '../../../design-system'
import { useTheme } from '../../design-system/foundations/theme';
import { MoreVert as MoreIcon } from '@mui/icons-material';
import Box from '@mui/material/Box';
// Helper function to create an rgba color with alpha
function createRGBA(hexColor, alpha) {
  // Added display name
  createRGBA.displayName = 'createRGBA';

  // Remove the hash if it exists
  const hex = hexColor.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Return an rgba color
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function DashboardCard({
  title,
  subtitle,
  value,
  icon,
  iconColor,
  secondaryValue,
  secondaryLabel,
  loading = false,
  footer,
  action,
  trend,
  style,
  ...props
}) {
  // Added display name
  DashboardCard.displayName = 'DashboardCard';

  const { theme } = useTheme();
  const defaultIconColor = theme?.colors?.primary?.main || '#1976d2';

  // Apply proper colors
  const actualIconColor = iconColor || defaultIconColor;

  return (
    <Card
      variant="outlined&quot;
      style={{
        padding: "24px',
        borderRadius: '8px',
        height: '100%',
        border: `1px solid ${theme?.colors?.divider || '#e0e0e0'}`,
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.borderColor = createRGBA(theme?.colors?.primary?.main || '#1976d2', 0.2);
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = theme?.colors?.divider || '#e0e0e0';
      }}
      {...props}
    >
      {/* Header with title and icon */}
      <Box 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '16px'
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center' }}>
          {icon && (
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: createRGBA(actualIconColor, 0.12),
                color: actualIconColor,
                marginRight: '16px',
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Typography 
              variant="h6&quot; 
              style={{ 
                fontWeight: "bold', 
                color: theme?.colors?.text?.primary || '#212121'
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                variant="body2&quot; 
                style={{ color: theme?.colors?.text?.secondary || "#757575' }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {action && (
          <Box
            as="button&quot;
            title="More options"
            onClick={action}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: theme?.colors?.text?.secondary || '#757575',
              padding: 0,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = theme?.colors?.action?.hover || 'rgba(0,0,0,0.04)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <MoreIcon style={{ fontSize: '20px' }} />
          </Box>
        )}
      </Box>

      {/* Main value display */}
      <Box 
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          margin: '8px 0'
        }}
      >
        {loading ? (
          <Skeleton 
            variant="rectangular&quot; 
            width="70%" 
            height={42} 
            style={{ borderRadius: '4px' }}
          />
        ) : (
          <Typography 
            variant="h3&quot; 
            as="div" 
            style={{ 
              fontWeight: 'bold', 
              color: theme?.colors?.text?.primary || '#212121'
            }}
          >
            {value}
            {trend && (
              <Typography
                as="span&quot;
                variant="body2"
                style={{
                  marginLeft: '8px',
                  color: trend.direction === 'up' 
                    ? (theme?.colors?.success?.main || '#2e7d32') 
                    : (theme?.colors?.error?.main || '#d32f2f'),
                  fontWeight: 'bold',
                }}
              >
                {trend.value}
              </Typography>
            )}
          </Typography>
        )}

        {/* Secondary value if provided */}
        {secondaryValue && (
          <Box 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginTop: '8px'
            }}
          >
            {loading ? (
              <Skeleton variant="text&quot; width="40%" />
            ) : (
              <>
                <Typography 
                  variant="body2&quot; 
                  style={{ 
                    color: theme?.colors?.text?.secondary || "#757575',
                    marginRight: '4px'
                  }}
                >
                  {secondaryLabel}:
                </Typography>
                <Typography 
                  variant="body2&quot; 
                  style={{ 
                    color: theme?.colors?.text?.primary || "#212121',
                    fontWeight: 500
                  }}
                >
                  {secondaryValue}
                </Typography>
              </>
            )}
          </Box>
        )}
      </Box>

      {/* Footer */}
      {footer && (
        <>
          <Box 
            style={{ 
              height: '1px', 
              background: theme?.colors?.divider || '#e0e0e0', 
              margin: '16px 0'
            }} 
          />
          <Box>
            {loading ? (
              <Skeleton variant="text&quot; width="100%" />
            ) : typeof footer === 'string' ? (
              <Typography 
                variant="body2&quot; 
                style={{ color: theme?.colors?.text?.secondary || "#757575' }}
              >
                {footer}
              </Typography>
            ) : (
              footer
            )}
          </Box>
        </>
      )}
    </Card>
  );
}

export default DashboardCard;
