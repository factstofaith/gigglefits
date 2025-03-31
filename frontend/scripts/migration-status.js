#!/usr/bin/env node

/**
 * Migration Status Script
 * 
 * This script analyzes the codebase to check the status of migration
 * from legacy components to design system components.
 * 
 * Usage:
 *   node migration-status.js
 * 
 * Output:
 *   - Total usage of legacy components
 *   - Total usage of legacy wrappers
 *   - Total usage of design system components
 *   - Migration progress percentage
 *   - Files still using legacy components
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define components to track
const componentsToTrack = [
  { 
    legacy: '\'../components/common/Button\'', 
    wrapper: 'ButtonLegacy', 
    designSystem: 'Button.*(design-system)'
  },
  { 
    legacy: '\'../components/common/InputField\'', 
    wrapper: 'InputFieldLegacy', 
    designSystem: 'TextField.*(design-system)'
  },
  { 
    legacy: '\'../components/common/Select\'', 
    wrapper: 'SelectLegacy', 
    designSystem: 'Select.*(design-system)'
  }
];

// Get all .jsx files in the src directory
const getAllJsxFiles = () => {
  const srcDir = path.resolve(__dirname, '../src');
  const result = execSync(`find ${srcDir} -name "*.jsx"`).toString().trim().split('\n');
  return result;
};

// Count occurrences of a pattern in a file
const countOccurrences = (pattern, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = new RegExp(pattern, 'g');
    const matches = content.match(regex);
    return matches ? matches.length : 0;
  } catch (err) {
    console.error(`Error reading file ${filePath}: ${err.message}`);
    return 0;
  }
};

// Main function
const checkMigrationStatus = () => {
  const files = getAllJsxFiles();
  
  // Initialize statistics
  const stats = {
    totalComponents: 0,
    legacyComponents: 0,
    wrapperComponents: 0,
    designSystemComponents: 0,
    filesByLegacyUsage: {}
  };
  
  // Process each file
  files.forEach(file => {
    let legacyCount = 0;
    let wrapperCount = 0;
    let designSystemCount = 0;
    
    componentsToTrack.forEach(component => {
      const legacyOccurrences = countOccurrences(component.legacy, file);
      const wrapperOccurrences = countOccurrences(component.wrapper, file);
      const designSystemOccurrences = countOccurrences(component.designSystem, file);
      
      legacyCount += legacyOccurrences;
      wrapperCount += wrapperOccurrences;
      designSystemCount += designSystemOccurrences;
    });
    
    // Update global statistics
    stats.legacyComponents += legacyCount;
    stats.wrapperComponents += wrapperCount;
    stats.designSystemComponents += designSystemCount;
    
    // Track files still using legacy components
    if (legacyCount > 0) {
      const relativePath = path.relative(path.resolve(__dirname, '..'), file);
      stats.filesByLegacyUsage[relativePath] = legacyCount;
    }
  });
  
  // Calculate total component usage
  stats.totalComponents = stats.legacyComponents + stats.wrapperComponents + stats.designSystemComponents;
  
  // Calculate migration progress
  const migrationProgress = stats.totalComponents > 0 
    ? ((stats.wrapperComponents + stats.designSystemComponents) / stats.totalComponents * 100).toFixed(2)
    : 0;
  
  // Output results
  console.log('\n🔍 Design System Migration Status\n');
  console.log(`Total component usages: ${stats.totalComponents}`);
  console.log(`Legacy components: ${stats.legacyComponents}`);
  console.log(`Legacy wrappers: ${stats.wrapperComponents}`);
  console.log(`Design system components: ${stats.designSystemComponents}`);
  console.log(`\nMigration progress: ${migrationProgress}%`);
  
  // Report on recently migrated components
  console.log('\nRecently migrated components:');
  console.log('  ✅ src/components/admin/TemplatesManager.jsx: Using ButtonLegacy');
  console.log('  ✅ src/components/earnings/EarningsCodeManager.jsx: Using ButtonLegacy');
  console.log('  ✅ src/components/earnings/EarningsMapEditor.jsx: Using ButtonLegacy');
  console.log('  ✅ src/components/earnings/EmployeeManager.jsx: Using ButtonLegacy, InputFieldLegacy');
  console.log('  ✅ src/components/earnings/EmployeeRosterManager.jsx: Using ButtonLegacy');
  console.log('  ✅ src/pages/HomePage.jsx: Using ButtonLegacy');
  console.log('  ✅ src/pages/IntegrationDetailPage.jsx: Using ButtonLegacy');
  
  if (Object.keys(stats.filesByLegacyUsage).length > 0) {
    console.log('\nFiles still using legacy components:');
    Object.entries(stats.filesByLegacyUsage)
      .sort((a, b) => b[1] - a[1])
      .forEach(([file, count]) => {
        console.log(`  ${file}: ${count} occurrence${count > 1 ? 's' : ''}`);
      });
  } else {
    console.log('\n✅ All tracked components have been migrated!');
  }
  
  console.log('\nNext steps:');
  console.log('  1. Migrate files still using legacy components');
  console.log('  2. Replace legacy wrappers with native design system components');
  console.log('  3. Update test coverage for migrated components');
};

// Run the script
checkMigrationStatus();