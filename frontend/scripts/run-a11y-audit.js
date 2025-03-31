#!/usr/bin/env node

/**
 * Accessibility Audit Runner
 * 
 * A comprehensive tool for running accessibility audits on the entire application
 * and generating detailed reports with remediation suggestions.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const puppeteer = require('puppeteer');
const axe = require('axe-core');
const babel = require('@babel/parser');
const traverse = require('@babel/traverse').default;

// Configuration
const config = {
  outputPath: path.resolve(__dirname, '../accessibility-reports'),
  serverCommand: 'npm start',
  testUrl: 'http://localhost:3000',
  ignorePaths: ['node_modules', 'dist', 'build', 'coverage'],
  componentBasePath: path.resolve(__dirname, '../src/components'),
  scanRoutes: [
    '/',
    '/integrations',
    '/integration-detail',
    '/admin',
    '/settings'
  ],
  a11yRules: {
    wcag2a: { enabled: true },
    wcag2aa: { enabled: true },
    wcag21a: { enabled: true },
    wcag21aa: { enabled: true },
    'color-contrast': { enabled: true },
    'aria-allowed-attr': { enabled: true },
    'aria-hidden-body': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'button-name': { enabled: true },
    'document-title': { enabled: true },
    'frame-title': { enabled: true },
    'image-alt': { enabled: true },
    'input-button-name': { enabled: true },
    'label': { enabled: true },
    'link-name': { enabled: true },
    'list': { enabled: true },
    'listitem': { enabled: true },
    'region': { enabled: true },
    'tabindex': { enabled: true }
  }
};

// Process command line arguments
const args = process.argv.slice(2);
const flags = {
  help: args.includes('--help') || args.includes('-h'),
  staticOnly: args.includes('--static-only') || args.includes('-s'),
  dynamicOnly: args.includes('--dynamic-only') || args.includes('-d'),
  fix: args.includes('--fix') || args.includes('-f'),
  verbose: args.includes('--verbose') || args.includes('-v')
};

// Extract target path if provided
const targetPath = args.find(arg => !arg.startsWith('-'));

/**
 * Show help information
 */
function showHelp() {
  console.log(`
  Accessibility Audit Runner
  --------------------------
  A comprehensive tool for running accessibility audits on the entire application.
  
  Usage:
    npm run a11y-audit -- [options] [target-path]
  
  Options:
    --help, -h          : Show this help information
    --static-only, -s   : Only run static code analysis (no browser)
    --dynamic-only, -d  : Only run dynamic browser-based analysis
    --fix, -f           : Attempt to automatically fix simple issues
    --verbose, -v       : Show detailed audit information
  
  Examples:
    npm run a11y-audit
    npm run a11y-audit -- --static-only src/components/integration
    npm run a11y-audit -- --dynamic-only
    npm run a11y-audit -- --fix
  `);
  process.exit(0);
}

/**
 * Create directory if it doesn't exist
 * 
 * @param {string} dirPath - Directory path to create
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Get all component files
 * 
 * @param {string} basePath - Base path to scan
 * @param {Array<string>} ignorePaths - Paths to ignore
 * @returns {Array<string>} Array of component file paths
 */
function getComponentFiles(basePath, ignorePaths = []) {
  const results = [];
  
  function scanDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath);
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      
      // Skip ignored paths
      if (ignorePaths.some(p => fullPath.includes(p))) {
        continue;
      }
      
      // If directory, scan recursively
      if (fs.statSync(fullPath).isDirectory()) {
        scanDirectory(fullPath);
      }
      // If React component file, add to results
      else if (
        (entry.endsWith('.jsx') || entry.endsWith('.tsx')) &&
        !entry.endsWith('.test.jsx') &&
        !entry.endsWith('.test.tsx')
      ) {
        results.push(fullPath);
      }
    }
  }
  
  scanDirectory(basePath);
  return results;
}

/**
 * Run static code analysis on component files
 * 
 * @param {Array<string>} files - Array of file paths to analyze
 * @returns {Object} Analysis results
 */
