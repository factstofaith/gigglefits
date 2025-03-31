/**
 * Comprehensive Application QA Test Suite
 * 
 * This script implements a complete quality assurance testing system
 * following our zero technical debt approach, with no constraints
 * for production deployment.
 * 
 * It provides test generation, orchestration, execution, and comprehensive reporting
 * for ensuring application quality across all components and features.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync, spawn } = require('child_process');
const chalk = require('chalk');

// Configuration for the QA test suite
const CONFIG = {
  // Application structure
  applicationStructure: {
    components: 'src/components',
    pages: 'src/pages',
    hooks: 'src/hooks',
    contexts: 'src/contexts',
    utils: 'src/utils'
  },
  
  // Test framework options
  testFrameworks: {
    unit: 'jest',
    component: 'testing-library',
    integration: 'cypress-component',
    e2e: 'cypress',
    visual: 'percy',
    accessibility: 'axe-core'
  },
  
  // Main application features to test
  applicationFeatures: [
    'authentication',
    'user-management',
    'integration-creation',
    'data-transformations',
    'storage-connectors',
    'scheduling',
    'notifications',
    'admin-dashboard',
    'multi-tenant',
    'documentation'
  ],
  
  // Test output directories
  outputDirectories: {
    testResults: 'reports/qa',
    testCoverage: 'reports/qa/coverage',
    unitTests: 'reports/qa/unit',
    componentTests: 'reports/qa/component',
    integrationTests: 'reports/qa/integration',
    e2eTests: 'reports/qa/e2e',
    visualTests: 'reports/qa/visual',
    accessibilityTests: 'reports/qa/accessibility',
    summary: 'reports/qa/summary'
  },
  
  // Quality thresholds
  qualityThresholds: {
    unitTestCoverage: 90,
    componentTestCoverage: 85,
    criticalPathTestCoverage: 100,
    visualRegressionThreshold: 0,
    maxAllowedA11yViolations: 0,
    performanceBudget: {
      firstContentfulPaint: 1000,
      timeToInteractive: 2000,
      totalBlockingTime: 200
    }
  }
};

// Create output directories if they don't exist
Object.values(CONFIG.outputDirectories).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Generate a timestamp string for reports
 * 
 * @returns {string} - Formatted timestamp
 */
function getTimestamp() {
  const now = new Date();
  return now.toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '');
}

/**
 * Find all components in the application
 * 
 * @returns {Object} - Map of component paths
 */
function findAllComponents() {
  console.log(chalk.blue('Finding all components...'));
  
  const components = {};
  const componentPattern = path.join(CONFIG.applicationStructure.components, '**/*.{jsx,tsx}');
  
  glob.sync(componentPattern).forEach(file => {
    // Skip test files
    if (file.includes('.test.') || file.includes('.spec.')) {
      return;
    }
    
    const componentName = path.basename(file, path.extname(file));
    components[componentName] = file;
  });
  
  console.log(chalk.green(`Found ${Object.keys(components).length} components`));
  return components;
}

/**
 * Find all pages in the application
 * 
 * @returns {Object} - Map of page paths
 */
function findAllPages() {
  console.log(chalk.blue('Finding all pages...'));
  
  const pages = {};
  const pagePattern = path.join(CONFIG.applicationStructure.pages, '**/*.{jsx,tsx}');
  
  glob.sync(pagePattern).forEach(file => {
    // Skip test files
    if (file.includes('.test.') || file.includes('.spec.')) {
      return;
    }
    
    const pageName = path.basename(file, path.extname(file));
    pages[pageName] = file;
  });
  
  console.log(chalk.green(`Found ${Object.keys(pages).length} pages`));
  return pages;
}

/**
 * Find existing test files
 * 
 * @returns {Object} - Map of test files by type
 */
