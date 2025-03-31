/**
 * Admin Navigation Bar
 *
 * A navigation component specifically designed for admin users, featuring
 * dynamic permission-based access to admin features and tools.
 * 
 * @component
 */

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Tooltip,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Apps as AppsIcon,
  Storage as StorageIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  AccountCircle,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Logout as LogoutIcon,
  Inbox as InboxIcon,
  Dvr as DvrIcon,
  Assessment as AssessmentIcon,
  Tune as TuneIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Admin Navigation Bar component
 *
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object with role information
 * @param {Array} props.permissions - Array of permission objects the user has
 * @param {Function} props.onLogout - Function to handle logout
 * @param {number} props.notificationCount - Number of unread notifications
 * @param {Array} props.featureFlags - Array of enabled feature flags
 * @returns {JSX.Element} The AdminNavigationBar component
 */
const AdminNavigationBar = ({
  user,
  permissions = [],
  onLogout,
  notificationCount = 0,
  featureFlags = [],
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for drawer and menu functionality
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [expandedSection, setExpandedSection] = useState('');
  
  const hasPermission = useCallback((permissionKey) => {
    return permissions.some(p => p.key === permissionKey);
  }, [permissions]);
  
  const isFeatureEnabled = useCallback((featureKey) => {
    return featureFlags.includes(featureKey);
  }, [featureFlags]);
  
  // Update drawer state when screen size changes
  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);
  
  // Navigation menu sections with permission checks
  const navSections = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin/dashboard',
      permission: 'access:admin_dashboard',
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: <AppsIcon />,
      expandable: true,
      permission: 'access:application_management',
      children: [
        {
          label: 'All Applications',
          path: '/admin/applications',
          permission: 'view:applications',
        },
        {
          label: 'Create Application',
          path: '/admin/applications/create',
          permission: 'create:application',
        },
        {
          label: 'Published Apps',
          path: '/admin/applications/published',
          permission: 'view:published_applications',
        },
        {
          label: 'Draft Apps',
          path: '/admin/applications/drafts',
          permission: 'view:draft_applications',
        },
        {
          label: 'App Templates',
          path: '/admin/applications/templates',
          permission: 'manage:application_templates',
          featureFlag: 'application_templates',
        },
      ],
    },
    {
      id: 'datasets',
      label: 'Datasets',
      icon: <StorageIcon />,
      expandable: true,
      permission: 'access:dataset_management',
      children: [
        {
          label: 'All Datasets',
          path: '/admin/datasets',
          permission: 'view:datasets',
        },
        {
          label: 'Create Dataset',
          path: '/admin/datasets/create',
          permission: 'create:dataset',
        },
        {
          label: 'Data Sources',
          path: '/admin/datasets/sources',
          permission: 'manage:data_sources',
        },
        {
          label: 'Schema Registry',
          path: '/admin/datasets/schemas',
          permission: 'manage:schemas',
          featureFlag: 'schema_registry',
        },
      ],
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: <DvrIcon />,
      expandable: true,
      permission: 'access:integration_management',
      children: [
        {
          label: 'All Integrations',
          path: '/admin/integrations',
          permission: 'view:integrations',
        },
        {
          label: 'Integration Nodes',
          path: '/admin/integrations/nodes',
          permission: 'manage:integration_nodes',
        },
        {
          label: 'Templates',
          path: '/admin/integrations/templates',
          permission: 'manage:integration_templates',
        },
        {
          label: 'Transformations',
          path: '/admin/integrations/transformations',
          permission: 'manage:transformations',
        },
      ],
    },
    {
      id: 'users',
      label: 'Users & Access',
      icon: <GroupIcon />,
      expandable: true,
      permission: 'access:user_management',
      children: [
        {
          label: 'Users',
          path: '/admin/users',
          permission: 'view:users',
        },
        {
          label: 'Roles',
          path: '/admin/roles',
          permission: 'manage:roles',
        },
        {
          label: 'Permissions',
          path: '/admin/permissions',
          permission: 'manage:permissions',
        },
        {
          label: 'Invitations',
          path: '/admin/invitations',
          permission: 'manage:invitations',
        },
      ],
    },
    {
      id: 'tenants',
      label: 'Tenant Management',
      icon: <BusinessIcon />,
      expandable: true,
      permission: 'access:tenant_management',
      children: [
        {
          label: 'Tenants',
          path: '/admin/tenants',
          permission: 'view:tenants',
        },
        {
          label: 'Resource Allocation',
          path: '/admin/tenants/resources',
          permission: 'manage:tenant_resources',
        },
        {
          label: 'Tenant Health',
          path: '/admin/tenants/health',
          permission: 'view:tenant_health',
        },
      ],
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      icon: <AssessmentIcon />,
      expandable: true,
      permission: 'access:monitoring',
      children: [
        {
          label: 'System Health',
          path: '/admin/monitoring/health',
          permission: 'view:system_health',
        },
        {
          label: 'Audit Logs',
          path: '/admin/monitoring/audit',
          permission: 'view:audit_logs',
        },
        {
          label: 'Performance',
          path: '/admin/monitoring/performance',
          permission: 'view:performance_metrics',
        },
        {
          label: 'Error Logs',
          path: '/admin/monitoring/errors',
          permission: 'view:error_logs',
        },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <TuneIcon />,
      expandable: true,
      permission: 'access:system_settings',
      children: [
        {
          label: 'System Settings',
          path: '/admin/settings/system',
          permission: 'manage:system_settings',
        },
        {
          label: 'Security',
          path: '/admin/settings/security',
          permission: 'manage:security_settings',
        },
        {
          label: 'Notifications',
          path: '/admin/settings/notifications',
          permission: 'manage:notification_settings',
        },
        {
          label: 'Feature Flags',
          path: '/admin/settings/features',
          permission: 'manage:feature_flags',
        },
      ],
    },
  ];

  // Toggle drawer open/closed
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? '' : sectionId);
  };

  // User profile menu handlers
  const handleProfileMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Notification menu handlers
  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  // Navigation handler
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    handleProfileMenuClose();
    if (onLogout) {
      onLogout();
    }
  };

  // Check if a route is active
  const isRouteActive = (path) => {
    return location.pathname === path;
  };

  // Render the navigation drawer
  const renderDrawer = () => (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={drawerOpen}
      onClose={toggleDrawer}
      sx={{
        width: 260,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 260,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Panel
          </Typography>
          {isMobile && (
            <IconButton onClick={toggleDrawer}>
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Box>
      <Divider />
      <Box sx={{ overflow: 'auto' }}>
        <List component="nav">
          {/* User info section */}
          <ListItem sx={{ pb: 2, pt: 2 }}>
            <Avatar
              alt={user?.name || 'Admin'}
              src={user?.avatarUrl}
              sx={{ mr: 2 }}
            />
            <ListItemText
              primary={user?.name || 'Admin User'}
              secondary={user?.role || 'Administrator'}
            />
          </ListItem>
          <Divider />

          {/* Navigation sections */}
          {navSections.map((section) => {
            // Check permission for section
            if (section.permission && !hasPermission(section.permission)) {
              return null;
            }

            // Check if section has any visible children
            const hasVisibleChildren = section.children?.some(
              (child) =>
                (!child.permission || hasPermission(child.permission)) &&
                (!child.featureFlag || isFeatureEnabled(child.featureFlag))
            );

            // If expandable but no visible children, don't render
            if (section.expandable && !hasVisibleChildren) {
              return null;
            }

            return (
              <React.Fragment key={section.id}>
                {section.expandable ? (
                  <>
                    <ListItem
                      button
                      onClick={() => toggleSection(section.id)}
                      selected={expandedSection === section.id}
                    >
                      <ListItemIcon>{section.icon}</ListItemIcon>
                      <ListItemText primary={section.label} />
                      {expandedSection === section.id ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )}
                    </ListItem>
                    <Collapse
                      in={expandedSection === section.id}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List component="div" disablePadding>
                        {section.children?.map((child, childIndex) => {
                          // Check permission and feature flag for child
                          if (
                            (child.permission && !hasPermission(child.permission)) ||
                            (child.featureFlag && !isFeatureEnabled(child.featureFlag))
                          ) {
                            return null;
                          }

                          return (
                            <ListItem
                              button
                              key={`${section.id}-child-${childIndex}`}
                              onClick={() => handleNavigation(child.path)}
                              selected={isRouteActive(child.path)}
                              sx={{ pl: 4 }}
                            >
                              <ListItemText primary={child.label} />
                            </ListItem>
                          );
                        })}
                      </List>
                    </Collapse>
                  </>
                ) : (
                  <ListItem
                    button
                    onClick={() => handleNavigation(section.path)}
                    selected={isRouteActive(section.path)}
                  >
                    <ListItemIcon>{section.icon}</ListItemIcon>
                    <ListItemText primary={section.label} />
                  </ListItem>
                )}
              </React.Fragment>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar 
        position="fixed"
        color="default"
        elevation={1}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            TAP Integration Platform
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* Search button - could be expanded to full search bar */}
          {hasPermission('use:global_search') && (
            <Tooltip title="Search">
              <IconButton color="inherit" onClick={() => navigate('/admin/search')}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Help button */}
          <Tooltip title="Help & Documentation">
            <IconButton color="inherit" onClick={() => navigate('/admin/help')}>
              <HelpIcon />
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          {hasPermission('view:notifications') && (
            <Tooltip title="Notifications">
              <IconButton
                color="inherit"
                onClick={handleNotificationMenuOpen}
              >
                <Badge badgeContent={notificationCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          {/* User profile menu */}
          <Tooltip title="Account">
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleProfileMenuOpen}
              sx={{ ml: 1 }}
            >
              <AccountCircle />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Render the navigation drawer */}
      {renderDrawer()}

      {/* Profile menu */}
      <Menu
        anchorEl={menuAnchorEl}
        id="account-menu"
        keepMounted
        open={Boolean(menuAnchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/admin/profile'); }}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          My Profile
        </MenuItem>
        
        {hasPermission('manage:security_settings') && (
          <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/admin/settings/security'); }}>
            <ListItemIcon>
              <SecurityIcon fontSize="small" />
            </ListItemIcon>
            Security Settings
          </MenuItem>
        )}
        
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        id="notification-menu"
        keepMounted
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          style: {
            width: 320,
            maxHeight: 400,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          <Button 
            size="small" 
            onClick={() => { 
              handleNotificationMenuClose(); 
              navigate('/admin/notifications'); 
            }}
          >
            View All
          </Button>
        </Box>
        <Divider />
        {notificationCount > 0 ? (
          <List sx={{ p: 0 }}>
            <ListItem button>
              <ListItemIcon>
                <InboxIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Sample Notification" 
                secondary="This is a placeholder notification. View all to see actual notifications." 
              />
            </ListItem>
          </List>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              No new notifications
            </Typography>
          </Box>
        )}
      </Menu>

      {/* Toolbar spacer to prevent content from being hidden behind AppBar */}
      <Toolbar />
    </>
  );
};

AdminNavigationBar.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    avatarUrl: PropTypes.string,
  }),
  permissions: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      name: PropTypes.string,
      description: PropTypes.string,
    })
  ),
  onLogout: PropTypes.func,
  notificationCount: PropTypes.number,
  featureFlags: PropTypes.arrayOf(PropTypes.string),
};

export default AdminNavigationBar;