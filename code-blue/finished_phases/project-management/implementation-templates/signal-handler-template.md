# Signal Handler Implementation Templates

## Python Signal Handler (Backend)

```python
# signal_handlers.py

import os
import sys
import signal
import logging
import time
import threading
from typing import Callable, Dict, Any, Optional
from contextlib import contextmanager

# Configure logger
logger = logging.getLogger(__name__)

# Track registered shutdown handlers
_shutdown_handlers: Dict[str, Callable[[], Any]] = {}
_shutdown_in_progress = threading.Event()
_max_shutdown_time = int(os.environ.get("GRACEFUL_SHUTDOWN_TIMEOUT", "30"))

def register_shutdown_handler(name: str, handler_func: Callable[[], Any]) -> None:
    """
    Register a function to be called during graceful shutdown.
    
    Args:
        name: Unique identifier for this handler
        handler_func: Function to call during shutdown
    """
    if name in _shutdown_handlers:
        logger.warning(f"Overwriting existing shutdown handler: {name}")
    
    _shutdown_handlers[name] = handler_func
    logger.debug(f"Registered shutdown handler: {name}")

def remove_shutdown_handler(name: str) -> None:
    """
    Remove a registered shutdown handler.
    
    Args:
        name: Identifier of the handler to remove
    """
    if name in _shutdown_handlers:
        del _shutdown_handlers[name]
        logger.debug(f"Removed shutdown handler: {name}")

def _execute_shutdown() -> None:
    """
    Execute all registered shutdown handlers.
    """
    if _shutdown_in_progress.is_set():
        logger.info("Shutdown already in progress")
        return
    
    _shutdown_in_progress.set()
    logger.info(f"Starting graceful shutdown (timeout: {_max_shutdown_time}s)")
    
    # Create a timer to force exit if graceful shutdown takes too long
    force_exit_timer = threading.Timer(_max_shutdown_time, _force_exit)
    force_exit_timer.daemon = True
    force_exit_timer.start()
    
    try:
        # Execute all registered shutdown handlers
        for name, handler in _shutdown_handlers.items():
            try:
                logger.info(f"Running shutdown handler: {name}")
                handler()
            except Exception as e:
                logger.error(f"Error in shutdown handler {name}: {str(e)}")
        
        logger.info("Graceful shutdown completed")
        
        # Cancel the force exit timer if shutdown completed successfully
        force_exit_timer.cancel()
        
        # Exit with success code
        sys.exit(0)
    except Exception as e:
        logger.error(f"Error during shutdown: {str(e)}")
        sys.exit(1)

def _force_exit() -> None:
    """
    Force exit if graceful shutdown takes too long.
    """
    logger.error(f"Graceful shutdown timed out after {_max_shutdown_time}s. Forcing exit.")
    os._exit(1)  # Force exit without calling cleanup handlers

def _signal_handler(sig: int, frame: Any) -> None:
    """
    Signal handler for SIGTERM and SIGINT.
    
    Args:
        sig: Signal number
        frame: Current stack frame
    """
    signal_name = signal.Signals(sig).name
    logger.info(f"Received {signal_name} signal")
    _execute_shutdown()

def setup_signal_handlers() -> None:
    """
    Register signal handlers for graceful shutdown.
    """
    signal.signal(signal.SIGTERM, _signal_handler)  # Termination signal
    signal.signal(signal.SIGINT, _signal_handler)   # Interrupt from keyboard (Ctrl+C)
    logger.info("Registered signal handlers for graceful shutdown")

@contextmanager
def register_resource(name: str, cleanup_func: Callable[[], Any]) -> None:
    """
    Context manager to register and automatically remove shutdown handlers.
    
    Args:
        name: Unique identifier for this handler
        cleanup_func: Function to call during shutdown
    
    Example:
        with register_resource("db_connection", lambda: db.close()):
            # Use db connection
    """
    try:
        register_shutdown_handler(name, cleanup_func)
        yield
    finally:
        remove_shutdown_handler(name)
```

## JavaScript Signal Handler (Frontend Dev Server)

```javascript
// signalHandler.js

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
```

## Implementation Notes:

1. **Backend Signal Handler**:
   - Provides a framework for registering cleanup handlers
   - Implements proper signal handling for SIGTERM and SIGINT
   - Includes a timeout mechanism to force exit if graceful shutdown takes too long
   - Uses a context manager for resource tracking

2. **Frontend Signal Handler**:
   - Handles SIGTERM and SIGINT signals
   - Provides a framework for tracking and cleaning up resources
   - Implements graceful shutdown for WebSocket and HTTP servers
   - Includes timeout mechanism for forced exit

3. **Integration Instructions**:
   - Backend: Import and call `setup_signal_handlers()` in your main application startup
   - Frontend: Import and use the signal handler module in your dev server

4. **Testing**:
   - Test signal handling by sending SIGTERM and SIGINT signals to the containers
   - Verify that resources are properly cleaned up during shutdown
   - Check that long-running operations are properly terminated