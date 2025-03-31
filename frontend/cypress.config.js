const { defineConfig } = require('cypress');
const path = require('path');
const aliases = require('./config/webpack.aliases');

// Generate consistent path aliases for Cypress to match Jest
const resolveAliases = Object.entries(aliases).reduce((acc, [key, value]) => {
  acc[key] = path.resolve(__dirname, value.replace('<rootDir>', ''));
  return acc;
}, {});

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // Load Percy if installed (visual testing)
      try {
        require.resolve('@percy/cypress/task');
        require('@percy/cypress/task')(on, config);
      } catch (e) {
        console.log('Percy is not installed, continuing without visual testing');
      }

      // Load code coverage plugin if coverage is enabled
      if (config.env.coverage) {
        try {
          require('@cypress/code-coverage/task')(on, config);
          console.log('Code coverage enabled for Cypress tests');
        } catch (e) {
          console.log('Code coverage plugin not installed, continuing without coverage');
        }
      }

      // Setup Cypress-image-snapshot if installed (visual regression)
      try {
        const { addMatchImageSnapshotPlugin } = require('cypress-image-snapshot/plugin');
        addMatchImageSnapshotPlugin(on, config);
        console.log('Visual regression testing enabled');
      } catch (e) {
        console.log('Cypress-image-snapshot not installed, continuing without visual regression');
      }

      // JUnit reporting for CI
      on('after:run', (results) => {
        if (results && process.env.CI) {
          // Generate JUnit report
          const junitReporter = require('cypress-junit-reporter');
          const reporterOptions = {
            mochaFile: 'cypress/results/junit-[hash].xml',
            testCaseSwitchClassnameAndName: true,
            rootSuiteTitle: 'Cypress Tests',
            jenkinsMode: true,
          };
          
          return junitReporter.generateReport(reporterOptions, results);
        }
      });

      return config;
    },
    // Split specs into groups for parallel test execution in CI
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx}',
    excludeSpecPattern: ['cypress/e2e/templates/**/*.cy.{js,jsx}'],
    viewportWidth: 1280,
    viewportHeight: 720,
    chromeWebSecurity: false,
    video: process.env.CI ? true : false,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 2,
      openMode: 0,
    },
  },
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
      webpackConfig: {
        // Add path aliases to align with Jest configuration
        resolve: {
          alias: resolveAliases,
        },
        // Add instrumentation for code coverage if enabled
        module: {
          rules: [
            {
              test: /\.(js|jsx)$/,
              exclude: [/node_modules/, /cypress/],
              use: {
                loader: 'babel-loader',
                options: {
                  // Use the same babel config as Jest
                  configFile: path.resolve(__dirname, './babel.config.js'),
                  plugins: process.env.REACT_APP_ENABLE_COVERAGE 
                    ? [['istanbul', { exclude: ['**/*.cy.{js,jsx}', '**/*.test.{js,jsx}'] }]]
                    : [],
                },
              },
            },
            // Process HTML entities in test files consistently with Jest
            {
              test: /\.cy\.(js|jsx)$/,
              use: [{
                loader: path.resolve(__dirname, './cypress/support/html-entity-loader.js')
              }]
            }
          ],
        },
      },
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx}',
    excludeSpecPattern: ['cypress/component/templates/**/*.cy.{js,jsx}'],
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      // Load code coverage plugin if coverage is enabled
      if (config.env.coverage) {
        try {
          require('@cypress/code-coverage/task')(on, config);
          console.log('Code coverage enabled for component tests');
        } catch (e) {
          console.log('Code coverage plugin not installed, continuing without coverage');
        }
      }
      
      return config;
    },
  },
  env: {
    // Default environment variables for tests
    mockApi: true,
    coverage: false,
    hideXhrInCommandLog: true,
  },
});