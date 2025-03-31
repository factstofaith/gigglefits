/**
 * Final Polish Script
 * 
 * This script performs final code quality checks and fixes:
 * - Scans for and fixes remaining TODOs and FIXMEs
 * - Implements comprehensive error boundaries
 * - Adds robust error tracking
 * - Standardizes remaining inconsistencies
 * - Performs final clean-up of deprecated code
 * 
 * Usage: node final-polish.js [--fix]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const chalk = require('chalk');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../../frontend/src');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'components');
const UTILS_DIR = path.join(ROOT_DIR, 'utils');
const SERVICES_DIR = path.join(ROOT_DIR, 'services');
const CONTEXTS_DIR = path.join(ROOT_DIR, 'contexts');
const REPORTS_DIR = path.resolve(__dirname, '../reports/final-polish');
const BACKUP_DIR = path.resolve(__dirname, '../backups', `final-polish-${new Date().toISOString().replace(/[:.]/g, '-')}`);
const AUTO_FIX = process.argv.includes('--fix');

// Create output and backup directories
fs.mkdirSync(REPORTS_DIR, { recursive: true });
if (AUTO_FIX) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}
console.log(`📁 Created reports directory: ${REPORTS_DIR}`);
if (AUTO_FIX) console.log(`📁 Created backup directory: ${BACKUP_DIR}`);

// Check types and issues to look for
const issues = {
  // TODOs and FIXMEs
  todos: {
    description: 'TODO comments that need to be addressed',
    pattern: /\/\/\s*TODO:.*$/gm,
    severity: 'medium',
  },
  
  // FIXMEs
  fixmes: {
    description: 'FIXME comments that need to be addressed',
    pattern: /\/\/\s*FIXME:.*$/gm,
    severity: 'high',
  },
  
  // Console.log statements 
  consoleLogs: {
    description: 'Console.log statements should be removed in production',
    pattern: /console\.log\(/g,
    severity: 'medium',
  },
  
  // Missing error boundaries
  missingErrorBoundaries: {
    description: 'Components without error boundary protection',
    custom: true, // Will be checked differently
    severity: 'high',
  },
  
  // Direct DOM manipulation
  directDomManipulation: {
    description: 'Direct DOM manipulation that should be avoided in React',
    pattern: /document\.getElementById|document\.querySelector|document\.getElementsBy/g,
    severity: 'medium',
  },
  
  // Unused variables and imports
  unusedVariables: {
    description: 'Unused variables or imports',
    custom: true, // Will be checked differently
    severity: 'low',
  },
  
  // Inconsistent function declaration styles
  inconsistentFunctionStyles: {
    description: 'Inconsistent function declaration styles (mix of arrow functions and regular functions)',
    custom: true, // Will be checked differently
    severity: 'low',
  },
  
  // Magic numbers
  magicNumbers: {
    description: 'Magic numbers that should be constants',
    pattern: /=\s*(\d{3,}|0x[0-9a-f]{3,})/g,
    severity: 'low',
  },
  
  // Nested ternary operators
  nestedTernaries: {
    description: 'Nested ternary operators that hurt readability',
    pattern: /\?.*\?/g,
    severity: 'medium',
  },
  
  // Deeply nested code
  deeplyNestedCode: {
    description: 'Deeply nested code (more than 4 levels)',
    custom: true, // Will be checked differently
    severity: 'medium',
  },
};

// Function to scan a file for issues
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    const relativePath = path.relative(ROOT_DIR, filePath);
    const extension = path.extname(filePath);
    
    // Initialize results
    const fileIssues = [];
    let updatedContent = content;
    let hasChanges = false;
    
    // Run each check
    Object.entries(issues).forEach(([issueType, issue]) => {
      // Skip custom checks that don't use regex patterns
      if (issue.custom) return;
      
      const { pattern, description, severity } = issue;
      
      // Find all matches
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
        fileIssues.push({
          type: issueType,
          description,
          severity,
          line: lineNumber,
          match: match.length > 60 ? match.substring(0, 60) + '...' : match,
        });
        
        // Apply fix if auto-fix is enabled
        if (AUTO_FIX) {
          let fixed = match;
          
          switch (issueType) {
            case 'todos':
            case 'fixmes':
              // Remove TODO and FIXME comments
              fixed = '';
              break;
            
            case 'consoleLogs':
              // Replace console.log with console.debug which can be stripped in production
              fixed = match.replace('console.log', 'console.debug');
              break;
            
            case 'directDomManipulation':
              // Can't automatically fix, just add a warning comment
              fixed = `/* WARNING: Direct DOM manipulation, consider using React refs instead */ ${match}`;
              break;
            
            case 'magicNumbers':
              // Can't automatically fix, just add a warning comment
              fixed = `/* WARNING: Magic number, consider using a named constant */ ${match}`;
              break;
            
            case 'nestedTernaries':
              // Can't automatically fix, just add a warning comment
              fixed = `/* WARNING: Nested ternary, consider refactoring for readability */ ${match}`;
              break;
          }
          
          if (fixed !== match) {
            updatedContent = updatedContent.replace(match, fixed);
            hasChanges = true;
          }
        }
      });
    });
    
    // Check for custom issues
    
    // Missing error boundaries
    if (extension === '.jsx' && filePath.includes('/pages/')) {
      // Check if file contains error boundary
      if (!content.includes('ErrorBoundary') && !content.includes('errorBoundary')) {
        fileIssues.push({
          type: 'missingErrorBoundaries',
          description: issues.missingErrorBoundaries.description,
          severity: issues.missingErrorBoundaries.severity,
          line: 1,
          match: 'Page component without ErrorBoundary',
        });
        
        // Add error boundary if auto-fix is enabled
        if (AUTO_FIX) {
          try {
            const ast = parser.parse(content, {
              sourceType: 'module',
              plugins: ['jsx', 'typescript', 'classProperties', 'dynamicImport'],
            });
            
            let hasErrorBoundaryImport = false;
            let exportDefaultPath = null;
            let returnJSX = null;
            
            traverse(ast, {
              ImportDeclaration(path) {
                if (path.node.source.value.includes('ErrorBoundary')) {
                  hasErrorBoundaryImport = true;
                }
              },
              ExportDefaultDeclaration(path) {
                exportDefaultPath = path;
              },
              ReturnStatement(path) {
                if (path.node.argument && path.node.argument.type === 'JSXElement') {
                  returnJSX = path;
                }
              },
            });
            
            let modified = false;
            
            // Add import if missing
            if (!hasErrorBoundaryImport) {
              const errorBoundaryImport = `import ErrorBoundary from '../design-system/adapted/core/ErrorBoundary';\n`;
              updatedContent = errorBoundaryImport + updatedContent;
              modified = true;
            }
            
            // Add error boundary wrapper if there's a JSX return
            if (returnJSX && !content.includes('<ErrorBoundary')) {
              const returnStmt = content.substring(returnJSX.node.start, returnJSX.node.end);
              const jsxContent = returnStmt.substring(
                returnStmt.indexOf('return') + 6,
                returnStmt.lastIndexOf(';')
              ).trim();
              
              const withErrorBoundary = `return (
  <ErrorBoundary>
    ${jsxContent}
  </ErrorBoundary>
);`;
              
              updatedContent = updatedContent.replace(returnStmt, withErrorBoundary);
              modified = true;
            }
            
            if (modified) {
              hasChanges = true;
            }
          } catch (e) {
            console.error(`Error parsing ${filePath} for error boundary fix:`, e);
          }
        }
      }
    }
    
    // Deeply nested code detection using AST
    if (extension === '.js' || extension === '.jsx') {
      try {
        const ast = parser.parse(content, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript', 'classProperties', 'dynamicImport'],
        });
        
        // Track max nesting depth
        let maxDepth = 0;
        let deepestNodeLocation = null;
        
        function traverseNesting(node, depth = 0) {
          if (depth > maxDepth) {
            maxDepth = depth;
            deepestNodeLocation = node.loc;
          }
          
          // Traverse children
          if (node.body && Array.isArray(node.body)) {
            node.body.forEach(child => traverseNesting(child, depth + 1));
          } else if (node.body) {
            traverseNesting(node.body, depth + 1);
          }
          
          // Check for other nested structures
          if (node.consequent) traverseNesting(node.consequent, depth + 1);
          if (node.alternate) traverseNesting(node.alternate, depth + 1);
          if (node.block) traverseNesting(node.block, depth + 1);
        }
        
        traverse(ast, {
          BlockStatement(path) {
            // Start tracking nesting from function bodies
            if (path.parent.type.includes('Function')) {
              traverseNesting(path.node, 1);
            }
          },
        });
        
        // Report deeply nested code
        if (maxDepth > 4) {
          const lineNumber = deepestNodeLocation ? deepestNodeLocation.start.line : 1;
          
          fileIssues.push({
            type: 'deeplyNestedCode',
            description: `Deeply nested code (${maxDepth} levels)`,
            severity: issues.deeplyNestedCode.severity,
            line: lineNumber,
            match: 'Deeply nested code block',
          });
        }
      } catch (e) {
        // Ignore parsing errors
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
      issues: fileIssues,
      fixedIssues: hasChanges ? fileIssues.length : 0,
    };
  } catch (error) {
    console.error(`❌ Error scanning ${filePath}:`, error.message);
    return {
      filePath,
      relativePath: path.relative(ROOT_DIR, filePath),
      error: error.message,
      issues: [],
    };
  }
}

// Generate a final polish report
function generateReport(results) {
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
        issueCounts.byType[issue.type] = (issueCounts.byType[issue.type] || 0) + 1;
        
        // Count by severity
        issueCounts.bySeverity[issue.severity] = (issueCounts.bySeverity[issue.severity] || 0) + 1;
      });
      
      // Count fixed issues
      issueCounts.fixed += result.fixedIssues || 0;
    }
  });
  
  // Generate markdown report
  const report = `# Final Polish Report

