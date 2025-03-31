/**
 * Visual Regression Testing Setup for TAP Integration Platform
 * 
 * This script sets up Percy for visual regression testing during the design system migration.
 * It creates baseline screenshots for components and configures the testing environment.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  // Components that have already been migrated and need baseline screenshots
  migratedComponents: [
    'IntegrationCreationDialog',
    'SaveAsTemplateDialog',
    'ValidationPanel',
    'AlertBox',
    'Toast',
    'ErrorBoundary',
    'UserProfile',
    'DatasetsManager',
    'WebhookSettings',
    'AzureBlobConfiguration',
    'FieldMappingEditor',
    'IntegrationDetailView',
    'IntegrationFlowCanvas',
    'IntegrationTableRow',
    'IntegrationTable'
  ],
  
  // Features to be migrated in priority order
  featurePriorities: [
    {
      name: 'Templates',
      components: [
        'TemplateShareDialog',
        'TemplateEditDialog',
        'TemplateLibrary',
        'TemplateCard',
        'TemplateSelector'
      ]
    },
    {
      name: 'Admin',
      components: [
        'TenantsManagerRefactored',
        'ApplicationsManagerRefactored',
        'ReleasesManagerRefactored',
        'DatasetsManagerRefactored'
      ]
    },
    {
      name: 'Settings',
      components: [
        'UserSettingsPageRefactored',
        'NotificationSettings'
      ]
    },
    {
      name: 'Dashboard',
      components: [
        'HomePageRefactored',
        'DashboardCard',
        'StatusDisplay'
      ]
    }
  ]
};

/**
 * Generates Percy snapshot configuration for components
 */
function generatePercyConfig() {
  const percyConfig = {
    version: 2,
    snapshot: {
      widths: [375, 768, 1280],
      minHeight: 1024,
      percyCSS: '',
      enableJavaScript: true
    },
    discovery: {
      allowedHostnames: [],
      disallowedHostnames: [],
      networkIdleTimeout: 500
    },
    'static': {
      baseUrl: '/',
      files: 'build/**'
    }
  };

  const configPath = path.join(process.cwd(), '.percy.yml');
  const configContent = JSON.stringify(percyConfig, null, 2);
  
  console.log('Writing Percy configuration to .percy.yml');
  fs.writeFileSync(configPath, configContent);
}

/**
 * Generate snapshot test files for already migrated components
 */
