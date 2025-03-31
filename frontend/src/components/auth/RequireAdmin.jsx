import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

/**
 * RequireAdmin component - Protects routes that require admin privileges
 * Redirects to home if user is not an admin
 */
const RequireAdmin = ({ children }) => {
  const { state: user } = useUser();
  const location = useLocation();

  if (!user || !user.isAuthenticated) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.isAdmin) {
    // User is authenticated but not an admin, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireAdmin;