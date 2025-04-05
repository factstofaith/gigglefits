import { ENV } from '@/utils/environmentConfig';
/**
 * Lazy Component Loading with Performance Monitoring
 * 
 * Utilities for lazy-loading components with built-in performance monitoring.
 * Part of the zero technical debt performance implementation.
 * 
 * @module utils/performance/lazyLoadWithMonitoring
 */

import React, { lazy, Suspense } from 'react';
import { timeAsyncFunction } from './performanceMonitor';

/**
 * Enhanced lazy loading with performance monitoring
 * 
 * @param {Function} importFunction - Dynamic import function
 * @param {Object} [options] - Configuration options
 * @param {string} [options.name] - Name for the lazy component (for monitoring)
 * @param {boolean} [options.trackPerformance=true] - Whether to track loading performance
 * @param {React.ReactNode} [options.fallback] - Fallback component during loading
 * @param {number} [options.timeoutMs=10000] - Timeout in milliseconds
 * @returns {React.LazyExoticComponent} Lazy loaded component
 */
export const lazyWithMonitoring = (importFunction, {
  name = 'LazyComponent',
  trackPerformance = true,
  fallback = null,
  timeoutMs = 10000
} = {}) => {
  // Create lazy component with performance tracking
  const LazyComponent = lazy(() => {
    if (trackPerformance) {
      // Wrap import with performance tracking
      const loadPromise = timeAsyncFunction(
        () => importFunction(), 
        `LazyLoad:${name}`
      );
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Lazy loading of ${name} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      });
      
      // Race between successful load and timeout
      return Promise.race([loadPromise, timeoutPromise])
        .catch(error => {
          console.error(`Error loading ${name}:`, error);
          // Return a minimal fallback component
          return {
            default: (props) => (
              <div className="lazy-load-error">
                Failed to load component. Try refreshing the page.
                {ENV.NODE_ENV === 'development' && (
                  <pre>{error.message}</pre>
                )}
              </div>
            )
          };
        });
    }
    
    return importFunction();
  });
  
  return LazyComponent;
};

/**
 * Wrapper component for lazy loaded components with suspense handling
 * 
 * @param {Object} props - Component props
 * @param {React.LazyExoticComponent} props.component - Lazy loaded component
 * @param {React.ReactNode} [props.fallback] - Fallback component during loading
 * @param {boolean} [props.errorBoundary=true] - Whether to catch render errors
 * @param {string} [props.className] - Additional class name
 * @param {Object} [props.style] - Additional styles
 * @param {Object} [props.componentProps] - Props to pass to the lazy component
 * @returns {JSX.Element} Wrapped lazy component
 */
export const LazyComponentLoader = ({
  component: Component,
  fallback = null,
  errorBoundary = true,
  className = '',
  style = {},
  componentProps = {},
}) => {
  // Track component load status for analytics
  const [loadStatus, setLoadStatus] = React.useState('loading');
  
  // Simple error boundary if requested
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  // Handle suspense onLoad
  React.useEffect(() => {
    // Set a timeout to mark slow loading components
    const slowLoadTimeout = setTimeout(() => {
      if (loadStatus === 'loading') {
        console.warn(`Lazy component loading is taking longer than expected`);
      }
    }, 2000);
    
    return () => clearTimeout(slowLoadTimeout);
  }, [loadStatus]);
  
  if (hasError && errorBoundary) {
    return (
      <div className={`lazy-component-error ${className}`} style={style}>
        <h3>Something went wrong</h3>
        {ENV.NODE_ENV === 'development' && error && (
          <pre>{error.message}</pre>
        )}
      </div>
    );
  }
  
  const handleOnLoad = () => {
    setLoadStatus('loaded');
    
    // Capture timing for First Meaningful Paint if available
    if (window.performance && window.performance.mark) {
      window.performance.mark(`LazyComponentLoaded`);
    }
  };
  
  const defaultFallback = (
    <div className="lazy-component-loading" style={{ minHeight: '100px' }}>
      Loading...
    </div>
  );
  
  return (
    <div className={`lazy-component-wrapper ${className}`} style={style}>
      {errorBoundary ? (
        <React.ErrorBoundary
          fallback={({ error }) => {
            setHasError(true);
            setError(error);
            return null;
          }}
        >
          <Suspense fallback={fallback || defaultFallback}>
            <Component 
              {...componentProps} 
              onLoad={handleOnLoad}
            />
          </Suspense>
        </React.ErrorBoundary>
      ) : (
        <Suspense fallback={fallback || defaultFallback}>
          <Component 
            {...componentProps}
            onLoad={handleOnLoad}
          />
        </Suspense>
      )}
    </div>
  );
};

/**
 * Create a lazy loaded route for React Router
 * 
 * @param {Function} importFunction - Dynamic import function
 * @param {Object} [options] - Configuration options
 * @param {string} [options.name] - Name for the lazy component
 * @param {React.ReactNode} [options.fallback] - Custom loading component
 * @param {boolean} [options.errorBoundary=true] - Whether to use error boundary
 * @returns {Object} Route element with lazy loaded component
 */
export const lazyRoute = (importFunction, {
  name,
  fallback,
  errorBoundary = true
} = {}) => {
  const LazyComponent = lazyWithMonitoring(importFunction, { name });
  
  // Return a route element with the lazy component
  return {
    element: (
      <LazyComponentLoader
        component={LazyComponent}
        fallback={fallback}
        errorBoundary={errorBoundary}
      />
    )
  };
};