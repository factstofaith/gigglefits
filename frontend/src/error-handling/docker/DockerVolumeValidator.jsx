import React, { createContext, useState, useContext, useMemo } from 'react';

/**
 * @typedef {Object} DockerVolumeValidatorContextType
 * @property {Object} state - Current state 
 * @property {Function} setState - Function to update the context state
 */

/**
 * Context for DockerVolumeValidator functionality
 */
const DockerVolumeValidatorContext = createContext(null);

/**
 * Provider component for DockerVolumeValidator context
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider
 */
function DockerVolumeValidatorProvider({ children }) {
  return <DockerVolumeValidatorContextProvider>{children}</DockerVolumeValidatorContextProvider>;
}

/**
 * Implementation of the DockerVolumeValidator context provider
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider implementation
 */
function DockerVolumeValidatorContextProvider({ children }) {
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
    <DockerVolumeValidatorContext.Provider value={value}>
      {children}
    </DockerVolumeValidatorContext.Provider>);

}

/**
 * Custom hook for accessing DockerVolumeValidator context
 * 
 * @returns {DockerVolumeValidatorContextType} The context value
 * @throws {Error} If used outside of a DockerVolumeValidatorProvider
 */
function useDockerVolumeValidator() {
  const context = useContext(DockerVolumeValidatorContext);
  if (context === null) {
    throw new Error('useDockerVolumeValidator must be used within a DockerVolumeValidatorProvider');
  }
  return context;
}

// Export components and hooks
export {
  DockerVolumeValidatorContext,
  DockerVolumeValidatorProvider,
  DockerVolumeValidatorContextProvider,
  useDockerVolumeValidator };


export default DockerVolumeValidatorContextProvider;