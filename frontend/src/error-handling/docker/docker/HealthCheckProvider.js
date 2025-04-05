import React, { createContext, useContext } from 'react';
import { useHealthCheckHandler } from './useHealthCheckHandler';

// Create context
const HealthCheckContext = createContext({
  healthStatus: 'unknown',
  healthData: null,
  lastChecked: null,
  checkHealth: () => {},
  reportHealthIssue: () => {}
});

/**
 * Provider component for health check functionality
 */
export function HealthCheckProvider({ 
  children, 
  endpoint = '/health',
  interval = 30000,
  serviceName = 'frontend',
  onStatusChange = null
}) {
  const healthCheck = useHealthCheckHandler({
    endpoint,
    interval,
    serviceName,
    onStatusChange
  });
  
  return (
    <HealthCheckContext.Provider value={healthCheck}>
      {healthCheck.healthStatus === 'unhealthy' ? (
        <div className="health-check-error">
          <h3>Container Health Issue</h3>
          <p>The {serviceName} container is reporting health issues.</p>
          <button onClick={healthCheck.checkHealth}>Check Again</button>
        </div>
      ) : (
        children
      )}
    </HealthCheckContext.Provider>
  );
}

// Export context usage hook
export function useHealthCheckContext() {
  return useContext(HealthCheckContext);
}