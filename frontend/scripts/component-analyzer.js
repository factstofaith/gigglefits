#!/usr/bin/env node

/**
 * component-analyzer.js
 * 
 * COMPREHENSIVE COMPONENT ANALYSIS TOOL
 * 
 * This script performs deep analysis of React components to identify patterns,
 * issues, and potential improvements. It focuses on:
 * 
 * 1. COMPONENT ARCHITECTURE: Structure, patterns, and organization
 * 2. HOOK USAGE ANALYSIS: Proper hook implementation and patterns
 * 3. DEPENDENCY MAPPING: Dependencies between components and services
 * 4. RENDER OPTIMIZATION: Performance bottlenecks and improvement opportunities
 * 5. DESIGN SYSTEM COMPLIANCE: Alignment with design system patterns
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const glob = require('glob');

// CONFIGURATION
const TIMESTAMP = new Date().toISOString().replace(/:/g, '-');
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const reportDir = path.join(rootDir, 'component-analysis');
const summaryFile = path.join(reportDir, `component-analysis-${TIMESTAMP}.md`);
const detailedReportFile = path.join(reportDir, `detailed-analysis-${TIMESTAMP}.json`);

// Component analysis storage
const components = [];
const hookUsage = {};
const designSystemUsage = {};
const componentDependencies = {};
const renderPatterns = {};
const issues = [];

// Create report directory if it doesn't exist
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

// CLI OPTIONS
const options = {
  directory: process.argv.find(arg => arg.startsWith('--directory='))?.split('=')[1] || 'src',
  pattern: process.argv.find(arg => arg.startsWith('--pattern='))?.split('=')[1] || '**/*.{jsx,js}',
  detailed: process.argv.includes('--detailed'),
  designSystem: process.argv.includes('--design-system'),
  hooks: process.argv.includes('--hooks'),
  dependencies: process.argv.includes('--dependencies'),
  performance: process.argv.includes('--performance')
};

// Define patterns to search for
const patterns = {
  hookRules: {
    conditionalHooks: /if\s*\([^)]*\)\s*\{\s*use[A-Z]/,
    loopHooks: /for\s*\([^)]*\)\s*\{\s*use[A-Z]/,
    nestedHooks: /function\s+\w+\([^)]*\)\s*\{\s*use[A-Z]/
  },
  designSystem: {
    directMuiImports: /from\s+['"]@mui\/material/,
    designSystemImports: /from\s+['"](\.\.\/)*design-system/,
    adaptedComponents: /from\s+['"](\.\.\/)*design-system\/adapted/
  },
  performance: {
    memoization: /(React\.memo|useMemo|useCallback)/,
    inlineObjectCreation: /\{\s*[a-zA-Z0-9_]+\s*:\s*[^{}]+\s*\}/,
    longRenderFunctions: /render\s*\([^)]*\)\s*\{[\s\S]{500,}\}/
  }
};

/**
 * Parse and analyze a component file
 */
function analyzeComponent(filePath) {
  const relativePath = path.relative(rootDir, filePath);
  console.log(`Analyzing component: ${relativePath}`);
  
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    const component = {
      path: relativePath,
      name: path.basename(filePath, path.extname(filePath)),
      hooks: [],
      imports: [],
      designSystem: {
        directMuiImports: false,
        designSystemImports: false,
        adaptedComponents: false
      },
      performance: {
        usesMemo: false,
        usesCallback: false,
        inlineObjectsCount: 0,
        renderComplexity: 0
      },
      issues: []
    };
    
    // Check for hook rule violations
    Object.entries(patterns.hookRules).forEach(([key, pattern]) => {
      if (pattern.test(code)) {
        component.issues.push({
          type: 'hook-violation',
          subtype: key,
          severity: 'high',
          message: `Potential hook rule violation: ${key}`
        });
      }
    });
    
    // Check for design system usage
    Object.entries(patterns.designSystem).forEach(([key, pattern]) => {
      component.designSystem[key] = pattern.test(code);
      
      // Flag direct MUI imports as an issue
      if (key === 'directMuiImports' && pattern.test(code)) {
        component.issues.push({
          type: 'design-system',
          subtype: 'direct-mui-import',
          severity: 'medium',
          message: 'Direct MUI import detected (should use design system)'
        });
      }
    });
    
    // Check for performance patterns
    if (patterns.performance.memoization.test(code)) {
      component.performance.usesMemo = true;
    }
    
    // Count inline object creations
    const inlineObjects = code.match(patterns.performance.inlineObjectCreation) || [];
    component.performance.inlineObjectsCount = inlineObjects.length;
    
    // Estimate render complexity
    if (patterns.performance.longRenderFunctions.test(code)) {
      component.performance.renderComplexity = 'high';
      
      component.issues.push({
        type: 'performance',
        subtype: 'complex-render',
        severity: 'medium',
        message: 'Complex render function detected (over 500 characters)'
      });
    } else {
      component.performance.renderComplexity = 'low';
    }
    
    // AST parsing for more detailed analysis
    try {
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
      });
      
      // Extract hooks usage
      traverse(ast, {
        CallExpression(path) {
          const callee = path.node.callee;
          if (callee.type === 'Identifier' && callee.name.startsWith('use')) {
            component.hooks.push(callee.name);
            
            // Record hook usage for statistics
            if (!hookUsage[callee.name]) {
              hookUsage[callee.name] = 0;
            }
            hookUsage[callee.name]++;
          }
        },
        ImportDeclaration(path) {
          const importPath = path.node.source.value;
          const importSpecifiers = path.node.specifiers.map(specifier => {
            return specifier.local ? specifier.local.name : 'default';
          });
          
          component.imports.push({
            path: importPath,
            specifiers: importSpecifiers
          });
          
          // Track component dependencies
          if (importPath.includes('/components/')) {
            importSpecifiers.forEach(specifier => {
              if (!componentDependencies[component.name]) {
                componentDependencies[component.name] = new Set();
              }
              componentDependencies[component.name].add(specifier);
            });
          }
        }
      });
    } catch (parseErr) {
      console.error(`  Parser error in ${relativePath}: ${parseErr.message}`);
      component.issues.push({
        type: 'parse-error',
        severity: 'high',
        message: `Parser error: ${parseErr.message}`
      });
    }
    
    components.push(component);
  } catch (err) {
    console.error(`Error analyzing ${relativePath}: ${err.message}`);
    issues.push({
      file: relativePath,
      type: 'file-error',
      severity: 'high',
      message: err.message
    });
  }
}