function findExistingTests() {
  console.log(chalk.blue('Finding existing tests...'));
  
  const testFiles = {
    unit: [],
    component: [],
    integration: [],
    e2e: []
  };
  
  // Find unit and component tests in src directories
  glob.sync('src/**/*.{test,spec}.{js,jsx,ts,tsx}').forEach(file => {
    if (file.includes('.cy.')) {
      testFiles.component.push(file);
    } else {
      testFiles.unit.push(file);
    }
  });
  
  // Find Cypress E2E tests
  glob.sync('cypress/e2e/**/*.cy.{js,ts}').forEach(file => {
    testFiles.e2e.push(file);
  });
  
  // Find Cypress component tests
  glob.sync('cypress/component/**/*.cy.{js,ts}').forEach(file => {
    testFiles.integration.push(file);
  });
  
  console.log(chalk.green(`Found ${testFiles.unit.length} unit tests`));
  console.log(chalk.green(`Found ${testFiles.component.length} component tests`));
  console.log(chalk.green(`Found ${testFiles.integration.length} integration tests`));
  console.log(chalk.green(`Found ${testFiles.e2e.length} E2E tests`));
  
  return testFiles;
}

/**
 * Analyze test coverage for the application
 * 
 * @param {Object} components - Map of component paths
 * @param {Object} pages - Map of page paths
 * @param {Object} testFiles - Map of test files by type
 * @returns {Object} - Test coverage analysis
 */
function analyzeTestCoverage(components, pages, testFiles) {
  console.log(chalk.blue('Analyzing test coverage...'));
  
  const coverage = {
    components: {},
    pages: {},
    features: {}
  };
  
  // Analyze component test coverage
  Object.keys(components).forEach(component => {
    const componentPath = components[component];
    const hasUnitTest = testFiles.unit.some(file => file.includes(`/${component}.test.`) || file.includes(`/${component}.spec.`));
    const hasComponentTest = testFiles.component.some(file => file.includes(`/${component}.cy.`));
    
    coverage.components[component] = {
      path: componentPath,
      unitTest: hasUnitTest,
      componentTest: hasComponentTest,
      testCoverage: hasUnitTest && hasComponentTest ? 'full' : hasUnitTest || hasComponentTest ? 'partial' : 'none'
    };
  });
  
  // Analyze page test coverage
  Object.keys(pages).forEach(page => {
    const pagePath = pages[page];
    const hasUnitTest = testFiles.unit.some(file => file.includes(`/${page}.test.`) || file.includes(`/${page}.spec.`));
    const hasE2ETest = testFiles.e2e.some(file => file.includes(page.toLowerCase()));
    
    coverage.pages[page] = {
      path: pagePath,
      unitTest: hasUnitTest,
      e2eTest: hasE2ETest,
      testCoverage: hasUnitTest && hasE2ETest ? 'full' : hasUnitTest || hasE2ETest ? 'partial' : 'none'
    };
  });
  
  // Analyze feature test coverage
  CONFIG.applicationFeatures.forEach(feature => {
    const relatedComponentTests = testFiles.component.filter(file => file.includes(feature));
    const relatedE2ETests = testFiles.e2e.filter(file => file.includes(feature));
    
    coverage.features[feature] = {
      componentTests: relatedComponentTests.length,
      e2eTests: relatedE2ETests.length,
      testCoverage: relatedComponentTests.length > 0 && relatedE2ETests.length > 0 ? 'full' : 
                    relatedComponentTests.length > 0 || relatedE2ETests.length > 0 ? 'partial' : 'none'
    };
  });
  
  console.log(chalk.green('Test coverage analysis complete'));
  return coverage;
}

/**
 * Generate QA test suite for components without tests
 * 
 * @param {Object} components - Map of component paths
 * @param {Object} coverage - Test coverage analysis
 */
