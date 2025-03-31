/**
 * Main Application Component
 * 
 * Entry point for the application with context providers.
 * 
 * @module App
 */

import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import { DialogProvider } from './contexts/DialogContext';

// Lazy-load routes
const AppRoutes = lazy(() => import('./AppRoutes'));

// Loading fallback
const AppLoadingFallback = () => (
  <div className="app-loading">
    <div className="loading-spinner-large"></div>
    <p>Loading application...</p>
  </div>
);

/**
 * Error boundary component for entire app
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Application error:', error, errorInfo);
    
    // You could also log to an error reporting service here
    // errorReportingService.captureError(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="app-error">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button onClick={() => window.location.reload()}>
            Reload Application
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

/**
 * App Component
 * 
 * @returns {JSX.Element} Application component
 */
const App = () => {
  // Setup performance monitoring in development
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && process.env.PERF_MONITOR === 'true') {
      // This is where we would initialize performance monitoring
      console.log('Performance monitoring enabled');
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ConfigProvider>
          <AuthProvider>
            <NotificationProvider>
              <DialogProvider>
                <BrowserRouter>
                  <Suspense fallback={<AppLoadingFallback />}>
                    <AppRoutes />
                  </Suspense>
                </BrowserRouter>
              </DialogProvider>
            </NotificationProvider>
          </AuthProvider>
        </ConfigProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;