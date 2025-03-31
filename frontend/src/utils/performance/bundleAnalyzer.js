/**
 * Bundle Analyzer and Optimization Tools
 * 
 * Utilities for analyzing and optimizing bundle size
 * with zero technical debt implementation.
 * 
 * @module utils/performance/bundleAnalyzer
 */

/**
 * Bundle size budgets by chunk type
 * These values represent target maximums in KB
 */
export const BUNDLE_SIZE_BUDGETS = {
  main: 250, // Main bundle
  vendor: 700, // Third-party dependencies
  route: 120, // Route-based chunks
  component: 50, // Component-based chunks
  lazy: 80, // Lazy-loaded chunks
  // Total app budget including all initial chunks
  total: {
    initial: 1000, // Initial load budget
    js: 2000, // Total JS budget
    css: 200, // Total CSS budget
    assets: 1500 // Total assets budget
  }
};

/**
 * A set of tracked module import sizes
 * @private
 */
const importSizes = {};

/**
 * A list of potentially problematic heavy imports
 * @private
 */
const heavyImports = [
  { name: '@material-ui/icons', warnSize: 50 },
  { name: '@material-ui/core', warnSize: 100 },
  { name: '@mui/material', warnSize: 100 },
  { name: '@mui/icons-material', warnSize: 50 },
  { name: 'moment', warnSize: 40 },
  { name: 'lodash', warnSize: 20 },
  { name: 'chart.js', warnSize: 80 },
  { name: 'react-virtualized', warnSize: 40 },
  { name: 'react-beautiful-dnd', warnSize: 30 },
  { name: 'react-datepicker', warnSize: 30 },
  { name: 'echarts', warnSize: 150 },
  { name: 'draft-js', warnSize: 100 },
  { name: 'react-chartjs-2', warnSize: 100 }
];

/**
 * Creates a module usage analysis based on the webpack stats
 * This helps identify large dependencies and unused code
 * 
 * @param {Object} stats - Webpack stats object
 * @returns {Object} Module usage analysis
 */
export const analyzeModuleUsage = (stats) => {
  if (!stats || !stats.modules) {
    return { error: 'Invalid stats object' };
  }
  
  const modules = stats.modules.map(module => ({
    name: module.name,
    size: module.size,
    chunks: module.chunks
  })).sort((a, b) => b.size - a.size);
  
  // Find the top 20 largest modules
  const largestModules = modules.slice(0, 20);
  
  // Group by package
  const packageSizes = modules.reduce((acc, module) => {
    // Extract package name from path
    const packageMatch = module.name.match(/[\\/]node_modules[\\/]((?:@[^/]+[\\/])?[^/]+)/);
    if (packageMatch) {
      const packageName = packageMatch[1];
      if (!acc[packageName]) {
        acc[packageName] = 0;
      }
      acc[packageName] += module.size;
    }
    return acc;
  }, {});
  
  // Convert to array and sort
  const packages = Object.entries(packageSizes)
    .map(([name, size]) => ({ name, size }))
    .sort((a, b) => b.size - a.size);
  
  // Calculate duplicate packages (often caused by multiple versions)
  const duplicates = findDuplicatePackages(modules);
  
  return {
    largestModules,
    packages,
    duplicates,
    totalSize: modules.reduce((sum, module) => sum + module.size, 0)
  };
};

/**
 * Find duplicate package versions in the bundle
 * 
 * @param {Array} modules - List of webpack modules
 * @returns {Array} List of duplicate packages
 */