function generateBaselineTests() {
  const testDir = path.join(process.cwd(), 'src/tests/visual');
  
  // Create test directory if it doesn't exist
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  // Create baseline test file
  const baselineTestPath = path.join(testDir, 'baseline-snapshots.test.jsx');
  
  let testContent = `
import React from 'react';
import { render } from '@testing-library/react';
import { percySnapshot } from '@percy/react';

// Import migrated components
${config.migratedComponents.map(comp => `import ${comp} from '../../components/${getComponentPath(comp)}';`).join('\n')}

describe('Visual Regression Baseline Tests', () => {
  // Create baseline snapshots for already migrated components
  ${config.migratedComponents.map(comp => `
  it('${comp} matches baseline visual snapshot', async () => {
    const { container } = render(<${comp} />);
    await percySnapshot('${comp} - baseline', { scope: container });
  });`).join('\n  ')}
});

// Helper function to create mock props for components that require them
function createMockProps(componentName) {
  // Add mock props for components as needed
  switch(componentName) {
    case 'IntegrationCreationDialog':
      return {
        open: true,
        onClose: () => {},
        onSubmit: () => {}
      };
    // Add cases for other components as needed
    default:
      return {};
  }
}
`;

  console.log(`Writing baseline visual tests to ${baselineTestPath}`);
  fs.writeFileSync(baselineTestPath, testContent);
  
  // Create test for Template feature components (next to be migrated)
  const templatesTestPath = path.join(testDir, 'templates-feature.test.jsx');
  const templateFeature = config.featurePriorities.find(f => f.name === 'Templates');
  
  let templatesTestContent = `
import React from 'react';
import { render } from '@testing-library/react';
import { percySnapshot } from '@percy/react';

// Import Template feature components
${templateFeature.components.map(comp => `import ${comp} from '../../components/integration/${comp}';`).join('\n')}

describe('Templates Feature Visual Tests', () => {
  // Create snapshots for Template feature components
  ${templateFeature.components.map(comp => `
  it('${comp} matches visual snapshot', async () => {
    const { container } = render(<${comp} {...createMockProps('${comp}')} />);
    await percySnapshot('${comp}', { scope: container });
  });`).join('\n  ')}
});

// Helper function to create mock props for components that require them
function createMockProps(componentName) {
  // Add mock props for Template components
  switch(componentName) {
    case 'TemplateShareDialog':
      return {
        open: true,
        onClose: () => {},
        template: { id: 1, name: 'Test Template', description: 'Test Description' }
      };
    case 'TemplateEditDialog':
      return {
        open: true,
        onClose: () => {},
        template: { id: 1, name: 'Test Template', description: 'Test Description' }
      };
    case 'TemplateLibrary':
      return {
        templates: [
          { id: 1, name: 'Template 1', description: 'Description 1' },
          { id: 2, name: 'Template 2', description: 'Description 2' }
        ]
      };
    case 'TemplateCard':
      return {
        template: { id: 1, name: 'Template 1', description: 'Description 1' },
        onSelect: () => {}
      };
    case 'TemplateSelector':
      return {
        onSelect: () => {},
        selectedTemplateId: 1
      };
    default:
      return {};
  }
}
`;

  console.log(`Writing Templates feature visual tests to ${templatesTestPath}`);
  fs.writeFileSync(templatesTestPath, templatesTestContent);
}

/**
 * Helper function to get the component file path
 */
function getComponentPath(componentName) {
  // Map component names to their file paths (simplified for example)
  const componentPaths = {
    'IntegrationCreationDialog': 'integration/IntegrationCreationDialog',
    'SaveAsTemplateDialog': 'integration/SaveAsTemplateDialog',
    'ValidationPanel': 'integration/ValidationPanel',
    'AlertBox': 'common/AlertBox',
    'Toast': 'common/Toast',
    'ErrorBoundary': 'common/ErrorBoundary',
    'UserProfile': 'common/UserProfile',
    'DatasetsManager': 'admin/DatasetsManager',
    'WebhookSettings': 'integration/WebhookSettings',
    'AzureBlobConfiguration': 'integration/AzureBlobConfiguration',
    'FieldMappingEditor': 'integration/FieldMappingEditor',
    'IntegrationDetailView': 'integration/IntegrationDetailView',
    'IntegrationFlowCanvas': 'integration/IntegrationFlowCanvas',
    'IntegrationTableRow': 'integration/IntegrationTableRow',
    'IntegrationTable': 'integration/IntegrationTable'
  };
  
  return componentPaths[componentName] || componentName;
}

/**
 * Update package.json with Percy dependencies and scripts
 */
function updatePackageJSON() {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJSON = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Add Percy dependencies
  packageJSON.devDependencies = packageJSON.devDependencies || {};
  packageJSON.devDependencies['@percy/cli'] = '^1.20.0';
  packageJSON.devDependencies['@percy/react'] = '^1.1.5';
  
  // Add Percy scripts
  packageJSON.scripts = packageJSON.scripts || {};
  packageJSON.scripts['test:visual'] = 'percy exec -- npm run test:percy';
  packageJSON.scripts['test:percy'] = 'react-scripts test --testMatch="**/tests/visual/**/*.test.{js,jsx}"';
  
  // Write updated package.json
  fs.writeFileSync(packagePath, JSON.stringify(packageJSON, null, 2));
  console.log('Updated package.json with Percy dependencies and scripts');
}

/**
 * Create CI integration file for GitHub Actions
 */
