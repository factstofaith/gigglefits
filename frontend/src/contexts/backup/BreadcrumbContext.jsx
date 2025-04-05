
import React, { createContext, useState, useContext, useMemo } from 'react';

/**
 * @typedef {Object} breadcrumbContextType
 * @property {Object} state - The context state
 * @property {Function} setState - Function to update context state
 */

/**
 * Context for breadcrumb functionality
 * @type {React.Context<breadcrumbContextType>}
 */
export const BreadcrumbContext = createContext(null);

/**
 * Provider component for breadcrumb context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export function BreadcrumbProvider({ children }) {
  return <BreadcrumbContextProvider>{children}</BreadcrumbContextProvider>;
}

/**
 * Implementation of the breadcrumb context provider
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider implementation
 */
export function BreadcrumbContextProvider({ children }) {
  const [state, setState] = useState({});
  
  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ 
    state, 
    setState 
  }), [state]);
  
  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

/**
 * Custom hook for accessing breadcrumb context
 * @returns {breadcrumbContextType} The context value
 * @throws {Error} If used outside of a BreadcrumbProvider
 */
export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (context === null) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
}

export default React.memo(BreadcrumbContextProvider);
