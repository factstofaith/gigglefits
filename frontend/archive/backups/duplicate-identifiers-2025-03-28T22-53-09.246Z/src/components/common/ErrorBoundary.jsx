// ErrorBoundary.jsx
// -----------------------------------------------------------------------------
// Error boundary component to catch UI rendering errors
// Enhanced with accessibility features

import React, { Component, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box } from '../../design-system';
import { Typography } from '../../design-system';
import { Card } from '../../design-system';
import { Button } from '../../design-system';
import { useTheme } from '../../design-system';
import {
  ErrorOutline as ErrorIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
  BugReport as BugReportIcon,
} from '@mui/icons-material';
import { announceToScreenReader } from '@utils/accessibilityUtils';
import Box from '@mui/material/Box';

// Helper function to create rgba colors with transparency
const rgba = (hexColor, alpha) => {
  // Added display name
  rgba.displayName = 'rgba';

  // Added display name
  rgba.displayName = 'rgba';

  // Added display name
  rgba.displayName = 'rgba';


  // Convert hex to rgb
  let r = 0, g = 0, b = 0;
  if (hexColor.length === 4) {
    r = parseInt(hexColor[1] + hexColor[1], 16);
    g = parseInt(hexColor[2] + hexColor[2], 16);
    b = parseInt(hexColor[3] + hexColor[3], 16);
  } else {
    r = parseInt(hexColor.slice(1, 3), 16);
    g = parseInt(hexColor.slice(3, 5), 16);
    b = parseInt(hexColor.slice(5, 7), 16);
  }
  // Return rgba
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Error details component (for non-production environments)
function ErrorDetails({ error, errorInfo }) {
  // Added display name
  ErrorDetails.displayName = 'ErrorDetails';

  const { theme } = useTheme();
  const errorColor = theme?.colors?.error?.main || '#f44336';
  const textSecondary = theme?.colors?.text?.secondary || '#757575';
  const bgColor = theme?.colors?.background?.default || '#f5f5f5';

  if (!error) return null;

  return (
    <Box 
      style={{ marginTop: '32px' }} 
      role="region" 
      aria-label="Technical error details"
    >
      <Box 
        style={{ 
          marginBottom: '32px', 
          height: '1px', 
          backgroundColor: theme?.colors?.divider || '#e0e0e0' 
        }} 
      />
      
      <Typography 
        variant="heading3" 
        style={{ 
          color: errorColor, 
          marginBottom: '16px' 
        }} 
        id="error-details-heading"
      >
        Error Details
      </Typography>
      
      <Card
        style={{
          padding: '16px',
          backgroundColor: rgba(errorColor, 0.05),
          border: `1px solid ${rgba(errorColor, 0.2)}`,
          marginBottom: '24px',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          overflowX: 'auto',
        }}
        aria-labelledby="error-details-heading"
      >
        <Typography 
          variant="subtitle" 
          style={{ 
            color: errorColor, 
            marginBottom: '8px' 
          }}
        >
          {error.toString()}
        </Typography>
        
        {error.stack && (
          <Box
            as="pre"
            style={{ 
              margin: 0, 
              color: textSecondary, 
              fontSize: '0.8rem' 
            }}
            aria-label="Error stack trace"
          >
            {error.stack.split('\n').slice(1).join('\n')}
          </Box>
        )}
      </Card>

      {errorInfo && errorInfo.componentStack && (
        <>
          <Typography 
            variant="heading3" 
            style={{ 
              color: textSecondary, 
              marginBottom: '16px' 
            }} 
            id="component-stack-heading"
          >
            Component Stack
          </Typography>
          
          <Card
            style={{
              padding: '16px',
              backgroundColor: bgColor,
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              overflowX: 'auto',
              border: `1px solid ${theme?.colors?.divider || '#e0e0e0'}`,
            }}
            aria-labelledby="component-stack-heading"
          >
            <pre style={{ margin: 0 }}>{errorInfo.componentStack}</pre>
          </Card>
        </>
      )}
    </Box>
  );
}

ErrorDetails.propTypes = {
  error: PropTypes.object,
  errorInfo: PropTypes.object,
};

// Error fallback UI for users
function ErrorFallback({ error, resetErrorBoundary, showDetails = false }) {
  // Added display name
  ErrorFallback.displayName = 'ErrorFallback';

  const { theme } = useTheme();
  const errorColor = theme?.colors?.error?.main || '#f44336';
  const primaryColor = theme?.colors?.primary?.main || '#1976d2';

  // Announce the error to screen readers when component mounts
  useEffect(() => {
    announceToScreenReader(
      'An error has occurred in the application. Use the refresh button or home button to recover.',
      true
    );
  }, []);

  // Set focus to the primary action button on mount
  const primaryButtonRef = React.useRef(null);
  useEffect(() => {
    if (primaryButtonRef.current) {
      primaryButtonRef.current.focus();
    }
  }, []);

  return (
    <Box 
      style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        padding: '64px 16px' 
      }} 
      role="alert" 
      aria-live="assertive"
    >
      <Card
        style={{
          padding: '32px',
          textAlign: 'center',
          border: `1px solid ${rgba(errorColor, 0.3)}`,
          backgroundColor: rgba(errorColor, 0.05),
          borderRadius: '12px',
        }}
      >
        <Box
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: rgba(errorColor, 0.15),
            margin: '0 auto 24px auto',
          }}
          aria-hidden="true" // Decorative icon
        >
          <ErrorIcon style={{ fontSize: '40px', color: errorColor }} />
        </Box>

        <Typography
          variant="heading1"
          as="h1"
          style={{ 
            marginBottom: '16px', 
            fontWeight: 'bold', 
            color: errorColor 
          }}
          id="error-title"
        >
          Something went wrong
        </Typography>

        <Typography
          variant="body1"
          style={{ 
            marginBottom: '32px', 
            color: theme?.colors?.text?.secondary || '#757575',
            maxWidth: '600px', 
            margin: '0 auto 32px auto' 
          }}
          id="error-description"
        >
          We're sorry, but we encountered an unexpected error. Our team has been notified and will
          work to resolve the issue as soon as possible. In the meantime, you can try refreshing the
          page or going back to the home page.
        </Typography>

        <Box
          style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'center' 
          }}
          aria-labelledby="error-recovery-options"
        >
          <Button
            variant="secondary"
            onClick={resetErrorBoundary}
            startElement={<RefreshIcon />}
            aria-label="Refresh the page"
            ref={primaryButtonRef}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => (window.location.href = '/')}
            startElement={<HomeIcon />}
            aria-label="Go to the home page"
          >
            Go to Home
          </Button>
        </Box>

        {/* Show error details in non-production environments */}
        {showDetails && <ErrorDetails error={error} errorInfo={error?.errorInfo} />}

        {/* Visually hidden description for screen readers */}
        <div
          id="error-recovery-options"
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            borderWidth: 0,
          }}
        >
          Error recovery options
        </div>
      </Card>
    </Box>
  );
}

ErrorFallback.propTypes = {
  error: PropTypes.object,
  resetErrorBoundary: PropTypes.func.isRequired,
  showDetails: PropTypes.bool,
};

// Main Error Boundary component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Capture component stack info
    this.setState({ errorInfo });

    // Log the error to monitoring service
    console.error('UI Error:', error, errorInfo);

    // You can log to a real error monitoring service like Sentry here
    this.logErrorToService(error, errorInfo);
  }

  // Method to log errors to a monitoring service
  // Should be replaced with real error reporting in production
  logErrorToService(error, errorInfo) {
    // In a real app, send to error monitoring service
    // Example: Sentry.captureException(error, { extra: errorInfo });

    // For now, just log to console in a structured way
    console.group('Application Error');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo?.componentStack);
    console.groupEnd();
  }

  render() {
    if (this.state.hasError) {
      // Check if we're in development mode
      const isDev = process.env.NODE_ENV === 'development';

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetErrorBoundary={() =>
            this.setState({ hasError: false, error: null, errorInfo: null })
          }
          showDetails={isDev || this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  showDetails: PropTypes.bool,
  fallback: PropTypes.node,
};

export default ErrorBoundary;
