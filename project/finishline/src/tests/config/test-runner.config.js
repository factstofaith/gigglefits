/**
 * Unified Test Runner Configuration
 * 
 * This file configures the unified test runner for all test types.
 */
module.exports = {
  // Test type configurations
  testTypes: {
    unit: {
      runner: 'jest',
      testMatch: ['**/__tests__/**/*.js', '**/*.test.js'],
      setupFiles: ['../jest.setup.js'],
      coverageThreshold: {
        global: {
          statements: 80,
          branches: 70,
          functions: 80,
          lines: 80
        }
      },
      collectCoverageFrom: [
        'src/**/*.{js,jsx}',
        '!src/**/*.stories.{js,jsx}',
        '!src/index.js',
        '!src/setupTests.js'
      ]
    },
    integration: {
      runner: 'jest',
      testMatch: ['**/__integration__/**/*.js', '**/*.integration.test.js'],
      setupFiles: ['../jest.setup.js'],
      testEnvironment: 'jsdom',
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
      }
    },
    e2e: {
      runner: 'cypress',
      specPattern: 'cypress/e2e/**/*.cy.js',
      baseUrl: 'http://localhost:3000',
      viewportWidth: 1280,
      viewportHeight: 720,
      video: true,
      screenshotOnRunFailure: true
    },
    visual: {
      runner: 'storybook-test-runner',
      storybookUrl: 'http://localhost:6006',
      specPattern: 'src/**/*.stories.jsx',
      getScreenshotOptions: () => ({
        fullPage: true,
        omitBackground: true
      })
    },
    performance: {
      runner: 'lighthouse',
      url: 'http://localhost:3000',
      thresholds: {
        performance: 90,
        accessibility: 90,
        'best-practices': 90,
        seo: 90
      },
      reports: ['html', 'json']
    },
    accessibility: {
      runner: 'axe',
      include: ['src/**/*.jsx'],
      exclude: ['**/*.stories.jsx'],
      rules: {
        'color-contrast': { enabled: true },
        'valid-aria-role': { enabled: true },
        'aria-required-attr': { enabled: true }
      }
    }
  },
  
  // Result collection configuration
  results: {
    outputDir: 'test-results',
    reportFormats: ['html', 'json', 'text'],
    groupByType: true,
    mergeResults: true
  },
  
  // CI Integration
  ci: {
    preCommitTypes: ['unit', 'lint'],
    prRequiredTypes: ['unit', 'integration', 'e2e', 'accessibility'],
    notifyOnFailure: true,
    failFast: true
  }
};
