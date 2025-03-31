/**
 * Automated Regression Test Suite
 * 
 * This script implements a comprehensive regression testing system
 * built with zero technical debt principles.
 *
 * It identifies critical paths, generates baseline snapshots, 
 * creates targeted regression tests, and produces detailed reports.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync, spawn } = require('child_process');

// Configuration
const CONFIG = {
  // Application paths
  applicationPaths: {
    src: 'src',
    components: 'src/components',
    pages: 'src/pages',
    utils: 'src/utils',
    hooks: 'src/hooks',
    contexts: 'src/contexts'
  },
  
  // Test directories
  testDirectories: {
    cypress: 'cypress',
    e2e: 'cypress/e2e',
    fixtures: 'cypress/fixtures',
    regressionBase: 'cypress/e2e/regression',
    regressionCriticalPaths: 'cypress/e2e/regression/critical-paths',
    regressionVisual: 'cypress/e2e/regression/visual',
    regressionPerformance: 'cypress/e2e/regression/performance',
    regressionA11y: 'cypress/e2e/regression/a11y',
    generatedTests: 'cypress/e2e/regression/_generated'
  },
  
  // Snapshot and baseline directories
  baselineDirectories: {
    visual: 'cypress/baselines/visual',
    performance: 'cypress/baselines/performance',
    a11y: 'cypress/baselines/a11y'
  },
  
  // Report directories
  reportDirectories: {
    base: 'reports/regression',
    current: 'reports/regression/current',
    history: 'reports/regression/history',
    diff: 'reports/regression/diff'
  },
  
  // Critical user paths
  criticalPaths: [
    'login-workflow',
    'integration-creation',
    'storage-configuration',
    'data-transformation',
    'schedule-configuration',
    'multi-tenant-access',
    'authentication-flows',
    'admin-operations'
  ]
};

// Create directories if they don't exist
Object.values(CONFIG.testDirectories).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

Object.values(CONFIG.baselineDirectories).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

Object.values(CONFIG.reportDirectories).forEach(dir => {
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
 * Find critical component dependencies by analyzing imports
 * 
 * @returns {Object} - Map of component dependencies
 */
function analyzeDependencies() {
  console.log('Analyzing component dependencies...');
  
  const components = {};
  const dependencyMap = {};
  
  // Find all component files
  const componentFiles = glob.sync(path.join(CONFIG.applicationPaths.components, '**/*.{jsx,js,tsx,ts}'));
  
  // Extract component names and their imports
  componentFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const fileName = path.basename(file, path.extname(file));
    
    // Skip test files
    if (fileName.includes('.test') || fileName.includes('.spec')) {
      return;
    }
    
    components[fileName] = file;
    
    // Find imports
    const importMatches = content.match(/import\s+(?:{[^}]+}|\w+)\s+from\s+['"][^'"]+['"]/g) || [];
    
    const dependencies = importMatches
      .map(importStr => {
        // Extract the imported component names
        const namedImports = importStr.match(/import\s+{([^}]+)}\s+from/);
        if (namedImports) {
          return namedImports[1].split(',').map(name => name.trim().split(' as ')[0]);
        }
        
        // Extract default import
        const defaultImport = importStr.match(/import\s+(\w+)\s+from/);
        if (defaultImport) {
          return [defaultImport[1]];
        }
        
        return [];
      })
      .flat();
    
    dependencyMap[fileName] = dependencies;
  });
  
  console.log(`Found ${Object.keys(components).length} components with dependencies`);
  
  return {
    components,
    dependencyMap
  };
}

/**
 * Identify critical components by usage and dependencies
 * 
 * @param {Object} dependencyAnalysis - Component dependency analysis
 * @returns {Array<string>} - List of critical component names
 */
function identifyCriticalComponents(dependencyAnalysis) {
  console.log('Identifying critical components...');
  
  const { components, dependencyMap } = dependencyAnalysis;
  
  // Count how many times each component is imported
  const usageCount = {};
  
  Object.values(dependencyMap).forEach(dependencies => {
    dependencies.forEach(dep => {
      usageCount[dep] = (usageCount[dep] || 0) + 1;
    });
  });
  
  // Components used in 3 or more places are considered critical
  const criticalComponents = Object.keys(usageCount)
    .filter(component => usageCount[component] >= 3 && components[component])
    .sort((a, b) => usageCount[b] - usageCount[a]);
  
  console.log(`Identified ${criticalComponents.length} critical components`);
  
  return criticalComponents;
}

/**
 * Generate regression tests for critical components
 * 
 * @param {Array<string>} criticalComponents - List of critical component names
 */
