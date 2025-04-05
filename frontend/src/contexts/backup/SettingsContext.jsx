
import React, { createContext, useState, useContext, useMemo } from 'react';

/**
 * @typedef {Object} settingsContextType
 * @property {Object} state - The context state
 * @property {Function} setState - Function to update context state
 */

/**
 * Context for settings functionality
 * @type {React.Context<settingsContextType>}
 */
export const SettingsContext = createContext(null);

/**
 * Provider component for settings context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export function SettingsProvider({ children }) {
  return <SettingsContextProvider>{children}</SettingsContextProvider>;
}

/**
 * Implementation of the settings context provider
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider implementation
 */
export function SettingsContextProvider({ children }) {
  const [state, setState] = useState({});
  
  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ 
    state, 
    setState 
  }), [state]);
  
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Custom hook for accessing settings context
 * @returns {settingsContextType} The context value
 * @throws {Error} If used outside of a SettingsProvider
 */
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === null) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export default React.memo(SettingsContextProvider);