function generateComponentTests(components, coverage) {
  console.log(chalk.blue('Generating component tests...'));
  
  // Create test templates directory
  const templatesDir = 'qa-tests/templates';
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
  
  // Find components without tests
  const componentsWithoutTests = Object.keys(coverage.components)
    .filter(component => coverage.components[component].testCoverage === 'none');
  
  console.log(chalk.yellow(`Found ${componentsWithoutTests.length} components without tests`));
  
  // Generate test templates for components without tests
  componentsWithoutTests.forEach(component => {
    const componentPath = components[component];
    const relativeComponentPath = path.relative('src', componentPath)
      .replace(/\\/g, '/') // Normalize path separators
      .replace(/\.[^/.]+$/, ''); // Remove file extension
    
    // Create unit test template
    const unitTestPath = `qa-tests/unit/${component}.test.jsx`;
    const unitTestContent = `
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ${component} from '../../src/${relativeComponentPath}';

describe('${component}', () => {
  it('should render correctly', () => {
    render(<${component} />);
    // Add assertions for component rendering
  });

  it('should handle user interactions correctly', () => {
    render(<${component} />);
    // Add assertions for user interactions
  });

  it('should respond to prop changes correctly', () => {
    const { rerender } = render(<${component} />);
    // Test component with different props
    rerender(<${component} updatedProp="newValue" />);
    // Add assertions for updated rendering
  });
});
`;
    
    // Create component test template
    const componentTestPath = `qa-tests/component/${component}.cy.jsx`;
    const componentTestContent = `
import React from 'react';
import ${component} from '../../src/${relativeComponentPath}';

describe('${component} Component', () => {
  it('should render correctly in the browser', () => {
    cy.mount(<${component} />);
    // Add assertions for component rendering in the browser
  });

  it('should handle user interactions correctly', () => {
    cy.mount(<${component} />);
    // Add assertions for user interactions
  });

  it('should respond to prop changes correctly', () => {
    cy.mount(<${component} />);
    // Test component with different props
    // Add assertions for updated rendering
  });

  it('should meet accessibility standards', () => {
    cy.mount(<${component} />);
    cy.injectAxe();
    cy.checkA11y();
  });
});
`;
    
    // Only write files if they don't exist
    if (!fs.existsSync(unitTestPath)) {
      fs.mkdirSync(path.dirname(unitTestPath), { recursive: true });
      fs.writeFileSync(unitTestPath, unitTestContent.trim());
      console.log(chalk.green(`Generated unit test for ${component}`));
    }
    
    if (!fs.existsSync(componentTestPath)) {
      fs.mkdirSync(path.dirname(componentTestPath), { recursive: true });
      fs.writeFileSync(componentTestPath, componentTestContent.trim());
      console.log(chalk.green(`Generated component test for ${component}`));
    }
  });
}

/**
 * Generate E2E tests for pages without tests
 * 
 * @param {Object} pages - Map of page paths
 * @param {Object} coverage - Test coverage analysis
 */
function generatePageTests(pages, coverage) {
  console.log(chalk.blue('Generating page tests...'));
  
  // Find pages without E2E tests
  const pagesWithoutTests = Object.keys(coverage.pages)
    .filter(page => !coverage.pages[page].e2eTest);
  
  console.log(chalk.yellow(`Found ${pagesWithoutTests.length} pages without E2E tests`));
  
  // Generate E2E test templates for pages without tests
  pagesWithoutTests.forEach(page => {
    const pagePath = pages[page];
    const pageRoute = `/${page.toLowerCase().replace('page', '')}`;
    
    const e2eTestPath = `qa-tests/e2e/${page.toLowerCase()}.cy.js`;
    const e2eTestContent = `
/**
 * E2E test for ${page}
 * Generated as part of QA test suite
 */
describe('${page}', () => {
  beforeEach(() => {
    // Log in before tests if needed
    cy.login('testuser', 'password');
  });

  it('should load successfully', () => {
    cy.visit('${pageRoute}');
    cy.get('[data-testid="${page.toLowerCase()}"], [data-testid="${page.replace('Page', '').toLowerCase()}-page"]')
      .should('be.visible');
  });

  it('should have all required components', () => {
    cy.visit('${pageRoute}');
    // Add assertions for required components
  });

  it('should handle user interactions correctly', () => {
    cy.visit('${pageRoute}');
    // Add assertions for user interactions
  });

  it('should meet accessibility standards', () => {
    cy.visit('${pageRoute}');
    cy.injectAxe();
    cy.checkA11y();
  });

  it('should meet performance standards', () => {
    cy.visit('${pageRoute}', {
      onBeforeLoad: (win) => {
        // Start performance measurement
        win.performance.mark('start-load');
      },
      onLoad: (win) => {
        // End measurement
        win.performance.mark('end-load');
        win.performance.measure('page-load', 'start-load', 'end-load');
      }
    });
    
    // Verify performance
    cy.window().then((win) => {
      const measure = win.performance.getEntriesByName('page-load')[0];
      expect(measure.duration).to.be.lessThan(${CONFIG.qualityThresholds.performanceBudget.timeToInteractive});
    });
  });
});
`;
    
    // Only write file if it doesn't exist
    if (!fs.existsSync(e2eTestPath)) {
      fs.mkdirSync(path.dirname(e2eTestPath), { recursive: true });
      fs.writeFileSync(e2eTestPath, e2eTestContent.trim());
      console.log(chalk.green(`Generated E2E test for ${page}`));
    }
  });
}

