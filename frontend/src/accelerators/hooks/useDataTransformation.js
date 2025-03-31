// useDataTransformation.js
// Production-ready hook for data transformation operations with built-in validation,
// performance optimization, error handling, and comprehensive cleanup.

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

/**
 * @typedef {Object} TransformationOptions
 * @property {boolean} validateInput - Whether to validate input data
 * @property {boolean} validateOutput - Whether to validate output data
 * @property {Function} inputValidator - Custom input validator function
 * @property {Function} outputValidator - Custom output validator function
 * @property {boolean} cacheResults - Whether to cache transformation results
 * @property {number} cacheSize - Maximum number of cached results to keep
 * @property {boolean} trackPerformance - Whether to track performance metrics
 * @property {boolean} handleErrors - Whether to handle errors internally
 * @property {Function} onError - Error handler function
 * @property {Function} onSuccess - Success handler function
 * @property {boolean} abortOnUnmount - Whether to abort ongoing operations on unmount
 */

/**
 * @typedef {Object} TransformationResult
 * @property {any} data - Transformed data
 * @property {boolean} isValid - Whether the data is valid
 * @property {Object} errors - Validation errors
 * @property {Object} metrics - Performance metrics
 * @property {Error} error - Error that occurred during transformation
 * @property {boolean} isLoading - Whether a transformation is in progress
 * @property {boolean} isSuccess - Whether the transformation was successful
 * @property {boolean} isError - Whether an error occurred
 */

/**
 * Hook for performing data transformations with production-grade features
 * like validation, error handling, caching, and performance tracking.
 * 
 * @param {Function} transformFn - Function that transforms input data to output data
 * @param {TransformationOptions} options - Configuration options
 * @returns {Object} Transformation interface
 */