const findDuplicatePackages = (modules) => {
  // Map to track package paths
  const packagePaths = {};
  
  // Find packages with multiple paths (likely different versions)
  modules.forEach(module => {
    const packageMatch = module.name.match(/[\\/]node_modules[\\/]((?:@[^/]+[\\/])?[^/]+)(.+)?/);
    if (packageMatch) {
      const packageName = packageMatch[1];
      const packageSubpath = packageMatch[2] || '';
      const fullPath = module.name;
      
      if (!packagePaths[packageName]) {
        packagePaths[packageName] = new Set();
      }
      
      // Add the unique package path
      if (packageSubpath.includes('node_modules')) {
        packagePaths[packageName].add(fullPath);
      }
    }
  });
  
  // Filter for packages with multiple paths
  return Object.entries(packagePaths)
    .filter(([_, paths]) => paths.size > 1)
    .map(([name, paths]) => ({
      name,
      count: paths.size,
      paths: Array.from(paths)
    }))
    .sort((a, b) => b.count - a.count);
};

/**
 * Analyze chunk splitting and identify optimization opportunities
 * 
 * @param {Object} stats - Webpack stats object
 * @returns {Object} Chunk analysis
 */
export const analyzeChunkSplitting = (stats) => {
  if (!stats || !stats.chunks) {
    return { error: 'Invalid stats object' };
  }
  
  const chunks = stats.chunks.map(chunk => ({
    id: chunk.id,
    names: chunk.names,
    entry: chunk.entry,
    initial: chunk.initial,
    size: chunk.size,
    files: chunk.files,
    modules: chunk.modules ? chunk.modules.length : 0
  }));
  
  // Calculate initial load size
  const initialChunks = chunks.filter(chunk => chunk.initial);
  const initialSize = initialChunks.reduce((sum, chunk) => sum + chunk.size, 0);
  
  // Calculate total size
  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  
  // Find chunks exceeding budgets
  const chunkBudgets = Object.entries(BUNDLE_SIZE_BUDGETS)
    .filter(([key]) => key !== 'total')
    .map(([type, budget]) => {
      // Match chunks to type
      const matchingChunks = chunks.filter(chunk => {
        const chunkName = chunk.names[0] || '';
        if (type === 'main' && chunkName === 'main') return true;
        if (type === 'vendor' && chunkName.includes('vendor')) return true;
        if (type === 'route' && chunkName.match(/^route-/)) return true;
        if (type === 'component' && chunkName.match(/^component-/)) return true;
        if (type === 'lazy' && !chunk.initial) return true;
        return false;
      });
      
      return {
        type,
        budget: budget * 1024, // Convert to bytes
        chunks: matchingChunks.map(chunk => ({
          name: chunk.names[0] || chunk.id,
          size: chunk.size,
          exceeds: chunk.size > budget * 1024
        }))
      };
    });
  
  return {
    chunks,
    initialChunks,
    initialSize,
    totalSize,
    budgets: {
      initial: {
        budget: BUNDLE_SIZE_BUDGETS.total.initial * 1024,
        actual: initialSize,
        exceeds: initialSize > BUNDLE_SIZE_BUDGETS.total.initial * 1024
      },
      total: {
        budget: BUNDLE_SIZE_BUDGETS.total.js * 1024,
        actual: totalSize,
        exceeds: totalSize > BUNDLE_SIZE_BUDGETS.total.js * 1024
      },
      chunkBudgets
    }
  };
};

/**
 * Generate optimization recommendations based on analysis
 * 
 * @param {Object} moduleAnalysis - Module usage analysis
 * @param {Object} chunkAnalysis - Chunk splitting analysis
 * @returns {Object} Optimization recommendations
 */