/**
 * Generate feature-level tests
 * 
 * @param {Object} coverage - Test coverage analysis
 */
function generateFeatureTests(coverage) {
  console.log(chalk.blue('Generating feature tests...'));
  
  // Find features without full test coverage
  const featuresWithoutFullCoverage = CONFIG.applicationFeatures
    .filter(feature => coverage.features[feature].testCoverage !== 'full');
  
  console.log(chalk.yellow(`Found ${featuresWithoutFullCoverage.length} features without full test coverage`));
  
  // Generate feature test templates
  featuresWithoutFullCoverage.forEach(feature => {
    const featurePath = `qa-tests/features/${feature}`;
    if (!fs.existsSync(featurePath)) {
      fs.mkdirSync(featurePath, { recursive: true });
    }
    
    // Generate feature test file
    const featureTestPath = `${featurePath}/${feature}-workflow.cy.js`;
    const featureTestContent = `
/**
 * Feature test for ${feature}
 * Generated as part of QA test suite
 */
describe('${feature.replace(/-/g, ' ')} Feature', () => {
  beforeEach(() => {
    // Log in before tests if needed
    cy.login('testuser', 'password');
  });

  it('should complete the basic workflow successfully', () => {
    // Test basic workflow for ${feature}
  });

  it('should handle validation errors correctly', () => {
    // Test validation handling for ${feature}
  });

  it('should meet accessibility standards', () => {
    // Test accessibility for ${feature}
    cy.visit('/${feature.replace(/-/g, '/')}');
    cy.injectAxe();
    cy.checkA11y();
  });

  it('should meet performance standards', () => {
    // Test performance for ${feature}
  });

  it('should integrate correctly with other features', () => {
    // Test integration with other features
  });
});
`;
    
    // Only write file if it doesn't exist
    if (!fs.existsSync(featureTestPath)) {
      fs.writeFileSync(featureTestPath, featureTestContent.trim());
      console.log(chalk.green(`Generated feature test for ${feature}`));
    }
    
    // Generate feature test configuration
    const featureConfigPath = `${featurePath}/test-config.json`;
    const featureConfig = {
      feature: feature,
      testPriority: 'high',
      requiredPermissions: ['user'],
      testDependencies: [],
      testData: {
        validInputs: {},
        invalidInputs: {},
        expectedResults: {}
      }
    };
    
    // Only write file if it doesn't exist
    if (!fs.existsSync(featureConfigPath)) {
      fs.writeFileSync(featureConfigPath, JSON.stringify(featureConfig, null, 2));
      console.log(chalk.green(`Generated feature test configuration for ${feature}`));
    }
  });
}

/**
 * Generate comprehensive QA test report
 * 
 * @param {Object} coverage - Test coverage analysis
 */
