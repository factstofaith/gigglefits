/**
 * Technical Debt Audit Script
 *
 * This script performs a comprehensive audit of technical debt in the codebase
 * and updates the Technical Debt Elimination Tracker in ClaudeContext.md
 *
 * Usage: node audit-technical-debt.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../../frontend/src');
const CLAUDE_CONTEXT_PATH = path.resolve(__dirname, '../ClaudeContext.md');
const REPORT_PATH = path.resolve(__dirname, '../technical-debt-report.md');

// Define audit categories and patterns
const AUDIT_CATEGORIES = [
  {
    name: 'ESLint Errors',
    detect: () => {
      try {
        // Run ESLint and capture output
        const output = execSync(`cd ${path.resolve(ROOT_DIR, '..')} && npx eslint src --max-warnings=500 -f json`, { 
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore']
        });
        
        try {
          const results = JSON.parse(output);
          const errorCount = results.reduce((sum, file) => sum + file.errorCount, 0);
          const warningCount = results.reduce((sum, file) => sum + file.warningCount, 0);
          
          return {
            count: errorCount + warningCount,
            details: `${errorCount} errors, ${warningCount} warnings`
          };
        } catch (e) {
          console.error('Error parsing ESLint output:', e.message);
          return { count: 0, details: 'Error running ESLint' };
        }
      } catch (error) {
        // If ESLint fails, try to extract numbers from error output
        const output = error.stdout || '';
        const errorMatch = output.match(/(\d+) errors/);
        const warningMatch = output.match(/(\d+) warnings/);
        
        const errorCount = errorMatch ? parseInt(errorMatch[1], 10) : 0;
        const warningCount = warningMatch ? parseInt(warningMatch[1], 10) : 0;
        
        return {
          count: errorCount + warningCount,
          details: `${errorCount} errors, ${warningCount} warnings`
        };
      }
    }
  },
  {
    name: 'TypeScript Errors',
    detect: () => {
      try {
        // Run TypeScript compiler in noEmit mode and capture output
        const output = execSync(`cd ${path.resolve(ROOT_DIR, '..')} && npx tsc --noEmit`, { 
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore']
        });
        
        return {
          count: 0,
          details: 'No TypeScript errors found'
        };
      } catch (error) {
        // Parse TypeScript error output
        const output = error.stdout || '';
        const errorMatch = output.match(/Found (\d+) error/);
        const errorCount = errorMatch ? parseInt(errorMatch[1], 10) : 0;
        
        return {
          count: errorCount,
          details: `${errorCount} TypeScript errors`
        };
      }
    }
  },
  {
    name: 'Duplicate Components',
    detect: () => {
      const componentFiles = glob.sync(`${ROOT_DIR}/**/*.{js,jsx}`);
      const componentNames = new Map();
      const duplicates = [];
      
      componentFiles.forEach(filePath => {
        const fileName = path.basename(filePath, path.extname(filePath));
        
        // Skip index files and obvious non-components
        if (fileName === 'index' || 
            fileName.startsWith('use') || 
            fileName.includes('util') || 
            fileName.includes('helper')) {
          return;
        }
        
        if (componentNames.has(fileName)) {
          const existingPath = componentNames.get(fileName);
          duplicates.push({
            name: fileName,
            paths: [existingPath, filePath]
          });
        } else {
          componentNames.set(fileName, filePath);
        }
      });
      
      return {
        count: duplicates.length,
        details: duplicates.map(d => d.name).join(', ')
      };
    }
  },
  {
    name: 'Hook Violations',
    detect: () => {
      const jsxFiles = glob.sync(`${ROOT_DIR}/**/*.{js,jsx}`);
      const hookViolations = [];
      
      const HOOK_VIOLATION_PATTERNS = [
        /(for|if|while|function|=>)\s*\([^)]*\)\s*\{[^{]*useState\(/,
        /(for|if|while|function|=>)\s*\([^)]*\)\s*\{[^{]*useEffect\(/,
        /(for|if|while|function|=>)\s*\([^)]*\)\s*\{[^{]*useCallback\(/,
        /(for|if|while|function|=>)\s*\([^)]*\)\s*\{[^{]*useMemo\(/,
        /useEffect\(\s*\(\s*\)\s*=>\s*\{[^{}]*\}\s*\)/,
        /useCallback\(\s*\([^)]*\)\s*=>\s*\{[^{}]*\}\s*\)/,
        /useMemo\(\s*\(\s*\)\s*=>\s*\{[^{}]*\}\s*\)/
      ];
      
      jsxFiles.forEach(filePath => {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          
          HOOK_VIOLATION_PATTERNS.forEach(pattern => {
            if (pattern.test(content)) {
              hookViolations.push(filePath);
            }
          });
        } catch (error) {
          // Skip if can't read file
        }
      });
      
      // Remove duplicates
      const uniqueViolations = [...new Set(hookViolations)];
      
      return {
        count: uniqueViolations.length,
        details: `${uniqueViolations.length} files with hook violations`
      };
    }
  },
  {
    name: 'Missing Tests',
    detect: () => {
      const componentFiles = glob.sync(`${ROOT_DIR}/components/**/*.{js,jsx}`);
      const testFiles = glob.sync(`${ROOT_DIR}/tests/**/*.{js,jsx}`);
      
      const componentNames = componentFiles.map(filePath => {
        const fileName = path.basename(filePath, path.extname(filePath));
        return fileName;
      });
      
      const testedComponents = testFiles.map(filePath => {
        const fileName = path.basename(filePath, path.extname(filePath));
        return fileName.replace('.test', '').replace('Test', '');
      });
      
      const missingTests = componentNames.filter(name => 
        !testedComponents.includes(name) && 
        !name.includes('index') &&
        !name.startsWith('_')
      );
      
      return {
        count: missingTests.length,
        details: `${missingTests.length} components missing tests`
      };
    }
  },
  {
    name: 'Import Issues',
    detect: () => {
      const jsxFiles = glob.sync(`${ROOT_DIR}/**/*.{js,jsx}`);
      const importIssues = [];
      
      const IMPORT_ISSUE_PATTERNS = [
        /import\s+\{\s*[^}]*\s*\}\s+from\s+['"]@mui\/material['"]/,
        /import\s+[A-Z][a-zA-Z0-9]*\s+from\s+['"]@mui\/material\/[a-zA-Z0-9]+['"]/,
        /import\s+[A-Z][a-zA-Z0-9]*\s+from\s+['"]@mui\/icons-material\/[a-zA-Z0-9]+['"]/
      ];
      
      jsxFiles.forEach(filePath => {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          
          IMPORT_ISSUE_PATTERNS.forEach(pattern => {
            if (pattern.test(content)) {
              importIssues.push(filePath);
            }
          });
        } catch (error) {
          // Skip if can't read file
        }
      });
      
      // Remove duplicates
      const uniqueIssues = [...new Set(importIssues)];
      
      return {
        count: uniqueIssues.length,
        details: `${uniqueIssues.length} files with direct MUI imports`
      };
    }
  }
];

// Function to run all audits and generate a report
async function runAudit() {
  console.log('🔍 Running technical debt audit...');
  
  const results = {};
  
  // Run each audit category
  for (const category of AUDIT_CATEGORIES) {
    console.log(`- Auditing ${category.name}...`);
    results[category.name] = category.detect();
  }
  
  // Generate detailed report
  let reportContent = `# Technical Debt Audit Report\n\n`;
  reportContent += `Generated: ${new Date().toISOString()}\n\n`;
  
  reportContent += `## Summary\n\n`;
  reportContent += `| Category | Count | Details |\n`;
  reportContent += `|----------|-------|--------|\n`;
  
  Object.entries(results).forEach(([category, result]) => {
    reportContent += `| ${category} | ${result.count} | ${result.details} |\n`;
  });
  
  reportContent += `\n## Recommendations\n\n`;
  
  // Add category-specific recommendations
  Object.entries(results).forEach(([category, result]) => {
    if (result.count > 0) {
      reportContent += `### ${category}\n\n`;
      
      switch (category) {
        case 'ESLint Errors':
          reportContent += `- Run \`npm run fix:all\` to fix automatic ESLint issues\n`;
          reportContent += `- Address remaining ESLint errors manually\n`;
          reportContent += `- Consider disabling non-critical rules during migration\n\n`;
          break;
          
        case 'TypeScript Errors':
          reportContent += `- Fix TypeScript configuration issues\n`;
          reportContent += `- Add proper type definitions\n`;
          reportContent += `- Consider using \`// @ts-ignore\` temporarily for complex cases\n\n`;
          break;
          
        case 'Duplicate Components':
          reportContent += `- Run \`npm run remove-deprecated\` to remove duplicate components\n`;
          reportContent += `- Standardize on a single implementation of each component\n`;
          reportContent += `- Update imports to use the standardized component\n\n`;
          break;
          
        case 'Hook Violations':
          reportContent += `- Run \`npm run standardize-hooks\` to fix hook issues\n`;
          reportContent += `- Extract custom hooks for complex cases\n`;
          reportContent += `- Follow React hooks rules for remaining issues\n\n`;
          break;
          
        case 'Missing Tests':
          reportContent += `- Prioritize tests for critical components\n`;
          reportContent += `- Use the test templates in the test directory\n`;
          reportContent += `- Consider snapshot tests for UI components\n\n`;
          break;
          
        case 'Import Issues':
          reportContent += `- Run \`npm run transform-components\` to standardize imports\n`;
          reportContent += `- Use the design system adapter for all MUI imports\n`;
          reportContent += `- Follow the migration guide for component updates\n\n`;
          break;
      }
    }
  });
  
  // Write report to file
  fs.writeFileSync(REPORT_PATH, reportContent, 'utf8');
  console.log(`✅ Audit report written to ${REPORT_PATH}`);
  
  // Update ClaudeContext.md
  updateClaudeContext(results);
  
  return results;
}

