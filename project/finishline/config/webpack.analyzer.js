/**
 * Webpack Bundle Analyzer Configuration
 * 
 * This webpack configuration extends the production config with 
 * bundle analysis tools.
 */

const { merge } = require('webpack-merge');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const prodConfig = require('./webpack.prod');
const path = require('path');
const fs = require('fs');

// Ensure reports directory exists
const reportsDir = path.resolve(__dirname, '../bundle-reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Get current date for report filenames
const currentDate = new Date().toISOString().split('T')[0];

module.exports = merge(prodConfig, {
  plugins: [
    // Bundle Analyzer - visualizes bundle content
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: path.join(reportsDir, `bundle-report-${currentDate}.html`),
      openAnalyzer: false,
      generateStatsFile: true,
      statsFilename: path.join(reportsDir, `stats-${currentDate}.json`),
      defaultSizes: 'gzip',
    }),
    
    // Duplicate Package Checker - finds duplicate dependencies
    new DuplicatePackageCheckerPlugin({
      verbose: true,
      emitError: false,
      showHelp: true,
      exclude: [
        // Packages that are safe to have multiple versions
        // Add any known safe packages here
      ],
    }),
  ],
  
  // Output more detailed stats
  stats: {
    colors: true,
    chunks: true,
    modules: true,
    reasons: true,
    moduleTrace: true,
    errorDetails: true,
    performance: true,
    warnings: true,
  },
  
  // Enable profile analysis
  profile: true,
  
  // Increase performance tracking
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
});

/**
 * Custom webpack plugin to generate bundle optimization recommendations
 */
class BundleOptimizationReportPlugin {
  constructor(options = {}) {
    this.options = {
      outputFile: path.join(reportsDir, `optimization-report-${currentDate}.md`),
      ...options,
    };
  }
  
  apply(compiler) {
    // Called after compilation finishes
    compiler.hooks.done.tap('BundleOptimizationReportPlugin', stats => {
      const json = stats.toJson({
        chunks: true,
        modules: true,
        assets: true,
      });
      
      // Get all modules sorted by size
      const modules = json.modules
        .filter(m => !m.name.includes('node_modules'))
        .sort((a, b) => b.size - a.size);
      
      // Get chunks information
      const chunks = json.chunks.map(chunk => ({
        id: chunk.id,
        entry: chunk.entry,
        initial: chunk.initial,
        names: chunk.names,
        size: chunk.size,
        files: chunk.files,
      }));
      
      // Generate the report content
      let report = `# Bundle Optimization Report\n\n`;
      report += `Generated on: ${new Date().toLocaleString()}\n\n`;
      
      // Asset sizes section
      report += `## Asset Sizes\n\n`;
      report += `| Asset | Size | Gzipped Size |\n`;
      report += `| ----- | ---- | ------------ |\n`;
      
      json.assets.forEach(asset => {
        const prettySize = this.prettyBytes(asset.size);
        const gzipSize = this.prettyBytes(Math.round(asset.size * 0.3)); // Approximate gzip size
        report += `| ${asset.name} | ${prettySize} | ~${gzipSize} |\n`;
      });
      
      // Largest modules section
      report += `\n## Largest Modules (Excluding node_modules)\n\n`;
      report += `| Module | Size |\n`;
      report += `| ------ | ---- |\n`;
      
      modules.slice(0, 20).forEach(module => {
        const prettySize = this.prettyBytes(module.size);
        const name = module.name.replace(/^\.\//, '');
        report += `| ${name} | ${prettySize} |\n`;
      });
      
      // Optimization recommendations
      report += `\n## Optimization Recommendations\n\n`;
      
      // Large assets warning
      const largeAssets = json.assets.filter(a => a.size > 250000);
      if (largeAssets.length > 0) {
        report += `### Large Assets Detected\n\n`;
        report += `The following assets are larger than recommended (250KB):\n\n`;
        largeAssets.forEach(asset => {
          report += `- **${asset.name}**: ${this.prettyBytes(asset.size)}\n`;
        });
        report += `\nConsider implementing code splitting or lazy loading to reduce initial load size.\n\n`;
      }
      
      // Many chunks warning
      if (chunks.length > 15) {
        report += `### Too Many Chunks\n\n`;
        report += `Your bundle has ${chunks.length} chunks, which could lead to too many HTTP requests.\n`;
        report += `Consider reviewing your code splitting strategy to find a better balance.\n\n`;
      }
      
      // General optimization tips
      report += `### General Optimization Tips\n\n`;
      report += `1. **Tree Shaking**: Ensure all imports are specific rather than importing whole libraries\n`;
      report += `2. **Code Splitting**: Use React.lazy() and dynamic imports for route-based splitting\n`;
      report += `3. **Dependency Management**: Review large dependencies for alternatives or optimizations\n`;
      report += `4. **Image Optimization**: Compress images and consider using webp format where supported\n`;
      report += `5. **Caching Strategy**: Implement proper hashing for long-term caching\n`;
      
      // Write the report to file
      fs.writeFileSync(this.options.outputFile, report);
      console.log(`\nBundle optimization report written to ${this.options.outputFile}`);
    });
  }
  
  prettyBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

// Add the custom plugin
module.exports.plugins.push(new BundleOptimizationReportPlugin());