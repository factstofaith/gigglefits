#!/usr/bin/env node

/**
 * Remaining Fixes Tracker
 * 
 * This script analyzes the codebase for remaining issues that need to be fixed
 * and generates a report of tasks that need to be completed for Phase 10.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Config
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const DESIGN_SYSTEM_DIR = path.join(SRC_DIR, 'design-system');
const REPORT_PATH = path.join(PROJECT_ROOT, 'REMAINING-FIXES.md');

// Check design system optimized exports
function checkDesignSystemExports() {
  const optimizedPath = path.join(DESIGN_SYSTEM_DIR, 'optimized', 'index.js');
  
  if (!fs.existsSync(optimizedPath)) {
    return {
      error: 'Missing optimized index.js file',
      missingComponents: []
    };
  }
  
  const content = fs.readFileSync(optimizedPath, 'utf8');
  
  // Expected components that might be missing
  const expectedComponents = [
    'Typography', 'Container', 'Paper', 'Grid', 'Card', 'CardContent',
    'List', 'ListItem', 'ListItemText', 'Divider', 'AppBar', 'Toolbar',
    'Alert', 'Dialog', 'DialogActions', 'DialogContent', 'DialogTitle'
  ];
  
  // Check which components are exported
  const exportedComponents = [];
  const missingComponents = [];
  
  expectedComponents.forEach(component => {
    if (content.includes(`export { ${component}`)) {
      exportedComponents.push(component);
    } else {
      missingComponents.push(component);
    }
  });
  
  return {
    error: null,
    exportedComponents,
    missingComponents
  };
}

// Check for hook violations
function checkHookViolations() {
  try {
    // Run eslint to find React hook violations
    const result = execSync(
      'npx eslint --rule "react-hooks/rules-of-hooks: error" --rule "react-hooks/exhaustive-deps: warn" --ext .jsx,.js src/hooks/ src/components/ src/contexts/',
      { cwd: PROJECT_ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    
    return {
      error: null,
      violations: 0,
      details: 'No hook violations found.'
    };
  } catch (error) {
    // Parse the error output to count hook violations
    const violations = (error.stdout.match(/react-hooks\/rules-of-hooks/g) || []).length;
    
    return {
      error: 'Hook violations found',
      violations,
      details: error.stdout
    };
  }
}

// Check webpack configuration
function checkWebpackConfig() {
  const configPath = path.join(SRC_DIR, 'config', 'index.js');
  
  if (!fs.existsSync(configPath)) {
    return {
      error: 'Missing config/index.js file',
      issues: []
    };
  }
  
  const content = fs.readFileSync(configPath, 'utf8');
  const issues = [];
  
  // Check for potential issues in the config file
  if (content.includes('process.env.')) {
    issues.push('Contains direct process.env references which may cause webpack parsing issues');
  }
  
  if (content.includes('module.exports') && content.includes('export default')) {
    issues.push('Mixes CommonJS and ES Module export styles');
  }
  
  return {
    error: null,
    issues
  };
}

// Generate report
function generateReport() {
  const designSystemResult = checkDesignSystemExports();
  const hookResult = checkHookViolations();
  const webpackResult = checkWebpackConfig();
  
  const reportContent = `# Remaining Fixes for Phase 10

## Overview
This report identifies the remaining issues that need to be fixed to complete Phase 10 (Zero Technical Debt) of the TAP Integration Platform optimization project.

## Design System Exports Issues

${designSystemResult.error ? `**Error:** ${designSystemResult.error}` : ''}

Missing component exports in design-system/optimized/index.js:
${designSystemResult.missingComponents.length > 0 
  ? designSystemResult.missingComponents.map(comp => `- [ ] ${comp}`).join('\n')
  : '- No missing components found'}

## React Hook Violations

${hookResult.error ? `**Error:** ${hookResult.error}` : ''}

Number of hook violations: **${hookResult.violations}**

${hookResult.violations > 0 ? '- [ ] Fix React hook violations' : '- [x] No hook violations found'}

## Webpack Configuration Issues

${webpackResult.error ? `**Error:** ${webpackResult.error}` : ''}

Issues in src/config/index.js:
${webpackResult.issues.length > 0 
  ? webpackResult.issues.map(issue => `- [ ] ${issue}`).join('\n')
  : '- No issues found in config file'}

## Additional Build Issues

- [ ] Fix "parser.destructuringAssignmentPropertiesFor is not a function" error in webpack build
- [ ] Ensure all pages use the correct imports from design-system

## Next Steps

1. Fix the design system exports by adding the missing component exports
2. Update the webpack configuration to resolve parsing issues
3. Fix any remaining hook violations
4. Run a complete build verification

## How to Run This Analysis

\`\`\`bash
node scripts/remaining-fixes.js
\`\`\`

Generated on: ${new Date().toISOString().split('T')[0]}
`;

  fs.writeFileSync(REPORT_PATH, reportContent);
  console.log(`Report generated at ${REPORT_PATH}`);
}

// Main execution
function main() {
  console.log('Analyzing codebase for remaining issues...');
  generateReport();
  console.log('Analysis complete!');
}

main();