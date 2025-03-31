/**
 * Bundle Size Reporting Script
 * 
 * Analyzes the built bundles and reports their sizes with recommendations
 * for optimization. Useful for CI/CD pipelines and local development.
 */

const fs = require('fs');
const path = require('path');
const filesize = require('filesize');
const chalk = require('chalk') || { green: (s) => s, yellow: (s) => s, red: (s) => s, bold: (s) => s };

const DIST_DIR = path.resolve(__dirname, '../dist');
const SIZE_LIMITS = {
  totalBundle: 500 * 1024, // 500KB total bundle size limit
  mainChunk: 200 * 1024,   // 200KB main chunk size limit
  anyChunk: 100 * 1024,    // 100KB any individual chunk size limit
};

// Check if dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  console.error('Error: dist directory does not exist. Run build first.');
  process.exit(1);
}

// Get all files in the dist directory (recursively)
function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      getFiles(filePath, fileList);
    } else {
      fileList.push({
        path: filePath,
        name: path.relative(DIST_DIR, filePath),
        size: stats.size,
      });
    }
  });
  
  return fileList;
}

// Get all built assets
const allFiles = getFiles(DIST_DIR);

// Filter JavaScript files
const jsFiles = allFiles.filter(file => file.name.endsWith('.js'));
const cssFiles = allFiles.filter(file => file.name.endsWith('.css'));
const imageFiles = allFiles.filter(file => /\.(png|jpe?g|gif|svg|webp)$/.test(file.name));

// Sort files by size (largest first)
jsFiles.sort((a, b) => b.size - a.size);
cssFiles.sort((a, b) => b.size - a.size);
imageFiles.sort((a, b) => b.size - a.size);

// Calculate total bundle size
const totalJsSize = jsFiles.reduce((sum, file) => sum + file.size, 0);
const totalCssSize = cssFiles.reduce((sum, file) => sum + file.size, 0);
const totalAssetSize = totalJsSize + totalCssSize;

// Function to colorize sizes based on thresholds
function colorizeSize(size, warning, error) {
  if (size > error) return chalk.red(filesize(size));
  if (size > warning) return chalk.yellow(filesize(size));
  return chalk.green(filesize(size));
}

// Print the report
console.log('\n' + chalk.bold('===== Bundle Size Report ====='));
console.log('\nTotal JS Size:', colorizeSize(totalJsSize, SIZE_LIMITS.totalBundle * 0.8, SIZE_LIMITS.totalBundle));
console.log('Total CSS Size:', colorizeSize(totalCssSize, 50 * 1024, 100 * 1024));
console.log('Total Bundle Size:', colorizeSize(totalAssetSize, SIZE_LIMITS.totalBundle * 0.8, SIZE_LIMITS.totalBundle));

// Print JavaScript chunks
console.log('\n' + chalk.bold('JavaScript Chunks:'));
jsFiles.forEach(file => {
  console.log(
    ` - ${file.name}: ${colorizeSize(file.size, SIZE_LIMITS.anyChunk * 0.8, SIZE_LIMITS.anyChunk)}`
  );
});

// Print CSS files
if (cssFiles.length > 0) {
  console.log('\n' + chalk.bold('CSS Files:'));
  cssFiles.forEach(file => {
    console.log(
      ` - ${file.name}: ${colorizeSize(file.size, 40 * 1024, 80 * 1024)}`
    );
  });
}

// Print largest images
if (imageFiles.length > 0) {
  console.log('\n' + chalk.bold('Largest Images:'));
  imageFiles.slice(0, 5).forEach(file => {
    console.log(
      ` - ${file.name}: ${colorizeSize(file.size, 100 * 1024, 200 * 1024)}`
    );
  });
}

// Check for oversized bundles and provide recommendations
const oversizedChunks = jsFiles.filter(file => file.size > SIZE_LIMITS.anyChunk);
const isMainBundleTooLarge = jsFiles.length > 0 && jsFiles[0].size > SIZE_LIMITS.mainChunk;
const isTotalBundleTooLarge = totalAssetSize > SIZE_LIMITS.totalBundle;

