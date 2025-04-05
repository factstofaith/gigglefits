
import React, { createContext, useState, useContext, useMemo } from 'react';

/**
 * @typedef {Object} configContextType
 * @property {Object} state - The context state
 * @property {Function} setState - Function to update context state
 */

/**
 * Context for config functionality
 * @type {React.Context<configContextType>}
 */
export const ConfigContext = createContext(null);

/**
 * Provider component for config context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export function ConfigProvider({ children }) {
  return <ConfigContextProvider>{children}</ConfigContextProvider>;
}

/**
 * Implementation of the config context provider
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider implementation
 */
export function ConfigContextProvider({ children }) {
  const [state, setState] = useState({});
  
  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ 
    state, 
    setState 
  }), [state]);
  
  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

/**
 * Custom hook for accessing config context
 * @returns {configContextType} The context value
 * @throws {Error} If used outside of a ConfigProvider
 */
export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === null) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

export default React.memo(ConfigContextProvider);
