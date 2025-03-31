/**
 * @component PageLayout
 * @description Standardized page layout component that provides consistent structure,
 * spacing, and responsive behavior across all application pages. Includes support for
 * breadcrumbs, page headers, and actions.
 *
 * @example
 * // Basic usage
 * <PageLayout title="Dashboard">
 *   <YourPageContent />
 * </PageLayout>
 *
 * // With breadcrumbs and actions
 * <PageLayout
 *   title="Edit Integration"
 *   breadcrumbs={[
 *     { label: 'Integrations', path: '/integrations' },
 *     { label: 'Edit Integration' }
 *   ]}
 *   actions={[
 *     { label: 'Save', icon: <SaveIcon />, onClick: handleSave, variant: 'contained' },
 *     { label: 'Cancel', onClick: handleCancel }
 *   ]}
 * >
 *   <YourPageContent />
 * </PageLayout>
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

// Design system components
import { Box, Grid } from '../../design-system'
import { Typography, Button } from '../../design-system'
import { Chip } from '../../design-system'
import { Breadcrumbs } from '../../design-system'
import { useTheme } from '@design-system/foundations/theme';

// Material UI icons (to be replaced later with design system icons)
import {
  NavigateNext as NavigateNextIcon,
  KeyboardArrowLeft as BackIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

// Still using some Material UI components until design system equivalents are ready
import { Link } from '../../design-system';
import { useMediaQuery } from '@mui/material';

// Import constants and utilities
import { getAriaAttributes } from '@utils/accessibilityUtils';
import Box from '@mui/material/Box';
/**
 * Standard page layout component providing consistent structure
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {React.ReactNode} props.children - Page content
 * @param {Array<Object>} [props.breadcrumbs] - Array of breadcrumb items, each with label and optional path
 * @param {Array<Object>} [props.actions] - Array of action buttons with label, onClick, and optional icon and variant
 * @param {string} [props.subtitle] - Optional subtitle for the page
 * @param {React.ReactNode} [props.icon] - Optional icon to display next to the title
 * @param {boolean} [props.paper=false] - Whether to wrap content in a Paper component
 * @param {boolean} [props.fullWidth=false] - Whether to use full width container
 * @param {boolean} [props.showBackButton=false] - Whether to show a back button
 * @param {string} [props.backButtonPath] - Path to navigate to when back button is clicked
 * @param {Function} [props.onBackButtonClick] - Callback function when back button is clicked
 * @param {Object} [props.sx] - Additional styles to apply to the root element
 * @param {Array<Object>} [props.tabs] - Optional tabs for the page
 * @param {number} [props.tabValue] - Selected tab value
 * @param {Function} [props.onTabChange] - Tab change handler
 * @param {string} [props.helpText] - Optional help text to display in a tooltip
 * @param {Object} [props.status] - Optional status indicator with label and color
 * @returns {React.ReactElement} Rendered PageLayout component
 */
