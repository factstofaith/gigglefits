
import React, { createContext, useState, useContext, useMemo } from 'react';

/**
 * @typedef {Object} helpContextType
 * @property {Object} state - The context state
 * @property {Function} setState - Function to update context state
 */

/**
 * Context for help functionality
 * @type {React.Context<helpContextType>}
 */
export const HelpContext = createContext(null);

/**
 * Provider component for help context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export function HelpProvider({ children }) {
  return <HelpContextProvider>{children}</HelpContextProvider>;
}

/**
 * Implementation of the help context provider
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider implementation
 */
export function HelpContextProvider({ children }) {
  const [state, setState] = useState({});
  
  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ 
    state, 
    setState 
  }), [state]);
  
  return (
    <HelpContext.Provider value={value}>
      {children}
    </HelpContext.Provider>
  );
}

/**
 * Custom hook for accessing help context
 * @returns {helpContextType} The context value
 * @throws {Error} If used outside of a HelpProvider
 */
export function useHelp() {
  const context = useContext(HelpContext);
  if (context === null) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
}

export default React.memo(HelpContextProvider);
