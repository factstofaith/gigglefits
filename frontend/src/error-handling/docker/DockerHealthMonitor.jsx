import React, { createContext, useState, useContext, useMemo } from 'react';

/**
 * @typedef {Object} DockerHealthMonitorContextType
 * @property {Object} state - Current state 
 * @property {Function} setState - Function to update the context state
 */

/**
 * Context for DockerHealthMonitor functionality
 */
const DockerHealthMonitorContext = createContext(null);

/**
 * Provider component for DockerHealthMonitor context
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider
 */
function DockerHealthMonitorProvider({ children }) {
  return <DockerHealthMonitorContextProvider>{children}</DockerHealthMonitorContextProvider>;
}

/**
 * Implementation of the DockerHealthMonitor context provider
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider implementation
 */
function DockerHealthMonitorContextProvider({ children }) {
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
    <DockerHealthMonitorContext.Provider value={value}>
      {children}
    </DockerHealthMonitorContext.Provider>);

}

/**
 * Custom hook for accessing DockerHealthMonitor context
 * 
 * @returns {DockerHealthMonitorContextType} The context value
 * @throws {Error} If used outside of a DockerHealthMonitorProvider
 */
function useDockerHealthMonitor() {
  const context = useContext(DockerHealthMonitorContext);
  if (context === null) {
    throw new Error('useDockerHealthMonitor must be used within a DockerHealthMonitorProvider');
  }
  return context;
}

// Export components and hooks
export {
  DockerHealthMonitorContext,
  DockerHealthMonitorProvider,
  DockerHealthMonitorContextProvider,
  useDockerHealthMonitor };


export default DockerHealthMonitorContextProvider;