function createCIIntegration() {
  const workflowsDir = path.join(process.cwd(), '.github/workflows');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(workflowsDir)) {
    fs.mkdirSync(workflowsDir, { recursive: true });
  }
  
  const workflowPath = path.join(workflowsDir, 'visual-regression.yml');
  const workflowContent = `
name: Visual Regression Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  visual-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: npm run build
      
      - name: Percy Test
        run: npm run test:visual
        env:
          PERCY_TOKEN: \${{ secrets.PERCY_TOKEN }}
`;

  fs.writeFileSync(workflowPath, workflowContent);
  console.log('Created GitHub Actions workflow for visual regression testing');
}

/**
 * Generate documentation for the visual testing setup
 */
function generateDocumentation() {
  const docsPath = path.join(process.cwd(), 'src/docs/VisualRegressionTesting.md');
  const docsContent = `# Visual Regression Testing

This document provides information about the visual regression testing setup for the TAP Integration Platform design system migration.

## Overview

We use Percy for visual regression testing to ensure that our design system migration doesn't introduce unintended visual changes. This helps maintain consistency during the migration process and provides confidence that the new components look and behave as expected.

## Setup

1. **Installation:**
   
   The required dependencies should already be installed via package.json:
   
   \`\`\`bash
   npm install --save-dev @percy/cli @percy/react
   \`\`\`

2. **Environment Setup:**
   
   Set up your Percy token locally for testing:
   
   \`\`\`bash
   export PERCY_TOKEN=your_percy_token
   \`\`\`

3. **Running Tests:**
   
   Run visual regression tests:
   
   \`\`\`bash
   npm run test:visual
   \`\`\`

## Test Structure

Visual regression tests are located in \`src/tests/visual/\`:

- \`baseline-snapshots.test.jsx\`: Tests for components that have already been migrated
- \`templates-feature.test.jsx\`: Tests for Template feature components that are next in line for migration
- Additional feature-specific test files will be added as we progress

## Workflow

1. **Before Migration:**
   - Create a baseline snapshot of the component using the current implementation
   - This serves as the "before" state for comparison

2. **After Migration:**
   - Run the visual tests against the migrated component
   - Percy will highlight any visual differences for review
   - Approve or reject changes in the Percy dashboard

3. **Integration with CI:**
   - Visual tests run automatically on all pull requests
   - Changes are highlighted in PR comments
   - Tests must pass before merging

## Best Practices

1. **Component Isolation:**
   - Test components in isolation when possible
   - Use mock data to ensure consistent rendering
   - Control any random or time-based values

2. **Responsive Testing:**
   - Tests run at multiple viewport widths: 375px (mobile), 768px (tablet), and 1280px (desktop)
   - Review all viewport sizes when approving changes

3. **Approving Changes:**
   - Intentional visual changes should be reviewed and approved in Percy
   - Only approve changes that align with the design system specifications
   - Document reasons for approval in PR description

## Migration Process

As part of our feature-first migration approach, visual regression tests follow this workflow:

1. Create baseline snapshots for all components in a feature
2. Migrate components using design system legacy wrappers
3. Run visual tests to catch unintended changes
4. Approve intentional changes that align with design system
5. Merge only when visual tests pass with approved changes

## Resources

- [Percy Documentation](https://docs.percy.io/docs)
- [Percy React Integration](https://docs.percy.io/docs/react)
- [Visual Testing Best Practices](https://docs.percy.io/docs/visual-testing-best-practices)
`;

  fs.writeFileSync(docsPath, docsContent);
  console.log('Generated visual regression testing documentation');
}

/**
 * Main function to run the setup
 */
function main() {
  console.log('Setting up visual regression testing infrastructure...');
  
  generatePercyConfig();
  generateBaselineTests();
  updatePackageJSON();
  createCIIntegration();
  generateDocumentation();
  
  console.log('\nVisual regression testing setup complete!');
  console.log('\nNext steps:');
  console.log('1. Install new dependencies: npm install');
  console.log('2. Set up Percy token: export PERCY_TOKEN=your_token');
  console.log('3. Run visual tests: npm run test:visual');
  console.log('4. Begin migrating TemplateShareDialog component');
}

// Run the setup
main();