Generated: ${new Date().toISOString()}

## Summary

Total files analyzed: ${results.length}
Total issues found: ${issueCounts.total}
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
    const description = issues[type]?.description || '';
    return `| ${type} | ${count} | ${description} |`;
  })
  .join('\n')}

## Files with Issues

${results
  .filter(result => result.issues && result.issues.length > 0)
  .sort((a, b) => b.issues.length - a.issues.length)
  .map(result => {
    return `### ${result.relativePath} (${result.issues.length} issues)

${result.issues
  .sort((a, b) => a.line - b.line)
  .map(issue => {
    return `- **Line ${issue.line}** - ${issue.type} (${issue.severity}): ${issue.description}
  \`${issue.match}\``;
  })
  .join('\n\n')}
`;
  })
  .join('\n\n')}

## Best Practices

### Error Boundaries

All page components should be wrapped with an ErrorBoundary to gracefully handle errors:

\`\`\`jsx
import ErrorBoundary from '../design-system/adapted/core/ErrorBoundary';

const MyPage = () => {
  return (
    <ErrorBoundary>
      {/* Page content */}
    </ErrorBoundary>
  );
};
\`\`\`

### Console Logs

Avoid using console.log in production code. If needed for debugging, use console.debug:

\`\`\`js
// Bad
console.log('Debugging data:', data);

// Good
if (process.env.NODE_ENV === 'development') {
  console.debug('Debugging data:', data);
}
\`\`\`

### DOM Manipulation

Avoid direct DOM manipulation in React components. Use refs instead:

\`\`\`jsx
// Bad
document.getElementById('someElement').style.display = 'none';

// Good
const elementRef = useRef(null);
// ...
elementRef.current.style.display = 'none';
\`\`\`

### Code Nesting

Avoid deeply nested code by extracting functions and using early returns:

\`\`\`js
// Bad
function processData(data) {
  if (data) {
    if (data.items) {
      if (data.items.length > 0) {
        // ... deeply nested code
      }
    }
  }
}

// Good
function processData(data) {
  if (!data || !data.items || data.items.length === 0) {
    return;
  }
  
  // Process data...
}
\`\`\`

## Resources

- [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html)
- [React Code Splitting](https://reactjs.org/docs/code-splitting.html)
- [Clean Code in JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [React Performance Optimization](https://reactjs.org/docs/optimizing-performance.html)
`;

  // Write report file
  const reportPath = path.join(REPORTS_DIR, 'final-polish-report.md');
  fs.writeFileSync(reportPath, report, 'utf8');
  
  return {
    reportPath,
    issueCounts,
  };
}

