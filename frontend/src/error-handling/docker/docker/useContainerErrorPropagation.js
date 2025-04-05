import { useContext, useCallback, useEffect } from 'react';
import { ContainerErrorContext } from './ContainerErrorContext';

/**
 * Custom hook for cross-container error propagation
 * @param {Object} options - Configuration options
 * @returns {Object} Container error handler
 */
export function useContainerErrorPropagation(options = {}) {
  const { 
    containerName = 'frontend',
    listenTo = []
  } = options;
  
  const containerContext = useContext(ContainerErrorContext);
  
  // Set up listener for errors from specified containers
  useEffect(() => {
    if (listenTo.length > 0) {
      const cleanupListener = containerContext.listenForContainerErrors((error) => {
        // Only handle errors from containers we're listening to
        if (listenTo.includes(error.container)) {
          console.log(`[Container Error] Received from ${error.container}: ${error.message}`);
        }
      });
      
      return cleanupListener;
    }
  }, [listenTo, containerContext]);
  
  // Enhanced propagateError function that includes container name
  const propagateError = useCallback((error, targetContainers = []) => {
    return containerContext.propagateError(error, containerName, targetContainers);
  }, [containerName, containerContext.propagateError]);
  
  return {
    containerErrors: containerContext.containerErrors,
    propagateError,
    listenForContainerErrors: containerContext.listenForContainerErrors,
    clearContainerErrors: containerContext.clearContainerErrors
  };
}