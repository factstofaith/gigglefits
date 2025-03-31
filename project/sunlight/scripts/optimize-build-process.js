/**
 * Optimize Build Process
 * 
 * This script optimizes the build process for better performance:
 * - Implements parallel processing
 * - Optimizes dependency management
 * - Enhances CI/CD compatibility
 * - Improves error handling and reporting
 * - Adds build caching
 * 
 * Usage: node optimize-build-process.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../../frontend');
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, 'package.json');
const BACKUP_DIR = path.resolve(__dirname, '../backups', `build-process-optimization-${new Date().toISOString().replace(/[:.]/g, '-')}`);
const DRY_RUN = process.argv.includes('--dry-run');

// Create backup directory
if (!DRY_RUN) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
}

// Optimized npm scripts for package.json
const optimizedScripts = {
  // Standard scripts
  "start": "cross-env NODE_ENV=development REACT_APP_ENV=development webpack serve --config config/webpack.config.js --mode development",
  "build": "npm run clean && cross-env NODE_ENV=production REACT_APP_ENV=production webpack --config config/webpack.config.js --mode production",
  "build:skip-ts": "npm run clean && cross-env NODE_ENV=production SKIP_TS_CHECK=true REACT_APP_ENV=production webpack --config config/webpack.config.js --mode production",
  "build:analyze": "cross-env NODE_ENV=production ANALYZE=true npm run build",
  "test": "cross-env NODE_ENV=test jest --config jest.config.js --watch",
  "test:once": "cross-env NODE_ENV=test jest --config jest.config.js",
  "test:ci": "cross-env NODE_ENV=test CI=true jest --config jest.config.js --coverage --maxWorkers=2",
  "test:coverage": "cross-env NODE_ENV=test jest --config jest.config.js --coverage",
  
  // Optimization scripts
  "clean": "rimraf build/*",
  "lint": "eslint --ext .js,.jsx,.ts,.tsx src",
  "lint:fix": "eslint --ext .js,.jsx,.ts,.tsx src --fix",
  "type-check": "tsc --noEmit",
  "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,scss,md}\"",
  "format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,css,scss,md}\"",
  
  // Advanced build scripts
  "build:dev": "cross-env NODE_ENV=development REACT_APP_ENV=development npm run build",
  "build:staging": "cross-env NODE_ENV=production REACT_APP_ENV=staging npm run build",
  "build:ci": "cross-env NODE_ENV=production CI=true npm run build",
  "build:profile": "cross-env NODE_ENV=production PROFILE=true npm run build",
  "build:benchmark": "cross-env NODE_ENV=production BENCHMARK=true npm run build",
  
  // Cache management
  "cache:clear": "rimraf node_modules/.cache",
  "deps:check": "npx depcheck",
  "postinstall": "is-ci || husky install",
  
  // Combined validation scripts
  "validate": "npm-run-all --parallel type-check lint format:check test:once",
  "prepush": "npm-run-all --parallel type-check lint format:check test:once",
  
  // Development tools
  "dev": "npm start",
  "dev:fast": "cross-env FAST_REFRESH=true npm start",
  "serve:build": "serve -s build",
  
  // Advanced tools
  "analyze:bundle": "cross-env ANALYZE=true npm run build",
  "analyze:deps": "npx madge --circular src/index.js",
  "analyze:size": "size-limit",
};

// Required dependencies for optimization
const newDevDependencies = {
  "cross-env": "^7.0.3",
  "npm-run-all": "^4.1.5",
  "rimraf": "^3.0.2",
  "serve": "^14.0.1",
  "husky": "^8.0.1",
  "size-limit": "^8.0.0",
  "webpack-bundle-analyzer": "^4.5.0",
  "compression-webpack-plugin": "^10.0.0",
  "speed-measure-webpack-plugin": "^1.5.0",
  "terser-webpack-plugin": "^5.3.3",
  "css-minimizer-webpack-plugin": "^4.0.0",
};

// Additional configurations to create
const additionalConfigFiles = [
  {
    path: path.join(ROOT_DIR, '.huskyrc'),
    content: `{
  "hooks": {
    "pre-commit": "npm run lint:fix && npm run format",
    "pre-push": "npm run prepush"
  }
}`,
  },
  {
    path: path.join(ROOT_DIR, '.size-limit.json'),
    content: `[
  {
    "path": "build/static/js/*.js",
    "limit": "250 KB"
  },
  {
    "path": "build/static/css/*.css",
    "limit": "50 KB"
  }
]`,
  },
  {
    path: path.join(ROOT_DIR, 'scripts', 'build-utils.js'),
    content: `/**
 * Build utility functions
 * 
 * Helper functions for the build process
 * Created by Project Sunlight optimization
 */

