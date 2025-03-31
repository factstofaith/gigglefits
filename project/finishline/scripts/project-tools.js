#!/usr/bin/env node

/**
 * Project Tools CLI
 * 
 * Unified command line interface for all phase-based project tools.
 */

// Import tools
// Note: We import individual functions instead of requiring the whole module
// to avoid auto-execution of the phase-automator.js script
const phaseAutomator = require('./phase-automator');
const runPhaseAutomator = phaseAutomator.runPhaseAutomator;
const { runBuildVerification } = require('./verify-build');
const { enhanceAccessibilityComponents } = require('./enhance-a11y-components');
const { runPhase7Automator } = require('./phase7-automator');
const { runPhase9Automator } = require('./phase9-automator');
const { runAnalysis } = require('./test-result-analyzer');
const { runComprehensiveTests } = require('./run-comprehensive-tests');
const { execSync } = require('child_process');

// Technical Debt Elimination Tools
function runTechnicalDebtElimination(options = {}) {
  console.log('Running Technical Debt Elimination (Phase 8)...');
  
  // Load required modules
  const fs = require('fs');
  const path = require('path');
  const { execSync } = require('child_process');
  
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
  } catch (error) {
    console.error('Error verifying build:', error.message);
  }
  
  // Helper function to format bytes
  function formatBytes(bytes, decimals = 2) {
    if (!bytes) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

// Command handlers
const commands = {
  /**
   * Run the phase automator
   * 
   * @param {string[]} args - Command arguments
   */
  automate: (args) => {
    const phase = args[0];
    
    if (!phase) {
      console.error('Error: No phase specified');
      console.log('Usage: project-tools.js automate <phase>');
      process.exit(1);
    }
    
    runPhaseAutomator(phase);
  },
  
  /**
   * Fix component test issues
   * 
   * @param {string[]} args - Command arguments
   */
  fixTests: (args) => {
    const component = args[0];
    const executeFlag = args.includes('--execute');
    
    console.log(`Running test fixes ${executeFlag ? 'with execution' : 'in dry-run mode'}...`);
    
    if (component) {
      console.log(`Fixing tests for component: ${component}`);
      
      try {
        execSync(`node fix-component-tests.js ${component} ${executeFlag ? '--execute' : ''}`, {
          stdio: 'inherit'
        });
      } catch (error) {
        console.error('Error fixing component tests:', error.message);
      }
    } else {
      console.log('Fixing all component tests...');
      
      try {
        execSync(`node fix-component-tests.js ${executeFlag ? '--execute' : ''}`, {
          stdio: 'inherit'
        });
      } catch (error) {
        console.error('Error fixing component tests:', error.message);
      }
    }
  },
  
  /**
   * Analyze test results
   * 
   * @param {string[]} args - Command arguments
   */
  analyzeTests: (args) => {
    console.log('Running test result analysis...');
    
    const options = {};
    
    // Parse options
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--result-dir' && args[i + 1]) {
        options.resultDir = args[i + 1];
        i++;
      } else if (args[i] === '--output-dir' && args[i + 1]) {
        options.outputDir = args[i + 1];
        i++;
      }
    }
    
    // Run analysis
    try {
      const result = runAnalysis(options);
      
      if (result) {
        console.log(`Analysis completed successfully!`);
        console.log(`HTML report: ${result.reports.html}`);
        console.log(`Markdown report: ${result.reports.markdown}`);
        
        // Display recommendation summary
        console.log('\nTop Recommendations:');
        result.recommendations.slice(0, 3).forEach((rec, index) => {
          console.log(`${index + 1}. [${rec.priority}] ${rec.issue}: ${rec.recommendation}`);
        });
      }
    } catch (error) {
      console.error('Error analyzing test results:', error.message);
    }
  },
  
  /**
   * Run comprehensive tests across all components
   * 
   * @param {string[]} args - Command arguments
   */
  testAll: async (args) => {
    console.log('Running comprehensive tests across all components...');
    
    try {
      // Run the comprehensive test suite
      const result = await runComprehensiveTests();
      
      // Display summary results
      console.log('\nTest Summary:');
      console.log(`Overall result: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`HTML Report: ${result.reports.html}`);
      console.log(`Markdown Report: ${result.reports.markdown}`);
      
      // If tests failed, display some guidance
      if (!result.success) {
        console.log('\nSome tests are failing. Here are your options:');
        console.log('1. Use the test reports to identify which components are failing');
        console.log('2. Run "fixTests" command to automatically fix common issues');
        console.log('3. Run "analyzeTests" command to get detailed recommendations');
      }
    } catch (error) {
      console.error('Error running comprehensive tests:', error.message);
    }
  },
  
  /**
   * Run build verification
   * 
   * @param {string[]} args - Command arguments
   */
  verify: (args) => {
    const options = {};
    
    // Parse options
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--all') {
        options.buildTypes = ['standard', 'cjs', 'esm'];
      } else if (args[i] === '--types' && args[i + 1]) {
        options.buildTypes = args[i + 1].split(',');
        i++;
      }
    }
    
    runBuildVerification(options);
  },
  
  /**
   * Enhance components for a phase
   * 
   * @param {string[]} args - Command arguments
   */
  enhance: (args) => {
    const phase = args[0];
    
    if (!phase) {
      console.error('Error: No phase specified');
      console.log('Usage: project-tools.js enhance <phase>');
      process.exit(1);
    }
    
    if (phase === 'accessibility') {
      enhanceAccessibilityComponents();
    } else {
      console.error(`Enhancement not implemented for phase: ${phase}`);
      process.exit(1);
    }
  },

  /**
   * Run the Phase 7 automator
   */
  phase7: () => {
    console.log('Running Phase 7 Automator for Advanced Optimizations...');
    runPhase7Automator();
  },
  
  /**
   * Run Technical Debt Elimination (Phase 8)
   * 
   * @param {string[]} args - Command arguments
   */
  phase8: (args) => {
    console.log('Running Phase 8 - Technical Debt Elimination...');
    
    const options = {
      dryRun: !args.includes('--execute'),
      forceNewAnalysis: args.includes('--new-analysis')
    };
    
    // Find analysis file path if provided
    const analysisFileArg = args.find(arg => arg.startsWith('--analysis-file='));
    if (analysisFileArg) {
      options.analysisFile = analysisFileArg.split('=')[1];
    }
    
    runTechnicalDebtElimination(options);
  },
  
  /**
   * Run the Phase 9 automator
   * 
   * @param {string[]} args - Command arguments
   */
  phase9: (args) => {
    console.log('Running Phase 9 Automator for Comprehensive QA Testing...');
    
    const options = {};
    
    // Parse test type if specified
    const testTypeArg = args.find(arg => arg.startsWith('--test-type='));
    if (testTypeArg) {
      options.testType = testTypeArg.split('=')[1];
      console.log(`Running tests of type: ${options.testType}`);
    }
    
    // Check if reports should be generated
    if (args.includes('--generate-reports')) {
      options.generateReports = true;
      console.log('Will generate comprehensive test reports');
    }
    
    // Fix all tests flag
    if (args.includes('--fix-all')) {
      options.fixAll = true;
      console.log('Will attempt to fix all failing tests');
    }
    
    runPhase9Automator(options);
  },
  
  /**
   * Run the Phase 10 automator for Build Optimization
   * 
   * @param {string[]} args - Command arguments
   */
  phase10: (args) => {
    console.log('Running Phase 10 Automator for Build Optimization...');
    
    // Load Phase 10 automator dynamically
    try {
      const { runPhase10Automator } = require('./phase10-automator');
      
      const options = {
        auditOnly: args.includes('--audit-only'),
        fixErrors: args.includes('--fix-errors'),
        optimizeBuild: args.includes('--optimize'),
        minimizeBundle: args.includes('--minimize')
      };
      
      // If no specific options provided, run full optimization
      if (!options.auditOnly && !options.fixErrors && !options.optimizeBuild && !options.minimizeBundle) {
        options.auditOnly = false;
        options.fixErrors = true;
        options.optimizeBuild = true;
        options.minimizeBundle = true;
      }
      
      runPhase10Automator(options);
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        console.error('Phase 10 automator not found. Creating it first...');
        
        try {
          // Generate the Phase 10 automator
          console.log('Generating Phase 10 automator...');
          execSync('node phase-automator.js generate-phase10', { stdio: 'inherit' });
          
          console.log('Phase 10 automator created successfully! Please run phase10 command again.');
        } catch (genError) {
          console.error('Error generating Phase 10 automator:', genError.message);
        }
      } else {
        console.error('Error running Phase 10 automator:', error.message);
      }
    }
  },

  /**
   * Run the Phase 11 automator for Continuous Deployment & Monitoring
   * 
   * @param {string[]} args - Command arguments
   */
  phase11: (args) => {
    console.log('Running Phase 11 Automator for Continuous Deployment & Monitoring...');
    
    // Load Phase 11 automator dynamically
    try {
      const { runPhase11Automator } = require('./phase11-automator');
      
      const options = {
        setupMonitoring: args.includes('--monitoring'),
        bundleManagement: args.includes('--bundle'),
        dependencyManagement: args.includes('--dependencies'),
        deploymentPipeline: args.includes('--deployment'),
        featureFlags: args.includes('--feature-flags')
      };
      
      // If no specific options provided, run setup for all components
      if (!options.setupMonitoring && !options.bundleManagement && 
          !options.dependencyManagement && !options.deploymentPipeline && 
          !options.featureFlags) {
        options.setupMonitoring = true;
        options.bundleManagement = true;
        options.dependencyManagement = true;
        options.deploymentPipeline = true;
        options.featureFlags = true;
      }
      
      runPhase11Automator(options);
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        console.error('Phase 11 automator not found. Creating it first...');
        
        try {
          // Generate the Phase 11 automator
          console.log('Generating Phase 11 automator...');
          execSync('node phase-automator.js generate-phase11', { stdio: 'inherit' });
          
          console.log('Phase 11 automator created successfully! Please run phase11 command again.');
        } catch (genError) {
          console.error('Error generating Phase 11 automator:', genError.message);
        }
      } else {
        console.error('Error running Phase 11 automator:', error.message);
      }
    }
  },

  /**
   * Run code structure standardization tool
   * 
   * @param {string[]} args - Command arguments
   */
  standardize: (args) => {
    console.log('Running Code Structure Standardization Tool...');
    
    const dryRun = !args.includes('--execute');
    const command = `node code-structure-standardizer.js ${dryRun ? '--dry-run' : '--execute'}`;
    
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error('Error running code structure standardization:', error.message);
    }
  },
  
  /**
   * Run circular dependency analyzer
   */
  analyzeDeps: () => {
    console.log('Running Circular Dependency Analyzer...');
    
    try {
      execSync('node circular-dependency-analyzer.js', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error running circular dependency analyzer:', error.message);
    }
  },
  
  /**
   * Run error handling standardizer
   * 
   * @param {string[]} args - Command arguments
   */
  errorHandling: (args) => {
    console.log('Running Error Handling Standardizer...');
    
    const dryRun = !args.includes('--execute');
    const command = `node error-handling-standardizer.js ${dryRun ? '--dry-run' : '--execute'}`;
    
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error('Error running error handling standardizer:', error.message);
    }
  },
  
  /**
   * Show help message
   */
  help: () => {
    console.log(`
Project Tools CLI

Usage:
  project-tools.js <command> [options]

Commands:
  automate <phase>        Generate components, tests, and documentation for a phase
  enhance <phase>         Enhance components for a phase with actual functionality
  verify [options]        Verify the project builds correctly
  phase7                  Run the Phase 7 automator for Advanced Optimizations
  phase8 [options]        Run Phase 8 - Technical Debt Elimination
  phase9 [options]        Run Phase 9 automator for Comprehensive QA Testing
  phase10 [options]       Run Phase 10 automator for Build Optimization
  phase11 [options]       Run Phase 11 automator for Continuous Deployment & Monitoring
  standardize [options]   Run code structure standardization
  analyzeDeps             Run circular dependency analyzer
  errorHandling [options] Run error handling standardizer
  fixTests [component]    Fix component test issues
  analyzeTests [options]  Analyze test results and generate reports
  testAll                 Run comprehensive tests across all components
  help                    Show this help message

Options for 'verify':
  --all                   Verify all build types (standard, cjs, esm)
  --types <types>         Build types to verify, comma-separated (standard,cjs,esm)

Options for 'phase8':
  --execute               Execute actual changes (default is dry-run mode)
  --new-analysis          Force a new file analysis even if one exists
  --analysis-file=<path>  Use a specific analysis file

Options for 'phase9':
  --test-type=<type>      Run specific test type (unit, integration, visual, e2e, performance, accessibility)
  --generate-reports      Generate comprehensive test reports
  --fix-all               Attempt to fix all failing tests

Options for 'phase10':
  --audit-only            Only perform build audit without making changes
  --fix-errors            Fix build errors and warnings
  --optimize              Optimize build process (time, caching)
  --minimize              Minimize bundle sizes

Options for 'phase11':
  --monitoring            Set up build performance monitoring
  --bundle                Set up bundle size management
  --dependencies          Set up dependency management workflow
  --deployment            Set up automated deployment pipeline
  --feature-flags         Set up feature flagging system

Options for 'standardize', 'errorHandling':
  --execute               Execute actual changes (default is dry-run mode)

Options for 'analyzeTests':
  --result-dir <path>     Directory containing test result files
  --output-dir <path>     Directory for generated reports

Examples:
  project-tools.js automate accessibility
  project-tools.js enhance accessibility
  project-tools.js verify --all
  project-tools.js verify --types standard,cjs
  project-tools.js phase7
  project-tools.js phase8 --execute
  project-tools.js phase9 --test-type=unit
  project-tools.js phase9 --generate-reports
  project-tools.js phase10 --audit-only
  project-tools.js phase10 --fix-errors --optimize
  project-tools.js phase11
  project-tools.js phase11 --monitoring --bundle
  project-tools.js standardize --execute
  project-tools.js analyzeDeps
  project-tools.js errorHandling --execute
  project-tools.js fixTests
  project-tools.js fixTests A11yForm --execute
  project-tools.js analyzeTests
  project-tools.js analyzeTests --result-dir ../test-results
  project-tools.js testAll
    `);
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const commandArgs = args.slice(1);

// Run the command
if (command && commands[command]) {
  commands[command](commandArgs);
} else if (command === 'analyze') {
  console.error('The analyze command is not yet implemented.');
  console.log('Please run the appropriate tool directly.');
} else {
  console.error(`Unknown command: ${command}`);
  commands.help();
  process.exit(1);
}