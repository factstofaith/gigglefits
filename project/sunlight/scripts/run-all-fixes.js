/**
 * Run All Fixes
 * 
 * This script runs all the fix scripts in sequence to optimize the codebase.
 * 
 * Usage: node run-all-fixes.js
 */

const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SCRIPTS_DIR = __dirname;
const FIX_SCRIPTS = [
  'fix-html-entities.js',
  'fix-jsx-syntax.js',
  'fix-react-hooks.js',
  'fix-component-display-names.js',
];

console.log('🚀 Starting code optimization process...\n');

// Run each fix script
FIX_SCRIPTS.forEach((script, index) => {
  const scriptPath = path.join(SCRIPTS_DIR, script);
  
  console.log(`\n📋 Running ${index + 1}/${FIX_SCRIPTS.length}: ${script}`);
  console.log('='.repeat(50));
  
  try {
    execSync(`node ${scriptPath}`, { stdio: 'inherit' });
    console.log(`✅ Completed: ${script}`);
  } catch (error) {
    console.error(`❌ Error running ${script}: ${error.message}`);
  }
  
  console.log('='.repeat(50));
});

console.log('\n🎉 All optimization scripts completed!');
console.log('Next steps:');
console.log('1. Run a build to verify fixed issues');
console.log('2. Check for any remaining errors that need manual attention');
console.log('3. Implement standardized design system patterns');