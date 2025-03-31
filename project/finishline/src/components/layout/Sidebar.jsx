/**
 * Application Sidebar
 * 
 * Main navigation sidebar with links to major sections.
 * 
 * @module components/layout/Sidebar
 */

import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Sidebar Component
 * 
 * @returns {JSX.Element} Sidebar navigation
 */
const Sidebar = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  
  // Navigation items
  const navItems = useMemo(() => [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Integrations', path: '/integrations', icon: '🔄' },
    { label: 'Earnings', path: '/earnings', icon: '💰' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
    // Admin-only items
    ...(user?.role === 'admin' ? [
      { label: 'Admin Dashboard', path: '/admin', icon: '🔐' },
    ] : []),
  ], [user?.role]);
  
  // Memoize styles to prevent recreation on each render
  const styles = useMemo(() => ({
    sidebar: {
      position: 'fixed',
      top: '64px', // Height of TopBar
      left: 0,
      width: '240px',
      height: 'calc(100vh - 64px)',
      backgroundColor: theme.palette.background.paper,
      borderRight: `1px solid ${theme.palette.divider}`,
      padding: '20px 0',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 20px',
      textDecoration: 'none',
      color: theme.palette.text.primary,
      fontWeight: 500,
      borderLeft: '4px solid transparent',
    },
    activeNavItem: {
      backgroundColor: `${theme.palette.primary.main}10`,
      borderLeftColor: theme.palette.primary.main,
      color: theme.palette.primary.main,
    },
    icon: {
      marginRight: '12px',
      fontSize: '18px',
    },
    footer: {
      marginTop: 'auto',
      padding: '20px',
      borderTop: `1px solid ${theme.palette.divider}`,
      fontSize: '12px',
      color: theme.palette.text.secondary,
    },
  }), [theme]);

  return (
    <aside style={styles.sidebar}>
      <nav>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const navItemStyles = {
            ...styles.navItem,
            ...(isActive ? styles.activeNavItem : {}),
          };
          
          return (
            <Link key={item.path} to={item.path} style={navItemStyles}>
              <span style={styles.icon}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div style={styles.footer}>
        <p>TAP Integration Platform</p>
        <p>© 2025 All rights reserved</p>
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);