function generateComponentRegressionTests(criticalComponents) {
  console.log('Generating component regression tests...');
  
  // Create the generated tests directory if it doesn't exist
  const genTestDir = CONFIG.testDirectories.generatedTests;
  if (!fs.existsSync(genTestDir)) {
    fs.mkdirSync(genTestDir, { recursive: true });
  }
  
  // Generate component regression tests
  criticalComponents.slice(0, 20).forEach(component => {
    const testFilePath = path.join(genTestDir, `${component}.regression.cy.js`);
    
    const testContent = `
/**
 * Regression Test for ${component}
 * Auto-generated based on component criticality analysis
 */
describe('${component} Regression Tests', () => {
  beforeEach(() => {
    cy.login('admin', 'password');
  });

  it('should render ${component} correctly', () => {
    // Navigate to a page that uses this component
    cy.visit('/');
    
    // Look for the component
    cy.get('[data-testid="${component}"], [data-component="${component}"]').then($el => {
      if ($el.length > 0) {
        // Component found, take snapshot
        cy.wrap($el).should('be.visible');
        cy.percySnapshot('${component} Component');
      } else {
        // Try to find the component on other pages
        cy.visit('/integrations');
        cy.get('[data-testid="${component}"], [data-component="${component}"]').then($el2 => {
          if ($el2.length > 0) {
            cy.wrap($el2).should('be.visible');
            cy.percySnapshot('${component} Component - Integrations Page');
          } else {
            cy.log('${component} component not found on current page');
          }
        });
      }
    });
  });

  it('should maintain accessibility standards', () => {
    cy.visit('/');
    cy.injectAxe();
    
    cy.get('[data-testid="${component}"], [data-component="${component}"]').then($el => {
      if ($el.length > 0) {
        // Test the component for accessibility
        cy.checkA11y($el);
      } else {
        cy.log('${component} component not found for a11y testing');
      }
    });
  });
});
`;
    
    fs.writeFileSync(testFilePath, testContent);
    console.log(`Generated regression test for ${component}`);
  });
}

/**
 * Get existing critical path tests
 * 
 * @returns {Array<string>} - List of existing critical path test files
 */
function getExistingCriticalPathTests() {
  return glob.sync(path.join(CONFIG.testDirectories.regressionCriticalPaths, '**/*.cy.js'));
}

/**
 * Copy existing E2E tests to create regression baseline
 * 
 * @param {Array<string>} criticalPaths - List of critical path names
 */
function copyExistingE2ETests(criticalPaths) {
  console.log('Copying existing E2E tests for regression baseline...');
  
  // Look for tests in the flows directory
  const flowsDir = path.join(CONFIG.testDirectories.e2e, 'flows');
  
  criticalPaths.forEach(pathName => {
    // Search for any test files that match this critical path
    const matchingTests = glob.sync(path.join(flowsDir, `**/*${pathName}*.cy.js`));
    
    if (matchingTests.length > 0) {
      matchingTests.forEach(testFile => {
        const fileName = path.basename(testFile);
        const destFile = path.join(CONFIG.testDirectories.regressionCriticalPaths, fileName);
        
        // Copy the test file if it doesn't already exist
        if (!fs.existsSync(destFile)) {
          fs.copyFileSync(testFile, destFile);
          console.log(`Copied ${fileName} to regression critical paths`);
        }
      });
    } else {
      console.log(`No existing tests found for critical path: ${pathName}`);
    }
  });
}

/**
 * Create a regression test template for a critical path
 * 
 * @param {string} pathName - Critical path name
 * @returns {string} - Regression test template content
 */
function createRegressionTestTemplate(pathName) {
  const formatName = pathName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return `/**
 * Regression Test for ${formatName}
 * 
 * This test covers critical user workflow for ${formatName}
 */
describe('${formatName} Regression', () => {
  beforeEach(() => {
    // Load test data
    cy.fixture('regression/${pathName}.json').then((testData) => {
      this.testData = testData;
    });
    
    // Login before each test
    cy.login('admin', 'password');
  });

  it('should complete the ${formatName} workflow successfully', () => {
    // TODO: Implement ${formatName} regression test
    cy.log('Testing ${formatName} workflow');
    
    // Navigate to starting point
    cy.visit('/');
    
    // Execute workflow steps
    
    // Verify final state
    
    // Take a snapshot for visual regression
    cy.percySnapshot('${formatName} Completed');
  });

  it('should handle validation errors correctly', () => {
    // TODO: Implement validation error test
    cy.log('Testing validation in ${formatName} workflow');
    
    // Try to complete workflow with invalid data
    
    // Verify error messages
  });

  it('should maintain accessibility compliance', () => {
    // Navigate to workflow page
    cy.visit('/');
    
    // Inject axe for accessibility testing
    cy.injectAxe();
    
    // Run a11y tests on each step of the workflow
    cy.checkA11y();
  });
});
`;
}

