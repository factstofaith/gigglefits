/**
 * Unified webpack configuration for TAP Integration Platform
 * 
 * This is the main entry point for webpack configuration.
 * It selects the appropriate configuration based on the environment
 * and provides consistent Docker compatibility.
 */

const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin') || { default: function() { return { apply: () => {} }; } };

/**
 * Get the webpack configuration based on environment
 * @param {Object} env - Environment variables
 * @param {Object} argv - Command line arguments
 * @returns {Object} Webpack configuration
 */
const getWebpackConfig = (env = {}, argv = {}) => {
  // Get webpack mode from environment, arguments, or fallback to development
  const mode = argv.mode || 
               env.production ? 'production' : 
               env.development ? 'development' :
               process.env.NODE_ENV || 'development';
  
  // Boolean flags for different modes
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';
  const isAnalyze = process.env.ANALYZE === 'true';
  const isBenchmark = process.env.BENCHMARK === 'true';
  
  // Detect Docker environment using multiple methods for reliability
  const isDockerEnvironment = 
    process.env.DOCKER === 'true' ||
    process.env.CHOKIDAR_USEPOLLING === 'true' ||
    process.env.RUNNING_IN_DOCKER === 'true';
  
  console.log(`Building for ${mode} environment${isDockerEnvironment ? ' (Docker detected)' : ''}`);
  
  // Load the appropriate configuration based on environment
  let config;
  if (isProduction) {
    config = require('./webpack.prod.js');
  } else {
    config = require('./webpack.dev.js');
  }
  
  // Set proper publicPath for Docker environments if needed
  if (isDockerEnvironment && !config.output) {
    config.output = {};
  }
  
  if (isDockerEnvironment && config.output && !config.output.publicPath) {
    config.output.publicPath = '/';
  }
  
  // Add bundle analyzer if in analyze mode
  if (isAnalyze) {
    if (!config.plugins) config.plugins = [];
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: 'bundle-analysis.html',
        openAnalyzer: false,
      })
    );
    console.log('Bundle analysis enabled');
  }
  
  // Add file watcher polling for Docker environments
  if (isDevelopment) {
    // Ensure devServer exists
    if (!config.devServer) {
      config.devServer = {};
    }
    
    // Set up watchFiles correctly for webpack-dev-server v4+
    if (!config.devServer.watchFiles) {
      config.devServer.watchFiles = {
        paths: ['src/**/*', 'public/**/*'],
        options: {
          ignored: /node_modules/,
        }
      };
    }
    
    // Add polling with appropriate options for Docker
    config.devServer.watchFiles.options = {
      ...config.devServer.watchFiles.options,
      // Always enable polling in Docker with reliable timeout
      poll: isDockerEnvironment ? 1000 : false,
    };
    
    if (isDockerEnvironment) {
      console.log('File watcher polling enabled for Docker environment');
      
      // Ensure we're using the right host and client settings for Docker
      config.devServer.host = process.env.HOST || '0.0.0.0';
      config.devServer.allowedHosts = 'all';
      
      // Set up proper WebSocket transport for hot reloading in Docker
      if (!config.devServer.client) {
        config.devServer.client = {};
      }
      config.devServer.client.webSocketURL = {
        hostname: process.env.WDS_SOCKET_HOST || 'localhost',
        pathname: process.env.WDS_SOCKET_PATH || '/ws',
        port: process.env.WDS_SOCKET_PORT || 3000,
      };
      
      // Ensure we have proper headers for CORS
      config.devServer.headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
      };
    }
  }
  
  // Add Docker-specific plugins to copy runtime environment script
  if (isDockerEnvironment) {
    if (!config.plugins) config.plugins = [];
    
    try {
      const dockerRuntimeEnvPath = path.resolve(__dirname, '../public/runtime-env.js');
      
      // Copy Docker-specific files to build output
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            { 
              from: dockerRuntimeEnvPath, 
              to: 'runtime-env.js',
              // Use a custom transform function to inject a timestamp
              transform(content) {
                return content.toString().replace(
                  '__BUILD_TIMESTAMP__',
                  new Date().toISOString()
                );
              },
            },
            {
              from: path.resolve(__dirname, '../public/docker-error.html'), 
              to: 'docker-error.html'
            },
          ],
        })
      );
      console.log('Docker runtime environment support enabled');
    } catch (err) {
      console.warn('Could not set up Docker runtime environment support:', err.message);
    }
  }
  
  // Wrap with speed measure plugin if in benchmark mode
  if (isBenchmark) {
    try {
      const smp = new SpeedMeasurePlugin({
        outputFormat: 'humanVerbose',
        loaderTopFiles: 10,
      });
      config = smp.wrap(config);
      console.log('Build performance measurement enabled');
    } catch (err) {
      console.warn('Could not initialize speed measurement:', err.message);
    }
  }
  
  return config;
};

module.exports = getWebpackConfig;