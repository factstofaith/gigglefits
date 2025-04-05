import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { ENV } from '@/utils/environmentConfig';
import { reportError, ErrorSeverity } from '../error-service';

/**
 * @typedef {Object} ContainerErrorContextContextType
 * @property {Object} state - Current state 
 * @property {Function} setState - Function to update the context state
 * @property {Function} propagateError - Function to propagate error to other containers
 * @property {Function} registerContainer - Function to register this container
 * @property {string} containerId - The ID of this container
 */

/**
 * Context for ContainerErrorContext functionality
 */
const ContainerErrorContextContext = createContext(null);

/**
 * Provider component for ContainerErrorContext context
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider
 */
function ContainerErrorContextProvider({ children }) {
  return <ContainerErrorContextContextProvider>{children}</ContainerErrorContextContextProvider>;
}

/**
 * Implementation of the ContainerErrorContext context provider
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider implementation
 */
function ContainerErrorContextContextProvider({ children }) {
  const [state, setState] = useState({
    initialized: false,
    error: null,
    lastChecked: null,
    containers: {},
    registrationId: ENV.REACT_APP_CONTAINER_ID || Date.now().toString()
  });

  // Set up container propagation hooks in window to allow cross-container communication
  useEffect(() => {
    if (typeof window !== 'undefined' && ENV.REACT_APP_RUNNING_IN_DOCKER === 'true') {
      // Set up global container error propagation
      window.__CONTAINER_ERROR_PROPAGATION__ = {
        propagateError: propagateError,
        registerContainer: registerContainer,
        containerId: state.registrationId
      };
      
      // Listen for storage events to handle cross-container communication
      const handleStorageEvent = (event) => {
        if (event.key && event.key.startsWith('docker_container_error_')) {
          try {
            const errorData = JSON.parse(event.newValue);
            if (errorData && errorData.error && errorData.source !== state.registrationId) {
              // Process error from another container
              setState(prevState => ({
                ...prevState,
                error: {
                  ...errorData.error,
                  fromContainer: errorData.source,
                  propagated: true
                },
                lastChecked: new Date().toISOString()
              }));
              
              // Report the propagated error
              reportError(
                new Error(errorData.error.message || 'Error from another container'),
                {
                  original: errorData.error,
                  source: errorData.source,
                  propagated: true,
                  timestamp: new Date().toISOString(),
                  severity: errorData.severity || 'error'
                },
                'containerErrorPropagation',
                errorData.severity === 'warning' ? ErrorSeverity.WARNING : ErrorSeverity.ERROR
              );
            }
          } catch (e) {
            console.error('Failed to process container error:', e);
          }
        }
      };
      
      window.addEventListener('storage', handleStorageEvent);
      
      return () => {
        delete window.__CONTAINER_ERROR_PROPAGATION__;
        window.removeEventListener('storage', handleStorageEvent);
      };
    }
  }, [state.registrationId]);
  
  /**
   * Register a container with the error propagation system
   * @param {string} containerId - The ID of the container
   * @param {string} containerName - The name of the container
   * @returns {string} The registration ID
   */
  const registerContainer = (containerId, containerName) => {
    const registrationId = containerId || state.registrationId;
    
    setState(prevState => ({
      ...prevState,
      containers: {
        ...prevState.containers,
        [registrationId]: {
          id: registrationId,
          name: containerName || 'Unknown container',
          registered: new Date().toISOString()
        }
      }
    }));
    
    return registrationId;
  };
  
  /**
   * Propagate an error to other containers
   * @param {Error} error - The error to propagate
   * @param {Object} options - Options for error propagation
   * @returns {Promise<boolean>} True if the error was propagated
   */
  const propagateError = (error, options = {}) => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && ENV.REACT_APP_RUNNING_IN_DOCKER === 'true') {
        try {
          // Format the error for propagation
          const errorForPropagation = {
            message: error.message,
            stack: error.stack,
            name: error.name,
            timestamp: new Date().toISOString(),
            ...options.metadata
          };
          
          // Store in localStorage to propagate to other containers
          localStorage.setItem(`docker_container_error_${Date.now()}`, JSON.stringify({
            error: errorForPropagation,
            source: state.registrationId,
            severity: options.severity || 'error',
            timestamp: new Date().toISOString()
          }));
          
          resolve(true);
        } catch (e) {
          console.error('Failed to propagate container error:', e);
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    state,
    setState,
    propagateError,
    registerContainer,
    containerId: state.registrationId
  }), [state]);

  return (
    <ContainerErrorContextContext.Provider value={value}>
      {children}
    </ContainerErrorContextContext.Provider>);
}

/**
 * Custom hook for accessing ContainerErrorContext context
 * 
 * @returns {ContainerErrorContextContextType} The context value
 * @throws {Error} If used outside of a ContainerErrorContextProvider
 */
function useContainerErrorContext() {
  const context = useContext(ContainerErrorContextContext);
  if (context === null) {
    throw new Error('useContainerErrorContext must be used within a ContainerErrorContextProvider');
  }
  return context;
}

/**
 * Custom hook for accessing container error propagation
 * 
 * @returns {Object} The error propagation functions and container ID
 */
export function useContainerErrorPropagation() {
  const { propagateError, containerId } = useContainerErrorContext();
  
  return {
    propagateError,
    containerId
  };
}

// Export components and hooks
export {
  ContainerErrorContextContext,
  ContainerErrorContextProvider,
  ContainerErrorContextContextProvider,
  useContainerErrorContext
};

export default ContainerErrorContextContextProvider;