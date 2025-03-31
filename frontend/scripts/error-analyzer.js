/**
 * Error Analysis Script
 * 
 * This script analyzes TypeScript errors in the codebase, categorizing them by type
 * to facilitate systematic fixing based on our Golden Approach methodology.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Track error patterns
const errorPatterns = {
  templateLiterals: { count: 0, files: {}, description: "Malformed template literals using single quotes instead of backticks" },
  unexpectedIdentifier: { count: 0, files: {}, description: "Unexpected identifier errors in import statements" },
  missingCommas: { count: 0, files: {}, description: "Missing commas in object or array literals" },
  typeAssertions: { count: 0, files: {}, description: "Type assertions in JSX files" },
  unexpectedKeywords: { count: 0, files: {}, description: "Unexpected keywords or identifiers" },
  malformedImports: { count: 0, files: {}, description: "Malformed import statements" },
  missingBraces: { count: 0, files: {}, description: "Missing closing braces or parentheses" },
  unexpectedStatements: { count: 0, files: {}, description: "Unexpected statements outside of function bodies" },
  other: { count: 0, files: {}, description: "Other uncategorized TypeScript errors" }
};

// Run TypeScript check and capture the output
const runTypeScriptCheck = () => {
  return new Promise((resolve, reject) => {
    const cmd = 'cd /home/ai-dev/Desktop/tap-integration-platform/frontend && npx tsc --noEmit';
    
    exec(cmd, (error, stdout, stderr) => {
      if (stderr) {
        console.error('Error running TypeScript check:', stderr);
      }
      
      resolve(stdout);
    });
  });
};

// Parse the error output and categorize errors
const parseTypeScriptErrors = (output) => {
  const lines = output.split('\n');
  const errors = [];
  
  for (const line of lines) {
    if (line.includes('error TS')) {
      errors.push(line);
      
      // Categorize the error
      if (line.includes('TS1003: Identifier expected')) {
        const file = line.split('(')[0];
        errorPatterns.unexpectedIdentifier.count++;
        if (!errorPatterns.unexpectedIdentifier.files[file]) {
          errorPatterns.unexpectedIdentifier.files[file] = [];
        }
        errorPatterns.unexpectedIdentifier.files[file].push(line);
      } 
      else if (line.includes('TS1005: \',\' expected')) {
        const file = line.split('(')[0];
        errorPatterns.missingCommas.count++;
        if (!errorPatterns.missingCommas.files[file]) {
          errorPatterns.missingCommas.files[file] = [];
        }
        errorPatterns.missingCommas.files[file].push(line);
      }
      else if (line.includes('TS8016: Type assertion expressions')) {
        const file = line.split('(')[0];
        errorPatterns.typeAssertions.count++;
        if (!errorPatterns.typeAssertions.files[file]) {
          errorPatterns.typeAssertions.files[file] = [];
        }
        errorPatterns.typeAssertions.files[file].push(line);
      }
      else if (line.includes('TS1434: Unexpected keyword or identifier')) {
        const file = line.split('(')[0];
        errorPatterns.unexpectedKeywords.count++;
        if (!errorPatterns.unexpectedKeywords.files[file]) {
          errorPatterns.unexpectedKeywords.files[file] = [];
        }
        errorPatterns.unexpectedKeywords.files[file].push(line);
      }
      else if (line.includes('TS1128: Declaration or statement expected')) {
        const file = line.split('(')[0];
        errorPatterns.unexpectedStatements.count++;
        if (!errorPatterns.unexpectedStatements.files[file]) {
          errorPatterns.unexpectedStatements.files[file] = [];
        }
        errorPatterns.unexpectedStatements.files[file].push(line);
      }
      else if (line.includes('TS1109: Expression expected')) {
        const file = line.split('(')[0];
        errorPatterns.missingBraces.count++;
        if (!errorPatterns.missingBraces.files[file]) {
          errorPatterns.missingBraces.files[file] = [];
        }
        errorPatterns.missingBraces.files[file].push(line);
      }
      else if (line.includes('TS1131: Property or signature expected')) {
        const file = line.split('(')[0];
        errorPatterns.templateLiterals.count++;
        if (!errorPatterns.templateLiterals.files[file]) {
          errorPatterns.templateLiterals.files[file] = [];
        }
        errorPatterns.templateLiterals.files[file].push(line);
      }
      else {
        const file = line.split('(')[0];
        errorPatterns.other.count++;
        if (!errorPatterns.other.files[file]) {
          errorPatterns.other.files[file] = [];
        }
        errorPatterns.other.files[file].push(line);
      }
    }
  }
  
  return errors;
};

// Generate a report of error patterns
const generateErrorReport = () => {
  let report = '# TypeScript Error Analysis Report\n\n';
  report += 'This report categorizes TypeScript errors to facilitate systematic fixing.\n\n';
  
  let totalErrors = 0;
  Object.keys(errorPatterns).forEach(pattern => {
    totalErrors += errorPatterns[pattern].count;
  });
  
  report += `## Summary\n\n`;
  report += `Total errors: ${totalErrors}\n\n`;
  
  report += '| Error Category | Count | Description |\n';
  report += '|---------------|-------|-------------|\n';
  
  Object.keys(errorPatterns).forEach(pattern => {
    const { count, description } = errorPatterns[pattern];
    report += `| ${pattern} | ${count} | ${description} |\n`;
  });
  
  report += '\n## Details\n\n';
  
  Object.keys(errorPatterns).forEach(pattern => {
    const { count, files, description } = errorPatterns[pattern];
    
    if (count > 0) {
      report += `### ${pattern} (${count} errors)\n\n`;
      report += `${description}\n\n`;
      report += '| File | Error Count |\n';
      report += '|------|------------|\n';
      
      Object.keys(files).forEach(file => {
        report += `| ${file} | ${files[file].length} |\n`;
      });
      
      report += '\n';
    }
  });
  
  return report;
};

// Main execution
const main = async () => {
  console.log('Running TypeScript check...');
  const output = await runTypeScriptCheck();
  
  console.log('Parsing errors...');
  const errors = parseTypeScriptErrors(output);
  
  console.log('Generating report...');
  const report = generateErrorReport();
  
  // Write the report to a file
  fs.writeFileSync(
    path.join('/home/ai-dev/Desktop/tap-integration-platform/frontend/project/final_npm_test/typescript_error_analysis.md'),
    report
  );
  
  console.log(`Analysis complete. Found ${errors.length} TypeScript errors.`);
  console.log('Report written to typescript_error_analysis.md');
};

main().catch(console.error);