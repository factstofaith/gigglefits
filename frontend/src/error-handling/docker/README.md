# Docker Error Handling System

This module provides Docker-specific error handling capabilities for the TAP Integration Platform. It ensures that errors occurring within the containerized frontend application are properly logged to container stdout/stderr for monitoring and diagnostic purposes.

## Features

- Docker-aware error boundaries that log to container stdout/stderr
- Container health monitoring and reporting
- Environment variable configuration for Docker environments
- Integration with the NGINX error handling system
- Docker-specific error pages and error reporting
- Automatic error metadata collection for containerized environments
- Enhanced Docker error handling with automatic recovery strategies
- Specialized error types for Docker-specific issues
- Health check services with rich diagnostics

## Components

### Docker Error Handler Enhancement (`docker-error-handler-enhancement.js`)

The enhanced Docker error handling module with improved error detection, reporting, and recovery:

```javascript
import { 
  configureDockerErrorHandler,
  createDockerEnhancedFetch,
  createDockerHealthCheck,
  DockerErrorTypes
} from './docker-error-handler-enhancement';

// Configure Docker error handling
configureDockerErrorHandler({
  healthCheck: {
    interval: 30000,
    endpoints: {
      backend: '/api/health',
      database: '/api/health/db'
    }
  }
});

// Use enhanced fetch with Docker error handling
const dockerFetch = createDockerEnhancedFetch();
const response = await dockerFetch('/api/data');
```

- `configureDockerErrorHandler(config)`: Configure Docker error handling behavior
- `createDockerEnhancedFetch(fetchFn)`: Wrap fetch calls with Docker-aware error handling
- `reportDockerError(error, additionalInfo, boundary, severity)`: Report Docker-specific errors
- `createDockerHealthCheck()`: Create health check function for Docker services
- `createRecoveryStrategy(error)`: Generate recovery strategies for Docker errors
- `withDockerErrorHandling(Component, options)`: HOC for Docker error handling in components
- `DockerErrorTypes`: Constants for Docker-specific error types
- `DockerErrorSeverity`: Enhanced severity levels for Docker errors

### Docker Error Service (`docker-error-service.js`)

The core service that extends the base error service with Docker-specific functionality:

```javascript
import dockerErrorService, { 
  initDockerErrorService, 
  reportDockerError,
  createDockerComponentErrorHandler,
  withDockerErrorHandling
} from './docker-error-service';
```

- `initDockerErrorService(config)`: Initialize the Docker error service with optional custom configuration
- `reportDockerError(error, errorInfo, boundary, severity)`: Report an error with Docker-specific context
- `createDockerComponentErrorHandler(componentName)`: Create an error handler function for Docker components
- `withDockerErrorHandling(Component, options)`: HOC to wrap a component with Docker error handling
- `logContainerError(errorDetails)`: Log an error from the error page to container logs

### Docker Error Handler (`DockerErrorHandler.jsx`)

A React component that provides Docker-specific error boundaries:

```jsx
import { DockerErrorHandler } from './DockerErrorHandler';

<DockerErrorHandler>
  <YourComponent />
</DockerErrorHandler>
```

### Docker Network Error Handler (`dockerNetworkErrorHandler.js`)

Handles network errors in a Docker-aware manner:

```javascript
import { handleDockerNetworkError } from './dockerNetworkErrorHandler';

try {
  await fetch('/api/data');
} catch (error) {
  handleDockerNetworkError(error, { endpoint: '/api/data' });
}
```

## Usage Examples

### Enhanced Docker Error Handling

The enhanced Docker error handling module provides improved error detection, reporting, and recovery:

```jsx
import React, { useEffect } from 'react';
import { 
  configureDockerErrorHandler, 
  createDockerEnhancedFetch,
  createDockerHealthCheck,
  DockerErrorTypes 
} from './error-handling/docker/docker-error-handler-enhancement';

function DockerAwareComponent() {
  const [healthStatus, setHealthStatus] = useState({ status: 'checking' });
  
  useEffect(() => {
    // Configure Docker error handling
    configureDockerErrorHandler({
      healthCheck: {
        interval: 15000,
        endpoints: {
          backend: '/api/health',
          database: '/api/health/db'
        }
      }
    });
    
    // Create health check function
    const checkHealth = createDockerHealthCheck();
    
    // Perform initial health check
    checkHealth().then(result => {
      setHealthStatus(result);
    });
    
    // Set up health check interval
    const interval = setInterval(async () => {
      const result = await checkHealth();
      setHealthStatus(result);
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Create enhanced fetch
  const fetchWithDockerErrorHandling = createDockerEnhancedFetch();
  
  async function fetchData() {
    try {
      const response = await fetchWithDockerErrorHandling('/api/data');
      return await response.json();
    } catch (error) {
      // Error will be automatically enhanced with Docker context
      console.error('Docker error:', error);
      return null;
    }
  }
  
  return (
    <div>
      <h2>Docker Health: {healthStatus.status}</h2>
      <button onClick={fetchData}>Fetch Data</button>
    </div>
  );
}

// For a full implementation example, see:
// src/examples/DockerErrorHandlingEnhancedExample.jsx
```

