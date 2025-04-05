import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for handling container health checks
 * @param {Object} options - Configuration options
 * @returns {Object} Health check handler
 */
export function useHealthCheckHandler(options = {}) {
  const { 
    endpoint = '/health', 
    interval = 30000,
    serviceName = 'frontend',
    onStatusChange = null
  } = options;
  
  const [healthStatus, setHealthStatus] = useState('unknown');
  const [lastChecked, setLastChecked] = useState(null);
  const [healthData, setHealthData] = useState(null);
  
  // Check container health
  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch(endpoint, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHealthStatus(data.status || 'healthy');
        setHealthData(data);
      } else {
        setHealthStatus('unhealthy');
      }
    } catch (error) {
      setHealthStatus('unhealthy');
      console.error(`Health check failed for ${serviceName}:`, error);
    }
    
    setLastChecked(new Date());
  }, [endpoint, serviceName]);
  
  // Report health issues
  const reportHealthIssue = useCallback((issue) => {
    console.error(`Health issue in ${serviceName} container: ${issue}`);
    setHealthStatus('degraded');
    
    // Optional callback
    if (onStatusChange) {
      onStatusChange('degraded', issue);
    }
    
    return {
      acknowledged: true,
      timestamp: new Date()
    };
  }, [serviceName, onStatusChange]);
  
  // Set up periodic health checks
  useEffect(() => {
    // Initial check
    checkHealth();
    
    // Set up interval for regular checking
    const intervalId = setInterval(checkHealth, interval);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [checkHealth, interval]);
  
  // Notify on status change
  useEffect(() => {
    if (onStatusChange && lastChecked) {
      onStatusChange(healthStatus, healthData);
    }
  }, [healthStatus, healthData, onStatusChange, lastChecked]);
  
  return {
    healthStatus,
    healthData,
    lastChecked,
    checkHealth,
    reportHealthIssue
  };
}