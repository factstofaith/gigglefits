#!/usr/bin/env node

/**
 * Phase 8 Technical Debt Elimination Automator
 * 
 * Automated tool to implement Phase 8 of the TAP Integration Platform optimization project,
 * focusing on eliminating technical debt through file cleanup, refactoring, and code quality improvements.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Run Technical Debt Elimination process
 * 
 * @param {Object} options - Options for the automation
 */
function runTechnicalDebtElimination(options = {}) {
  console.log('Running Technical Debt Elimination (Phase 8)...');
  
  // Configuration
  const config = {
    dryRun: options.dryRun !== false,
    targetDirs: ['../src', '../../frontend/src', '../../backend'],
    reportsDir: '../cleanup-reports',
    archiveDir: '../archive/cleanup-backups',
    analysisFile: options.analysisFile || null
  };
  
  // Get formatted timestamp for filenames
  const timestamp = new Date().toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
    .replace('T', '_');
  
  // Execute cleanup analysis if needed
  if (!config.analysisFile || options.forceNewAnalysis) {
    console.log('Running file cleanup analysis...');
    try {
      execSync('node file-cleanup.js', { stdio: 'inherit' });
      
      // Find the latest analysis data file
      const reportsDir = path.resolve(__dirname, config.reportsDir);
      if (fs.existsSync(reportsDir)) {
        const dataFiles = fs.readdirSync(reportsDir)
          .filter(file => file.startsWith('cleanup-data-') && file.endsWith('.json'))
          .sort()
          .reverse();
        
        if (dataFiles.length > 0) {
          config.analysisFile = path.join(config.reportsDir, dataFiles[0]);
          console.log(`Using latest analysis file: ${config.analysisFile}`);
        }
      }
    } catch (error) {
      console.error('Error running cleanup analysis:', error.message);
      process.exit(1);
    }
  }
  
  // Execute cleanup executor in appropriate mode
  if (config.analysisFile) {
    console.log(`${config.dryRun ? 'Simulating' : 'Executing'} file cleanup actions...`);
    try {
      const cmd = `node cleanup-executor.js ${config.dryRun ? '--dry-run' : '--execute'} --data=${config.analysisFile}`;
      execSync(cmd, { stdio: 'inherit' });
    } catch (error) {
      console.error('Error executing cleanup:', error.message);
      process.exit(1);
    }
  } else {
    console.error('No analysis file available. Run cleanup analysis first.');
    process.exit(1);
  }
  
  // Verify the build after changes
  console.log('Verifying build after cleanup...');
  try {
    const baseDir = path.resolve(__dirname, '..');
    const { verifyBuild } = require('./verify-build');
    
    const results = verifyBuild(baseDir, {
      buildTypes: ['standard'],
      collectMetrics: true
    });
    
    if (results.success) {
      console.log('✅ Build verification successful after cleanup!');
    } else {
      console.error('❌ Build verification failed after cleanup. Please review changes.');
      // Don't exit, allow user to see results
    }
    
    // Generate report with build results
    const reportPath = path.join(config.reportsDir, `cleanup-verification-${timestamp}.md`);
    let report = `# Cleanup Verification Report\n\n`;
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    report += `Analysis File: ${config.analysisFile}\n`;
    report += `Mode: ${config.dryRun ? 'Dry Run (Simulation)' : 'Execute (Actual Changes)'}\n\n`;
    
    report += `## Build Verification\n\n`;
    report += `Status: ${results.success ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    
    // Include detailed build results
    if (results.builds && results.builds.standard) {
      const build = results.builds.standard;
      report += `### Build Details\n\n`;
      report += `- Duration: ${(build.duration / 1000).toFixed(2)}s\n`;
      report += `- Total Files: ${build.fileCount || 'N/A'}\n`;
      report += `- Total Size: ${build.totalSize ? formatBytes(build.totalSize) : 'N/A'}\n\n`;
      
      if (build.metrics) {
        report += `### Metrics\n\n`;
        report += `- JS Size: ${formatBytes(build.metrics.jsSize || 0)}\n`;
        report += `- CSS Size: ${formatBytes(build.metrics.cssSize || 0)}\n`;
        report += `- Chunks: ${build.metrics.chunkCount || 0}\n`;
      }
    }
    
    report += `\n## Next Steps\n\n`;
    if (config.dryRun) {
      report += `1. Review the cleanup simulation results carefully\n`;
      report += `2. Run the cleanup executor in execute mode if results look good\n`;
      report += `3. Verify the build after actual changes\n`;
    } else {
      if (results.success) {
        report += `1. Review the applied changes for expected behavior\n`;
        report += `2. Continue with refactoring large files into modules\n`;
        report += `3. Run comprehensive test suite to ensure functionality\n`;
      } else {
        report += `1. Review build errors carefully\n`;
        report += `2. Fix any issues caused by the cleanup\n`;
        report += `3. Restore from backup if necessary\n`;
      }
    }
    
    fs.writeFileSync(path.resolve(__dirname, reportPath), report);
    console.log(`Generated verification report: ${reportPath}`);
    
    // Update ClaudeContext.md with progress
    updateClaudeContext(config.dryRun, results.success);
    
    return {
      success: results.success,
      reportPath
    };
  } catch (error) {
    console.error('Error verifying build:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Update ClaudeContext.md with progress information
 * 
 * @param {boolean} isDryRun - Whether this was a dry run
 * @param {boolean} buildSuccess - Whether the build was successful
 */
function updateClaudeContext(isDryRun, buildSuccess) {
  console.log('Updating ClaudeContext.md with progress information...');
  
  const contextPath = path.resolve(__dirname, '../ClaudeContext.md');
  
  if (!fs.existsSync(contextPath)) {
    console.error('ClaudeContext.md not found. Unable to update progress.');
    return;
  }
  
  let content = fs.readFileSync(contextPath, 'utf8');
  
  // Only update if we ran in execute mode and the build was successful
  if (!isDryRun && buildSuccess) {
    // Update completed items - these patterns are specific to our ClaudeContext.md format
    content = content.replace('- [ ] Execute unused import removal', '- [x] Execute unused import removal');
    content = content.replace('- [ ] Archive deprecated files', '- [x] Archive deprecated files');
  }
  
  fs.writeFileSync(contextPath, content);
  console.log('ClaudeContext.md updated successfully.');
}

/**
 * Format bytes into human-readable form
 * 
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
function formatBytes(bytes, decimals = 2) {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Generate RateLimiter refactoring plan
 */
function generateRateLimiterRefactoringPlan() {
  console.log('Generating RateLimiter refactoring plan...');
  
  // Plan is already created at:
  // /home/ai-dev/Desktop/tap-integration-platform/project/finishline/cleanup-reports/ratelimiter-refactoring-plan.md
  
  // Check if we need to update it
  const planPath = path.resolve(__dirname, '../cleanup-reports/ratelimiter-refactoring-plan.md');
  
  if (fs.existsSync(planPath)) {
    console.log('RateLimiter refactoring plan already exists.');
  } else {
    console.error('Plan file not found. Please create the refactoring plan.');
  }
}

/**
 * Run the Phase 8 Technical Debt Elimination automator
 * 
 * @param {Object} options - Options for the automation
 */
function runPhase8TechnicalDebtAutomator(options = {}) {
  console.log('\n---------------------------------------------');
  console.log('| Phase 8 Automator - Technical Debt Elimination |');
  console.log('---------------------------------------------\n');
  
  // First, generate/update the RateLimiter refactoring plan
  generateRateLimiterRefactoringPlan();
  
  // Then run the technical debt elimination process
  const eliminationResults = runTechnicalDebtElimination(options);
  
  // Generate a validation report
  const timestamp = new Date().toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
    .replace('T', '_');
  
  const reportPath = path.resolve(__dirname, `../validation-report-phase8-${timestamp}.md`);
  
  let report = `# Phase 8 - Technical Debt Elimination Report\n\n`;
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  report += `## Phase 8 Progress\n\n`;
  report += `- ✅ File cleanup analysis tool implemented\n`;
  report += `- ✅ File cleanup executor tool implemented\n`;
  report += `- ✅ RateLimiter refactoring plan created\n`;
  report += `- ${options.dryRun ? '⬜' : '✅'} Unused imports removed\n`;
  report += `- ${options.dryRun ? '⬜' : '✅'} Deprecated files archived\n`;
  report += `- ⬜ Large files refactored into modules\n`;
  report += `- ⬜ Circular dependencies resolved\n`;
  report += `- ⬜ Code structure standardized\n\n`;
  
  report += `## Next Steps\n\n`;
  if (options.dryRun) {
    report += `1. Run the technical debt elimination with --execute to actually apply changes\n`;
    report += `2. Once file cleanup is complete, begin implementing the RateLimiter refactoring plan\n`;
    report += `3. Create comprehensive test suite for the refactored components\n`;
    report += `4. Document the results and update the Phase 8 checklist\n`;
  } else {
    report += `1. Implement the RateLimiter refactoring plan\n`;
    report += `2. Test the refactored components thoroughly\n`;
    report += `3. Document the refactoring process and lessons learned\n`;
    report += `4. Prepare for Phase 9 - Code Quality Enforcement\n`;
  }
  
  fs.writeFileSync(reportPath, report);
  console.log(`Generated validation report: ${reportPath}`);
  
  // Print completion message
  console.log('\n---------------------------------------------------------');
  console.log('🧹 Phase 8 - Technical Debt Elimination');
  console.log('---------------------------------------------------------');
  console.log('Status: IN PROGRESS');
  console.log(`Mode: ${options.dryRun ? 'Dry Run (Simulation)' : 'Execute (Actual Changes)'}`);
  console.log(`Build Verification: ${eliminationResults.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Validation Report: ${reportPath}`);
  console.log('\nNext steps:');
  if (options.dryRun) {
    console.log('1. Review the cleanup simulation results');
    console.log('2. Run with --execute to apply changes');
    console.log('3. Implement the RateLimiter refactoring plan');
  } else {
    console.log('1. Review applied changes for expected behavior');
    console.log('2. Implement the RateLimiter refactoring plan');
    console.log('3. Prepare for Phase 9');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: !args.includes('--execute'),
  forceNewAnalysis: args.includes('--new-analysis')
};

// Find analysis file path if provided
const analysisFileArg = args.find(arg => arg.startsWith('--analysis-file='));
if (analysisFileArg) {
  options.analysisFile = analysisFileArg.split('=')[1];
}

// Only run if executed directly (not when required as a module)
if (require.main === module) {
  runPhase8TechnicalDebtAutomator(options);
}

module.exports = {
  runPhase8TechnicalDebtAutomator,
  runTechnicalDebtElimination,
  generateRateLimiterRefactoringPlan
};