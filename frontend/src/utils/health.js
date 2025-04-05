/**
 * Frontend health check handler
 * Creates an endpoint for health checks in the development server
 */

const os = require('os');
const process = require('process');

// Initial startup time for uptime calculation
const startTime = Date.now();

// Track memory usage metrics
let memoryUsageHistory = [];
const MAX_HISTORY_LENGTH = 10;

// Update memory metrics every minute
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  memoryUsageHistory.push({
    timestamp: Date.now(),
    rss: memoryUsage.rss,
    heapTotal: memoryUsage.heapTotal,
    heapUsed: memoryUsage.heapUsed,
    external: memoryUsage.external,
    arrayBuffers: memoryUsage.arrayBuffers
  });
  
  // Keep history at a reasonable size
  if (memoryUsageHistory.length > MAX_HISTORY_LENGTH) {
    memoryUsageHistory.shift();
  }
}, 60000);

/**
 * Get system information for health check
 * @returns {Object} System information
 */
function getSystemInfo() {
  const memoryUsage = process.memoryUsage();
  
  return {
    hostname: os.hostname(),
    platform: process.platform,
    nodeVersion: process.version,
    uptime: Math.floor((Date.now() - startTime) / 1000),
    processId: process.pid,
    memoryUsage: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
      memoryUsageHistory: memoryUsageHistory
    },
    container: process.env.REACT_APP_RUNNING_IN_DOCKER === 'true'
  };
}

/**
 * Check webpack dev server health
 * @returns {Object} Component health status
 */
function checkWebpackHealth() {
  // In a real implementation, you could check for webpack errors or status
  const isHealthy = true; // Simplified check
  
  return {
    name: 'webpack',
    status: isHealthy ? 'ok' : 'degraded',
    message: isHealthy ? 'Webpack running normally' : 'Webpack experiencing issues',
    details: {
      mode: process.env.NODE_ENV || 'development'
    }
  };
}

/**
 * Check memory health
 * @returns {Object} Component health status
 */
function checkMemoryHealth() {
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  const heapUsagePercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);
  
  // Set thresholds
  const WARNING_THRESHOLD = 80; // 80% of heap used
  const CRITICAL_THRESHOLD = 90; // 90% of heap used
  
  let status = 'ok';
  let message = 'Memory usage normal';
  
  if (heapUsagePercent > CRITICAL_THRESHOLD) {
    status = 'degraded';
    message = `Critical memory usage: ${heapUsagePercent}% of heap used`;
  } else if (heapUsagePercent > WARNING_THRESHOLD) {
    status = 'warning';
    message = `High memory usage: ${heapUsagePercent}% of heap used`;
  }
  
  return {
    name: 'memory',
    status,
    message,
    details: {
      heapUsedMB,
      heapTotalMB,
      heapUsagePercent,
      rssMB: Math.round(memoryUsage.rss / 1024 / 1024)
    }
  };
}

/**
 * Generate the full health check response
 * @returns {Object} Health check response
 */
function getHealthCheckResponse() {
  const components = [
    checkWebpackHealth(),
    checkMemoryHealth()
  ];
  
  // Determine overall status (worst of all components)
  let overallStatus = 'ok';
  for (const component of components) {
    if (component.status === 'degraded') {
      overallStatus = 'degraded';
      break;
    } else if (component.status === 'warning' && overallStatus === 'ok') {
      overallStatus = 'warning';
    }
  }
  
  return {
    status: overallStatus,
    version: process.env.REACT_APP_VERSION || '1.0.0',
    timestamp: Date.now(),
    systemInfo: getSystemInfo(),
    components
  };
}

/**
 * Health check middleware for express
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
function healthCheckMiddleware(req, res) {
  const healthResponse = getHealthCheckResponse();
  
  // Set appropriate HTTP status based on health
  if (healthResponse.status === 'degraded') {
    res.status(503);
  } else {
    res.status(200);
  }
  
  res.json(healthResponse);
}

/**
 * Register health check routes with an express app
 * @param {Object} app - Express app
 */
function registerHealthCheck(app) {
  app.get('/health', healthCheckMiddleware);
}

module.exports = {
  registerHealthCheck,
  getHealthCheckResponse
};
