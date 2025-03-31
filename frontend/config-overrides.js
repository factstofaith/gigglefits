/**
 * React App Rewired configuration
 * 
 * This file overrides Create React App webpack config without ejecting.
 * It allows us to customize webpack configuration to support path aliases and optimizations.
 * Also includes polyfills for Node.js core modules in webpack 5.
 */
const { override, addWebpackAlias, addBabelPlugin } = require('customize-cra');
const webpack = require('webpack');
const aliases = require('./config/webpack.aliases');

module.exports = override(
  // Add webpack aliases from our configuration file
  addWebpackAlias(aliases),
  
  // Add module resolver babel plugin for consistent imports
  addBabelPlugin([
    'module-resolver',
    {
      root: ['./src'],
      alias: aliases
    }
  ]),
  
  // Add Node.js polyfills for webpack 5
  (config) => {
    // Add fallbacks for Node.js core modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "buffer": require.resolve("buffer/"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "assert": require.resolve("assert/"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "url": require.resolve("url/"),
      "path": require.resolve("path-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "fs": false,
      "net": false,
      "tls": false,
      "child_process": false,
      "timers": require.resolve("timers-browserify"),
      "util": require.resolve("util/")
    };

    // Add plugins for providing Node.js globals
    config.plugins.push(
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      })
    );

    // Enable polling in watch options
    if (config.watchOptions) {
      config.watchOptions.poll = 1000; // Check for changes every second
    }

    return config;
  }
);