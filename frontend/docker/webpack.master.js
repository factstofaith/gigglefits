// Standardized webpack config for TAP Integration Platform
// Master configuration that works for both development and production
// Uses environment variables from .env.master

const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// Determine if we're in production mode
const isProduction = process.env.NODE_ENV === "production" || process.env.SERVICE_ENV === "production";

module.exports = {
  mode: isProduction ? "production" : "development",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "../build"),
    filename: isProduction ? "[name].[contenthash].js" : "bundle.js",
    publicPath: "/"
  },
  // Source maps for development, none for production
  devtool: isProduction ? false : "inline-source-map",
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
        type: "asset/resource",
      }
    ]
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "../src")
    },
    // Fix for webpack 5 node polyfills
    fallback: {
      "path": false,
      "os": false,
      "crypto": false,
      "fs": false,
      "stream": false
    }
  },
  plugins: [
    // Generate HTML file with correct bundles
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"),
      filename: "index.html",
      minify: isProduction ? {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      } : false
    }),
    // Define environment variables
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(isProduction ? "production" : "development"),
        // Use standardized environment variables from .env.master
        REACT_APP_API_URL: JSON.stringify(process.env.SERVICE_API_URL || "http://tap-backend:8000"),
        REACT_APP_VERSION: JSON.stringify(process.env.SERVICE_VERSION || "1.0.0"),
        REACT_APP_ENVIRONMENT: JSON.stringify(process.env.SERVICE_ENV || "development"),
        REACT_APP_RUNNING_IN_DOCKER: JSON.stringify("true"),
        REACT_APP_ERROR_REPORTING_URL: JSON.stringify(process.env.SERVICE_ERROR_REPORTING_URL || "/api/errors"),
        REACT_APP_ERROR_LOGGING_ENABLED: JSON.stringify(process.env.SERVICE_ERROR_REPORTING || "true"),
        REACT_APP_ERROR_LOG_LEVEL: JSON.stringify(process.env.SERVICE_ERROR_LEVEL || "debug"),
        // Hot reload settings (development only)
        WDS_SOCKET_HOST: JSON.stringify(process.env.SERVICE_HOT_RELOAD_HOST || "localhost"),
        WDS_SOCKET_PORT: JSON.stringify(process.env.SERVICE_HOT_RELOAD_PORT || 3456)
      }
    }),
    // Provide variables that modules expect to have
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    // Hot Module Replacement Plugin (development only)
    ...(isProduction ? [] : [new webpack.HotModuleReplacementPlugin()])
  ],
  // Development server config (only used in development mode)
  devServer: isProduction ? undefined : {
    static: {
      directory: path.join(__dirname, "../public"),
      publicPath: '/'
    },
    watchFiles: {
      paths: ['src/**/*', 'public/**/*'],
      options: {
        usePolling: true, // Always use polling in Docker environment for reliable file watching
        interval: 500, // More frequent polling for faster refresh
        ignored: [
          '**/node_modules/**',
          '**/dist/**',
          '**/build/**'
        ]
      }
    },
    compress: true,
    hot: true, // Always enable hot reload in development
    port: 3000,
    host: "0.0.0.0", // Listen on all interfaces
    historyApiFallback: {
      disableDotRule: true,
      index: '/'
    },
    allowedHosts: "all",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
    client: {
      overlay: {
        errors: true,
        warnings: false
      },
      progress: true,
      logging: 'info',
      webSocketURL: {
        hostname: process.env.WDS_SOCKET_HOST || process.env.SERVICE_HOT_RELOAD_HOST || 'localhost',
        pathname: '/ws',
        port: process.env.WDS_SOCKET_PORT || process.env.SERVICE_HOT_RELOAD_PORT || 3456,
        protocol: 'ws',
      },
      reconnect: 5, // Auto-reconnect if connection is lost
    },
    webSocketServer: {
      type: 'ws',
      options: {
        path: '/ws',
      }
    },
    devMiddleware: {
      publicPath: '/',
      stats: 'minimal',
      writeToDisk: false, // Don't write to disk in development mode
    },
    // For better Docker compatibility
    setupExitSignals: true,
    open: false, // Don't open browser automatically
    liveReload: true, // Enable live reload as backup strategy
  },
  // Production optimizations
  ...(isProduction ? {
    optimization: {
      minimize: true,
      splitChunks: {
        chunks: 'all',
        name: false,
      },
      runtimeChunk: {
        name: entrypoint => `runtime-${entrypoint.name}`,
      },
    }
  } : {})
};