import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from "@/contexts/UserContext";
import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling";
import { Box, Button, Paper, Typography } from '@mui/material';

/**
 * RequireAdmin component - Protects routes that require admin privileges
 * Redirects to home if user is not an admin
 * Includes error handling for authentication failures
 */

import { ENV } from "@/utils/environmentConfig";
const RequireAdmin = ({
  children
}) => {
  const {
    state: user
  } = useUser();
  const location = useLocation();

  // Error handling
  const {
    error,
    handleError,
    clearError
  } = useErrorHandler('RequireAdmin');

  // Handle auth verification errors
  React.useEffect(() => {
    try {
      // Additional verification could be performed here
      if (!user && ENV.NODE_ENV === 'development') {
        console.log('User state is not available in RequireAdmin');
      }
    } catch (err) {
      handleError(err, {
        context: 'admin-verification'
      });
    }
  }, [user, handleError]);

  // Show error message if there is an error
  if (error) {
    return <Box sx={{
      p: 3,
      textAlign: 'center'
    }}>
        <Paper sx={{
        p: 3
      }}>
          <Typography variant="h5" color="error" gutterBottom>
            Admin Check Error
          </Typography>
          <Typography paragraph>
            {error.message || 'An error occurred while verifying admin permissions.'}
          </Typography>
          <Button variant="contained" color="primary" onClick={clearError}>
            Try Again
          </Button>
        </Paper>
      </Box>;
  }
  if (!user || !user.isAuthenticated) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/login" state={{
      from: location
    }} replace />;
  }
  if (!user.isAdmin) {
    // User is authenticated but not an admin, redirect to home
    return <Navigate to="/" replace />;
  }
  return children;
};
export default withErrorBoundary(RequireAdmin, {
  boundary: 'RequireAdmin',
  fallback: ({
    error,
    resetError
  }) => <Box sx={{
    p: 3,
    textAlign: 'center'
  }}>
      <Paper sx={{
      p: 3
    }}>
        <Typography variant="h5" color="error" gutterBottom>
          Admin Authentication Error
        </Typography>
        <Typography paragraph>
          {error?.message || 'An error occurred while verifying admin status. Please try again or log in again.'}
        </Typography>
        <Box sx={{
        mt: 2
      }}>
          <Button variant="contained" color="primary" onClick={resetError} sx={{
          mr: 2
        }}>
            Try Again
          </Button>
          <Button variant="outlined" onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </Box>
      </Paper>
    </Box>
});