export const generateOptimizationRecommendations = (moduleAnalysis, chunkAnalysis) => {
  const recommendations = [];
  
  // Check for large dependencies
  if (moduleAnalysis.packages.length > 0) {
    const largePackages = moduleAnalysis.packages
      .filter(pkg => pkg.size > 100 * 1024) // More than 100KB
      .slice(0, 5);
    
    if (largePackages.length > 0) {
      recommendations.push({
        type: 'large-dependencies',
        title: 'Large Dependencies',
        details: `Found ${largePackages.length} large dependencies that could be optimized.`,
        items: largePackages.map(pkg => ({
          name: pkg.name,
          size: Math.round(pkg.size / 1024),
          suggestions: [
            `Consider replacing ${pkg.name} with a smaller alternative`,
            `Import only necessary parts of ${pkg.name} instead of the whole library`,
            `Use dynamic imports to load ${pkg.name} only when needed`
          ]
        }))
      });
    }
  }
  
  // Check for duplicate packages
  if (moduleAnalysis.duplicates && moduleAnalysis.duplicates.length > 0) {
    recommendations.push({
      type: 'duplicate-packages',
      title: 'Duplicate Package Versions',
      details: `Found ${moduleAnalysis.duplicates.length} packages with multiple versions.`,
      items: moduleAnalysis.duplicates.map(dup => ({
        name: dup.name,
        count: dup.count,
        suggestions: [
          `Deduplicate ${dup.name} by enforcing a single version in package.json`,
          `Use webpack's resolve.alias to force a single version`,
          `Update dependencies to use compatible versions`
        ]
      }))
    });
  }
  
  // Check for budget violations
  if (chunkAnalysis.budgets) {
    // Initial load budget
    if (chunkAnalysis.budgets.initial.exceeds) {
      recommendations.push({
        type: 'initial-load',
        title: 'Initial Load Size',
        details: `Initial load size (${Math.round(chunkAnalysis.budgets.initial.actual / 1024)}KB) exceeds budget (${BUNDLE_SIZE_BUDGETS.total.initial}KB).`,
        suggestions: [
          'Move non-critical components to lazy-loaded chunks',
          'Implement code splitting for routes',
          'Reduce the size of vendor bundle by importing only necessary dependencies',
          'Use dynamic imports for heavy features'
        ]
      });
    }
    
    // Chunk-specific budgets
    const oversizedChunks = chunkAnalysis.budgets.chunkBudgets
      .flatMap(budget => budget.chunks)
      .filter(chunk => chunk.exceeds);
    
    if (oversizedChunks.length > 0) {
      recommendations.push({
        type: 'oversized-chunks',
        title: 'Oversized Chunks',
        details: `Found ${oversizedChunks.length} chunks exceeding their size budgets.`,
        items: oversizedChunks.map(chunk => ({
          name: chunk.name,
          size: Math.round(chunk.size / 1024),
          suggestions: [
            `Split ${chunk.name} into smaller chunks`,
            `Optimize imports within ${chunk.name}`,
            `Consider code splitting within ${chunk.name}`
          ]
        }))
      });
    }
  }
  
  return {
    recommendations,
    hasCriticalIssues: recommendations.length > 0
  };
};

/**
 * Generate a human-readable bundle analysis report
 * 
 * @param {Object} stats - Webpack stats object
 * @returns {string} Formatted report text
 */
