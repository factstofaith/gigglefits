# Error Handling Guide for TAP Integration Platform

This guide explains the error handling framework implemented in the TAP Integration Platform, providing examples of how to use the various components and utilities to effectively handle errors in your application.

## Table of Contents

1. [Introduction](#introduction)
2. [Error Boundary Components](#error-boundary-components)
   - [Basic Usage](#basic-usage-of-errorboundary)
   - [Higher-Order Component](#using-witherrorboundary-hoc)
3. [Error Context](#error-context)
   - [Setting Up the Provider](#setting-up-the-error-provider)
   - [Using the Error Context](#using-the-error-context)
4. [Error Service](#error-service)
   - [Reporting Errors](#reporting-errors)
   - [Logging Errors](#logging-errors)
   - [Setting Metadata](#setting-error-metadata)
5. [Error Hooks](#error-hooks)
   - [Using useErrorHandler](#using-useerrorhandler)
6. [Network Error Handling](#network-error-handling)
   - [Enhanced Fetch](#using-enhanced-fetch)
   - [Axios Integration](#using-with-axios)
7. [Global Error UI](#global-error-ui)
   - [Error Banner](#using-the-error-banner)
8. [Best Practices](#best-practices)
9. [Complete Examples](#complete-examples)

## Introduction

The error handling framework is designed to provide comprehensive error management capabilities with the following features:

- **Error Boundaries**: React components that catch JavaScript errors in their child component trees
- **Global Error State**: Context-based state management for application-wide error tracking
- **Error Reporting**: Centralized error reporting to backend services
- **Network Error Handling**: Specialized handling for API and network requests
- **UI Components**: Ready-to-use error display components

## Error Boundary Components

### Basic Usage of ErrorBoundary

The `ErrorBoundary` component catches JavaScript errors in its child component tree and displays a fallback UI.

```jsx
import { ErrorBoundary } from '../error-handling';

function UserProfile({ userId }) {
  // Component that might throw an error
  return (
    <ErrorBoundary boundary="UserProfile">
      <UserProfileContent userId={userId} />
    </ErrorBoundary>
  );
}
```

#### With Custom Fallback UI

```jsx
import { ErrorBoundary } from '../error-handling';

function UserProfile({ userId }) {
  return (
    <ErrorBoundary 
      boundary="UserProfile"
      fallback={({ error, resetError }) => (
        <div className="error-container">
          <h3>Could not load user profile</h3>
          <p>{error.message}</p>
          <button onClick={resetError}>Retry</button>
        </div>
      )}
    >
      <UserProfileContent userId={userId} />
    </ErrorBoundary>
  );
}
```

### Using withErrorBoundary HOC

The `withErrorBoundary` higher-order component wraps a component with an error boundary.

```jsx
import { withErrorBoundary } from '../error-handling';

function UserProfile({ userId }) {
  // Component implementation
}

// Wrap with error boundary
export default withErrorBoundary(UserProfile, {
  boundary: 'UserProfile',
  fallback: ({ error, resetError }) => (
    <div className="error-container">
      <h3>Could not load user profile</h3>
      <p>{error.message}</p>
      <button onClick={resetError}>Retry</button>
    </div>
  )
});
```

## Error Context

### Setting Up the Error Provider

The `ErrorProvider` component provides global error state management.

```jsx
import { ErrorProvider, ErrorBanner } from '../error-handling';

function App() {
  return (
    <ErrorProvider>
      <ErrorBanner />
      <MainContent />
    </ErrorProvider>
  );
}
```

### Using the Error Context

```jsx
import { useErrorContext } from '../error-handling';

function SettingsPage() {
  const { setGlobalError, clearGlobalError, setMetadata } = useErrorContext();
  
  // Set user metadata for error context
  useEffect(() => {
    if (user) {
      setMetadata({ userId: user.id, userRole: user.role });
    }
  }, [user, setMetadata]);
  
  const handleSaveSettings = async (settings) => {
    try {
      await saveSettings(settings);
    } catch (error) {
      // Set a global error that will appear in the ErrorBanner
      setGlobalError(error);
    }
  };
  
  return (
    <div>
      <h1>Settings</h1>
      <SettingsForm onSave={handleSaveSettings} />
    </div>
  );
}
```

## Error Service

### Reporting Errors

```jsx
import { reportError, ErrorSeverity } from '../error-handling';

function processData(data) {
  try {
    // Process data
    return processedData;
  } catch (error) {
    // Report the error with additional context
    reportError(
      error,
      { data, context: 'Data processing' },
      'DataProcessor',
      ErrorSeverity.ERROR
    );
    
    // Handle the error gracefully
    return null;
  }
}
```

### Logging Errors

```jsx
import { logError, ErrorSeverity } from '../error-handling';

function validateInput(input) {
  if (!input.name) {
    // Log a validation error without reporting to server
    logError(
      'Name is required',
      { input },
      ErrorSeverity.WARNING
    );
    return false;
  }
  return true;
}
```

### Setting Error Metadata

```jsx
import { setErrorMetadata } from '../error-handling';

// Set global error metadata after user logs in
function afterLogin(user) {
  setErrorMetadata({
    userId: user.id,
    username: user.username,
    role: user.role,
    tenant: user.tenant
  });
}
```

### Wrapping Functions with Error Handling

```jsx
import { withErrorHandling } from '../error-handling';

// Original function
function riskyFunction(input) {
  // Implementation that might throw
}

// Wrapped function with automatic error reporting
const safeFunction = withErrorHandling(
  riskyFunction,
  'MyComponent',
  ErrorSeverity.ERROR
);

// Now you can call safeFunction without try/catch
// Errors will be automatically reported
```

## Error Hooks

### Using useErrorHandler

```jsx
import { useErrorHandler } from '../error-handling';

function UserProfile({ userId }) {
  const { error, handleError, clearError, wrapPromise } = useErrorHandler('UserProfile');
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Fetch user data with automatic error handling
    const fetchUser = async () => {
      try {
        const data = await api.getUser(userId);
        setUser(data);
      } catch (err) {
        handleError(err, { userId });
      }
    };
    
    fetchUser();
  }, [userId, handleError]);
  
  // Alternative with wrapPromise
  useEffect(() => {
    wrapPromise(
      api.getUser(userId).then(data => setUser(data))
    );
  }, [userId, wrapPromise]);
  
  // Show error state if there's an error
  if (error) {
    return (
      <div className="error-state">
        <h3>Error loading user</h3>
        <p>{error.message}</p>
        <button onClick={clearError}>Retry</button>
      </div>
    );
  }
  
  if (!user) return <LoadingIndicator />;
  
  return <UserProfileView user={user} />;
}
```

## Network Error Handling

### Using Enhanced Fetch

```jsx
import { enhancedFetch } from '../error-handling';

async function fetchData() {
  try {
    // Enhanced fetch with timeout, retry, and error reporting
    const response = await enhancedFetch('/api/data');
    return await response.json();
  } catch (error) {
    // The error is already reported by enhancedFetch
    // Just handle the UI state
    return null;
  }
}
```

### Using with Axios

```jsx
import axios from 'axios';
import { createAxiosErrorInterceptor } from '../error-handling';

// Create axios instance
const api = axios.create({
  baseURL: '/api'
});

// Add error handling interceptors
createAxiosErrorInterceptor(api);

// Now all axios requests through this instance have error handling
async function fetchData() {
  try {
    const response = await api.get('/data');
    return response.data;
  } catch (error) {
    // Error already reported by interceptor
    return null;
  }
}
```

## Global Error UI

### Using the Error Banner

The `ErrorBanner` component automatically displays any global errors set via the error context.

```jsx
import { ErrorBanner, useErrorContext } from '../error-handling';

function App() {
  return (
    <>
      <ErrorBanner />
      <MainContent />
    </>
  );
}

function SomeComponent() {
  const { setGlobalError } = useErrorContext();
  
  const handleRiskyAction = () => {
    try {
      // Do something that might fail
    } catch (error) {
      // This will display in the ErrorBanner at the top of the app
      setGlobalError(error);
    }
  };
  
  return (
    <button onClick={handleRiskyAction}>Risky Action</button>
  );
}
```

## Best Practices

1. **Use Error Boundaries Strategically**
   - Place error boundaries at key points in your component tree
   - Don't put them too high (entire app fails) or too low (too granular)
   - Good places: page components, complex UI sections, integration points

2. **Meaningful Error Messages**
   - Always provide context in error messages
   - Include suggestions for resolution when possible
   - Use severities appropriately (ERROR for critical issues, WARNING for recoverable ones)

3. **Error Recovery**
   - Always provide a way for users to recover from errors
   - Add retry buttons for network errors
   - Save form state when possible to avoid data loss

4. **Consistent Error UX**
   - Use standardized error components
   - Maintain consistent styling and messaging
   - Provide clear next steps for users

5. **Proper Error Tracking**
   - Include enough context for debugging
   - Don't include sensitive data in error reports
   - Use unique error IDs to correlate frontend and backend errors

## Complete Examples

### Form with Error Handling

```jsx
import { 
  ErrorBoundary, 
  useErrorHandler, 
  enhancedFetch 
} from '../error-handling';

function UserForm({ userId }) {
  const { error, handleError, clearError, wrapPromise } = useErrorHandler('UserForm');
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await enhancedFetch(`/api/users/${userId}`);
        const data = await response.json();
        setUser(data);
      } catch (err) {
        handleError(err, { userId, action: 'fetch' });
      }
    };
    
    loadUser();
  }, [userId, handleError]);
  
  // Save user data
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);
    
    try {
      const formData = new FormData(event.target);
      const userData = Object.fromEntries(formData.entries());
      
      const response = await enhancedFetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const updatedUser = await response.json();
      setUser(updatedUser);
    } catch (err) {
      setSaveError(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Show error state
  if (error) {
    return (
      <div className="error-state">
        <h3>Error loading user</h3>
        <p>{error.message}</p>
        <button onClick={clearError}>Retry</button>
      </div>
    );
  }
  
  if (!user) return <LoadingIndicator />;
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit User</h2>
      
      {saveError && (
        <div className="error-message">
          <p>Error saving changes: {saveError.message}</p>
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input 
          id="name" 
          name="name" 
          defaultValue={user.name} 
          required 
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          defaultValue={user.email} 
          required 
        />
      </div>
      
      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

// Wrap with error boundary for additional safety
export default function UserFormWithErrorBoundary(props) {
  return (
    <ErrorBoundary boundary="UserForm">
      <UserForm {...props} />
    </ErrorBoundary>
  );
}
```

### Data Dashboard with Global Error Handling

```jsx
import { 
  ErrorProvider, 
  ErrorBanner, 
  useErrorContext, 
  enhancedFetch 
} from '../error-handling';

// Main App with Error Provider
function App() {
  return (
    <ErrorProvider>
      <ErrorBanner />
      <Dashboard />
    </ErrorProvider>
  );
}

// Dashboard Component
function Dashboard() {
  const { setGlobalError, clearGlobalError, setStatus } = useErrorContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await enhancedFetch('/api/dashboard');
        
        if (!response.ok) {
          // For critical errors, set application status to degraded
          if (response.status >= 500) {
            setStatus('degraded');
          }
          throw new Error(`Failed to fetch dashboard data: ${response.status}`);
        }
        
        const dashboardData = await response.json();
        setData(dashboardData);
        setStatus('operational');
      } catch (error) {
        // Show in global error banner
        setGlobalError(error);
        // Set null data to show error state
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Clean up global error on unmount
    return () => {
      clearGlobalError();
    };
  }, [setGlobalError, clearGlobalError, setStatus]);
  
  if (loading) {
    return <LoadingIndicator />;
  }
  
  if (!data) {
    return (
      <div className="dashboard-error">
        <h2>Dashboard Unavailable</h2>
        <p>Please try refreshing the page or come back later.</p>
        <button onClick={() => window.location.reload()}>
          Refresh Page
        </button>
      </div>
    );
  }
  
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <DashboardMetrics metrics={data.metrics} />
      <RecentActivity activity={data.activity} />
    </div>
  );
}
```

## Conclusion

This error handling framework provides a comprehensive set of tools to effectively manage errors in the TAP Integration Platform. By using these components and utilities consistently, you can create a robust error handling strategy that improves both the user experience and your ability to diagnose and fix issues.