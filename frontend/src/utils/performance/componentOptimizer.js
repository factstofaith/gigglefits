/**
 * Component Performance Optimizer
 * 
 * Utilities for optimizing component rendering performance.
 * Part of the zero technical debt performance implementation.
 * 
 * @module utils/performance/componentOptimizer
 */

import React, { memo, useMemo, useCallback } from 'react';

/**
 * Creates an optimized version of a component with performance best practices applied
 * 
 * @param {React.ComponentType} Component - Component to optimize
 * @param {Object} options - Optimization options
 * @param {Array<string>} [options.memoProps=[]] - Props to explicitly check in memo comparison
 * @param {boolean} [options.deepComparison=false] - Whether to use deep comparison for memo
 * @param {boolean} [options.logRenders=false] - Whether to log renders in development
 * @param {Function} [options.customCompare] - Custom comparison function for memo
 * @returns {React.MemoExoticComponent} Optimized component
 */
export const optimizeComponent = (Component, {
  memoProps = [],
  deepComparison = false,
  logRenders = false,
  customCompare = null
} = {}) => {
  // Add display name
  const displayName = Component.displayName || Component.name || 'Component';
  
  // Create wrapper component for render logging
  const WrappedComponent = (props) => {
    // In development, log renders
    if (process.env.NODE_ENV === 'development' && logRenders) {
      console.log(`Rendering ${displayName}`, props);
    }
    
    return <Component {...props} />;
  };
  
  // Set display name
  WrappedComponent.displayName = `Optimized(${displayName})`;
  
  // Choose comparison function
  let compareFunction = null;
  
  if (customCompare) {
    // Use custom comparison function
    compareFunction = customCompare;
  } else if (memoProps.length > 0) {
    // Check only specified props
    compareFunction = (prevProps, nextProps) => {
      return memoProps.every(prop => {
        if (deepComparison) {
          return JSON.stringify(prevProps[prop]) === JSON.stringify(nextProps[prop]);
        }
        return prevProps[prop] === nextProps[prop];
      });
    };
  } else if (deepComparison) {
    // Deep comparison of all props
    compareFunction = (prevProps, nextProps) => {
      return JSON.stringify(prevProps) === JSON.stringify(nextProps);
    };
  }
  
  // Memoize the component
  const MemoizedComponent = memo(WrappedComponent, compareFunction);
  
  return MemoizedComponent;
};

/**
 * Higher Order Component for optimizing rendering performance
 * 
 * @param {Object} options - Optimization options
 * @param {Array<string>} [options.memoProps=[]] - Props to explicitly check in memo comparison
 * @param {boolean} [options.deepComparison=false] - Whether to use deep comparison for memo
 * @param {boolean} [options.logRenders=false] - Whether to log renders in development
 * @param {Function} [options.customCompare] - Custom comparison function for memo
 * @returns {Function} HOC function
 */
export const withOptimization = (options = {}) => {
  return (Component) => {
    return optimizeComponent(Component, options);
  };
};

/**
 * Creates optimized event handlers using useCallback
 * 
 * @param {Object} handlers - Object with handler functions
 * @param {Array<any>} dependencies - Dependencies for useCallback
 * @returns {Object} Optimized handlers
 */
export const createOptimizedHandlers = (handlers, dependencies = []) => {
  const optimizedHandlers = {};
  
  Object.entries(handlers).forEach(([key, handler]) => {
    optimizedHandlers[key] = useCallback(handler, dependencies);
  });
  
  return optimizedHandlers;
};

/**
 * Creates optimized computed values using useMemo
 * 
 * @param {Object} computations - Object with computation functions
 * @param {Array<any>} dependencies - Dependencies for useMemo
 * @returns {Object} Computed values
 */
export const createOptimizedValues = (computations, dependencies = []) => {
  const computedValues = {};
  
  Object.entries(computations).forEach(([key, computation]) => {
    computedValues[key] = useMemo(computation, dependencies);
  });
  
  return computedValues;
};

/**
 * Measures render time for a component
 * 
 * @param {React.ComponentType} Component - Component to measure
 * @returns {React.ComponentType} Wrapped component with render timing
 */
