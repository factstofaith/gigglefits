/**
 * Usage Analytics System
 * 
 * Comprehensive analytics system for tracking component usage,
 * feature usage, user flows, and generating reports.
 */

const fs = require('fs');
const path = require('path');

// Default configuration for usage analytics
const defaultConfig = {
  // Enable/disable analytics collection
  enabled: true,
  // Components to track specifically
  components: '*', // '*' means all components
  // Features to track specifically
  features: '*', // '*' means all features
  // Track user flows
  trackFlows: true,
  // Maximum events to store in memory
  maxEvents: 10000,
  // Maximum user flows to store in memory
  maxFlows: 1000,
  // Directory to store analytics reports
  reportsDir: 'usage-reports',
  // Enable detailed logging
  verbose: false,
  // Sampling rate (percentage of sessions to track)
  samplingRate: 100,
  // Anonymize user data
  anonymize: true,
  // Retention period in days
  retentionPeriod: 90
};

/**
 * Initialize the usage analytics system
 * 
 * @param {Object} customConfig - Custom configuration to override defaults
 * @returns {Object} Analytics API
 */
function initializeAnalytics(customConfig = {}) {
  // Merge default and custom configurations
  const config = { ...defaultConfig, ...customConfig };
  
  // Check if analytics is enabled
  if (!config.enabled) {
    return {
      trackComponentUsage: () => {},
      trackFeatureUsage: () => {},
      startUserFlow: () => {},
      continueUserFlow: () => {},
      completeUserFlow: () => {},
      abandonUserFlow: () => {},
      generateReport: () => 'Analytics disabled',
      saveReport: () => null,
      clearAnalytics: () => {}
    };
  }
  
  // State to store analytics data
  const analytics = {
    componentUsage: {},
    featureUsage: {},
    userFlows: {},
    activeFlows: {},
    events: []
  };
  
  /**
   * Track component usage
   * 
   * @param {string} componentName - Component name
   * @param {Object} properties - Component properties
   * @param {Object} context - Usage context
   * @returns {string} Event ID
   */
  function trackComponentUsage(componentName, properties = {}, context = {}) {
    // Apply sampling rate
    if (Math.random() * 100 > config.samplingRate) {
      return null;
    }
    
    // Check if we should track this component
    if (config.components !== '*' && !config.components.includes(componentName)) {
      return null;
    }
    
    // Initialize component tracking if it doesn't exist
    if (!analytics.componentUsage[componentName]) {
      analytics.componentUsage[componentName] = {
        renders: 0,
        uniqueUsers: new Set(),
        propertyUsage: {},
        timestamps: []
      };
    }
    
    // Track component usage
    const component = analytics.componentUsage[componentName];
    component.renders++;
    component.timestamps.push(Date.now());
    
    // Track unique users
    const userId = context.userId || 'anonymous';
    if (userId) {
      component.uniqueUsers.add(config.anonymize ? hashUserId(userId) : userId);
    }
    
    // Track property usage
    Object.entries(properties).forEach(([key, value]) => {
      if (!component.propertyUsage[key]) {
        component.propertyUsage[key] = {};
      }
      
      const valueStr = String(value);
      if (!component.propertyUsage[key][valueStr]) {
        component.propertyUsage[key][valueStr] = 0;
      }
      
      component.propertyUsage[key][valueStr]++;
    });
    
    // Create event record
    const eventId = generateEventId();
    const event = {
      id: eventId,
      type: 'component_usage',
      componentName,
      properties: config.anonymize ? anonymizeProperties(properties) : properties,
      context: config.anonymize ? anonymizeContext(context) : context,
      timestamp: Date.now()
    };
    
    // Add to events log
    addEvent(event);
    
    // Log if verbose
    if (config.verbose) {
      console.log(`Component usage tracked: ${componentName}`);
    }
    
    return eventId;
  }
  
  /**
   * Track feature usage
   * 
   * @param {string} featureName - Feature name
   * @param {string} action - Action performed
   * @param {Object} properties - Feature properties
   * @param {Object} context - Usage context
   * @returns {string} Event ID
   */
  function trackFeatureUsage(featureName, action, properties = {}, context = {}) {
    // Apply sampling rate
    if (Math.random() * 100 > config.samplingRate) {
      return null;
    }
    
    // Check if we should track this feature
    if (config.features !== '*' && !config.features.includes(featureName)) {
      return null;
    }
    
    // Initialize feature tracking if it doesn't exist
    if (!analytics.featureUsage[featureName]) {
      analytics.featureUsage[featureName] = {
        totalUsage: 0,
        uniqueUsers: new Set(),
        actions: {},
        timestamps: []
      };
    }
    
    // Track feature usage
    const feature = analytics.featureUsage[featureName];
    feature.totalUsage++;
    feature.timestamps.push(Date.now());
    
    // Track action usage
    if (!feature.actions[action]) {
      feature.actions[action] = 0;
    }
    feature.actions[action]++;
    
    // Track unique users
    const userId = context.userId || 'anonymous';
    if (userId) {
      feature.uniqueUsers.add(config.anonymize ? hashUserId(userId) : userId);
    }
    
    // Create event record
    const eventId = generateEventId();
    const event = {
      id: eventId,
      type: 'feature_usage',
      featureName,
      action,
      properties: config.anonymize ? anonymizeProperties(properties) : properties,
      context: config.anonymize ? anonymizeContext(context) : context,
      timestamp: Date.now()
    };
    
    // Add to events log
    addEvent(event);
    
    // Log if verbose
    if (config.verbose) {
      console.log(`Feature usage tracked: ${featureName} (${action})`);
    }
    
    return eventId;
  }
  
  /**
   * Start tracking a user flow
   * 
   * @param {string} flowName - Flow name
   * @param {Object} context - Flow context
   * @returns {string} Flow ID
   */
  function startUserFlow(flowName, context = {}) {
    // Check if we should track flows
    if (!config.trackFlows) {
      return null;
    }
    
    // Apply sampling rate
    if (Math.random() * 100 > config.samplingRate) {
      return null;
    }
    
    // Generate flow ID
    const flowId = generateFlowId();
    
    // Create flow record
    const flow = {
      id: flowId,
      name: flowName,
      startTime: Date.now(),
      endTime: null,
      steps: [],
      status: 'active',
      duration: null,
      context: config.anonymize ? anonymizeContext(context) : context
    };
    
    // Store flow
    analytics.activeFlows[flowId] = flow;
    
    // Create event record
    const event = {
      id: generateEventId(),
      type: 'flow_start',
      flowId,
      flowName,
      context: config.anonymize ? anonymizeContext(context) : context,
      timestamp: Date.now()
    };
    
    // Add to events log
    addEvent(event);
    
    // Log if verbose
    if (config.verbose) {
      console.log(`User flow started: ${flowName} (${flowId})`);
    }
    
    return flowId;
  }
  
  /**
   * Continue tracking a user flow (add a step)
   * 
   * @param {string} flowId - Flow ID
   * @param {string} stepName - Step name
   * @param {Object} properties - Step properties
   * @returns {boolean} Success status
   */
  function continueUserFlow(flowId, stepName, properties = {}) {
    // Check if flow exists and is active
    if (!analytics.activeFlows[flowId]) {
      if (config.verbose) {
        console.warn(`Cannot continue flow: ${flowId} not found or already completed`);
      }
      return false;
    }
    
    // Add step to flow
    const flow = analytics.activeFlows[flowId];
    const step = {
      name: stepName,
      properties: config.anonymize ? anonymizeProperties(properties) : properties,
      timestamp: Date.now()
    };
    
    flow.steps.push(step);
    
    // Create event record
    const event = {
      id: generateEventId(),
      type: 'flow_step',
      flowId,
      flowName: flow.name,
      stepName,
      properties: config.anonymize ? anonymizeProperties(properties) : properties,
      timestamp: Date.now()
    };
    
    // Add to events log
    addEvent(event);
    
    // Log if verbose
    if (config.verbose) {
      console.log(`User flow step added: ${flowId} - ${stepName}`);
    }
    
    return true;
  }
  
  /**
   * Complete a user flow
   * 
   * @param {string} flowId - Flow ID
   * @param {Object} result - Flow result
   * @returns {boolean} Success status
   */
  function completeUserFlow(flowId, result = {}) {
    // Check if flow exists and is active
    if (!analytics.activeFlows[flowId]) {
      if (config.verbose) {
        console.warn(`Cannot complete flow: ${flowId} not found or already completed`);
      }
      return false;
    }
    
    // Complete flow
    const flow = analytics.activeFlows[flowId];
    flow.endTime = Date.now();
    flow.duration = flow.endTime - flow.startTime;
    flow.status = 'completed';
    flow.result = config.anonymize ? anonymizeProperties(result) : result;
    
    // Move from active to completed flows
    analytics.userFlows[flowId] = flow;
    delete analytics.activeFlows[flowId];
    
    // Enforce max flows limit
    if (Object.keys(analytics.userFlows).length > config.maxFlows) {
      // Remove oldest flow
      const oldestFlowId = Object.keys(analytics.userFlows).sort((a, b) => {
        return analytics.userFlows[a].startTime - analytics.userFlows[b].startTime;
      })[0];
      
      delete analytics.userFlows[oldestFlowId];
    }
    
    // Create event record
    const event = {
      id: generateEventId(),
      type: 'flow_complete',
      flowId,
      flowName: flow.name,
      duration: flow.duration,
      steps: flow.steps.length,
      result: config.anonymize ? anonymizeProperties(result) : result,
      timestamp: Date.now()
    };
    
    // Add to events log
    addEvent(event);
    
    // Log if verbose
    if (config.verbose) {
      console.log(`User flow completed: ${flowId} in ${flow.duration}ms with ${flow.steps.length} steps`);
    }
    
    return true;
  }
  
  /**
   * Abandon a user flow
   * 
   * @param {string} flowId - Flow ID
   * @param {string} reason - Abandonment reason
   * @returns {boolean} Success status
   */
  function abandonUserFlow(flowId, reason = 'unspecified') {
    // Check if flow exists and is active
    if (!analytics.activeFlows[flowId]) {
      if (config.verbose) {
        console.warn(`Cannot abandon flow: ${flowId} not found or already completed`);
      }
      return false;
    }
    
    // Abandon flow
    const flow = analytics.activeFlows[flowId];
    flow.endTime = Date.now();
    flow.duration = flow.endTime - flow.startTime;
    flow.status = 'abandoned';
    flow.abandonReason = reason;
    
    // Move from active to completed flows
    analytics.userFlows[flowId] = flow;
    delete analytics.activeFlows[flowId];
    
    // Enforce max flows limit
    if (Object.keys(analytics.userFlows).length > config.maxFlows) {
      // Remove oldest flow
      const oldestFlowId = Object.keys(analytics.userFlows).sort((a, b) => {
        return analytics.userFlows[a].startTime - analytics.userFlows[b].startTime;
      })[0];
      
      delete analytics.userFlows[oldestFlowId];
    }
    
    // Create event record
    const event = {
      id: generateEventId(),
      type: 'flow_abandon',
      flowId,
      flowName: flow.name,
      duration: flow.duration,
      steps: flow.steps.length,
      reason,
      timestamp: Date.now()
    };
    
    // Add to events log
    addEvent(event);
    
    // Log if verbose
    if (config.verbose) {
      console.log(`User flow abandoned: ${flowId} after ${flow.duration}ms with ${flow.steps.length} steps (${reason})`);
    }
    
    return true;
  }
  
  /**
   * Generate component usage metrics
   * 
   * @returns {Object} Component usage metrics
   */
  function generateComponentMetrics() {
    const metrics = {};
    
    Object.entries(analytics.componentUsage).forEach(([componentName, data]) => {
      metrics[componentName] = {
        renders: data.renders,
        uniqueUsers: data.uniqueUsers.size,
        // Calculate popularity score based on renders and unique users
        popularityScore: calculatePopularityScore(data.renders, data.uniqueUsers.size),
        // Analyze property usage patterns
        propertyUsage: summarizePropertyUsage(data.propertyUsage),
        // Calculate temporal patterns
        timeDistribution: calculateTimeDistribution(data.timestamps),
        // Most recent usage
        lastUsed: Math.max(...data.timestamps)
      };
    });
    
    return metrics;
  }
  
  /**
   * Generate feature usage metrics
   * 
   * @returns {Object} Feature usage metrics
   */
  function generateFeatureMetrics() {
    const metrics = {};
    
    Object.entries(analytics.featureUsage).forEach(([featureName, data]) => {
      metrics[featureName] = {
        totalUsage: data.totalUsage,
        uniqueUsers: data.uniqueUsers.size,
        // Calculate popularity score based on usage and unique users
        popularityScore: calculatePopularityScore(data.totalUsage, data.uniqueUsers.size),
        // Action breakdown
        actions: { ...data.actions },
        // Calculate temporal patterns
        timeDistribution: calculateTimeDistribution(data.timestamps),
        // Most recent usage
        lastUsed: Math.max(...data.timestamps)
      };
    });
    
    return metrics;
  }
  
  /**
   * Generate user flow metrics
   * 
   * @returns {Object} User flow metrics
   */
  function generateFlowMetrics() {
    const metrics = {
      flows: {},
      summary: {
        totalFlows: 0,
        completedFlows: 0,
        abandonedFlows: 0,
        avgDuration: 0,
        avgSteps: 0,
        completionRate: 0
      }
    };
    
    // Combine active and completed flows
    const allFlows = { ...analytics.userFlows };
    
    // Count total flows
    metrics.summary.totalFlows = Object.keys(allFlows).length;
    
    if (metrics.summary.totalFlows === 0) {
      return metrics;
    }
    
    // Calculate metrics for each flow type
    const flowsByName = {};
    let totalDuration = 0;
    let totalSteps = 0;
    
    Object.values(allFlows).forEach(flow => {
      // Update summary metrics
      if (flow.status === 'completed') {
        metrics.summary.completedFlows++;
      } else if (flow.status === 'abandoned') {
        metrics.summary.abandonedFlows++;
      }
      
      if (flow.duration) {
        totalDuration += flow.duration;
      }
      
      totalSteps += flow.steps.length;
      
      // Group flows by name
      if (!flowsByName[flow.name]) {
        flowsByName[flow.name] = {
          total: 0,
          completed: 0,
          abandoned: 0,
          durations: [],
          steps: []
        };
      }
      
      flowsByName[flow.name].total++;
      
      if (flow.status === 'completed') {
        flowsByName[flow.name].completed++;
      } else if (flow.status === 'abandoned') {
        flowsByName[flow.name].abandoned++;
      }
      
      if (flow.duration) {
        flowsByName[flow.name].durations.push(flow.duration);
      }
      
      flowsByName[flow.name].steps.push(flow.steps.length);
    });
    
    // Calculate averages for summary
    metrics.summary.avgDuration = totalDuration / metrics.summary.totalFlows;
    metrics.summary.avgSteps = totalSteps / metrics.summary.totalFlows;
    metrics.summary.completionRate = metrics.summary.completedFlows / metrics.summary.totalFlows;
    
    // Calculate metrics for each flow type
    Object.entries(flowsByName).forEach(([flowName, data]) => {
      metrics.flows[flowName] = {
        total: data.total,
        completed: data.completed,
        abandoned: data.abandoned,
        completionRate: data.completed / data.total,
        avgDuration: data.durations.length > 0 
          ? data.durations.reduce((sum, d) => sum + d, 0) / data.durations.length 
          : 0,
        avgSteps: data.steps.length > 0 
          ? data.steps.reduce((sum, s) => sum + s, 0) / data.steps.length 
          : 0,
        // Analyze drop-off points
        dropOffPoints: analyzeDropOffPoints(flowName, allFlows)
      };
    });
    
    return metrics;
  }
  
  /**
   * Analyze drop-off points for a specific flow
   * 
   * @param {string} flowName - Flow name
   * @param {Object} flows - All flows
   * @returns {Object} Drop-off points
   */
  function analyzeDropOffPoints(flowName, flows) {
    const dropOffPoints = {};
    
    // Get all abandoned flows of this type
    const abandonedFlows = Object.values(flows).filter(flow => 
      flow.name === flowName && flow.status === 'abandoned');
    
    if (abandonedFlows.length === 0) {
      return {};
    }
    
    // Count last step of each abandoned flow
    abandonedFlows.forEach(flow => {
      const lastStep = flow.steps.length > 0 
        ? flow.steps[flow.steps.length - 1].name 
        : 'start';
      
      if (!dropOffPoints[lastStep]) {
        dropOffPoints[lastStep] = 0;
      }
      
      dropOffPoints[lastStep]++;
    });
    
    // Calculate percentage of total abandonments
    Object.keys(dropOffPoints).forEach(step => {
      dropOffPoints[step] = {
        count: dropOffPoints[step],
        percentage: dropOffPoints[step] / abandonedFlows.length
      };
    });
    
    return dropOffPoints;
  }
  
  /**
   * Calculate popularity score
   * 
   * @param {number} totalUses - Total usage count
   * @param {number} uniqueUsers - Number of unique users
   * @returns {number} Popularity score (0-100)
   */
  function calculatePopularityScore(totalUses, uniqueUsers) {
    // Simple formula for popularity score
    // Combine total usage and unique user count (weighted)
    const usageScore = Math.min(totalUses / 100, 1) * 50; // Cap at 50% of total score
    const userScore = Math.min(uniqueUsers / 20, 1) * 50; // Cap at 50% of total score
    
    return Math.round(usageScore + userScore);
  }
  
  /**
   * Summarize property usage patterns
   * 
   * @param {Object} propertyUsage - Property usage data
   * @returns {Object} Summarized property usage
   */
  function summarizePropertyUsage(propertyUsage) {
    const summary = {};
    
    Object.entries(propertyUsage).forEach(([property, values]) => {
      // Convert values to frequency distribution
      const total = Object.values(values).reduce((sum, count) => sum + count, 0);
      
      summary[property] = {
        total,
        values: {},
        mostCommon: null,
        mostCommonPercentage: 0
      };
      
      // Calculate percentages and find most common value
      let maxCount = 0;
      let maxValue = null;
      
      Object.entries(values).forEach(([value, count]) => {
        const percentage = count / total;
        summary[property].values[value] = {
          count,
          percentage
        };
        
        if (count > maxCount) {
          maxCount = count;
          maxValue = value;
        }
      });
      
      summary[property].mostCommon = maxValue;
      summary[property].mostCommonPercentage = maxCount / total;
    });
    
    return summary;
  }
  
  /**
   * Calculate time distribution of events
   * 
   * @param {Array<number>} timestamps - Array of timestamps
   * @returns {Object} Time distribution
   */
  function calculateTimeDistribution(timestamps) {
    if (timestamps.length === 0) {
      return {};
    }
    
    // Group by hour of day
    const hourDistribution = Array(24).fill(0);
    // Group by day of week (0 = Sunday, 6 = Saturday)
    const dayDistribution = Array(7).fill(0);
    // Group by time periods
    const periods = {
      last24h: 0,
      last7d: 0,
      last30d: 0,
      older: 0
    };
    
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    
    timestamps.forEach(timestamp => {
      // Hour of day
      const date = new Date(timestamp);
      const hour = date.getHours();
      const day = date.getDay();
      
      hourDistribution[hour]++;
      dayDistribution[day]++;
      
      // Time periods
      const age = now - timestamp;
      
      if (age < day) {
        periods.last24h++;
      } else if (age < 7 * day) {
        periods.last7d++;
      } else if (age < 30 * day) {
        periods.last30d++;
      } else {
        periods.older++;
      }
    });
    
    return {
      hourOfDay: hourDistribution,
      dayOfWeek: dayDistribution,
      periods
    };
  }
  
  /**
   * Hash user ID for anonymization
   * 
   * @param {string} userId - User ID
   * @returns {string} Hashed user ID
   */
  function hashUserId(userId) {
    // Simple hash function for demo purposes
    // In a real system, use a proper cryptographic hash
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash &= hash; // Convert to 32bit integer
    }
    return 'user_' + Math.abs(hash).toString(36);
  }
  
  /**
   * Anonymize properties object
   * 
   * @param {Object} properties - Properties object
   * @returns {Object} Anonymized properties
   */
  function anonymizeProperties(properties) {
    const anonymized = { ...properties };
    
    // Remove potentially identifying information
    const sensitiveFields = ['email', 'name', 'phone', 'address', 'user', 'id', 'account'];
    
    Object.keys(anonymized).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        anonymized[key] = '[REDACTED]';
      }
    });
    
    return anonymized;
  }
  
  /**
   * Anonymize context object
   * 
   * @param {Object} context - Context object
   * @returns {Object} Anonymized context
   */
  function anonymizeContext(context) {
    const anonymized = { ...context };
    
    // Anonymize user ID
    if (anonymized.userId) {
      anonymized.userId = hashUserId(anonymized.userId);
    }
    
    // Remove IP address
    if (anonymized.ip) {
      anonymized.ip = '[REDACTED]';
    }
    
    // Anonymize other potentially identifying information
    const sensitiveFields = ['email', 'name', 'phone', 'address', 'user', 'account'];
    
    Object.keys(anonymized).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        anonymized[key] = '[REDACTED]';
      }
    });
    
    return anonymized;
  }
  
  /**
   * Generate a unique event ID
   * 
   * @returns {string} Unique event ID
   */
  function generateEventId() {
    return 'event_' + Date.now().toString(36) + '_' + 
      Math.random().toString(36).substring(2, 10);
  }
  
  /**
   * Generate a unique flow ID
   * 
   * @returns {string} Unique flow ID
   */
  function generateFlowId() {
    return 'flow_' + Date.now().toString(36) + '_' + 
      Math.random().toString(36).substring(2, 10);
  }
  
  /**
   * Add event to events log
   * 
   * @param {Object} event - Event object
   */
  function addEvent(event) {
    analytics.events.push(event);
    
    // Enforce max events limit
    if (analytics.events.length > config.maxEvents) {
      analytics.events.shift();
    }
  }
  
  /**
   * Generate an analytics report
   * 
   * @param {string} format - Output format (json, html, console)
   * @returns {string} Formatted report
   */
  function generateReport(format = 'json') {
    const metrics = {
      components: generateComponentMetrics(),
      features: generateFeatureMetrics(),
      flows: generateFlowMetrics(),
      timestamp: Date.now()
    };
    
    switch (format) {
      case 'json':
        return JSON.stringify({
          metrics,
          config,
          timestamp: Date.now()
        }, null, 2);
        
      case 'html':
        return generateHtmlReport(metrics);
        
      case 'console':
      default:
        return generateConsoleReport(metrics);
    }
  }
  
  /**
   * Generate an HTML analytics report
   * 
   * @param {Object} metrics - Analytics metrics
   * @returns {string} HTML report
   */
  function generateHtmlReport(metrics) {
    // Simplified HTML report template
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Usage Analytics Report - ${new Date().toISOString()}</title>
      <style>
        body { font-family: system-ui, sans-serif; line-height: 1.5; max-width: 1200px; margin: 0 auto; padding: 2rem; }
        h1, h2, h3 { color: #333; }
        .card { background: #f9f9f9; border-radius: 4px; padding: 1rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #eee; }
        th { background: #f5f5f5; }
        .progress { background-color: #eee; height: 10px; border-radius: 10px; overflow: hidden; }
        .progress-bar { background-color: #4caf50; height: 100%; }
      </style>
    </head>
    <body>
      <h1>Usage Analytics Report</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      
      <h2>Component Usage</h2>
      <div class="card">
        <table>
          <tr>
            <th>Component</th>
            <th>Renders</th>
            <th>Unique Users</th>
            <th>Popularity</th>
            <th>Last Used</th>
          </tr>
          ${Object.entries(metrics.components)
            .sort((a, b) => b[1].popularityScore - a[1].popularityScore)
            .map(([name, data]) => `
            <tr>
              <td>${name}</td>
              <td>${data.renders}</td>
              <td>${data.uniqueUsers}</td>
              <td>
                <div class="progress">
                  <div class="progress-bar" style="width: ${data.popularityScore}%"></div>
                </div>
                ${data.popularityScore}%
              </td>
              <td>${new Date(data.lastUsed).toLocaleString()}</td>
            </tr>
            `).join('')}
        </table>
      </div>
      
      <h2>Feature Usage</h2>
      <div class="card">
        <table>
          <tr>
            <th>Feature</th>
            <th>Total Usage</th>
            <th>Unique Users</th>
            <th>Popularity</th>
            <th>Last Used</th>
          </tr>
          ${Object.entries(metrics.features)
            .sort((a, b) => b[1].popularityScore - a[1].popularityScore)
            .map(([name, data]) => `
            <tr>
              <td>${name}</td>
              <td>${data.totalUsage}</td>
              <td>${data.uniqueUsers}</td>
              <td>
                <div class="progress">
                  <div class="progress-bar" style="width: ${data.popularityScore}%"></div>
                </div>
                ${data.popularityScore}%
              </td>
              <td>${new Date(data.lastUsed).toLocaleString()}</td>
            </tr>
            `).join('')}
        </table>
      </div>
      
      <h2>User Flows</h2>
      <div class="card">
        <h3>Summary</h3>
        <p>Total Flows: ${metrics.flows.summary.totalFlows}</p>
        <p>Completed Flows: ${metrics.flows.summary.completedFlows} (${(metrics.flows.summary.completionRate * 100).toFixed(1)}% completion rate)</p>
        <p>Abandoned Flows: ${metrics.flows.summary.abandonedFlows}</p>
        <p>Average Duration: ${(metrics.flows.summary.avgDuration / 1000).toFixed(2)} seconds</p>
        <p>Average Steps: ${metrics.flows.summary.avgSteps.toFixed(1)}</p>
        
        <h3>Flow Details</h3>
        <table>
          <tr>
            <th>Flow</th>
            <th>Total</th>
            <th>Completion Rate</th>
            <th>Avg. Duration</th>
            <th>Avg. Steps</th>
          </tr>
          ${Object.entries(metrics.flows.flows || {})
            .map(([name, data]) => `
            <tr>
              <td>${name}</td>
              <td>${data.total}</td>
              <td>
                <div class="progress">
                  <div class="progress-bar" style="width: ${(data.completionRate * 100)}%"></div>
                </div>
                ${(data.completionRate * 100).toFixed(1)}%
              </td>
              <td>${(data.avgDuration / 1000).toFixed(2)} seconds</td>
              <td>${data.avgSteps.toFixed(1)}</td>
            </tr>
            `).join('')}
        </table>
      </div>
    </body>
    </html>
    `;
  }
  
  /**
   * Generate a console-friendly analytics report
   * 
   * @param {Object} metrics - Analytics metrics
   * @returns {string} Console report
   */
  function generateConsoleReport(metrics) {
    let report = '\n=== USAGE ANALYTICS REPORT ===\n';
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    // Component Usage
    report += 'COMPONENT USAGE:\n';
    report += '-----------------\n';
    Object.entries(metrics.components)
      .sort((a, b) => b[1].popularityScore - a[1].popularityScore)
      .forEach(([name, data]) => {
        report += `${name}:\n`;
        report += `  Renders: ${data.renders}\n`;
        report += `  Unique Users: ${data.uniqueUsers}\n`;
        report += `  Popularity: ${data.popularityScore}%\n`;
        report += `  Last Used: ${new Date(data.lastUsed).toLocaleString()}\n`;
      });
    report += '\n';
    
    // Feature Usage
    report += 'FEATURE USAGE:\n';
    report += '--------------\n';
    Object.entries(metrics.features)
      .sort((a, b) => b[1].popularityScore - a[1].popularityScore)
      .forEach(([name, data]) => {
        report += `${name}:\n`;
        report += `  Total Usage: ${data.totalUsage}\n`;
        report += `  Unique Users: ${data.uniqueUsers}\n`;
        report += `  Popularity: ${data.popularityScore}%\n`;
        report += `  Actions: ${Object.entries(data.actions).map(([action, count]) => `${action}=${count}`).join(', ')}\n`;
        report += `  Last Used: ${new Date(data.lastUsed).toLocaleString()}\n`;
      });
    report += '\n';
    
    // User Flows
    report += 'USER FLOWS:\n';
    report += '-----------\n';
    report += `Total Flows: ${metrics.flows.summary.totalFlows}\n`;
    report += `Completed Flows: ${metrics.flows.summary.completedFlows} (${(metrics.flows.summary.completionRate * 100).toFixed(1)}% completion rate)\n`;
    report += `Abandoned Flows: ${metrics.flows.summary.abandonedFlows}\n`;
    report += `Average Duration: ${(metrics.flows.summary.avgDuration / 1000).toFixed(2)} seconds\n`;
    report += `Average Steps: ${metrics.flows.summary.avgSteps.toFixed(1)}\n\n`;
    
    // Flow Details
    Object.entries(metrics.flows.flows || {}).forEach(([name, data]) => {
      report += `${name}:\n`;
      report += `  Total: ${data.total}\n`;
      report += `  Completion Rate: ${(data.completionRate * 100).toFixed(1)}%\n`;
      report += `  Average Duration: ${(data.avgDuration / 1000).toFixed(2)} seconds\n`;
      report += `  Average Steps: ${data.avgSteps.toFixed(1)}\n`;
      
      // Drop-off points
      if (Object.keys(data.dropOffPoints).length > 0) {
        report += `  Drop-off Points:\n`;
        Object.entries(data.dropOffPoints).forEach(([step, stats]) => {
          report += `    ${step}: ${stats.count} (${(stats.percentage * 100).toFixed(1)}%)\n`;
        });
      }
      
      report += '\n';
    });
    
    return report;
  }
  
  /**
   * Save the analytics report to a file
   * 
   * @param {string} format - Output format (json, html, console)
   * @returns {string} Path to the saved report
   */
  function saveReport(format = 'json') {
    const report = generateReport(format);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = format === 'html' ? 'html' : format === 'json' ? 'json' : 'txt';
    const reportsDir = path.resolve(config.reportsDir);
    
    // Create reports directory if it doesn't exist
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const filePath = path.join(reportsDir, `usage-report-${timestamp}.${extension}`);
    fs.writeFileSync(filePath, report);
    
    console.log(`Usage analytics report saved to: ${filePath}`);
    return filePath;
  }
  
  /**
   * Clear all analytics data
   */
  function clearAnalytics() {
    analytics.componentUsage = {};
    analytics.featureUsage = {};
    analytics.userFlows = {};
    analytics.activeFlows = {};
    analytics.events = [];
    
    console.log('Analytics data cleared');
  }
  
  // Return public API
  return {
    trackComponentUsage,
    trackFeatureUsage,
    startUserFlow,
    continueUserFlow,
    completeUserFlow,
    abandonUserFlow,
    generateReport,
    saveReport,
    clearAnalytics,
    // Expose for testing/debugging
    __getAnalytics: () => ({ ...analytics }),
    __getConfig: () => ({ ...config })
  };
}

/**
 * Track usage of the application
 * 
 * @param {Object} options - Usage tracking options
 * @returns {Object} Tracking results
 */
function trackUsage(options = {}) {
  console.log('Running usage analytics...');
  
  const analytics = initializeAnalytics({
    verbose: options.detailed || false,
    reportsDir: options.outputDir || 'usage-reports',
    anonymize: options.anonymize !== false // Default to true unless explicitly set to false
  });
  
  // Generate some sample data for demo/testing purposes
  generateSampleData(analytics);
  
  // Generate and save report
  const reportPath = analytics.saveReport(options.outputFormat || 'console');
  
  return {
    reportPath,
    hasData: true
  };
}

/**
 * Generate sample analytics data for testing
 * 
 * @param {Object} analytics - Analytics instance
 */
function generateSampleData(analytics) {
  // Sample user contexts
  const users = [
    { userId: 'user1', role: 'admin', sessionId: 's1' },
    { userId: 'user2', role: 'user', sessionId: 's2' },
    { userId: 'user3', role: 'user', sessionId: 's3' }
  ];
  
  // Sample component usage
  const componentUsage = [
    { name: 'Button', props: { variant: 'primary', size: 'medium' }, user: users[0] },
    { name: 'Button', props: { variant: 'secondary', size: 'small' }, user: users[1] },
    { name: 'Button', props: { variant: 'primary', size: 'large' }, user: users[2] },
    { name: 'Button', props: { variant: 'primary', size: 'medium' }, user: users[0] },
    { name: 'TextField', props: { variant: 'outlined', disabled: false }, user: users[0] },
    { name: 'TextField', props: { variant: 'filled', disabled: false }, user: users[1] },
    { name: 'Checkbox', props: { checked: true, disabled: false }, user: users[2] },
    { name: 'Dialog', props: { open: true, fullScreen: false }, user: users[0] },
    { name: 'DataGrid', props: { rowCount: 100, pageSize: 25 }, user: users[1] },
    { name: 'DataGrid', props: { rowCount: 500, pageSize: 50 }, user: users[2] },
    { name: 'Tabs', props: { value: 0, orientation: 'horizontal' }, user: users[0] },
    { name: 'Card', props: { elevation: 1 }, user: users[1] }
  ];
  
  // Track component usage
  componentUsage.forEach(component => {
    analytics.trackComponentUsage(
      component.name, 
      component.props, 
      component.user
    );
  });
  
  // Sample feature usage
  const featureUsage = [
    { name: 'Search', action: 'execute', props: { query: 'test' }, user: users[0] },
    { name: 'Search', action: 'execute', props: { query: 'data' }, user: users[1] },
    { name: 'Search', action: 'execute', props: { query: 'integration' }, user: users[2] },
    { name: 'Search', action: 'clear', props: {}, user: users[0] },
    { name: 'Filter', action: 'apply', props: { field: 'date' }, user: users[1] },
    { name: 'Filter', action: 'reset', props: {}, user: users[1] },
    { name: 'Export', action: 'csv', props: { rows: 100 }, user: users[0] },
    { name: 'Export', action: 'pdf', props: { rows: 50 }, user: users[2] },
    { name: 'ThemeToggle', action: 'dark', props: {}, user: users[0] },
    { name: 'ThemeToggle', action: 'light', props: {}, user: users[1] }
  ];
  
  // Track feature usage
  featureUsage.forEach(feature => {
    analytics.trackFeatureUsage(
      feature.name, 
      feature.action, 
      feature.props, 
      feature.user
    );
  });
  
  // Sample user flows
  const flows = [
    {
      name: 'UserOnboarding',
      steps: ['signup', 'profile', 'tutorial', 'complete'],
      result: { success: true },
      user: users[0]
    },
    {
      name: 'UserOnboarding',
      steps: ['signup', 'profile'],
      abandoned: true,
      reason: 'timeout',
      user: users[1]
    },
    {
      name: 'DataImport',
      steps: ['select_file', 'configure', 'validate', 'import'],
      result: { success: true, rowsImported: 120 },
      user: users[0]
    },
    {
      name: 'DataImport',
      steps: ['select_file', 'configure', 'validate'],
      abandoned: true,
      reason: 'validation_error',
      user: users[2]
    },
    {
      name: 'CreateIntegration',
      steps: ['select_type', 'configure_source', 'configure_destination', 'scheduling', 'activate'],
      result: { success: true, integrationId: 123 },
      user: users[0]
    }
  ];
  
  // Track user flows
  flows.forEach(flow => {
    const flowId = analytics.startUserFlow(flow.name, flow.user);
    
    flow.steps.forEach(step => {
      analytics.continueUserFlow(flowId, step, { timestamp: Date.now() });
    });
    
    if (flow.abandoned) {
      analytics.abandonUserFlow(flowId, flow.reason);
    } else {
      analytics.completeUserFlow(flowId, flow.result);
    }
  });
}

module.exports = { initializeAnalytics, trackUsage };