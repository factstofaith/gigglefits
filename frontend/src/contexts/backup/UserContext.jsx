
import React, { createContext, useState, useContext, useMemo } from 'react';

/**
 * @typedef {Object} userContextType
 * @property {Object} state - The context state
 * @property {Function} setState - Function to update context state
 */

/**
 * Context for user functionality
 * @type {React.Context<userContextType>}
 */
export const UserContext = createContext(null);

/**
 * Provider component for user context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export function UserProvider({ children }) {
  return <UserContextProvider>{children}</UserContextProvider>;
}

/**
 * Implementation of the user context provider
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider implementation
 */
export function UserContextProvider({ children }) {
  const [state, setState] = useState({});
  
  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ 
    state, 
    setState 
  }), [state]);
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Custom hook for accessing user context
 * @returns {userContextType} The context value
 * @throws {Error} If used outside of a UserProvider
 */
export function useUser() {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default React.memo(UserContextProvider);