const PageLayout = ({
  title,
  children,
  breadcrumbs,
  actions,
  subtitle,
  icon,
  paper = false,
  fullWidth = false,
  showBackButton = false,
  backButtonPath,
  onBackButtonClick,
  sx = {},
  tabs,
  tabValue,
  onTabChange,
  helpText,
  status,
}) => {
  // Added display name
  PageLayout.displayName = 'PageLayout';

  // Added display name
  PageLayout.displayName = 'PageLayout';

  // Added display name
  PageLayout.displayName = 'PageLayout';


  const { theme } = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 600px)');

  // Handle back button click
  const handleBackClick = () => {
  // Added display name
  handleBackClick.displayName = 'handleBackClick';

  // Added display name
  handleBackClick.displayName = 'handleBackClick';

  // Added display name
  handleBackClick.displayName = 'handleBackClick';


    if (onBackButtonClick) {
      onBackButtonClick();
    } else if (backButtonPath) {
      navigate(backButtonPath);
    } else {
      navigate(-1);
    }
  };

  // Get ARIA attributes for page heading
  const headingAriaAttributes = getAriaAttributes({
    role: 'heading',
    level: 1,
  });

  return (
    <Box
      style={{
        paddingTop: isMobile ? '16px' : '24px',
        paddingBottom: isMobile ? '16px' : '24px',
        ...(typeof sx === 'object' ? sx : {}),
      }}
    >
      <Box 
        style={{
          maxWidth: fullWidth ? '100%' : '1200px',
          margin: '0 auto',
          padding: '0 16px',
        }}
      >
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
            style={{ marginBottom: '16px' }}
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return isLast ? (
                <Typography 
                  key={crumb.label} 
                  style={{ 
                    color: theme?.colors?.text?.primary || '#000000' 
                  }}
                  aria-current="page"
                >
                  {crumb.label}
                </Typography>
              ) : (
                <Link
                  key={crumb.label}
                  color="inherit"
                  href={crumb.path}
                  onClick={e => {
                    e.preventDefault();
                    navigate(crumb.path);
                  }}
                  underline="hover"
                >
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        )}

        {/* Page header */}
        <Box
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            marginBottom: '24px',
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            {/* Back button */}
            {showBackButton && (
              <Box
                as="button"
                onClick={handleBackClick}
                aria-label="Go back"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '8px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                }}
              >
                <BackIcon />
              </Box>
            )}

            {/* Title and icon */}
            <Box style={{ display: 'flex', alignItems: 'center' }}>
              {icon && (
                <Box style={{ marginRight: '12px', display: 'flex', alignItems: 'center' }}>
                  {icon}
                </Box>
              )}

              <Box>
                <Box style={{ display: 'flex', alignItems: 'center' }}>
                  <Typography
                    variant="heading1"
                    as="h1"
                    style={{
                      fontWeight: 'bold',
                      fontSize: isMobile ? '1.5rem' : '2rem',
                      marginBottom: subtitle ? '4px' : '0',
                    }}
                    {...headingAriaAttributes}
                  >
                    {title}
                  </Typography>

                  {/* Help tooltip */}
                  {helpText && (
                    <Box
                      as="button"
                      aria-label="Help information"
                      title={helpText}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: '8px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '50%',
                      }}
                    >
                      <HelpIcon fontSize="small" style={{ opacity: 0.7 }} />
                    </Box>
                  )}

                  {/* Status indicator */}
                  {status && (
                    <Chip
                      label={status.label}
                      color={status.color || 'default'}
                      size="small"
                      style={{ marginLeft: '16px' }}
                    />
                  )}
                </Box>

                {/* Subtitle */}
                {subtitle && (
                  <Typography 
                    variant="body1" 
                    style={{ 
                      color: theme?.colors?.text?.secondary || '#666666',
                      marginTop: '-4px' 
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Action buttons */}
          {actions && actions.length > 0 && (
            <Box
              style={{
                display: 'flex',
                gap: '8px',
                marginTop: isMobile ? '16px' : '0',
                flexWrap: 'wrap',
                justifyContent: isMobile ? 'flex-start' : 'flex-end',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              {actions.map((action, index) => (
                <Button
                  key={action.label || index}
                  variant={action.variant === 'contained' ? 'primary' : 'outlined'}
                  onClick={action.onClick}
                  startIcon={action.icon}
                  disabled={action.disabled}
                  size={isMobile ? 'small' : 'medium'}
                >
                  {action.label}
                </Button>
              ))}
            </Box>
          )}
        </Box>

        {/* Tabs if provided */}
        {tabs && (
          <Box 
            style={{ 
              borderBottom: `1px solid ${theme?.colors?.divider || '#e0e0e0'}`, 
              marginBottom: '24px' 
            }}
          >
            {tabs}
          </Box>
        )}

        {/* Main content */}
        {paper ? (
          <Box
            style={{
              padding: isMobile ? '16px' : '24px',
              borderRadius: '8px',
              backgroundColor: theme?.colors?.background?.paper || '#ffffff',
              boxShadow: theme?.shadows?.[1] || '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
            }}
          >
            {children}
          </Box>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
};

PageLayout.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string,
    })
  ),
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      icon: PropTypes.node,
      variant: PropTypes.string,
      color: PropTypes.string,
      disabled: PropTypes.bool,
    })
  ),
  subtitle: PropTypes.string,
  icon: PropTypes.node,
  paper: PropTypes.bool,
  fullWidth: PropTypes.bool,
  showBackButton: PropTypes.bool,
  backButtonPath: PropTypes.string,
  onBackButtonClick: PropTypes.func,
  sx: PropTypes.object,
  tabs: PropTypes.node,
  tabValue: PropTypes.any,
  onTabChange: PropTypes.func,
  helpText: PropTypes.string,
  status: PropTypes.shape({
    label: PropTypes.string.isRequired,
    color: PropTypes.string,
  }),
};

export default PageLayout;