function generateQAReport(coverage) {
  console.log(chalk.blue('Generating QA test report...'));
  
  const timestamp = getTimestamp();
  const reportPath = path.join(CONFIG.outputDirectories.summary, `qa-report-${timestamp}.md`);
  
  // Calculate coverage metrics
  const componentCoverage = Object.values(coverage.components)
    .filter(comp => comp.testCoverage === 'full' || comp.testCoverage === 'partial').length / 
    Object.keys(coverage.components).length * 100;
  
  const pageCoverage = Object.values(coverage.pages)
    .filter(page => page.testCoverage === 'full' || page.testCoverage === 'partial').length / 
    Object.keys(coverage.pages).length * 100;
  
  const featureCoverage = Object.values(coverage.features)
    .filter(feature => feature.testCoverage === 'full' || feature.testCoverage === 'partial').length / 
    Object.keys(coverage.features).length * 100;
  
  // Generate report content
  const reportContent = `# Comprehensive QA Test Suite Report

## Overview

Date: ${new Date().toISOString().split('T')[0]}
Generated By: QA Test Suite Generator

## Coverage Summary

| Category | Coverage | Status |
|----------|----------|--------|
| Components | ${componentCoverage.toFixed(2)}% | ${componentCoverage >= CONFIG.qualityThresholds.componentTestCoverage ? '✅' : '⚠️'} |
| Pages | ${pageCoverage.toFixed(2)}% | ${pageCoverage >= CONFIG.qualityThresholds.componentTestCoverage ? '✅' : '⚠️'} |
| Features | ${featureCoverage.toFixed(2)}% | ${featureCoverage >= CONFIG.qualityThresholds.criticalPathTestCoverage ? '✅' : '⚠️'} |

## Component Coverage

${Object.keys(coverage.components).length} total components, ${Object.values(coverage.components).filter(c => c.testCoverage === 'full').length} fully tested, ${Object.values(coverage.components).filter(c => c.testCoverage === 'partial').length} partially tested, ${Object.values(coverage.components).filter(c => c.testCoverage === 'none').length} untested.

### Components Needing Tests

${Object.keys(coverage.components)
  .filter(component => coverage.components[component].testCoverage === 'none')
  .map(component => `- ${component}`)
  .join('\n')}

## Page Coverage

${Object.keys(coverage.pages).length} total pages, ${Object.values(coverage.pages).filter(p => p.testCoverage === 'full').length} fully tested, ${Object.values(coverage.pages).filter(p => p.testCoverage === 'partial').length} partially tested, ${Object.values(coverage.pages).filter(p => p.testCoverage === 'none').length} untested.

### Pages Needing Tests

${Object.keys(coverage.pages)
  .filter(page => coverage.pages[page].testCoverage === 'none')
  .map(page => `- ${page}`)
  .join('\n')}

## Feature Coverage

${Object.keys(coverage.features).length} total features, ${Object.values(coverage.features).filter(f => f.testCoverage === 'full').length} fully tested, ${Object.values(coverage.features).filter(f => f.testCoverage === 'partial').length} partially tested, ${Object.values(coverage.features).filter(f => f.testCoverage === 'none').length} untested.

### Features Needing Tests

${Object.keys(coverage.features)
  .filter(feature => coverage.features[feature].testCoverage !== 'full')
  .map(feature => `- ${feature}: ${coverage.features[feature].componentTests} component tests, ${coverage.features[feature].e2eTests} E2E tests`)
  .join('\n')}

## Generated Tests

QA test templates have been generated in the \`qa-tests\` directory for:

- Components without unit or component tests
- Pages without E2E tests
- Features without comprehensive testing

## Next Steps

1. Review and implement the generated test templates
2. Run the test suite with \`npm run qa-test\`
3. Address any failing tests or accessibility issues
4. Update test coverage to meet quality thresholds

## Quality Requirements

- Unit Test Coverage: ${CONFIG.qualityThresholds.unitTestCoverage}%
- Component Test Coverage: ${CONFIG.qualityThresholds.componentTestCoverage}%
- Critical Path Test Coverage: ${CONFIG.qualityThresholds.criticalPathTestCoverage}%
- Visual Regression Threshold: ${CONFIG.qualityThresholds.visualRegressionThreshold}
- Max Allowed A11y Violations: ${CONFIG.qualityThresholds.maxAllowedA11yViolations}
- Performance Budget:
  - First Contentful Paint: ${CONFIG.qualityThresholds.performanceBudget.firstContentfulPaint}ms
  - Time to Interactive: ${CONFIG.qualityThresholds.performanceBudget.timeToInteractive}ms
  - Total Blocking Time: ${CONFIG.qualityThresholds.performanceBudget.totalBlockingTime}ms

This report was generated as part of our zero technical debt approach to quality assurance, ensuring comprehensive test coverage across all application components.
`;
  
  // Write report
  fs.writeFileSync(reportPath, reportContent);
  console.log(chalk.green(`QA report generated at ${reportPath}`));
  
  // Also save as latest report
  const latestReportPath = path.join(CONFIG.outputDirectories.summary, 'latest-qa-report.md');
  fs.writeFileSync(latestReportPath, reportContent);
  console.log(chalk.green(`Latest QA report updated at ${latestReportPath}`));
  
  return reportPath;
}

