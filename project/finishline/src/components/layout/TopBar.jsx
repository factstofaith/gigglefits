/**
 * Top Navigation Bar
 * 
 * Main application header with navigation and user controls.
 * 
 * @module components/layout/TopBar
 */

import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * TopBar Component
 * 
 * @returns {JSX.Element} Top navigation bar
 */
const TopBar = () => {
  const { user, logout } = useAuth();
  const { theme, mode, toggleMode } = useTheme();
  
  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);
  
  // Memoize styles to prevent recreation on each render
  const styles = {
    topBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 20px',
      height: '64px',
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      boxShadow: theme.shadows[3],
      zIndex: theme.zIndex.appBar,
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '20px',
      fontWeight: 700,
      textDecoration: 'none',
      color: 'inherit',
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
    },
    navLink: {
      margin: '0 15px',
      color: 'inherit',
      textDecoration: 'none',
      fontWeight: 500,
    },
    userControls: {
      display: 'flex',
      alignItems: 'center',
    },
    userName: {
      marginRight: '15px',
    },
    button: {
      padding: '6px 12px',
      backgroundColor: mode === 'light' ? theme.palette.primary.dark : theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginLeft: '10px',
      fontWeight: 500,
    },
  };

  return (
    <header style={styles.topBar}>
      <Link to="/" style={styles.logo}>
        TAP Integration Platform
      </Link>
      
      <nav style={styles.nav}>
        <Link to="/integrations" style={styles.navLink}>Integrations</Link>
        <Link to="/earnings" style={styles.navLink}>Earnings</Link>
        {user?.role === 'admin' && (
          <Link to="/admin" style={styles.navLink}>Admin</Link>
        )}
      </nav>
      
      <div style={styles.userControls}>
        <span style={styles.userName}>{user?.name}</span>
        <button 
          style={styles.button} 
          onClick={toggleMode}
          aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
        >
          {mode === 'light' ? '🌙' : '☀️'}
        </button>
        <Link to="/settings" style={{ ...styles.button, textDecoration: 'none' }}>
          Settings
        </Link>
        <button style={styles.button} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default React.memo(TopBar);