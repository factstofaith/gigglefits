/**
 * Code Splitting Utilities
 * 
 * Utilities to implement and manage code splitting.
 * 
 * @module utils/codeSplitting
 */

import React, { lazy, Suspense, useState, useEffect } from 'react';

/**
 * Creates a lazy loaded component with custom loading and error states
 * 
 * @param {Function} importFunction - Dynamic import function
 * @param {Object} [options] - Options
 * @param {React.ComponentType} [options.Fallback] - Fallback component to show while loading
 * @param {React.ComponentType} [options.ErrorComponent] - Component to show on error
 * @param {number} [options.timeout] - Timeout in milliseconds
 * @returns {React.ComponentType} Lazy-loaded component
 */
export const lazyLoad = (importFunction, options = {}) => {
  const {
    Fallback = null,
    ErrorComponent = null,
    timeout,
  } = options;
  
  // Create the lazy component
  const LazyComponent = lazy(importFunction);
  
  // Return a component that handles loading and error states
  return (props) => {
    const [error, setError] = useState(null);
    const [isTimedOut, setIsTimedOut] = useState(false);
    
    // Handle timeout
    useEffect(() => {
      let timeoutId;
      
      if (timeout) {
        timeoutId = setTimeout(() => {
          setIsTimedOut(true);
        }, timeout);
      }
      
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }, []);
    
    // If timed out and we have an error component, show it
    if (isTimedOut && ErrorComponent) {
      return <ErrorComponent error={new Error(`Loading timed out after ${timeout}ms`)} {...props} />;
    }
    
    // If we have an error, show the error component
    if (error && ErrorComponent) {
      return <ErrorComponent error={error} {...props} />;
    }
    
    // Otherwise, render the lazy component with a fallback
    return (
      <Suspense fallback={Fallback || <DefaultFallback />}>
        <ErrorBoundary onError={setError} fallback={ErrorComponent}>
          <LazyComponent {...props} />
        </ErrorBoundary>
      </Suspense>
    );
  };
};

/**
 * Default fallback component for lazy loading
 */
const DefaultFallback = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      padding: '20px',
    }}
  >
    <div
      style={{
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
    <style>
      {`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      `}
    </style>
  </div>
);

/**
 * Error boundary component to catch errors in lazy-loaded components
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
    console.error('Lazy loading error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback ? (
        <this.props.fallback error={this.state.error} />
      ) : null;
    }
    
    return this.props.children;
  }
}

/**
 * HOC that applies code splitting to a component
 * 
 * @param {Function} importFunction - Dynamic import function
 * @param {Object} [options] - Options (same as lazyLoad)
 * @returns {Function} HOC that returns a lazy-loaded component
 */
export const withLazyLoading = (importFunction, options = {}) => {
  return (Component) => {
    const LazyLoadedComponent = lazyLoad(importFunction, options);
    
    return (props) => (
      <LazyLoadedComponent {...props} />
    );
  };
};

/**
 * Preloads a lazy-loaded component to reduce perceived load time
 * 
 * @param {Function} importFunction - Dynamic import function
 * @returns {Promise} Preloading promise
 */
export const preloadComponent = (importFunction) => {
  return importFunction();
};

/**
 * Creates a component that is loaded only when it becomes visible
 * 
 * @param {Function} importFunction - Dynamic import function
 * @param {Object} [options] - Options
 * @param {number} [options.threshold=0.1] - Intersection threshold
 * @param {React.ComponentType} [options.Fallback] - Fallback component
 * @param {React.ComponentType} [options.ErrorComponent] - Error component
 * @returns {React.ComponentType} Visible-triggered lazy component
 */
export const lazyLoadOnVisible = (importFunction, options = {}) => {
  const {
    threshold = 0.1,
    Fallback = null,
    ErrorComponent = null,
  } = options;
  
  return (props) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const containerRef = React.useRef(null);
    
    useEffect(() => {
      if (!containerRef.current || isLoaded) return;
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold }
      );
      
      observer.observe(containerRef.current);
      
      return () => {
        if (containerRef.current) {
          observer.disconnect();
        }
      };
    }, [threshold, isLoaded]);
    
    useEffect(() => {
      if (isVisible) {
        // Start preloading the component
        preloadComponent(importFunction)
          .then(() => setIsLoaded(true))
          .catch(error => console.error('Error preloading component:', error));
      }
    }, [isVisible, importFunction]);
    
    if (!isVisible) {
      return (
        <div ref={containerRef} style={{ minHeight: '20px' }}>
          {Fallback || <DefaultFallback />}
        </div>
      );
    }
    
    // Create lazy component only when visible
    const LazyComponent = lazyLoad(importFunction, {
      Fallback,
      ErrorComponent,
    });
    
    return <LazyComponent {...props} />;
  };
};

/**
 * Creates a route component that is loaded lazily
 * 
 * @param {Function} importFunction - Dynamic import function
 * @param {Object} [options] - Options (same as lazyLoad)
 * @returns {React.ComponentType} Lazy-loaded route component
 */
export const lazyRoute = (importFunction, options = {}) => {
  return lazyLoad(importFunction, {
    Fallback: options.Fallback || <div style={{ padding: '20px' }}>Loading page...</div>,
    ErrorComponent: options.ErrorComponent || (
      ({ error }) => (
        <div style={{ padding: '20px', color: 'red' }}>
          <h2>Error loading page</h2>
          <p>{error.message}</p>
        </div>
      )
    ),
    ...options,
  });
};

/**
 * Creates a dynamic import for both default and named exports
 * 
 * @param {Function} importFunction - Dynamic import function
 * @returns {Function} Modified import function
 */
export const createDynamicImport = (importFunction) => {
  return () => importFunction().then(module => {
    if (module.default) {
      return module;
    }
    
    // If no default export, create a default from the module
    return { ...module, default: module };
  });
};

/**
 * Batch preloads multiple components
 * 
 * @param {Array<Function>} importFunctions - Array of dynamic import functions
 * @returns {Promise} Promise that resolves when all components are preloaded
 */
export const preloadComponents = (importFunctions) => {
  return Promise.all(importFunctions.map(importFn => importFn()));
};