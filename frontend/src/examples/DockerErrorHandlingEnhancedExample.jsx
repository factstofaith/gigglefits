import React, { useState, useEffect } from 'react';
import { 
  configureDockerErrorHandler,
  createDockerEnhancedFetch,
  createDockerHealthCheck,
  DockerErrorTypes,
  DockerErrorSeverity 
} from '../error-handling/docker/docker-error-handler-enhancement';

/**
 * Example component demonstrating enhanced Docker error handling
 */
const DockerErrorHandlingEnhancedExample = () => {
  const [healthStatus, setHealthStatus] = useState({ status: 'checking' });
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);
  
  // Configure Docker error handler
  useEffect(() => {
    configureDockerErrorHandler({
      healthCheck: {
        interval: 15000, // Check every 15 seconds
        endpoints: {
          backend: '/api/health',
          database: '/api/health/db',
          storage: '/api/health/storage'
        }
      },
      recovery: {
        automatic: true,
        maxAttempts: 3
      }
    });
    
    // Create healthcheck function
    const checkHealth = createDockerHealthCheck();
    
    // Run health check immediately
    performHealthCheck(checkHealth);
    
    // Set up interval for health checks
    const healthCheckInterval = setInterval(() => {
      performHealthCheck(checkHealth);
    }, 15000);
    
    // Cleanup interval on unmount
    return () => {
      clearInterval(healthCheckInterval);
    };
  }, []);
  
  // Perform health check
  const performHealthCheck = async (checkHealth) => {
    try {
      const healthResult = await checkHealth();
      setHealthStatus(healthResult);
      
      // Update services list
      const serviceList = Object.entries(healthResult.services || {}).map(([name, info]) => ({
        name,
        status: info.status,
        message: info.message || null,
        details: info.details || null
      }));
      
      setServices(serviceList);
      
      // Clear error if health check was successful
      if (healthResult.status === 'healthy') {
        setError(null);
      }
    } catch (err) {
      setError({
        message: err.message,
        type: err.dockerType || 'unknown',
        recovery: err.recoverySuggestion || 'Try refreshing the page'
      });
    }
  };
  
  // Create enhanced fetch function
  const dockerFetch = createDockerEnhancedFetch();
  
  // Fetch data with Docker error handling
  const fetchData = async () => {
    try {
      const response = await dockerFetch('/api/data');
      const data = await response.json();
      return data;
    } catch (err) {
      // Error will be enhanced with Docker-specific information
      console.error('Docker enhanced error:', err);
      setError({
        message: err.message,
        type: err.dockerType || 'unknown',
        recovery: err.recoverySuggestion || 'Try again later'
      });
      return null;
    }
  };
  
  // Simulate a Docker network error (for demonstration)
  const simulateDockerNetworkError = () => {
    const error = new Error('Container network communication failed');
    error.dockerType = DockerErrorTypes.NETWORK;
    error.recoverySuggestion = 'Check Docker network settings and container connectivity';
    
    setError({
      message: error.message,
      type: error.dockerType,
      recovery: error.recoverySuggestion
    });
  };
  
  // Render health status
  const renderHealthStatus = () => {
    const { status } = healthStatus;
    
    // Status badge styles
    const getBadgeClass = () => {
      switch (status) {
        case 'healthy': return 'bg-green-500';
        case 'unhealthy': return 'bg-red-500';
        case 'checking': return 'bg-yellow-500';
        default: return 'bg-gray-500';
      }
    };
    
    return (
      <div className="flex items-center mb-4">
        <span className="mr-2">Docker Environment:</span>
        <span className={`px-2 py-1 rounded text-white text-sm ${getBadgeClass()}`}>
          {status === 'checking' ? 'Checking...' : status}
        </span>
      </div>
    );
  };
  
  // Render service list
  const renderServices = () => {
    if (services.length === 0) {
      return <p>No services detected</p>;
    }
    
    return (
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Services</h3>
        <div className="border rounded divide-y">
          {services.map(service => (
            <div key={service.name} className="p-3 flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                service.status === 'healthy' ? 'bg-green-500' : 
                service.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <div>
                <div className="font-medium">{service.name}</div>
                {service.message && <div className="text-sm text-gray-600">{service.message}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render error message
  const renderError = () => {
    if (!error) return null;
    
    return (
      <div className="mt-4 p-4 border border-red-300 bg-red-50 rounded">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Docker Error: {error.type}</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error.message}</p>
              {error.recovery && (
                <p className="mt-1 font-medium">Suggested action: {error.recovery}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Docker Error Handling Example</h2>
      
      {renderHealthStatus()}
      {renderError()}
      {renderServices()}
      
      <div className="mt-6 flex space-x-4">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={fetchData}
        >
          Fetch Data (with Docker Error Handling)
        </button>
        
        <button 
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={simulateDockerNetworkError}
        >
          Simulate Docker Network Error
        </button>
      </div>
    </div>
  );
};

export default DockerErrorHandlingEnhancedExample;