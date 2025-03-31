/**
 * ErrorBoundary Component
 * 
 * A class component that catches JavaScript errors in its child component tree.
 * Displays a fallback UI to prevent the entire app from crashing.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    this.setState({ errorInfo });
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log error in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { fallback, children } = this.props;
    
    if (hasError) {
      // You can render any custom fallback UI
      if (fallback) {
        return typeof fallback === 'function' 
          ? fallback(error, errorInfo, this.resetError)
          : fallback;
      }
      
      return (
        <div className="error-boundary-fallback">
          <h2>Something went wrong.</h2>
          <button onClick={this.resetError}>Try again</button>
          {process.env.NODE_ENV !== 'production' && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '16px' }}>
              <summary>Error details</summary>
              {error && error.toString()}
              <br />
              {errorInfo && errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  onError: PropTypes.func,
};

export default ErrorBoundary;