export const withRenderTiming = (Component) => {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const WrappedComponent = (props) => {
    const startTime = performance.now();
    
    // Use a ref to store the render time
    const renderTimeRef = React.useRef(0);
    
    // Use layout effect to measure timing after render but before paint
    React.useLayoutEffect(() => {
      const endTime = performance.now();
      renderTimeRef.current = endTime - startTime;
      
      // Log render time in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`${displayName} rendered in ${renderTimeRef.current.toFixed(2)}ms`);
      }
    });
    
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `TimedRender(${displayName})`;
  
  return WrappedComponent;
};

/**
 * Optimizes lists rendering with windowing
 * 
 * Note: This is a simplified version. In production, you would use a library like react-window or react-virtualized.
 * 
 * @param {Array<any>} items - Items to render
 * @param {Function} renderItem - Function to render an item
 * @param {Object} options - Windowing options
 * @param {number} [options.itemHeight=50] - Height of each item
 * @param {number} [options.overscan=5] - Number of items to render outside visible area
 * @param {number} [options.visibleItems=10] - Number of items visible at once
 * @returns {Array<React.ReactNode>} Rendered items
 */
export const optimizeListRendering = (items, renderItem, {
  itemHeight = 50,
  overscan = 5,
  visibleItems = 10
} = {}) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  React.useEffect(() => {
    const handleScroll = () => {
      setScrollTop(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    startIndex + visibleItems + 2 * overscan
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  
  return (
    <div style={{ height: `${items.length * itemHeight}px`, position: 'relative' }}>
      {visibleItems.map((item, index) => (
        <div
          key={startIndex + index}
          style={{
            position: 'absolute',
            top: `${(startIndex + index) * itemHeight}px`,
            height: `${itemHeight}px`,
            width: '100%'
          }}
        >
          {renderItem(item, startIndex + index)}
        </div>
      ))}
    </div>
  );
};

/**
 * Defers non-critical rendering until after the main content is loaded
 * 
 * @param {React.ReactNode} children - Content to defer
 * @param {Object} options - Deferring options
 * @param {boolean} [options.defer=true] - Whether to defer rendering
 * @param {number} [options.delay=0] - Additional delay in ms
 * @returns {React.ReactNode} Deferred content
 */
export const DeferredRender = ({ children, defer = true, delay = 0 }) => {
  const [shouldRender, setShouldRender] = React.useState(!defer);
  
  React.useEffect(() => {
    if (!defer) {
      setShouldRender(true);
      return;
    }
    
    // Use requestIdleCallback if available, otherwise setTimeout
    const renderWhenIdle = () => {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          setTimeout(() => setShouldRender(true), delay);
        });
      } else {
        setTimeout(() => setShouldRender(true), delay);
      }
    };
    
    // Use a microtask to ensure this runs after initial render
    Promise.resolve().then(renderWhenIdle);
  }, [defer, delay]);
  
  return shouldRender ? children : null;
};

/**
 * Debounces the rendering of a component based on prop changes
 * 
 * @param {React.ComponentType} Component - Component to debounce
 * @param {Object} options - Debounce options
 * @param {number} [options.debounceTime=200] - Debounce time in ms
 * @param {Array<string>} [options.watchProps=[]] - Props to watch for changes
 * @returns {React.ComponentType} Debounced component
 */
export const withDebouncedRendering = (Component, {
  debounceTime = 200,
  watchProps = []
} = {}) => {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const WrappedComponent = (props) => {
    const [debouncedProps, setDebouncedProps] = React.useState(props);
    const timeoutRef = React.useRef(null);
    
    React.useEffect(() => {
      // If no specific props to watch, watch all props
      const shouldUpdate = watchProps.length === 0 || 
        watchProps.some(prop => props[prop] !== debouncedProps[prop]);
      
      if (shouldUpdate) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          setDebouncedProps(props);
        }, debounceTime);
      }
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [props, debouncedProps]);
    
    return <Component {...debouncedProps} />;
  };
  
  WrappedComponent.displayName = `DebouncedRender(${displayName})`;
  
  return WrappedComponent;
};