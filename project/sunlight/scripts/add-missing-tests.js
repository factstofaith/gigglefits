/**
 * Add Missing Tests Script
 * 
 * This script identifies and adds missing tests for components
 * that don't have corresponding test files.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Base paths
const FRONTEND_PATH = path.resolve(__dirname, '../../../frontend');
const SRC_PATH = path.join(FRONTEND_PATH, 'src');
const COMPONENTS_PATH = path.join(SRC_PATH, 'components');
const TESTS_PATH = path.join(SRC_PATH, 'tests');

// Create directories if they don't exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
}

// Find all component files
function findAllComponentFiles() {
  return glob.sync(`${COMPONENTS_PATH}/**/*.{jsx,js}`).filter(file => {
    // Filter out non-component files like helpers, utils, etc.
    const filename = path.basename(file);
    return !filename.includes('.test.') && 
           !filename.includes('.spec.') && 
           !filename.startsWith('index.');
  });
}

// Find existing test files
function findExistingTestFiles() {
  return glob.sync([
    `${TESTS_PATH}/**/*.test.{jsx,js}`,
    `${TESTS_PATH}/**/*.spec.{jsx,js}`,
    `${SRC_PATH}/**/*.test.{jsx,js}`,
    `${SRC_PATH}/**/*.spec.{jsx,js}`
  ]);
}

// Check if a component has a test
function hasTest(componentPath, testFiles) {
  const componentName = path.basename(componentPath, path.extname(componentPath));
  
  return testFiles.some(testFile => {
    const testFileName = path.basename(testFile);
    return testFileName.includes(componentName + '.test.') || 
           testFileName.includes(componentName + '.spec.');
  });
}

// Generate a test file for a component
function generateTestFile(componentPath) {
  const componentName = path.basename(componentPath, path.extname(componentPath));
  const componentDir = path.dirname(componentPath);
  const relativePath = path.relative(COMPONENTS_PATH, componentDir);
  
  // Create the test directory structure that mirrors the component structure
  const testDir = path.join(TESTS_PATH, 'components', relativePath);
  ensureDirectoryExists(testDir);
  
  // Create the test file
  const testFilePath = path.join(testDir, `${componentName}.test.jsx`);
  
  // Generate the test content
  const relativeCmpPath = path.relative(testDir, componentPath)
    .replace(/\\/g, '/')
    .replace(/\.jsx?$/, '');
  
  const testContent = `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ${componentName} from '${relativeCmpPath}';

// Mock dependencies as needed
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('${componentName} Component', () => {
  beforeEach(() => {
    // Set up any required props or mocks
  });

  afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks();
  });
  
  test('renders correctly', () => {
    render(<${componentName} />);
    
    // Add assertions based on the component
    expect(screen).toMatchSnapshot();
  });
  
  test('handles user interactions correctly', () => {
    render(<${componentName} />);
    
    // Add interaction tests based on the component
    // e.g., fireEvent.click(screen.getByRole('button'));
    
    // Add assertions for the expected behavior
  });
  
  test('responds to prop changes correctly', () => {
    const { rerender } = render(<${componentName} value="initial" />);
    
    // Verify initial state
    
    // Rerender with different props
    rerender(<${componentName} value="updated" />);
    
    // Verify updated state
  });
});
`;

  fs.writeFileSync(testFilePath, testContent, 'utf8');
  console.log(`✅ Created test file: ${testFilePath}`);
  
  return testFilePath;
}

// Main function to find missing tests and generate them
function addMissingTests(createTests = false) {
  console.log('🔍 Finding components without tests...');
  
  const componentFiles = findAllComponentFiles();
  const testFiles = findExistingTestFiles();
  
  console.log(`Found ${componentFiles.length} component files`);
  console.log(`Found ${testFiles.length} test files`);
  
  const componentsWithoutTests = componentFiles.filter(component => !hasTest(component, testFiles));
  
  console.log(`Found ${componentsWithoutTests.length} components without tests:`);
  componentsWithoutTests.forEach(component => {
    console.log(`  - ${path.relative(FRONTEND_PATH, component)}`);
  });
  
  if (createTests) {
    console.log('\n🔧 Creating missing test files...');
    
    const createdTests = componentsWithoutTests.map(component => generateTestFile(component));
    
    console.log(`\n✅ Created ${createdTests.length} test files!`);
  }
  
  return componentsWithoutTests;
}

// Main function
function main() {
  const createTests = process.argv.includes('--fix');
  const missingTests = addMissingTests(createTests);
  
  if (!createTests) {
    console.log('\nRun with --fix to create missing test files.');
  }
}

// Run the script
main();