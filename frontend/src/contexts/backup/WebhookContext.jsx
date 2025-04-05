
import React, { createContext, useState, useContext, useMemo } from 'react';

/**
 * @typedef {Object} webhookContextType
 * @property {Object} state - The context state
 * @property {Function} setState - Function to update context state
 */

/**
 * Context for webhook functionality
 * @type {React.Context<webhookContextType>}
 */
export const WebhookContext = createContext(null);

/**
 * Provider component for webhook context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export function WebhookProvider({ children }) {
  return <WebhookContextProvider>{children}</WebhookContextProvider>;
}

/**
 * Implementation of the webhook context provider
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider implementation
 */
export function WebhookContextProvider({ children }) {
  const [state, setState] = useState({});
  
  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ 
    state, 
    setState 
  }), [state]);
  
  return (
    <WebhookContext.Provider value={value}>
      {children}
    </WebhookContext.Provider>
  );
}

/**
 * Custom hook for accessing webhook context
 * @returns {webhookContextType} The context value
 * @throws {Error} If used outside of a WebhookProvider
 */
export function useWebhook() {
  const context = useContext(WebhookContext);
  if (context === null) {
    throw new Error('useWebhook must be used within a WebhookProvider');
  }
  return context;
}

export default React.memo(WebhookContextProvider);