export const generateBundleReport = (stats) => {
  const moduleAnalysis = analyzeModuleUsage(stats);
  const chunkAnalysis = analyzeChunkSplitting(stats);
  const recommendations = generateOptimizationRecommendations(moduleAnalysis, chunkAnalysis);
  
  let report = '# Bundle Analysis Report\n\n';
  
  // Overall stats
  report += '## Overall Statistics\n\n';
  report += `- Total Bundle Size: ${Math.round(chunkAnalysis.totalSize / 1024)}KB\n`;
  report += `- Initial Load Size: ${Math.round(chunkAnalysis.initialSize / 1024)}KB\n`;
  report += `- Total Chunks: ${chunkAnalysis.chunks.length}\n`;
  report += `- Initial Chunks: ${chunkAnalysis.initialChunks.length}\n\n`;
  
  // Budget status
  report += '## Bundle Budget Status\n\n';
  const initialStatus = chunkAnalysis.budgets.initial.exceeds ? '❌ EXCEEDS' : '✅ WITHIN';
  const totalStatus = chunkAnalysis.budgets.total.exceeds ? '❌ EXCEEDS' : '✅ WITHIN';
  
  report += `- Initial Load Budget: ${initialStatus} (${Math.round(chunkAnalysis.budgets.initial.actual / 1024)}KB / ${BUNDLE_SIZE_BUDGETS.total.initial}KB)\n`;
  report += `- Total JS Budget: ${totalStatus} (${Math.round(chunkAnalysis.budgets.total.actual / 1024)}KB / ${BUNDLE_SIZE_BUDGETS.total.js}KB)\n\n`;
  
  // Top packages
  report += '## Largest Packages\n\n';
  moduleAnalysis.packages.slice(0, 10).forEach(pkg => {
    report += `- ${pkg.name}: ${Math.round(pkg.size / 1024)}KB\n`;
  });
  report += '\n';
  
  // Duplicate packages
  if (moduleAnalysis.duplicates.length > 0) {
    report += '## Duplicate Packages\n\n';
    moduleAnalysis.duplicates.forEach(dup => {
      report += `- ${dup.name} (${dup.count} versions)\n`;
    });
    report += '\n';
  }
  
  // Recommendations
  if (recommendations.recommendations.length > 0) {
    report += '## Optimization Recommendations\n\n';
    
    recommendations.recommendations.forEach(rec => {
      report += `### ${rec.title}\n\n`;
      report += `${rec.details}\n\n`;
      
      if (rec.items) {
        rec.items.forEach(item => {
          report += `#### ${item.name} (${item.size ? item.size + 'KB' : item.count + ' versions'})\n\n`;
          item.suggestions.forEach(suggestion => {
            report += `- ${suggestion}\n`;
          });
          report += '\n';
        });
      } else if (rec.suggestions) {
        rec.suggestions.forEach(suggestion => {
          report += `- ${suggestion}\n`;
        });
        report += '\n';
      }
    });
  }
  
  return report;
};

/**
 * Create a webpack plugin to analyze bundle size during build
 * 
 * @param {Object} options - Plugin options
 * @returns {Object} Webpack plugin
 */
export const BundleBudgetPlugin = (options = {}) => {
  const { 
    enabled = true,
    reportPath = 'bundle-report.md',
    failOnError = false,
    budgets = BUNDLE_SIZE_BUDGETS
  } = options;
  
  return {
    apply(compiler) {
      if (!enabled) return;
      
      compiler.hooks.done.tap('BundleBudgetPlugin', stats => {
        const statsJson = stats.toJson({
          modules: true,
          chunks: true,
          assets: true,
          hash: false,
          builtAt: false,
          entrypoints: true,
          children: false,
          source: false
        });
        
        const moduleAnalysis = analyzeModuleUsage(statsJson);
        const chunkAnalysis = analyzeChunkSplitting(statsJson);
        const recommendations = generateOptimizationRecommendations(moduleAnalysis, chunkAnalysis);
        
        // Generate report
        const report = generateBundleReport(statsJson);
        
        // Write report to file
        const fs = require('fs');
        const path = require('path');
        fs.writeFileSync(path.resolve(reportPath), report);
        
        // Log summary
        console.log('\n===== Bundle Budget Analysis =====');
        console.log(`Total bundle size: ${Math.round(chunkAnalysis.totalSize / 1024)}KB`);
        console.log(`Initial load size: ${Math.round(chunkAnalysis.initialSize / 1024)}KB (Budget: ${budgets.total.initial}KB)`);
        
        if (recommendations.hasCriticalIssues) {
          console.log('\nFlagged issues:');
          recommendations.recommendations.forEach(rec => {
            console.log(`- ${rec.title}: ${rec.details}`);
          });
          console.log(`\nSee ${reportPath} for detailed recommendations.`);
          
          if (failOnError) {
            throw new Error('Bundle exceeds size budget. Build failed.');
          }
        } else {
          console.log('\n✅ All bundle budgets are within limits.');
        }
        
        console.log('===================================\n');
      });
    }
  };
};

/**
 * Enable tracking of module sizes in development
 * Must be called before any imports are loaded
 */
