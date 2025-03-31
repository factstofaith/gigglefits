/**
 * 404 Not Found Page
 * 
 * Displayed when a route doesn't exist.
 * 
 * @module pages/NotFoundPage
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

/**
 * NotFoundPage Component
 * 
 * @returns {JSX.Element} Not found page
 */
const NotFoundPage = () => {
  const { theme } = useTheme();
  
  // Memoize styles to prevent recreation on each render
  const styles = useMemo(() => ({
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      minHeight: 'calc(100vh - 200px)',
      textAlign: 'center',
    },
    statusCode: {
      fontSize: '120px',
      fontWeight: 700,
      color: theme.palette.primary.main,
      marginBottom: '24px',
      lineHeight: 1,
    },
    title: {
      fontSize: '32px',
      fontWeight: 600,
      marginBottom: '16px',
      color: theme.palette.text.primary,
    },
    message: {
      fontSize: '16px',
      maxWidth: '600px',
      marginBottom: '32px',
      color: theme.palette.text.secondary,
    },
    button: {
      padding: '12px 24px',
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      fontWeight: 500,
      borderRadius: '4px',
      textDecoration: 'none',
      transition: 'background-color 0.2s ease',
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  }), [theme]);

  return (
    <div style={styles.container}>
      <h1 style={styles.statusCode}>404</h1>
      <h2 style={styles.title}>Page Not Found</h2>
      <p style={styles.message}>
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </p>
      <Link to="/" style={styles.button}>
        Return to Dashboard
      </Link>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default React.memo(NotFoundPage);