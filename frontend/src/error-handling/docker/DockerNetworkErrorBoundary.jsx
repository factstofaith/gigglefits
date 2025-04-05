import React, { createContext, useState, useContext, useMemo } from 'react';

/**
 * @typedef {Object} DockerNetworkErrorBoundaryContextType
 * @property {Object} state - Current state 
 * @property {Function} setState - Function to update the context state
 */

/**
 * Context for DockerNetworkErrorBoundary functionality
 */
const DockerNetworkErrorBoundaryContext = createContext(null);

/**
 * Provider component for DockerNetworkErrorBoundary context
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider
 */
function DockerNetworkErrorBoundaryProvider({ children }) {
  return <DockerNetworkErrorBoundaryContextProvider>{children}</DockerNetworkErrorBoundaryContextProvider>;
}

/**
 * Implementation of the DockerNetworkErrorBoundary context provider
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider implementation
 */
function DockerNetworkErrorBoundaryContextProvider({ children }) {
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
    <DockerNetworkErrorBoundaryContext.Provider value={value}>
      {children}
    </DockerNetworkErrorBoundaryContext.Provider>);

}

/**
 * Custom hook for accessing DockerNetworkErrorBoundary context
 * 
 * @returns {DockerNetworkErrorBoundaryContextType} The context value
 * @throws {Error} If used outside of a DockerNetworkErrorBoundaryProvider
 */
function useDockerNetworkErrorBoundary() {
  const context = useContext(DockerNetworkErrorBoundaryContext);
  if (context === null) {
    throw new Error('useDockerNetworkErrorBoundary must be used within a DockerNetworkErrorBoundaryProvider');
  }
  return context;
}

// Export components and hooks
export {
  DockerNetworkErrorBoundaryContext,
  DockerNetworkErrorBoundaryProvider,
  DockerNetworkErrorBoundaryContextProvider,
  useDockerNetworkErrorBoundary };


export default DockerNetworkErrorBoundaryContextProvider;