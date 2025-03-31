/**
 * ErrorBoundary Component
 * 
 * A React error boundary component that catches errors in its child component tree
 * and displays a fallback UI instead of crashing the entire application.
 * 
 * Key features:
 * - Uses React 18 compatible lifecycle methods
 * - Provides detailed error information in development mode
 * - Supports custom fallback components
 * - Includes error reporting capabilities
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Default fallback component shown when an error occurs
 */
export const DefaultFallback = ({ error, errorInfo, componentName }) => (
  <div 
    style={{ 
      padding: '12px',
      margin: '10px 0',
      border: '1px solid #f56c6c',
      borderRadius: '4px',
      backgroundColor: '#fef0f0',
      color: '#5f2120'
    }}
  >
    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
      {componentName ? `Error in ${componentName}` : 'Component Error'}
    </h3>
    <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
      {process.env.NODE_ENV === 'development' 
        ? error?.message || 'An error occurred while rendering this component'
        : 'An error occurred while rendering this component'}
    </p>
    {process.env.NODE_ENV === 'development' && errorInfo && (
      <details style={{ whiteSpace: 'pre-wrap', fontSize: '12px', marginTop: '8px' }}>
        <summary style={{ cursor: 'pointer', marginBottom: '5px' }}>Error Details</summary>
        <div style={{ 
          padding: '8px', 
          backgroundColor: '#2d2d2d', 
          color: '#f8f8f8', 
          borderRadius: '4px',
          overflowX: 'auto',
          fontFamily: 'monospace'
        }}>
          {error?.stack || 'No stack trace available'}
          <hr style={{ borderColor: '#666', margin: '8px 0' }} />
          {errorInfo.componentStack}
        </div>
      </details>
    )}
  </div>
);

DefaultFallback.propTypes = {
  error: PropTypes.object,
  errorInfo: PropTypes.object,
  componentName: PropTypes.string
};

/**
 * ErrorBoundary component that catches JavaScript errors in its child component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * Update state when an error occurs
   */
  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      error 
    };
  }

  /**
   * Capture error information for logging
   */
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Report the error
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  render() {
    // If there's an error, show the fallback
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultFallback;
      return (
        <FallbackComponent 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          componentName={this.props.componentName}
          {...this.props.fallbackProps}
        />
      );
    }

    // Otherwise, render children normally
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.elementType,
  fallbackProps: PropTypes.object,
  componentName: PropTypes.string,
  onError: PropTypes.func
};

export default ErrorBoundary;