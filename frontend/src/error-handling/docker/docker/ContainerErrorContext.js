import React, { createContext, useState, useCallback } from 'react';

// Create context for container errors
export const ContainerErrorContext = createContext({
  containerErrors: [],
  propagateError: () => {},
  listenForContainerErrors: () => {},
  clearContainerErrors: () => {}
});

/**
 * Provider component for cross-container error propagation
 */
export function ContainerErrorProvider({ children }) {
  const [containerErrors, setContainerErrors] = useState([]);
  
  // Propagate error to other containers
  const propagateError = useCallback((error, sourceContainer, targetContainers = []) => {
    const errorObj = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      container: sourceContainer,
      timestamp: new Date().toISOString(),
      targets: targetContainers
    };
    
    setContainerErrors(prev => [...prev, errorObj]);
    
    // If this is within the same Docker network, we could use a service
    // to notify other containers - for now we just log to console
    console.error(`[Container Error] ${sourceContainer}: ${error.message}`);
    
    return errorObj;
  }, []);
  
  // Listen for errors from other containers (simplified mock)
  const listenForContainerErrors = useCallback((callback) => {
    // This would ideally use Server-Sent Events or WebSockets to listen
    // for errors from other containers in a real implementation
    const interval = setInterval(() => {
      // Mock implementation
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Clear all container errors
  const clearContainerErrors = useCallback(() => {
    setContainerErrors([]);
  }, []);
  
  const value = {
    containerErrors,
    propagateError,
    listenForContainerErrors,
    clearContainerErrors
  };
  
  return (
    <ContainerErrorContext.Provider value={value}>
      {children}
    </ContainerErrorContext.Provider>
  );
}