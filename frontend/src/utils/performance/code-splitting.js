/**
 * Code Splitting Implementation
 * 
 * Utilities for implementing code splitting and lazy loading
 * with zero technical debt approach.
 * 
 * @module utils/performance/code-splitting
 */

import React, { lazy, Suspense } from 'react';
import { 
  lazyWithMonitoring, 
  LazyComponentLoader 
} from './lazyLoadWithMonitoring';

/**
 * Create a lazy-loaded component with optimized implementation
 * 
 * @param {Function} importFunction - Dynamic import function for the component
 * @param {Object} [options] - Configuration options 
 * @returns {React.LazyExoticComponent} Lazy component
 */
export const createLazyComponent = (importFunction, {
  name = 'LazyComponent',
  fallback = null,
  errorBoundary = true,
  chunkName = '',
  preload = false
} = {}) => {
  // Add chunk name comment for webpack if provided
  const componentImport = chunkName
    ? () => importFunction() /* webpackChunkName: `${chunkName}` */
    : importFunction;
  
  // Create the lazy component
  const LazyComponent = lazyWithMonitoring(componentImport, { name });
  
  // Preload the component if requested
  if (preload) {
    // Use requestIdleCallback if available, setTimeout otherwise
    const schedulePreload = window.requestIdleCallback || setTimeout;
    schedulePreload(() => {
      console.log(`Preloading component: ${name}`);
      componentImport();
    }, { timeout: 2000 });
  }
  
  // Create a component that will render the lazy-loaded component
  return React.forwardRef((props, ref) => (
    <LazyComponentLoader
      component={LazyComponent}
      fallback={fallback}
      errorBoundary={errorBoundary}
      componentProps={{
        ...props,
        ref
      }}
    />
  ));
};

/**
 * Create code-split routes for React Router
 * 
 * @param {Object} routes - Route configurations
 * @returns {Object} Code-split routes
 */
export const createCodeSplitRoutes = (routes) => {
  return Object.entries(routes).reduce((result, [path, config]) => {
    // Get route parameters
    const {
      import: importFn,
      name = path.replace(/\//g, '_'),
      preload = false,
      chunkName = name,
      // Extract other props for react-router
      ...routeProps
    } = config;
    
    // Create lazy component for the route
    if (importFn) {
      result[path] = {
        ...routeProps,
        element: createLazyComponent(importFn, {
          name,
          preload,
          chunkName,
          fallback: (
            <div className="route-loading">
              <span>Loading...</span>
            </div>
          )
        })
      };
    } else {
      // Pass through routes without import function
      result[path] = config;
    }
    
    return result;
  }, {});
};

/**
 * Lazy-load multiple components for a page
 * 
 * @param {Object} components - Component import functions by name
 * @param {Object} [options] - Configuration options
 * @returns {Object} Lazy-loaded components
 */
export const createLazyPageComponents = (components, {
  preloadAll = false,
  defaultOptions = {}
} = {}) => {
  return Object.entries(components).reduce((result, [name, config]) => {
    // Handle both simple and complex configurations
    const importFn = typeof config === 'function' ? config : config.import;
    const componentOptions = typeof config === 'function'
      ? { ...defaultOptions }
      : { ...defaultOptions, ...config, import: undefined };
    
    // Set component name based on key
    componentOptions.name = componentOptions.name || name;
    
    // Apply preload setting
    componentOptions.preload = preloadAll || componentOptions.preload;
    
    // Create lazy component
    result[name] = createLazyComponent(importFn, componentOptions);
    
    return result;
  }, {});
};

/**
 * Preload components for a specific route
 * 
 * @param {string} routeName - Route name or path to preload
 * @param {Object} routeConfig - Route configuration
 */
export const preloadRoute = (routeName, routeConfig) => {
  if (!routeConfig) {
    console.warn(`Route config not found for: ${routeName}`);
    return;
  }
  
  // Find the components to preload
  const componentsToPreload = [];
  
  // Add main route component if it has an import function
  if (routeConfig.import) {
    componentsToPreload.push({
      name: routeName,
      importFn: routeConfig.import
    });
  }
  
  // Add any additional components to preload
  if (routeConfig.preloadComponents && Array.isArray(routeConfig.preloadComponents)) {
    routeConfig.preloadComponents.forEach(component => {
      if (typeof component === 'function') {
        componentsToPreload.push({
          name: 'additional',
          importFn: component
        });
      } else if (component.import) {
        componentsToPreload.push({
          name: component.name || 'additional',
          importFn: component.import
        });
      }
    });
  }
  
  // Preload all components
  componentsToPreload.forEach(({ name, importFn }) => {
    console.log(`Preloading route component: ${name}`);
    importFn();
  });
};

/**
 * Implementation examples for documentation
 * 
 * Route configuration example:
 * 
 * const routes = {
 *   '/dashboard': {
 *     import: () => import('../pages/DashboardPage'),
 *     name: 'Dashboard',
 *     chunkName: 'dashboard-page',
 *     preload: true
 *   },
 *   '/integrations': {
 *     import: () => import('../pages/IntegrationsPage'),
 *     name: 'Integrations',
 *     preloadComponents: [
 *       () => import('../components/integration/IntegrationList'),
 *       {
 *         name: 'IntegrationFilters',
 *         import: () => import('../components/integration/IntegrationFilters')
 *       }
 *     ]
 *   }
 * };
 * 
 * const codeSplitRoutes = createCodeSplitRoutes(routes);
 * 
 * // Usage with React Router v6
 * <Routes>
 *   {Object.entries(codeSplitRoutes).map(([path, { element, ...rest }]) => (
 *     <Route key={path} path={path} element={element} {...rest} />
 *   ))}
 * </Routes>
 */