export const enableBundleSizeTracking = () => {
  // Only run in development
  if (process.env.NODE_ENV !== 'development') return;
  
  if (typeof window === 'undefined') return;
  
  // Create a global tracker object
  window.__BUNDLE_TRACKER__ = {
    enabled: true,
    modules: {},
    imports: {}
  };
  
  // Override require/import (webpack specific)
  if (typeof __webpack_modules__ !== 'undefined') {
    const originalRequire = __webpack_require__;
    
    // Override webpack's require function to track module sizes
    window.__webpack_require__ = function(moduleId) {
      const module = originalRequire(moduleId);
      
      try {
        // Only track modules once
        if (!window.__BUNDLE_TRACKER__.modules[moduleId]) {
          const moduleText = __webpack_modules__[moduleId].toString();
          const size = new Blob([moduleText]).size / 1024; // Size in KB
          
          window.__BUNDLE_TRACKER__.modules[moduleId] = {
            id: moduleId,
            size,
            timestamp: Date.now()
          };
          
          // Check for known heavy imports
          for (const heavyImport of heavyImports) {
            if (moduleText.includes(`from '${heavyImport.name}'`) || 
                moduleText.includes(`require('${heavyImport.name}')`)) {
              if (size > heavyImport.warnSize) {
                console.warn(
                  `[BundleTracker] Heavy import detected: ${heavyImport.name} (${size.toFixed(2)}KB). ` +
                  `Consider dynamic import or tree-shaking.`
                );
              }
              
              // Track import size
              if (!window.__BUNDLE_TRACKER__.imports[heavyImport.name]) {
                window.__BUNDLE_TRACKER__.imports[heavyImport.name] = {
                  size,
                  modules: [moduleId]
                };
              } else {
                window.__BUNDLE_TRACKER__.imports[heavyImport.name].size += size;
                window.__BUNDLE_TRACKER__.imports[heavyImport.name].modules.push(moduleId);
              }
            }
          }
        }
      } catch (e) {
        // Ignore errors in tracking logic
        console.error('[BundleTracker] Error tracking module:', e);
      }
      
      return module;
    };
    
    // Copy over properties from the original require
    Object.assign(window.__webpack_require__, originalRequire);
    
    // Override the webpack require function
    __webpack_require__ = window.__webpack_require__;
  }
};

/**
 * Track and warn about heavy imports in development
 * 
 * @param {string} importName - Name of the imported module
 * @param {number} [warnSizeKb=50] - Size threshold in KB to trigger warning
 */
export const trackImport = (importName, warnSizeKb = 50) => {
  // Only run in development
  if (process.env.NODE_ENV !== 'development') return;
  
  if (!importSizes[importName]) {
    // Use performance mark to track when import was loaded
    if (window.performance && window.performance.mark) {
      window.performance.mark(`import-${importName}`);
    }
    
    console.info(`[BundleTracker] Imported: ${importName}`);
    
    // Mock size estimation
    // In a real implementation, you'd need a build-time plugin to get accurate sizes
    importSizes[importName] = warnSizeKb;
    
    if (warnSizeKb > 30) {
      console.warn(
        `[BundleTracker] Heavy import: ${importName} (estimated: ${warnSizeKb}KB). ` +
        `Consider using dynamic import or code-splitting.`
      );
    }
  }
  
  return importName;
};

/**
 * Utility for dynamically importing components based on device capabilities
 * This helps optimize bundle size for different devices
 * 
 * @param {Object} options - Component options by capability level
 * @returns {Promise<Component>} Appropriate component for the device
 */
export const importByCapability = (options) => {
  const { high, medium, low, fallback } = options;
  
  // Determine device capability
  const getDeviceCapability = () => {
    const memory = navigator.deviceMemory || 4; // Default to 4GB if not available
    const connection = navigator.connection || {};
    const effectiveType = connection.effectiveType || '4g';
    const isHighEnd = 
      memory >= 4 && 
      (effectiveType === '4g' || !effectiveType) &&
      !connection.saveData;
    
    const isLowEnd = 
      memory <= 2 || 
      ['slow-2g', '2g', '3g'].includes(effectiveType) ||
      connection.saveData;
    
    return isHighEnd ? 'high' : (isLowEnd ? 'low' : 'medium');
  };
  
  // Select appropriate import based on capability
  try {
    const capability = getDeviceCapability();
    
    switch (capability) {
      case 'high':
        return high ? high() : medium();
      case 'medium':
        return medium ? medium() : (high ? high() : low());
      case 'low':
        return low ? low() : (medium ? medium() : high());
      default:
        return fallback ? fallback() : medium();
    }
  } catch (error) {
    console.error('Error importing by capability:', error);
    return fallback ? fallback() : (medium ? medium() : (low || high)());
  }
};

