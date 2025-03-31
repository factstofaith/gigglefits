/**
 * Run Phase 7: Performance Optimization
 * 
 * This script runs both the React performance optimization and render performance analysis scripts
 * and provides a combined summary of results.
 * 
 * Usage: node run-phase7.js [--dry-run]
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
async function runPhase7() {
  console.log('📋 Running Phase 7: Performance Optimization');
  
  try {
    // Run React performance optimization
    await runScript(path.join(__dirname, 'optimize-react-performance.js'), dryRunFlag);
    
    // Run render performance analysis
    await runScript(path.join(__dirname, 'analyze-render-performance.js'));
    
    // Run technical debt audit
    await runScript(path.join(__dirname, 'audit-technical-debt.js'));
    
    console.log('\n✅ Phase 7 completed successfully!');
    
    // Provide next steps
    console.log('\nNext steps:');
    console.log('1. Integrate the performance tracking HOC into your components');
    console.log('2. Run the application and collect performance data');
    console.log('3. Use the visualization tool to analyze render performance');
    console.log('4. Implement the suggested performance optimizations');
    console.log('5. Run build process to verify performance improvements');
    console.log('6. Plan Phase 8: Accessibility & SEO Optimization');
  } catch (error) {
    console.error('\n❌ Phase 7 failed:', error.message);
    process.exit(1);
  }
}

// Run the main function
runPhase7();