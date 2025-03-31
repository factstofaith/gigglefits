/**
 * Run Phase 6: Build & Deployment Optimization
 * 
 * This script runs both the webpack and build process optimization scripts
 * and provides a combined summary of results.
 * 
 * Usage: node run-phase6.js [--dry-run]
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
async function runPhase6() {
  console.log('📋 Running Phase 6: Build & Deployment Optimization');
  
  try {
    // Run webpack optimization
    await runScript(path.join(__dirname, 'optimize-webpack.js'), dryRunFlag);
    
    // Run build process optimization
    await runScript(path.join(__dirname, 'optimize-build-process.js'), dryRunFlag);
    
    // Run technical debt audit
    await runScript(path.join(__dirname, 'audit-technical-debt.js'));
    
    console.log('\n✅ Phase 6 completed successfully!');
    
    // Provide next steps
    console.log('\nNext steps:');
    console.log('1. Review optimized webpack and build process configurations');
    console.log('2. Run a build to verify the optimizations work');
    console.log('3. Check build performance and output size improvements');
    console.log('4. Update the technical debt audit to track progress');
    console.log('5. Plan Phase 7: Performance & Production Readiness');
  } catch (error) {
    console.error('\n❌ Phase 6 failed:', error.message);
    process.exit(1);
  }
}

// Run the main function
runPhase6();