/**
 * Utility to help identify unused code and dependencies
 * Creates a report of imports that might be unused
 * 
 * @param {Object} stats - Webpack stats object
 * @returns {Object} Unused imports analysis
 */
export const analyzeUnusedImports = (stats) => {
  if (!stats || !stats.modules) {
    return { error: 'Invalid stats object' };
  }
  
  // Find modules that are included but never used
  const unusedImports = stats.modules
    .filter(module => 
      module.usedExports && 
      module.usedExports.length === 0 &&
      // Only include modules from our source code, not node_modules
      !module.name.includes('node_modules') &&
      module.name.match(/\.(js|jsx|ts|tsx)$/)
    )
    .map(module => ({
      name: module.name,
      size: module.size,
      reasons: module.reasons ? module.reasons.map(r => r.moduleName).filter(Boolean) : []
    }));
  
  return {
    unusedImports,
    totalSize: unusedImports.reduce((sum, module) => sum + module.size, 0)
  };
};

/**
 * Utility to generate tree-shaking recommendations
 * Identifies large modules that could be better tree-shaken
 * 
 * @param {Object} stats - Webpack stats object
 * @returns {Object} Tree-shaking recommendations
 */
export const generateTreeShakingRecommendations = (stats) => {
  if (!stats || !stats.modules) {
    return { error: 'Invalid stats object' };
  }
  
  // Find modules from node_modules that are large
  const nodeModules = stats.modules
    .filter(module => 
      module.name.includes('node_modules') && 
      module.size > 20 * 1024 // More than 20KB
    )
    .map(module => {
      // Extract package name and used exports
      const packageMatch = module.name.match(/[\\/]node_modules[\\/]((?:@[^/]+[\\/])?[^/]+)/);
      const packageName = packageMatch ? packageMatch[1] : 'unknown';
      
      return {
        name: module.name,
        package: packageName,
        size: module.size,
        usedExports: module.usedExports || [],
        providedExports: module.providedExports || []
      };
    })
    .sort((a, b) => b.size - a.size);
  
  // Group by package
  const packageGroups = {};
  nodeModules.forEach(module => {
    if (!packageGroups[module.package]) {
      packageGroups[module.package] = {
        package: module.package,
        modules: [],
        totalSize: 0
      };
    }
    
    packageGroups[module.package].modules.push(module);
    packageGroups[module.package].totalSize += module.size;
  });
  
  // Transform to array and sort
  const packages = Object.values(packageGroups)
    .sort((a, b) => b.totalSize - a.totalSize);
  
  // Generate recommendations
  const recommendations = packages.slice(0, 10).map(pkg => {
    const moduleCount = pkg.modules.length;
    const totalSize = pkg.totalSize;
    
    // Generate specific advice based on the package
    let advice = [];
    
    // Generic advice
    advice.push(`Use specific imports instead of importing the entire library`);
    
    // Package-specific advice
    if (pkg.package.includes('lodash')) {
      advice.push(`Import individual lodash functions: import _map from 'lodash/map'`);
      advice.push(`Consider using a lighter alternative like lodash-es`);
    } else if (pkg.package.includes('moment')) {
      advice.push(`Consider using Day.js or date-fns as a lighter alternative`);
      advice.push(`If using Moment.js, be sure to only import required locales`);
    } else if (pkg.package.includes('material-ui') || pkg.package.includes('@mui')) {
      advice.push(`Import components directly: import Button from '@mui/material/Button'`);
      advice.push(`Use babel-plugin-import to automatically transform imports`);
    } else if (pkg.package.includes('redux')) {
      advice.push(`Consider if you need all Redux features or could use a lighter alternative`);
    } else if (pkg.package.includes('react-icons')) {
      advice.push(`Import only the specific icons you need, not entire icon sets`);
    }
    
    return {
      package: pkg.package,
      size: Math.round(totalSize / 1024),
      moduleCount,
      advice
    };
  });
  
  return {
    recommendations,
    totalPackages: packages.length,
    totalSize: Math.round(packages.reduce((sum, pkg) => sum + pkg.totalSize, 0) / 1024)
  };
};

