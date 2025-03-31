/**
 * Run Phase 8: Accessibility & SEO Optimization
 * 
 * This script runs both the accessibility audit and SEO optimization scripts
 * and provides a combined summary of results.
 * 
 * Usage: node run-phase8.js [--fix]
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
async function runPhase8() {
  console.log('📋 Running Phase 8: Accessibility & SEO Optimization');
  
  try {
    // Run accessibility audit
    await runScript(path.join(__dirname, 'accessibility-audit.js'), fixFlag);
    
    // Run SEO optimization
    await runScript(path.join(__dirname, 'seo-optimization.js'), fixFlag);
    
    // Run technical debt audit
    await runScript(path.join(__dirname, 'audit-technical-debt.js'));
    
    console.log('\n✅ Phase 8 completed successfully!');
    
    // Provide next steps
    console.log('\nNext steps:');
    console.log('1. Review the accessibility and SEO reports');
    console.log('2. Implement high priority accessibility fixes');
    console.log('3. Add SEO component to your pages');
    console.log('4. Test with real accessibility and SEO tools');
    console.log('5. Plan Phase 9: Final Polishing');
  } catch (error) {
    console.error('\n❌ Phase 8 failed:', error.message);
    process.exit(1);
  }
}

// Run the main function
runPhase8();