export default function useDataTransformation(transformFn, options = {}) {
  // Default options
  const config = {
    validateInput: true,
    validateOutput: true,
    inputValidator: null,
    outputValidator: null,
    cacheResults: true,
    cacheSize: 10,
    trackPerformance: true,
    handleErrors: true,
    onError: null,
    onSuccess: null,
    abortOnUnmount: true,
    ...options
  };
  
  // State for transformation results
  const [result, setResult] = useState({
    data: null,
    isValid: true,
    errors: {},
    metrics: {},
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false
  });
  
  // Refs for internal state that doesn't trigger renders
  const isMounted = useRef(true);
  const transformAbortController = useRef(null);
  const cacheRef = useRef(new Map());
  const performanceRef = useRef({
    count: 0,
    totalTime: 0,
    slowestTime: 0,
    slowestInput: null,
    lastTime: 0
  });
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      
      // Abort any ongoing transformations
      if (config.abortOnUnmount && transformAbortController.current) {
        transformAbortController.current.abort();
      }
    };
  }, [config.abortOnUnmount]);
  
  /**
   * Validates data using provided validator or basic validation
   * @param {any} data - Data to validate
   * @param {Function} validator - Validator function
   * @returns {Object} Validation result
   */
  const validateData = useCallback((data, validator) => {
    if (!data) {
      return { isValid: false, errors: { _data: 'No data provided' } };
    }
    
    try {
      // Use custom validator if provided
      if (typeof validator === 'function') {
        return validator(data);
      }
      
      // Basic validation - check if data is an object or array
      if (typeof data !== 'object' && !Array.isArray(data)) {
        return { 
          isValid: false, 
          errors: { _data: `Expected object or array, got ${typeof data}` } 
        };
      }
      
      return { isValid: true, errors: {} };
    } catch (error) {
      return { 
        isValid: false, 
        errors: { _validation: error.message } 
      };
    }
  }, []);
  
  /**
   * Generates a cache key for input data
   * @param {any} input - Input data
   * @returns {string} Cache key
   */
  const getCacheKey = useCallback((input) => {
    try {
      return JSON.stringify(input);
    } catch (error) {
      // If input can't be stringified, return a unique identifier
      return `non-serializable-${Date.now()}`;
    }
  }, []);
  
  /**
   * Performs a data transformation with all production features
   * @param {any} input - Input data to transform
   * @returns {Promise<TransformationResult>} Transformation result
   */
  const transform = useCallback(async (input) => {
    // Create abort controller for this transformation
    transformAbortController.current = new AbortController();
    const signal = transformAbortController.current.signal;
    
    // Start performance tracking
    const startTime = config.trackPerformance ? performance.now() : 0;
    
    setResult(prev => ({ ...prev, isLoading: true, isSuccess: false, isError: false }));
    
    try {
      // Check cache if enabled
      if (config.cacheResults) {
        const cacheKey = getCacheKey(input);
        if (cacheRef.current.has(cacheKey)) {
          const cachedResult = cacheRef.current.get(cacheKey);
          
          if (isMounted.current) {
            setResult({
              ...cachedResult,
              isLoading: false,
              isSuccess: true,
              isError: false
            });
          }
          
          return cachedResult;
        }
      }
      
      // Validate input if enabled
      if (config.validateInput) {
        const inputValidation = validateData(input, config.inputValidator);
        
        if (!inputValidation.isValid) {
          const errorResult = {
            data: null,
            isValid: false,
            errors: inputValidation.errors,
            metrics: {},
            error: new Error('Input validation failed'),
            isLoading: false,
            isSuccess: false,
            isError: true
          };
          
          if (isMounted.current) {
            setResult(errorResult);
          }
          
          if (typeof config.onError === 'function') {
            config.onError(errorResult.error, input);
          }
          
          return errorResult;
        }
      }
      
      // Check if aborted
      if (signal.aborted) {
        throw new Error('Transformation aborted');
      }
      
      // Perform transformation
      let transformedData;
      
      if (typeof transformFn === 'function') {
        if (transformFn.constructor.name === 'AsyncFunction') {
          // Handle async transformation
          transformedData = await transformFn(input, signal);
        } else {
          // Handle sync transformation
          transformedData = transformFn(input);
        }
      } else {
        throw new Error('Transform function is not a function');
      }
      
      // Check if aborted during async transformation
      if (signal.aborted) {
        throw new Error('Transformation aborted');
      }
      
      // Validate output if enabled
      let outputValidation = { isValid: true, errors: {} };
      if (config.validateOutput) {
        outputValidation = validateData(transformedData, config.outputValidator);
        
        if (!outputValidation.isValid) {
          const errorResult = {
            data: transformedData,
            isValid: false,
            errors: outputValidation.errors,
            metrics: {},
            error: new Error('Output validation failed'),
            isLoading: false,
            isSuccess: false,
            isError: true
          };
          
          if (isMounted.current) {
            setResult(errorResult);
          }
          
          if (typeof config.onError === 'function') {
            config.onError(errorResult.error, input, transformedData);
          }
          
          return errorResult;
        }
      }
      
      // Calculate performance metrics
      let metrics = {};
      if (config.trackPerformance) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Update performance metrics
        performanceRef.current.count++;
        performanceRef.current.totalTime += duration;
        performanceRef.current.lastTime = duration;
        
        if (duration > performanceRef.current.slowestTime) {
          performanceRef.current.slowestTime = duration;
          performanceRef.current.slowestInput = input;
        }
        
        metrics = {
          duration,
          timestamp: new Date(),
          averageTime: performanceRef.current.totalTime / performanceRef.current.count
        };
      }
      
      // Prepare success result
      const successResult = {
        data: transformedData,
        isValid: outputValidation.isValid,
        errors: outputValidation.errors,
        metrics,
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false
      };
      
      // Cache result if enabled
      if (config.cacheResults) {
        const cacheKey = getCacheKey(input);
        cacheRef.current.set(cacheKey, successResult);
        
        // Limit cache size
        if (cacheRef.current.size > config.cacheSize) {
          const firstKey = cacheRef.current.keys().next().value;
          cacheRef.current.delete(firstKey);
        }
      }
      
      // Update state if component is still mounted
      if (isMounted.current) {
        setResult(successResult);
      }
      
      // Call success handler if provided
      if (typeof config.onSuccess === 'function') {
        config.onSuccess(transformedData, input, metrics);
      }
      
      return successResult;
    } catch (error) {
      // Handle transformation errors
      const errorResult = {
        data: null,
        isValid: false,
        errors: { _transformation: error.message },
        metrics: {},
        error,
        isLoading: false,
        isSuccess: false,
        isError: true
      };
      
      // Update state if component is still mounted
      if (isMounted.current) {
        setResult(errorResult);
      }
      
      // Call error handler if enabled
      if (config.handleErrors && typeof config.onError === 'function') {
        config.onError(error, input);
      }
      
      // If not handling errors internally, rethrow
      if (!config.handleErrors) {
        throw error;
      }
      
      return errorResult;
    } finally {
      // Clear abort controller
      transformAbortController.current = null;
    }
  }, [
    transformFn,
    config.validateInput,
    config.validateOutput,
    config.inputValidator,
    config.outputValidator,
    config.cacheResults,
    config.cacheSize,
    config.trackPerformance,
    config.handleErrors,
    config.onError,
    config.onSuccess,
    validateData,
    getCacheKey
  ]);
  
  /**
   * Clears the transformation cache
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);
  
  /**
   * Gets performance metrics
   * @returns {Object} Performance metrics
   */
  const getPerformanceMetrics = useCallback(() => {
    return {
      count: performanceRef.current.count,
      totalTime: performanceRef.current.totalTime,
      averageTime: performanceRef.current.count > 0 
        ? performanceRef.current.totalTime / performanceRef.current.count 
        : 0,
      slowestTime: performanceRef.current.slowestTime,
      lastTime: performanceRef.current.lastTime
    };
  }, []);
  
  /**
   * Aborts any ongoing transformation
   */
  const abort = useCallback(() => {
    if (transformAbortController.current) {
      transformAbortController.current.abort();
      transformAbortController.current = null;
      
      if (isMounted.current) {
        setResult(prev => ({
          ...prev,
          isLoading: false,
          error: new Error('Transformation aborted'),
          isError: true
        }));
      }
    }
  }, []);
  
  // Return public API
  return {
    // Current state
    ...result,
    
    // Actions
    transform,
    abort,
    clearCache,
    
    // Performance monitoring
    getPerformanceMetrics,
    performanceMetrics: getPerformanceMetrics()
  };
}