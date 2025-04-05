/**
 * Graceful shutdown handler for frontend development server
 * in containerized environments
 */

const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Store active connections and resources
const resources = {
  webSocketServer: null,
  webSocketConnections: new Set(),
  httpServer: null,
  timeouts: [],
  intervals: [],
  cleanupHandlers: new Map()
};

// Configuration
const MAX_SHUTDOWN_TIME = process.env.GRACEFUL_SHUTDOWN_TIMEOUT_MS || 10000;

/**
 * Register a resource for cleanup
 * @param {string} name - Unique name for the resource
 * @param {Function} cleanupFn - Function to clean up the resource
 */
function registerCleanup(name, cleanupFn) {
  if (typeof cleanupFn !== 'function') {
    console.warn(`Invalid cleanup handler for ${name}: not a function`);
    return;
  }
  
  resources.cleanupHandlers.set(name, cleanupFn);
  console.log(`Registered cleanup handler: ${name}`);
}

/**
 * Register a WebSocket server for cleanup
 * @param {WebSocket.Server} wss - WebSocket server instance
 */
function registerWebSocketServer(wss) {
  if (!wss || typeof wss.close !== 'function') {
    console.warn('Invalid WebSocket server');
    return;
  }

  resources.webSocketServer = wss;
  
  // Track connections
  wss.on('connection', (ws) => {
    resources.webSocketConnections.add(ws);
    
    ws.on('close', () => {
      resources.webSocketConnections.delete(ws);
    });
  });
  
  console.log('Registered WebSocket server for cleanup');
}

/**
 * Register HTTP server for cleanup
 * @param {http.Server} server - HTTP server instance
 */
function registerHttpServer(server) {
  if (!server || typeof server.close !== 'function') {
    console.warn('Invalid HTTP server');
    return;
  }
  
  resources.httpServer = server;
  console.log('Registered HTTP server for cleanup');
}

/**
 * Track a timeout for cleanup
 * @param {number} timeoutId - Timeout ID from setTimeout
 */
function trackTimeout(timeoutId) {
  resources.timeouts.push(timeoutId);
}

/**
 * Track an interval for cleanup
 * @param {number} intervalId - Interval ID from setInterval
 */
function trackInterval(intervalId) {
  resources.intervals.push(intervalId);
}

/**
 * Perform graceful shutdown
 */
function performShutdown() {
  console.log('Starting graceful shutdown...');
  
  // Force exit after timeout
  const forceExitTimeout = setTimeout(() => {
    console.error(`Graceful shutdown timed out after ${MAX_SHUTDOWN_TIME}ms. Forcing exit.`);
    process.exit(1);
  }, MAX_SHUTDOWN_TIME);
  
  // Track this timeout separately so it doesn't get cleared
  const cleanupPromises = [];
  
  // Close WebSocket connections
  if (resources.webSocketServer) {
    const wssPromise = new Promise((resolve) => {
      console.log(`Closing WebSocket server (${resources.webSocketConnections.size} active connections)`);
      
      // Close all connections
      resources.webSocketConnections.forEach((ws) => {
        try {
          ws.terminate();
        } catch (err) {
          console.error('Error terminating WebSocket connection:', err);
        }
      });
      
      // Close the server
      resources.webSocketServer.close(() => {
        console.log('WebSocket server closed');
        resolve();
      });
    });
    
    cleanupPromises.push(wssPromise);
  }
  
  // Close HTTP server
  if (resources.httpServer) {
    const httpPromise = new Promise((resolve) => {
      console.log('Closing HTTP server');
      resources.httpServer.close(() => {
        console.log('HTTP server closed');
        resolve();
      });
    });
    
    cleanupPromises.push(httpPromise);
  }
  
  // Clear all timeouts
  resources.timeouts.forEach((id) => {
    clearTimeout(id);
  });
  console.log(`Cleared ${resources.timeouts.length} timeouts`);
  
  // Clear all intervals
  resources.intervals.forEach((id) => {
    clearInterval(id);
  });
  console.log(`Cleared ${resources.intervals.length} intervals`);
  
  // Run all cleanup handlers
  resources.cleanupHandlers.forEach((cleanupFn, name) => {
    try {
      console.log(`Running cleanup handler: ${name}`);
      const result = cleanupFn();
      
      if (result instanceof Promise) {
        cleanupPromises.push(
          result.catch((err) => {
            console.error(`Error in cleanup handler ${name}:`, err);
          })
        );
      }
    } catch (err) {
      console.error(`Error in cleanup handler ${name}:`, err);
    }
  });
  
  // Wait for all promises to resolve
  Promise.all(cleanupPromises)
    .then(() => {
      console.log('Graceful shutdown completed');
      clearTimeout(forceExitTimeout);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error during graceful shutdown:', err);
      process.exit(1);
    });
}

// Register signal handlers
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal');
  performShutdown();
});

process.on('SIGINT', () => {
  console.log('Received SIGINT signal');
  performShutdown();
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  performShutdown();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
  performShutdown();
});

module.exports = {
  registerCleanup,
  registerWebSocketServer,
  registerHttpServer,
  trackTimeout,
  trackInterval
};