### Basic Integration

Wrap your app with the Docker error handler in a Docker environment:

```jsx
import { DockerErrorHandler } from './error-handling/docker';

function App() {
  if (process.env.REACT_APP_RUNNING_IN_DOCKER === 'true') {
    return (
      <DockerErrorHandler>
        <MainApp />
      </DockerErrorHandler>
    );
  }
  
  return <MainApp />;
}
```

### Docker-aware Component

Create a Docker-aware component using the HOC pattern:

```jsx
import { withDockerErrorHandling } from './error-handling/docker';

function MyComponent() {
  // Component implementation
}

export default withDockerErrorHandling(MyComponent, {
  boundary: 'MyComponentBoundary',
  severity: 'ERROR',
  logToStdout: true
});
```

### Environment Variables

The Docker error handling system uses the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_RUNNING_IN_DOCKER` | Flag indicating if running in Docker | `false` |
| `REACT_APP_CONTAINER_ID` | Container ID for logging | `unknown` |
| `REACT_APP_CONTAINER_VERSION` | Container version for logging | `unknown` |
| `REACT_APP_DOCKER_ENVIRONMENT` | Docker environment (dev/prod) | `production` |
| `REACT_APP_ERROR_REPORTING_URL` | Endpoint for error reporting | `/api/errors` |
| `REACT_APP_ERROR_LOGGING_ENABLED` | Enable error logging | `true` |
| `REACT_APP_ERROR_LOG_LEVEL` | Minimum log level to report | `warn` |
| `REACT_APP_DOCKER_ERROR_HANDLING` | Enable Docker error handling | `enabled` |
| `REACT_APP_MAX_ERRORS_PER_SESSION` | Maximum errors to log per session | `100` |

## Container Logs

Errors are logged to container stdout/stderr in the following format:

```
ERROR: 2025-04-03T12:34:56.789Z - [DOCKER_COMPONENT_ERROR] ComponentName: Error message
```

Health checks are logged in the following format:

```
[DOCKER_HEALTH] {"status":"healthy","timestamp":"2025-04-03T12:34:56.789Z","memory":{"usedJSHeapSize":10000000,"totalJSHeapSize":20000000,"jsHeapSizeLimit":30000000},"containerId":"tap-frontend-dev","containerVersion":"1.0.0"}
```

## NGINX Integration

The Docker error handling system integrates with NGINX to ensure proper error logging and reporting. The NGINX configuration redirects error logs to stderr and provides custom error pages that integrate with the Docker error handling system.

## Testing

Use the verification script to test the Docker error handling system:

```bash
node scripts/verify-docker-error-handling.js
```

## Known Issues

Currently, there are build issues with webpack configuration:
1. Undefined loader errors in webpack configuration
2. HTML file generation issues in the build process
3. Environment variable injection needs verification

These issues need to be fixed before the system is fully functional.

## Next Steps

1. Implement enhanced Docker error handling
   - Replace existing Docker fetch with enhanced fetch using `createDockerEnhancedFetch`
   - Add health checks using `createDockerHealthCheck`
   - Configure error recovery strategies with `configureDockerErrorHandler`
   - Update components to use the new error types and severities

2. Fix webpack configuration issues
   - Update loader validation in webpack.common.js
   - Ensure HTML webpack plugin is configured correctly
   - Fix environment variable injection

3. Run Docker build verification in container
   - Run the `verify-docker-build.sh` script 
   - Examine container logs for error entries
   - Verify error propagation between containers

4. Implement health monitoring dashboard
   - Create Docker service health dashboard using the health check API
   - Add real-time monitoring of container resources
   - Implement proactive error detection and resolution

5. Prepare for production deployment
   - Optimize Docker images
   - Configure Azure Container Registry
   - Set up CI/CD pipeline
   - Configure Docker-specific error reporting in production