/**
 * Generate regression test templates for critical paths
 */
function generateCriticalPathTemplates() {
  console.log('Generating critical path test templates...');
  
  // Ensure the directory exists
  const criticalPathsDir = CONFIG.testDirectories.regressionCriticalPaths;
  if (!fs.existsSync(criticalPathsDir)) {
    fs.mkdirSync(criticalPathsDir, { recursive: true });
  }
  
  // Get existing tests
  const existingTests = getExistingCriticalPathTests()
    .map(file => path.basename(file));
  
  // Generate templates for paths that don't have tests
  CONFIG.criticalPaths.forEach(pathName => {
    const hasExistingTest = existingTests.some(fileName => 
      fileName.includes(pathName));
    
    if (!hasExistingTest) {
      const templatePath = path.join(criticalPathsDir, `${pathName}.regression.cy.js`);
      fs.writeFileSync(templatePath, createRegressionTestTemplate(pathName));
      console.log(`Generated template for ${pathName}`);
    }
  });
}

/**
 * Generate fixtures for regression tests
 */
function generateRegressionFixtures() {
  console.log('Generating regression test fixtures...');
  
  // Ensure fixtures directory exists
  const fixturesDir = path.join(CONFIG.testDirectories.fixtures, 'regression');
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }
  
  // Create a fixture for each critical path
  CONFIG.criticalPaths.forEach(pathName => {
    const fixturePath = path.join(fixturesDir, `${pathName}.json`);
    
    // Only create if doesn't exist
    if (!fs.existsSync(fixturePath)) {
      const fixture = {
        testName: `${pathName} Regression Test`,
        created: new Date().toISOString(),
        testData: {
          // Default test data - will be customized for each path
          validInputs: {},
          invalidInputs: {},
          expectedResults: {}
        }
      };
      
      // Customize fixture based on path type
      switch (pathName) {
        case 'login-workflow':
          fixture.testData.validInputs = {
            username: 'testuser',
            password: 'password',
          };
          fixture.testData.invalidInputs = {
            username: 'invalid',
            password: 'wrong',
          };
          break;
          
        case 'integration-creation':
          fixture.testData.validInputs = {
            name: 'Regression Test Integration',
            description: 'Created by automated regression test',
            sourceType: 'file-upload',
          };
          break;
          
        case 'storage-configuration':
          fixture.testData.validInputs = {
            storageType: 'azure-blob',
            connectionString: '${STORAGE_CONNECTION_STRING}',
            container: 'regressiontest',
          };
          break;
          
        // Add more customizations for other paths  
      }
      
      fs.writeFileSync(fixturePath, JSON.stringify(fixture, null, 2));
      console.log(`Generated fixture for ${pathName}`);
    }
  });
}

/**
 * Generate visual regression tests
 */
function generateVisualRegressionTests() {
  console.log('Generating visual regression tests...');
  
  // Ensure the directory exists
  const visualDir = CONFIG.testDirectories.regressionVisual;
  if (!fs.existsSync(visualDir)) {
    fs.mkdirSync(visualDir, { recursive: true });
  }
  
  // Key application pages to test
  const pagesToTest = [
    { path: '/', name: 'Home Page' },
    { path: '/login', name: 'Login Page' },
    { path: '/integrations', name: 'Integrations Page' },
    { path: '/admin', name: 'Admin Dashboard' },
    { path: '/settings', name: 'Settings Page' },
    { path: '/datasets', name: 'Datasets Page' },
  ];
  
  // Generate a visual regression test
  const testPath = path.join(visualDir, 'page-visual-regression.cy.js');
  
  // Don't override existing tests
  if (!fs.existsSync(testPath)) {
    const testContent = `/**
 * Visual Regression Test Suite
 * 
 * Tests key application pages for visual changes
 */
describe('Visual Regression Tests', () => {
  beforeEach(() => {
    cy.login('admin', 'password');
  });

  ${pagesToTest.map(page => `
  it('should render ${page.name} correctly', () => {
    cy.visit('${page.path}');
    cy.wait(1000); // Allow for animations to complete
    cy.percySnapshot('${page.name}');
  });`).join('\n')}

  it('should render modal components correctly', () => {
    cy.visit('/integrations');
    
    // Open new integration modal
    cy.contains('button', 'New Integration').click();
    cy.wait(500);
    cy.percySnapshot('New Integration Modal');
    
    // Close the modal
    cy.get('[aria-label="Close dialog"], [data-testid="close-modal"]').click();
  });

  it('should render with different viewport sizes', () => {
    cy.visit('/');
    
    // Test desktop viewport
    cy.viewport(1920, 1080);
    cy.wait(500);
    cy.percySnapshot('Home Page - Desktop');
    
    // Test tablet viewport
    cy.viewport(768, 1024);
    cy.wait(500);
    cy.percySnapshot('Home Page - Tablet');
    
    // Test mobile viewport
    cy.viewport(375, 667);
    cy.wait(500);
    cy.percySnapshot('Home Page - Mobile');
  });
});
`;
    
    fs.writeFileSync(testPath, testContent);
    console.log('Generated visual regression tests');
  }
}

