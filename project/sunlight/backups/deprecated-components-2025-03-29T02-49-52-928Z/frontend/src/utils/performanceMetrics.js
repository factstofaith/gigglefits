// performanceMetrics.js
// -----------------------------------------------------------------------------
// Utility functions for measuring and reporting performance metrics

/**
 * Performance measurement class for tracking page load and interaction metrics
 */
export class PerformanceMetrics {
  constructor() {
    this.metrics = {};
    this.observers = {};
    this.enabled = process.env.NODE_ENV !== 'test';
    this.debug = process.env.REACT_APP_PERF_DEBUG === 'true';

    // Initialize application metrics
    this.initMetrics();

    // Set up performance observers if supported
    if (this.enabled && window.PerformanceObserver) {
      this.setupObservers();
    }
  }

  /**
   * Initialize default application metrics
   */
  initMetrics() {
    // Core metrics
    this.metrics = {
      // Web Vitals
      FCP: null, // First Contentful Paint
      LCP: null, // Largest Contentful Paint
      FID: null, // First Input Delay
      CLS: null, // Cumulative Layout Shift
      TTFB: null, // Time to First Byte

      // Custom application metrics
      appStart: null,
      initialRouteLoad: null,
      apiResponseTimes: {},
      componentRenderTimes: {},
      resourceLoadTimes: {},
      lazyLoadingTimes: {},

      // Navigation metrics
      navigationStart: performance.now(),
      lastNavigationTime: 0,
      routeChangeCount: 0,
      slowNavigations: 0,
    };
  }

