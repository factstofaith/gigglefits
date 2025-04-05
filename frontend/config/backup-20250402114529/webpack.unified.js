/**
 * Unified webpack configuration for TAP Integration Platform
 * 
 * This is the main entry point for webpack configuration.
 * It selects the appropriate configuration based on the environment.
 */

const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');

// Determine the active environment
const getWebpackConfig = (env = {}) => {
  // Get webpack mode from environment or command line arguments
  const mode = env.production ? 'production' : 
               env.development ? 'development' :
               process.env.NODE_ENV || 'development';
  
  // Boolean flags for different modes
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';
  const isAnalyze = process.env.ANALYZE === 'true';
  const isBenchmark = process.env.BENCHMARK === 'true';
  
  console.log(`Building for ${mode} environment`);
  
  // Load the appropriate configuration based on environment
  let config;
  if (isProduction) {
    config = require('./webpack.production.js');
  } else {
    config = require('./webpack.development.js');
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
  
  // Wrap with speed measure plugin if in benchmark mode
  if (isBenchmark) {
    const smp = new SpeedMeasurePlugin({
      outputFormat: 'humanVerbose',
      loaderTopFiles: 10,
    });
    config = smp.wrap(config);
    console.log('Build performance measurement enabled');
  }
  
  return config;
};

module.exports = getWebpackConfig;