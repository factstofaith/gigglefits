import { useState, useCallback } from 'react';
import { reportError, ErrorSeverity } from './error-service';

/**
 * Custom hook for handling errors in functional components
 * 
 * This hook provides a simple way to handle errors in functional components,
 * including an error state and utility functions for error reporting.
 * 
 * @param {string} [boundary='unknown'] - The component name or boundary for error tracking
 * @param {Object} [options={}] - Additional options
 * @param {boolean} [options.throwErrors=false] - Whether to throw errors after reporting them
 * @param {Function} [options.onError] - Callback function when an error occurs
 * @returns {Object} Error handling utilities
 * @returns {Error|null} error - The current error state
 * @returns {Function} handleError - Function to handle and report an error
 * @returns {Function} clearError - Function to clear the current error
 * @returns {Function} wrapPromise - Function to wrap a promise with error handling
 * 
 * @example
 * function UserProfile({ userId }) {
 *   const { error, handleError, clearError, wrapPromise } = useErrorHandler('UserProfile');
 *   const [user, setUser] = useState(null);
 *   
 *   useEffect(() => {
 *     // Use wrapPromise to automatically handle errors in promises
 *     wrapPromise(
 *       fetchUser(userId)
 *         .then(data => setUser(data))
 *     );
 *   }, [userId, wrapPromise]);
 *   
 *   // Manually handle error
 *   const handleSubmit = async (data) => {
 *     try {
 *       await updateUser(userId, data);
 *     } catch (err) {
 *       handleError(err, { userId, data });
 *       return;
 *     }
 *   };
 *   
 *   if (error) {
 *     return (
 *       <div>
 *         <p>Error: {error.message}</p>
 *         <button onClick={clearError}>Try Again</button>
 *       </div>
 *     );
 *   }
 *   
 *   return <UserForm user={user} onSubmit={handleSubmit} />;
 * }
 */
function useErrorHandler(boundary = 'unknown', options = {}) {
  const { throwErrors = false, onError } = options;
  
  // State for tracking current error
  const [error, setError] = useState(null);
  
  /**
   * Handle and report an error
   * @param {Error} err - The error to handle
   * @param {Object} [info={}] - Additional error information
   * @param {string} [severity=ErrorSeverity.ERROR] - Error severity level
   */
  const handleError = useCallback((err, info = {}, severity = ErrorSeverity.ERROR) => {
    // Set error state
    setError(err);
    
    // Report error to service
    reportError(err, info, boundary, severity);
    
    // Call onError callback if provided
    if (onError) {
      onError(err, info);
    }
    
    // Optionally re-throw the error
    if (throwErrors) {
      throw err;
    }
  }, [boundary, throwErrors, onError]);
  
  /**
   * Clear the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  /**
   * Wrap a promise with error handling
   * @param {Promise} promise - The promise to wrap
   * @param {Object} [info={}] - Additional error information
   * @param {string} [severity=ErrorSeverity.ERROR] - Error severity level
   * @returns {Promise} The wrapped promise
   */
  const wrapPromise = useCallback((promise, info = {}, severity = ErrorSeverity.ERROR) => {
    return promise.catch(err => {
      handleError(err, { ...info, async: true }, severity);
      // Re-throw to maintain promise rejection chain
      throw err;
    });
  }, [handleError]);
  
  return {
    error,
    handleError,
    clearError,
    wrapPromise
  };
}

export default useErrorHandler;