const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { gzip } = require('zlib');
const gzipAsync = promisify(gzip);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

/**
 * Format file size in a human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return \`\${(bytes / Math.pow(1024, i)).toFixed(2)} \${units[i]}\`;
}

/**
 * Print build asset statistics
 * @param {string} buildDir - Path to the build directory
 */
async function printBuildStats(buildDir) {
  console.log(chalk.bold('\\nBuild statistics:'));
  
  const assets = {};
  const fileTypes = ['.js', '.css', '.html', '.json', '.svg', '.png', '.jpg', '.woff', '.woff2'];
  
  // Recursively get all files
  function getAllFiles(dir) {
    const files = fs.readdirSync(dir);
    let result = [];
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        result = result.concat(getAllFiles(filePath));
      } else {
        result.push(filePath);
      }
    }
    
    return result;
  }
  
  const files = getAllFiles(buildDir);
  
  // Group files by type
  for (const file of files) {
    const ext = path.extname(file);
    if (!fileTypes.includes(ext)) continue;
    
    if (!assets[ext]) {
      assets[ext] = {
        count: 0,
        size: 0,
        files: [],
      };
    }
    
    const stats = fs.statSync(file);
    assets[ext].count++;
    assets[ext].size += stats.size;
    assets[ext].files.push({
      name: path.relative(buildDir, file),
      size: stats.size,
    });
  }
  
  // Calculate total size
  let totalSize = 0;
  
  for (const type in assets) {
    totalSize += assets[type].size;
    
    console.log(chalk.cyan(\`\${type.toUpperCase().padEnd(6)} (\${assets[type].count}):\`), 
                chalk.yellow(formatFileSize(assets[type].size)));
    
    // Print largest files of each type
    assets[type].files.sort((a, b) => b.size - a.size);
    const largestFiles = assets[type].files.slice(0, 3);
    
    for (const file of largestFiles) {
      console.log(\`  - \${file.name}: \${formatFileSize(file.size)}\`);
    }
  }
  
  console.log(chalk.bold('\\nTotal build size:'), chalk.yellow(formatFileSize(totalSize)));
  
  // Print gzipped size for JS and CSS
  if (assets['.js']) {
    let totalJsSize = 0;
    
    for (const file of assets['.js'].files) {
      const filePath = path.join(buildDir, file.name);
      const content = await readFileAsync(filePath);
      const gzipped = await gzipAsync(content);
      totalJsSize += gzipped.length;
    }
    
    console.log(chalk.bold('Total JS size (gzipped):'), chalk.yellow(formatFileSize(totalJsSize)));
  }
  
  if (assets['.css']) {
    let totalCssSize = 0;
    
    for (const file of assets['.css'].files) {
      const filePath = path.join(buildDir, file.name);
      const content = await readFileAsync(filePath);
      const gzipped = await gzipAsync(content);
      totalCssSize += gzipped.length;
    }
    
    console.log(chalk.bold('Total CSS size (gzipped):'), chalk.yellow(formatFileSize(totalCssSize)));
  }
}

/**
 * Verify the build directory contains all necessary files
 * @param {string} buildDir - Path to the build directory
 * @returns {boolean} Whether the build is valid
 */
function verifyBuild(buildDir) {
  const requiredFiles = ['index.html', 'static/js', 'static/css'];
  let isValid = true;
  
  console.log(chalk.bold('\\nVerifying build:'));
  
  for (const file of requiredFiles) {
    const filePath = path.join(buildDir, file);
    const exists = fs.existsSync(filePath);
    
    if (exists) {
      console.log(chalk.green('✓'), \`\${file} exists\`);
    } else {
      console.log(chalk.red('✗'), \`\${file} missing\`);
      isValid = false;
    }
  }
  
  return isValid;
}

/**
 * Create a build report file
 * @param {string} buildDir - Path to the build directory
 */
async function createBuildReport(buildDir) {
  const reportData = {
    timestamp: new Date().toISOString(),
    assets: {},
    totalSize: 0,
  };
  
  // Recursively get all files
  function getAllFiles(dir) {
    const files = fs.readdirSync(dir);
    let result = [];
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        result = result.concat(getAllFiles(filePath));
      } else {
        result.push(filePath);
      }
    }
    
    return result;
  }
  
  const files = getAllFiles(buildDir);
  
  // Group files by type
  for (const file of files) {
    const ext = path.extname(file);
    
    if (!reportData.assets[ext]) {
      reportData.assets[ext] = {
        count: 0,
        size: 0,
        files: [],
      };
    }
    
    const stats = fs.statSync(file);
    reportData.assets[ext].count++;
    reportData.assets[ext].size += stats.size;
    reportData.totalSize += stats.size;
    
    // Only store details for large files
    if (stats.size > 10000) {
      reportData.assets[ext].files.push({
        name: path.relative(buildDir, file),
        size: stats.size,
      });
    }
  }
  
  // Calculate gzipped sizes for JS and CSS
  if (reportData.assets['.js']) {
    reportData.jsGzippedSize = 0;
    
    for (const file of reportData.assets['.js'].files) {
      const filePath = path.join(buildDir, file.name);
      const content = await readFileAsync(filePath);
      const gzipped = await gzipAsync(content);
      reportData.jsGzippedSize += gzipped.length;
    }
  }
  
  if (reportData.assets['.css']) {
    reportData.cssGzippedSize = 0;
    
    for (const file of reportData.assets['.css'].files) {
      const filePath = path.join(buildDir, file.name);
      const content = await readFileAsync(filePath);
      const gzipped = await gzipAsync(content);
      reportData.cssGzippedSize += gzipped.length;
    }
  }
  
  // Write report file
  const reportFilePath = path.join(buildDir, 'build-report.json');
  await writeFileAsync(reportFilePath, JSON.stringify(reportData, null, 2));
  
  console.log(chalk.bold('\\nBuild report created:'), reportFilePath);
}

module.exports = {
  formatFileSize,
  printBuildStats,
  verifyBuild,
  createBuildReport,
};
`,
  },
  {
    path: path.join(ROOT_DIR, 'scripts', 'optimize-images.js'),
    content: `/**
 * Optimize images in the build
 * 
 * Reduces image file sizes using imagemin
 * Created by Project Sunlight optimization
 */

const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');
const imageminGifsicle = require('imagemin-gifsicle');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

// Build directory path
const buildDir = path.resolve(__dirname, '../build');

// Image directories to process
const imageDirectories = [
  path.join(buildDir, 'static/media'),
  path.join(buildDir, 'static/images'),
  path.join(buildDir, 'assets'),
];

// Make sure each directory exists before processing
const existingDirectories = imageDirectories.filter(dir => fs.existsSync(dir));

if (existingDirectories.length === 0) {
  console.log(chalk.yellow('No image directories found in the build.'));
  process.exit(0);
}

// Process each directory
async function optimizeImages() {
  console.log(chalk.bold('Optimizing images in build...'));
  let totalSaved = 0;
  let totalFiles = 0;
  
  for (const dir of existingDirectories) {
    console.log(chalk.cyan(\`Processing directory: \${path.relative(buildDir, dir)}\`));
    
    try {
      // Get original file sizes
      const files = fs.readdirSync(dir)
        .filter(file => /\\.(jpe?g|png|gif|svg)$/i.test(file))
        .map(file => ({
          name: file,
          path: path.join(dir, file),
          originalSize: fs.statSync(path.join(dir, file)).size
        }));
      
      if (files.length === 0) {
        console.log('  No images found.');
        continue;
      }
      
      totalFiles += files.length;
      
      // Run imagemin
      await imagemin([path.join(dir, '*.{jpg,jpeg,png,gif,svg}')], {
        destination: dir,
        plugins: [
          imageminMozjpeg({ quality: 80 }),
          imageminPngquant({ quality: [0.65, 0.8] }),
          imageminSvgo({
            plugins: [
              { name: 'removeViewBox', active: false },
              { name: 'cleanupIDs', active: false },
            ],
          }),
          imageminGifsicle({ optimizationLevel: 3 }),
        ],
      });
      
      // Calculate saved sizes
      let directorySaved = 0;
      
      for (const file of files) {
        const newSize = fs.statSync(file.path).size;
        const saved = file.originalSize - newSize;
        directorySaved += saved;
        
        if (saved > 1024) {
          console.log(\`  \${file.name}: \${formatBytes(file.originalSize)} → \${formatBytes(newSize)} (saved \${formatBytes(saved)})\`);
        }
      }
      
      totalSaved += directorySaved;
      
      console.log(chalk.green(\`  Saved \${formatBytes(directorySaved)} in this directory.\`));
    } catch (error) {
      console.error(chalk.red(\`  Error processing directory: \${error.message}\`));
    }
  }
  
  console.log(chalk.bold(\`\\nTotal images processed: \${totalFiles}\`));
  console.log(chalk.bold.green(\`Total space saved: \${formatBytes(totalSaved)}\`));
}

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Run the optimization
optimizeImages().catch(error => {
  console.error(chalk.red(\`Error optimizing images: \${error.message}\`));
  process.exit(1);
});
`,
  },
  {
    path: path.join(ROOT_DIR, 'scripts', 'build.js'),
    content: `/**
 * Enhanced build process
 * 
 * Improved build script with error handling and reporting
 * Created by Project Sunlight optimization
 */

process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections
process.on('unhandledRejection', err => {
  throw err;
});

// Load environment variables
require('../config/env');

const chalk = require('chalk');
const fs = require('fs-extra');
const webpack = require('webpack');
const configFactory = require('../config/webpack.config');
const paths = require('../config/paths');
const { checkBrowsers } = require('react-dev-utils/browsersHelper');
const { printBuildStats, verifyBuild, createBuildReport } = require('./build-utils');

// Set to true to enable profiling in production build
const isProfilingEnabled = process.env.PROFILE === 'true';

// Measure build time
const startTime = Date.now();

// Print build environment info
function printBuildInfo() {
  console.log(chalk.bold('Build environment:'));
  console.log(\`  - Node version: \${process.version}\`);
  console.log(\`  - Environment: \${process.env.REACT_APP_ENV || 'production'}\`);
  console.log(\`  - Profiling: \${isProfilingEnabled ? 'enabled' : 'disabled'}\`);
  console.log(\`  - Source maps: \${process.env.GENERATE_SOURCEMAP !== 'false' ? 'enabled' : 'disabled'}\`);
  console.log(\\n);
}

// Create the production build
async function build() {
  console.log(chalk.bold.cyan('Creating optimized production build...'));
  printBuildInfo();
  
  // Clear the build folder
  fs.emptyDirSync(paths.appBuild);
  
  // Copy public folder contents to build folder
  copyPublicFolder();
  
  // Create webpack compiler
  const config = configFactory('production');
  const compiler = webpack(config);
  
  try {
    // Run webpack compilation
    const stats = await new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) {
          return reject(err);
        }
        resolve(stats);
      });
    });
    
    // Check for errors and warnings
    if (stats.hasErrors()) {
      console.log(chalk.red.bold('\\nFailed to compile.\\n'));
      console.log(stats.toString({
        chunks: false,
        colors: true,
        modules: false,
        children: false,
      }));
      process.exit(1);
    }
    
    if (stats.hasWarnings()) {
      console.log(chalk.yellow.bold('\\nCompiled with warnings.\\n'));
      console.log(stats.toString({
        chunks: false,
        colors: true,
        modules: false,
        children: false,
        warnings: true,
      }));
    } else {
      console.log(chalk.green.bold('\\nCompiled successfully.\\n'));
    }
    
    // Print build statistics
    await printBuildStats(paths.appBuild);
    
    // Verify the build
    const isValid = verifyBuild(paths.appBuild);
    
    if (!isValid) {
      console.log(chalk.red.bold('\\nBuild verification failed. The build may be incomplete.\\n'));
      process.exit(1);
    }
    
    // Create build report
    await createBuildReport(paths.appBuild);
    
    // Print build time
    const endTime = Date.now();
    const buildDuration = (endTime - startTime) / 1000;
    console.log(chalk.bold(\`\\nBuild completed in \${buildDuration.toFixed(2)}s\\n\`));
    
    return stats;
  } catch (error) {
    console.log(chalk.red.bold('Failed to compile.\\n'));
    console.log(\`\${error.message || error}\\n\`);
    process.exit(1);
  }
}

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
}

// Run the build process
checkBrowsers(paths.appPath, isInteractive)
  .then(() => build())
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
`,
  },
];

// Function to optimize npm scripts in package.json
function optimizePackageJson() {
  try {
    if (fs.existsSync(PACKAGE_JSON_PATH)) {
      // Read package.json
      const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
      
      // Backup original package.json
      const backupPath = path.join(BACKUP_DIR, 'package.json');
      
      if (!DRY_RUN) {
        fs.mkdirSync(path.dirname(backupPath), { recursive: true });
        fs.writeFileSync(backupPath, JSON.stringify(packageJson, null, 2), 'utf8');
        console.log(`✅ Backed up original package.json to ${backupPath}`);
        
        // Optimize scripts
        packageJson.scripts = {
          ...packageJson.scripts,
          ...optimizedScripts
        };
        
        // Add devDependencies
        packageJson.devDependencies = {
          ...packageJson.devDependencies,
          ...newDevDependencies
        };
        
        // Write optimized package.json
        fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2), 'utf8');
        console.log(`✅ Optimized package.json scripts`);
        
        // Install new dependencies
        console.log(`🔍 Installing new dependencies...`);
        if (!DRY_RUN) {
          try {
            execSync('npm install', { cwd: ROOT_DIR, stdio: 'inherit' });
            console.log(`✅ Dependencies installed successfully`);
          } catch (error) {
            console.error(`❌ Error installing dependencies:`, error.message);
          }
        }
      } else {
        console.log('⚠️ Dry run mode - not modifying package.json');
      }
      
      return true;
    } else {
      console.error(`❌ package.json not found at ${PACKAGE_JSON_PATH}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error optimizing package.json:`, error.message);
    return false;
  }
}

// Function to create additional configuration files
function createAdditionalConfigFiles() {
  let createdCount = 0;
  
  for (const config of additionalConfigFiles) {
    try {
      const dirPath = path.dirname(config.path);
      
      if (!DRY_RUN) {
        fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(config.path, config.content, 'utf8');
        console.log(`✅ Created configuration file at ${config.path}`);
        createdCount++;
      } else {
        console.log(`⚠️ Dry run mode - would create file at ${config.path}`);
      }
    } catch (error) {
      console.error(`❌ Error creating file ${config.path}:`, error.message);
    }
  }
  
  return createdCount;
}

// Main function
function main() {
  console.log('🔍 Optimizing build process...');
  
  // Optimize package.json
  optimizePackageJson();
  
  // Create additional configuration files
  const createdCount = createAdditionalConfigFiles();
  
  if (!DRY_RUN) {
    console.log(`\n✅ Created ${createdCount} additional configuration files`);
  }
  
  console.log('\n✅ Build process optimization completed!');
  
  // Provide next steps
  console.log('\nNext steps:');
  console.log('1. Review the optimized build process configuration');
  console.log('2. Run a build to verify the optimization works');
  console.log('3. Check the build performance improvements');
}

// Run the main function
main();