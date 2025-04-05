#!/usr/bin/env node

/**
 * Enhanced Development Server for TAP Integration Platform
 * 
 * This script provides an improved development experience with:
 * - Better error reporting
 * - Hot module replacement
 * - Proxy configuration for backend API
 * - Environment variable support
 * - Performance monitoring
 */

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const chalk = require('chalk');
const clearConsole = require('react-dev-utils/clearConsole');
const openBrowser = require('react-dev-utils/openBrowser');
const { choosePort, createCompiler, prepareUrls } = require('react-dev-utils/WebpackDevServerUtils');
const paths = require('./config/paths');
const getWebpackConfig = require('./config/webpack.unified');

// Set environment variables
process.env.NODE_ENV = 'development';
process.env.BABEL_ENV = 'development';

// Get webpack configuration
const config = getWebpackConfig({ development: true });

const isInteractive = process.stdout.isTTY;

// Tools like Cloud9 rely on this
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// We attempt to use the default port but if it is busy, we offer the user to
// run on a different port. `choosePort()` Promise resolves to the next free port
choosePort(HOST, DEFAULT_PORT)
  .then(port => {
    if (port === null) {
      // We didn't find a port
      return;
    }

    // Create a webpack compiler that is configured with webpack.unified.js
    const urls = prepareUrls('http', HOST, port);
    const compiler = createCompiler({
      appName: 'TAP Integration Platform',
      config,
      webpack,
      urls,
      useTypeScript: true,
    });

    // Configure development server options
    const serverConfig = {
      ...config.devServer,
      host: HOST,
      port: port,
    };

    // Create a webpack dev server instance
    const devServer = new WebpackDevServer(serverConfig, compiler);

    // Start the server
    devServer.startCallback(() => {
      if (isInteractive) {
        clearConsole();
      }

      console.log(chalk.cyan('Starting development server...\n'));
      console.log(
        chalk.cyan(`  Local:            http://localhost:${port}/\n`) +
        chalk.cyan(`  On Your Network:  http://${HOST === '0.0.0.0' ? require('ip').address() : HOST}:${port}/\n`)
      );
      console.log(chalk.cyan('Hot module replacement is enabled.\n'));
      console.log(chalk.yellow('Note: This development build is not optimized.\n'));
      console.log(chalk.yellow(`To create a production build, use ${chalk.cyan('npm run build')}\n`));

      // Open browser on start
      if (process.env.OPEN_BROWSER !== 'false') {
        openBrowser(urls.localUrlForBrowser);
      }
    });

    // Handle server shutdown
    ['SIGINT', 'SIGTERM'].forEach(function(sig) {
      process.on(sig, function() {
        devServer.close();
        process.exit();
      });
    });

    if (process.env.CI !== 'true') {
      // Gracefully exit when stdin ends
      process.stdin.on('end', function() {
        devServer.close();
        process.exit();
      });
    }
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });