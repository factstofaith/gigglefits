import React, { useEffect, useState } from 'react';
import { ENV } from '@/utils/environmentConfig';

/**
 * Health Check Component for Docker Container Health Checks
 * 
 * This component renders a hidden div with attributes that can be used
 * by Docker health check scripts to verify the frontend is functioning.
 * It updates a timestamp regularly to indicate the app is still running.
 */
function HealthCheck() {
  const [status, setStatus] = useState('healthy');
  const [timestamp, setTimestamp] = useState(Date.now());
  
  // Update timestamp every 30 seconds to show the app is still running
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(Date.now());
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Only render in Docker environment
  if (ENV.REACT_APP_RUNNING_IN_DOCKER !== 'true') {
    return null;
  }
  
  return (
    <div 
      id="docker-health-check" 
      style={{ display: 'none', position: 'absolute', opacity: 0 }}
      data-status={status}
      data-timestamp={timestamp}
      data-version={ENV.REACT_APP_VERSION || '1.0.0'}
      data-environment={ENV.NODE_ENV || 'development'}
    />
  );
}

export default HealthCheck;