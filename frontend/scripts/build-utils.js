/**
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
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

/**
 * Print build asset statistics
 * @param {string} buildDir - Path to the build directory
 */
async function printBuildStats(buildDir) {
  console.log(chalk.bold('\nBuild statistics:'));
  
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
    
    console.log(chalk.cyan(`${type.toUpperCase().padEnd(6)} (${assets[type].count}):`), 
                chalk.yellow(formatFileSize(assets[type].size)));
    
    // Print largest files of each type
    assets[type].files.sort((a, b) => b.size - a.size);
    const largestFiles = assets[type].files.slice(0, 3);
    
    for (const file of largestFiles) {
      console.log(`  - ${file.name}: ${formatFileSize(file.size)}`);
    }
  }
  
  console.log(chalk.bold('\nTotal build size:'), chalk.yellow(formatFileSize(totalSize)));
  
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
  
  console.log(chalk.bold('\nVerifying build:'));
  
  for (const file of requiredFiles) {
    const filePath = path.join(buildDir, file);
    const exists = fs.existsSync(filePath);
    
    if (exists) {
      console.log(chalk.green('✓'), `${file} exists`);
    } else {
      console.log(chalk.red('✗'), `${file} missing`);
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
  
  console.log(chalk.bold('\nBuild report created:'), reportFilePath);
}

module.exports = {
  formatFileSize,
  printBuildStats,
  verifyBuild,
  createBuildReport,
};
