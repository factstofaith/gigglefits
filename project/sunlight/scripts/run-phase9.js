/**
 * Run Phase 9: Final Polishing
 * 
 * This script runs the final polishing process for the project,
 * addressing remaining technical debt and preparing for production.
 * 
 * Usage: node run-phase9.js [--fix]
 */

const { spawn } = require('child_process');
const path = require('path');

// Check if fix is requested
const AUTO_FIX = process.argv.includes('--fix');
const fixFlag = AUTO_FIX ? ' --fix' : '';

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
async function runPhase9() {
  console.log('📋 Running Phase 9: Final Polishing');
  
  try {
    // Run final polish script
    await runScript(path.join(__dirname, 'final-polish.js'), fixFlag);
    
    // Run a final build verification
    await runScript(path.join(__dirname, 'verify-build.js'));
    
    // Run technical debt audit
    await runScript(path.join(__dirname, 'audit-technical-debt.js'));
    
    console.log('\n✅ Phase 9 completed successfully!');
    
    // Provide next steps
    console.log('\nNext steps:');
    console.log('1. Review the final polishing report');
    console.log('2. Run the application to verify all features work correctly');
    console.log('3. Check error handling with intentional errors');
    console.log('4. Create a production build and verify it');
    console.log('5. Celebrate, your codebase is now fully standardized!');
  } catch (error) {
    console.error('\n❌ Phase 9 failed:', error.message);
    process.exit(1);
  }
}

// Run the main function
runPhase9();