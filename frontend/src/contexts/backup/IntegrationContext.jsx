
import React, { createContext, useState, useContext, useMemo } from 'react';

/**
 * @typedef {Object} integrationContextType
 * @property {Object} state - The context state
 * @property {Function} setState - Function to update context state
 */

/**
 * Context for integration functionality
 * @type {React.Context<integrationContextType>}
 */
export const IntegrationContext = createContext(null);

/**
 * Provider component for integration context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export function IntegrationProvider({ children }) {
  return <IntegrationContextProvider>{children}</IntegrationContextProvider>;
}

/**
 * Implementation of the integration context provider
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider implementation
 */
export function IntegrationContextProvider({ children }) {
  const [state, setState] = useState({});
  
  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ 
    state, 
    setState 
  }), [state]);
  
  return (
    <IntegrationContext.Provider value={value}>
      {children}
    </IntegrationContext.Provider>
  );
}

/**
 * Custom hook for accessing integration context
 * @returns {integrationContextType} The context value
 * @throws {Error} If used outside of a IntegrationProvider
 */
export function useIntegration() {
  const context = useContext(IntegrationContext);
  if (context === null) {
    throw new Error('useIntegration must be used within a IntegrationProvider');
  }
  return context;
}

export default React.memo(IntegrationContextProvider);
