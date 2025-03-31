#!/usr/bin/env node
/**
 * React Compatibility Analyzer
 * 
 * This script analyzes the codebase to identify components and libraries
 * that may have React version dependencies or compatibility issues.
 * 
 * Usage:
 *   node analyze-react-dependencies.js [options]
 * 
 * Options:
 *   --dry-run       Show what would be analyzed without creating reports
 *   --verbose       Show detailed information during analysis
 *   --output=<dir>  Specify output directory for reports (default: analysis_output)
 * 
 * Output:
 *   - react-compat-analysis.json: Full analysis results in JSON format
 *   - react-compat-summary.md: Summary of findings in Markdown format
 *   - react-compat-issues.md: Detailed list of identified compatibility issues
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Configuration
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const VERBOSE = args.includes('--verbose');
const OUTPUT_DIR = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || 'analysis_output/react-compat';

// Utility functions
function log(message, type = 'info') {
  const prefix = type === 'error' ? '❌ ' : 
                 type === 'success' ? '✅ ' : 
                 type === 'warning' ? '⚠️ ' : 
                 type === 'info' ? 'ℹ️ ' : '';
  console.log(`${prefix}${message}`);
}

function logVerbose(message) {
  if (VERBOSE) {
    console.log(`   ${message}`);
  }
}

// Create output directory
if (!DRY_RUN) {
  try {
    fs.mkdirSync(path.resolve(process.cwd(), OUTPUT_DIR), { recursive: true });
  } catch (error) {
    log(`Error creating output directory: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Known problematic patterns for React 18 compatibility
const KNOWN_PATTERNS = [
  {
    name: 'findDOMNode usage',
    pattern: /ReactDOM\.findDOMNode\(/g,
    description: 'ReactDOM.findDOMNode is deprecated in React 18',
    impact: 'High',
    recommendation: 'Use refs instead of findDOMNode'
  },
  {
    name: 'Legacy Context API',
    pattern: /(static\s+contextTypes|static\s+childContextTypes|getChildContext\s*\(\s*\))/g,
    description: 'Legacy Context API is not recommended in React 18',
    impact: 'Medium',
    recommendation: 'Use React.createContext instead'
  },
  {
    name: 'Legacy Lifecycle Methods',
    pattern: /(componentWillMount|componentWillReceiveProps|componentWillUpdate)/g,
    description: 'Legacy lifecycle methods are deprecated in React 18',
    impact: 'Medium',
    recommendation: 'Use new lifecycle methods like componentDidMount, getDerivedStateFromProps, etc.'
  },
  {
    name: 'String Refs',
    pattern: /ref=["']\w+["']/g,
    description: 'String refs are deprecated in React 18',
    impact: 'Medium',
    recommendation: 'Use createRef or useRef instead'
  },
  {
    name: 'React JsonView Import',
    pattern: /import\s+(?:{\s*(?:ReactJson|ReactJsonView)\s*}|\w+)\s+from\s+['"]react-json-view['"]/g,
    description: 'react-json-view has React 17 dependencies',
    impact: 'High',
    recommendation: 'Use an adapter HOC pattern to isolate this component'
  },
  {
    name: 'ReactFlow Import',
    pattern: /import\s+(?:{\s*(?:ReactFlow|ReactFlowProvider|Controls|Background|MiniMap)\s*}|\w+)\s+from\s+['"]react-flow-renderer['"]/g,
    description: 'react-flow-renderer may have React version dependencies',
    impact: 'High',
    recommendation: 'Use an adapter HOC pattern to isolate this component'
  },
  {
    name: 'Auto Batching Issues',
    pattern: /this\.setState\(\{\s*.*\s*\}\).*this\.setState\(\{\s*.*\s*\}\)/g,
    description: 'Multiple setState calls will be batched automatically in React 18',
    impact: 'Medium',
    recommendation: 'Combine setState calls if they depend on being separate in React 17'
  },
  {
    name: 'Concurrent Mode Issues',
    pattern: /ReactDOM\.render\(/g,
    description: 'ReactDOM.render is deprecated in React 18, replaced by createRoot',
    impact: 'High',
    recommendation: 'Use ReactDOM.createRoot().render() instead'
  }
];

// Problematic libraries with known React compatibility issues
const PROBLEMATIC_LIBRARIES = [
  {
    name: 'react-json-view',
    impact: 'High',
    description: 'Has React 17 peer dependencies and may not work with React 18',
    recommendation: 'Create an adapter component with error boundary'
  },
  {
    name: 'react-flow-renderer',
    impact: 'High',
    description: 'May have React version dependencies',
    recommendation: 'Create an adapter component with error boundary'
  },
  {
    name: 'react-dnd',
    impact: 'Medium',
    description: 'Older versions have React 17 dependencies',
    recommendation: 'Upgrade to latest version or create adapter'
  },
  {
    name: 'react-beautiful-dnd',
    impact: 'Medium',
    description: 'Not actively maintained, may have React 18 issues',
    recommendation: 'Consider alternative libraries or create adapter'
  }
];

// Analyze package.json for dependency issues
function analyzePackageJson() {
  log('Analyzing package.json for React dependencies...', 'info');
  
  try {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const result = {
      reactVersion: packageJson.dependencies.react || 'not specified',
      reactDomVersion: packageJson.dependencies['react-dom'] || 'not specified',
      problematicDependencies: []
    };
    
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    
    // Check for known problematic libraries
    for (const lib of PROBLEMATIC_LIBRARIES) {
      if (allDependencies[lib.name]) {
        result.problematicDependencies.push({
          name: lib.name,
          version: allDependencies[lib.name],
          ...lib
        });
        logVerbose(`Found problematic dependency: ${lib.name}@${allDependencies[lib.name]}`);
      }
    }
    
    // Check for React-related dependencies
    for (const [name, version] of Object.entries(allDependencies)) {
      if (name.startsWith('react-') && !result.problematicDependencies.some(d => d.name === name)) {
        result.problematicDependencies.push({
          name,
          version,
          impact: 'Unknown',
          description: 'React-related dependency that may have version compatibility issues',
          recommendation: 'Verify compatibility with React 18'
        });
        logVerbose(`Found React-related dependency: ${name}@${version}`);
      }
    }
    
    log(`Found ${result.problematicDependencies.length} potentially problematic dependencies`, 'info');
    return result;
  } catch (error) {
    log(`Error analyzing package.json: ${error.message}`, 'error');
    return {
      reactVersion: 'unknown',
      reactDomVersion: 'unknown',
      problematicDependencies: []
    };
  }
}

// Analyze code for React compatibility issues
function analyzeCodebase() {
  log('Analyzing codebase for React compatibility issues...', 'info');
  
  try {
    // Get all JS and JSX files
    const files = glob.sync('src/**/*.{js,jsx}', { ignore: ['node_modules/**', 'build/**'] });
    logVerbose(`Found ${files.length} files to analyze`);
    
    const issues = [];
    const componentUsage = {};
    
    // Check each file for React compatibility issues
    files.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for problematic patterns
        KNOWN_PATTERNS.forEach(pattern => {
          const matches = content.match(pattern.pattern);
          if (matches) {
            issues.push({
              file: filePath,
              pattern: pattern.name,
              matches: matches.length,
              impact: pattern.impact,
              description: pattern.description,
              recommendation: pattern.recommendation
            });
            logVerbose(`Found ${matches.length} instances of ${pattern.name} in ${filePath}`);
          }
        });
        
        // Track component imports for usage analysis
        const importMatches = content.matchAll(/import\s+(?:{([^}]+)}|\*\s+as\s+([^;\n]+)|([^,{;\n]+))\s+from\s+['"]([^'"]+)['"]/g);
        
        for (const match of importMatches) {
          const importSource = match[4];
          
          // Check if it's a React component library
          if (importSource.startsWith('react-') || PROBLEMATIC_LIBRARIES.some(lib => lib.name === importSource)) {
            let components = [];
            
            if (match[1]) {
              // Named imports: import { A, B } from 'source'
              components = match[1].split(',').map(s => s.trim().split(' as ')[0].trim());
            } else if (match[2]) {
              // Namespace import: import * as X from 'source'
              components = [match[2].trim()];
            } else if (match[3]) {
              // Default import: import X from 'source'
              components = [match[3].trim()];
            }
            
            components.forEach(component => {
              if (!componentUsage[importSource]) {
                componentUsage[importSource] = { files: {}, components: {} };
              }
              
              if (!componentUsage[importSource].files[filePath]) {
                componentUsage[importSource].files[filePath] = new Set();
              }
              
              if (!componentUsage[importSource].components[component]) {
                componentUsage[importSource].components[component] = new Set();
              }
              
              componentUsage[importSource].files[filePath].add(component);
              componentUsage[importSource].components[component].add(filePath);
            });
          }
        }
      } catch (error) {
        log(`Error analyzing ${filePath}: ${error.message}`, 'warning');
      }
    });
    
    // Convert Sets to arrays for JSON serialization
    Object.keys(componentUsage).forEach(lib => {
      Object.keys(componentUsage[lib].files).forEach(file => {
        componentUsage[lib].files[file] = [...componentUsage[lib].files[file]];
      });
      
      Object.keys(componentUsage[lib].components).forEach(component => {
        componentUsage[lib].components[component] = [...componentUsage[lib].components[component]];
      });
    });
    
    log(`Found ${issues.length} potential compatibility issues`, 'info');
    
    return {
      issues,
      componentUsage
    };
  } catch (error) {
    log(`Error analyzing codebase: ${error.message}`, 'error');
    return {
      issues: [],
      componentUsage: {}
    };
  }
}

// Generate reports
function generateReports(packageAnalysis, codeAnalysis) {
  if (DRY_RUN) {
    log('Dry run: Would generate reports based on analysis', 'info');
    return;
  }
  
  log('Generating reports...', 'info');
  
  const reportData = {
    generatedAt: new Date().toISOString(),
    packageAnalysis,
    codeAnalysis
  };
  
  try {
    // Create JSON report
    fs.writeFileSync(
      path.resolve(process.cwd(), OUTPUT_DIR, 'react-compat-analysis.json'),
      JSON.stringify(reportData, null, 2),
      'utf8'
    );
    
    // Create summary report in Markdown
    let summaryContent = `# React 18 Compatibility Analysis\n\n`;
    summaryContent += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    summaryContent += `## Summary\n\n`;
    summaryContent += `- **React Version:** ${packageAnalysis.reactVersion}\n`;
    summaryContent += `- **React DOM Version:** ${packageAnalysis.reactDomVersion}\n`;
    summaryContent += `- **Potentially Problematic Dependencies:** ${packageAnalysis.problematicDependencies.length}\n`;
    summaryContent += `- **Compatibility Issues Found:** ${codeAnalysis.issues.length}\n`;
    summaryContent += `- **React Component Libraries Used:** ${Object.keys(codeAnalysis.componentUsage).length}\n\n`;
    
    summaryContent += `## Problematic Dependencies\n\n`;
    if (packageAnalysis.problematicDependencies.length > 0) {
      summaryContent += `| Package | Version | Impact | Description | Recommendation |\n`;
      summaryContent += `|---------|---------|--------|-------------|----------------|\n`;
      packageAnalysis.problematicDependencies.forEach(dep => {
        summaryContent += `| ${dep.name} | ${dep.version} | ${dep.impact} | ${dep.description} | ${dep.recommendation} |\n`;
      });
    } else {
      summaryContent += `No problematic dependencies found.\n`;
    }
    
    summaryContent += `\n## Top Components Requiring Adaptation\n\n`;
    const topComponents = [];
    
    Object.entries(codeAnalysis.componentUsage).forEach(([lib, usage]) => {
      Object.entries(usage.components).forEach(([component, files]) => {
        topComponents.push({
          library: lib,
          component,
          usageCount: files.length
        });
      });
    });
    
    topComponents.sort((a, b) => b.usageCount - a.usageCount);
    
    if (topComponents.length > 0) {
      summaryContent += `| Component | Library | Usage Count |\n`;
      summaryContent += `|-----------|---------|-------------|\n`;
      topComponents.slice(0, 10).forEach(comp => {
        summaryContent += `| ${comp.component} | ${comp.library} | ${comp.usageCount} |\n`;
      });
    } else {
      summaryContent += `No component usage data available.\n`;
    }
    
    fs.writeFileSync(
      path.resolve(process.cwd(), OUTPUT_DIR, 'react-compat-summary.md'),
      summaryContent,
      'utf8'
    );
    
    // Create detailed issues report
    let issuesContent = `# React 18 Compatibility Issues\n\n`;
    issuesContent += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    
    if (codeAnalysis.issues.length > 0) {
      // Group by pattern
      const issuesByPattern = {};
      codeAnalysis.issues.forEach(issue => {
        if (!issuesByPattern[issue.pattern]) {
          issuesByPattern[issue.pattern] = [];
        }
        issuesByPattern[issue.pattern].push(issue);
      });
      
      Object.entries(issuesByPattern).forEach(([pattern, issues]) => {
        issuesContent += `## ${pattern}\n\n`;
        issuesContent += `**Impact:** ${issues[0].impact}\n\n`;
        issuesContent += `**Description:** ${issues[0].description}\n\n`;
        issuesContent += `**Recommendation:** ${issues[0].recommendation}\n\n`;
        issuesContent += `**Affected Files:**\n\n`;
        issues.forEach(issue => {
          issuesContent += `- \`${issue.file}\` (${issue.matches} instances)\n`;
        });
        issuesContent += `\n`;
      });
    } else {
      issuesContent += `No specific issues found.\n`;
    }
    
    fs.writeFileSync(
      path.resolve(process.cwd(), OUTPUT_DIR, 'react-compat-issues.md'),
      issuesContent,
      'utf8'
    );
    
    log(`Reports generated in ${OUTPUT_DIR}/`, 'success');
  } catch (error) {
    log(`Error generating reports: ${error.message}`, 'error');
  }
}

// Main execution
async function main() {
  log(`Starting React compatibility analysis ${DRY_RUN ? '(DRY RUN)' : ''}`, 'info');
  
  const packageAnalysis = analyzePackageJson();
  const codeAnalysis = analyzeCodebase();
  
  generateReports(packageAnalysis, codeAnalysis);
  
  // Summary of findings
  log('\nAnalysis Complete!', 'success');
  log(`Examined React version: ${packageAnalysis.reactVersion}`, 'info');
  log(`Potentially problematic dependencies: ${packageAnalysis.problematicDependencies.length}`, 'info');
  log(`Compatibility issues found: ${codeAnalysis.issues.length}`, 'info');
  log(`React component libraries used: ${Object.keys(codeAnalysis.componentUsage).length}`, 'info');
  
  if (!DRY_RUN) {
    log(`\nDetailed reports available in ${OUTPUT_DIR}/`, 'info');
    log(`Summary: ${OUTPUT_DIR}/react-compat-summary.md`, 'info');
    log(`Issues: ${OUTPUT_DIR}/react-compat-issues.md`, 'info');
    log(`Raw data: ${OUTPUT_DIR}/react-compat-analysis.json`, 'info');
  }
}

main().catch(error => {
  log(`Unhandled error: ${error.message}`, 'error');
  process.exit(1);
});