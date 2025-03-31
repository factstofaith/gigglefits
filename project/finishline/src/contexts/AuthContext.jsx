/**
 * AuthContext
 * 
 * Context provider for application-wide authentication state management.
 * 
 * @module contexts/AuthContext
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';

// Create the context
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  register: () => {},
  updateProfile: () => {},
});

/**
 * Auth Provider Component
 * 
 * @param {Object} props - Component props
 * @param {node} props.children - Child components
 * @param {Object} [props.initialUser=null] - Initial user data for testing
 * @returns {JSX.Element} Auth provider
 */
export function AuthProvider({ children, initialUser = null }) {
  // State for authentication
  const [user, setUser] = useState(initialUser);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, this would check localStorage and/or make an API call
        // to validate the session and get user data
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to restore authentication state:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Login functionality
  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    
    try {
      // In a real app, this would make an API call to authenticate
      // For demo purposes, we'll simulate a successful login if email and password are provided
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Email and password are required');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock successful authentication
      const userData = {
        id: '12345',
        email: credentials.email,
        name: 'Demo User',
        role: 'user',
      };
      
      // Store in state and localStorage
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Logout functionality
  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // In a real app, this would make an API call to invalidate the session
      // For demo purposes, we'll just clear local state
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Clear auth state
      setUser(null);
      localStorage.removeItem('user');
      
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Register functionality
  const register = useCallback(async (userData) => {
    setIsLoading(true);
    
    try {
      // In a real app, this would make an API call to register a new user
      // For demo purposes, we'll simulate a successful registration if required fields are provided
      if (!userData?.email || !userData?.password || !userData?.name) {
        throw new Error('Email, password and name are required');
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Invalid email format');
      }
      
      // Validate password strength
      if (userData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock successful registration
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        email: userData.email,
        name: userData.name,
        role: 'user',
      };
      
      // Store in state and localStorage
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Update profile functionality
  const updateProfile = useCallback(async (profileData) => {
    setIsLoading(true);
    
    try {
      // Ensure user is authenticated
      if (!user) {
        throw new Error('User must be authenticated to update profile');
      }
      
      // In a real app, this would make an API call to update the user's profile
      // For demo purposes, we'll simulate a successful update
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update user data
      const updatedUser = {
        ...user,
        ...profileData,
      };
      
      // Store in state and localStorage
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  // Computed isAuthenticated state
  const isAuthenticated = useMemo(() => Boolean(user), [user]);
  
  // Value object for the context
  const contextValue = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    updateProfile,
  }), [user, isAuthenticated, isLoading, login, logout, register, updateProfile]);
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use auth context
 * 
 * @returns {Object} Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

AuthProvider.propTypes = {
  /** Child components */
  children: PropTypes.node.isRequired,
  
  /** Initial user data (primarily for testing) */
  initialUser: PropTypes.object,
};

export default AuthContext;