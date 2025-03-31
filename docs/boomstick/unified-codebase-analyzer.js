#!/usr/bin/env node
/**
 * Unified Codebase Analyzer
 * 
 * Comprehensive tool that coordinates all specialized analyzers to provide a holistic view
 * of the codebase health while maintaining dual validation for build and tests.
 * 
 * Features:
 * - Parallel execution of all specialized analyzers
 * - Aggregated issue prioritization
 * - Build and test impact prediction
 * - Interactive HTML dashboard
 * - Automated fix application
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const chalk = require('chalk') || { green: (s) => s, red: (s) => s, yellow: (s) => s, blue: (s) => s };

// Configuration
const config = {
  rootDir: process.cwd(),
  outputDir: './analysis_results',
  backupDir: path.resolve(`./project/777_Final/backups/${new Date().toISOString().replace(/:/g, '-')}`),
  analyzers: [
    {
      name: 'Static Analyzer',
      script: './project/777_Final/static-analyzer.js',
      outputFile: 'static-analysis-report.json',
      htmlReport: 'static-analysis-report.html',
      description: 'General code issues including JSX, syntax, and template literals'
    },
    {
      name: 'Hook Compliance Analyzer',
      script: './project/777_Final/hook-compliance-analyzer.js',
      outputFile: 'hooks-analysis-report.json',
      htmlReport: 'hooks-analysis-report.html',
      description: 'React Hooks compliance issues'
    },
    {
      name: 'Import/Export Optimizer',
      script: './project/777_Final/import-export-optimizer.js',
      outputFile: 'imports-exports-analysis.json',
      htmlReport: 'imports-exports-analysis.html',
      description: 'Import/export issues and module dependencies'
    },
    {
      name: 'Test Compatibility Verifier',
      script: './project/777_Final/test-compatibility-verifier.js',
      outputFile: 'test-compatibility-report.json',
      htmlReport: 'test-compatibility-report.html',
      description: 'Test compatibility and mock usage issues'
    }
  ],
  dryRun: false,
  verbose: false,
  autoFix: false
};

// Parse command line args
const args = process.argv.slice(2);
if (args.includes('--dry-run')) config.dryRun = true;
if (args.includes('--verbose')) config.verbose = true;
if (args.includes('--auto-fix')) config.autoFix = true;
if (args.includes('--output-dir') && args.indexOf('--output-dir') + 1 < args.length) {
  config.outputDir = args[args.indexOf('--output-dir') + 1];
}

// Create output and backup directories
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

if (!config.dryRun) {
  fs.mkdirSync(config.backupDir, { recursive: true });
  console.log(chalk.blue(`Created backup directory: ${config.backupDir}`));
}

/**
 * Run a single analyzer script
 */
function runAnalyzer(analyzer) {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue(`Running ${analyzer.name}...`));
    
    const outputPath = path.join(config.outputDir, analyzer.outputFile);
    const args = ['--output-file', outputPath];
    
    if (config.dryRun) args.push('--dry-run');
    if (config.verbose) args.push('--verbose');
    
    const process = spawn('node', [analyzer.script, ...args], {
      stdio: config.verbose ? 'inherit' : 'pipe'
    });
    
    let stdout = '';
    let stderr = '';
    
    if (process.stdout) {
      process.stdout.on('data', (data) => {
        stdout += data.toString();
        if (config.verbose) {
          console.log(data.toString());
        }
      });
    }
    
    if (process.stderr) {
      process.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error(chalk.red(data.toString()));
      });
    }
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve({
          analyzer,
          success: true,
          outputPath,
          stdout
        });
      } else {
        reject({
          analyzer,
          success: false,
          code,
          stderr
        });
      }
    });
  });
}

/**
 * Run all analyzers in parallel
 */
