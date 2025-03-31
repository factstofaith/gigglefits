/**
 * TAP Integration Platform - Clean Script
 * 
 * This script cleans build artifacts and temporary files to ensure a fresh build.
 * 
 * Following the Golden Approach methodology for thorough implementation.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const config = {
  rootPath: path.join(__dirname, '../../..'),
  components: ['frontend', 'backend'],
  directoriesToClean: {
    frontend: [
      'build',
      'coverage',
      'node_modules/.cache',
      'dist'
    ],
    backend: [
      'build',
      'dist',
      '__pycache__',
      '.pytest_cache',
      '.coverage'
    ]
  },
  filesToClean: {
    frontend: [
      'test-results.json',
      'coverage-summary.json',
      '*.log'
    ],
    backend: [
      '*.pyc',
      '*.log',
      'coverage.xml'
    ]
  }
};

/**
 * Main function to run the clean process
 */
async function main() {
  console.log('TAP Integration Platform - Clean Script');
  console.log('=======================================');
  console.log(`Root path: ${config.rootPath}`);

  try {
    // Clean each component
    for (const component of config.components) {
      await cleanComponent(component);
    }
    
    console.log('\nClean process completed successfully.');
  } catch (error) {
    console.error('Clean process failed:', error);
    process.exit(1);
  }
}

/**
 * Clean a specific component
 */
async function cleanComponent(component) {
  const componentPath = path.join(config.rootPath, component);
  
  console.log(`\nCleaning ${component}...`);
  
  // Check if component directory exists
  if (!fs.existsSync(componentPath)) {
    console.warn(`Component directory not found: ${componentPath}, skipping`);
    return;
  }
  
  // Clean directories
  if (config.directoriesToClean[component]) {
    for (const dir of config.directoriesToClean[component]) {
      const dirPath = path.join(componentPath, dir);
      
      if (fs.existsSync(dirPath)) {
        try {
          console.log(`Removing directory: ${dir}`);
          await removeDirRecursive(dirPath);
        } catch (error) {
          console.error(`Error removing directory ${dir}:`, error.message);
        }
      }
    }
  }
  
  // Clean files
  if (config.filesToClean[component]) {
    for (const filePattern of config.filesToClean[component]) {
      try {
        // Handle glob patterns
        if (filePattern.includes('*')) {
          const files = findFiles(componentPath, filePattern);
          
          for (const file of files) {
            console.log(`Removing file: ${path.relative(componentPath, file)}`);
            fs.unlinkSync(file);
          }
        } else {
          const filePath = path.join(componentPath, filePattern);
          
          if (fs.existsSync(filePath)) {
            console.log(`Removing file: ${filePattern}`);
            fs.unlinkSync(filePath);
          }
        }
      } catch (error) {
        console.error(`Error removing file pattern ${filePattern}:`, error.message);
      }
    }
  }
  
  // Try to run component-specific clean script if it exists
  const packageJsonPath = path.join(componentPath, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (packageJson.scripts && packageJson.scripts.clean) {
        console.log(`Running ${component} clean script...`);
        await runCommand('npm', ['run', 'clean'], componentPath);
      }
    } catch (error) {
      console.error(`Error running ${component} clean script:`, error.message);
    }
  }
}

/**
 * Run a command in a specific directory
 */
async function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { cwd });
    
    process.stdout.on('data', (data) => {
      console.log(data.toString().trim());
    });
    
    process.stderr.on('data', (data) => {
      console.error(data.toString().trim());
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    process.on('error', reject);
  });
}

/**
 * Remove a directory recursively
 */
async function removeDirRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const curPath = path.join(dirPath, file);
      
      if (fs.lstatSync(curPath).isDirectory()) {
        // Recursive call for directories
        await removeDirRecursive(curPath);
      } else {
        // Delete file
        fs.unlinkSync(curPath);
      }
    }
    
    // Delete directory
    fs.rmdirSync(dirPath);
  }
}

/**
 * Find files matching a glob pattern
 */
function findFiles(dir, pattern) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and other common directories
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...findFiles(fullPath, pattern));
      }
    } else if (matchesPattern(entry.name, pattern)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Check if a filename matches a glob pattern
 */
function matchesPattern(filename, pattern) {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*/g, '.*');
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filename);
}

// Execute the main function
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});