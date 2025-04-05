import React from 'react';
import PropTypes from 'prop-types';
import { styled } from "@/design-system/adapter";
import { reportError } from './error-service';

/**
 * ErrorBoundary - A component that catches JavaScript errors in its child component tree
 * 
 * This component implements React's error boundary pattern to prevent the entire
 * application from crashing when errors occur in a component subtree.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {Function} [props.fallback] - Custom fallback component to render when an error occurs
 * @param {string} [props.boundary] - Name of the boundary for logging/tracking
 * @param {Function} [props.onError] - Callback when an error occurs
 * @returns {JSX.Element} The ErrorBoundary component
 * 
 * @example
 * <ErrorBoundary boundary="UserProfile">
 *   <UserProfile userId="123" />
 * </ErrorBoundary>
 * 
 * @example
 * <ErrorBoundary 
 *   fallback={({ error }) => <CustomErrorDisplay error={error} />}
 *   onError={(error, errorInfo) => logErrorToService(error, errorInfo)}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 */
import { ENV } from "@/utils/environmentConfig";
class ErrorBoundary extends React.Component {
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
    return {
      hasError: true,
      error
    };
  }
  componentDidCatch(error, errorInfo) {
    // Log the error to the console and report to monitoring service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // Store error info for rendering
    this.setState({
      errorInfo
    });

    // Report to monitoring service
    reportError(error, errorInfo, this.props.boundary || 'unknown');

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
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
    const {
      hasError,
      error,
      errorInfo
    } = this.state;
    const {
      children,
      fallback
    } = this.props;
    if (hasError) {
      // Render custom fallback if provided
      if (fallback) {
        return fallback({
          error,
          errorInfo,
          resetError: this.resetError
        });
      }

      // Default error display
      return <StyledErrorDisplay data-testid="error-boundary-fallback">
          <div className="error-header">
            <h2>Something went wrong</h2>
            <button className="reset-button" onClick={this.resetError} aria-label="Try again">
              Try again
            </button>
          </div>
          <div className="error-details">
            <p className="error-message">{error && error.toString()}</p>
            {ENV.NODE_ENV !== 'production' && errorInfo && <details className="stack-trace">
                <summary>Stack trace</summary>
                <pre>{errorInfo.componentStack}</pre>
              </details>}
          </div>
        </StyledErrorDisplay>;
    }
    return children;
  }
}
ErrorBoundary.propTypes = {
  /** Child components to render */
  children: PropTypes.node.isRequired,
  /** Custom fallback component to render when an error occurs */
  fallback: PropTypes.func,
  /** Name of the boundary for logging/tracking */
  boundary: PropTypes.string,
  /** Callback when an error occurs */
  onError: PropTypes.func
};
ErrorBoundary.defaultProps = {
  fallback: undefined,
  boundary: undefined,
  onError: undefined
};

// Styled component for the default error display
const StyledErrorDisplay = styled.div`
  padding: 20px;
  margin: 16px 0;
  border-radius: 4px;
  background-color: #fff8f8;
  border: 1px solid #ffcccc;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .error-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ffcccc;

    h2 {
      margin: 0;
      font-size: 18px;
      color: #e53935;
    }

    .reset-button {
      background-color: #e53935;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #c62828;
      }
    }
  }

  .error-details {
    .error-message {
      font-family: monospace;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
      overflow-x: auto;
    }

    .stack-trace {
      margin-top: 16px;
      
      summary {
        cursor: pointer;
        padding: 8px 0;
        color: #757575;
        font-weight: 500;
      }
      
      pre {
        margin-top: 8px;
        padding: 12px;
        background-color: #f5f5f5;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 12px;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
    }
  }
`;
export default ErrorBoundary;