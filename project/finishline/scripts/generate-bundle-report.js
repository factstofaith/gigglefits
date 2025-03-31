/**
 * Bundle Analysis Report Generator
 * 
 * Generates a comprehensive report from webpack bundle analyzer stats
 * with optimization recommendations.
 */

const fs = require('fs');
const path = require('path');
const { BundleAnalyzer } = require('../src/utils/bundleAnalyzer');

// Constants
const REPORTS_DIR = path.resolve(__dirname, '../bundle-reports');
const STATS_FILE = path.join(REPORTS_DIR, `stats-${new Date().toISOString().split('T')[0]}.json`);
const REPORT_FILE = path.join(REPORTS_DIR, `optimization-report-${new Date().toISOString().split('T')[0]}.md`);

// Ensure the reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Check if stats file exists
if (!fs.existsSync(STATS_FILE)) {
  console.error(`Stats file not found: ${STATS_FILE}`);
  console.error('Run "npm run analyze" first to generate the stats file.');
  process.exit(1);
}

// Load the stats file
const stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));

// Format the stats into module data
function formatModules(modules, parentPath = '') {
  return modules.map(module => {
    const name = module.name || 'Unknown';
    const path = `${parentPath}/${name}`;
    
    return {
      name,
      path,
      size: module.size || 0,
      gzipSize: Math.round(module.size * 0.3), // Approximate gzip size
      children: module.modules ? formatModules(module.modules, path) : [],
    };
  });
}

// Generate the module data
const moduleData = formatModules(stats.modules || []);

// Create a new bundle analyzer
const analyzer = new BundleAnalyzer();
analyzer.loadModuleData(moduleData);

// Generate the report
const report = analyzer.generateSummaryReport();

// Add custom sections to the report
let fullReport = report;

// Add dependency version conflicts section if available
if (stats.errors && stats.errors.length > 0) {
  fullReport += `\n## Build Errors\n\n`;
  stats.errors.forEach(error => {
    fullReport += `- ${error}\n`;
  });
}

// Add performance hints
fullReport += `\n## Performance Optimization Checklist\n\n`;
fullReport += `- [ ] **Split vendor code**: Separate vendor code into a dedicated chunk\n`;
fullReport += `- [ ] **Route-based code splitting**: Implement lazy loading for routes\n`;
fullReport += `- [ ] **Component-level code splitting**: Lazy load heavy components\n`;
fullReport += `- [ ] **Tree shaking verification**: Ensure unused exports are removed\n`;
fullReport += `- [ ] **Dependency optimization**: Replace heavy libraries with lighter alternatives\n`;
fullReport += `- [ ] **Image optimization**: Compress images and use WebP format\n`;
fullReport += `- [ ] **CSS optimization**: Remove unused CSS and minimize\n`;
fullReport += `- [ ] **Font optimization**: Use font-display and subset fonts\n`;
fullReport += `- [ ] **Runtime optimization**: Implement React memo and useMemo\n`;
fullReport += `- [ ] **Server-side rendering**: Consider SSR for initial page load\n`;

// Add React-specific optimization section
fullReport += `\n## React-Specific Optimizations\n\n`;
fullReport += `1. **React.memo for Pure Components**\n`;
fullReport += `   Use React.memo for components that render often with the same props\n`;
fullReport += `2. **useCallback for Event Handlers**\n`;
fullReport += `   Memoize event handlers to prevent unnecessary re-renders\n`;
fullReport += `3. **useMemo for Expensive Calculations**\n`;
fullReport += `   Memoize complex calculations to prevent recomputation\n`;
fullReport += `4. **Virtual List for Long Lists**\n`;
fullReport += `   Use virtualization for long lists (react-window or react-virtualized)\n`;
fullReport += `5. **Avoid Anonymous Functions in JSX**\n`;
fullReport += `   Define handlers outside render to prevent new function creation\n`;
fullReport += `6. **Use Fragment Instead of Div**\n`;
fullReport += `   Reduce DOM nodes by using React.Fragment\n`;
fullReport += `7. **Lazy Load Components**\n`;
fullReport += `   Use React.lazy and Suspense for code splitting\n`;
fullReport += `8. **Avoid Prop Drilling**\n`;
fullReport += `   Use Context API for deeply nested props\n`;

// Add a bundle size reduction plan
fullReport += `\n## Bundle Size Reduction Plan\n\n`;
fullReport += `### Immediate Actions\n`;
fullReport += `1. Implement code splitting for routes using React.lazy\n`;
fullReport += `2. Extract vendor modules into a separate chunk\n`;
fullReport += `3. Replace moment.js with date-fns (smaller footprint)\n`;
fullReport += `4. Remove unused dependencies\n`;
fullReport += `5. Use dynamic imports for large components that aren't needed immediately\n\n`;

fullReport += `### Medium-term Actions\n`;
fullReport += `1. Optimize image assets (compress, resize, use WebP)\n`;
fullReport += `2. Implement a CSS-in-JS solution with better tree-shaking\n`;
fullReport += `3. Create a performance budget and enforce with webpack\n`;
fullReport += `4. Set up automated performance monitoring\n`;
fullReport += `5. Audit third-party dependencies regularly\n\n`;

fullReport += `### Long-term Strategy\n`;
fullReport += `1. Consider server-side rendering for initial page load\n`;
fullReport += `2. Implement module federation for micro-frontend architecture\n`;
fullReport += `3. Create a custom build for each target platform\n`;
fullReport += `4. Optimize critical rendering path\n`;
fullReport += `5. Set up automated performance regression testing\n`;

// Write the report to file
fs.writeFileSync(REPORT_FILE, fullReport);

console.log(`Bundle analysis report generated: ${REPORT_FILE}`);

// Extract key metrics for the console output
const largeModules = moduleData
  .sort((a, b) => b.size - a.size)
  .slice(0, 5);

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

console.log('\nTop 5 largest modules:');
largeModules.forEach((module, index) => {
  console.log(`${index + 1}. ${module.name}: ${formatBytes(module.size)}`);
});