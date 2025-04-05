import React, { createContext, useState, useContext, useMemo } from 'react';

/**
 * @typedef {Object} HealthCheckProviderContextType
 * @property {Object} state - Current state 
 * @property {Function} setState - Function to update the context state
 */

/**
 * Context for HealthCheckProvider functionality
 */
const HealthCheckProviderContext = createContext(null);

/**
 * Provider component for HealthCheckProvider context
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider
 */
function HealthCheckProviderProvider({ children }) {
  return <HealthCheckProviderContextProvider>{children}</HealthCheckProviderContextProvider>;
}

/**
 * Implementation of the HealthCheckProvider context provider
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider implementation
 */
function HealthCheckProviderContextProvider({ children }) {
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
    <HealthCheckProviderContext.Provider value={value}>
      {children}
    </HealthCheckProviderContext.Provider>);

}

/**
 * Custom hook for accessing HealthCheckProvider context
 * 
 * @returns {HealthCheckProviderContextType} The context value
 * @throws {Error} If used outside of a HealthCheckProviderProvider
 */
function useHealthCheckProvider() {
  const context = useContext(HealthCheckProviderContext);
  if (context === null) {
    throw new Error('useHealthCheckProvider must be used within a HealthCheckProviderProvider');
  }
  return context;
}

// Export components and hooks
export {
  HealthCheckProviderContext,
  HealthCheckProviderProvider,
  HealthCheckProviderContextProvider,
  useHealthCheckProvider };


export default HealthCheckProviderContextProvider;