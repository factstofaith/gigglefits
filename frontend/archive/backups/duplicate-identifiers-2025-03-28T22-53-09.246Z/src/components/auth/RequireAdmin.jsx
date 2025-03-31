import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@contexts/UserContext';
import { LinearProgress } from '../../design-system';
import LinearProgress from '@mui/material/LinearProgress';

/**
 * Route protection component that restricts access to admin users only
 * Handles authentication, MFA verification, and admin role requirements
 */
const RequireAdmin = ({ children }) => {
  // Added display name
  RequireAdmin.displayName = 'RequireAdmin';

  // Added display name
  RequireAdmin.displayName = 'RequireAdmin';

  // Added display name
  RequireAdmin.displayName = 'RequireAdmin';


  const { isAuthenticated, isAdmin, isLoading, mfaEnabled, mfaVerified } = useUser();
  const location = useLocation();

  // Show loading indicator while auth state is being determined
  if (isLoading) {
    return (
      <div style={{ width: '100%', padding: '20px' }}>
        <LinearProgress />
      </div>
    );
  }

  // Redirect to login page if not authenticated
  if (!isAuthenticated) {
    // Keep the intended destination for redirection after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to MFA verification if user has MFA enabled but not yet verified in this session
  if (mfaEnabled && !mfaVerified) {
    return <Navigate to="/mfa-verify" state={{ from: location }} replace />;
  }

  // Redirect to home page if authenticated but not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated, MFA verified if required, and has admin role, allow access
  return children;
};

export default RequireAdmin;