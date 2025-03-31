/**
 * TAP Integration Platform - Dependency Resolver
 * 
 * This script analyzes package.json files across the project to identify
 * and resolve dependency conflicts, following the Golden Approach methodology.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  rootPath: path.join(__dirname, '../../..'),
  componentsToAnalyze: ['frontend', 'backend'],
  outputPath: path.join(__dirname, '../reports'),
  backupPath: path.join(__dirname, '../backups'),
  fixMode: process.argv.includes('--fix')
};

// Ensure output directories exist
ensureDirectoryExists(config.outputPath);
ensureDirectoryExists(config.backupPath);

// Main component paths
const paths = {
  root: config.rootPath,
  frontend: path.join(config.rootPath, 'frontend'),
  backend: path.join(config.rootPath, 'backend')
};

// Results storage
const results = {
  packageFiles: {},
  dependencies: {
    dev: {},
    regular: {},
    peer: {},
    all: {}
  },
  conflicts: [],
  resolutions: {}
};

/**
 * Main execution function
 */
async function main() {
  console.log('TAP Integration Platform - Dependency Resolver');
  console.log('=============================================');
  console.log(`Mode: ${config.fixMode ? 'Fix' : 'Analysis'}`);
  console.log();

  try {
    // Read package files
    await readPackageFiles();
    
    // Analyze dependencies
    analyzeDependencies();
    
    // Identify conflicts
    identifyConflicts();
    
    // Generate report
    generateReport();
    
    // Fix conflicts if in fix mode
    if (config.fixMode) {
      fixConflicts();
    }
    
    console.log('\nAnalysis completed successfully!');
    console.log(`Report saved to: ${path.join(config.outputPath, 'dependency-analysis.json')}`);
    
    if (config.fixMode) {
      console.log(`Conflicts fixed: ${results.conflicts.length}`);
      console.log('Backups created in:', config.backupPath);
    } else if (results.conflicts.length > 0) {
      console.log(`\nFound ${results.conflicts.length} conflicts.`);
      console.log('Run with --fix to automatically resolve conflicts.');
    } else {
      console.log('\nNo conflicts found!');
    }
  } catch (error) {
    console.error('Error executing dependency resolver:', error);
    process.exit(1);
  }
}

/**
 * Read all package.json files
 */
async function readPackageFiles() {
  console.log('Reading package.json files...');
  
  try {
    // Read root package.json
    if (fs.existsSync(path.join(paths.root, 'package.json'))) {
      results.packageFiles.root = JSON.parse(
        fs.readFileSync(path.join(paths.root, 'package.json'), 'utf8')
      );
      console.log('- Found root package.json');
    } else {
      console.log('- Root package.json not found');
      results.packageFiles.root = { dependencies: {}, devDependencies: {} };
    }
    
    // Read component package.json files
    for (const component of config.componentsToAnalyze) {
      const packagePath = path.join(paths[component], 'package.json');
      
      if (fs.existsSync(packagePath)) {
        results.packageFiles[component] = JSON.parse(
          fs.readFileSync(packagePath, 'utf8')
        );
        console.log(`- Found ${component} package.json`);
      } else {
        console.log(`- ${component} package.json not found, skipping`);
      }
    }
  } catch (error) {
    console.error('Error reading package.json files:', error);
    throw error;
  }
}

/**
 * Analyze dependencies from package files
 */
function analyzeDependencies() {
  console.log('\nAnalyzing dependencies...');
  
  // Process each package file
  for (const [component, packageJson] of Object.entries(results.packageFiles)) {
    // Regular dependencies
    if (packageJson.dependencies) {
      for (const [name, version] of Object.entries(packageJson.dependencies)) {
        addDependency(name, version, component, 'regular');
      }
    }
    
    // Dev dependencies
    if (packageJson.devDependencies) {
      for (const [name, version] of Object.entries(packageJson.devDependencies)) {
        addDependency(name, version, component, 'dev');
      }
    }
    
    // Peer dependencies
    if (packageJson.peerDependencies) {
      for (const [name, version] of Object.entries(packageJson.peerDependencies)) {
        addDependency(name, version, component, 'peer');
      }
    }
  }
  
  // Count totals
  const regularCount = Object.keys(results.dependencies.regular).length;
  const devCount = Object.keys(results.dependencies.dev).length;
  const peerCount = Object.keys(results.dependencies.peer).length;
  const totalCount = Object.keys(results.dependencies.all).length;
  
  console.log(`Found ${regularCount} regular, ${devCount} dev, and ${peerCount} peer dependencies.`);
  console.log(`Total unique packages: ${totalCount}`);
}

/**
 * Add a dependency to the results
 */
function addDependency(name, version, component, type) {
  // Create entries if they don't exist
  if (!results.dependencies[type][name]) {
    results.dependencies[type][name] = {};
  }
  
  if (!results.dependencies.all[name]) {
    results.dependencies.all[name] = {};
  }
  
  // Add the component and version
  results.dependencies[type][name][component] = version;
  results.dependencies.all[name][component] = {
    version,
    type
  };
}

/**
 * Identify conflicts between dependencies
 */