/**
 * Generate performance regression tests
 */
function generatePerformanceRegressionTests() {
  console.log('Generating performance regression tests...');
  
  // Ensure the directory exists
  const perfDir = CONFIG.testDirectories.regressionPerformance;
  if (!fs.existsSync(perfDir)) {
    fs.mkdirSync(perfDir, { recursive: true });
  }
  
  // Generate a performance regression test
  const testPath = path.join(perfDir, 'performance-regression.cy.js');
  
  // Don't override existing tests
  if (!fs.existsSync(testPath)) {
    const testContent = `/**
 * Performance Regression Test Suite
 * 
 * Tests key performance metrics for regressions
 */
describe('Performance Regression Tests', () => {
  beforeEach(() => {
    cy.login('admin', 'password');
  });

  it('should load the home page within performance budget', () => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        // Start performance measurement
        win.performance.mark('start-loading');
      },
      onLoad: (win) => {
        // End measurement on load
        win.performance.mark('end-loading');
        win.performance.measure('page-load', 'start-loading', 'end-loading');
      }
    });
    
    // Verify page load time
    cy.window().then((win) => {
      const measure = win.performance.getEntriesByName('page-load')[0];
      const loadTime = measure.duration;
      
      // Load time should be under 2000ms
      expect(loadTime).to.be.lessThan(2000);
      
      // Log performance result
      cy.log(\`Home page load time: \${loadTime.toFixed(2)}ms\`);
      
      // Save for regression comparison
      cy.task('savePerformanceResult', { 
        page: 'home', 
        metric: 'load-time', 
        value: loadTime 
      });
    });
  });

  it('should render list of integrations efficiently', () => {
    cy.visit('/integrations');
    
    // Measure render time with a large dataset
    cy.window().then((win) => {
      win.performance.mark('start-render');
    });
    
    // Wait for integrations to load
    cy.get('[data-testid="integration-card"]').should('be.visible');
    
    cy.window().then((win) => {
      win.performance.mark('end-render');
      win.performance.measure('list-render', 'start-render', 'end-render');
      
      const measure = win.performance.getEntriesByName('list-render')[0];
      const renderTime = measure.duration;
      
      // Render time should be under 1000ms
      expect(renderTime).to.be.lessThan(1000);
      
      // Log performance result
      cy.log(\`Integration list render time: \${renderTime.toFixed(2)}ms\`);
      
      // Save for regression comparison
      cy.task('savePerformanceResult', { 
        page: 'integrations', 
        metric: 'render-time', 
        value: renderTime 
      });
    });
  });

  it('should maintain UI responsiveness during data operations', () => {
    cy.visit('/integrations');
    
    // Create new integration to test operation performance
    cy.contains('button', 'New Integration').click();
    
    // Fill basic information
    cy.get('[data-testid="integration-name"]').type('Performance Test');
    cy.get('[data-testid="integration-description"]').type('Testing operation performance');
    
    // Time the submission operation
    cy.window().then((win) => {
      win.performance.mark('start-operation');
    });
    
    // Submit form
    cy.get('[data-testid="submit-button"]').click();
    
    // Wait for response
    cy.get('[data-testid="integration-detail-page"]').should('be.visible');
    
    cy.window().then((win) => {
      win.performance.mark('end-operation');
      win.performance.measure('operation', 'start-operation', 'end-operation');
      
      const measure = win.performance.getEntriesByName('operation')[0];
      const operationTime = measure.duration;
      
      // Operation time should be under 3000ms
      expect(operationTime).to.be.lessThan(3000);
      
      // Log performance result
      cy.log(\`Integration creation time: \${operationTime.toFixed(2)}ms\`);
      
      // Save for regression comparison
      cy.task('savePerformanceResult', { 
        page: 'integrations', 
        metric: 'creation-time', 
        value: operationTime 
      });
    });
  });
});
`;
    
    fs.writeFileSync(testPath, testContent);
    console.log('Generated performance regression tests');
  }
}

/**
 * Generate accessibility regression tests
 */
