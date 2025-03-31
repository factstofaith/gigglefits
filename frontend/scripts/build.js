/**
 * Enhanced build process
 * 
 * Improved build script with error handling and reporting
 * Created by Project Sunlight optimization
 */

process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections
process.on('unhandledRejection', err => {
  throw err;
});

// Load environment variables
require('../config/env');

const chalk = require('chalk');
const fs = require('fs-extra');
const webpack = require('webpack');
const configFactory = require('../config/webpack.config');
const paths = require('../config/paths');
const { checkBrowsers } = require('react-dev-utils/browsersHelper');
const { printBuildStats, verifyBuild, createBuildReport } = require('./build-utils');

// Set to true to enable profiling in production build
const isProfilingEnabled = process.env.PROFILE === 'true';

// Measure build time
const startTime = Date.now();

// Print build environment info
function printBuildInfo() {
  console.log(chalk.bold('Build environment:'));
  console.log(`  - Node version: ${process.version}`);
  console.log(`  - Environment: ${process.env.REACT_APP_ENV || 'production'}`);
  console.log(`  - Profiling: ${isProfilingEnabled ? 'enabled' : 'disabled'}`);
  console.log(`  - Source maps: ${process.env.GENERATE_SOURCEMAP !== 'false' ? 'enabled' : 'disabled'}`);
  console.log(\n);
}

// Create the production build
async function build() {
  console.log(chalk.bold.cyan('Creating optimized production build...'));
  printBuildInfo();
  
  // Clear the build folder
  fs.emptyDirSync(paths.appBuild);
  
  // Copy public folder contents to build folder
  copyPublicFolder();
  
  // Create webpack compiler
  const config = configFactory('production');
  const compiler = webpack(config);
  
  try {
    // Run webpack compilation
    const stats = await new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) {
          return reject(err);
        }
        resolve(stats);
      });
    });
    
    // Check for errors and warnings
    if (stats.hasErrors()) {
      console.log(chalk.red.bold('\nFailed to compile.\n'));
      console.log(stats.toString({
        chunks: false,
        colors: true,
        modules: false,
        children: false,
      }));
      process.exit(1);
    }
    
    if (stats.hasWarnings()) {
      console.log(chalk.yellow.bold('\nCompiled with warnings.\n'));
      console.log(stats.toString({
        chunks: false,
        colors: true,
        modules: false,
        children: false,
        warnings: true,
      }));
    } else {
      console.log(chalk.green.bold('\nCompiled successfully.\n'));
    }
    
    // Print build statistics
    await printBuildStats(paths.appBuild);
    
    // Verify the build
    const isValid = verifyBuild(paths.appBuild);
    
    if (!isValid) {
      console.log(chalk.red.bold('\nBuild verification failed. The build may be incomplete.\n'));
      process.exit(1);
    }
    
    // Create build report
    await createBuildReport(paths.appBuild);
    
    // Print build time
    const endTime = Date.now();
    const buildDuration = (endTime - startTime) / 1000;
    console.log(chalk.bold(`\nBuild completed in ${buildDuration.toFixed(2)}s\n`));
    
    return stats;
  } catch (error) {
    console.log(chalk.red.bold('Failed to compile.\n'));
    console.log(`${error.message || error}\n`);
    process.exit(1);
  }
}

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
}

// Run the build process
checkBrowsers(paths.appPath, isInteractive)
  .then(() => build())
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
