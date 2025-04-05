import React, { useState, useCallback, useEffect } from 'react';

/**
 * Network status component for Docker container communication
 */
export function NetworkStatus({ 
  services = [], 
  interval = 60000,
  onStatusChange = null 
}) {
  const [serviceStatus, setServiceStatus] = useState({});
  
  const checkServices = useCallback(async () => {
    const status = {};
    
    for (const service of services) {
      try {
        const response = await fetch(`/api/health/${service}`);
        status[service] = response.ok ? 'available' : 'unavailable';
      } catch (err) {
        status[service] = 'unavailable';
      }
    }
    
    setServiceStatus(status);
    
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [services, onStatusChange]);
  
  useEffect(() => {
    checkServices();
    const intervalId = setInterval(checkServices, interval);
    return () => clearInterval(intervalId);
  }, [checkServices, interval]);
  
  if (Object.keys(serviceStatus).length === 0) {
    return null;
  }
  
  return (
    <div className="network-status">
      <h4>Container Network Status</h4>
      <ul>
        {Object.entries(serviceStatus).map(([service, status]) => (
          <li key={service} className={`service-status ${status}`}>
            {service}: {status}
          </li>
        ))}
      </ul>
      <button onClick={checkServices}>Refresh</button>
    </div>
  );
}