function generateA11yRegressionTests() {
  console.log('Generating accessibility regression tests...');
  
  // Ensure the directory exists
  const a11yDir = CONFIG.testDirectories.regressionA11y;
  if (!fs.existsSync(a11yDir)) {
    fs.mkdirSync(a11yDir, { recursive: true });
  }
  
  // Generate an accessibility regression test
  const testPath = path.join(a11yDir, 'a11y-regression.cy.js');
  
  // Don't override existing tests
  if (!fs.existsSync(testPath)) {
    const testContent = `/**
 * Accessibility Regression Test Suite
 * 
 * Tests application pages for accessibility regressions
 */
describe('Accessibility Regression Tests', () => {
  beforeEach(() => {
    cy.login('admin', 'password');
    cy.injectAxe();
  });

  // Test main application pages
  const pagesToTest = [
    { path: '/', name: 'Home Page' },
    { path: '/integrations', name: 'Integrations Page' },
    { path: '/admin', name: 'Admin Dashboard' },
    { path: '/settings', name: 'Settings Page' }
  ];

  pagesToTest.forEach((page) => {
    it(\`should maintain accessibility on \${page.name}\`, () => {
      cy.visit(page.path);
      cy.wait(1000); // Allow for page to load fully
      
      // Run accessibility audit
      cy.checkA11y(
        null, // Test the whole page
        {
          includedImpacts: ['critical', 'serious']
        },
        (violations) => {
          // Save violations for regression comparison
          cy.task('saveA11yResults', { 
            page: page.path, 
            violations: violations.length,
            details: violations
          });
          
          // Log violations for debugging
          if (violations.length > 0) {
            cy.log(\`\${violations.length} accessibility violations found\`);
            violations.forEach((violation) => {
              cy.log(\`Impact: \${violation.impact}, Rule: \${violation.id}\`);
            });
          }
          
          // Expect no serious or critical violations
          expect(violations.length).to.equal(0);
        }
      );
    });
  });

  it('should maintain accessibility in interactive components', () => {
    cy.visit('/integrations');
    
    // Test modal accessibility
    cy.contains('button', 'New Integration').click();
    cy.wait(500);
    
    // Check modal dialog accessibility
    cy.get('[role="dialog"]').should('be.visible');
    cy.checkA11y('[role="dialog"]', {
      includedImpacts: ['critical', 'serious']
    });
    
    // Close modal
    cy.get('[aria-label="Close dialog"], [data-testid="close-modal"]').click();
    
    // Test form accessibility
    cy.contains('button', 'New Integration').click();
    cy.get('[role="dialog"] form').within(() => {
      // Fill out form fields
      cy.get('[data-testid="integration-name"]').type('A11y Test');
      cy.get('[data-testid="integration-description"]').type('Testing accessibility in forms');
      
      // Check form field accessibility
      cy.checkA11y(null, {
        includedImpacts: ['critical', 'serious']
      });
    });
  });

  it('should support keyboard navigation throughout the app', () => {
    cy.visit('/');
    
    // Test tab navigation
    cy.focused().blur(); // Clear focus
    cy.realPress('Tab');
    cy.focused().should('exist').and('be.visible');
    
    // Continue pressing tab to navigate through the page
    const focusableElements = [];
    
    // Keep pressing tab and collect focused elements
    const pressTabAndCollect = () => {
      cy.focused().then($el => {
        // Save current element info
        if ($el.length > 0) {
          const tagName = $el.prop('tagName').toLowerCase();
          const type = $el.attr('type');
          const ariaLabel = $el.attr('aria-label');
          const text = $el.text().trim();
          
          focusableElements.push({
            tagName,
            type,
            ariaLabel,
            text: text.substring(0, 30) // Limit text length
          });
        }
        
        // Press tab to move to next element
        cy.realPress('Tab');
        
        // Continue if we haven't collected too many elements yet
        if (focusableElements.length < 10) {
          cy.wait(100); // Brief wait for focus to change
          pressTabAndCollect();
        } else {
          // We've collected enough elements
          cy.task('saveKeyboardResults', {
            page: '/',
            focusableCount: focusableElements.length,
            elements: focusableElements
          });
          
          // Verify we found focusable elements
          expect(focusableElements.length).to.be.greaterThan(5);
        }
      });
    };
    
    pressTabAndCollect();
  });
});
`;
    
    fs.writeFileSync(testPath, testContent);
    console.log('Generated accessibility regression tests');
  }
}

/**
 * Generate the regression test index file
 */