/**
 * Find components that need fixes based on analysis
 */
function identifyIssues() {
  console.log('Identifying issues across components...');
  
  // Group components by issue type
  const componentsWithIssues = components.filter(c => c.issues.length > 0);
  const issuesByType = {};
  
  componentsWithIssues.forEach(component => {
    component.issues.forEach(issue => {
      if (!issuesByType[issue.type]) {
        issuesByType[issue.type] = [];
      }
      
      issuesByType[issue.type].push({
        component: component.name,
        path: component.path,
        issue
      });
    });
  });
  
  // Identify interdependent components with issues
  const dependencyIssues = [];
  Object.entries(componentDependencies).forEach(([component, dependencies]) => {
    const componentObj = components.find(c => c.name === component);
    if (componentObj && componentObj.issues.length > 0) {
      dependencies.forEach(dependency => {
        const dependencyObj = components.find(c => c.name === dependency);
        if (dependencyObj && dependencyObj.issues.length > 0) {
          dependencyIssues.push({
            component,
            dependency,
            componentIssues: componentObj.issues,
            dependencyIssues: dependencyObj.issues
          });
        }
      });
    }
  });
  
  return {
    issuesByType,
    dependencyIssues
  };
}

/**
 * Generate statistics about component patterns
 */
function generateStatistics() {
  // Hook usage stats
  const hookStats = Object.entries(hookUsage).map(([hook, count]) => ({ hook, count }));
  hookStats.sort((a, b) => b.count - a.count);
  
  // Design system usage
  const designSystemStats = {
    directMuiImports: components.filter(c => c.designSystem.directMuiImports).length,
    designSystemImports: components.filter(c => c.designSystem.designSystemImports).length,
    adaptedComponents: components.filter(c => c.designSystem.adaptedComponents).length,
    compliance: components.filter(c => c.designSystem.designSystemImports && !c.designSystem.directMuiImports).length / components.length
  };
  
  // Performance indicators
  const performanceStats = {
    memoizedComponents: components.filter(c => c.performance.usesMemo).length,
    highComplexityComponents: components.filter(c => c.performance.renderComplexity === 'high').length,
    averageInlineObjects: components.reduce((sum, c) => sum + c.performance.inlineObjectsCount, 0) / components.length
  };
  
  // Component dependency stats
  const dependencyStats = {
    mostDependedOn: Object.entries(componentDependencies)
      .sort((a, b) => b[1].size - a[1].size)
      .slice(0, 5)
      .map(([component, dependencies]) => ({ component, dependencyCount: dependencies.size }))
  };
  
  return {
    hookStats,
    designSystemStats,
    performanceStats,
    dependencyStats
  };
}