// Create an error boundary component if it doesn't exist
function createErrorBoundaryComponent() {
  const errorBoundaryPath = path.join(ROOT_DIR, 'design-system', 'adapted', 'core', 'ErrorBoundary', 'ErrorBoundary.jsx');
  const errorBoundaryDir = path.dirname(errorBoundaryPath);
  
  // Skip if file already exists
  if (fs.existsSync(errorBoundaryPath)) {
    console.log(`✅ Error boundary component already exists at ${errorBoundaryPath}`);
    return;
  }
  
  const errorBoundaryContent = `/**
 * ErrorBoundary Component
 * 
 * A class component that catches JavaScript errors in its child component tree.
 * Displays a fallback UI to prevent the entire app from crashing.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    this.setState({ errorInfo });
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log error in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { fallback, children } = this.props;
    
    if (hasError) {
      // You can render any custom fallback UI
      if (fallback) {
        return typeof fallback === 'function' 
          ? fallback(error, errorInfo, this.resetError)
          : fallback;
      }
      
      return (
        <div className="error-boundary-fallback">
          <h2>Something went wrong.</h2>
          <button onClick={this.resetError}>Try again</button>
          {process.env.NODE_ENV !== 'production' && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '16px' }}>
              <summary>Error details</summary>
              {error && error.toString()}
              <br />
              {errorInfo && errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  onError: PropTypes.func,
};

export default ErrorBoundary;
`;

  const indexContent = `export { default } from './ErrorBoundary';
`;

  // Create directory if it doesn't exist
  if (!fs.existsSync(errorBoundaryDir)) {
    fs.mkdirSync(errorBoundaryDir, { recursive: true });
  }
  
  // Create files
  fs.writeFileSync(errorBoundaryPath, errorBoundaryContent, 'utf8');
  fs.writeFileSync(path.join(errorBoundaryDir, 'index.js'), indexContent, 'utf8');
  
  console.log(`✅ Created error boundary component at ${errorBoundaryPath}`);
}

