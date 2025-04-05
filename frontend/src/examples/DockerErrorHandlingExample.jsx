import React, { useState, useEffect } from 'react';
import { ENV } from '@/utils/environmentConfig';
import { 
  DockerErrorHandler, 
  withDockerErrorHandling,
  dockerFetch,
  useContainerErrorPropagation
} from '../error-handling/docker';
import { Box, Button, Typography, Alert, Card, CardContent, Divider } from '../design-system/optimized';

/**
 * Example component to demonstrate Docker error handling capabilities
 */
function DockerErrorHandlingExample() {
  const [status, setStatus] = useState('idle');
  const [errorInfo, setErrorInfo] = useState(null);
  const [isDockerEnv, setIsDockerEnv] = useState(false);

  // Check if we're in a Docker environment
  useEffect(() => {
    setIsDockerEnv(ENV.REACT_APP_RUNNING_IN_DOCKER === 'true');
  }, []);

  /**
   * Generate a component error for testing
   */
  const generateComponentError = () => {
    try {
      setStatus('generating-component-error');
      // Deliberate error: accessing property of undefined
      const obj = undefined;
      const value = obj.property;
      return value;
    } catch (error) {
      setErrorInfo({
        type: 'component',
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  };

  /**
   * Generate a network error for testing
   */
  const generateNetworkError = async () => {
    try {
      setStatus('generating-network-error');
      // Deliberate error: request to non-existent endpoint
      await dockerFetch('/non-existent-endpoint');
    } catch (error) {
      setErrorInfo({
        type: 'network',
        message: error.message,
        isDockerNetworkError: error.isDockerNetworkError || false
      });
      setStatus('network-error');
    }
  };

  /**
   * Generate a propagated error for testing
   */
  const generatePropagatedError = () => {
    try {
      setStatus('generating-propagated-error');
      // Create a custom error to propagate
      const error = new Error('Test propagated error from Docker container');
      error.code = 'DOCKER_TEST_ERROR';
      error.timestamp = new Date().toISOString();
      
      // Try to get container error propagation if available
      if (window.__CONTAINER_ERROR_PROPAGATION__) {
        window.__CONTAINER_ERROR_PROPAGATION__.propagateError(error, {
          severity: 'warning',
          metadata: {
            source: 'DockerErrorHandlingExample',
            containerId: ENV.REACT_APP_CONTAINER_ID || 'unknown',
            test: true
          }
        });
        
        setErrorInfo({
          type: 'propagated',
          message: error.message,
          propagated: true
        });
      } else {
        throw new Error('Container error propagation not available');
      }
    } catch (error) {
      setErrorInfo({
        type: 'propagation-failed',
        message: error.message
      });
      setStatus('propagation-error');
    }
  };

  /**
   * Reset the example state
   */
  const resetExample = () => {
    setStatus('idle');
    setErrorInfo(null);
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Docker Error Handling Test</Typography>
      
      {isDockerEnv ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          Running in Docker environment. Container ID: {ENV.REACT_APP_CONTAINER_ID || 'unknown'}
        </Alert>
      ) : (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Not running in Docker environment. Some features may not work as expected.
        </Alert>
      )}
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Test Docker Error Handling</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            These buttons will generate different types of errors to test the Docker error handling system.
            Errors will be logged to the container stdout/stderr and can be monitored in container logs.
          </Typography>
          
          <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={generateComponentError}
              disabled={status === 'generating-component-error'}
            >
              Test Component Error
            </Button>
            
            <Button 
              variant="contained" 
              color="secondary"
              onClick={generateNetworkError}
              disabled={status === 'generating-network-error'}
            >
              Test Network Error
            </Button>
            
            <Button 
              variant="contained" 
              color="warning"
              onClick={generatePropagatedError}
              disabled={status === 'generating-propagated-error'}
            >
              Test Error Propagation
            </Button>
            
            <Button 
              variant="outlined"
              onClick={resetExample}
              disabled={status === 'idle' && !errorInfo}
            >
              Reset
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      {errorInfo && (
        <Card sx={{ mb: 3, borderColor: 'error.main', borderWidth: 1, borderStyle: 'solid' }}>
          <CardContent>
            <Typography variant="h6" color="error" gutterBottom>
              Error Information
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1">Type: {errorInfo.type}</Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
              Message: {errorInfo.message}
            </Typography>
            {errorInfo.isDockerNetworkError !== undefined && (
              <Typography variant="body2">
                Docker Network Error: {errorInfo.isDockerNetworkError ? 'Yes' : 'No'}
              </Typography>
            )}
            {errorInfo.propagated && (
              <Typography variant="body2">
                Propagated: Yes
              </Typography>
            )}
            <Typography variant="caption" display="block" mt={2} color="text.secondary">
              Check container logs for more detailed error information
            </Typography>
          </CardContent>
        </Card>
      )}
      
      <Typography variant="body2" color="text.secondary">
        Container ID: {ENV.REACT_APP_CONTAINER_ID || 'unknown'}<br />
        Docker Environment: {ENV.REACT_APP_DOCKER_ENVIRONMENT || 'unknown'}<br />
        Running in Docker: {isDockerEnv ? 'Yes' : 'No'}
      </Typography>
    </Box>
  );
}

// Wrap the component with Docker error handling to catch errors
export default withDockerErrorHandling(DockerErrorHandlingExample, {
  boundary: 'DockerErrorHandlingExample',
  severity: 'ERROR',
  logToStdout: true
});