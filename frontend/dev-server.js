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
const { execSync } = require("child_process");

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

// Generate runtime environment variables
console.log("Generating runtime environment file...");
try {
  // Execute the script to generate runtime-env.js
  const scriptPath = path.resolve(__dirname, "./inject-env.sh");
  
  // Ensure the script is executable
  try {
    fs.chmodSync(scriptPath, 0o755);
  } catch (error) {
    console.warn(`Warning: Could not set execute permissions on ${scriptPath}: ${error.message}`);
  }
  
  // Run the script
  execSync(`${scriptPath}`, { stdio: 'inherit' });
  console.log("Runtime environment variables generated successfully");
} catch (error) {
  console.error("Failed to generate runtime environment variables:", error);
  console.warn("Continuing with default environment...");
}

// Use Docker optimized webpack config
let config;
try {
  // Always use the docker config in container environment
  console.log("Using Docker-specific webpack configuration");
  config = require("./webpack.config.js");
} catch (error) {
  console.warn(`Warning: ${error.message}. Using default webpack configuration.`);
  
  // Default configuration if project config is not available
  config = {
    mode: "development",
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "../build"),
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
        directory: path.join(__dirname, "../public"),
        publicPath: '/'
      },
      watchFiles: {
        paths: ['src/**/*', 'public/**/*'],
        options: {
          ignored: /node_modules/,
          poll: true
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
        webSocketTransport: 'ws'
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

// Configure file watching for Docker environments
if (!config.devServer.watchOptions) {
  config.devServer.watchOptions = {};
}
config.devServer.watchOptions.poll = 1000; // Always use polling in Docker

// Set up WebSocket transport for hot module replacement
if (!config.devServer.client) {
  config.devServer.client = {};
}
config.devServer.client.webSocketURL = {
  hostname: process.env.WDS_SOCKET_HOST || 'localhost',
  pathname: process.env.WDS_SOCKET_PATH || '/ws',
  port: process.env.WDS_SOCKET_PORT || 3000,
};

// Create static middleware to serve runtime-env.js
const setupStaticMiddleware = (app) => {
  const runtimeEnvPath = path.resolve(__dirname, '../public/runtime-env.js');
  
  // Create runtime-env.js file if it doesn't exist
  if (!fs.existsSync(runtimeEnvPath)) {
    try {
      // Create public directory if it doesn't exist
      if (!fs.existsSync(path.resolve(__dirname, '../public'))) {
        fs.mkdirSync(path.resolve(__dirname, '../public'), { recursive: true });
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
    res.sendFile(path.resolve(__dirname, '../public/runtime-env.js'));
  });
};

// Create compiler
const compiler = webpack(config);

// Create server
const devServerOptions = {
  ...config.devServer
};

// Add custom middleware function to handle health checks and static files
const setupMiddleware = (middlewares, devServer) => {
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
devServerOptions.setupMiddlewares = setupMiddleware;

// Create and start the server
const server = new WebpackDevServer(devServerOptions, compiler);

// Register the server with the signal handler
signalHandler.registerHttpServer(server);

// Register WebSocket server with signal handler (if available)
compiler.hooks.done.tap('register-websocket-server', (stats) => {
  if (server.webSocketServer && !signalHandler.isWebSocketServerRegistered) {
    signalHandler.registerWebSocketServer(server.webSocketServer.server);
    signalHandler.isWebSocketServerRegistered = true;
  }
});

// Start the server
server.start()
  .then(() => {
    console.log(`Development server started successfully on port ${config.devServer.port || 3000}`);
    console.log(`Health check endpoint available at: http://localhost:${config.devServer.port || 3000}/health`);
    console.log(`Runtime environment available at: http://localhost:${config.devServer.port || 3000}/runtime-env.js`);
    
    // Register Docker address for access
    console.log(`Access from host at: http://localhost:${process.env.FRONTEND_PORT || 3456}`);
  })
  .catch(err => {
    console.error("Failed to start development server:", err);
    process.exit(1);
  });

// Register cleanup handler for webpack compiler
signalHandler.registerCleanup('webpack-compiler', () => {
  console.log('Closing webpack compiler');
  // No explicit close method for compiler, but we can free resources
  return Promise.resolve();
});