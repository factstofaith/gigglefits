import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

/**
 * RequireAuth component - Protects routes that require authentication
 * Redirects to login if user is not authenticated
 */
const RequireAuth = ({ children }) => {
  const { state: user } = useUser();
  const location = useLocation();

  if (!user || !user.isAuthenticated) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;