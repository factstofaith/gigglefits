#!/usr/bin/env node

/**
 * Development server for TAP Integration Platform frontend
 * Enhanced for Docker environments with built-in health checks and graceful shutdown
 * 
 * Features:
 * - Automatic runtime environment injection
 * - Health check endpoints
 * - Graceful signal handling for container orchestration
 * - Improved file watching for Docker volumes
 * - WebSocket configuration for hot module replacement
 */

const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const path = require("path");
const fs = require("fs");
const express = require("express");
const { execSync, exec } = require("child_process");

// Handle paths consistently in Docker environment
const APP_ROOT = "/app";
const APP_DOCKER = "/app-docker";

// Signal handler module for Docker
const signalHandler = {
  _handlers: {
    sync: {},
    async: {}
  },
  _httpServer: null,
  _wsServer: null,
  isWebSocketServerRegistered: false,

  // Register an HTTP server for shutdown handling
  registerHttpServer(server) {
    this._httpServer = server;
    console.log("Registered HTTP server for graceful shutdown");
    return this;
  },

  // Register a WebSocket server for shutdown handling
  registerWebSocketServer(server) {
    this._wsServer = server;
    console.log("Registered WebSocket server for graceful shutdown");
    return this;
  },

  // Register a cleanup handler
  registerCleanup(name, handler) {
    this._handlers.sync[name] = handler;
    console.log(`Registered cleanup handler: ${name}`);
    return this;
  },

  // Handle graceful shutdown
  handleShutdown(signal) {
    console.log(`Received ${signal}, shutting down gracefully...`);
    
    // Execute all synchronous handlers
    const syncHandlerNames = Object.keys(this._handlers.sync);
    for (const name of syncHandlerNames) {
      try {
        console.log(`Running cleanup handler: ${name}`);
        this._handlers.sync[name]();
      } catch (err) {
        console.error(`Error in cleanup handler ${name}:`, err);
      }
    }
    
    // Close HTTP server if registered
    if (this._httpServer) {
      console.log("Closing HTTP server...");
      this._httpServer.close();
    }
    
    // Close WebSocket server if registered
    if (this._wsServer) {
      console.log("Closing WebSocket server...");
      this._wsServer.close();
    }
    
    console.log("Shutdown complete");
    process.exit(0);
  }
};

// Register signal handlers
process.on("SIGTERM", () => signalHandler.handleShutdown("SIGTERM"));
process.on("SIGINT", () => signalHandler.handleShutdown("SIGINT"));

// Simple health module
const healthModule = {
  registerHealthCheck(app) {
    app.get("/health", (req, res) => {
      res.json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: Date.now(),
        environment: process.env.NODE_ENV || "development",
        isDocker: process.env.REACT_APP_RUNNING_IN_DOCKER === "true",
        dockerInfo: {
          containerName: process.env.REACT_APP_CONTAINER_ID || "unknown",
          containerVersion: process.env.REACT_APP_CONTAINER_VERSION || "unknown",
          environment: process.env.REACT_APP_DOCKER_ENVIRONMENT || "unknown"
        }
      });
    });
    
    console.log("Health check endpoint registered at /health");
  }
};

console.log("Starting Docker-optimized webpack dev server...");

// Function to locate configuration files with fallbacks
const locateFile = (filename) => {
  // Try different possible locations
  const possibleLocations = [
    path.join(APP_ROOT, filename),
    path.join(APP_DOCKER, filename),
    path.join(__dirname, filename),
    path.join(process.cwd(), filename)
  ];
  
  for (const location of possibleLocations) {
    if (fs.existsSync(location)) {
      console.log(`Found ${filename} at ${location}`);
      return location;
    }
  }
  
  console.warn(`Warning: ${filename} not found in any standard location`);
  return null;
};

// Generate runtime environment variables
console.log("Generating runtime environment file...");
try {
  // Execute the script to generate runtime-env.js
  const possibleScriptLocations = [
    path.join(APP_ROOT, "inject-env.sh"),
    path.join(APP_DOCKER, "inject-env.sh"),
    path.join(__dirname, "inject-env.sh")
  ];
  
  let scriptPath = null;
  for (const location of possibleScriptLocations) {
    if (fs.existsSync(location)) {
      scriptPath = location;
      break;
    }
  }
  
  if (scriptPath) {
    console.log(`Found inject-env.sh at ${scriptPath}`);
    
    // Ensure the script is executable
    try {
      fs.chmodSync(scriptPath, 0o755);
    } catch (error) {
      console.warn(`Warning: Could not set execute permissions on ${scriptPath}: ${error.message}`);
    }
    
    // Run the script
    execSync(scriptPath, { stdio: 'inherit' });
    console.log("Runtime environment variables generated successfully");
  } else {
    console.warn("inject-env.sh not found in any standard location, creating minimal runtime env");
    
    // Create a minimal runtime-env.js manually
    const runtimeEnvDir = path.join(APP_ROOT, "public");
    const runtimeEnvPath = path.join(runtimeEnvDir, "runtime-env.js");
    
    // Ensure the directory exists
    if (!fs.existsSync(runtimeEnvDir)) {
      fs.mkdirSync(runtimeEnvDir, { recursive: true });
    }
    
    // Create a minimal runtime environment file
    const content = `
    // Runtime environment variables (minimal fallback)
    window.runtimeEnv = {
      API_URL: '${process.env.REACT_APP_API_URL || 'http://backend:8000'}',
      VERSION: '${process.env.REACT_APP_VERSION || '1.0.0'}',
      ENVIRONMENT: '${process.env.NODE_ENV || 'development'}',
      IS_DOCKER: true,
      get: function(key, defaultValue) {
        return this[key] !== undefined ? this[key] : defaultValue;
      }
    };
    window.runtimeConfig = { apiBaseUrl: window.runtimeEnv.API_URL };
    console.log('[Runtime Environment] Initialized with fallback configuration');
    `;
    
    fs.writeFileSync(runtimeEnvPath, content, 'utf8');
    console.log(`Created minimal runtime-env.js file at ${runtimeEnvPath}`);
  }
} catch (error) {
  console.error("Failed to generate runtime environment variables:", error);
  console.warn("Continuing with default environment...");
}

