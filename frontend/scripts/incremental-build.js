/**
 * Incremental build script for TAP Integration Platform frontend
 * 
 * This script performs incremental builds to speed up development and testing.
 * It watches for changes and only rebuilds modified files.
 */

'use strict';

// Set environment variables
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
process.env.BUILD_TYPE = 'development';

// Enable hot reloading
process.env.FAST_REFRESH = 'true';

// Ensure environment variables are read
require('../config/env');

const chalk = require('chalk');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const configFactory = require('../config/webpack.config');
const { choosePort, createCompiler, prepareUrls } = require('react-dev-utils/WebpackDevServerUtils');
const openBrowser = require('react-dev-utils/openBrowser');
const clearConsole = require('react-dev-utils/clearConsole');
const paths = require('../config/paths');

const HOST = process.env.HOST || '0.0.0.0';
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const isInteractive = process.stdout.isTTY;

// Generate webpack configuration
const config = configFactory('development');

// We require that you explicitly set browsers and do not fall back to browserslist defaults
const { checkBrowsers } = require('react-dev-utils/browsersHelper');

// Print environment information
console.log(chalk.blue('Starting incremental build in development mode...'));
console.log(chalk.green('Hot reloading enabled. Changes will be reflected immediately.'));

// Find an available port and start the dev server
checkBrowsers(paths.appPath, isInteractive)
  .then(() => {
    return choosePort(HOST, DEFAULT_PORT);
  })
  .then(port => {
    if (port == null) {
      // If port is null, no available port was found
      console.log(chalk.red('Could not find an available port for the dev server.'));
      return;
    }

    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
    const urls = prepareUrls(
      protocol,
      HOST,
      port,
      paths.publicUrlOrPath.slice(0, -1)
    );

    // Create a webpack compiler that is configured with custom messages
    const compiler = createCompiler({
      webpack,
      config,
      appName: 'TAP Integration Platform',
      urls,
      useTypeScript: true,
      tscCompileOnError: true,
      useESLint: true,
      devSocket: { errors: () => {}, warnings: () => {} },
    });

    // Configure the dev server
    const devServerConfig = {
      // Silence WebpackDevServer's output since CRA prints it already
      allowedHosts: 'all',
      compress: true,
      client: {
        logging: 'none',
        overlay: {
          errors: true,
          warnings: false,
        },
        progress: true,
      },
      static: {
        directory: paths.appPublic,
        publicPath: [paths.publicUrlOrPath],
        watch: {
          ignored: /node_modules/,
        },
      },
      devMiddleware: {
        publicPath: paths.publicUrlOrPath.slice(0, -1),
      },
      host: HOST,
      historyApiFallback: {
        disableDotRule: true,
        index: paths.publicUrlOrPath,
      },
      hot: true,
      https: protocol === 'https',
      port,
    };

    // Create and start the WebpackDevServer
    const devServer = new WebpackDevServer(devServerConfig, compiler);
    devServer.startCallback(() => {
      if (isInteractive) {
        clearConsole();
      }

      console.log(chalk.cyan('Starting the development server...\n'));
      console.log(chalk.cyan(`Local:            ${urls.localUrlForTerminal}`));
      console.log(chalk.cyan(`On Your Network:  ${urls.lanUrlForTerminal}`));

      // Open browser if flag is set
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
      console.log(chalk.red(err.message));
    }
    process.exit(1);
  });