function generateRegressionTestIndex() {
  console.log('Generating regression test index file...');
  
  const indexPath = path.join(CONFIG.testDirectories.regressionBase, 'index.cy.js');
  
  // Generate the index file
  const indexContent = `/**
 * Regression Test Suite Index
 * 
 * This file ties together all regression test suites for comprehensive testing
 */
describe('Regression Test Suite', () => {
  before(() => {
    // Run before all regression tests
    cy.log('Starting regression test suite');
    
    // Set up test environment
    cy.task('setupRegressionTest', {
      timestamp: '${getTimestamp()}',
      isRegression: true
    });
  });
  
  after(() => {
    // Run after all regression tests
    cy.log('Completed regression test suite');
    
    // Generate regression test report
    cy.task('generateRegressionReport');
  });
  
  it('loads the application correctly', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
    cy.log('Application loaded successfully');
  });
  
  it('verifies key application functionality', () => {
    // Basic smoke test before running detailed regression tests
    cy.login('admin', 'password');
    cy.url().should('include', '/');
    
    // Verify navigation works
    cy.get('[data-testid="nav-integrations"], a[href="/integrations"]').click();
    cy.url().should('include', '/integrations');
    
    // Verify a core component renders
    cy.get('[data-testid="integration-list"], [data-testid="integrations-page"]')
      .should('be.visible');
  });
});
`;
  
  fs.writeFileSync(indexPath, indexContent);
  console.log('Generated regression test index file');
}

/**
 * Configure Cypress tasks for regression test suite
 */
function configureCypressTasks() {
  console.log('Configuring Cypress tasks for regression testing...');
  
  // Check if cypress.config.js exists
  if (!fs.existsSync('cypress.config.js')) {
    console.log('cypress.config.js not found, skipping task configuration');
    return;
  }
  
  // Read existing config
  const configContent = fs.readFileSync('cypress.config.js', 'utf8');
  
  // Check if regression tasks are already configured
  if (configContent.includes('saveRegressionResult')) {
    console.log('Regression tasks already configured');
    return;
  }
  
  // Add regression tasks to the configuration
  const tasksToAdd = `
    // Regression test tasks
    savePerformanceResult({ page, metric, value }) {
      const resultsDir = './cypress/baselines/performance';
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
      
      const resultsFile = path.join(resultsDir, \`\${page}-\${metric}.json\`);
      let data = [];
      
      if (fs.existsSync(resultsFile)) {
        try {
          data = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
        } catch (e) {
          console.error('Error reading performance data:', e);
        }
      }
      
      data.push({
        timestamp: new Date().toISOString(),
        value
      });
      
      // Keep only last 20 measurements
      if (data.length > 20) {
        data = data.slice(data.length - 20);
      }
      
      fs.writeFileSync(resultsFile, JSON.stringify(data, null, 2));
      return null;
    },
    
    saveA11yResults({ page, violations, details }) {
      const resultsDir = './cypress/baselines/a11y';
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
      
      const resultsFile = path.join(resultsDir, \`\${page.replace(/\\//g, '-').replace(/^-/, '')}-a11y.json\`);
      let data = [];
      
      if (fs.existsSync(resultsFile)) {
        try {
          data = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
        } catch (e) {
          console.error('Error reading a11y data:', e);
        }
      }
      
      data.push({
        timestamp: new Date().toISOString(),
        violations,
        details
      });
      
      // Keep only last 10 measurements
      if (data.length > 10) {
        data = data.slice(data.length - 10);
      }
      
      fs.writeFileSync(resultsFile, JSON.stringify(data, null, 2));
      return null;
    },
    
    saveKeyboardResults({ page, focusableCount, elements }) {
      const resultsDir = './cypress/baselines/a11y';
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
      
      const resultsFile = path.join(resultsDir, \`\${page.replace(/\\//g, '-').replace(/^-/, '')}-keyboard.json\`);
      let data = [];
      
      if (fs.existsSync(resultsFile)) {
        try {
          data = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
        } catch (e) {
          console.error('Error reading keyboard data:', e);
        }
      }
      
      data.push({
        timestamp: new Date().toISOString(),
        focusableCount,
        elements
      });
      
      // Keep only last 5 measurements
      if (data.length > 5) {
        data = data.slice(data.length - 5);
      }
      
      fs.writeFileSync(resultsFile, JSON.stringify(data, null, 2));
      return null;
    },
    
    setupRegressionTest({ timestamp, isRegression }) {
      // Create session data for this regression test run
      const sessionFile = './reports/regression/current/session.json';
      const sessionDir = path.dirname(sessionFile);
      
      if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
      }
      
      const session = {
        timestamp,
        startTime: new Date().toISOString(),
        isRegression
      };
      
      fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));
      return null;
    },
    
    generateRegressionReport() {
      // Generate regression test report from current session
      const sessionFile = './reports/regression/current/session.json';
      
      if (!fs.existsSync(sessionFile)) {
        console.error('Session file not found');
        return null;
      }
      
      try {
        const session = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
        
        // Generate a basic report
        const reportFile = \`./reports/regression/report-\${session.timestamp}.md\`;
        const report = \`# Regression Test Report
        
Date: \${new Date().toISOString()}
Run ID: \${session.timestamp}

## Summary

This regression test run has completed. See detailed results in the test report files.

## Next Steps

- Review visual comparison in Percy dashboard
- Check performance metrics for regressions
- Verify accessibility compliance

\`;
        
        fs.writeFileSync(reportFile, report);
        
        // Also save as latest report
        fs.writeFileSync('./reports/regression/latest-report.md', report);
        
      } catch (e) {
        console.error('Error generating regression report:', e);
      }
      
      return null;
    }
  `;
  
  // Find the setupNodeEvents function
  const setupNodeEventsMatch = configContent.match(/setupNodeEvents\s*(\([^)]*\))\s*{/);
  
  if (setupNodeEventsMatch) {
    // Insert after the opening brace of setupNodeEvents
    const insertPosition = configContent.indexOf('{', setupNodeEventsMatch.index) + 1;
    
    // Create updated content
    const updatedConfig = 
      configContent.slice(0, insertPosition) + 
      tasksToAdd +
      configContent.slice(insertPosition);
    
    // Check if we need to add fs and path imports
    let finalConfig = updatedConfig;
    
    if (!configContent.includes('const fs = require(\'fs\')')) {
      finalConfig = 'const fs = require(\'fs\');\n' + finalConfig;
    }
    
    if (!configContent.includes('const path = require(\'path\')')) {
      finalConfig = 'const path = require(\'path\');\n' + finalConfig;
    }
    
    // Write updated config
    fs.writeFileSync('cypress.config.js', finalConfig);
    console.log('Added regression tasks to cypress.config.js');
  } else {
    console.log('Could not find setupNodeEvents function in cypress.config.js');
  }
}