// Load webpack configuration
let config;
try {
  // Try to load the webpack config from various locations
  const webpackConfigPath = locateFile("webpack.config.js") || locateFile("webpack.dev.js");
  
  if (webpackConfigPath) {
    console.log(`Loading webpack configuration from ${webpackConfigPath}`);
    config = require(webpackConfigPath);
  } else {
    throw new Error("Could not find webpack configuration file");
  }
} catch (error) {
  console.warn(`Warning: ${error.message}. Using default webpack configuration.`);
  
  // Default configuration if project config is not available
  config = {
    mode: "development",
    entry: "./src/index.js",
    output: {
      path: path.resolve(APP_ROOT, "build"),
      filename: "bundle.js",
      publicPath: "/"
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"]
            }
          }
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource"
        }
      ]
    },
    resolve: {
      extensions: [".js", ".jsx"]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin()
    ],
    // Updated devServer config for webpack-dev-server v4+
    devServer: {
      static: {
        directory: path.join(APP_ROOT, "public"),
        publicPath: '/'
      },
      watchFiles: {
        paths: ['src/**/*', 'public/**/*'],
        options: {
          usePolling: true,
          interval: 1000,
          ignored: /node_modules/
        }
      },
      compress: true,
      hot: true,
      port: 3000,
      host: "0.0.0.0",
      historyApiFallback: {
        disableDotRule: true,
        index: '/'
      },
      allowedHosts: "all",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*"
      },
      client: {
        overlay: {
          errors: true,
          warnings: false
        },
        progress: true,
        webSocketURL: {
          hostname: process.env.WDS_SOCKET_HOST || 'localhost',
          pathname: process.env.WDS_SOCKET_PATH || '/ws',
          port: process.env.WDS_SOCKET_PORT || 3000,
        }
      },
      webSocketServer: 'ws',
      devMiddleware: {
        publicPath: '/',
        stats: 'minimal'
      }
    }
  };
}

// Ensure dev server config exists
if (!config.devServer) {
  config.devServer = {};
}

// Create static middleware to serve runtime-env.js
const setupStaticMiddleware = (app) => {
  const runtimeEnvPath = path.resolve(APP_ROOT, "public/runtime-env.js");
  
  // Create runtime-env.js file if it doesn't exist
  if (!fs.existsSync(runtimeEnvPath)) {
    try {
      // Create public directory if it doesn't exist
      const publicDir = path.resolve(APP_ROOT, "public");
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      // Generate minimal runtime environment file
      const content = `
// Runtime environment variables for Docker environment
window.runtimeEnv = {
  // Docker environment values
  API_URL: '${process.env.REACT_APP_API_URL || 'http://backend:8000'}',
  AUTH_URL: '${process.env.REACT_APP_AUTH_URL || '/auth'}',
  PUBLIC_URL: '',
  HOST: 'localhost',
  PORT: '3000',
  ENVIRONMENT: '${process.env.NODE_ENV || 'development'}',
  VERSION: '${process.env.REACT_APP_VERSION || '1.0.0'}',
  BUILD_TIME: '${new Date().toISOString()}',
  
  // Docker-specific settings
  IS_DOCKER: true,
  DOCKER_COMPOSE_PROJECT: '${process.env.COMPOSE_PROJECT_NAME || 'tap-integration-platform'}',
  
  // Function to access env variables with defaults
  get: function(key, defaultValue) {
    return this[key] !== undefined ? this[key] : defaultValue;
  }
};

// Runtime configuration for app initialization
window.runtimeConfig = {
  apiBaseUrl: window.runtimeEnv.API_URL,
  authBaseUrl: window.runtimeEnv.AUTH_URL,
  publicUrl: window.runtimeEnv.PUBLIC_URL,
  environment: window.runtimeEnv.ENVIRONMENT,
  version: window.runtimeEnv.VERSION,
  isDocker: window.runtimeEnv.IS_DOCKER,
  buildTime: window.runtimeEnv.BUILD_TIME,
};

console.log('[Runtime Environment] Initialized in Docker with config:', window.runtimeConfig);
`;
      fs.writeFileSync(runtimeEnvPath, content, 'utf8');
      console.log('Created runtime-env.js file');
    } catch (error) {
      console.error('Failed to create runtime-env.js file:', error);
    }
  }
  
  // Serve the runtime-env.js file with proper headers
  app.get('/runtime-env.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.resolve(APP_ROOT, "public/runtime-env.js"));
  });
};

