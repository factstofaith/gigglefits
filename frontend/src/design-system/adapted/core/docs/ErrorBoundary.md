# ErrorBoundary Component

A resilient error boundary component that catches JavaScript errors and displays fallback UI to prevent the entire application from crashing.

## Features

- Prevents UI crashes from propagating
- Customizable fallback UI
- Error reporting capability
- Automatic recovery on component update

## Usage

```jsx
import { ErrorBoundary } from '../design-system/adapter';

// Basic usage
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// With custom fallback UI
<ErrorBoundary 
  fallback={<div className="error-state">Something went wrong. Please try again.</div>}
>
  <YourComponent />
</ErrorBoundary>

// With error handling callback
<ErrorBoundary 
  onError={(error, errorInfo) => {
    // Log to error reporting service
    reportError(error, errorInfo);
  }}
>
  <YourComponent />
</ErrorBoundary>

// Comprehensive implementation
<ErrorBoundary 
  fallback={
    <div className="error-state">
      <h3>Something went wrong</h3>
      <button onClick={() => window.location.reload()}>Reload page</button>
    </div>
  }
  onError={(error, errorInfo) => {
    // Log error
    reportError(error, errorInfo);
    // Send analytics event
    trackEvent('error_boundary_triggered', { 
      component: 'YourComponent',
      error: error.message
    });
  }}
>
  <YourComponent />
</ErrorBoundary>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | node | Required | The components that should be protected by the error boundary |
| `fallback` | node | Default error UI | UI to render when an error is caught |
| `onError` | function | `null` | Callback function called when an error is caught |

## Error Handling Behavior

1. **Error Catching**: The component catches JavaScript errors during rendering, in lifecycle methods, and in constructors of the component tree below it.

2. **Fallback Rendering**: When an error is caught, the component renders the fallback UI instead of the crashed component tree.

3. **Error Reporting**: If provided, the `onError` callback is invoked with the error and component stack trace information.

4. **Recovery**: The error state is automatically reset when:
   - The `children` prop changes
   - A key prop change triggers a component remount
   - User navigates away and back to the component

## Best Practices

1. **Strategic Placement**: Place error boundaries at key points in your component tree to isolate failures:
   - Around route-level components to prevent navigation failures
   - Around important UI sections (forms, data visualizations, etc.)
   - Around third-party components that may be unstable

2. **Granular Fallbacks**: Use context-specific fallback UIs that make sense for the component being protected:
   - For data visualization components, show a simplified placeholder
   - For forms, preserve user input when possible and show clear error state
   - For critical features, provide recovery options

3. **Informative Error Reporting**: Include detailed information in error reports:
   - Component name and props (excluding sensitive data)
   - User actions leading to the error
   - Application state context

4. **Testing**: Always test error boundaries with components that deliberately throw errors to ensure proper fallback behavior.