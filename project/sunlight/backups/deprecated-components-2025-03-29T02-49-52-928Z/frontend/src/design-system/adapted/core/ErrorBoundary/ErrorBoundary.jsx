/**
 * @component ErrorBoundary
 * @description A React error boundary component that catches errors in its children
 * and displays a fallback UI instead of crashing the entire application.
 * 
 * @typedef {import('../../types/core').ErrorBoundaryProps} ErrorBoundaryProps
 * @typedef {import('../../types/core').ErrorBoundaryState} ErrorBoundaryState
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * @extends {React.Component<ErrorBoundaryProps, ErrorBoundaryState>}
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    this.setState({ errorInfo });
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error details to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error caught by ErrorBoundary:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  // When resetKey changes, reset the error state
  componentDidUpdate(prevProps) {
    if (this.state.hasError && this.props.resetKey !== prevProps.resetKey) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }
  }

  render() {
    const { fallback, children } = this.props;
    const { hasError, error, errorInfo } = this.state;

    // If there's an error, render the fallback
    if (hasError) {
      // If a custom fallback component is provided, use it
      if (React.isValidElement(fallback)) {
        return React.cloneElement(fallback, { error, errorInfo });
      }

      // If a function is provided, call it with the error details
      if (typeof fallback === 'function') {
        return fallback(error, errorInfo);
      }

      // Default fallback UI
      return (
        <div className="error-boundary-fallback&quot;>
          <h2>Something went wrong.</h2>
          {process.env.NODE_ENV !== "production' && (
            <details>
              <summary>Error details</summary>
              <p>{error && error.toString()}</p>
              <pre>{errorInfo && errorInfo.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }

    // If there's no error, render the children
    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
  ]),
  onError: PropTypes.func,
  resetKey: PropTypes.any,
};

ErrorBoundary.defaultProps = {
  fallback: null,
  onError: null,
};

export default ErrorBoundary;