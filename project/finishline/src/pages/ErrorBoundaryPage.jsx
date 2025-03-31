/**
 * Error Boundary Page
 * 
 * Displayed when an error occurs in the application.
 * 
 * @module pages/ErrorBoundaryPage
 */

import React, { useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

/**
 * ErrorBoundaryPage Component
 * 
 * @returns {JSX.Element} Error boundary page
 */
const ErrorBoundaryPage = () => {
  const { theme } = useTheme();
  const location = useLocation();
  
  // Extract error information from location state if available
  const errorInfo = location.state?.error || {
    message: 'An unexpected error occurred',
    stack: '',
  };
  
  // Log error to console in development
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Application Error:', errorInfo);
    }
  }, [errorInfo]);
  
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
    icon: {
      fontSize: '64px',
      marginBottom: '24px',
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
      marginBottom: '16px',
      color: theme.palette.text.secondary,
    },
    errorDetails: {
      padding: '16px',
      backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#333',
      borderRadius: '4px',
      marginBottom: '32px',
      maxWidth: '800px',
      width: '100%',
      textAlign: 'left',
      overflow: 'auto',
      maxHeight: '200px',
      fontSize: '14px',
      fontFamily: 'monospace',
    },
    buttons: {
      display: 'flex',
      gap: '16px',
    },
    primaryButton: {
      padding: '12px 24px',
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      fontWeight: 500,
      borderRadius: '4px',
      textDecoration: 'none',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    secondaryButton: {
      padding: '12px 24px',
      backgroundColor: 'transparent',
      color: theme.palette.primary.main,
      fontWeight: 500,
      borderRadius: '4px',
      textDecoration: 'none',
      border: `1px solid ${theme.palette.primary.main}`,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      '&:hover': {
        backgroundColor: `${theme.palette.primary.main}10`,
      },
    },
  }), [theme]);

  // Handle refresh button click
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div style={styles.container}>
      <div style={styles.icon}>⚠️</div>
      <h1 style={styles.title}>Something Went Wrong</h1>
      
      <p style={styles.message}>
        {errorInfo.message || 'An unexpected error occurred in the application.'}
      </p>
      
      {/* Show error details in development */}
      {process.env.NODE_ENV !== 'production' && errorInfo.stack && (
        <pre style={styles.errorDetails}>
          {errorInfo.stack}
        </pre>
      )}
      
      <div style={styles.buttons}>
        <button style={styles.primaryButton} onClick={handleRefresh}>
          Refresh Page
        </button>
        <Link to="/" style={styles.secondaryButton}>
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default React.memo(ErrorBoundaryPage);