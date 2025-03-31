/**
 * RequireAdmin Component
 * 
 * Protects routes that require admin privileges.
 * 
 * @module components/auth/RequireAdmin
 */

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * RequireAdmin Component
 * 
 * @returns {JSX.Element} Outlet for child routes or navigate to unauthorized
 */
const RequireAdmin = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // Show loading indicator while checking auth state
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Authenticating...</p>
      </div>
    );
  }
  
  // Verify admin role
  const isAdmin = user?.role === 'admin';
  
  // Redirect to home if not an admin
  if (!isAdmin) {
    return <Navigate to="/" state={{ from: location, error: 'Unauthorized access' }} replace />;
  }
  
  // Render child routes
  return <Outlet />;
};

export default RequireAdmin;