/**
 * RequireAuth Component
 * 
 * Protects routes that require authentication.
 * 
 * @module components/auth/RequireAuth
 */

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * RequireAuth Component
 * 
 * @returns {JSX.Element} Outlet for child routes or redirect to login
 */
const RequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();
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
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Render child routes
  return <Outlet />;
};

export default RequireAuth;