function runStaticAnalysis(files) {
  const results = {
    components: {},
    summary: {
      totalComponents: files.length,
      totalIssues: 0,
      issuesByType: {},
      componentsWithIssues: 0
    }
  };
  
  // Issue detectors
  const detectors = {
    missingAria: {
      detect: (code) => {
        const issues = [];
        
        // Check for buttons without aria-label
        const buttonRegex = /<Button[^>]*>(?!\s*<.*>[^<]*<\/.*>\s*)<[^>]*>|\s*<Button[^>]*>[^<]*<\/Button>/g;
        const buttonsWithoutAria = code.match(buttonRegex) || [];
        for (const button of buttonsWithoutAria) {
          if (!button.includes('aria-label') && !button.includes('aria-labelledby')) {
            issues.push({
              type: 'missing-button-aria',
              message: 'Button without accessible label',
              code: button.trim(),
              fix: button.replace(/<Button/, '<Button aria-label="[NEEDS LABEL]"')
            });
          }
        }
        
        // Check for icons without aria-label
        const iconRegex = /<Icon[^>]*>|<[A-Z][a-zA-Z]*Icon[^>]*>/g;
        const iconsWithoutAria = code.match(iconRegex) || [];
        for (const icon of iconsWithoutAria) {
          if (!icon.includes('aria-label') && !icon.includes('aria-labelledby') && !icon.includes('aria-hidden="true"')) {
            issues.push({
              type: 'missing-icon-aria',
              message: 'Icon without accessible label or aria-hidden',
              code: icon.trim(),
              fix: icon.replace(/<([A-Za-z]*Icon)/, '<$1 aria-hidden="true"')
            });
          }
        }
        
        // Check for images without alt
        const imgRegex = /<img[^>]*>/g;
        const imgsWithoutAlt = code.match(imgRegex) || [];
        for (const img of imgsWithoutAlt) {
          if (!img.includes('alt=')) {
            issues.push({
              type: 'missing-img-alt',
              message: 'Image without alt attribute',
              code: img.trim(),
              fix: img.replace(/<img/, '<img alt="[NEEDS ALT TEXT]"')
            });
          }
        }
        
        return issues;
      }
    },
    
    missingKeyboardHandlers: {
      detect: (code) => {
        const issues = [];
        
        // Detect interactive elements without keyboard handlers
        const interactiveRegex = /<(?:div|span|a)[^>]*onClick=[^>]*>/g;
        const interactiveElements = code.match(interactiveRegex) || [];
        for (const element of interactiveElements) {
          if (!element.includes('role=') || !element.includes('onKeyDown') && !element.includes('onKeyPress')) {
            issues.push({
              type: 'missing-keyboard-handler',
              message: 'Interactive element with onClick but without keyboard handler',
              code: element.trim(),
              fix: element.replace(/onClick=/, 'role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onClick(e)} onClick=')
            });
          }
        }
        
        return issues;
      }
    },
    
    colorContrastIssues: {
      detect: (code) => {
        const issues = [];
        
        // Detect hardcoded colors
        const colorRegex = /color:\s*["']#([0-9a-f]{3,6})["']|color:\s*["']rgb\(.*?\)["']|backgroundColor:\s*["']#([0-9a-f]{3,6})["']|backgroundColor:\s*["']rgb\(.*?\)["']/gi;
        const colors = code.match(colorRegex) || [];
        
        if (colors.length > 0) {
          issues.push({
            type: 'hardcoded-colors',
            message: 'Component uses hardcoded colors which may cause contrast issues',
            suggestion: 'Use theme colors from the design system instead of hardcoded values',
            code: colors.join(', ')
          });
        }
        
        return issues;
      }
    },
    
    missingA11yComponents: {
      detect: (code, componentName) => {
        const issues = [];
        
        // Check if an A11y version already exists
        if (componentName.startsWith('A11y')) {
          return issues;
        }
        
        // Detect if using standard components instead of A11y components
        const buttonRegex = /<Button[^>]*>[^<]*<\/Button>|<Button/g;
        const dialogRegex = /<Dialog[^>]*>|<Dialog/g;
        const formRegex = /<form[^>]*>|<form/g;
        
        const buttons = code.match(buttonRegex) || [];
        const dialogs = code.match(dialogRegex) || [];
        const forms = code.match(formRegex) || [];
        
        if (buttons.length > 0 && !code.includes('A11yButton')) {
          issues.push({
            type: 'missing-a11y-component',
            message: 'Using standard Button instead of A11yButton',
            suggestion: 'Replace with A11yButton for improved accessibility'
          });
        }
        
        if (dialogs.length > 0 && !code.includes('A11yDialog')) {
          issues.push({
            type: 'missing-a11y-component',
            message: 'Using standard Dialog instead of A11yDialog',
            suggestion: 'Replace with A11yDialog for improved accessibility'
          });
        }
        
        if (forms.length > 0 && !code.includes('A11yForm')) {
          issues.push({
            type: 'missing-a11y-component',
            message: 'Using standard form instead of A11yForm',
            suggestion: 'Replace with A11yForm for improved accessibility'
          });
        }
        
        return issues;
      }
    },
    
    // Check if component uses accessibility hooks
    missingA11yHooks: {
      detect: (code, componentName) => {
        const issues = [];
        
        // Skip if this is a simple stateless component
        if (!code.includes('useState') && !code.includes('useEffect')) {
          return issues;
        }
        
        // Check for keyboard handling without a11y keyboard hook
        if (code.includes('onKeyDown') || code.includes('onKeyPress') || code.includes('onKeyUp')) {
          if (!code.includes('useA11yKeyboard')) {
            issues.push({
              type: 'missing-a11y-hook',
              message: 'Component handles keyboard events but doesn\'t use useA11yKeyboard',
              suggestion: 'Add the useA11yKeyboard hook for proper keyboard navigation'
            });
          }
        }
        
        // Check for dynamic content without announcement hook
        if (code.includes('useState') && code.includes('useEffect') && code.includes('set')) {
          if (!code.includes('useA11yAnnouncement')) {
            issues.push({
              type: 'missing-a11y-hook',
              message: 'Component has dynamic content but doesn\'t use useA11yAnnouncement',
              suggestion: 'Add the useA11yAnnouncement hook to announce changes to screen readers'
            });
          }
        }
        
        // Check for components that may need focus management
        if (code.includes('Dialog') || code.includes('Modal') || code.includes('Popover')) {
          if (!code.includes('useA11yFocus')) {
            issues.push({
              type: 'missing-a11y-hook',
              message: 'Component may need focus management but doesn\'t use useA11yFocus',
              suggestion: 'Add the useA11yFocus hook for proper focus trapping and restoration'
            });
          }
        }
        
        return issues;
      }
    }
  };
  
  // Analyze each component
  for (const file of files) {
    const componentName = path.basename(file, path.extname(file));
    
    try {
      const code = fs.readFileSync(file, 'utf8');
      const componentResult = {
        name: componentName,
        path: file,
        issues: []
      };
      
      // Run each detector
      for (const [detectorName, detector] of Object.entries(detectors)) {
        const detectorIssues = detector.detect(code, componentName);
        componentResult.issues.push(...detectorIssues);
      }
      
      // Parse component with AST for more detailed analysis
      try {
        const ast = babel.parse(code, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript']
        });
        
        // Find aria attributes
        const ariaAttributes = [];
        traverse(ast, {
          JSXAttribute(path) {
            if (path.node.name.name && path.node.name.name.startsWith('aria-')) {
              ariaAttributes.push(path.node.name.name);
            }
          }
        });
        
        componentResult.ariaAttributes = [...new Set(ariaAttributes)];
        
        // Check for basic component props to help identify component type
        const componentProps = [];
        traverse(ast, {
          ObjectPattern(path) {
            if (path.parent.params && path.parent.params[0] === path.node) {
              path.node.properties.forEach(prop => {
                if (prop.key && prop.key.name) {
                  componentProps.push(prop.key.name);
                }
              });
            }
          }
        });
        
        componentResult.props = [...new Set(componentProps)];
        
        // Check if component is accessibility-focused
        componentResult.isA11yComponent = 
          componentName.includes('A11y') || 
          code.includes('aria-') || 
          code.includes('useA11y') || 
          code.includes('accessib');
      } catch (e) {
        // AST parsing error - not critical, continue with simpler analysis
        if (flags.verbose) {
          console.log(`AST parsing error for ${componentName}: ${e.message}`);
        }
      }
      
      // Update summary statistics
      if (componentResult.issues.length > 0) {
        results.summary.componentsWithIssues++;
        results.summary.totalIssues += componentResult.issues.length;
        
        // Count issues by type
        for (const issue of componentResult.issues) {
          results.summary.issuesByType[issue.type] = (results.summary.issuesByType[issue.type] || 0) + 1;
        }
      }
      
      // Add to results
      results.components[componentName] = componentResult;
      
    } catch (error) {
      console.error(`Error analyzing ${file}:`, error.message);
    }
  }
  
  return results;
}

