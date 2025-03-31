/**
 * ErrorBoundary Component
 * 
 * Error boundary for capturing and handling component errors.
 * Integrates with error tracking system for reporting and recovery.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { errorTracking } from '../../utils/monitoring/errorTracking';

/**
 * ErrorBoundary Component
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      recoveryAttempted: false
    };
    
    // Create error tracker
    this.errorTracker = errorTracking({
      enableAutoRecovery: props.enableRecovery,
      verbose: props.verbose
    });
    
    // Register recovery strategies
    if (props.recoveryStrategies) {
      Object.entries(props.recoveryStrategies).forEach(([category, strategyFn]) => {
        this.errorTracker.registerRecoveryStrategy(category, strategyFn);
      });
    }
  }
  
  static getDerivedStateFromError(error) {
    // Update state to trigger fallback UI
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log error to error tracking system
    const context = {
      componentStack: errorInfo.componentStack,
      props: this.props.logProps ? this.props.children.props : undefined,
      boundary: this.props.name || 'unnamed',
      ...this.props.errorContext
    };
    
    // Track error
    const errorId = this.errorTracker.trackError(
      error,
      this.props.errorCategory || 'rendering',
      context
    );
    
    // Update state with error details
    this.setState({
      errorInfo,
      errorId
    });
    
    // Call onError callback if provided
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, errorInfo, errorId);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production' || this.props.verbose) {
      console.error('Error caught by ErrorBoundary:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }
  
  /**
   * Attempt to recover from error
   */
  handleRecovery = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      recoveryAttempted: true
    });
    
    // Call onRecover callback if provided
    if (typeof this.props.onRecover === 'function') {
      this.props.onRecover();
    }
  };
  
  /**
   * Reset error state and retry rendering children
   */
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Call onRetry callback if provided
    if (typeof this.props.onRetry === 'function') {
      this.props.onRetry();
    }
  };
  
  render() {
    const { fallback, children } = this.props;
    const { hasError, error, errorInfo, errorId } = this.state;
    
    // If error occurred, show fallback UI
    if (hasError) {
      // Handle custom fallback render prop
      if (typeof fallback === 'function') {
        return fallback({
          error,
          errorInfo,
          errorId,
          retry: this.handleRetry,
          recover: this.handleRecovery
        });
      }
      
      // Handle fallback component
      if (React.isValidElement(fallback)) {
        return React.cloneElement(fallback, {
          error,
          errorInfo,
          errorId,
          retry: this.handleRetry,
          recover: this.handleRecovery
        });
      }
      
      // Default fallback UI
      return (
        <div className="error-boundary-fallback" data-testid="error-boundary-fallback">
          <h2>Something went wrong</h2>
          {process.env.NODE_ENV !== 'production' && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              <summary>Error details</summary>
              <p>{error?.toString()}</p>
              <p>Component stack:</p>
              <pre>{errorInfo?.componentStack}</pre>
            </details>
          )}
          <button 
            type="button" 
            onClick={this.handleRetry}
            className="error-boundary-retry"
            data-testid="error-boundary-retry"
          >
            Try Again
          </button>
        </div>
      );
    }
    
    // No error, render children
    return children;
  }
}

ErrorBoundary.propTypes = {
  /** Fallback UI component or render function */
  fallback: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func
  ]),
  /** Enable automatic recovery attempts */
  enableRecovery: PropTypes.bool,
  /** Custom error category for tracking */
  errorCategory: PropTypes.string,
  /** Additional error context */
  errorContext: PropTypes.object,
  /** Whether to log component props in error context */
  logProps: PropTypes.bool,
  /** Error boundary name for identification */
  name: PropTypes.string,
  /** Enable verbose logging */
  verbose: PropTypes.bool,
  /** Custom recovery strategies by category */
  recoveryStrategies: PropTypes.object,
  /** Callback when error occurs */
  onError: PropTypes.func,
  /** Callback when recovery is attempted */
  onRecover: PropTypes.func,
  /** Callback when retry is attempted */
  onRetry: PropTypes.func,
  /** Child elements */
  children: PropTypes.node.isRequired
};

ErrorBoundary.defaultProps = {
  enableRecovery: true,
  logProps: false,
  verbose: false,
  errorContext: {}
};

export default ErrorBoundary;