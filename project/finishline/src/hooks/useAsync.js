/**
 * useAsync
 * 
 * A hook for handling asynchronous operations with loading, error, and result states.
 * 
 * @module hooks/useAsync
 */

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for handling asynchronous operations
 * 
 * @param {Function} asyncFunction - The async function to execute
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.immediate=false] - Whether to execute the function immediately
 * @param {Array} [options.dependencies=[]] - Dependencies to watch for auto-execution
 * @param {Function} [options.onSuccess] - Callback to run on successful execution
 * @param {Function} [options.onError] - Callback to run on execution error
 * @param {Function} [options.onSettled] - Callback to run after execution (success or error)
 * @param {any} [options.initialData=null] - Initial data value
 * @returns {Object} State and execution function
 */
function useAsync(asyncFunction, options = {}) {
  const {
    immediate = false,
    dependencies = [],
    onSuccess,
    onError,
    onSettled,
    initialData = null,
  } = options;
  
  // State for loading, error, and data
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [data, setData] = useState(initialData);
  
  // Track if the component is mounted
  const isMounted = useRef(false);
  
  // Store the latest asyncFunction to avoid stale closures
  const asyncFunctionRef = useRef(asyncFunction);
  useEffect(() => {
    asyncFunctionRef.current = asyncFunction;
  }, [asyncFunction]);
  
  // Store the latest callbacks to avoid stale closures
  const callbacksRef = useRef({ onSuccess, onError, onSettled });
  useEffect(() => {
    callbacksRef.current = { onSuccess, onError, onSettled };
  }, [onSuccess, onError, onSettled]);
  
  // Function to execute the async operation
  const execute = useCallback(async (...args) => {
    // Set loading state
    setLoading(true);
    setError(null);
    
    try {
      // Execute the async function
      const result = await asyncFunctionRef.current(...args);
      
      // Only update state if the component is still mounted
      if (isMounted.current) {
        setData(result);
        setLoading(false);
        
        // Call onSuccess callback if provided
        if (callbacksRef.current.onSuccess) {
          callbacksRef.current.onSuccess(result);
        }
      }
      
      // Call onSettled callback if provided
      if (isMounted.current && callbacksRef.current.onSettled) {
        callbacksRef.current.onSettled(result, null);
      }
      
      return result;
    } catch (error) {
      // Only update state if the component is still mounted
      if (isMounted.current) {
        setError(error);
        setLoading(false);
        
        // Call onError callback if provided
        if (callbacksRef.current.onError) {
          callbacksRef.current.onError(error);
        }
        
        // Call onSettled callback if provided
        if (callbacksRef.current.onSettled) {
          callbacksRef.current.onSettled(null, error);
        }
      }
      
      // Re-throw the error for the caller to handle if needed
      throw error;
    }
  }, []);
  
  // Reset state
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(initialData);
  }, [initialData]);
  
  // Execute the async function immediately or when dependencies change
  useEffect(() => {
    isMounted.current = true;
    
    if (immediate) {
      execute();
    }
    
    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, execute, ...dependencies]);
  
  // Return the state and execution function
  return {
    loading,
    error,
    data,
    execute,
    reset,
  };
}

export default useAsync;