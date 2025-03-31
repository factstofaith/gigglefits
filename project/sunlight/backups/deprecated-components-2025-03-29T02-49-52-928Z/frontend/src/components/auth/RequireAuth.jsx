import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@contexts/UserContext';
import { LinearProgress } from '../../design-system';
// Design system import already exists;
// Removed duplicate import

/**
 * Route protection component that redirects to login if user is not authenticated
 * Handles MFA verification requirements when user is authenticated but MFA is required
 * Supports MFA bypass for admin accounts with bypass_mfa flag
 */
const RequireAuth = ({ children }) => {
  // Added display name
  RequireAuth.displayName = 'RequireAuth';

  // Added display name
  RequireAuth.displayName = 'RequireAuth';

  // Added display name
  RequireAuth.displayName = 'RequireAuth';

  // Added display name
  RequireAuth.displayName = 'RequireAuth';

  // Added display name
  RequireAuth.displayName = 'RequireAuth';


  const { isAuthenticated, isLoading, mfaEnabled, mfaVerified, bypassMfa } = useUser();
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
    return <Navigate to="/login&quot; state={{ from: location }} replace />;
  }

  // Redirect to MFA verification if user has MFA enabled but not yet verified in this session
  // Skip MFA verification if user has bypass_mfa flag set
  if (mfaEnabled && !mfaVerified && !bypassMfa) {
    return <Navigate to="/mfa-verify" state={{ from: location }} replace />;
  }

  // User is authenticated (and MFA verified if required), allow access
  return children;
};

export default RequireAuth;