  /**
   * Set up performance observers to track standard web vitals
   */
  setupObservers() {
    try {
      // First Paint & First Contentful Paint observer
      this.observers.paint = new PerformanceObserver(entryList => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.FCP = entry.startTime;
            this.logMetric('FCP', entry.startTime);
          }
        }
      });
      this.observers.paint.observe({ type: 'paint', buffered: true });

      // Largest Contentful Paint observer
      this.observers.lcp = new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.LCP = lastEntry.startTime;
        this.logMetric('LCP', lastEntry.startTime);
      });
      this.observers.lcp.observe({ type: 'largest-contentful-paint', buffered: true });

      // First Input Delay observer
      this.observers.fid = new PerformanceObserver(entryList => {
        for (const entry of entryList.getEntries()) {
          this.metrics.FID = entry.processingStart - entry.startTime;
          this.logMetric('FID', this.metrics.FID);
        }
      });
      this.observers.fid.observe({ type: 'first-input', buffered: true });

      // Layout Shift observer
      this.observers.cls = new PerformanceObserver(entryList => {
        let clsScore = 0;

        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        }

        this.metrics.CLS = clsScore;
        this.logMetric('CLS', clsScore);
      });
      this.observers.cls.observe({ type: 'layout-shift', buffered: true });

      // Navigation and resource timing
      this.observers.resource = new PerformanceObserver(entryList => {
        for (const entry of entryList.getEntries()) {
          if (entry.initiatorType === 'navigation') {
            this.metrics.TTFB = entry.responseStart - entry.startTime;
            this.logMetric('TTFB', this.metrics.TTFB);
          }

          // Track JS chunk loading for lazy loading metrics
          if (entry.initiatorType === 'script' && entry.name.includes('chunk')) {
            const chunkName = entry.name.split('/').pop().split('.')[0];
            this.metrics.lazyLoadingTimes[chunkName] = {
              duration: entry.duration,
              size: entry.transferSize,
              timestamp: performance.now(),
            };

            this.logMetric(`Chunk Load [${chunkName}]`, entry.duration);
          }
        }
      });
      this.observers.resource.observe({ type: 'resource', buffered: true });

    } catch (error) {
      console.error('Error setting up performance observers:', error);
    }
  }

  /**
   * Log a performance metric with optional details
   * @param {string} name - Metric name
   * @param {number} value - Metric value
   * @param {object} details - Additional details
   */
  logMetric(name, value, details = {}) {
    if (this.debug) {
    }
  }

  /**
   * Start timing an operation
   * @param {string} id - Unique identifier for the operation
   * @returns {number} Start timestamp
   */
  startTiming(id) {
    const startTime = performance.now();
    this.metrics[`${id}_start`] = startTime;
    return startTime;
  }

  /**
   * End timing an operation and record the duration
   * @param {string} id - Unique identifier for the operation (must match startTiming id)
   * @param {string} category - Category for grouping metrics (e.g., 'api', 'render')
   * @returns {number} Duration in milliseconds
   */
  endTiming(id, category = 'custom') {
    const endTime = performance.now();
    const startTime = this.metrics[`${id}_start`] || endTime;
    const duration = endTime - startTime;

    // Store the result in the appropriate category
    if (!this.metrics[`${category}Times`]) {
      this.metrics[`${category}Times`] = {};
    }

    this.metrics[`${category}Times`][id] = duration;
    this.logMetric(`${category}:${id}`, duration);

    return duration;
  }

  /**
   * Track route change performance
   * @param {string} route - The route that was navigated to
   */
  trackRouteChange(route) {
    const timestamp = performance.now();
    const timeSinceStart = timestamp - this.metrics.navigationStart;

    // If this is the initial route, track it
    if (this.metrics.routeChangeCount === 0) {
      this.metrics.initialRouteLoad = timeSinceStart;
      this.logMetric('Initial Route Load', timeSinceStart);
    }

    // Calculate time since last navigation
    const timeSinceLastNavigation =
      this.metrics.lastNavigationTime > 0 ? timestamp - this.metrics.lastNavigationTime : 0;

    // Track this navigation
    this.metrics.lastNavigationTime = timestamp;
    this.metrics.routeChangeCount++;

    // Record if this was a slow navigation (over 300ms)
    if (timeSinceLastNavigation > 300 && this.metrics.routeChangeCount > 1) {
      this.metrics.slowNavigations++;
      this.logMetric(`Slow Navigation to ${route}`, timeSinceLastNavigation);
    }

    return timeSinceLastNavigation;
  }

  /**
   * Track API call performance
   * @param {string} endpoint - API endpoint
   * @param {number} duration - Time taken for the API call
   * @param {string} status - Response status (success/error)
   */
  trackApiCall(endpoint, duration, status = 'success') {
    if (!this.metrics.apiResponseTimes[endpoint]) {
      this.metrics.apiResponseTimes[endpoint] = {
        calls: 0,
        totalTime: 0,
        average: 0,
        min: duration,
        max: duration,
        errors: 0,
      };
    }

    const stats = this.metrics.apiResponseTimes[endpoint];
    stats.calls++;
    stats.totalTime += duration;
    stats.average = stats.totalTime / stats.calls;
    stats.min = Math.min(stats.min, duration);
    stats.max = Math.max(stats.max, duration);

    if (status === 'error') {
      stats.errors++;
    }

    this.logMetric(`API:${endpoint}`, duration, { status });
  }

  /**
   * Track component render performance
   * @param {string} componentName - Name of the component
   * @param {number} duration - Time taken to render
   */
  trackRender(componentName, duration) {
    if (!this.metrics.componentRenderTimes[componentName]) {
      this.metrics.componentRenderTimes[componentName] = {
        renders: 0,
        totalTime: 0,
        average: 0,
      };
    }

    const stats = this.metrics.componentRenderTimes[componentName];
    stats.renders++;
    stats.totalTime += duration;
    stats.average = stats.totalTime / stats.renders;

    this.logMetric(`Render:${componentName}`, duration);
  }

  /**
   * Get all collected metrics
   * @returns {object} All performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      // Add calculated metrics
      performanceScore: this.calculatePerformanceScore(),
    };
  }

  /**
   * Calculate an overall performance score based on collected metrics
   * @returns {number} Performance score (0-100)
   */
  calculatePerformanceScore() {
    // This is a simplified scoring algorithm
    // In a real app, you would use more sophisticated weighting
    let score = 100;

    // Penalize for slow LCP (Google recommends < 2.5s)
    if (this.metrics.LCP) {
      if (this.metrics.LCP > 2500) score -= 15;
      else if (this.metrics.LCP > 1800) score -= 5;
    }

    // Penalize for high CLS (Google recommends < 0.1)
    if (this.metrics.CLS) {
      if (this.metrics.CLS > 0.25) score -= 15;
      else if (this.metrics.CLS > 0.1) score -= 5;
    }

    // Penalize for slow navigations
    score -= Math.min(20, this.metrics.slowNavigations * 5);

    // Ensure score is within 0-100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Reset all metrics
   */
  resetMetrics() {
    this.initMetrics();
  }

  /**
   * Disconnect all observers
   */
  disconnect() {
    Object.values(this.observers).forEach(observer => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect();
      }
    });
  }
}

// Singleton instance
const performanceMetrics = new PerformanceMetrics();

/**
 * Track the render performance of a React component
 * @param {string} componentName - Name of the component
 * @param {function} renderFunc - Render function to time
 * @returns {JSX.Element} The rendered component
 */
export function trackRender(componentName, renderFunc) {
  // Added display name
  trackRender.displayName = 'trackRender';

  if (!performanceMetrics.enabled) return renderFunc();

  const startTime = performance.now();
  const result = renderFunc();
  const duration = performance.now() - startTime;

  performanceMetrics.trackRender(componentName, duration);
  return result;
}

/**
 * Higher-order component that wraps a component to track its render performance
 * @param {string} componentName - Name of the component (for metrics)
 * @param {React.Component} Component - Component to wrap
 * @returns {React.Component} Wrapped component with performance tracking
 */
export function withPerformanceTracking(componentName, Component) {
  // Added display name
  withPerformanceTracking.displayName = 'withPerformanceTracking';

  return function PerformanceTrackedComponent(props) {
  // Added display name
  PerformanceTrackedComponent.displayName = 'PerformanceTrackedComponent';

    const startTime = performance.now();
    const result = <Component {...props} />;
    const duration = performance.now() - startTime;

    if (performanceMetrics.enabled) {
      performanceMetrics.trackRender(componentName, duration);
    }

    return result;
  };
}

// Export the singleton instance
export default performanceMetrics;
