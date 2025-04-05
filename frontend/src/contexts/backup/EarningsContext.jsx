
import React, { createContext, useState, useContext, useMemo } from 'react';

/**
 * @typedef {Object} earningsContextType
 * @property {Object} state - The context state
 * @property {Function} setState - Function to update context state
 */

/**
 * Context for earnings functionality
 * @type {React.Context<earningsContextType>}
 */
export const EarningsContext = createContext(null);

/**
 * Provider component for earnings context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export function EarningsProvider({ children }) {
  return <EarningsContextProvider>{children}</EarningsContextProvider>;
}

/**
 * Implementation of the earnings context provider
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider implementation
 */
export function EarningsContextProvider({ children }) {
  const [state, setState] = useState({});
  
  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ 
    state, 
    setState 
  }), [state]);
  
  return (
    <EarningsContext.Provider value={value}>
      {children}
    </EarningsContext.Provider>
  );
}

/**
 * Custom hook for accessing earnings context
 * @returns {earningsContextType} The context value
 * @throws {Error} If used outside of a EarningsProvider
 */
export function useEarnings() {
  const context = useContext(EarningsContext);
  if (context === null) {
    throw new Error('useEarnings must be used within a EarningsProvider');
  }
  return context;
}

export default React.memo(EarningsContextProvider);
