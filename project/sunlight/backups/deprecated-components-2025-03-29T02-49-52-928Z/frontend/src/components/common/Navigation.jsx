/**
 * @component Navigation
 * @description Main navigation component for the application, with responsive design
 * for both desktop and mobile views.
 *
 * @example
 * // Basic usage
 * <Navigation />
 */

import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Design system components
import { Box, Grid } from '../../design-system'
import { Typography, Button } from '../../design-system'
import { Avatar } from '../../design-system'
import { Menu } from '../../design-system'
import { useTheme } from '@design-system/foundations/theme';

// Still using some Material UI components until design system equivalents are ready
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '../../design-system';
;

// Material UI icons
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Sync as SyncIcon,
  Bookmark as BookmarkIcon,
  AttachMoney as AttachMoneyIcon,
  AdminPanelSettings as AdminIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  LibraryBooks as LibraryBooksIcon,
} from '@mui/icons-material';

// Import auth service
import authService from '@services/authService';

// Logo for the application
import logo from '@assets/logo.png';
import { useMediaQuery } from '../../design-system';
// Design system import already exists;
// Removed duplicate import
/**
 * Navigation component providing main application navigation with responsive design
 *
 * @component
 * @returns {React.ReactElement} Rendered Navigation component
 */
const Navigation = () => {
  // Added display name
  Navigation.displayName = 'Navigation';

  // Added display name
  Navigation.displayName = 'Navigation';

  // Added display name
  Navigation.displayName = 'Navigation';

  // Added display name
  Navigation.displayName = 'Navigation';

  // Added display name
  Navigation.displayName = 'Navigation';


  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isSmallScreen = useMediaQuery('(max-width: 900px)');

  // State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);

  // Check if user is logged in
  const isLoggedIn = authService.isAuthenticated();
  const isAdmin = authService.isAdmin?.() || false; // Optional chaining in case method doesn't exist

  // Define navigation items
  const navItems = [
    {
      text: 'Dashboard',
      path: '/',
      icon: <DashboardIcon />,
      visible: isLoggedIn,
    },
    {
      text: 'Integrations',
      path: '/integrations',
      icon: <SyncIcon />,
      visible: isLoggedIn,
    },
    {
      text: 'Earnings',
      path: '/earnings',
      icon: <AttachMoneyIcon />,
      visible: isLoggedIn,
    },
    {
      text: 'Documentation',
      path: '/documentation',
      icon: <LibraryBooksIcon />,
      visible: true, // Visible to all users, logged in or not
    },
    {
      text: 'Admin',
      path: '/admin',
      icon: <AdminIcon />,
      visible: isLoggedIn && isAdmin,
    },
  ];

  // Drawer toggle
  const toggleDrawer = open => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  // User menu handlers
  const handleOpenUserMenu = event => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
  // Added display name
  handleCloseUserMenu.displayName = 'handleCloseUserMenu';

  // Added display name
  handleCloseUserMenu.displayName = 'handleCloseUserMenu';

  // Added display name
  handleCloseUserMenu.displayName = 'handleCloseUserMenu';

  // Added display name
  handleCloseUserMenu.displayName = 'handleCloseUserMenu';

  // Added display name
  handleCloseUserMenu.displayName = 'handleCloseUserMenu';


    setAnchorElUser(null);
  };

  // Navigation handlers
  const handleNavigation = path => {
    navigate(path);
    setDrawerOpen(false);
  };


  // Logout handler
  const handleLogout = () => {
  // Added display name
  handleLogout.displayName = 'handleLogout';

  // Added display name
  handleLogout.displayName = 'handleLogout';

  // Added display name
  handleLogout.displayName = 'handleLogout';

  // Added display name
  handleLogout.displayName = 'handleLogout';

  // Added display name
  handleLogout.displayName = 'handleLogout';


    authService.logout();
    navigate('/');
    handleCloseUserMenu();
  };

  // Drawer content
  const drawerContent = (
    <Box
      style={{ width: '250px' }}
      role="presentation&quot;
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box
        style={{
          display: "flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
        }}
      >
        <Box as="img&quot; src={logo} alt="TAP Logo" style={{ height: '32px' }} />
        <Box
          as="button&quot;
          onClick={toggleDrawer(false)}
          aria-label="close menu"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
          }}
        >
          <CloseIcon />
        </Box>
      </Box>

      <Divider />

      <List>
        {navItems
          .filter(item => item.visible)
          .map(item => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              style={{
                backgroundColor: location.pathname === item.path 
                  ? `${theme?.colors?.primary?.light || '#e3f2fd'}` 
                  : 'transparent',
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
      </List>

      <Divider />

      {isLoggedIn && (
        <List>
          <ListItem
            button
            onClick={() => handleNavigation('/settings')}
            selected={location.pathname === '/settings'}
            style={{
              backgroundColor: location.pathname === '/settings' 
                ? `${theme?.colors?.primary?.light || '#e3f2fd'}` 
                : 'transparent',
            }}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings&quot; />
          </ListItem>

          <ListItem 
            button 
            onClick={handleLogout}
            style={{
              cursor: "pointer',
            }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout&quot; />
          </ListItem>
        </List>
      )}
    </Box>
  );

  return (
    <Box
      style={{
        position: "static',
        width: '100%',
        backgroundColor: theme?.colors?.background?.paper || '#ffffff',
        boxShadow: theme?.shadows?.[1] || '0px 2px 4px -1px rgba(0,0,0,0.2)',
      }}
    >
      <Box
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            minHeight: '64px',
          }}
        >
          {/* Logo and branding - Desktop */}
          <Box
            as="img&quot;
            src={logo}
            alt="TAP Logo"
            style={{
              height: '40px',
              marginRight: '8px',
              display: isSmallScreen ? 'none' : 'flex',
            }}
          />

          <Typography
            variant="h6&quot;
            style={{
              marginRight: "16px',
              display: isSmallScreen ? 'none' : 'flex',
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            Integration Platform
          </Typography>

          {/* Mobile menu icon */}
          {isSmallScreen && isLoggedIn && (
            <Box
              as="button&quot;
              onClick={toggleDrawer(true)}
              aria-label="navigation menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                marginRight: '16px',
                borderRadius: '4px',
              }}
            >
              <MenuIcon />
            </Box>
          )}

          {/* Mobile logo */}
          <Box
            as="img&quot;
            src={logo}
            alt="TAP Logo"
            style={{
              height: '32px',
              marginRight: '8px',
              display: isSmallScreen ? 'flex' : 'none',
            }}
          />

          <Typography
            variant="h6&quot;
            as="a"
            href="/&quot;
            style={{
              flexGrow: isLoggedIn ? 0 : 1,
              display: isSmallScreen ? "flex' : 'none',
              fontWeight: 700,
              fontSize: '1.1rem',
              color: 'inherit',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            TAP
          </Typography>

          {/* Mobile spacer */}
          {isLoggedIn && (
            <Box
              style={{
                flexGrow: 1,
                margin: '0 8px',
                display: isSmallScreen ? 'flex' : 'none',
              }}
            >
            </Box>
          )}

          {/* Desktop navigation */}
          {isLoggedIn && (
            <Box
              style={{
                flexGrow: 1,
                display: isSmallScreen ? 'none' : 'flex',
              }}
            >
              {navItems
                .filter(item => item.visible)
                .map(item => (
                  <Button
                    key={item.text}
                    onClick={() => handleNavigation(item.path)}
                    variant="text&quot;
                    style={{
                      margin: "16px 4px',
                      color: theme?.colors?.text?.primary || '#000000',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '4px',
                      backgroundColor: location.pathname === item.path
                        ? `${theme?.colors?.primary?.light || '#e3f2fd'}`
                        : 'transparent',
                    }}
                    startIcon={item.icon}
                  >
                    {item.text}
                  </Button>
                ))}

              {/* Spacer */}
              <Box
                style={{
                  marginLeft: '16px',
                  flexGrow: 1,
                  maxWidth: '400px',
                  margin: '8px 0',
                }}
              >
              </Box>
            </Box>
          )}

          {/* User menu section */}
          <Box
            style={{
              flexGrow: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* Import KeyboardShortcutsHelp here */}
            {isLoggedIn && (
              <Box
                as="span&quot;
                style={{
                  marginRight: "8px',
                }}
              >
                {/* Leave empty - KeyboardShortcutsHelp is now rendered in App.jsx */}
              </Box>
            )}

            {isLoggedIn ? (
              <>
                <Box
                  as="button&quot;
                  onClick={handleOpenUserMenu}
                  aria-label="open user menu"
                  title="Open settings&quot;
                  style={{
                    display: "flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <Avatar
                    style={{
                      backgroundColor: theme?.colors?.primary?.main || '#1976d2',
                    }}
                  >
                    <AccountCircleIcon />
                  </Avatar>
                </Box>
                <Menu
                  anchorEl={anchorElUser}
                  placement="bottom-end&quot;
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <Menu.Item
                    onClick={() => {
                      handleNavigation("/settings');
                      handleCloseUserMenu();
                    }}
                    icon={<SettingsIcon fontSize="small&quot; />}
                  >
                    Settings
                  </Menu.Item>
                  <Menu.Item 
                    onClick={handleLogout}
                    icon={<LogoutIcon fontSize="small" />}
                  >
                    Logout
                  </Menu.Item>
                </Menu>
              </>
            ) : (
              <Box
                style={{
                  display: 'flex',
                  gap: '8px',
                }}
              >
                <Button variant="outlined&quot; onClick={() => navigate("/')}>
                  Login
                </Button>
                <Button variant="primary&quot; onClick={() => navigate("/')}>
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Mobile drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Navigation;
