/**
 * TAP Integration Platform - Build Verification Script
 * 
 * This script verifies that build artifacts have been properly created and
 * meet quality requirements.
 * 
 * Following the Golden Approach methodology for thorough verification.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  rootPath: path.join(__dirname, '../../..'),
  outputPath: path.join(__dirname, '../reports'),
  components: {
    frontend: {
      path: path.join(__dirname, '../../../frontend'),
      artifacts: [
        { path: 'build/index.html', required: true },
        { path: 'build/static/js', required: true, minFiles: 1 },
        { path: 'build/static/css', required: true, minFiles: 1 },
        { path: 'build/static/media', required: false, minFiles: 0 },
        { path: 'build/manifest.json', required: false }
      ]
    },
    backend: {
      path: path.join(__dirname, '../../../backend'),
      artifacts: [
        // Add backend verification criteria
      ]
    }
  }
};

// Results storage
const results = {
  timestamp: new Date().toISOString(),
  success: true,
  components: {},
  issues: []
};

/**
 * Main function to run the verification process
 */
async function main() {
  console.log('TAP Integration Platform - Build Verification');
  console.log('============================================');

  try {
    // Verify each component
    for (const [name, component] of Object.entries(config.components)) {
      if (component.artifacts && component.artifacts.length > 0) {
        const componentResults = verifyComponent(name, component);
        results.components[name] = componentResults;
        
        if (!componentResults.success) {
          results.success = false;
        }
      }
    }
    
    // Generate report
    generateReport();
    
    // Print summary
    printSummary();
    
    // Exit with appropriate code
    process.exit(results.success ? 0 : 1);
  } catch (error) {
    console.error('Verification process failed:', error);
    process.exit(1);
  }
}

/**
 * Verify a single component's build artifacts
 */
function verifyComponent(name, component) {
  console.log(`\nVerifying ${name} build artifacts...`);
  
  const result = {
    name,
    success: true,
    artifactsChecked: 0,
    artifactsFound: 0,
    issues: []
  };
  
  // Check if component path exists
  if (!fs.existsSync(component.path)) {
    result.success = false;
    result.issues.push(`Component directory not found: ${component.path}`);
    results.issues.push(`[${name}] Component directory not found: ${component.path}`);
    return result;
  }
  
  // Check each artifact
  for (const artifact of component.artifacts) {
    result.artifactsChecked++;
    
    const fullPath = path.join(component.path, artifact.path);
    
    // Check existence
    const exists = fs.existsSync(fullPath);
    
    if (artifact.required && !exists) {
      result.success = false;
      const issue = `Required artifact missing: ${artifact.path}`;
      result.issues.push(issue);
      results.issues.push(`[${name}] ${issue}`);
      continue;
    }
    
    if (exists) {
      result.artifactsFound++;
      
      // Check if directory has minimum files
      if (artifact.minFiles !== undefined && fs.statSync(fullPath).isDirectory()) {
        const files = fs.readdirSync(fullPath);
        
        if (files.length < artifact.minFiles) {
          result.success = false;
          const issue = `${artifact.path} has fewer than ${artifact.minFiles} files (found ${files.length})`;
          result.issues.push(issue);
          results.issues.push(`[${name}] ${issue}`);
        }
      }
      
      // Check file size if specified
      if (artifact.minSize && !fs.statSync(fullPath).isDirectory()) {
        const stats = fs.statSync(fullPath);
        
        if (stats.size < artifact.minSize) {
          result.success = false;
          const issue = `${artifact.path} is smaller than ${artifact.minSize} bytes (actual: ${stats.size} bytes)`;
          result.issues.push(issue);
          results.issues.push(`[${name}] ${issue}`);
        }
      }
    } else if (!artifact.required) {
      console.log(`Optional artifact not found: ${artifact.path}`);
    }
  }
  
  // Report results
  if (result.success) {
    console.log(`✅ ${name} build artifacts verified successfully (${result.artifactsFound}/${result.artifactsChecked} artifacts)`);
  } else {
    console.error(`❌ ${name} build verification failed:`);
    result.issues.forEach(issue => console.error(`  - ${issue}`));
  }
  
  return result;
}

/**
 * Generate a verification report
 */
function generateReport() {
  console.log('\nGenerating verification report...');
  
  // Ensure output directory exists
  if (!fs.existsSync(config.outputPath)) {
    fs.mkdirSync(config.outputPath, { recursive: true });
  }
  
  const reportFile = path.join(
    config.outputPath,
    `build-verification-${new Date().toISOString().replace(/:/g, '-')}.json`
  );
  
  // Create report object
  const report = {
    ...results,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };
  
  // Write the report
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`Verification report saved to ${reportFile}`);
  
  // Generate a markdown summary
  const summaryFile = path.join(
    config.outputPath,
    `build-verification-${new Date().toISOString().replace(/:/g, '-')}.md`
  );
  
  const summaryContent = [
    '# TAP Integration Platform Build Verification Summary',
    '',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    '## Overview',
    '',
    `- Status: ${report.success ? '✅ Success' : '❌ Failure'}`,
    '',
    '## Component Results',
    '',
    ...Object.entries(report.components).map(([name, details]) => {
      return [
        `### ${name}`,
        '',
        `- Status: ${details.success ? '✅ Success' : '❌ Failure'}`,
        `- Artifacts Checked: ${details.artifactsChecked}`,
        `- Artifacts Found: ${details.artifactsFound}`,
        '',
        details.issues.length > 0 ? [
          '#### Issues:',
          '',
          ...details.issues.map(issue => `- ${issue}`),
          ''
        ].join('\n') : '',
        '---',
        ''
      ].filter(Boolean).join('\n');
    }),
    '## Next Steps',
    '',
    report.success ? [
      '- Proceed with test verification',
      '- Prepare for integration testing',
      '- Update documentation'
    ].join('\n') : [
      '- Address missing artifacts',
      '- Fix build configuration issues',
      '- Retry build process'
    ].join('\n')
  ].join('\n');
  
  fs.writeFileSync(summaryFile, summaryContent);
  console.log(`Verification summary saved to ${summaryFile}`);
}

/**
 * Print a summary of the verification process to the console
 */
function printSummary() {
  console.log('\n============================================');
  console.log(`Build Verification ${results.success ? 'SUCCESS' : 'FAILED'}`);
  console.log('============================================');
  
  Object.entries(results.components).forEach(([name, details]) => {
    const statusSymbol = details.success ? '✅' : '❌';
    console.log(`${statusSymbol} ${name}: ${details.artifactsFound}/${details.artifactsChecked} artifacts verified`);
  });
  
  console.log('============================================');
  
  if (results.success) {
    console.log('✅ All build artifacts verified successfully!');
  } else {
    console.log('❌ Build verification failed. Issues found:');
    results.issues.forEach(issue => console.log(`  - ${issue}`));
  }
}

// Execute the main function
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});