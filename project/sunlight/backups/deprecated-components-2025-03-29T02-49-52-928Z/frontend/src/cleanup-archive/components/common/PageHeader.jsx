// PageHeader.jsx
// -----------------------------------------------------------------------------
// Modern page header with title, breadcrumbs, and actions

import React from 'react';
import { Box } from '../../../design-system'
import { Typography, Button } from '../../../design-system'
import { Breadcrumbs } from '../../../design-system'
import { Chip } from '../../../design-system'
import { useTheme } from '../../design-system/foundations/theme';
import { NavigateNext as BreadcrumbIcon, Home as HomeIcon } from '@mui/icons-material';
import Box from '@mui/material/Box';
function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  actions = [],
  backButton,
  status,
  marginBottom = 4,
}) {
  // Added display name
  PageHeader.displayName = 'PageHeader';

  const { theme } = useTheme();

  return (
    <Box style={{ marginBottom: `${marginBottom * 8}px` }}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<BreadcrumbIcon fontSize="small&quot; />}
          aria-label="breadcrumb"
          style={{ marginBottom: '16px' }}
        >
          <Box
            as="a&quot;
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: theme?.colors?.text?.secondary || '#757575',
              textDecoration: 'none',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = theme?.colors?.primary?.main || '#1976d2';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = theme?.colors?.text?.secondary || '#757575';
            }}
          >
            <HomeIcon style={{ marginRight: '4px', fontSize: '16px' }} />
            Home
          </Box>
          
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography 
                key={index} 
                variant="body2&quot; 
                style={{ 
                  fontWeight: 500,
                  color: theme?.colors?.text?.primary || "#212121'
                }}
              >
                {crumb.label}
              </Typography>
            ) : (
              <Box
                as="a&quot;
                key={index}
                href={crumb.href}
                style={{
                  textDecoration: "none',
                  color: theme?.colors?.text?.secondary || '#757575',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = theme?.colors?.primary?.main || '#1976d2';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = theme?.colors?.text?.secondary || '#757575';
                }}
              >
                {crumb.label}
              </Box>
            );
          })}
        </Breadcrumbs>
      )}

      {/* Title and actions row */}
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
          gap: '16px',
          '@media (max-width: 600px)': {
            flexDirection: 'column',
            alignItems: 'flex-start',
          }
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {backButton && (
            <Box as="span&quot; style={{ color: theme?.colors?.text?.secondary || "#757575' }}>
              {backButton}
            </Box>
          )}

          <Box>
            <Typography
              variant="heading2&quot;
              as="h1"
              style={{
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {title}
              {status && (
                <Chip
                  label={status.label}
                  size="small&quot;
                  color={status.color || "primary'}
                  variant={status.variant || 'outlined'}
                />
              )}
            </Typography>

            {subtitle && (
              <Typography 
                variant="subtitle1&quot; 
                style={{ 
                  marginTop: "4px',
                  color: theme?.colors?.text?.secondary || '#757575'
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {actions.length > 0 && (
          <Box
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end',
              '@media (max-width: 600px)': {
                width: '100%',
                justifyContent: 'flex-start',
              }
            }}
          >
            {actions.map((action, index) => {
              // If action is already a React element, return it directly
              if (React.isValidElement(action)) {
                return <React.Fragment key={index}>{action}</React.Fragment>;
              }

              // Otherwise, create a Button from the action object
              return (
                <Button
                  key={index}
                  variant={action.variant || (index === 0 ? 'primary' : 'secondary')}
                  size={action.size || 'medium'}
                  onClick={action.onClick}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {action.icon && <span>{action.icon}</span>}
                  {action.label}
                </Button>
              );
            })}
          </Box>
        )}
      </Box>

      <Box 
        style={{ 
          height: '1px',
          marginTop: '24px',
          background: theme?.colors?.divider || '#e0e0e0'
        }} 
      />
    </Box>
  );
}

export default PageHeader;