// Create compiler
const compiler = webpack(config);

// Set up middleware function to handle health checks and static files
const setupMiddlewares = (middlewares, devServer) => {
  // Create an Express app for middleware
  const app = express();
  
  // Register health check routes
  healthModule.registerHealthCheck(app);
  
  // Set up static file middleware
  setupStaticMiddleware(app);
  
  // Log available routes
  console.log('Available routes:');
  console.log('- /health: Health check endpoint');
  console.log('- /runtime-env.js: Runtime environment configuration');
  
  // Use the app instance as middleware
  middlewares.unshift({
    name: 'health-check-middleware',
    middleware: app
  });
  
  return middlewares;
};

// Configure dev server with the webpack-dev-server v4+ API
const server = new WebpackDevServer({
  static: config.devServer.static,
  host: config.devServer.host || "0.0.0.0",
  port: config.devServer.port || 3000,
  historyApiFallback: config.devServer.historyApiFallback || true,
  hot: config.devServer.hot !== false,
  headers: config.devServer.headers,
  allowedHosts: config.devServer.allowedHosts || "all",
  client: config.devServer.client,
  webSocketServer: config.devServer.webSocketServer || "ws",
  compress: config.devServer.compress !== false,
  devMiddleware: config.devServer.devMiddleware,
  setupMiddlewares: setupMiddlewares,
  watchFiles: config.devServer.watchFiles
}, compiler);

// Start the server
server.startCallback(() => {
  // Register the server with the signal handler
  signalHandler.registerHttpServer(server.server);
  
  // Get WDS_SOCKET variables for hot reload configuration
  const socketHost = process.env.WDS_SOCKET_HOST || process.env.SERVICE_HOT_RELOAD_HOST || 'localhost';
  const socketPort = process.env.WDS_SOCKET_PORT || process.env.SERVICE_HOT_RELOAD_PORT || 3456;
  
  console.log(`Development server started successfully on port ${config.devServer.port || 3000}`);
  console.log(`Health check endpoint available at: http://localhost:${config.devServer.port || 3000}/health`);
  console.log(`Runtime environment available at: http://localhost:${config.devServer.port || 3000}/runtime-env.js`);
  
  // Register Docker address for access
  console.log(`Access from host at: http://localhost:${socketPort}`);
  
  // Log WebSocket configuration for hot reload
  console.log(`WebSocket HMR configuration:`);
  console.log(`- Host: ${socketHost}`);
  console.log(`- Port: ${socketPort}`);
  console.log(`- Path: ${process.env.WDS_SOCKET_PATH || '/ws'}`);
  
  // Check if file watching is working
  const usePolling = process.env.CHOKIDAR_USEPOLLING === "true";
  console.log(`File watching configuration:`);
  console.log(`- Using polling: ${usePolling ? 'Yes' : 'No'}`);
  console.log(`- Watch interval: ${config.devServer.watchFiles?.options?.interval || '1000'} ms`);
  
  // Create a file watch test to verify watching is working
  try {
    const watchTestFile = path.join(APP_ROOT, 'src', '.watch-test.js');
    // Create test file or update timestamp
    fs.writeFileSync(watchTestFile, `// Watch test file created at ${new Date().toISOString()}\n// This file helps verify that file watching is working correctly.`);
    console.log(`Created watch test file at ${watchTestFile}`);
    // Schedule a change to the test file after 10 seconds
    setTimeout(() => {
      try {
        fs.appendFileSync(watchTestFile, `\n// Updated at ${new Date().toISOString()}`);
        console.log(`Updated watch test file to verify watching works`);
      } catch (err) {
        console.warn(`Warning: Could not update watch test file: ${err.message}`);
      }
    }, 10000);
  } catch (err) {
    console.warn(`Warning: Could not create watch test file: ${err.message}`);
  }
  
  // Register WebSocket server with signal handler (if available)
  if (server.webSocketServer && server.webSocketServer.wsServer) {
    signalHandler.registerWebSocketServer(server.webSocketServer.wsServer);
    console.log("WebSocket server registered for graceful shutdown");
    
    // Log active WebSocket connections periodically
    setInterval(() => {
      const wsServer = server.webSocketServer.wsServer;
      const clientCount = wsServer.clients ? wsServer.clients.size : 'unknown';
      console.log(`WebSocket status: ${clientCount} active connections`);
    }, 30000);
  } else {
    console.warn("WebSocket server not available for HMR - hot reload may not work correctly");
  }
});

// Register cleanup handler for webpack compiler
signalHandler.registerCleanup('webpack-compiler', () => {
  console.log('Closing webpack compiler');
  // No explicit close method for compiler, but we can free resources
  return Promise.resolve();
});