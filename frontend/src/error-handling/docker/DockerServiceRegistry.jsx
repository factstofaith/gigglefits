import React, { createContext, useState, useContext, useMemo } from 'react';

/**
 * @typedef {Object} DockerServiceRegistryContextType
 * @property {Object} state - Current state 
 * @property {Function} setState - Function to update the context state
 */

/**
 * Context for DockerServiceRegistry functionality
 */
const DockerServiceRegistryContext = createContext(null);

/**
 * Provider component for DockerServiceRegistry context
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider
 */
function DockerServiceRegistryProvider({ children }) {
  return <DockerServiceRegistryContextProvider>{children}</DockerServiceRegistryContextProvider>;
}

/**
 * Implementation of the DockerServiceRegistry context provider
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider implementation
 */
function DockerServiceRegistryContextProvider({ children }) {
  const [state, setState] = useState({
    initialized: false,
    error: null,
    lastChecked: null
  });

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    state,
    setState
  }), [state]);

  return (
    <DockerServiceRegistryContext.Provider value={value}>
      {children}
    </DockerServiceRegistryContext.Provider>);

}

/**
 * Custom hook for accessing DockerServiceRegistry context
 * 
 * @returns {DockerServiceRegistryContextType} The context value
 * @throws {Error} If used outside of a DockerServiceRegistryProvider
 */
function useDockerServiceRegistry() {
  const context = useContext(DockerServiceRegistryContext);
  if (context === null) {
    throw new Error('useDockerServiceRegistry must be used within a DockerServiceRegistryProvider');
  }
  return context;
}

// Export components and hooks
export {
  DockerServiceRegistryContext,
  DockerServiceRegistryProvider,
  DockerServiceRegistryContextProvider,
  useDockerServiceRegistry };


export default DockerServiceRegistryContextProvider;