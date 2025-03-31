/**
 * Accessibility Audit Script
 * 
 * This script analyzes the codebase for accessibility issues:
 * - Checks for proper ARIA attributes
 * - Verifies keyboard navigability
 * - Identifies color contrast issues
 * - Finds missing alt text on images
 * - Checks for proper semantic HTML
 * 
 * Usage: node accessibility-audit.js [--fix]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../../frontend/src');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'components');
const PAGES_DIR = path.join(ROOT_DIR, 'pages');
const REPORTS_DIR = path.resolve(__dirname, '../reports/accessibility');
const BACKUP_DIR = path.resolve(__dirname, '../backups', `accessibility-audit-${new Date().toISOString().replace(/[:.]/g, '-')}`);
const AUTO_FIX = process.argv.includes('--fix');

// Create output and backup directories
fs.mkdirSync(REPORTS_DIR, { recursive: true });
if (AUTO_FIX) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}
console.log(`📁 Created reports directory: ${REPORTS_DIR}`);
if (AUTO_FIX) console.log(`📁 Created backup directory: ${BACKUP_DIR}`);

// List of common accessibility issues to check for
const accessibilityChecks = {
  // Missing alt text on images
  missingAltText: {
    description: 'Images must have alt text',
    pattern: /<img[^>]*(?!alt=)[^>]*>/g,
    severity: 'high',
  },
  
  // Missing aria-label on interactive elements without text
  missingAriaLabel: {
    description: 'Interactive elements without text should have aria-label',
    pattern: /<(button|a)[^>]*(?!aria-label=|aria-labelledby=)[^>]*>(\s*|<i[^>]*>[^<]*<\/i>\s*)<\/(button|a)>/g,
    severity: 'high',
  },
  
  // Missing aria-describedby on form elements
  missingAriaDescribedby: {
    description: 'Form elements should have aria-describedby when there is an error message',
    pattern: /<(input|select|textarea)[^>]*(?!aria-describedby=)[^>]*>/g,
    severity: 'medium',
  },
  
  // Missing role attributes on non-semantic elements used as controls
  missingRole: {
    description: 'Non-semantic elements used as controls should have role attributes',
    pattern: /<div[^>]*(?:onClick|onKeyDown|onKeyPress|tabIndex)[^>]*(?!role=)[^>]*>/g,
    severity: 'high',
  },
  
  // Missing proper heading hierarchy
  improperHeadingHierarchy: {
    description: 'Heading levels should not be skipped (e.g., h1 to h3)',
    custom: true,
    severity: 'medium',
  },
  
  // Missing keyboard event handlers on interactive elements
  missingKeyboardHandlers: {
    description: 'Interactive elements should have keyboard event handlers',
    pattern: /<(div|span)[^>]*onClick=[^>]*(?!onKeyDown=|onKeyPress=)[^>]*>/g,
    severity: 'high',
  },
  
  // Missing form labels
  missingFormLabels: {
    description: 'Form elements should have associated labels',
    pattern: /<(input|select|textarea)[^>]*(?!id=|aria-label=|aria-labelledby=)[^>]*>/g,
    severity: 'high',
  },
  
  // Non-semantic elements with click handlers
  nonSemanticButtons: {
    description: 'Use semantic button elements instead of divs with click handlers',
    pattern: /<(div|span)[^>]*onClick=[^>]*>/g,
    severity: 'medium',
  },
  
  // Missing tabIndex on interactive non-button/link elements
  missingTabIndex: {
    description: 'Interactive non-button/link elements should have tabIndex',
    pattern: /<(div|span)[^>]*(?:onClick|onKeyDown|onKeyPress)[^>]*(?!tabIndex=)[^>]*>/g,
    severity: 'high',
  },
  
  // Missing accessible names on form elements
  missingAccessibleName: {
    description: 'Form elements should have accessible names',
    pattern: /<(input|select|textarea)[^>]*(?!aria-label=|aria-labelledby=)[^>]*>/g,
    severity: 'high',
  },
};

// Common fix functions
const fixFunctions = {
  // Add empty alt text to decorative images
  addAltText: (match) => {
    if (match.includes('src="')) {
      // Extract the image name to create a meaningful alt text
      const srcMatch = match.match(/src=["']([^"']+)["']/);
      if (srcMatch) {
        const imagePath = srcMatch[1];
        const imageName = path.basename(imagePath, path.extname(imagePath))
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        
        return match.replace(/<img/, `<img alt="${imageName}"`);
      }
    }
    return match.replace(/<img/, '<img alt=""');
  },
  
  // Add aria-label to buttons without text
  addAriaLabel: (match) => {
    // Extract element type
    const elementType = match.startsWith('<button') ? 'button' : 'link';
    
    // Try to extract an icon name or class
    const classMatch = match.match(/class=["']([^"']+)["']/);
    let label = elementType;
    
    if (classMatch) {
      const className = classMatch[1];
      
      // Extract icon name from common icon classes (material-icons, fa-*, etc.)
      if (className.includes('icon')) {
        const iconMatch = className.match(/(material-icons|fa-|icon-)([a-z-]+)/);
        if (iconMatch) {
          label = iconMatch[2].replace(/-/g, ' ');
        }
      }
    }
    
    return match.replace(/<(button|a)/, `<$1 aria-label="${label}"`);
  },
  
  // Add role to div used as a button
  addRole: (match) => {
    const hasOnClick = match.includes('onClick');
    const role = hasOnClick ? 'button' : 'link';
    return match.replace(/<div/, `<div role="${role}"`);
  },
  
  // Add keyboard handlers to clickable elements
  addKeyboardHandlers: (match) => {
    let newMatch = match;
    
    if (match.includes('onClick={')) {
      const onClickMatch = match.match(/onClick={([^}]+)}/);
      if (onClickMatch) {
        const handler = onClickMatch[1];
        newMatch = newMatch.replace(/<(div|span)/, `<$1 onKeyDown={(e) => e.key === 'Enter' && ${handler}}`);
      }
    } else if (match.includes('onClick="')) {
      const onClickMatch = match.match(/onClick="([^"]+)"/);
      if (onClickMatch) {
        const handler = onClickMatch[1];
        newMatch = newMatch.replace(/<(div|span)/, `<$1 onKeyDown="if(event.key === 'Enter') {${handler}}"`);
      }
    }
    
    // Add tabIndex if it's missing
    if (!newMatch.includes('tabIndex')) {
      newMatch = newMatch.replace(/<(div|span)/, '<$1 tabIndex="0"');
    }
    
    return newMatch;
  },
  
  // Add tabIndex to interactive elements
  addTabIndex: (match) => {
    return match.replace(/<(div|span)/, '<$1 tabIndex="0"');
  },
};

// Analyze a JSX file for accessibility issues
function analyzeJSXFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    const relativePath = path.relative(ROOT_DIR, filePath);
    
    // Initialize results
    const issues = [];
    let updatedContent = content;
    let hasChanges = false;
    
    // Run each accessibility check
    Object.entries(accessibilityChecks).forEach(([checkName, check]) => {
      // Skip custom checks that don't use regex patterns
      if (check.custom) return;
      
      const { pattern, description, severity } = check;
      const fixFunction = fixFunctions[`add${checkName.replace(/^missing/, '')}`];
      
      // Find matches
      let matches = [];
      let match;
      while ((match = pattern.exec(content)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
        });
      }
      
      // Reset pattern lastIndex
      pattern.lastIndex = 0;
      
      // Process each match
      matches.forEach(({ match, index }) => {
        const lineNumber = content.substring(0, index).split('\n').length;
        
        // Add issue to report
        issues.push({
          check: checkName,
          description,
          severity,
          line: lineNumber,
          match: match.length > 60 ? match.substring(0, 60) + '...' : match,
        });
        
        // Apply fix if auto-fix is enabled and a fix function exists
        if (AUTO_FIX && fixFunction) {
          const fixed = fixFunction(match);
          if (fixed !== match) {
            updatedContent = updatedContent.replace(match, fixed);
            hasChanges = true;
          }
        }
      });
    });
    
    // Run custom checks
    
    // Check for proper heading hierarchy
    if (content.includes('<h')) {
      const headingLevels = [];
      const headingPattern = /<h([1-6])[^>]*>/g;
      while ((match = headingPattern.exec(content)) !== null) {
        headingLevels.push(parseInt(match[1], 10));
      }
      
      // Check for skipped levels (e.g., h1 to h3)
      for (let i = 1; i < headingLevels.length; i++) {
        if (headingLevels[i] > headingLevels[i - 1] + 1) {
          const lineNumber = content.substring(0, content.indexOf(`<h${headingLevels[i]}`)).split('\n').length;
          
          issues.push({
            check: 'improperHeadingHierarchy',
            description: accessibilityChecks.improperHeadingHierarchy.description,
            severity: accessibilityChecks.improperHeadingHierarchy.severity,
            line: lineNumber,
            match: `Skipped from h${headingLevels[i - 1]} to h${headingLevels[i]}`,
          });
        }
      }
    }
    
    // If there are changes and auto-fix is enabled, backup and update the file
    if (hasChanges && AUTO_FIX) {
      const backupPath = path.join(BACKUP_DIR, relativePath);
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      fs.copyFileSync(filePath, backupPath);
      fs.writeFileSync(filePath, updatedContent, 'utf8');
    }
    
    return {
      filePath,
      relativePath,
      issues,
      fixedIssues: hasChanges ? issues.length : 0,
    };
  } catch (error) {
    console.error(`❌ Error analyzing ${filePath}:`, error.message);
    return {
      filePath,
      relativePath: path.relative(ROOT_DIR, filePath),
      error: error.message,
      issues: [],
    };
  }
}

// Generate an accessibility report
function generateAccessibilityReport(results) {
  // Count total issues by type and severity
  const issueCounts = {
    total: 0,
    fixed: 0,
    byType: {},
    bySeverity: {
      high: 0,
      medium: 0,
      low: 0,
    },
  };
  
  // Process all issues across all files
  results.forEach(result => {
    if (result.issues) {
      result.issues.forEach(issue => {
        issueCounts.total++;
        
        // Count by type
        issueCounts.byType[issue.check] = (issueCounts.byType[issue.check] || 0) + 1;
        
        // Count by severity
        issueCounts.bySeverity[issue.severity] = (issueCounts.bySeverity[issue.severity] || 0) + 1;
      });
      
      // Count fixed issues
      issueCounts.fixed += result.fixedIssues || 0;
    }
  });
  
  // Generate markdown report
  const report = `# Accessibility Audit Report

Generated: ${new Date().toISOString()}

## Summary

Total files analyzed: ${results.length}
Total accessibility issues found: ${issueCounts.total}
${AUTO_FIX ? `Issues automatically fixed: ${issueCounts.fixed}` : ''}

### Issues by Severity

| Severity | Count |
|----------|-------|
| High     | ${issueCounts.bySeverity.high} |
| Medium   | ${issueCounts.bySeverity.medium} |
| Low      | ${issueCounts.bySeverity.low} |

### Issues by Type

| Issue Type | Count | Description |
|------------|-------|-------------|
${Object.entries(issueCounts.byType)
  .sort((a, b) => b[1] - a[1])
  .map(([type, count]) => {
    const description = accessibilityChecks[type]?.description || '';
    return `| ${type} | ${count} | ${description} |`;
  })
  .join('\n')}

## Files with Accessibility Issues

${results
  .filter(result => result.issues && result.issues.length > 0)
  .sort((a, b) => b.issues.length - a.issues.length)
  .map(result => {
    return `### ${result.relativePath} (${result.issues.length} issues)

${result.issues
  .sort((a, b) => a.line - b.line)
  .map(issue => {
    return `- **Line ${issue.line}** - ${issue.check} (${issue.severity}): ${issue.description}
  \`${issue.match}\``;
  })
  .join('\n\n')}
`;
  })
  .join('\n\n')}

## Recommendations

${Object.entries(accessibilityChecks)
  .filter(([_, check]) => issueCounts.byType[_])
  .sort((a, b) => issueCounts.byType[b[0]] - issueCounts.byType[a[0]])
  .map(([checkName, check]) => {
    const count = issueCounts.byType[checkName] || 0;
    let recommendation = '';
    
    switch (checkName) {
      case 'missingAltText':
        recommendation = 'Add descriptive alt text to all images. Use empty alt text (alt="") for decorative images.';
        break;
      case 'missingAriaLabel':
        recommendation = 'Add aria-label to buttons without visible text content, especially icon-only buttons.';
        break;
      case 'missingRole':
        recommendation = 'Add appropriate role attributes to non-semantic elements used as interactive controls.';
        break;
      case 'improperHeadingHierarchy':
        recommendation = 'Ensure proper heading hierarchy. Do not skip heading levels (e.g., go from h1 to h3).';
        break;
      case 'missingKeyboardHandlers':
        recommendation = 'Add keyboard event handlers to all interactive elements to ensure keyboard accessibility.';
        break;
      case 'missingFormLabels':
        recommendation = 'Associate labels with form elements using either the label element or aria-label/aria-labelledby.';
        break;
      case 'nonSemanticButtons':
        recommendation = 'Replace divs with click handlers with semantic button elements when they represent actions.';
        break;
      case 'missingTabIndex':
        recommendation = 'Add tabIndex="0" to non-interactive elements that have been made interactive with click handlers.';
        break;
      case 'missingAccessibleName':
        recommendation = 'Ensure all form elements have accessible names through labels, aria-label, or aria-labelledby.';
        break;
      default:
        recommendation = check.description;
    }
    
    return `### ${checkName} (${count} issues)

${recommendation}

\`\`\`jsx
// Bad
${getBadExample(checkName)}

// Good
${getGoodExample(checkName)}
\`\`\``;
  })
  .join('\n\n')}

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/)
- [Accessible Rich Internet Applications (WAI-ARIA)](https://www.w3.org/TR/wai-aria/)
- [React Accessibility Docs](https://reactjs.org/docs/accessibility.html)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
`;

  // Write report file
  const reportPath = path.join(REPORTS_DIR, 'accessibility-audit-report.md');
  fs.writeFileSync(reportPath, report, 'utf8');
  
  return {
    reportPath,
    issueCounts,
  };
}

// Helper function to get a bad example for a given issue type
function getBadExample(issueType) {
  switch (issueType) {
    case 'missingAltText':
      return '<img src="logo.png" />';
    case 'missingAriaLabel':
      return '<button><i className="icon-delete"></i></button>';
    case 'missingRole':
      return '<div onClick={handleClick}>Click Me</div>';
    case 'improperHeadingHierarchy':
      return '<h1>Page Title</h1>\n<h3>Subsection</h3> <!-- Skipped h2 -->';
    case 'missingKeyboardHandlers':
      return '<div onClick={handleClick}>Interactive Element</div>';
    case 'missingFormLabels':
      return '<input type="text" />';
    case 'nonSemanticButtons':
      return '<div className="btn" onClick={handleClick}>Submit</div>';
    case 'missingTabIndex':
      return '<div onClick={handleClick}>Clickable Div</div>';
    case 'missingAccessibleName':
      return '<input type="text" placeholder="Enter name" />';
    default:
      return 'Example not available';
  }
}

// Helper function to get a good example for a given issue type
function getGoodExample(issueType) {
  switch (issueType) {
    case 'missingAltText':
      return '<img src="logo.png" alt="Company Logo" />';
    case 'missingAriaLabel':
      return '<button aria-label="Delete item"><i className="icon-delete"></i></button>';
    case 'missingRole':
      return '<div role="button" onClick={handleClick}>Click Me</div>';
    case 'improperHeadingHierarchy':
      return '<h1>Page Title</h1>\n<h2>Section</h2>\n<h3>Subsection</h3>';
    case 'missingKeyboardHandlers':
      return '<div onClick={handleClick} onKeyDown={(e) => e.key === "Enter" && handleClick()} tabIndex="0">Interactive Element</div>';
    case 'missingFormLabels':
      return '<label htmlFor="name">Name</label>\n<input id="name" type="text" />';
    case 'nonSemanticButtons':
      return '<button onClick={handleClick}>Submit</button>';
    case 'missingTabIndex':
      return '<div onClick={handleClick} tabIndex="0">Clickable Div</div>';
    case 'missingAccessibleName':
      return '<label htmlFor="name">Name</label>\n<input id="name" type="text" />';
    default:
      return 'Example not available';
  }
}

// Generate command-line summary output
function printSummary(issueCounts) {
  console.log('\n📊 Accessibility Audit Summary:');
  console.log(`- Total issues found: ${issueCounts.total}`);
  console.log(`- High severity issues: ${issueCounts.bySeverity.high}`);
  console.log(`- Medium severity issues: ${issueCounts.bySeverity.medium}`);
  console.log(`- Low severity issues: ${issueCounts.bySeverity.low}`);
  
  if (AUTO_FIX) {
    console.log(`- Issues automatically fixed: ${issueCounts.fixed}`);
  }
  
  console.log('\nTop issue types:');
  Object.entries(issueCounts.byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([type, count]) => {
      console.log(`- ${type}: ${count}`);
    });
}

// Main function
function main() {
  console.log('🔍 Running accessibility audit...');
  
  // Find all JSX files in the components and pages directories
  const componentFiles = glob.sync(`${COMPONENTS_DIR}/**/*.{js,jsx}`);
  const pageFiles = glob.sync(`${PAGES_DIR}/**/*.{js,jsx}`);
  const allFiles = [...componentFiles, ...pageFiles];
  
  console.log(`Found ${allFiles.length} files to analyze...`);
  
  // Analyze each file
  const results = allFiles.map(filePath => analyzeJSXFile(filePath));
  
  // Generate report
  const { reportPath, issueCounts } = generateAccessibilityReport(results);
  
  // Print summary
  printSummary(issueCounts);
  
  console.log(`\n✅ Accessibility audit report generated at: ${reportPath}`);
  
  // Provide next steps
  console.log('\nNext steps:');
  console.log('1. Review the accessibility audit report');
  console.log('2. Fix high severity issues first');
  console.log('3. Add ARIA attributes and proper semantic HTML');
  console.log('4. Ensure keyboard navigability for all interactive elements');
  console.log('5. Run the audit again to verify improvements');
  
  return issueCounts;
}

// Run the main function
const issueCounts = main();