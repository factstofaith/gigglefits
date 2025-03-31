/**
 * Component Analyzer for Design System Migration
 * 
 * This script analyzes the codebase to identify Material UI component usage,
 * organizes findings by feature area, and generates reports to track migration progress.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const config = {
  // Root directories to scan
  sourceDirectories: [
    'src/components',
    'src/pages'
  ],
  
  // Material UI import patterns to look for
  materialUIPatterns: [
    /@mui\/material/,
    /@mui\/icons-material/,
    /@material-ui\/core/,
    /@material-ui\/icons/,
    /from ['"]@mui\/material\/([A-Za-z]+)['"]/,
    /from ['"]@material-ui\/core\/([A-Za-z]+)['"]/
  ],
  
  // Feature mapping for organization
  featureMappings: [
    {
      name: 'Templates',
      patterns: [
        /Template.*\.jsx$/,
        /.*\/template\/.*/i
      ]
    },
    {
      name: 'Admin',
      patterns: [
        /.*\/admin\/.*/,
        /Admin.*\.jsx$/,
        /Tenants.*\.jsx$/,
        /Applications.*\.jsx$/,
        /Releases.*\.jsx$/,
        /Datasets.*\.jsx$/
      ]
    },
    {
      name: 'Settings',
      patterns: [
        /Settings.*\.jsx$/,
        /.*\/settings\/.*/i,
        /Notification.*Settings.*\.jsx$/,
        /UserSettings.*\.jsx$/
      ]
    },
    {
      name: 'Dashboard',
      patterns: [
        /Dashboard.*\.jsx$/,
        /Home.*\.jsx$/,
        /StatusDisplay.*\.jsx$/,
        /.*Card.*\.jsx$/
      ]
    }
  ],
  
  // Output path for reports
  outputPath: 'migration-reports'
};

/**
 * Get all React component files in source directories
 */
function getAllComponentFiles() {
  const files = [];
  
  config.sourceDirectories.forEach(dir => {
    const pattern = path.join(dir, '**/*.{jsx,js}');
    const matches = glob.sync(pattern);
    files.push(...matches);
  });
  
  return files;
}

/**
 * Analyze a single file for Material UI imports and usages
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = [];
  const usages = [];
  
  // Extract imports using regex
  const importLines = content.match(/import.*from.*['"]\s*;?/g) || [];
  
  importLines.forEach(line => {
    config.materialUIPatterns.forEach(pattern => {
      if (pattern.test(line)) {
        // Extract component names from import
        const importMatches = line.match(/import\s+{([^}]+)}\s+from/);
        if (importMatches && importMatches[1]) {
          const components = importMatches[1].split(',').map(c => c.trim());
          imports.push(...components);
        }
        
        // Look for direct imports like "import Button from '@mui/material/Button'"
        const directImportMatches = line.match(/import\s+(\w+)\s+from\s+['"]@mui\/material\/(\w+)['"]/);
        if (directImportMatches && directImportMatches[1]) {
          imports.push(directImportMatches[1]);
        }
      }
    });
  });
  
  // Count usages of each imported component
  imports.forEach(component => {
    // Clean up component name (remove 'as' aliases)
    const cleanName = component.split(' as ')[0];
    // Create regex to match component usage
    const usagePattern = new RegExp(`<${cleanName}[\\s/>]|<${cleanName}$`, 'g');
    const matches = content.match(usagePattern) || [];
    
    if (matches.length > 0) {
      usages.push({
        component: cleanName,
        count: matches.length
      });
    }
  });
  
  return {
    file: filePath,
    feature: determineFeature(filePath),
    imports,
    usages
  };
}

/**
 * Determine which feature a file belongs to
 */
function determineFeature(filePath) {
  for (const feature of config.featureMappings) {
    for (const pattern of feature.patterns) {
      if (pattern.test(filePath)) {
        return feature.name;
      }
    }
  }
  
  return 'Other';
}

/**
 * Analyze all files and generate a comprehensive report
 */