/**
 * Generate npm scripts for running QA tests
 */
function generateNpmScripts() {
  console.log(chalk.blue('Generating npm scripts for QA testing...'));
  
  // Get package.json
  const packageJsonPath = 'package.json';
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log(chalk.red('package.json not found, skipping npm script generation'));
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add QA test scripts
  const qaScripts = {
    'qa:unit': 'jest --config=qa-tests/jest.config.js',
    'qa:component': 'cypress run --component --config-file=qa-tests/cypress.config.js',
    'qa:e2e': 'cypress run --config-file=qa-tests/cypress.config.js',
    'qa:visual': 'percy exec -- cypress run --config-file=qa-tests/cypress.config.js --spec="qa-tests/visual/**/*.cy.js"',
    'qa:a11y': 'cypress run --config-file=qa-tests/cypress.config.js --spec="qa-tests/a11y/**/*.cy.js"',
    'qa:all': 'npm run qa:unit && npm run qa:component && npm run qa:e2e',
    'qa:report': 'node scripts/qa-test-suite.js --report-only'
  };
  
  // Add scripts to package.json if they don't exist
  let scriptsUpdated = false;
  
  Object.entries(qaScripts).forEach(([name, script]) => {
    if (!packageJson.scripts[name]) {
      packageJson.scripts[name] = script;
      scriptsUpdated = true;
    }
  });
  
  // Write updated package.json if scripts were added
  if (scriptsUpdated) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(chalk.green('Added QA test npm scripts to package.json'));
  } else {
    console.log(chalk.yellow('QA test npm scripts already exist in package.json'));
  }
}

/**
 * Generate Jest configuration for QA tests
 */