/**
 * Run dynamic accessibility analysis using Puppeteer and axe-core
 * 
 * @param {Array<string>} urls - URLs to analyze
 * @returns {Promise<Object>} Analysis results
 */
async function runDynamicAnalysis(urls) {
  const results = {
    pages: {},
    summary: {
      totalPages: urls.length,
      totalViolations: 0,
      violationsByType: {},
      violationsByImpact: {
        critical: 0,
        serious: 0,
        moderate: 0,
        minor: 0
      }
    }
  };
  
  // Start the application server
  let serverProcess;
  try {
    console.log('Starting application server...');
    serverProcess = require('child_process').spawn('npm', ['start'], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'ignore',
      detached: true
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Launch browser
    console.log('Launching browser for dynamic analysis...');
    const browser = await puppeteer.launch({ headless: 'new' });
    
    for (const url of urls) {
      console.log(`Analyzing ${url}...`);
      const page = await browser.newPage();
      
      try {
        // Navigate to the page
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Inject axe-core
        await page.evaluateHandle(`
          ${axe.source}
          document.querySelector('body')
        `);
        
        // Run axe analysis
        const axeResults = await page.evaluate(() => {
          return new Promise(resolve => {
            axe.run(document, {
              restoreScroll: true,
              runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
            }, (err, results) => {
              if (err) resolve({ error: err.message });
              resolve(results);
            });
          });
        });
        
        // Process results
        const pageResult = {
          url,
          violations: axeResults.violations || [],
          passes: axeResults.passes ? axeResults.passes.length : 0,
          incomplete: axeResults.incomplete ? axeResults.incomplete.length : 0,
          timestamp: new Date().toISOString()
        };
        
        // Update summary
        results.summary.totalViolations += pageResult.violations.length;
        
        // Count violations by type and impact
        for (const violation of pageResult.violations) {
          results.summary.violationsByType[violation.id] = (results.summary.violationsByType[violation.id] || 0) + 1;
          results.summary.violationsByImpact[violation.impact] = (results.summary.violationsByImpact[violation.impact] || 0) + 1;
        }
        
        // Add to results
        const urlKey = url === config.testUrl ? 'home' : url.replace(config.testUrl, '').replace(/\//g, '_') || 'home';
        results.pages[urlKey] = pageResult;
        
      } catch (error) {
        console.error(`Error analyzing ${url}:`, error.message);
        results.pages[url] = { error: error.message };
      } finally {
        await page.close();
      }
    }
    
    // Close browser
    await browser.close();
    
  } catch (error) {
    console.error('Error in dynamic analysis:', error.message);
  } finally {
    // Kill server process
    if (serverProcess) {
      process.kill(-serverProcess.pid);
    }
  }
  
  return results;
}

/**
 * Fix simple accessibility issues in component files
 * 
 * @param {Object} staticResults - Static analysis results
 * @returns {Object} Fix results
 */
function fixAccessibilityIssues(staticResults) {
  const results = {
    fixes: {},
    summary: {
      totalFixes: 0,
      fixesByType: {}
    }
  };
  
  for (const [componentName, component] of Object.entries(staticResults.components)) {
    const filePath = component.path;
    if (!filePath || !fs.existsSync(filePath)) continue;
    
    let code = fs.readFileSync(filePath, 'utf8');
    let fixedIssues = [];
    
    // Apply fixes for each issue if available
    for (const issue of component.issues) {
      if (issue.fix) {
        try {
          // Simple string replacement
          if (issue.code && code.includes(issue.code)) {
            code = code.replace(issue.code, issue.fix);
            fixedIssues.push({
              type: issue.type,
              message: issue.message,
              fix: issue.fix
            });
            
            // Update summary
            results.summary.totalFixes++;
            results.summary.fixesByType[issue.type] = (results.summary.fixesByType[issue.type] || 0) + 1;
          }
        } catch (error) {
          console.error(`Error fixing ${issue.type} in ${componentName}:`, error.message);
        }
      }
    }
    
    // Save fixed code if there were any changes
    if (fixedIssues.length > 0) {
      try {
        // Backup original file
        const backupPath = `${filePath}.bak`;
        fs.writeFileSync(backupPath, fs.readFileSync(filePath));
        
        // Write fixed file
        fs.writeFileSync(filePath, code);
        
        results.fixes[componentName] = {
          path: filePath,
          backupPath,
          fixedIssues
        };
      } catch (error) {
        console.error(`Error saving fixes for ${componentName}:`, error.message);
      }
    }
  }
  
  return results;
}

/**
 * Generate HTML report for accessibility audit
 * 
 * @param {Object} staticResults - Static analysis results
 * @param {Object} dynamicResults - Dynamic analysis results
 * @param {Object} fixResults - Fix results (optional)
 * @returns {string} Path to the generated report
 */
function generateReport(staticResults, dynamicResults, fixResults = null) {
  const reportDate = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(config.outputPath, `a11y-audit-${reportDate.split('T')[0]}.html`);
  
  // Create output directory if it doesn't exist
  ensureDirectoryExists(config.outputPath);
  
  // Generate HTML content
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Audit Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #0066cc;
    }
    summary {
      cursor: pointer;
      padding: 8px;
      background-color: #f5f5f5;
      border-radius: 4px;
      margin-bottom: 8px;
    }
    details {
      margin-bottom: 16px;
    }
    .card {
      border: 1px solid #ddd;
      border-radius: 5px;
      margin-bottom: 20px;
      overflow: hidden;
    }
    .card-header {
      background-color: #f5f5f5;
      padding: 10px 15px;
      border-bottom: 1px solid #ddd;
    }
    .card-body {
      padding: 15px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .summary-card {
      background-color: #f5f5f5;
      border-radius: 5px;
      padding: 15px;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: bold;
      margin-left: 5px;
    }
    .badge-error {
      background-color: #ffebee;
      color: #d32f2f;
    }
    .badge-warning {
      background-color: #fff3e0;
      color: #f57c00;
    }
    .badge-info {
      background-color: #e1f5fe;
      color: #0288d1;
    }
    .badge-success {
      background-color: #e8f5e9;
      color: #388e3c;
    }
    .issues-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .issues-table th, .issues-table td {
      text-align: left;
      padding: 8px;
      border-bottom: 1px solid #ddd;
    }
    .issues-table th {
      background-color: #f5f5f5;
    }
    .code {
      font-family: monospace;
      padding: 8px;
      background-color: #f5f5f5;
      border-radius: 4px;
      overflow-x: auto;
      white-space: pre-wrap;
    }
    .impact-critical {
      color: #d32f2f;
      font-weight: bold;
    }
    .impact-serious {
      color: #f57c00;
      font-weight: bold;
    }
    .impact-moderate {
      color: #fbc02d;
      font-weight: bold;
    }
    .impact-minor {
      color: #388e3c;
    }
    .tab-container {
      margin-bottom: 20px;
    }
    .tab-buttons {
      display: flex;
      border-bottom: 1px solid #ddd;
      margin-bottom: 15px;
    }
    .tab-button {
      padding: 10px 15px;
      cursor: pointer;
      background-color: transparent;
      border: none;
      border-bottom: 3px solid transparent;
      font-weight: bold;
    }
    .tab-button.active {
      border-bottom-color: #0066cc;
      color: #0066cc;
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
  </style>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Tab functionality
      const tabButtons = document.querySelectorAll('.tab-button');
      tabButtons.forEach(button => {
        button.addEventListener('click', function() {
          // Remove active class from all buttons and content
          tabButtons.forEach(btn => btn.classList.remove('active'));
          document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
          });
          
          // Add active class to clicked button and corresponding content
          this.classList.add('active');
          document.getElementById(this.dataset.tab).classList.add('active');
        });
      });
      
      // Activate first tab
      if (tabButtons.length > 0) {
        tabButtons[0].click();
      }
    });
  </script>
