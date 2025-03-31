/**
 * usageAnalytics
 * 
 * Analytics tracking for component and feature usage.
 * 
 * Features:
 * - High performance implementation
 * - Optimized for production builds
 * - Compatible with tree shaking
 * - Minimal dependencies
 * - Component usage tracking
 * - Feature usage tracking
 * - User flow tracking
 * - Usage pattern analysis
 */

import { performance } from '../performance';

// Default configuration for usage analytics
const defaultConfig = {
  // Enable detailed logging
  verbose: false,
  // Sampling rate (percentage of events to record)
  samplingRate: 100,
  // Maximum events to store in memory
  maxEvents: 1000,
  // Storage key for persisting analytics data
  storageKey: 'usage-analytics-data',
  // Automatically track page views
  trackPageViews: true,
  // Automatically track component mounts
  trackComponentMounts: true,
  // Track user session duration
  trackSessionDuration: true,
  // Send analytics data to server endpoint
  sendToServer: false,
  // Server endpoint for analytics data
  serverEndpoint: '/api/analytics',
  // Batch size for server requests
  batchSize: 10,
  // Components to exclude from tracking
  excludeComponents: []
};

/**
 * usageAnalytics Configuration options
 * @typedef {Object} usageAnalyticsOptions
 * @property {boolean} verbose - Enable detailed logging
 * @property {number} samplingRate - Percentage of events to record (0-100)
 * @property {number} maxEvents - Maximum events to store in memory
 * @property {string} storageKey - Storage key for persisting analytics data
 * @property {boolean} trackPageViews - Automatically track page views
 * @property {boolean} trackComponentMounts - Automatically track component mounts
 * @property {boolean} trackSessionDuration - Track user session duration
 * @property {boolean} sendToServer - Send analytics data to server
 * @property {string} serverEndpoint - Server endpoint for analytics data
 * @property {number} batchSize - Batch size for server requests
 * @property {Array<string>} excludeComponents - Components to exclude from tracking
 */

/**
 * usageAnalytics implementation
 * 
 * @param {usageAnalyticsOptions} options - Configuration options
 * @returns {Object} The utility instance
 */