function analyzeAllFiles() {
  const files = getAllComponentFiles();
  const results = [];
  
  files.forEach(file => {
    const analysis = analyzeFile(file);
    if (analysis.imports.length > 0) {
      results.push(analysis);
    }
  });
  
  return results;
}

/**
 * Organize results by feature
 */
function organizeByFeature(results) {
  const featureMap = {};
  
  results.forEach(result => {
    const feature = result.feature;
    if (!featureMap[feature]) {
      featureMap[feature] = [];
    }
    featureMap[feature].push(result);
  });
  
  return featureMap;
}

/**
 * Generate summary statistics
 */
function generateSummary(featureMap) {
  const summary = {
    totalComponents: 0,
    totalFiles: 0,
    byFeature: {},
    componentPopularity: {}
  };
  
  // Count components by feature
  Object.keys(featureMap).forEach(feature => {
    const files = featureMap[feature];
    summary.totalFiles += files.length;
    
    summary.byFeature[feature] = {
      files: files.length,
      components: 0,
      componentList: []
    };
    
    // Count unique components in this feature
    const componentSet = new Set();
    files.forEach(file => {
      file.usages.forEach(usage => {
        componentSet.add(usage.component);
        
        // Track component popularity across all features
        if (!summary.componentPopularity[usage.component]) {
          summary.componentPopularity[usage.component] = 0;
        }
        summary.componentPopularity[usage.component] += usage.count;
      });
    });
    
    summary.byFeature[feature].components = componentSet.size;
    summary.byFeature[feature].componentList = Array.from(componentSet);
    summary.totalComponents += componentSet.size;
  });
  
  return summary;
}

/**
 * Generate HTML report
 */