if (oversizedChunks.length > 0 || isMainBundleTooLarge || isTotalBundleTooLarge) {
  console.log('\n' + chalk.bold.yellow('⚠️ Optimization Recommendations:'));
  
  if (isMainBundleTooLarge) {
    console.log(chalk.yellow(` - Main bundle (${jsFiles[0].name}) exceeds recommended size of ${filesize(SIZE_LIMITS.mainChunk)}`));
    console.log('   ➔ Consider implementing code splitting with dynamic imports');
    console.log('   ➔ Consider moving vendor code to separate chunks');
  }
  
  if (oversizedChunks.length > 0) {
    console.log(chalk.yellow(` - ${oversizedChunks.length} chunks exceed recommended size of ${filesize(SIZE_LIMITS.anyChunk)}:`));
    oversizedChunks.forEach(chunk => {
      console.log(`     - ${chunk.name}: ${filesize(chunk.size)}`);
    });
    console.log('   ➔ Review these chunks for unused dependencies');
    console.log('   ➔ Consider further splitting large components');
  }
  
  if (isTotalBundleTooLarge) {
    console.log(chalk.yellow(` - Total bundle size (${filesize(totalAssetSize)}) exceeds recommended ${filesize(SIZE_LIMITS.totalBundle)}`));
    console.log('   ➔ Run "npm run analyze" to identify largest dependencies');
    console.log('   ➔ Consider implementing lazy loading for routes');
    console.log('   ➔ Check for duplicate dependencies with "npm run analyze:dependencies"');
  }
  
  // Create detailed report file
  const reportPath = path.resolve(__dirname, '../bundle-reports/size-report.md');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  let report = '# Bundle Size Report\n\n';
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  report += '## Summary\n\n';
  report += `| Metric | Size | Status |\n`;
  report += `| ------ | ---- | ------ |\n`;
  report += `| Total JS Size | ${filesize(totalJsSize)} | ${totalJsSize > SIZE_LIMITS.totalBundle ? '❌' : '✅'} |\n`;
  report += `| Total CSS Size | ${filesize(totalCssSize)} | ${totalCssSize > 100 * 1024 ? '❌' : '✅'} |\n`;
  report += `| Total Bundle Size | ${filesize(totalAssetSize)} | ${isTotalBundleTooLarge ? '❌' : '✅'} |\n\n`;
  
  report += '## JavaScript Chunks\n\n';
  report += `| File | Size | Status |\n`;
  report += `| ---- | ---- | ------ |\n`;
  
  jsFiles.forEach(file => {
    const isOversize = file.size > SIZE_LIMITS.anyChunk;
    const isMainOversize = file.name.includes('main') && file.size > SIZE_LIMITS.mainChunk;
    report += `| ${file.name} | ${filesize(file.size)} | ${isOversize || isMainOversize ? '❌' : '✅'} |\n`;
  });
  
  report += '\n## Recommendations\n\n';
  
  if (isMainBundleTooLarge) {
    report += `- **Main bundle is too large**: The main entry point exceeds ${filesize(SIZE_LIMITS.mainChunk)}\n`;
    report += `  - Implement code splitting with React.lazy() and dynamic imports\n`;
    report += `  - Move vendor code to separate chunks using webpack optimization\n\n`;
  }
  
  if (oversizedChunks.length > 0) {
    report += `- **Large chunks detected**: ${oversizedChunks.length} chunks exceed recommended size\n`;
    oversizedChunks.forEach(chunk => {
      report += `  - ${chunk.name}: ${filesize(chunk.size)}\n`;
    });
    report += `  - Review these chunks for unused dependencies\n`;
    report += `  - Consider splitting large components further\n\n`;
  }
  
  if (isTotalBundleTooLarge) {
    report += `- **Total bundle too large**: Bundle size (${filesize(totalAssetSize)}) exceeds recommended ${filesize(SIZE_LIMITS.totalBundle)}\n`;
    report += `  - Run bundle analyzer to identify largest dependencies\n`;
    report += `  - Implement lazy loading for routes and features\n`;
    report += `  - Check for and eliminate duplicate dependencies\n\n`;
  }
  
  report += '## Next Steps\n\n';
  report += '1. Run `npm run analyze` to get a detailed breakdown of bundle contents\n';
  report += '2. Check for duplicate dependencies with `npm run analyze:dependencies`\n';
  report += '3. Implement code splitting for routes and large components\n';
  report += '4. Consider replacing large dependencies with smaller alternatives\n';
  
  fs.writeFileSync(reportPath, report);
  console.log(`\nDetailed report saved to: ${reportPath}`);
} else {
  console.log('\n' + chalk.bold.green('✅ All bundle size checks passed!'));
}

// Exit with error code if bundle is too large (useful for CI/CD)
if (isTotalBundleTooLarge) {
  process.exit(1);
}

console.log('\n' + chalk.bold('=============================\n'));