async function runAllAnalyzers() {
  console.log(chalk.blue(`Running ${config.analyzers.length} analyzers in parallel...`));
  
  const results = await Promise.allSettled(
    config.analyzers.map(analyzer => runAnalyzer(analyzer))
  );
  
  const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
  const failed = results.filter(r => r.status === 'rejected').map(r => r.reason);
  
  console.log(chalk.blue(`\n=== Analysis Summary ===`));
  console.log(`Total analyzers: ${config.analyzers.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log(chalk.red('\nFailed analyzers:'));
    failed.forEach(f => {
      console.log(chalk.red(`- ${f.analyzer.name} (exit code ${f.code})`));
    });
  }
  
  return { successful, failed };
}

/**
 * Aggregate analysis results from all analyzers
 */
function aggregateResults(successful) {
  console.log(chalk.blue('Aggregating analysis results...'));
  
  const aggregated = {
    issuesByCategory: {},
    issuesByFile: {},
    criticalFiles: new Set(),
    totalIssues: 0,
    filesWithIssues: new Set(),
    fixableIssues: 0
  };
  
  // Process each analyzer's results
  for (const result of successful) {
    const { analyzer, outputPath } = result;
    
    if (fs.existsSync(outputPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
        
        // Process static analyzer results
        if (analyzer.name === 'Static Analyzer') {
          const issues = data.detailedResults || [];
          
          issues.forEach(fileResult => {
            const filePath = fileResult.filePath;
            aggregated.filesWithIssues.add(filePath);
            
            if (!aggregated.issuesByFile[filePath]) {
              aggregated.issuesByFile[filePath] = [];
            }
            
            fileResult.issues.forEach(issue => {
              const category = issue.category;
              
              if (!aggregated.issuesByCategory[category]) {
                aggregated.issuesByCategory[category] = {
                  count: 0,
                  fixable: 0,
                  description: getCategoryDescription(category)
                };
              }
              
              aggregated.issuesByCategory[category].count++;
              aggregated.totalIssues++;
              
              if (issue.fix && issue.fix.automated) {
                aggregated.issuesByCategory[category].fixable++;
                aggregated.fixableIssues++;
              }
              
              // Track if this is a critical file (affects both build and tests)
              if (issue.isCriticalFile) {
                aggregated.criticalFiles.add(filePath);
              }
              
              // Add to file-specific issues
              aggregated.issuesByFile[filePath].push({
                ...issue,
                analyzer: analyzer.name
              });
            });
          });
        }
        
        // Process hooks analyzer results
        else if (analyzer.name === 'Hook Compliance Analyzer') {
          const fileIssues = Array.isArray(data) ? data : [];
          
          fileIssues.forEach(fileResult => {
            const filePath = fileResult.filePath;
            aggregated.filesWithIssues.add(filePath);
            
            if (!aggregated.issuesByFile[filePath]) {
              aggregated.issuesByFile[filePath] = [];
            }
            
            fileResult.issues.forEach(issue => {
              const category = 'REACT_HOOKS';
              
              if (!aggregated.issuesByCategory[category]) {
                aggregated.issuesByCategory[category] = {
                  count: 0,
                  fixable: 0,
                  description: 'React Hooks rule violations'
                };
              }
              
              aggregated.issuesByCategory[category].count++;
              aggregated.totalIssues++;
              
              if (issue.fix && issue.fix.automated) {
                aggregated.issuesByCategory[category].fixable++;
                aggregated.fixableIssues++;
              }
              
              // Add to file-specific issues
              aggregated.issuesByFile[filePath].push({
                ...issue,
                analyzer: analyzer.name
              });
            });
          });
        }
        
        // Process import/export analyzer results
        else if (analyzer.name === 'Import/Export Optimizer') {
          const results = data.results || [];
          
          results.forEach(fileResult => {
            if (fileResult.issues && fileResult.issues.length > 0) {
              const filePath = fileResult.filePath;
              aggregated.filesWithIssues.add(filePath);
              
              if (!aggregated.issuesByFile[filePath]) {
                aggregated.issuesByFile[filePath] = [];
              }
              
              fileResult.issues.forEach(issue => {
                const category = 'IMPORT_EXPORT';
                
                if (!aggregated.issuesByCategory[category]) {
                  aggregated.issuesByCategory[category] = {
                    count: 0,
                    fixable: 0,
                    description: 'Import and export issues'
                  };
                }
                
                aggregated.issuesByCategory[category].count++;
                aggregated.totalIssues++;
                
                if (issue.fix && issue.fix.automated) {
                  aggregated.issuesByCategory[category].fixable++;
                  aggregated.fixableIssues++;
                }
                
                // Add to file-specific issues
                aggregated.issuesByFile[filePath].push({
                  ...issue,
                  analyzer: analyzer.name
                });
              });
            }
          });
          
          // Process circular dependencies
          if (data.circularDeps && data.circularDeps.length > 0) {
            if (!aggregated.issuesByCategory['CIRCULAR_DEPS']) {
              aggregated.issuesByCategory['CIRCULAR_DEPS'] = {
                count: 0,
                fixable: 0,
                description: 'Circular dependencies between modules'
              };
            }
            
            aggregated.issuesByCategory['CIRCULAR_DEPS'].count += data.circularDeps.length;
            aggregated.totalIssues += data.circularDeps.length;
            
            // Circular dependencies are typically not automatically fixable
          }
        }
        
        // Process test compatibility verifier results
        else if (analyzer.name === 'Test Compatibility Verifier') {
          const testData = data.testData || [];
          
          testData.forEach(test => {
            if (test.issues && test.issues.length > 0) {
              const filePath = test.filePath;
              aggregated.filesWithIssues.add(filePath);
              
              if (!aggregated.issuesByFile[filePath]) {
                aggregated.issuesByFile[filePath] = [];
              }
              
              test.issues.forEach(issue => {
                const category = 'TEST_COMPATIBILITY';
                
                if (!aggregated.issuesByCategory[category]) {
                  aggregated.issuesByCategory[category] = {
                    count: 0,
                    fixable: 0,
                    description: 'Test compatibility issues'
                  };
                }
                
                aggregated.issuesByCategory[category].count++;
                aggregated.totalIssues++;
                
                if (issue.fix && issue.fix.automated) {
                  aggregated.issuesByCategory[category].fixable++;
                  aggregated.fixableIssues++;
                }
                
                // Add to file-specific issues
                aggregated.issuesByFile[filePath].push({
                  ...issue,
                  analyzer: analyzer.name
                });
              });
            }
          });
          
          // Track critical source files (those that many tests depend on)
          if (data.sourceToTests) {
            Object.entries(data.sourceToTests).forEach(([sourcePath, tests]) => {
              if (tests.length > 5) {
                // Files with more than 5 test dependencies are critical
                aggregated.criticalFiles.add(sourcePath);
              }
            });
          }
        }
      } catch (error) {
        console.error(chalk.red(`Error processing ${outputPath}: ${error.message}`));
      }
    } else {
      console.warn(chalk.yellow(`Output file not found: ${outputPath}`));
    }
  }
  
  // Convert sets to arrays for JSON serialization
  aggregated.filesWithIssues = Array.from(aggregated.filesWithIssues);
  aggregated.criticalFiles = Array.from(aggregated.criticalFiles);
  
  // Save aggregated results
  const aggregatedOutputPath = path.join(config.outputDir, 'aggregated-results.json');
  fs.writeFileSync(aggregatedOutputPath, JSON.stringify(aggregated, null, 2));
  
  return aggregated;
}

/**
 * Get description for issue category
 */
function getCategoryDescription(category) {
  const descriptions = {
    'JSX_SYNTAX': 'JSX syntax and structure issues',
    'IMPORT_EXPORT': 'Import and export statement issues',
    'REACT_HOOKS': 'React Hooks rule violations',
    'TEMPLATE_LITERALS': 'Template literal syntax issues',
    'TEST_COMPATIBILITY': 'Test compatibility issues',
    'CIRCULAR_DEPS': 'Circular dependencies between modules',
    'PARSE_ERROR': 'Syntax errors preventing parsing'
  };
  
  return descriptions[category] || 'General code issues';
}

/**
 * Create dashboard HTML
 */
function generateDashboard(aggregated, analyzerResults) {
  console.log(chalk.blue('Generating unified dashboard...'));
  
  const dashboardPath = path.join(config.outputDir, 'unified-dashboard.html');
  
  // Prepare data for charts
  const categoryLabels = Object.keys(aggregated.issuesByCategory);
  const categoryData = categoryLabels.map(cat => aggregated.issuesByCategory[cat].count);
  const fixableCategoryData = categoryLabels.map(cat => aggregated.issuesByCategory[cat].fixable);
  
  // Sort files by issue count for the top issues table
  const topFiles = Object.entries(aggregated.issuesByFile)
    .map(([file, issues]) => ({ file, count: issues.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
  
  // Prepare critical files list
  const criticalFiles = aggregated.criticalFiles.map(file => {
    const issues = aggregated.issuesByFile[file] || [];
    return {
      file,
      issues: issues.length
    };
  }).sort((a, b) => b.issues - a.issues);
  
  // Generate HTML
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Unified Codebase Analysis Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.5; margin: 0; padding: 20px; }
    .header { margin-bottom: 20px; text-align: center; }
    .summary { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 30px; }
    .summary-card { flex: 1; min-width: 200px; background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; }
    .summary-card.warning { background: #fff8e1; }
    .summary-card.error { background: #ffebee; }
    .summary-card.success { background: #e8f5e9; }
    .chart-container { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 30px; }
    .chart { flex: 1; min-width: 400px; height: 300px; padding: 15px; border-radius: 5px; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .table-section { margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f5f5f5; }
    tr:hover { background: #f5f5f5; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .badge.error { background: #ffebee; color: #c62828; }
    .badge.warning { background: #fff8e1; color: #f57f17; }
    .badge.success { background: #e8f5e9; color: #2e7d32; }
    .analyzer-section { margin-bottom: 30px; }
    .analyzer-card { padding: 15px; border-radius: 5px; margin-bottom: 10px; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    a { color: #1976d2; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .number { font-size: 24px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Unified Codebase Analysis Dashboard</h1>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </div>
  
  <div class="summary">
    <div class="summary-card">
      <h3>Total Issues</h3>
      <div class="number">${aggregated.totalIssues}</div>
    </div>
    <div class="summary-card">
      <h3>Files with Issues</h3>
      <div class="number">${aggregated.filesWithIssues.length}</div>
    </div>
    <div class="summary-card success">
      <h3>Automatically Fixable</h3>
      <div class="number">${aggregated.fixableIssues}</div>
      <div>(${Math.round((aggregated.fixableIssues / aggregated.totalIssues) * 100)}%)</div>
    </div>
    <div class="summary-card warning">
      <h3>Critical Files</h3>
      <div class="number">${aggregated.criticalFiles.length}</div>
    </div>
  </div>
  
  <div class="chart-container">
    <div class="chart">
      <canvas id="issuesByCategory"></canvas>
    </div>
    <div class="chart">
      <canvas id="fixabilityChart"></canvas>
    </div>
  </div>
  
  <div class="analyzer-section">
    <h2>Analyzer Reports</h2>
    <div style="display: flex; flex-wrap: wrap; gap: 20px;">
      ${analyzerResults.map(result => `
        <div class="analyzer-card" style="flex: 1; min-width: 300px;">
          <h3>${result.analyzer.name}</h3>
          <p>${result.analyzer.description}</p>
          <a href="${result.analyzer.htmlReport}" target="_blank">View Detailed Report</a>
        </div>
      `).join('')}
    </div>
  </div>
  
  <div class="table-section">
    <h2>Top 20 Files with Most Issues</h2>
    <table>
      <thead>
        <tr>
          <th>File</th>
          <th>Issues</th>
          <th>Categories</th>
          <th>Critical</th>
        </tr>
      </thead>
      <tbody>
        ${topFiles.map(file => {
          const issues = aggregated.issuesByFile[file.file];
          const categories = [...new Set(issues.map(i => i.category || i.type))];
          const isCritical = aggregated.criticalFiles.includes(file.file);
          
          return `
            <tr>
              <td>${file.file}</td>
              <td>${file.count}</td>
              <td>${categories.map(cat => 
                `<span class="badge ${cat.includes('ERROR') ? 'error' : 'warning'}">${cat}</span>`
              ).join(' ')}</td>
              <td>${isCritical ? 
                '<span class="badge error">Critical</span>' : 
                '<span class="badge success">Normal</span>'}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="table-section">
    <h2>Critical Files (High Impact)</h2>
    <p>These files have the highest impact on both build and tests:</p>
    <table>
      <thead>
        <tr>
          <th>File</th>
          <th>Issues</th>
          <th>Reason</th>
        </tr>
      </thead>
      <tbody>
        ${criticalFiles.slice(0, 20).map(file => `
          <tr>
            <td>${file.file}</td>
            <td>${file.issues}</td>
            <td>Used by multiple components/tests</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <script>
    // Chart for issues by category
    const categoryCtx = document.getElementById('issuesByCategory').getContext('2d');
    new Chart(categoryCtx, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(categoryLabels)},
        datasets: [{
          label: 'Issues by Category',
          data: ${JSON.stringify(categoryData)},
          backgroundColor: [
            '#ffcdd2', '#f8bbd0', '#e1bee7', '#d1c4e9', 
            '#bbdefb', '#b2ebf2', '#c8e6c9', '#dcedc8'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Issues by Category'
          }
        }
      }
    });
    
    // Chart for fixability
    const fixabilityCtx = document.getElementById('fixabilityChart').getContext('2d');
    new Chart(fixabilityCtx, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(categoryLabels)},
        datasets: [
          {
            label: 'Total Issues',
            data: ${JSON.stringify(categoryData)},
            backgroundColor: '#bbdefb'
          },
          {
            label: 'Automatically Fixable',
            data: ${JSON.stringify(fixableCategoryData)},
            backgroundColor: '#c8e6c9'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Fixability by Category'
          }
        }
      }
    });
  </script>
</body>
</html>
  `;
  
  fs.writeFileSync(dashboardPath, html);
  console.log(chalk.green(`Dashboard generated at ${dashboardPath}`));
  
  return dashboardPath;
}

/**
 * Run auto-fixes based on analysis
 */
async function runAutoFixes(aggregated) {
  if (!config.autoFix) {
    console.log(chalk.yellow('Auto-fix disabled. Use --auto-fix to apply fixes.'));
    return;
  }
  
  console.log(chalk.blue('Running auto-fixes...'));
  
  // Sort files by criticality and issue count
  const filesToFix = Object.keys(aggregated.issuesByFile)
    .map(file => ({
      file,
      issues: aggregated.issuesByFile[file].length,
      isCritical: aggregated.criticalFiles.includes(file),
      fixableIssues: aggregated.issuesByFile[file].filter(i => i.fix && i.fix.automated).length
    }))
    .filter(f => f.fixableIssues > 0)
    .sort((a, b) => {
      // Critical files first
      if (a.isCritical !== b.isCritical) {
        return a.isCritical ? -1 : 1;
      }
      // Then by fixable issue count
      return b.fixableIssues - a.fixableIssues;
    });
  
  console.log(chalk.blue(`Found ${filesToFix.length} files with fixable issues`));
  
  if (config.dryRun) {
    console.log(chalk.yellow('[DRY RUN] Would fix files'));
    return;
  }
  
  // Run auto-fix.js on each file
  let fixedCount = 0;
  let errorCount = 0;
  
  for (const fileInfo of filesToFix) {
    console.log(chalk.blue(`Fixing ${fileInfo.file} (${fileInfo.fixableIssues} fixable issues)`));
    
    try {
      // Run auto-fix for this file
      const command = spawn('node', ['./project/777_Final/auto-fix.js', fileInfo.file], {
        stdio: config.verbose ? 'inherit' : 'pipe'
      });
      
      const result = await new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        
        if (command.stdout) {
          command.stdout.on('data', (data) => {
            stdout += data.toString();
            if (config.verbose) {
              console.log(data.toString());
            }
          });
        }
        
        if (command.stderr) {
          command.stderr.on('data', (data) => {
            stderr += data.toString();
            if (config.verbose) {
              console.error(chalk.red(data.toString()));
            }
          });
        }
        
        command.on('close', (code) => {
          if (code === 0) {
            resolve({ success: true, stdout });
          } else {
            reject({ success: false, code, stderr });
          }
        });
      });
      
      console.log(chalk.green(`✓ Fixed ${fileInfo.file}`));
      fixedCount++;
      
    } catch (error) {
      console.error(chalk.red(`× Failed to fix ${fileInfo.file}: ${error.stderr || error.message}`));
      errorCount++;
    }
  }
  
  console.log(chalk.blue('\n=== Auto-Fix Summary ==='));
  console.log(`Files fixed: ${fixedCount}`);
  console.log(`Files with errors: ${errorCount}`);
  
  return { fixedCount, errorCount };
}

/**
 * Main function
 */
async function main() {
  console.log(chalk.blue('🔍 Running Unified Codebase Analyzer...'));
  
  // Run all analyzers
  const { successful, failed } = await runAllAnalyzers();
  
  // Stop if all analyzers failed
  if (successful.length === 0) {
    console.error(chalk.red('All analyzers failed. Aborting.'));
    process.exit(1);
  }
  
  // Aggregate results
  const aggregated = aggregateResults(successful);
  
  // Generate dashboard
  const dashboardPath = generateDashboard(aggregated, successful);
  
  // Print summary
  console.log(chalk.blue('\n=== Analysis Summary ==='));
  console.log(`Total issues found: ${aggregated.totalIssues}`);
  console.log(`Files with issues: ${aggregated.filesWithIssues.length}`);
  console.log(`Automatically fixable issues: ${aggregated.fixableIssues}`);
  console.log(`Critical files: ${aggregated.criticalFiles.length}`);
  
  console.log(chalk.blue('\nIssues by category:'));
  for (const [category, data] of Object.entries(aggregated.issuesByCategory)) {
    console.log(`${category}: ${data.count} (${data.fixable} fixable)`);
  }
  
  // Run auto-fixes if enabled
  if (config.autoFix && aggregated.fixableIssues > 0) {
    await runAutoFixes(aggregated);
  } else if (aggregated.fixableIssues > 0) {
    console.log(chalk.yellow(`\n${aggregated.fixableIssues} issues can be fixed automatically. Run with --auto-fix to apply.`));
  }
  
  console.log(chalk.green(`\nAnalysis complete! View dashboard at ${dashboardPath}`));
}

// Run main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});