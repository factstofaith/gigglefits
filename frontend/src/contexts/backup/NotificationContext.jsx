
import React, { createContext, useState, useContext, useMemo } from 'react';

/**
 * @typedef {Object} notificationContextType
 * @property {Object} state - The context state
 * @property {Function} setState - Function to update context state
 */

/**
 * Context for notification functionality
 * @type {React.Context<notificationContextType>}
 */
export const NotificationContext = createContext(null);

/**
 * Provider component for notification context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export function NotificationProvider({ children }) {
  return <NotificationContextProvider>{children}</NotificationContextProvider>;
}

/**
 * Implementation of the notification context provider
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider implementation
 */
export function NotificationContextProvider({ children }) {
  const [state, setState] = useState({});
  
  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ 
    state, 
    setState 
  }), [state]);
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Custom hook for accessing notification context
 * @returns {notificationContextType} The context value
 * @throws {Error} If used outside of a NotificationProvider
 */
export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === null) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

export default React.memo(NotificationContextProvider);
