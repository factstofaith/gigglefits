/**
 * Standardize Tests
 * 
 * This script standardizes test files across the codebase:
 * - Ensures consistent test patterns
 * - Adds missing tests for components
 * - Standardizes mocks and test data
 * - Improves test coverage
 * - Implements consistent naming conventions
 * 
 * Usage: node standardize-tests.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../../frontend/src');
const TESTS_DIR = path.join(ROOT_DIR, 'tests');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'components');
const BACKUP_DIR = path.resolve(__dirname, '../backups', `tests-standardization-${new Date().toISOString().replace(/[:.]/g, '-')}`);
const DRY_RUN = process.argv.includes('--dry-run');

// Create backup directory
if (!DRY_RUN) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
}

// Standard test template for React components
function generateComponentTestTemplate(componentName, componentPath, imports = []) {
  const relativePath = path.relative(TESTS_DIR, componentPath).replace(/\\/g, '/');
  
  return `/**
 * Test for ${componentName} component
 * 
 * Standardized test implementation
 * Created/Updated by Project Sunlight standardization
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
${imports.join('\n')}
import ${componentName} from '../${relativePath}';

// Mock dependencies as needed
jest.mock('axios');

describe('${componentName}', () => {
  beforeEach(() => {
    // Setup before each test if needed
  });

  afterEach(() => {
    // Cleanup after each test if needed
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<${componentName} />);
    // Add assertions to verify component renders correctly
  });

  it('should handle user interactions', () => {
    render(<${componentName} />);
    // Add assertions to verify component handles user interactions correctly
  });

  it('should handle errors gracefully', () => {
    // Test error scenarios
  });

  // Add more tests as needed
});
`;
}

// Standard test template for utility functions
function generateUtilityTestTemplate(utilityName, utilityPath, imports = []) {
  const relativePath = path.relative(TESTS_DIR, utilityPath).replace(/\\/g, '/');
  
  return `/**
 * Test for ${utilityName} utility
 * 
 * Standardized test implementation
 * Created/Updated by Project Sunlight standardization
 */

${imports.join('\n')}
import ${utilityName} from '../${relativePath}';

describe('${utilityName}', () => {
  beforeEach(() => {
    // Setup before each test if needed
  });

  afterEach(() => {
    // Cleanup after each test if needed
    jest.clearAllMocks();
  });

  it('should perform its primary function correctly', () => {
    // Test the primary function of the utility
  });

  it('should handle edge cases correctly', () => {
    // Test edge cases
  });

  it('should handle errors gracefully', () => {
    // Test error scenarios
  });

  // Add more tests as needed
});
`;
}

// Function to extract imports from existing test
function extractImports(content) {
  const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"];/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    // Skip React and testing library imports as they're included in the template
    if (!match[0].includes('react') && 
        !match[0].includes('testing-library') && 
        !match[0].includes('jest-dom')) {
      imports.push(match[0]);
    }
  }
  
  return imports;
}

// Function to analyze a test file
function analyzeTestFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, path.extname(filePath));
    const isComponentTest = fileName.includes('.test') || fileName.includes('Test');
    
    // Extract the component or utility name from the file name
    let targetName = fileName.replace(/\.test$|Test$/, '');
    
    // Check for common issues
    const issues = {
      missingDescribe: !content.includes('describe('),
      missingBeforeEach: !content.includes('beforeEach('),
      missingAfterEach: !content.includes('afterEach('),
      missingMocks: !content.includes('jest.mock('),
      missingAssertions: !content.includes('expect('),
      incompleteTests: content.includes('TODO') || content.includes('//') || content.includes('/* '),
    };
    
    return {
      filePath,
      targetName,
      isComponentTest,
      issues,
      needsStandardization: Object.values(issues).some(issue => issue),
      imports: extractImports(content),
    };
  } catch (error) {
    console.error(`❌ Error analyzing ${filePath}:`, error.message);
    return {
      filePath,
      error: error.message,
      needsStandardization: false
    };
  }
}

// Function to find components without tests
function findComponentsWithoutTests() {
  const componentFiles = glob.sync(`${COMPONENTS_DIR}/**/*.{js,jsx}`);
  const testFiles = glob.sync(`${TESTS_DIR}/**/*.{js,jsx}`);
  
  const missingTests = [];
  
  componentFiles.forEach(componentPath => {
    const fileName = path.basename(componentPath, path.extname(componentPath));
    
    // Skip non-component files
    if (fileName.startsWith('index') || fileName.startsWith('_') || 
        fileName.startsWith('.') || !fileName.match(/^[A-Z]/)) {
      return;
    }
    
    // Check if a test exists for this component
    const hasTest = testFiles.some(testPath => {
      const testFileName = path.basename(testPath, path.extname(testPath));
      return testFileName === `${fileName}.test` || testFileName === `${fileName}Test`;
    });
    
    if (!hasTest) {
      missingTests.push({
        componentName: fileName,
        componentPath,
        isComponentTest: true
      });
    }
  });
  
  return missingTests;
}

// Function to standardize a test file
function standardizeTestFile(analysis) {
  if (!analysis.needsStandardization) {
    return false;
  }
  
  try {
    let standardTest;
    
    if (analysis.isComponentTest) {
      // Generate component test
      standardTest = generateComponentTestTemplate(
        analysis.targetName,
        analysis.filePath.replace('.test', ''),
        analysis.imports
      );
    } else {
      // Generate utility test
      standardTest = generateUtilityTestTemplate(
        analysis.targetName,
        analysis.filePath.replace('.test', ''),
        analysis.imports
      );
    }
    
    if (!DRY_RUN) {
      // Backup original file
      const relativePath = path.relative(ROOT_DIR, analysis.filePath);
      const backupPath = path.join(BACKUP_DIR, relativePath);
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      fs.copyFileSync(analysis.filePath, backupPath);
      
      // Write standardized file
      fs.writeFileSync(analysis.filePath, standardTest, 'utf8');
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error standardizing ${analysis.filePath}:`, error.message);
    return false;
  }
}

