#!/usr/bin/env node

/* Development server for TAP Integration Platform frontend
   This script starts the webpack dev server with the appropriate configuration 
   FOR DOCKER ENVIRONMENT - Uses simplified config for faster startup */

const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const path = require("path");
const express = require("express");
const fs = require("fs");

// Import signal handler and health module
const signalHandler = require("./signalHandler");
const healthModule = require("../src/utils/health");

console.log("Starting Docker webpack dev server...");

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
      path: path.resolve(__dirname, "./build"),
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
        directory: path.join(__dirname, "./public"),
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

// Create compiler
const compiler = webpack(config);

// Create server
const devServerOptions = {
  ...config.devServer
};

// Add custom middleware function to handle health checks
const setupMiddleware = (middlewares, devServer) => {
  // Create an Express app for middleware
  const app = express();
  
  // Register health check routes
  healthModule.registerHealthCheck(app);
  
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

// Start the server
server.start()
  .then(() => {
    console.log(`Development server started successfully on port ${config.devServer.port}`);
    console.log(`Health check endpoint available at: http://localhost:${config.devServer.port}/health`);
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