function generateTestConfig() {
  console.log(chalk.blue('Generating QA test configurations...'));
  
  // Create the test config directory
  const configDir = 'qa-tests';
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  // Generate Jest config
  const jestConfigPath = path.join(configDir, 'jest.config.js');
  const jestConfigContent = `module.exports = {
  testEnvironment: 'jsdom',
  roots: ['../qa-tests/unit'],
  setupFilesAfterEnv: ['../qa-tests/setup/jest.setup.js'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/../src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '../src/**/*.{js,jsx,ts,tsx}',
    '!../src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '!../src/tests/**/*',
    '!../src/*.js'
  ],
  coverageThreshold: {
    global: {
      statements: ${CONFIG.qualityThresholds.unitTestCoverage},
      branches: ${CONFIG.qualityThresholds.unitTestCoverage},
      functions: ${CONFIG.qualityThresholds.unitTestCoverage},
      lines: ${CONFIG.qualityThresholds.unitTestCoverage}
    }
  },
  coverageDirectory: '../${CONFIG.outputDirectories.testCoverage}'
};
`;
  
  // Only write file if it doesn't exist
  if (!fs.existsSync(jestConfigPath)) {
    fs.writeFileSync(jestConfigPath, jestConfigContent);
    console.log(chalk.green('Generated Jest configuration'));
  }
  
  // Create Jest setup file
  const jestSetupDir = path.join(configDir, 'setup');
  if (!fs.existsSync(jestSetupDir)) {
    fs.mkdirSync(jestSetupDir, { recursive: true });
  }
  
  const jestSetupPath = path.join(jestSetupDir, 'jest.setup.js');
  const jestSetupContent = `// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Mock any global browser APIs that Jest doesn't provide
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true
  })
);

// Add global test helpers
global.wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
`;
  
  // Only write file if it doesn't exist
  if (!fs.existsSync(jestSetupPath)) {
    fs.writeFileSync(jestSetupPath, jestSetupContent);
    console.log(chalk.green('Generated Jest setup file'));
  }
  
  // Generate Cypress config
  const cypressConfigPath = path.join(configDir, 'cypress.config.js');
  const cypressConfigContent = `const { defineConfig } = require('cypress');

module.exports = defineConfig({
  viewportWidth: 1280,
  viewportHeight: 720,
  defaultCommandTimeout: 10000,
  video: true,
  screenshotOnRunFailure: true,
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: '../${CONFIG.outputDirectories.e2eTests}',
    overwrite: false,
    html: true,
    json: true
  },
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: [
      'qa-tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
      'qa-tests/features/**/*.cy.{js,jsx,ts,tsx}',
      'qa-tests/visual/**/*.cy.{js,jsx,ts,tsx}',
      'qa-tests/a11y/**/*.cy.{js,jsx,ts,tsx}'
    ],
    setupNodeEvents(on, config) {
      // Register Cypress plugins
      // Configure Cypress tasks
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        saveTestResult({ type, name, result }) {
          // Save test result for reporting
          return null;
        }
      });
    }
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack'
    },
    specPattern: 'qa-tests/component/**/*.cy.{js,jsx,ts,tsx}'
  }
});
`;
  
  // Only write file if it doesn't exist
  if (!fs.existsSync(cypressConfigPath)) {
    fs.writeFileSync(cypressConfigPath, cypressConfigContent);
    console.log(chalk.green('Generated Cypress configuration'));
  }
  
  // Generate Cypress commands
  const cypressCommandsDir = path.join(configDir, 'support');
  if (!fs.existsSync(cypressCommandsDir)) {
    fs.mkdirSync(cypressCommandsDir, { recursive: true });
  }
  
  const cypressCommandsPath = path.join(cypressCommandsDir, 'commands.js');
  const cypressCommandsContent = `// Cypress custom commands for QA testing

// Login command
Cypress.Commands.add('login', (username, password) => {
  cy.session([username, password], () => {
    // Check if we need to log in
    cy.visit('/');
    cy.window().then(win => {
      if (win.localStorage.getItem('token')) {
        // Already logged in
        return;
      }
      
      // Go to login page
      cy.visit('/login');
      
      // Fill login form
      cy.get('[data-testid="username"], [name="username"], [placeholder="Username"]').type(username);
      cy.get('[data-testid="password"], [name="password"], [placeholder="Password"]').type(password);
      cy.get('[data-testid="submit-login"], [type="submit"]').click();
      
      // Wait for login to complete
      cy.url().should('not.include', '/login');
    });
  });
});

// Wait for page to fully load
Cypress.Commands.add('waitForPageLoad', () => {
  // Wait for the document ready state
  cy.document().should('have.property', 'readyState', 'complete');
  
  // Also wait for any loading indicators to disappear
  cy.get('[data-testid="loading-indicator"]').should('not.exist');
});

// Verify page performance
Cypress.Commands.add('verifyPerformance', (thresholds = {}) => {
  const defaultThresholds = {
    timeToInteractive: ${CONFIG.qualityThresholds.performanceBudget.timeToInteractive},
    firstContentfulPaint: ${CONFIG.qualityThresholds.performanceBudget.firstContentfulPaint},
    totalBlockingTime: ${CONFIG.qualityThresholds.performanceBudget.totalBlockingTime}
  };
  
  const performanceThresholds = { ...defaultThresholds, ...thresholds };
  
  // Get performance metrics
  cy.window().then((win) => {
    const performanceEntries = win.performance.getEntriesByType('navigation');
    if (performanceEntries.length > 0) {
      const navigationEntry = performanceEntries[0];
      
      // Log performance metrics
      cy.task('log', \`Page load: \${navigationEntry.duration}ms\`);
      cy.task('log', \`DOM Content Loaded: \${navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart}ms\`);
      
      // Verify metrics against thresholds
      expect(navigationEntry.duration).to.be.lessThan(
        performanceThresholds.timeToInteractive,
        \`Page load time should be less than \${performanceThresholds.timeToInteractive}ms\`
      );
    }
  });
});

// Take a visual snapshot with a descriptive name
Cypress.Commands.add('takeSnapshot', (name) => {
  // Include viewport size and browser info in the snapshot name
  const viewportWidth = Cypress.config('viewportWidth');
  const viewportHeight = Cypress.config('viewportHeight');
  const browser = Cypress.browser.name;
  
  const snapshotName = \`\${name} (\${browser} \${viewportWidth}x\${viewportHeight})\`;
  cy.percySnapshot(snapshotName);
});

// Check component structure
Cypress.Commands.add('verifyComponentStructure', (selector, expectedElements) => {
  cy.get(selector).within(() => {
    expectedElements.forEach(element => {
      cy.get(element).should('exist');
    });
  });
});

// Test common interactions
Cypress.Commands.add('testInteractions', (selector, interactions) => {
  cy.get(selector).within(() => {
    interactions.forEach(interaction => {
      const { element, action, value, assertion } = interaction;
      
      // Perform the interaction
      if (action === 'click') {
        cy.get(element).click();
      } else if (action === 'type') {
        cy.get(element).type(value);
      } else if (action === 'select') {
        cy.get(element).select(value);
      }
      
      // Verify the result
      if (assertion) {
        const { target, condition, expected } = assertion;
        cy.get(target).should(condition, expected);
      }
    });
  });
});
`;
  
  // Only write file if it doesn't exist
  if (!fs.existsSync(cypressCommandsPath)) {
    fs.writeFileSync(cypressCommandsPath, cypressCommandsContent);
    console.log(chalk.green('Generated Cypress commands'));
  }
  
  // Create Cypress support index file
  const cypressIndexPath = path.join(cypressCommandsDir, 'e2e.js');
  const cypressIndexContent = `// Import Cypress commands and plugins
import './commands';
import 'cypress-axe';
`;
  
  // Only write file if it doesn't exist
  if (!fs.existsSync(cypressIndexPath)) {
    fs.writeFileSync(cypressIndexPath, cypressIndexContent);
    console.log(chalk.green('Generated Cypress support index'));
  }
}