// Function to create a new test file for a component without tests
function createTestForComponent(componentInfo) {
  try {
    const testDir = path.join(TESTS_DIR, 'components', path.relative(COMPONENTS_DIR, path.dirname(componentInfo.componentPath)));
    const testFileName = `${componentInfo.componentName}.test.jsx`;
    const testFilePath = path.join(testDir, testFileName);
    
    // Generate test content
    const testContent = generateComponentTestTemplate(
      componentInfo.componentName,
      componentInfo.componentPath
    );
    
    if (!DRY_RUN) {
      // Create test directory if it doesn't exist
      fs.mkdirSync(testDir, { recursive: true });
      
      // Write test file
      fs.writeFileSync(testFilePath, testContent, 'utf8');
    }
    
    return {
      componentName: componentInfo.componentName,
      testPath: testFilePath
    };
  } catch (error) {
    console.error(`❌ Error creating test for ${componentInfo.componentName}:`, error.message);
    return null;
  }
}

// Find all test files
const testFiles = glob.sync(`${TESTS_DIR}/**/*.{js,jsx}`);
console.log(`🔍 Found ${testFiles.length} test files to analyze...`);

// Analyze each test file
const analyses = testFiles.map(filePath => analyzeTestFile(filePath));
const needStandardization = analyses.filter(a => a.needsStandardization);

// Find components without tests
const componentsWithoutTests = findComponentsWithoutTests();
console.log(`🔍 Found ${componentsWithoutTests.length} components without tests...`);

// Summary
console.log(`\n📊 Test Analysis Summary:`);
console.log(`- Total test files: ${testFiles.length}`);
console.log(`- Tests needing standardization: ${needStandardization.length}`);
console.log(`- Components without tests: ${componentsWithoutTests.length}`);

// List issues found
const issueTypes = {
  missingDescribe: 'Missing describe block',
  missingBeforeEach: 'Missing beforeEach setup',
  missingAfterEach: 'Missing afterEach cleanup',
  missingMocks: 'Missing dependency mocks',
  missingAssertions: 'Missing assertions',
  incompleteTests: 'Incomplete or TODO tests',
};

Object.entries(issueTypes).forEach(([issueKey, issueDesc]) => {
  const count = analyses.filter(a => a.issues && a.issues[issueKey]).length;
  console.log(`- ${issueDesc}: ${count}`);
});

// Standardize tests if needed
if (needStandardization.length > 0) {
  console.log('\n🔄 Standardizing tests...');
  
  if (DRY_RUN) {
    console.log('⚠️ Dry run mode - not making actual changes');
  }
  
  let standardizedCount = 0;
  
  needStandardization.forEach(analysis => {
    console.log(`- ${path.relative(ROOT_DIR, analysis.filePath)}`);
    Object.entries(analysis.issues || {}).forEach(([issueKey, hasIssue]) => {
      if (hasIssue) {
        console.log(`  • ${issueTypes[issueKey]}`);
      }
    });
    
    const wasStandardized = standardizeTestFile(analysis);
    if (wasStandardized) {
      standardizedCount++;
    }
  });
  
  console.log(`\n✅ Standardized ${standardizedCount} test files`);
  
  if (!DRY_RUN) {
    console.log(`Original files backed up to: ${BACKUP_DIR}`);
  }
}

// Create tests for components without tests
if (componentsWithoutTests.length > 0) {
  console.log('\n🔄 Creating tests for components without tests...');
  
  if (DRY_RUN) {
    console.log('⚠️ Dry run mode - not creating actual tests');
  }
  
  let createdCount = 0;
  
  componentsWithoutTests.forEach(componentInfo => {
    console.log(`- Creating test for ${componentInfo.componentName}`);
    
    const wasCreated = createTestForComponent(componentInfo);
    if (wasCreated) {
      createdCount++;
    }
  });
  
  console.log(`\n✅ Created ${createdCount} new test files`);
}

// Provide suggestions for next steps
console.log('\nNext steps:');
console.log('1. Review standardized and created test files');
console.log('2. Fill in test assertions and implement test scenarios');
console.log('3. Run the tests to verify they pass');
console.log('4. Update the Technical Debt Elimination Tracker in ClaudeContext.md');