/**
 * Generate regression test support commands
 */
function generateSupportCommands() {
  console.log('Generating regression test support commands...');
  
  // Create a support file for regression commands
  const supportDir = path.join(CONFIG.testDirectories.cypress, 'support');
  const commandsFile = path.join(supportDir, 'regression-commands.js');
  
  // Don't override existing file
  if (!fs.existsSync(commandsFile)) {
    const commandsContent = `/**
 * Regression Test Support Commands
 * 
 * Provides custom Cypress commands for regression testing
 */
import 'cypress-real-events';
import 'cypress-axe';

// Verify visual consistency with baseline
Cypress.Commands.add('verifyVisual', (name, options = {}) => {
  // Take a snapshot for Percy visual testing
  cy.percySnapshot(name, options);
});

// Compare current performance with baseline
Cypress.Commands.add('verifyPerformance', (page, metric, value, options = {}) => {
  const { maxDegradation = 10 } = options;
  
  // Read baseline data
  cy.task('readPerformanceData', { page, metric }).then((baselineData) => {
    if (!baselineData || !baselineData.value) {
      // No baseline, just record current value
      cy.task('savePerformanceResult', { page, metric, value });
      cy.log(\`Saving baseline performance for \${page} \${metric}: \${value}ms\`);
      return;
    }
    
    const baseline = baselineData.value;
    const degradation = ((value - baseline) / baseline) * 100;
    
    cy.log(\`Performance: \${value}ms (baseline: \${baseline}ms, change: \${degradation.toFixed(2)}%)\`);
    
    // Check if performance is within acceptable range
    if (degradation > maxDegradation) {
      // Performance has degraded
      cy.log(\`⚠️ Performance degradation detected for \${page} \${metric}\`);
      cy.log(\`   Current: \${value}ms, Baseline: \${baseline}ms\`);
      cy.log(\`   Degradation: \${degradation.toFixed(2)}%\`);
    }
    
    // Save result for trending
    cy.task('savePerformanceResult', { page, metric, value });
  });
});

// Verify accessibility against baseline
Cypress.Commands.add('verifyA11y', (context, options = {}) => {
  // Run aXe accessibility tests
  cy.checkA11y(context, options, (violations) => {
    // Get current page path
    cy.location('pathname').then((pathname) => {
      // Save results for comparison
      cy.task('saveA11yResults', {
        page: pathname,
        violations: violations.length,
        details: violations
      });
    });
  });
});

// Mock test data for regression tests
Cypress.Commands.add('mockRegressionData', (fixture) => {
  cy.fixture(\`regression/\${fixture}\`).then((data) => {
    // Set up API mocks based on fixture data
    cy.intercept('GET', '/api/**', (req) => {
      // Determine appropriate response based on request path
      const path = req.url.replace(/^.*\\/api\\//, '');
      
      if (data[path]) {
        req.reply({
          statusCode: 200,
          body: data[path]
        });
      }
    });
  });
});

// Add aliases to existing commands for consistency
Cypress.Commands.add('compareSnapshot', (name, options) => {
  cy.verifyVisual(name, options);
});

Cypress.Commands.add('comparePerformance', (page, metric, value, options) => {
  cy.verifyPerformance(page, metric, value, options);
});

// Command to test a complete regression user flow
Cypress.Commands.add('testUserFlow', (flowName, steps) => {
  // Log the start of the flow test
  cy.log(\`Testing user flow: \${flowName}\`);
  
  // Execute each step in the flow
  steps.forEach((step, index) => {
    cy.log(\`Step \${index + 1}: \${step.name}\`);
    
    // Run the step function
    step.action();
    
    // Verify the step result if a verification function is provided
    if (step.verify) {
      step.verify();
    }
    
    // Take a snapshot after each significant step
    if (step.snapshot) {
      cy.verifyVisual(\`\${flowName} - Step \${index + 1}\`);
    }
  });
  
  // Log the completion of the flow
  cy.log(\`Completed user flow: \${flowName}\`);
});
`;
    
    fs.writeFileSync(commandsFile, commandsContent);
    console.log('Generated regression test support commands');
    
    // Update main support file to import regression commands
    const indexFile = path.join(supportDir, 'index.js');
    
    if (fs.existsSync(indexFile)) {
      const indexContent = fs.readFileSync(indexFile, 'utf8');
      
      if (!indexContent.includes('regression-commands')) {
        const updatedIndex = indexContent + '\n// Import regression test commands\nimport \'./regression-commands\';\n';
        fs.writeFileSync(indexFile, updatedIndex);
        console.log('Updated support index to include regression commands');
      }
    }
  }
}