export function usageAnalytics(options = {}) {
  // Track initialization performance
  const startTime = performance.now();
  
  // Merge default and custom configurations
  const config = { ...defaultConfig, ...options };
  
  // Usage data storage
  const events = [];
  const componentMetrics = {};
  const featureMetrics = {};
  const userFlows = {};
  const activeFlows = {};
  
  // Session tracking
  const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
  const sessionStartTime = Date.now();
  
  // Pending batch for server
  const pendingBatch = [];
  let batchTimer = null;
  
  /**
   * Track a component usage event
   * 
   * @param {string} componentName - Name of the component
   * @param {string} eventType - Type of event (mount, update, unmount, etc)
   * @param {Object} details - Additional event details
   * @returns {string} Event ID
   */
  function trackComponent(componentName, eventType = 'mount', details = {}) {
    // Skip excluded components
    if (config.excludeComponents.includes(componentName)) {
      return null;
    }
    
    // Apply sampling rate
    if (Math.random() * 100 > config.samplingRate) {
      return null;
    }
    
    // Create event record
    const event = {
      id: generateEventId(),
      type: 'component',
      componentName,
      eventType,
      details,
      timestamp: Date.now(),
      sessionId
    };
    
    // Update component metrics
    if (!componentMetrics[componentName]) {
      componentMetrics[componentName] = {
        count: 0,
        events: {},
        firstSeen: Date.now(),
        lastSeen: Date.now()
      };
    }
    
    componentMetrics[componentName].count++;
    componentMetrics[componentName].lastSeen = Date.now();
    
    if (!componentMetrics[componentName].events[eventType]) {
      componentMetrics[componentName].events[eventType] = 0;
    }
    
    componentMetrics[componentName].events[eventType]++;
    
    // Add to events log
    events.push(event);
    
    // Enforce maximum events limit
    if (events.length > config.maxEvents) {
      events.shift();
    }
    
    // Add to server batch if enabled
    if (config.sendToServer) {
      addToBatch(event);
    }
    
    // Log if verbose
    if (config.verbose) {
      console.log(`Component track: ${componentName} - ${eventType}`);
    }
    
    return event.id;
  }
  
  /**
   * Track a feature usage event
   * 
   * @param {string} featureName - Name of the feature
   * @param {string} action - Action performed (use, click, view, etc)
   * @param {Object} properties - Feature usage properties
   * @returns {string} Event ID
   */
  function trackFeature(featureName, action = 'use', properties = {}) {
    // Apply sampling rate
    if (Math.random() * 100 > config.samplingRate) {
      return null;
    }
    
    // Create event record
    const event = {
      id: generateEventId(),
      type: 'feature',
      featureName,
      action,
      properties,
      timestamp: Date.now(),
      sessionId
    };
    
    // Update feature metrics
    if (!featureMetrics[featureName]) {
      featureMetrics[featureName] = {
        count: 0,
        actions: {},
        firstSeen: Date.now(),
        lastSeen: Date.now()
      };
    }
    
    featureMetrics[featureName].count++;
    featureMetrics[featureName].lastSeen = Date.now();
    
    if (!featureMetrics[featureName].actions[action]) {
      featureMetrics[featureName].actions[action] = 0;
    }
    
    featureMetrics[featureName].actions[action]++;
    
    // Add to events log
    events.push(event);
    
    // Enforce maximum events limit
    if (events.length > config.maxEvents) {
      events.shift();
    }
    
    // Add to server batch if enabled
    if (config.sendToServer) {
      addToBatch(event);
    }
    
    // Log if verbose
    if (config.verbose) {
      console.log(`Feature track: ${featureName} - ${action}`);
    }
    
    return event.id;
  }
  
  /**
   * Start tracking a user flow
   * 
   * @param {string} flowName - Name of the flow
   * @param {Object} context - Flow context
   * @returns {string} Flow ID
   */
  function startFlow(flowName, context = {}) {
    const flowId = generateEventId();
    
    // Create flow record
    activeFlows[flowId] = {
      id: flowId,
      name: flowName,
      context,
      startTime: Date.now(),
      endTime: null,
      steps: [],
      completed: false,
      abandoned: false
    };
    
    // Initialize flow metrics if not exists
    if (!userFlows[flowName]) {
      userFlows[flowName] = {
        started: 0,
        completed: 0,
        abandoned: 0,
        avgDuration: 0,
        totalDuration: 0,
        steps: {}
      };
    }
    
    userFlows[flowName].started++;
    
    // Log if verbose
    if (config.verbose) {
      console.log(`Flow started: ${flowName} (${flowId})`);
    }
    
    return flowId;
  }
  
  /**
   * Record a step in a user flow
   * 
   * @param {string} flowId - Flow ID
   * @param {string} stepName - Name of the step
   * @param {Object} data - Step data
   * @returns {boolean} Success
   */
  function recordFlowStep(flowId, stepName, data = {}) {
    if (!activeFlows[flowId]) {
      if (config.verbose) {
        console.warn(`Flow not found: ${flowId}`);
      }
      return false;
    }
    
    const flow = activeFlows[flowId];
    
    // Add step to flow
    flow.steps.push({
      name: stepName,
      timestamp: Date.now(),
      data,
      duration: flow.steps.length > 0 
        ? Date.now() - flow.steps[flow.steps.length - 1].timestamp 
        : Date.now() - flow.startTime
    });
    
    // Update flow metrics
    if (!userFlows[flow.name].steps[stepName]) {
      userFlows[flow.name].steps[stepName] = 0;
    }
    
    userFlows[flow.name].steps[stepName]++;
    
    // Log if verbose
    if (config.verbose) {
      console.log(`Flow step: ${flow.name} - ${stepName} (${flowId})`);
    }
    
    return true;
  }
  
  /**
   * Complete a user flow
   * 
   * @param {string} flowId - Flow ID
   * @param {Object} result - Flow result
   * @returns {boolean} Success
   */
  function completeFlow(flowId, result = {}) {
    if (!activeFlows[flowId]) {
      if (config.verbose) {
        console.warn(`Flow not found: ${flowId}`);
      }
      return false;
    }
    
    const flow = activeFlows[flowId];
    
    // Mark flow as completed
    flow.completed = true;
    flow.endTime = Date.now();
    flow.result = result;
    flow.duration = flow.endTime - flow.startTime;
    
    // Update flow metrics
    userFlows[flow.name].completed++;
    userFlows[flow.name].totalDuration += flow.duration;
    userFlows[flow.name].avgDuration = 
      userFlows[flow.name].totalDuration / userFlows[flow.name].completed;
    
    // Create event record
    const event = {
      id: generateEventId(),
      type: 'flow',
      flowId,
      flowName: flow.name,
      status: 'completed',
      duration: flow.duration,
      steps: flow.steps.length,
      timestamp: Date.now(),
      sessionId
    };
    
    // Add to events log
    events.push(event);
    
    // Enforce maximum events limit
    if (events.length > config.maxEvents) {
      events.shift();
    }
    
    // Add to server batch if enabled
    if (config.sendToServer) {
      addToBatch({
        ...event,
        flow: { ...flow, steps: flow.steps.length } // Send summary to reduce size
      });
    }
    
    // Log if verbose
    if (config.verbose) {
      console.log(`Flow completed: ${flow.name} (${flowId}) in ${flow.duration}ms`);
    }
    
    // Clean up active flow
    delete activeFlows[flowId];
    
    return true;
  }
  
  /**
   * Abandon a user flow
   * 
   * @param {string} flowId - Flow ID
   * @param {string} reason - Abandonment reason
   * @returns {boolean} Success
   */
  function abandonFlow(flowId, reason = 'unknown') {
    if (!activeFlows[flowId]) {
      if (config.verbose) {
        console.warn(`Flow not found: ${flowId}`);
      }
      return false;
    }
    
    const flow = activeFlows[flowId];
    
    // Mark flow as abandoned
    flow.abandoned = true;
    flow.endTime = Date.now();
    flow.abandonReason = reason;
    flow.duration = flow.endTime - flow.startTime;
    
    // Update flow metrics
    userFlows[flow.name].abandoned++;
    
    // Create event record
    const event = {
      id: generateEventId(),
      type: 'flow',
      flowId,
      flowName: flow.name,
      status: 'abandoned',
      reason,
      duration: flow.duration,
      steps: flow.steps.length,
      timestamp: Date.now(),
      sessionId
    };
    
    // Add to events log
    events.push(event);
    
    // Enforce maximum events limit
    if (events.length > config.maxEvents) {
      events.shift();
    }
    
    // Add to server batch if enabled
    if (config.sendToServer) {
      addToBatch({
        ...event,
        flow: { ...flow, steps: flow.steps.length } // Send summary to reduce size
      });
    }
    
    // Log if verbose
    if (config.verbose) {
      console.log(`Flow abandoned: ${flow.name} (${flowId}) - ${reason}`);
    }
    
    // Clean up active flow
    delete activeFlows[flowId];
    
    return true;
  }
  
  /**
   * Track a page view
   * 
   * @param {string} path - Page path
   * @param {Object} properties - Page view properties
   * @returns {string} Event ID
   */
  function trackPageView(path, properties = {}) {
    // Apply sampling rate
    if (Math.random() * 100 > config.samplingRate) {
      return null;
    }
    
    // Create event record
    const event = {
      id: generateEventId(),
      type: 'pageView',
      path,
      properties,
      timestamp: Date.now(),
      sessionId,
      referrer: typeof document !== 'undefined' ? document.referrer : null
    };
    
    // Add to events log
    events.push(event);
    
    // Enforce maximum events limit
    if (events.length > config.maxEvents) {
      events.shift();
    }
    
    // Add to server batch if enabled
    if (config.sendToServer) {
      addToBatch(event);
    }
    
    // Log if verbose
    if (config.verbose) {
      console.log(`Page view: ${path}`);
    }
    
    return event.id;
  }
  
  /**
   * Generate usage analytics report
   * 
   * @returns {Object} Analytics report
   */
  function generateReport() {
    const sessionDuration = Date.now() - sessionStartTime;
    
    return {
      summary: {
        sessionId,
        sessionDuration,
        eventCount: events.length,
        componentCount: Object.keys(componentMetrics).length,
        featureCount: Object.keys(featureMetrics).length,
        flowCount: Object.keys(userFlows).length
      },
      components: componentMetrics,
      features: featureMetrics,
      flows: userFlows,
      // Include last 100 events to reduce size
      recentEvents: events.slice(-100),
      timestamp: Date.now()
    };
  }
  
  /**
   * Save analytics data to storage
   */
  function saveAnalytics() {
    if (typeof window === 'undefined' || !config.storageKey) {
      return;
    }
    
    try {
      const report = generateReport();
      localStorage.setItem(config.storageKey, JSON.stringify(report));
      
      if (config.verbose) {
        console.log('Analytics data saved to storage');
      }
    } catch (e) {
      console.error('Failed to save analytics data to storage:', e);
    }
  }
  
  /**
   * Load analytics data from storage
   * 
   * @returns {Object|null} Loaded analytics data or null if not found
   */
  function loadAnalytics() {
    if (typeof window === 'undefined' || !config.storageKey) {
      return null;
    }
    
    try {
      const storedData = localStorage.getItem(config.storageKey);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        
        // Merge with current metrics
        if (parsedData.components) {
          Object.keys(parsedData.components).forEach(component => {
            if (!componentMetrics[component]) {
              componentMetrics[component] = parsedData.components[component];
            }
          });
        }
        
        if (parsedData.features) {
          Object.keys(parsedData.features).forEach(feature => {
            if (!featureMetrics[feature]) {
              featureMetrics[feature] = parsedData.features[feature];
            }
          });
        }
        
        if (parsedData.flows) {
          Object.keys(parsedData.flows).forEach(flow => {
            if (!userFlows[flow]) {
              userFlows[flow] = parsedData.flows[flow];
            }
          });
        }
        
        if (config.verbose) {
          console.log('Analytics data loaded from storage');
        }
        
        return parsedData;
      }
    } catch (e) {
      console.error('Failed to load analytics data from storage:', e);
    }
    
    return null;
  }
  
  /**
   * Clear all analytics data
   */
  function clearAnalytics() {
    events.length = 0;
    Object.keys(componentMetrics).forEach(key => delete componentMetrics[key]);
    Object.keys(featureMetrics).forEach(key => delete featureMetrics[key]);
    Object.keys(userFlows).forEach(key => delete userFlows[key]);
    Object.keys(activeFlows).forEach(key => delete activeFlows[key]);
    
    if (typeof window !== 'undefined' && config.storageKey) {
      try {
        localStorage.removeItem(config.storageKey);
      } catch (e) {
        console.error('Failed to clear analytics data from storage:', e);
      }
    }
    
    if (config.verbose) {
      console.log('Analytics data cleared');
    }
  }
  
  /**
   * Generate a unique event ID
   * 
   * @returns {string} Unique event ID
   */
  function generateEventId() {
    return 'evt_' + Date.now().toString(36) + '_' + 
      Math.random().toString(36).substring(2, 10);
  }
  
  /**
   * Add event to server batch
   * 
   * @param {Object} event - Event to add to batch
   */
  function addToBatch(event) {
    pendingBatch.push(event);
    
    // Send batch if full
    if (pendingBatch.length >= config.batchSize) {
      sendBatch();
    } else if (pendingBatch.length === 1) {
      // Start timer for first event
      if (!batchTimer) {
        batchTimer = setTimeout(sendBatch, 30000); // 30 second timeout
      }
    }
  }
  
  /**
   * Send batch to server
   */
  function sendBatch() {
    if (pendingBatch.length === 0) {
      return;
    }
    
    if (config.verbose) {
      console.log(`Sending batch of ${pendingBatch.length} events`);
    }
    
    if (typeof window !== 'undefined' && config.serverEndpoint) {
      try {
        const batch = [...pendingBatch];
        pendingBatch.length = 0;
        
        // Clear batch timer
        if (batchTimer) {
          clearTimeout(batchTimer);
          batchTimer = null;
        }
        
        // Use Beacon API if available for end of session
        if (navigator.sendBeacon && typeof document !== 'undefined' && document.visibilityState === 'hidden') {
          const blob = new Blob([JSON.stringify({ events: batch, sessionId })], {
            type: 'application/json'
          });
          navigator.sendBeacon(config.serverEndpoint, blob);
          return;
        }
        
        // Otherwise use fetch
        fetch(config.serverEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            events: batch,
            sessionId
          }),
          // Use lower priority for analytics
          priority: 'low',
          // Don't wait for response
          keepalive: true
        }).catch(err => {
          console.error('Failed to send analytics batch:', err);
        });
      } catch (e) {
        console.error('Failed to send analytics batch:', e);
      }
    }
  }
  
  // Set up automatic tracking if in browser
  if (typeof window !== 'undefined') {
    // Load existing analytics
    loadAnalytics();
    
    // Track page views
    if (config.trackPageViews) {
      // Track initial page view
      trackPageView(window.location.pathname + window.location.search);
      
      // Track navigation if History API is available
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;
      
      window.history.pushState = function(...args) {
        originalPushState.apply(this, args);
        trackPageView(window.location.pathname + window.location.search);
      };
      
      window.history.replaceState = function(...args) {
        originalReplaceState.apply(this, args);
        trackPageView(window.location.pathname + window.location.search);
      };
      
      // Handle back/forward navigation
      window.addEventListener('popstate', () => {
        trackPageView(window.location.pathname + window.location.search);
      });
    }
    
    // Save analytics on page unload
    window.addEventListener('beforeunload', () => {
      // Complete any active flows as abandoned
      Object.keys(activeFlows).forEach(flowId => {
        abandonFlow(flowId, 'page_exit');
      });
      
      // Save analytics data
      saveAnalytics();
      
      // Send any pending batch
      sendBatch();
    });
  }
  
  // Log initialization time
  const initTime = performance.now() - startTime;
  if (initTime > 5 && config.verbose) {
    console.warn(`Usage analytics initialization took ${initTime.toFixed(2)}ms, which may impact performance`);
  }
  
  // Return public API
  return {
    trackComponent,
    trackFeature,
    startFlow,
    recordFlowStep,
    completeFlow,
    abandonFlow,
    trackPageView,
    generateReport,
    saveAnalytics,
    loadAnalytics,
    clearAnalytics,
    getSessionId: () => sessionId,
    getSessionDuration: () => Date.now() - sessionStartTime
  };
}

/**
 * Create a usage monitor for a specific component
 * 
 * @param {string} componentName - Name of the component
 * @param {usageAnalyticsOptions} options - Configuration options
 * @returns {Object} Component usage monitoring API
 */
export function createComponentTracker(componentName, options = {}) {
  const tracker = usageAnalytics({
    trackComponentMounts: true,
    ...options
  });
  
  return {
    // Track component mount
    trackMount: (props = {}) => {
      return tracker.trackComponent(componentName, 'mount', { props });
    },
    
    // Track component update
    trackUpdate: (props = {}) => {
      return tracker.trackComponent(componentName, 'update', { props });
    },
    
    // Track component unmount
    trackUnmount: (reason = 'normal') => {
      return tracker.trackComponent(componentName, 'unmount', { reason });
    },
    
    // Track component interaction
    trackInteraction: (action, details = {}) => {
      return tracker.trackFeature(`${componentName}:${action}`, 'interaction', details);
    }
  };
}

export default usageAnalytics;