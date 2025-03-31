/**
 * Run Phase 5: Test & Documentation Standardization
 * 
 * This script runs both the test and documentation standardization scripts
 * and provides a combined summary of results.
 * 
 * Usage: node run-phase5.js [--dry-run]
 */

const { spawn } = require('child_process');
const path = require('path');

// Check if dry run is requested
const DRY_RUN = process.argv.includes('--dry-run');
const dryRunFlag = DRY_RUN ? ' --dry-run' : '';

// Function to run a script and return a promise
function runScript(scriptPath, args = '') {
  return new Promise((resolve, reject) => {
    console.log(`\n🔄 Running ${path.basename(scriptPath)}${args}...\n`);
    
    const child = spawn('node', [scriptPath, ...args.split(' ').filter(Boolean)], { 
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script ${scriptPath} exited with code ${code}`));
      }
    });
  });
}

// Main function to run all scripts
async function runPhase5() {
  console.log('📋 Running Phase 5: Test & Documentation Standardization');
  
  try {
    // Run test standardization
    await runScript(path.join(__dirname, 'standardize-tests.js'), dryRunFlag);
    
    // Run documentation standardization
    await runScript(path.join(__dirname, 'standardize-documentation.js'), dryRunFlag);
    
    // Run technical debt audit
    await runScript(path.join(__dirname, 'audit-technical-debt.js'));
    
    console.log('\n✅ Phase 5 completed successfully!');
    
    // Provide next steps
    console.log('\nNext steps:');
    console.log('1. Review generated tests and documentation');
    console.log('2. Run the build to verify changes');
    console.log('3. Implement test assertions in generated test files');
    console.log('4. Enhance generated documentation with more details');
    console.log('5. Proceed to Phase 6: Build & Deployment Optimization');
  } catch (error) {
    console.error('\n❌ Phase 5 failed:', error.message);
    process.exit(1);
  }
}

// Run the main function
runPhase5();