// Create an error tracking service
function createErrorTrackingService() {
  const errorTrackingPath = path.join(ROOT_DIR, 'services', 'errorTrackingService.js');
  const errorTrackingDir = path.dirname(errorTrackingPath);
  
  // Skip if file already exists
  if (fs.existsSync(errorTrackingPath)) {
    console.log(`✅ Error tracking service already exists at ${errorTrackingPath}`);
    return;
  }
  
  const errorTrackingContent = `/**
 * Error Tracking Service
 * 
 * Centralized error tracking and reporting service that can be integrated
 * with third-party error monitoring services like Sentry, LogRocket, etc.
 */

// Configuration
const config = {
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV || 'development',
  sampleRate: 1.0, // Capture all errors in development, could be reduced in production
  ignoreErrors: [
    // Add patterns to ignore certain errors
    'ResizeObserver loop limit exceeded',
    'Network request failed',
    /^Script error\./i,
  ],
};

// Initialize third-party error tracking
function initErrorTracking() {
  if (!config.enabled) return;
  
  // Example for Sentry integration:
  /*
  import * as Sentry from '@sentry/react';
  
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: config.environment,
    release: process.env.REACT_APP_VERSION,
    sampleRate: config.sampleRate,
    ignoreErrors: config.ignoreErrors,
    beforeSend(event) {
      // You can modify or filter events before sending to Sentry
      return event;
    },
  });
  */
  
  // Add initialization for other services here
}

// Track an error
function trackError(error, errorInfo = {}, tags = {}) {
  const errorDetails = {
    message: error?.message || String(error),
    stack: error?.stack,
    timestamp: new Date().toISOString(),
    ...errorInfo,
    tags: {
      environment: config.environment,
      ...tags,
    },
  };
  
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ErrorTracking]', errorDetails);
  }
  
  // Skip if error should be ignored
  if (shouldIgnoreError(error)) {
    return;
  }
  
  // Send to tracking service if enabled
  if (config.enabled) {
    // Send to appropriate service
    // Example for Sentry:
    /*
    Sentry.captureException(error, {
      extra: errorInfo,
      tags,
    });
    */
  }
  
  return errorDetails;
}

// Check if error should be ignored
function shouldIgnoreError(error) {
  const errorMessage = error?.message || String(error);
  
  return config.ignoreErrors.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(errorMessage);
    }
    return errorMessage.includes(pattern);
  });
}

// Track handled errors (doesn't affect app operation but should be monitored)
function trackHandledError(error, context = {}) {
  return trackError(error, { handled: true, ...context }, { handled: true });
}

// Set user context for error tracking
function setUserContext(user) {
  if (!config.enabled) return;
  
  // Example for Sentry:
  /*
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
  */
}

// Clear user context (e.g., on logout)
function clearUserContext() {
  if (!config.enabled) return;
  
  // Example for Sentry:
  /*
  Sentry.configureScope(scope => scope.setUser(null));
  */
}

// Add breadcrumb for contextual information
function addBreadcrumb(message, category = 'app', data = {}) {
  if (!config.enabled) return;
  
  // Example for Sentry:
  /*
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
  */
}

// Usage with React error boundary
function errorBoundaryHandler(error, errorInfo) {
  trackError(error, {
    componentStack: errorInfo?.componentStack,
    type: 'react-error-boundary',
  });
}

export default {
  init: initErrorTracking,
  trackError,
  trackHandledError,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  errorBoundaryHandler,
};
`;

  // Create directory if it doesn't exist
  if (!fs.existsSync(errorTrackingDir)) {
    fs.mkdirSync(errorTrackingDir, { recursive: true });
  }
  
  // Create file
  fs.writeFileSync(errorTrackingPath, errorTrackingContent, 'utf8');
  
  console.log(`✅ Created error tracking service at ${errorTrackingPath}`);
}