// Function to update the technical debt tracker in ClaudeContext.md
function updateClaudeContext(results) {
  try {
    const claudeContext = fs.readFileSync(CLAUDE_CONTEXT_PATH, 'utf8');
    
    // Find the technical debt tracker section
    const trackerRegex = /## Technical Debt Elimination Tracker\s*\n\s*\|\s*Category\s*\|\s*Initial Count\s*\|\s*Current Count\s*\|\s*Remaining\s*%\s*\|\s*\n\s*\|[-\s|]*\|\s*((?:\|[^\n]*\n\s*)*)/;
    const trackerMatch = claudeContext.match(trackerRegex);
    
    if (!trackerMatch) {
      console.error('❌ Could not find technical debt tracker in ClaudeContext.md');
      return;
    }
    
    // Parse existing rows
    const existingTable = trackerMatch[1];
    const rows = existingTable.split('\n').filter(row => row.trim() !== '');
    
    const trackerData = {};
    
    rows.forEach(row => {
      const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
      if (cells.length >= 3) {
        const category = cells[0];
        const initialCount = cells[1] === 'TBD' ? null : parseInt(cells[1], 10);
        trackerData[category] = {
          initialCount,
          currentCount: null,
          remainingPercent: null
        };
      }
    });
    
    // Update with current results
    Object.entries(results).forEach(([category, result]) => {
      if (trackerData[category]) {
        // If initial count is not set, set it
        if (trackerData[category].initialCount === null) {
          trackerData[category].initialCount = result.count;
        }
        
        // Update current count
        trackerData[category].currentCount = result.count;
        
        // Calculate remaining percent
        if (trackerData[category].initialCount > 0) {
          trackerData[category].remainingPercent = Math.round(
            (result.count / trackerData[category].initialCount) * 100
          );
        } else {
          trackerData[category].remainingPercent = 0;
        }
      } else {
        trackerData[category] = {
          initialCount: result.count,
          currentCount: result.count,
          remainingPercent: 100
        };
      }
    });
    
    // Generate new table
    let newTable = '| Category | Initial Count | Current Count | Remaining % |\n';
    newTable += '|----------|--------------|--------------|------------|\n';
    
    Object.entries(trackerData).forEach(([category, data]) => {
      const initialCount = data.initialCount === null ? 'TBD' : data.initialCount;
      const currentCount = data.currentCount === null ? 'TBD' : data.currentCount;
      const remainingPercent = data.remainingPercent === null ? 'TBD' : `${data.remainingPercent}%`;
      
      newTable += `| ${category} | ${initialCount} | ${currentCount} | ${remainingPercent} |\n`;
    });
    
    // Update the table in the content
    const updatedContent = claudeContext.replace(trackerRegex, `## Technical Debt Elimination Tracker\n\n${newTable}`);
    
    // Update build status
    const buildStatusRegex = /## Build Status\s*\n- Initial:[^\n]*\n- Current:[^\n]*\n- Target:[^\n]*/;
    const totalIssues = Object.values(results).reduce((sum, result) => sum + result.count, 0);
    const buildStatus = totalIssues > 0 ? 'Failing with issues' : 'Passing';
    
    const updatedBuildStatus = `## Build Status\n- Initial: Failing with multiple errors\n- Current: ${buildStatus} (${totalIssues} total issues)\n- Target: Clean build with zero warnings/errors`;
    
    const finalContent = updatedContent.replace(buildStatusRegex, updatedBuildStatus);
    
    // Write updated content
    fs.writeFileSync(CLAUDE_CONTEXT_PATH, finalContent, 'utf8');
    console.log(`✅ Updated technical debt tracker in ClaudeContext.md`);
  } catch (error) {
    console.error(`❌ Error updating ClaudeContext.md:`, error.message);
  }
}

// Run the audit
runAudit().then(() => {
  console.log('✅ Technical debt audit completed');
});