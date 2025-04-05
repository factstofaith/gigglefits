import React, { useState, useCallback, useEffect } from 'react';

/**
 * Health check component for Docker containers
 */
export function HealthCheck({ 
  serviceName = 'frontend', 
  endpoint = '/health',
  interval = 30000,
  showDetails = true
}) {
  const [status, setStatus] = useState('checking');
  const [lastChecked, setLastChecked] = useState(null);
  
  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setStatus(data.status || 'healthy');
      } else {
        setStatus('unhealthy');
      }
      setLastChecked(new Date());
    } catch (err) {
      setStatus('unhealthy');
      setLastChecked(new Date());
      console.error('Health check failed:', err);
    }
  }, [endpoint]);
  
  useEffect(() => {
    // Initial check
    checkHealth();
    
    // Set up interval for regular checking
    const intervalId = setInterval(checkHealth, interval);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [checkHealth, interval]);
  
  return (
    <div className="health-check-status">
      <div className={`status-indicator ${status}`}></div>
      {showDetails && (
        <div className="status-details">
          <span>{serviceName}: {status}</span>
          {lastChecked && <span>Last checked: {lastChecked.toLocaleTimeString()}</span>}
        </div>
      )}
    </div>
  );
}