import React, { createContext, useState, useContext, useMemo } from 'react';

/**
 * @typedef {Object} DockerEnvironmentCheckContextType
 * @property {Object} state - Current state 
 * @property {Function} setState - Function to update the context state
 */

/**
 * Context for DockerEnvironmentCheck functionality
 */
const DockerEnvironmentCheckContext = createContext(null);

/**
 * Provider component for DockerEnvironmentCheck context
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider
 */
function DockerEnvironmentCheckProvider({ children }) {
  return <DockerEnvironmentCheckContextProvider>{children}</DockerEnvironmentCheckContextProvider>;
}

/**
 * Implementation of the DockerEnvironmentCheck context provider
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider implementation
 */
function DockerEnvironmentCheckContextProvider({ children }) {
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
    <DockerEnvironmentCheckContext.Provider value={value}>
      {children}
    </DockerEnvironmentCheckContext.Provider>);

}

/**
 * Custom hook for accessing DockerEnvironmentCheck context
 * 
 * @returns {DockerEnvironmentCheckContextType} The context value
 * @throws {Error} If used outside of a DockerEnvironmentCheckProvider
 */
function useDockerEnvironmentCheck() {
  const context = useContext(DockerEnvironmentCheckContext);
  if (context === null) {
    throw new Error('useDockerEnvironmentCheck must be used within a DockerEnvironmentCheckProvider');
  }
  return context;
}

// Export components and hooks
export {
  DockerEnvironmentCheckContext,
  DockerEnvironmentCheckProvider,
  DockerEnvironmentCheckContextProvider,
  useDockerEnvironmentCheck };


export default DockerEnvironmentCheckContextProvider;