/**
 * Generate markdown report from analysis results
 */
function generateReport(stats, issues) {
  console.log('Generating component analysis report...');
  
  let report = `# Component Analysis Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `Analyzed ${components.length} components\n\n`;
  
  // Statistical Overview
  report += `## Statistical Overview\n\n`;
  
  // Hook usage chart
  report += `### Hook Usage\n\n`;
  report += `| Hook | Usage Count | % of Components |\n`;
  report += `|------|-------------|----------------|\n`;
  
  stats.hookStats.slice(0, 10).forEach(({ hook, count }) => {
    const percentage = ((count / components.length) * 100).toFixed(1);
    report += `| ${hook} | ${count} | ${percentage}% |\n`;
  });
  
  report += `\n`;
  
  // Design System compliance
  report += `### Design System Compliance\n\n`;
  report += `- Components using design system imports: ${stats.designSystemStats.designSystemImports} (${((stats.designSystemStats.designSystemImports / components.length) * 100).toFixed(1)}%)\n`;
  report += `- Components using adapted components: ${stats.designSystemStats.adaptedComponents} (${((stats.designSystemStats.adaptedComponents / components.length) * 100).toFixed(1)}%)\n`;
  report += `- Components with direct MUI imports: ${stats.designSystemStats.directMuiImports} (${((stats.designSystemStats.directMuiImports / components.length) * 100).toFixed(1)}%)\n`;
  report += `- Overall design system compliance: ${(stats.designSystemStats.compliance * 100).toFixed(1)}%\n\n`;
  
  // Performance metrics
  report += `### Performance Indicators\n\n`;
  report += `- Memoized components: ${stats.performanceStats.memoizedComponents} (${((stats.performanceStats.memoizedComponents / components.length) * 100).toFixed(1)}%)\n`;
  report += `- High complexity render functions: ${stats.performanceStats.highComplexityComponents} (${((stats.performanceStats.highComplexityComponents / components.length) * 100).toFixed(1)}%)\n`;
  report += `- Average inline objects per component: ${stats.performanceStats.averageInlineObjects.toFixed(1)}\n\n`;
  
  // Most depended-upon components
  report += `### Component Dependencies\n\n`;
  report += `**Most Referenced Components:**\n\n`;
  report += `| Component | Dependency Count |\n`;
  report += `|-----------|------------------|\n`;
  
  stats.dependencyStats.mostDependedOn.forEach(({ component, dependencyCount }) => {
    report += `| ${component} | ${dependencyCount} |\n`;
  });
  
  report += `\n`;
  
  // Issues Summary
  report += `## Issues Summary\n\n`;
  
  const issueList = Object.entries(issues.issuesByType);
  report += `${issueList.reduce((sum, [_, issues]) => sum + issues.length, 0)} issues found in ${components.filter(c => c.issues.length > 0).length} components\n\n`;
  
  // Issues by type
  issueList.forEach(([type, typeIssues]) => {
    report += `### ${type.charAt(0).toUpperCase() + type.slice(1)} Issues (${typeIssues.length})\n\n`;
    
    report += `| Component | Issue | Severity |\n`;
    report += `|-----------|-------|----------|\n`;
    
    typeIssues.slice(0, 10).forEach(({ component, issue }) => {
      report += `| ${component} | ${issue.message} | ${issue.severity} |\n`;
    });
    
    if (typeIssues.length > 10) {
      report += `| ... | ... and ${typeIssues.length - 10} more | ... |\n`;
    }
    
    report += `\n`;
  });
  
  // Interdependent components with issues
  if (issues.dependencyIssues.length > 0) {
    report += `### Interdependent Components with Issues\n\n`;
    report += `${issues.dependencyIssues.length} interconnected components have issues, which may require coordinated fixes.\n\n`;
    
    report += `| Component | Dependency | Issues |\n`;
    report += `|-----------|------------|--------|\n`;
    
    issues.dependencyIssues.slice(0, 10).forEach(({ component, dependency }) => {
      report += `| ${component} | ${dependency} | Both have issues |\n`;
    });
    
    report += `\n`;
  }
  
  // Recommendations
  report += `## Recommendations\n\n`;
  
  // Hook fixes
  if (issues.issuesByType['hook-violation']) {
    report += `### Hook Rule Violations\n\n`;
    report += `${issues.issuesByType['hook-violation'].length} components have potential hook rule violations. To fix:\n\n`;
    report += `1. Move all hooks to the top level of the component\n`;
    report += `2. Ensure hooks are not called conditionally\n`;
    report += `3. Do not call hooks inside loops or nested functions\n`;
    report += `4. Consider using the ESLint React Hooks plugin to catch these issues automatically\n\n`;
  }
  
  // Design system recommendations
  if (issues.issuesByType['design-system']) {
    report += `### Design System Compliance\n\n`;
    report += `${issues.issuesByType['design-system'].length} components have design system issues. To fix:\n\n`;
    report += `1. Replace direct MUI imports with design system equivalents\n`;
    report += `2. Use adapted components from the design system\n`;
    report += `3. Update import statements to use design system paths\n`;
    report += `4. Consider creating a script to automatically convert direct imports\n\n`;
  }
  
  // Performance recommendations
  if (issues.issuesByType['performance']) {
    report += `### Performance Improvements\n\n`;
    report += `${issues.issuesByType['performance'].length} components have potential performance issues. To improve:\n\n`;
    report += `1. Memoize expensive calculations with useMemo\n`;
    report += `2. Memoize callback functions with useCallback\n`;
    report += `3. Move object creation outside of render functions\n`;
    report += `4. Break down complex render functions into smaller components\n`;
    report += `5. Consider using React.memo for components that render often but with the same props\n\n`;
  }
  
  // Next Steps
  report += `## Next Steps\n\n`;
  report += `1. **Fix Hook Violations**: Address all hook rule violations as they can cause unpredictable behavior\n`;
  report += `2. **Improve Design System Compliance**: Standardize component usage by migrating to design system components\n`;
  report += `3. **Optimize Performance**: Focus on high-complexity components and add memoization where appropriate\n`;
  report += `4. **Address Interdependent Issues**: Coordinate fixes for components that depend on each other\n`;
  report += `5. **Implement Static Analysis**: Add these checks to CI/CD to prevent regressions\n\n`;
  
  report += `See the detailed JSON report at \`${detailedReportFile}\` for complete component data.\n`;
  
  fs.writeFileSync(summaryFile, report);
  console.log(`✅ Analysis report saved to ${summaryFile}`);
  
  // Generate detailed JSON report
  fs.writeFileSync(detailedReportFile, JSON.stringify({
    meta: {
      timestamp: new Date().toISOString(),
      componentCount: components.length
    },
    components,
    statistics: stats,
    issues: issues
  }, null, 2));
  
  console.log(`✅ Detailed analysis data saved to ${detailedReportFile}`);
}

/**
 * Main function to orchestrate the component analysis
 */
async function main() {
  console.log('🚀 Starting component analysis...');
  
  // Get all component files
  const targetDir = path.join(rootDir, options.directory);
  const files = glob.sync(options.pattern, { cwd: targetDir, absolute: true });
  
  console.log(`Found ${files.length} files to analyze`);
  
  // Skip non-component files
  const componentFiles = files.filter(file => {
    const content = fs.readFileSync(file, 'utf8');
    return content.includes('React') && 
           (content.includes('function') || content.includes('class') || content.includes('=>')) &&
           (content.includes('return') || content.includes('render'));
  });
  
  console.log(`Identified ${componentFiles.length} potential component files`);
  
  // Analyze each component
  for (const file of componentFiles) {
    analyzeComponent(file);
  }
  
  // Identify issues
  const identifiedIssues = identifyIssues();
  
  // Calculate statistics
  const statistics = generateStatistics();
  
  // Generate report
  generateReport(statistics, identifiedIssues);
  
  console.log('\n✅ Component analysis completed successfully');
}

// Run the analysis
main().catch(err => {
  console.error('\n❌ Component analysis script error:', err);
  process.exit(1);
});