/**
 * Main function to run the QA test suite generator
 * 
 * @param {Object} options - Command line options
 */
function main(options = {}) {
  console.log(chalk.blue.bold('Starting QA Test Suite Generator...'));
  
  // Create initial directories
  if (!options.reportOnly) {
    // Find components and pages
    const components = findAllComponents();
    const pages = findAllPages();
    
    // Find existing tests
    const testFiles = findExistingTests();
    
    // Analyze test coverage
    const coverage = analyzeTestCoverage(components, pages, testFiles);
    
    // Generate missing tests
    generateComponentTests(components, coverage);
    generatePageTests(pages, coverage);
    generateFeatureTests(coverage);
    
    // Generate test configuration
    generateTestConfig();
    
    // Generate npm scripts
    generateNpmScripts();
    
    // Generate QA report
    const reportPath = generateQAReport(coverage);
    console.log(chalk.green.bold(`QA Test Suite Generator complete! Report available at ${reportPath}`));
  } else {
    // Report only mode - just generate the report
    const components = findAllComponents();
    const pages = findAllPages();
    const testFiles = findExistingTests();
    const coverage = analyzeTestCoverage(components, pages, testFiles);
    const reportPath = generateQAReport(coverage);
    console.log(chalk.green.bold(`QA Report generated at ${reportPath}`));
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  reportOnly: args.includes('--report-only')
};

// Run the generator
main(options);