/**
 * Generate a bundle optimization report in HTML format
 * 
 * @returns {string} HTML report
 */
export const generateBundleOptimizationReport = () => {
  const report = window.__BUNDLE_TRACKER__ ? {
    totalSize: Object.values(window.__BUNDLE_TRACKER__.modules)
      .reduce((sum, mod) => sum + mod.size, 0),
    moduleCount: Object.keys(window.__BUNDLE_TRACKER__.modules).length,
    heavyImports: Object.entries(window.__BUNDLE_TRACKER__.imports)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.size - a.size)
  } : { error: "Bundle tracker not initialized" };

  if (report.error) {
    return `<div class="error">${report.error}</div>`;
  }
  
  return `
    <html>
      <head>
        <title>Bundle Optimization Report</title>
        <style>
          body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; line-height: 1.4; }
          h1 { margin-top: 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; }
          th { background: #f5f5f5; }
          .heavy { color: #d32f2f; }
          .warning { color: #f57c00; }
          .good { color: #388e3c; }
          .suggestion { background: #fff9c4; padding: 8px; margin-bottom: 8px; border-left: 4px solid #fbc02d; }
        </style>
      </head>
      <body>
        <h1>Bundle Optimization Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
        
        <h2>Summary</h2>
        <p>Total bundle size: <span class="${report.totalSize > 1000 ? 'heavy' : report.totalSize > 500 ? 'warning' : 'good'}">${report.totalSize.toFixed(2)} KB</span></p>
        <p>Module count: ${report.moduleCount}</p>
        
        <h2>Heavy Imports (Top 10)</h2>
        <table>
          <thead>
            <tr>
              <th>Module</th>
              <th>Size (KB)</th>
              <th>Module Count</th>
            </tr>
          </thead>
          <tbody>
            ${report.heavyImports.slice(0, 10).map(item => `
              <tr>
                <td>${item.name}</td>
                <td class="${item.size > 100 ? 'heavy' : item.size > 30 ? 'warning' : ''}">${item.size.toFixed(2)}</td>
                <td>${item.modules.length}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <h2>Optimization Suggestions</h2>
        <div class="suggestion">
          <strong>Material UI:</strong> Import components directly from specific paths
          <pre>// Instead of this
import { Button, TextField } from '@mui/material';

// Do this
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';</pre>
        </div>
        
        <div class="suggestion">
          <strong>Large components:</strong> Use code splitting with React.lazy()
          <pre>// Before
import LargeComponent from './LargeComponent';

// After
const LargeComponent = React.lazy(() => import('./LargeComponent'));</pre>
        </div>
        
        <div class="suggestion">
          <strong>Moment.js:</strong> Consider using day.js as a lighter alternative
          <pre>// Moment.js is 300KB+
import moment from 'moment';

// day.js is ~2KB
import dayjs from 'dayjs';</pre>
        </div>
        
        <h2>Next Steps</h2>
        <ol>
          <li>Consider code-splitting using dynamic imports for heavy modules</li>
          <li>Use tree-shakeable imports where possible</li>
          <li>Replace large libraries with smaller alternatives</li>
          <li>Set up bundle analyzer in your build process</li>
          <li>Consider using the Optimization panel in Chrome DevTools</li>
        </ol>
      </body>
    </html>
  `;
};