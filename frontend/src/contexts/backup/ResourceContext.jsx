
import React, { createContext, useState, useContext, useMemo } from 'react';

/**
 * @typedef {Object} resourceContextType
 * @property {Object} state - The context state
 * @property {Function} setState - Function to update context state
 */

/**
 * Context for resource functionality
 * @type {React.Context<resourceContextType>}
 */
export const ResourceContext = createContext(null);

/**
 * Provider component for resource context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export function ResourceProvider({ children }) {
  return <ResourceContextProvider>{children}</ResourceContextProvider>;
}

/**
 * Implementation of the resource context provider
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider implementation
 */
export function ResourceContextProvider({ children }) {
  const [state, setState] = useState({});
  
  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ 
    state, 
    setState 
  }), [state]);
  
  return (
    <ResourceContext.Provider value={value}>
      {children}
    </ResourceContext.Provider>
  );
}

/**
 * Custom hook for accessing resource context
 * @returns {resourceContextType} The context value
 * @throws {Error} If used outside of a ResourceProvider
 */
export function useResource() {
  const context = useContext(ResourceContext);
  if (context === null) {
    throw new Error('useResource must be used within a ResourceProvider');
  }
  return context;
}

export default React.memo(ResourceContextProvider);