function generateHTMLReport(featureMap, summary) {
  // Sort components by popularity
  const sortedComponents = Object.entries(summary.componentPopularity)
    .sort((a, b) => b[1] - a[1])
    .map(([component, count]) => ({ component, count }));
  
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Design System Migration Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; line-height: 1.6; }
    h1, h2, h3 { color: #2c3e50; }
    .container { max-width: 1200px; margin: 0 auto; }
    .summary { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
    .feature { margin-bottom: 30px; background-color: #fff; border: 1px solid #ddd; border-radius: 5px; overflow: hidden; }
    .feature-header { background-color: #eee; padding: 10px 15px; border-bottom: 1px solid #ddd; }
    .feature-body { padding: 15px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; font-weight: bold; }
    tr:hover { background-color: #f5f5f5; }
    .priority-high { background-color: #ffebee; }
    .priority-medium { background-color: #fff8e1; }
    .priority-low { background-color: #e8f5e9; }
    .chart { height: 300px; margin: 20px 0; }
    .progress-bar { height: 20px; background-color: #e0e0e0; border-radius: 4px; margin-bottom: 5px; }
    .progress-fill { height: 100%; background-color: #4caf50; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Design System Migration Analysis Report</h1>
    <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    
    <div class="summary">
      <h2>Summary</h2>
      <p>Total files with Material UI components: <strong>${summary.totalFiles}</strong></p>
      <p>Total unique component usage instances: <strong>${summary.totalComponents}</strong></p>
      
      <h3>By Feature</h3>
      <table>
        <tr>
          <th>Feature</th>
          <th>Files</th>
          <th>Unique Components</th>
          <th>Priority</th>
        </tr>
  `;
  
  // Add feature summary rows
  const featurePriorities = {
    'Templates': 'High',
    'Admin': 'High',
    'Settings': 'Medium',
    'Dashboard': 'Medium',
    'Other': 'Low'
  };
  
  Object.keys(summary.byFeature).forEach(feature => {
    const featureData = summary.byFeature[feature];
    const priorityClass = `priority-${featurePriorities[feature]?.toLowerCase() || 'low'}`;
    
    html += `
        <tr class="${priorityClass}">
          <td>${feature}</td>
          <td>${featureData.files}</td>
          <td>${featureData.components}</td>
          <td>${featurePriorities[feature] || 'Low'}</td>
        </tr>
    `;
  });
  
  html += `
      </table>
      
      <h3>Most Used Components</h3>
      <table>
        <tr>
          <th>Component</th>
          <th>Usage Count</th>
        </tr>
  `;
  
  // Add top 10 components by usage
  sortedComponents.slice(0, 10).forEach(({ component, count }) => {
    html += `
        <tr>
          <td>${component}</td>
          <td>${count}</td>
        </tr>
    `;
  });
  
  html += `
      </table>
    </div>
  `;
  
  // Add feature details
  Object.keys(featureMap).sort().forEach(feature => {
    const files = featureMap[feature];
    const priorityClass = `priority-${featurePriorities[feature]?.toLowerCase() || 'low'}`;
    
    html += `
    <div class="feature">
      <div class="feature-header ${priorityClass}">
        <h2>${feature} (${files.length} files)</h2>
        <p>Priority: ${featurePriorities[feature] || 'Low'}</p>
      </div>
      <div class="feature-body">
        <table>
          <tr>
            <th>File</th>
            <th>Component Usages</th>
          </tr>
    `;
    
    files.forEach(file => {
      const componentUsages = file.usages
        .map(usage => `${usage.component} (${usage.count})`)
        .join(', ');
      
      html += `
          <tr>
            <td>${file.file}</td>
            <td>${componentUsages}</td>
          </tr>
      `;
    });
    
    html += `
        </table>
      </div>
    </div>
    `;
  });
  
  html += `
  </div>
</body>
</html>
  `;
  
  return html;
}

/**
 * Generate JSON report
 */
function generateJSONReport(featureMap, summary) {
  return JSON.stringify({
    summary,
    featureMap,
    generatedAt: new Date().toISOString()
  }, null, 2);
}

/**
 * Save reports to files
 */
function saveReports(htmlReport, jsonReport) {
  // Create output directory if it doesn't exist
  const outputDir = path.join(process.cwd(), config.outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const htmlPath = path.join(outputDir, `migration-report-${timestamp}.html`);
  const jsonPath = path.join(outputDir, `migration-report-${timestamp}.json`);
  const latestHtmlPath = path.join(outputDir, 'migration-report-latest.html');
  const latestJsonPath = path.join(outputDir, 'migration-report-latest.json');
  
  fs.writeFileSync(htmlPath, htmlReport);
  fs.writeFileSync(jsonPath, jsonReport);
  
  // Also save as latest
  fs.writeFileSync(latestHtmlPath, htmlReport);
  fs.writeFileSync(latestJsonPath, jsonReport);
  
  return {
    htmlPath,
    jsonPath,
    latestHtmlPath,
    latestJsonPath
  };
}

/**
 * Main function to run the analysis
 */
function main() {
  console.log('Analyzing codebase for Material UI components...');
  
  const results = analyzeAllFiles();
  console.log(`Found ${results.length} files with Material UI components`);
  
  const featureMap = organizeByFeature(results);
  console.log(`Organized by ${Object.keys(featureMap).length} features`);
  
  const summary = generateSummary(featureMap);
  console.log(`Identified ${summary.totalComponents} unique component usages`);
  
  const htmlReport = generateHTMLReport(featureMap, summary);
  const jsonReport = generateJSONReport(featureMap, summary);
  
  const reportPaths = saveReports(htmlReport, jsonReport);
  
  console.log('\nAnalysis complete!');
  console.log(`HTML report saved to: ${reportPaths.htmlPath}`);
  console.log(`JSON report saved to: ${reportPaths.jsonPath}`);
  console.log(`Latest reports saved to: ${reportPaths.latestHtmlPath} and ${reportPaths.latestJsonPath}`);
  
  // Print summary to console
  console.log('\nSummary by feature:');
  Object.keys(summary.byFeature).forEach(feature => {
    const data = summary.byFeature[feature];
    console.log(`- ${feature}: ${data.files} files, ${data.components} components`);
  });
  
  console.log('\nNext steps:');
  console.log('1. Review the HTML report for detailed analysis');
  console.log('2. Focus on Template feature components first');
  console.log('3. Update DesignSystem-Migration.md with current progress');
}

// Run the analysis
main();