function identifyConflicts() {
  console.log('\nIdentifying dependency conflicts...');
  
  let conflictCount = 0;
  
  // Check each dependency
  for (const [name, components] of Object.entries(results.dependencies.all)) {
    const versions = new Set();
    
    // Collect all versions
    for (const [component, info] of Object.entries(components)) {
      versions.add(cleanVersion(info.version));
    }
    
    // If more than one version, it's a conflict
    if (versions.size > 1) {
      const conflict = {
        name,
        versions: {},
        resolution: determineResolution(name, components)
      };
      
      // Add version info for each component
      for (const [component, info] of Object.entries(components)) {
        conflict.versions[component] = {
          version: info.version,
          type: info.type
        };
      }
      
      results.conflicts.push(conflict);
      conflictCount++;
      
      // Add to resolutions
      if (conflict.resolution) {
        results.resolutions[name] = conflict.resolution;
      }
    }
  }
  
  console.log(`Found ${conflictCount} dependency conflicts.`);
}

/**
 * Determine the best resolution for a conflicting dependency
 */
function determineResolution(name, components) {
  // Get all versions
  const versions = Object.entries(components).map(([component, info]) => ({
    component,
    version: cleanVersion(info.version),
    rawVersion: info.version,
    type: info.type
  }));
  
  // Try to find the highest specified version
  versions.sort((a, b) => {
    // Try to compare semver versions
    const aParts = a.version.split('.').map(n => parseInt(n, 10));
    const bParts = b.version.split('.').map(n => parseInt(n, 10));
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aVal = i < aParts.length ? aParts[i] : 0;
      const bVal = i < bParts.length ? bParts[i] : 0;
      
      if (aVal !== bVal) {
        return bVal - aVal; // Descending order
      }
    }
    
    return 0;
  });
  
  // Return the highest version
  return versions[0].rawVersion;
}

/**
 * Clean version string for comparison
 */
function cleanVersion(version) {
  // Remove any prefix like ^, ~, etc.
  return version.replace(/^[^0-9]+/, '').trim();
}

/**
 * Generate a report of the analysis
 */
function generateReport() {
  console.log('\nGenerating dependency analysis report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    components: Object.keys(results.packageFiles),
    dependencyCounts: {
      regular: Object.keys(results.dependencies.regular).length,
      dev: Object.keys(results.dependencies.dev).length,
      peer: Object.keys(results.dependencies.peer).length,
      total: Object.keys(results.dependencies.all).length
    },
    conflicts: results.conflicts,
    resolutions: results.resolutions
  };
  
  // Save report to file
  fs.writeFileSync(
    path.join(config.outputPath, 'dependency-analysis.json'),
    JSON.stringify(report, null, 2)
  );
  
  // Save a human-readable summary
  const summary = [
    '# Dependency Analysis Summary',
    '',
    `Generated on: ${new Date().toLocaleString()}`,
    '',
    '## Components Analyzed',
    ...Object.keys(results.packageFiles).map(c => `- ${c}`),
    '',
    '## Dependency Counts',
    `- Regular dependencies: ${report.dependencyCounts.regular}`,
    `- Development dependencies: ${report.dependencyCounts.dev}`,
    `- Peer dependencies: ${report.dependencyCounts.peer}`,
    `- Total unique packages: ${report.dependencyCounts.total}`,
    '',
    '## Conflicts',
    `Total conflicts: ${results.conflicts.length}`,
    '',
    ...results.conflicts.map(conflict => {
      const versions = Object.entries(conflict.versions)
        .map(([component, info]) => `  - ${component}: ${info.version} (${info.type})`)
        .join('\n');
      
      return [
        `### ${conflict.name}`,
        'Versions:',
        versions,
        `Suggested resolution: ${conflict.resolution}`,
        ''
      ].join('\n');
    })
  ].join('\n');
  
  fs.writeFileSync(
    path.join(config.outputPath, 'dependency-analysis.md'),
    summary
  );
}

/**
 * Fix conflicts by updating package.json files
 */
function fixConflicts() {
  console.log('\nFixing dependency conflicts...');
  
  if (results.conflicts.length === 0) {
    console.log('No conflicts to fix.');
    return;
  }
  
  // Create backups first
  for (const [component, packageJson] of Object.entries(results.packageFiles)) {
    const backupPath = path.join(
      config.backupPath,
      `package.json.${component}.${Date.now()}.backup`
    );
    
    fs.writeFileSync(
      backupPath,
      JSON.stringify(packageJson, null, 2)
    );
    
    console.log(`Created backup for ${component}: ${path.basename(backupPath)}`);
  }
  
  // Add resolutions to root package.json
  const rootPackage = results.packageFiles.root;
  if (!rootPackage.resolutions) {
    rootPackage.resolutions = {};
  }
  
  for (const [name, version] of Object.entries(results.resolutions)) {
    rootPackage.resolutions[name] = version;
  }
  
  // Write updated root package.json
  fs.writeFileSync(
    path.join(paths.root, 'package.json'),
    JSON.stringify(rootPackage, null, 2)
  );
  
  console.log(`Updated root package.json with ${Object.keys(results.resolutions).length} resolutions.`);
  console.log('Please run "npm install" to apply the changes.');
}

/**
 * Ensure a directory exists
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Execute the main function
main().catch(console.error);