import React, { useEffect, useState } from 'react';
import { getRuntimeEnv, getConfig, initializeRuntimeEnvironment, IS_DOCKER } from '../utils/runtimeEnv';
import { getEnvironmentVariable, getBooleanEnv, getNumericEnv, 
         getEnvironmentConfig, getDockerConfig, isDevelopment, isDocker } from '../utils/environmentConfig';

/**
 * Example component demonstrating standardized environment variable usage
 * 
 * This component shows the recommended patterns for accessing environment
 * variables in a Docker containerized application with runtime configuration.
 */
const EnvironmentExample = () => {
  const [runtimeConfig, setRuntimeConfig] = useState(null);
  const [environmentConfig, setEnvironmentConfig] = useState(null);
  const [dockerConfig, setDockerConfig] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Initialize runtime configuration
  useEffect(() => {
    // Initialize the runtime environment
    const config = initializeRuntimeEnvironment();
    setRuntimeConfig(config);
    
    // Get environment-specific configuration
    setEnvironmentConfig(getEnvironmentConfig());
    
    // Get Docker-specific configuration if running in Docker
    setDockerConfig(getDockerConfig());
    
    setIsLoaded(true);
  }, []);

  // Get string environment variables
  const apiUrl = getEnvironmentVariable('API_URL', '/api');
  const appVersion = getEnvironmentVariable('VERSION', '1.0.0');

  // Get boolean environment variables
  const isDebugEnabled = getBooleanEnv('DEBUG', false);
  const useMockData = getBooleanEnv('MOCK_API', false);

  // Get numeric environment variables
  const timeoutSeconds = getNumericEnv('TIMEOUT', 30);
  const retryCount = getNumericEnv('RETRY_COUNT', 3);

  if (!isLoaded) {
    return <div className="loading">Loading configuration...</div>;
  }

  return (
    <div className="environment-example">
      <h2>Environment Configuration</h2>
      
      <h3>Docker Environment Detection</h3>
      <div className={`docker-status ${isDocker() ? 'docker-enabled' : 'docker-disabled'}`}>
        <strong>Running in Docker:</strong> {isDocker() ? 'Yes' : 'No'}
      </div>
      
      <h3>Environment Variables</h3>
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Value</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>API URL</td>
            <td>{apiUrl}</td>
            <td>String</td>
          </tr>
          <tr>
            <td>App Version</td>
            <td>{appVersion}</td>
            <td>String</td>
          </tr>
          <tr>
            <td>Debug Enabled</td>
            <td>{isDebugEnabled ? 'Yes' : 'No'}</td>
            <td>Boolean</td>
          </tr>
          <tr>
            <td>Use Mock Data</td>
            <td>{useMockData ? 'Yes' : 'No'}</td>
            <td>Boolean</td>
          </tr>
          <tr>
            <td>Timeout (seconds)</td>
            <td>{timeoutSeconds}</td>
            <td>Number</td>
          </tr>
          <tr>
            <td>Retry Count</td>
            <td>{retryCount}</td>
            <td>Number</td>
          </tr>
          <tr>
            <td>Environment</td>
            <td>{environmentConfig?.environment || 'development'}</td>
            <td>String</td>
          </tr>
        </tbody>
      </table>
      
      <h3>Runtime Configuration</h3>
      <div className="config-display">
        <pre>{JSON.stringify(runtimeConfig, null, 2)}</pre>
      </div>
      
      <h3>Environment Configuration</h3>
      <div className="config-display">
        <pre>{JSON.stringify(environmentConfig, null, 2)}</pre>
      </div>
      
      {dockerConfig && (
        <>
          <h3>Docker Configuration</h3>
          <div className="config-display docker-config">
            <pre>{JSON.stringify(dockerConfig, null, 2)}</pre>
          </div>
        </>
      )}
      
      {isDebugEnabled && (
        <div className="debug-info">
          <h3>Debug Information</h3>
          <p>This section is only visible when DEBUG is true.</p>
          <h4>window.env</h4>
          <pre>{JSON.stringify(window.env, null, 2)}</pre>
          <h4>window.runtimeEnv</h4>
          <pre>{JSON.stringify(window.runtimeEnv, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default EnvironmentExample;