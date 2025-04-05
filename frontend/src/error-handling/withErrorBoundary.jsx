import React from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * Higher-order component that wraps a component with an error boundary
 * 
 * This HOC makes it easy to add error boundaries to any component
 * without modifying the component's implementation.
 * 
 * @param {React.ComponentType} Component - The component to wrap
 * @param {Object} [options={}] - Error boundary options
 * @param {string} [options.boundary] - Name of the boundary for logging/tracking
 * @param {Function} [options.fallback] - Custom fallback component
 * @param {Function} [options.onError] - Callback when an error occurs
 * @returns {React.ComponentType} Wrapped component with error boundary
 * 
 * @example
 * // Wrap a component with default error boundary
 * const SafeUserProfile = withErrorBoundary(UserProfile, { 
 *   boundary: 'UserProfile' 
 * });
 * 
 * @example
 * // Wrap a component with custom fallback
 * const SafeDataGrid = withErrorBoundary(DataGrid, {
 *   boundary: 'DataGrid',
 *   fallback: ({ error, resetError }) => (
 *     <div>
 *       <p>The data grid encountered an error: {error.message}</p>
 *       <button onClick={resetError}>Retry</button>
 *     </div>
 *   )
 * });
 */
function withErrorBoundary(Component, options = {}) {
  const { boundary, fallback, onError } = options;

  // Use meaningful display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';

  // Create wrapped component
  const WrappedComponent = (props) =>
  <ErrorBoundary
    boundary={boundary || displayName}
    fallback={fallback}
    onError={onError}>

      <Component {...props} />
    </ErrorBoundary>;


  // Set display name for better debugging
  WrappedComponent.displayName = `WithErrorBoundary(${displayName})`;

  return WrappedComponent;
}

export default withErrorBoundary;
export { withErrorBoundary };