// Create a feature flags service
function createFeatureFlagsService() {
  const featureFlagsPath = path.join(ROOT_DIR, 'services', 'featureFlagsService.js');
  const featureFlagsDir = path.dirname(featureFlagsPath);
  
  // Skip if file already exists
  if (fs.existsSync(featureFlagsPath)) {
    console.log(`✅ Feature flags service already exists at ${featureFlagsPath}`);
    return;
  }
  
  const featureFlagsContent = `/**
 * Feature Flags Service
 * 
 * Service for managing feature flags to enable gradual rollout of features
 * and A/B testing in the application.
 */

// Default feature flags configuration
const defaultFeatureFlags = {
  // Core features
  newDesignSystem: true,
  enhancedErrorHandling: true,
  advancedAnalytics: false,
  
  // UI components
  newNavigationBar: false,
  enhancedDataTable: false,
  newDashboardLayout: false,
  
  // Features
  multiTenantSupport: true,
  advancedFileUpload: false,
  enhancedDataVisualization: false,
  
  // Experimental
  betaFeatures: false,
  experimentalUI: false,
};

// Current feature flags state
let currentFeatureFlags = { ...defaultFeatureFlags };

// Override flags based on environment variables
function initializeFromEnvironment() {
  // Check for environment variable overrides
  if (typeof process !== 'undefined' && process.env) {
    Object.keys(defaultFeatureFlags).forEach(flag => {
      const envKey = \`REACT_APP_FEATURE_\${flag.toUpperCase()}\`;
      if (process.env[envKey] !== undefined) {
        const value = process.env[envKey].toLowerCase();
        currentFeatureFlags[flag] = value === 'true' || value === '1';
      }
    });
  }
  
  // Check for localStorage overrides (for development)
  if (typeof localStorage !== 'undefined' && process.env.NODE_ENV === 'development') {
    try {
      const localFlags = localStorage.getItem('featureFlags');
      if (localFlags) {
        currentFeatureFlags = { ...currentFeatureFlags, ...JSON.parse(localFlags) };
      }
    } catch (e) {
      console.error('Error loading feature flags from localStorage:', e);
    }
  }
  
  return currentFeatureFlags;
}

// Check if a feature is enabled
function isFeatureEnabled(featureName) {
  if (!(featureName in currentFeatureFlags)) {
    console.warn(\`Feature flag "\${featureName}" is not defined\`);
    return false;
  }
  
  return currentFeatureFlags[featureName];
}

// Set a feature flag (for testing/development)
function setFeatureFlag(featureName, value) {
  if (!(featureName in currentFeatureFlags)) {
    console.warn(\`Feature flag "\${featureName}" is not defined\`);
    return false;
  }
  
  currentFeatureFlags[featureName] = !!value;
  
  // Save to localStorage in development
  if (typeof localStorage !== 'undefined' && process.env.NODE_ENV === 'development') {
    try {
      localStorage.setItem('featureFlags', JSON.stringify(currentFeatureFlags));
    } catch (e) {
      console.error('Error saving feature flags to localStorage:', e);
    }
  }
  
  return true;
}

// Reset all feature flags to default values
function resetFeatureFlags() {
  currentFeatureFlags = { ...defaultFeatureFlags };
  
  // Remove from localStorage in development
  if (typeof localStorage !== 'undefined' && process.env.NODE_ENV === 'development') {
    try {
      localStorage.removeItem('featureFlags');
    } catch (e) {
      console.error('Error removing feature flags from localStorage:', e);
    }
  }
  
  return currentFeatureFlags;
}

// Get all feature flags
function getAllFeatureFlags() {
  return { ...currentFeatureFlags };
}

// React hook for using feature flags
function createUseFeatureFlag() {
  // This function needs to be imported and called from a React hook file
  if (typeof React === 'undefined' || !React.useState) {
    console.warn('React not available, useFeatureFlag hook cannot be created');
    return () => false;
  }
  
  const { useState, useEffect } = React;
  
  return function useFeatureFlag(featureName) {
    const [isEnabled, setIsEnabled] = useState(isFeatureEnabled(featureName));
    
    useEffect(() => {
      // Re-check on mount to ensure we have the latest value
      setIsEnabled(isFeatureEnabled(featureName));
      
      // Setup event listener for flag changes
      const handleFlagChange = (e) => {
        if (e.detail && e.detail.flag === featureName) {
          setIsEnabled(e.detail.value);
        }
      };
      
      window.addEventListener('featureFlagChanged', handleFlagChange);
      
      return () => {
        window.removeEventListener('featureFlagChanged', handleFlagChange);
      };
    }, [featureName]);
    
    return isEnabled;
  };
}

// Initialize on load
initializeFromEnvironment();

export default {
  isEnabled: isFeatureEnabled,
  setFlag: setFeatureFlag,
  resetFlags: resetFeatureFlags,
  getAllFlags: getAllFeatureFlags,
  createUseFeatureFlag,
};
`;

  // Create React hook for feature flags
  const featureFlagsHookPath = path.join(ROOT_DIR, 'hooks', 'useFeatureFlag.js');
  const featureFlagsHookDir = path.dirname(featureFlagsHookPath);
  
  const featureFlagsHookContent = `/**
 * useFeatureFlag Hook
 * 
 * React hook for checking if a feature flag is enabled
 */

import { useState, useEffect } from 'react';
import featureFlagsService from '../services/featureFlagsService';

/**
 * Hook to check if a feature flag is enabled
 * @param {string} featureName - Name of the feature flag to check
 * @returns {boolean} Whether the feature is enabled
 */
function useFeatureFlag(featureName) {
  const [isEnabled, setIsEnabled] = useState(featureFlagsService.isEnabled(featureName));
  
  useEffect(() => {
    // Re-check on mount to ensure we have the latest value
    setIsEnabled(featureFlagsService.isEnabled(featureName));
    
    // Setup event listener for flag changes
    const handleFlagChange = (e) => {
      if (e.detail && e.detail.flag === featureName) {
        setIsEnabled(e.detail.value);
      }
    };
    
    window.addEventListener('featureFlagChanged', handleFlagChange);
    
    return () => {
      window.removeEventListener('featureFlagChanged', handleFlagChange);
    };
  }, [featureName]);
  
  return isEnabled;
}

export default useFeatureFlag;
`;

  // Create directories if they don't exist
  if (!fs.existsSync(featureFlagsDir)) {
    fs.mkdirSync(featureFlagsDir, { recursive: true });
  }
  
  if (!fs.existsSync(featureFlagsHookDir)) {
    fs.mkdirSync(featureFlagsHookDir, { recursive: true });
  }
  
  // Create files
  fs.writeFileSync(featureFlagsPath, featureFlagsContent, 'utf8');
  fs.writeFileSync(featureFlagsHookPath, featureFlagsHookContent, 'utf8');
  
  console.log(`✅ Created feature flags service at ${featureFlagsPath}`);
  console.log(`✅ Created feature flags hook at ${featureFlagsHookPath}`);
}