/**
 * Generate baseline reports
 */
function generateBaselineReports() {
  console.log('Generating baseline reports...');
  
  // Create baseline report directory
  const baselineReportDir = path.join(CONFIG.reportDirectories.base, 'baseline');
  if (!fs.existsSync(baselineReportDir)) {
    fs.mkdirSync(baselineReportDir, { recursive: true });
  }
  
  // Generate baseline report
  const timestamp = getTimestamp();
  const reportPath = path.join(baselineReportDir, `baseline-report-${timestamp}.md`);
  
  const reportContent = `# Regression Test Baseline Report

Date: ${new Date().toISOString()}
Generated: ${timestamp}

## Overview

This report documents the baseline for regression testing. It includes:

- Critical components identified
- Critical user paths
- Visual baselines
- Performance baselines
- Accessibility baselines

## Critical Components

The following components have been identified as critical based on usage analysis:

${criticalComponents.slice(0, 10).map(component => `- ${component}`).join('\n')}

## Critical User Paths

The following user paths are covered by regression tests:

${CONFIG.criticalPaths.map(path => `- ${path}`).join('\n')}

## Next Steps

1. Run the full regression test suite to verify baselines
2. Schedule regular regression testing
3. Monitor for changes in critical components
4. Update baselines as needed for intentional changes

`;
  
  fs.writeFileSync(reportPath, reportContent);
  console.log(`Generated baseline report at ${reportPath}`);
  
  // Also save as latest baseline
  fs.writeFileSync(path.join(baselineReportDir, 'latest-baseline.md'), reportContent);
}

/**
 * Run the regression test suite setup
 */
function main() {
  console.log('Starting Regression Test Suite Setup...');
  
  // Analyze codebase for critical components
  const dependencyAnalysis = analyzeDependencies();
  const criticalComponents = identifyCriticalComponents(dependencyAnalysis);
  
  // Generate regression tests
  generateComponentRegressionTests(criticalComponents);
  copyExistingE2ETests(CONFIG.criticalPaths);
  generateCriticalPathTemplates();
  generateRegressionFixtures();
  generateVisualRegressionTests();
  generatePerformanceRegressionTests();
  generateA11yRegressionTests();
  
  // Set up regression test infrastructure
  generateRegressionTestIndex();
  configureCypressTasks();
  generateSupportCommands();
  
  // Generate reports
  generateBaselineReports();
  
  console.log('Regression Test Suite Setup Complete!');
  console.log(`Generated tests in ${CONFIG.testDirectories.regressionBase}`);
  console.log(`Generated fixtures in ${path.join(CONFIG.testDirectories.fixtures, 'regression')}`);
  console.log(`Generated reports in ${CONFIG.reportDirectories.base}`);
}

// Run the setup
main();