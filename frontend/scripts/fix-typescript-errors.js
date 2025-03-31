/**
 * Master TypeScript Error Fix Script
 * 
 * This script orchestrates the execution of all TypeScript error fixing scripts
 * and generates a report of the results. It follows our Golden Approach methodology
 * of systematic fixing with proper verification after each step.
 */

const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');
const { spawn } = require('child_process');

// Configuration
const SCRIPTS_DIR = '/home/ai-dev/Desktop/tap-integration-platform/frontend/scripts';
const OUTPUT_DIR = '/home/ai-dev/Desktop/tap-integration-platform/frontend/project/final_npm_test';
const FRONTEND_DIR = '/home/ai-dev/Desktop/tap-integration-platform/frontend';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Function to run TypeScript check and count errors
const countTypeScriptErrors = () => {
  try {
    const cmd = 'cd /home/ai-dev/Desktop/tap-integration-platform/frontend && npx tsc --noEmit';
    const output = execSync(cmd, { encoding: 'utf8' });
    
    // Count error lines
    const errorLines = output.split('\n').filter(line => line.includes('error TS'));
    return errorLines.length;
  } catch (error) {
    // In case of error, we look at stderr to count errors
    const output = error.stdout || '';
    const errorLines = output.split('\n').filter(line => line.includes('error TS'));
    return errorLines.length;
  }
};

// Function to run a script and capture its output
const runScript = (scriptPath) => {
  return new Promise((resolve, reject) => {
    console.log(`Running ${path.basename(scriptPath)}...`);
    
    const process = spawn('node', [scriptPath]);
    let output = '';
    
    process.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(text);
    });
    
    process.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.error(text);
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Script ${scriptPath} exited with code ${code}`));
      }
    });
  });
};

// Generate a report of the fix process
const generateReport = async (beforeCount, afterCount, scriptOutputs) => {
  const reportContent = `# TypeScript Error Fix Report

## Summary

- TypeScript errors before fixes: ${beforeCount}
- TypeScript errors after fixes: ${afterCount}
- Error reduction: ${beforeCount - afterCount} (${Math.round((beforeCount - afterCount) / beforeCount * 100)}%)

## Fix Process

The following scripts were executed to fix TypeScript errors:

${scriptOutputs.map((output, index) => `### Script ${index + 1}: ${output.script}

\`\`\`
${output.output}
\`\`\`
`).join('\n')}

## Conclusion

${afterCount === 0 
    ? 'All TypeScript errors were successfully fixed!' 
    : `There are still ${afterCount} TypeScript errors remaining that may need manual attention.`}

This fix process was performed following the "Golden Approach" methodology outlined in our documentation.
`;

  // Write report to file
  const reportPath = path.join(OUTPUT_DIR, 'typescript_fix_report.md');
  fs.writeFileSync(reportPath, reportContent);
  
  return reportPath;
};

// Main execution
const main = async () => {
  try {
    console.log('Starting TypeScript error fix process...');
    
    // Count initial errors
    console.log('Counting initial TypeScript errors...');
    const initialErrorCount = countTypeScriptErrors();
    console.log(`Initial TypeScript error count: ${initialErrorCount}`);
    
    if (initialErrorCount === 0) {
      console.log('No TypeScript errors found. Nothing to fix!');
      return;
    }
    
    // Scripts to run
    const scripts = [
      path.join(SCRIPTS_DIR, 'error-analyzer.js'),
      path.join(SCRIPTS_DIR, 'fix-error-handling.js'),
      path.join(SCRIPTS_DIR, 'fix-releases-manager.js'),
      path.join(SCRIPTS_DIR, 'fix-template-literals.js')
    ];
    
    // Run each script and collect output
    const scriptOutputs = [];
    for (const script of scripts) {
      try {
        const output = await runScript(script);
        scriptOutputs.push({
          script: path.basename(script),
          output: output
        });
      } catch (error) {
        console.error(`Error running ${script}:`, error);
        scriptOutputs.push({
          script: path.basename(script),
          output: `ERROR: ${error.message}`
        });
      }
    }
    
    // Count final errors
    console.log('Counting remaining TypeScript errors...');
    const finalErrorCount = countTypeScriptErrors();
    console.log(`Final TypeScript error count: ${finalErrorCount}`);
    
    // Generate report
    console.log('Generating report...');
    const reportPath = await generateReport(initialErrorCount, finalErrorCount, scriptOutputs);
    console.log(`Report generated at ${reportPath}`);
    
    // Final message
    if (finalErrorCount === 0) {
      console.log('SUCCESS: All TypeScript errors were fixed!');
    } else {
      console.log(`PARTIAL SUCCESS: Reduced TypeScript errors from ${initialErrorCount} to ${finalErrorCount}.`);
      console.log('There are still some errors that may need manual attention.');
    }
  } catch (error) {
    console.error('Error in main execution:', error);
  }
};

main();