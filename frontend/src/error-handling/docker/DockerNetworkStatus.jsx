import React, { createContext, useState, useContext, useMemo } from 'react';

/**
 * @typedef {Object} DockerNetworkStatusContextType
 * @property {Object} state - Current state 
 * @property {Function} setState - Function to update the context state
 */

/**
 * Context for DockerNetworkStatus functionality
 */
const DockerNetworkStatusContext = createContext(null);

/**
 * Provider component for DockerNetworkStatus context
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider
 */
function DockerNetworkStatusProvider({ children }) {
  return <DockerNetworkStatusContextProvider>{children}</DockerNetworkStatusContextProvider>;
}

/**
 * Implementation of the DockerNetworkStatus context provider
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider implementation
 */
function DockerNetworkStatusContextProvider({ children }) {
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
    <DockerNetworkStatusContext.Provider value={value}>
      {children}
    </DockerNetworkStatusContext.Provider>);

}

/**
 * Custom hook for accessing DockerNetworkStatus context
 * 
 * @returns {DockerNetworkStatusContextType} The context value
 * @throws {Error} If used outside of a DockerNetworkStatusProvider
 */
function useDockerNetworkStatus() {
  const context = useContext(DockerNetworkStatusContext);
  if (context === null) {
    throw new Error('useDockerNetworkStatus must be used within a DockerNetworkStatusProvider');
  }
  return context;
}

// Export components and hooks
export {
  DockerNetworkStatusContext,
  DockerNetworkStatusProvider,
  DockerNetworkStatusContextProvider,
  useDockerNetworkStatus };


export default DockerNetworkStatusContextProvider;