</head>
<body>
  <h1>Accessibility Audit Report</h1>
  <p>Generated on ${new Date().toLocaleString()}</p>
  
  <div class="tab-container">
    <div class="tab-buttons">
      <button class="tab-button" data-tab="tab-summary">Summary</button>
      ${staticResults ? '<button class="tab-button" data-tab="tab-static">Static Analysis</button>' : ''}
      ${dynamicResults ? '<button class="tab-button" data-tab="tab-dynamic">Dynamic Analysis</button>' : ''}
      ${fixResults ? '<button class="tab-button" data-tab="tab-fixes">Fixes Applied</button>' : ''}
    </div>
    
    <div id="tab-summary" class="tab-content">
      <h2>Audit Summary</h2>
      
      <div class="summary-grid">
        ${staticResults ? `
          <div class="summary-card">
            <h3>Static Analysis</h3>
            <p>
              <strong>${staticResults.summary.totalComponents}</strong> components analyzed<br>
              <strong>${staticResults.summary.componentsWithIssues}</strong> components with issues<br>
              <strong>${staticResults.summary.totalIssues}</strong> total issues found
            </p>
            ${Object.keys(staticResults.summary.issuesByType).length > 0 ? `
              <h4>Issues by Type</h4>
              <ul>
                ${Object.entries(staticResults.summary.issuesByType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => `<li>${type}: ${count}</li>`)
                  .join('')}
              </ul>
            ` : ''}
          </div>
        ` : ''}
        
        ${dynamicResults ? `
          <div class="summary-card">
            <h3>Dynamic Analysis</h3>
            <p>
              <strong>${dynamicResults.summary.totalPages}</strong> pages analyzed<br>
              <strong>${dynamicResults.summary.totalViolations}</strong> total violations found
            </p>
            ${Object.keys(dynamicResults.summary.violationsByImpact).length > 0 ? `
              <h4>Violations by Impact</h4>
              <ul>
                ${Object.entries(dynamicResults.summary.violationsByImpact)
                  .sort((a, b) => {
                    const impactOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };
                    return impactOrder[a[0]] - impactOrder[b[0]];
                  })
                  .map(([impact, count]) => `<li class="impact-${impact}">${impact}: ${count}</li>`)
                  .join('')}
              </ul>
            ` : ''}
            ${Object.keys(dynamicResults.summary.violationsByType).length > 0 ? `
              <h4>Top Violation Types</h4>
              <ul>
                ${Object.entries(dynamicResults.summary.violationsByType)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([type, count]) => `<li>${type}: ${count}</li>`)
                  .join('')}
              </ul>
            ` : ''}
          </div>
        ` : ''}
        
        ${fixResults ? `
          <div class="summary-card">
            <h3>Fixes Applied</h3>
            <p>
              <strong>${results.summary.totalFixes}</strong> issues fixed automatically
            </p>
            ${Object.keys(fixResults.summary.fixesByType).length > 0 ? `
              <h4>Fixes by Type</h4>
              <ul>
                ${Object.entries(fixResults.summary.fixesByType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => `<li>${type}: ${count}</li>`)
                  .join('')}
              </ul>
            ` : ''}
          </div>
        ` : ''}
      </div>
      
      <h3>Accessibility Compliance Overview</h3>
      <p>
        This report provides an assessment of the application's accessibility compliance with WCAG 2.1 AA standards.
        The analysis includes both static code analysis and dynamic browser-based testing.
      </p>
      
      <h3>Recommendations</h3>
      <ul>
        ${staticResults && staticResults.summary.issuesByType['missing-a11y-component'] ? 
          '<li>Replace standard UI components with A11y-enhanced components from the component library</li>' : ''}
        ${staticResults && staticResults.summary.issuesByType['missing-a11y-hook'] ? 
          '<li>Add accessibility hooks to components with dynamic content or keyboard interactions</li>' : ''}
        ${staticResults && staticResults.summary.issuesByType['missing-button-aria'] ? 
          '<li>Add aria-label attributes to all buttons without visible text</li>' : ''}
        ${staticResults && staticResults.summary.issuesByType['missing-img-alt'] ? 
          '<li>Ensure all images have appropriate alt attributes</li>' : ''}
        ${staticResults && staticResults.summary.issuesByType['missing-keyboard-handler'] ? 
          '<li>Add keyboard event handlers to all interactive elements</li>' : ''}
        ${dynamicResults && dynamicResults.summary.violationsByType['color-contrast'] ? 
          '<li>Improve color contrast for text elements to meet WCAG AA requirements</li>' : ''}
        ${dynamicResults && dynamicResults.summary.violationsByType['aria-roles'] ? 
          '<li>Verify all ARIA roles are used correctly and appropriately</li>' : ''}
      </ul>
    </div>
    
    ${staticResults ? `
      <div id="tab-static" class="tab-content">
        <h2>Static Analysis Results</h2>
        
        <h3>Components with Issues</h3>
        ${Object.values(staticResults.components)
          .filter(component => component.issues.length > 0)
          .sort((a, b) => b.issues.length - a.issues.length)
          .map(component => `
            <details>
              <summary>
                ${component.name} 
                <span class="badge badge-${component.issues.length > 5 ? 'error' : component.issues.length > 2 ? 'warning' : 'info'}">
                  ${component.issues.length} issues
                </span>
              </summary>
              <div class="card-body">
                <p><strong>File:</strong> ${component.path}</p>
                ${component.props ? `<p><strong>Props:</strong> ${component.props.join(', ')}</p>` : ''}
                ${component.ariaAttributes && component.ariaAttributes.length > 0 ? 
                  `<p><strong>ARIA attributes:</strong> ${component.ariaAttributes.join(', ')}</p>` : ''}
                
                <h4>Issues</h4>
                <table class="issues-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Message</th>
                      <th>Suggestion</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${component.issues.map(issue => `
                      <tr>
                        <td>${issue.type}</td>
                        <td>${issue.message}</td>
                        <td>${issue.suggestion || (issue.fix ? 'Automatically fixable' : '')}</td>
                      </tr>
                      ${issue.code ? `
                        <tr>
                          <td colspan="3">
                            <div class="code">${issue.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                          </td>
                        </tr>
                      ` : ''}
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </details>
          `).join('') || '<p>No components with issues found.</p>'}
        
        <h3>A11y-Compliant Components</h3>
        <p>These components already implement accessibility features:</p>
        <ul>
          ${Object.values(staticResults.components)
            .filter(component => component.isA11yComponent)
            .map(component => `
              <li>${component.name}</li>
            `).join('') || '<li>No A11y-compliant components found.</li>'}
        </ul>
      </div>
    ` : ''}
    
    ${dynamicResults ? `
      <div id="tab-dynamic" class="tab-content">
        <h2>Dynamic Analysis Results</h2>
        
        ${Object.entries(dynamicResults.pages).map(([pageKey, page]) => `
          <details>
            <summary>
              ${pageKey === 'home' ? 'Home Page' : pageKey.replace(/_/g, '/')} 
              <span class="badge badge-${page.violations && page.violations.length > 0 ? 
                (page.violations.some(v => v.impact === 'critical') ? 'error' : 
                 page.violations.some(v => v.impact === 'serious') ? 'warning' : 'info') : 
                'success'}">
                ${page.violations ? `${page.violations.length} violations` : 'No violations'}
              </span>
            </summary>
            <div class="card-body">
              <p><strong>URL:</strong> ${page.url}</p>
              ${page.error ? `<p class="error">Error: ${page.error}</p>` : ''}
              ${page.passes ? `<p><strong>Passed tests:</strong> ${page.passes}</p>` : ''}
              ${page.incomplete ? `<p><strong>Incomplete tests:</strong> ${page.incomplete}</p>` : ''}
              
              ${page.violations && page.violations.length > 0 ? `
                <h4>Violations</h4>
                ${page.violations.map(violation => `
                  <details>
                    <summary>
                      <span class="impact-${violation.impact}">${violation.impact}</span>: ${violation.id} - ${violation.help}
                    </summary>
                    <div>
                      <p>${violation.description}</p>
                      <p><strong>WCAG:</strong> ${violation.tags.filter(t => t.startsWith('wcag')).join(', ')}</p>
                      <p><strong>Help:</strong> <a href="${violation.helpUrl}" target="_blank">${violation.helpUrl}</a></p>
                      
                      <h5>Affected Nodes (${violation.nodes.length})</h5>
                      ${violation.nodes.slice(0, 5).map(node => `
                        <div class="code">${node.html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                        <p><strong>Fix suggestion:</strong> ${node.failureSummary.replace(/^Fix/, '')}</p>
                      `).join('<hr>')}
                      ${violation.nodes.length > 5 ? `<p>... and ${violation.nodes.length - 5} more nodes</p>` : ''}
                    </div>
                  </details>
                `).join('')}
              ` : '<p>No violations found on this page.</p>'}
            </div>
          </details>
        `).join('')}
      </div>
    ` : ''}
    
    ${fixResults ? `
      <div id="tab-fixes" class="tab-content">
        <h2>Applied Fixes</h2>
        
        <p>${Object.keys(fixResults.fixes).length} components were automatically fixed.</p>
        
        ${Object.entries(fixResults.fixes).map(([componentName, fix]) => `
          <details>
            <summary>
              ${componentName} 
              <span class="badge badge-success">${fix.fixedIssues.length} fixes</span>
            </summary>
            <div class="card-body">
              <p><strong>File:</strong> ${fix.path}</p>
              <p><strong>Backup:</strong> ${fix.backupPath}</p>
              
              <h4>Applied Fixes</h4>
              <table class="issues-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Message</th>
                    <th>Fix</th>
                  </tr>
                </thead>
                <tbody>
                  ${fix.fixedIssues.map(issue => `
                    <tr>
                      <td>${issue.type}</td>
                      <td>${issue.message}</td>
                      <td><div class="code">${issue.fix.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </details>
        `).join('') || '<p>No fixes were applied.</p>'}
      </div>
    ` : ''}
  </div>
</body>
</html>
  `;
  
  // Write the report
  fs.writeFileSync(reportPath, htmlContent);
  
  return reportPath;
}

/**
 * Main function
 */
async function main() {
  // Show help if requested
  if (flags.help) {
    showHelp();
  }
  
  console.log('=== Accessibility Audit Runner ===\n');
  
  // Results containers
  let staticResults = null;
  let dynamicResults = null;
  let fixResults = null;
  
  // Run static analysis if not dynamic-only
  if (!flags.dynamicOnly) {
    console.log('Running static code analysis...');
    
    const basePath = targetPath || config.componentBasePath;
    const componentFiles = getComponentFiles(basePath, config.ignorePaths);
    
    console.log(`Found ${componentFiles.length} component files to analyze.`);
    staticResults = runStaticAnalysis(componentFiles);
    
    console.log(`Static analysis complete. Found ${staticResults.summary.totalIssues} issues in ${staticResults.summary.componentsWithIssues} components.`);
    
    // Fix issues if requested
    if (flags.fix) {
      console.log('\nApplying automatic fixes...');
      fixResults = fixAccessibilityIssues(staticResults);
      console.log(`Applied ${fixResults.summary.totalFixes} fixes to ${Object.keys(fixResults.fixes).length} components.`);
    }
  }
  
  // Run dynamic analysis if not static-only
  if (!flags.staticOnly) {
    console.log('\nRunning dynamic accessibility analysis...');
    
    // Use predefined routes or extract from app
    const urlsToTest = config.scanRoutes.map(route => {
      return route.startsWith('http') ? route : `${config.testUrl}${route}`;
    });
    
    dynamicResults = await runDynamicAnalysis(urlsToTest);
    
    console.log(`Dynamic analysis complete. Found ${dynamicResults.summary.totalViolations} violations across ${dynamicResults.summary.totalPages} pages.`);
  }
  
  // Generate report
  console.log('\nGenerating accessibility audit report...');
  const reportPath = generateReport(staticResults, dynamicResults, fixResults);
  
  console.log(`\nAudit complete! Report saved to: ${reportPath}`);
  
  // Show summary
  console.log('\n=== Audit Summary ===');
  
  if (staticResults) {
    console.log(`\nStatic Analysis:`);
    console.log(`- ${staticResults.summary.totalComponents} components analyzed`);
    console.log(`- ${staticResults.summary.componentsWithIssues} components with issues`);
    console.log(`- ${staticResults.summary.totalIssues} total issues found`);
    
    // Show top issues
    const topIssues = Object.entries(staticResults.summary.issuesByType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (topIssues.length > 0) {
      console.log('\nTop issues:');
      topIssues.forEach(([type, count]) => {
        console.log(`- ${type}: ${count}`);
      });
    }
  }
  
  if (dynamicResults) {
    console.log(`\nDynamic Analysis:`);
    console.log(`- ${dynamicResults.summary.totalPages} pages analyzed`);
    console.log(`- ${dynamicResults.summary.totalViolations} total violations found`);
    
    // Show issues by impact
    const impactCounts = dynamicResults.summary.violationsByImpact;
    console.log('\nViolations by impact:');
    ['critical', 'serious', 'moderate', 'minor'].forEach(impact => {
      if (impactCounts[impact]) {
        console.log(`- ${impact}: ${impactCounts[impact]}`);
      }
    });
  }
  
  if (fixResults) {
    console.log(`\nFixes Applied:`);
    console.log(`- ${fixResults.summary.totalFixes} issues fixed automatically`);
  }
}

// Run the main function
main().catch(console.error);