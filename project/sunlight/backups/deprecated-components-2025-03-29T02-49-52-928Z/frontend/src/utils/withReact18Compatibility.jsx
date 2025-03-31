/**
 * withReact18Compatibility HOC
 * 
 * Higher-Order Component (HOC) that wraps potentially problematic components
 * with error boundaries to ensure compatibility with React 18.
 * 
 * Key features:
 * - Isolates components with React 18 compatibility issues
 * - Provides error boundaries for graceful degradation
 * - Supports custom fallback components
 * - Preserves component props and refs
 * - Maintains proper display names for debugging
 */

import React from 'react';
import { ErrorBoundary } from '../design-system/adapted/index';

/**
 * HOC that wraps a component with React 18 compatibility features
 *
 * @param {React.ComponentType} Component - The component to wrap
 * @param {Object} options - Configuration options
 * @param {React.ElementType} options.fallback - Custom fallback component
 * @param {Object} options.fallbackProps - Props to pass to the fallback component
 * @param {Function} options.onError - Function called when an error occurs
 * @param {boolean} options.enableLogging - Enable additional console logging
 * @returns {React.ForwardRefExoticComponent} - The wrapped component with error boundary
 */
export function withReact18Compatibility(
  Component,
  {
    fallback = null,
    fallbackProps = {},
    onError = null,
    enableLogging = false
  } = {}
) {
  // Get a display name for the wrapped component
  const componentName = Component.displayName || Component.name || 'Component';
  const wrappedComponentName = `WithReact18Compatibility(${componentName})`;
  
  // Create the wrapper component with forwardRef to preserve refs
  const WrappedComponent = React.forwardRef((props, ref) => {
    // Log component rendering if logging is enabled
    if (enableLogging && process.env.NODE_ENV === 'development') {
    }
    
    // Wrap the component with an error boundary
    return (
      <ErrorBoundary
        fallback={fallback}
       
       
        onError={onError}
      >
        <Component {...props} ref={ref} />
      </ErrorBoundary>
    );
  });
  
  // Set proper display name for debugging
  WrappedComponent.displayName = wrappedComponentName;
  
  return WrappedComponent;
}

export default withReact18Compatibility;