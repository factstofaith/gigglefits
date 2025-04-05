import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for handling Docker network errors in containerized applications
 * @param {Object} options - Configuration options
 * @returns {Object} Network error handler
 */
export function useDockerNetworkErrorHandler(options = {}) {
  const { 
    retryInterval = 5000, 
    checkNetworkOnMount = true,
    services = []
  } = options;
  
  const [networkError, setNetworkError] = useState(null);
  const [isNetworkAvailable, setIsNetworkAvailable] = useState(true);
  const [lastRequest, setLastRequest] = useState(null);
  
  // Check network availability
  const checkNetworkAvailability = useCallback(async () => {
    try {
      // Try to fetch a small resource to check network
      const response = await fetch('/health', { 
        method: 'HEAD',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      setIsNetworkAvailable(response.ok);
      return response.ok;
    } catch (error) {
      setIsNetworkAvailable(false);
      return false;
    }
  }, []);
  
  // Handle network errors
  const handleNetworkError = useCallback((error) => {
    setNetworkError(error);
    setLastRequest(new Date());
    
    // Check if this is likely a Docker network error
    const isDockerNetworkError = 
      error.message.includes('Failed to fetch') ||
      error.message.includes('Network Error') ||
      error.message.includes('NetworkError') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('EHOSTUNREACH') ||
      error.message.includes('service unavailable') ||
      error.message.includes('container');
    
    if (isDockerNetworkError) {
      checkNetworkAvailability();
    }
    
    return error;
  }, [checkNetworkAvailability]);
  
  // Retry last request
  const retryNetworkRequest = useCallback(() => {
    setNetworkError(null);
    checkNetworkAvailability();
  }, [checkNetworkAvailability]);
  
  // Set up periodic network checks if network is unavailable
  useEffect(() => {
    if (checkNetworkOnMount) {
      checkNetworkAvailability();
    }
    
    let intervalId = null;
    
    if (!isNetworkAvailable) {
      intervalId = setInterval(() => {
        checkNetworkAvailability();
      }, retryInterval);
    }
    
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [isNetworkAvailable, checkNetworkAvailability, retryInterval, checkNetworkOnMount]);
  
  return {
    networkError,
    isNetworkAvailable,
    handleNetworkError,
    retryNetworkRequest,
    checkNetworkAvailability,
    lastRequest
  };
}