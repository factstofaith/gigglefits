import React, { createContext, useState, useContext, useMemo } from 'react';

/**
 * @typedef {Object} ContainerCommunicationManagerContextType
 * @property {Object} state - Current state 
 * @property {Function} setState - Function to update the context state
 */

/**
 * Context for ContainerCommunicationManager functionality
 */
const ContainerCommunicationManagerContext = createContext(null);

/**
 * Provider component for ContainerCommunicationManager context
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider
 */
function ContainerCommunicationManagerProvider({ children }) {
  return <ContainerCommunicationManagerContextProvider>{children}</ContainerCommunicationManagerContextProvider>;
}

/**
 * Implementation of the ContainerCommunicationManager context provider
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider implementation
 */
function ContainerCommunicationManagerContextProvider({ children }) {
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
    <ContainerCommunicationManagerContext.Provider value={value}>
      {children}
    </ContainerCommunicationManagerContext.Provider>);

}

/**
 * Custom hook for accessing ContainerCommunicationManager context
 * 
 * @returns {ContainerCommunicationManagerContextType} The context value
 * @throws {Error} If used outside of a ContainerCommunicationManagerProvider
 */
function useContainerCommunicationManager() {
  const context = useContext(ContainerCommunicationManagerContext);
  if (context === null) {
    throw new Error('useContainerCommunicationManager must be used within a ContainerCommunicationManagerProvider');
  }
  return context;
}

// Export components and hooks
export {
  ContainerCommunicationManagerContext,
  ContainerCommunicationManagerProvider,
  ContainerCommunicationManagerContextProvider,
  useContainerCommunicationManager };


export default ContainerCommunicationManagerContextProvider;