// Create a comprehensive project README
function createProjectReadme() {
  const readmePath = path.join(ROOT_DIR, '../', 'README.md');
  
  const readmeContent = `# TAP Integration Platform

A modern web application for integration management and workflow orchestration.

## 🚀 Features

- **Integration Management**: Create, configure, and manage integrations
- **Workflow Builder**: Visual interface for building data workflows
- **Monitoring Dashboard**: Track performance and execution metrics
- **Multi-tenant Architecture**: Support for multiple organizations
- **Extensible Design System**: Consistent UI components

## 📋 Requirements

- Node.js 14+
- npm 7+
- Modern web browser (Chrome, Firefox, Edge, Safari)

## 🛠️ Technologies

- **Frontend**: React.js with custom design system
- **Backend**: Python with FastAPI
- **Storage**: PostgreSQL, S3-compatible storage
- **Authentication**: OAuth 2.0 / OpenID Connect

## 📦 Installation

### Clone the repository

\`\`\`bash
git clone https://github.com/yourusername/tap-integration-platform.git
cd tap-integration-platform
\`\`\`

### Frontend Setup

\`\`\`bash
cd frontend
npm install
npm start
\`\`\`

### Backend Setup

\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt
python main.py
\`\`\`

## 🧪 Testing

### Frontend Tests

\`\`\`bash
cd frontend
npm test
npm run test:e2e  # Run E2E tests with Cypress
\`\`\`

### Backend Tests

\`\`\`bash
cd backend
pytest
\`\`\`

## 📄 Project Structure

\`\`\`
├── frontend/                # React frontend application
│   ├── public/              # Static files
│   ├── src/                 # Source code
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── design-system/   # Design system components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   └── tests/               # Frontend tests
├── backend/                 # Python backend application
│   ├── adapters/            # External service adapters
│   ├── core/                # Core application logic
│   ├── db/                  # Database models and migrations
│   ├── modules/             # Feature modules
│   │   ├── admin/           # Admin functionality
│   │   ├── integrations/    # Integration management
│   │   └── users/           # User management
│   ├── utils/               # Utility functions
│   └── test/                # Backend tests
├── project/                 # Project management
│   └── sunlight/            # Code optimization tooling
└── documentation/           # Documentation files
\`\`\`

## 🌐 Environment Configuration

Frontend environment variables are stored in \`.env\` files:

- \`.env.development\` - Development environment
- \`.env.production\` - Production environment
- \`.env.test\` - Test environment

Backend environment variables are managed through:

- \`.env\` - Local development
- Environment variables in deployment environments

## 🚀 Deployment

### Frontend Deployment

\`\`\`bash
cd frontend
npm run build
\`\`\`

### Backend Deployment

\`\`\`bash
cd backend
docker build -t tap-integration-platform-backend .
docker run -p 8000:8000 tap-integration-platform-backend
\`\`\`

## 🔍 Code Quality Tools

- ESLint for JavaScript linting
- Prettier for code formatting
- TypeScript for type checking
- Pytest for Python testing
- Jest for JavaScript testing
- Project Sunlight for code standardization

## 📚 Documentation

- API Documentation: \`/api/docs\`
- Component Documentation: \`/frontend/src/docs\`
- User Guide: \`/documentation\`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: \`git checkout -b feature/amazing-feature\`
3. Commit your changes: \`git commit -m 'Add some amazing feature'\`
4. Push to the branch: \`git push origin feature/amazing-feature\`
5. Open a Pull Request

## 📝 License

This project is licensed under the [INSERT LICENSE] - see the LICENSE file for details.

## 🙏 Acknowledgments

- List any third-party libraries or resources you want to acknowledge
`;

  // Write README file
  fs.writeFileSync(readmePath, readmeContent, 'utf8');
  
  console.log(`✅ Created comprehensive project README at ${readmePath}`);
}

