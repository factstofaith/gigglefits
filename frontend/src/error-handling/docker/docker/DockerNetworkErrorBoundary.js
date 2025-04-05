import React, { Component } from 'react';

/**
 * Error boundary component for handling Docker network errors
 */
export class DockerNetworkErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      isNetworkError: false 
    };
  }
  
  static getDerivedStateFromError(error) {
    // Check if this is likely a network error
    const isNetworkError = 
      error.message.includes('Failed to fetch') ||
      error.message.includes('Network Error') ||
      error.message.includes('NetworkError') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('EHOSTUNREACH') ||
      error.message.includes('service unavailable') ||
      error.message.includes('container');
    
    return { 
      hasError: true, 
      error, 
      isNetworkError 
    };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log error
    console.error('Docker network error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Optional: report error to monitoring service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }
  
  retry = () => {
    this.setState({ hasError: false, error: null, isNetworkError: false });
  }
  
  render() {
    const { serviceName = 'Service', children, fallback } = this.props;
    
    if (this.state.hasError) {
      // If custom fallback is provided, use it
      if (fallback) {
        return fallback(this.state.error, this.retry);
      }
      
      // Network-specific error UI
      if (this.state.isNetworkError) {
        return (
          <div className="docker-network-error-boundary">
            <h3>Container Network Error</h3>
            <p>There was a problem connecting to the {serviceName} container.</p>
            <p className="error-message">{this.state.error.message}</p>
            <button onClick={this.retry}>Retry Connection</button>
          </div>
        );
      }
      
      // General error UI
      return (
        <div className="error-boundary">
          <h3>Something went wrong</h3>
          <p>{this.state.error.message}</p>
          <button onClick={this.retry}>Try Again</button>
        </div>
      );
    }
    
    return children;
  }
}