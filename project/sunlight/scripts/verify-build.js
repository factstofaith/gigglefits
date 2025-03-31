/**
 * Verify Build
 * 
 * This script runs a build and checks for common build errors.
 * It helps determine if the fixes have resolved compilation issues.
 * 
 * Usage: node verify-build.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const FRONTEND_DIR = path.resolve(__dirname, '../../../frontend');
const BUILD_OUTPUT_FILE = path.join(__dirname, '../build-verification-output.txt');

// Function to check if a string contains build errors
function containsBuildErrors(output) {
  return output.includes('Failed to compile') || 
         output.includes('error TS') ||
         output.includes('Module not found') ||
         output.includes('Syntax error');
}

// Function to count errors by type
function countErrorsByType(output) {
  const errorCounts = {
    eslint: 0,
    typescript: 0,
    syntax: 0,
    import: 0,
    other: 0
  };
  
  // Count ESLint errors
  const eslintMatches = output.match(/\[eslint\]/g);
  if (eslintMatches) {
    errorCounts.eslint = eslintMatches.length;
  }
  
  // Count TypeScript errors
  const tsMatches = output.match(/error TS\d+/g);
  if (tsMatches) {
    errorCounts.typescript = tsMatches.length;
  }
  
  // Count syntax errors
  const syntaxMatches = output.match(/Syntax error/g);
  if (syntaxMatches) {
    errorCounts.syntax = syntaxMatches.length;
  }
  
  // Count import errors
  const importMatches = output.match(/Module not found/g);
  if (importMatches) {
    errorCounts.import = importMatches.length;
  }
  
  return errorCounts;
}

console.log('🚀 Starting build verification process...\n');

try {
  // Change to frontend directory
  process.chdir(FRONTEND_DIR);
  
  console.log('📦 Running build with TypeScript checks disabled...');
  console.log('This may take a few minutes. Please wait...');
  
  // Run the build with output
  try {
    const buildOutput = execSync('npm run build:skip-ts', { encoding: 'utf8' });
    
    // Write output to file
    fs.writeFileSync(BUILD_OUTPUT_FILE, buildOutput);
    
    if (containsBuildErrors(buildOutput)) {
      console.log('❌ Build completed with errors');
      const errorCounts = countErrorsByType(buildOutput);
      
      console.log('\nError Summary:');
      console.log(`- ESLint Errors: ${errorCounts.eslint}`);
      console.log(`- TypeScript Errors: ${errorCounts.typescript}`);
      console.log(`- Syntax Errors: ${errorCounts.syntax}`);
      console.log(`- Import Errors: ${errorCounts.import}`);
      console.log(`- Other Errors: ${errorCounts.other}`);
      
      console.log(`\nOutput saved to: ${BUILD_OUTPUT_FILE}`);
    } else {
      console.log('✅ Build completed successfully!');
    }
  } catch (error) {
    // Write error output to file
    fs.writeFileSync(BUILD_OUTPUT_FILE, error.stdout || error.message);
    
    console.log('❌ Build failed');
    
    if (error.stdout) {
      const errorCounts = countErrorsByType(error.stdout);
      
      console.log('\nError Summary:');
      console.log(`- ESLint Errors: ${errorCounts.eslint}`);
      console.log(`- TypeScript Errors: ${errorCounts.typescript}`);
      console.log(`- Syntax Errors: ${errorCounts.syntax}`);
      console.log(`- Import Errors: ${errorCounts.import}`);
      console.log(`- Other Errors: ${errorCounts.other}`);
    }
    
    console.log(`\nOutput saved to: ${BUILD_OUTPUT_FILE}`);
  }
  
} catch (error) {
  console.error('❌ Error during build verification:', error.message);
}

console.log('\n🔍 Build verification process completed!');
console.log('Check the output file for more details.');