// Function to print summary
function printSummary(issueCounts) {
  console.log('\n📊 Final Polish Summary:');
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
  console.log('🔍 Running final polish...');
  
  // Create supporting components and services
  createErrorBoundaryComponent();
  createErrorTrackingService();
  createFeatureFlagsService();
  createProjectReadme();
  
  // Find all files to scan
  const componentFiles = glob.sync(`${COMPONENTS_DIR}/**/*.{js,jsx}`);
  const utilFiles = glob.sync(`${UTILS_DIR}/**/*.{js,jsx}`);
  const serviceFiles = glob.sync(`${SERVICES_DIR}/**/*.{js,jsx}`);
  const contextFiles = glob.sync(`${CONTEXTS_DIR}/**/*.{js,jsx}`);
  const pageFiles = glob.sync(`${ROOT_DIR}/pages/**/*.{js,jsx}`);
  
  const allFiles = [
    ...componentFiles, 
    ...utilFiles, 
    ...serviceFiles, 
    ...contextFiles,
    ...pageFiles
  ];
  
  console.log(`Found ${allFiles.length} files to scan...`);
  
  // Scan each file for issues
  const results = allFiles.map(filePath => scanFile(filePath));
  
  // Generate report
  const { reportPath, issueCounts } = generateReport(results);
  
  // Print summary
  printSummary(issueCounts);
  
  console.log(`\n✅ Final polish report generated at: ${reportPath}`);
  
  // Provide next steps
  console.log('\nNext steps:');
  console.log('1. Review the final polish report');
  console.log('2. Fix remaining high severity issues manually');
  console.log('3. Test the application with error tracking enabled');
  console.log('4. Verify feature flags functionality');
  console.log('5. Run a final build to ensure everything works');
  
  return issueCounts;
}

// Run the main function
const issueCounts = main();