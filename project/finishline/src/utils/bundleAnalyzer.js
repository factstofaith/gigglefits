/**
 * Bundle Analyzer Utilities
 * 
 * Tools for analyzing and optimizing bundle size.
 * 
 * @module utils/bundleAnalyzer
 */

/**
 * Module size information
 * @typedef {Object} ModuleSize
 * @property {string} name - Module name
 * @property {number} size - Size in bytes
 * @property {number} gzipSize - Gzipped size in bytes
 * @property {string} path - Module path
 * @property {Array<ModuleSize>} [children] - Child modules
 */

/**
 * Format bytes to human-readable string
 * 
 * @param {number} bytes - Size in bytes
 * @param {number} [decimals=2] - Decimal places
 * @returns {string} Formatted size string
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Simple module dependency tracker
 */
export class ModuleDependencyTracker {
  constructor() {
    this.modules = new Map();
    this.dependencyGraph = new Map();
  }
  
  /**
   * Register a module
   * 
   * @param {string} moduleName - Module name
   * @param {string} modulePath - Module path
   * @param {number} size - Module size in bytes
   */
  registerModule(moduleName, modulePath, size) {
    this.modules.set(moduleName, { name: moduleName, path: modulePath, size });
    
    if (!this.dependencyGraph.has(moduleName)) {
      this.dependencyGraph.set(moduleName, new Set());
    }
  }
  
  /**
   * Add a dependency relationship
   * 
   * @param {string} moduleA - Module that depends on moduleB
   * @param {string} moduleB - Module that is depended upon
   */
  addDependency(moduleA, moduleB) {
    if (!this.dependencyGraph.has(moduleA)) {
      this.dependencyGraph.set(moduleA, new Set());
    }
    
    this.dependencyGraph.get(moduleA).add(moduleB);
  }
  
  /**
   * Get all dependencies of a module
   * 
   * @param {string} moduleName - Module name
   * @returns {Set<string>} Set of direct dependencies
   */
  getDependencies(moduleName) {
    return this.dependencyGraph.get(moduleName) || new Set();
  }
  
  /**
   * Get all modules that depend on the given module
   * 
   * @param {string} moduleName - Module name
   * @returns {Array<string>} Array of modules that depend on the given module
   */
  getDependents(moduleName) {
    const dependents = [];
    
    for (const [module, dependencies] of this.dependencyGraph.entries()) {
      if (dependencies.has(moduleName)) {
        dependents.push(module);
      }
    }
    
    return dependents;
  }
  
  /**
   * Get transitive dependencies of a module
   * 
   * @param {string} moduleName - Module name
   * @returns {Set<string>} Set of all dependencies (direct and indirect)
   */
  getAllDependencies(moduleName) {
    const visited = new Set();
    const result = new Set();
    
    const visit = (name) => {
      if (visited.has(name)) return;
      visited.add(name);
      
      const dependencies = this.getDependencies(name);
      for (const dep of dependencies) {
        result.add(dep);
        visit(dep);
      }
    };
    
    visit(moduleName);
    return result;
  }
  
  /**
   * Calculate module impact score
   * Based on the number of modules that depend on it
   * 
   * @param {string} moduleName - Module name
   * @returns {number} Impact score
   */
  calculateImpactScore(moduleName) {
    const directDependents = this.getDependents(moduleName).length;
    let indirectDependents = 0;
    
    for (const module of this.modules.keys()) {
      if (module === moduleName) continue;
      
      if (this.getAllDependencies(module).has(moduleName)) {
        indirectDependents++;
      }
    }
    
    return directDependents + (indirectDependents * 0.5);
  }
  
  /**
   * Get modules sorted by impact score
   * 
   * @param {number} [limit=20] - Maximum number of modules to return
   * @returns {Array<Object>} Modules with impact scores
   */
  getHighImpactModules(limit = 20) {
    const modules = [...this.modules.keys()];
    const modulesWithScores = modules.map(name => ({
      name,
      score: this.calculateImpactScore(name),
      size: this.modules.get(name).size,
      path: this.modules.get(name).path,
    }));
    
    return modulesWithScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  /**
   * Get modules sorted by size
   * 
   * @param {number} [limit=20] - Maximum number of modules to return
   * @returns {Array<Object>} Modules with sizes
   */
  getLargestModules(limit = 20) {
    const modules = [...this.modules.values()];
    
    return modules
      .sort((a, b) => b.size - a.size)
      .slice(0, limit);
  }
  
  /**
   * Find circular dependencies
   * 
   * @returns {Array<Array<string>>} Array of circular dependency chains
   */
  findCircularDependencies() {
    const circularDependencies = [];
    
    for (const moduleName of this.modules.keys()) {
      const visited = new Set();
      const path = [];
      
      const visit = (name) => {
        if (path.includes(name)) {
          // Found a cycle
          const cycle = [...path.slice(path.indexOf(name)), name];
          circularDependencies.push(cycle);
          return;
        }
        
        if (visited.has(name)) return;
        visited.add(name);
        
        path.push(name);
        const dependencies = this.getDependencies(name);
        for (const dep of dependencies) {
          visit(dep);
        }
        path.pop();
      };
      
      visit(moduleName);
    }
    
    // Remove duplicate cycles
    const uniqueCycles = [];
    const cycleStrings = new Set();
    
    for (const cycle of circularDependencies) {
      // Sort to normalize cycle representation
      const sortedCycle = [...cycle].sort();
      const cycleString = sortedCycle.join(',');
      
      if (!cycleStrings.has(cycleString)) {
        cycleStrings.add(cycleString);
        uniqueCycles.push(cycle);
      }
    }
    
    return uniqueCycles;
  }
}

/**
 * Bundle analyzer that can provide optimization recommendations
 */
export class BundleAnalyzer {
  constructor() {
    this.modules = [];
    this.totalSize = 0;
    this.duplicationMap = new Map();
    this.depTracker = new ModuleDependencyTracker();
  }
  
  /**
   * Load module data
   * 
   * @param {Array<ModuleSize>} moduleData - Module size data
   */
  loadModuleData(moduleData) {
    this.modules = moduleData;
    this.totalSize = moduleData.reduce((sum, module) => sum + module.size, 0);
    
    // Register modules in dependency tracker
    for (const module of moduleData) {
      this.depTracker.registerModule(
        module.name,
        module.path,
        module.size
      );
      
      // Register dependencies if available
      if (module.children) {
        for (const child of module.children) {
          this.depTracker.addDependency(module.name, child.name);
        }
      }
    }
    
    // Find duplications
    this.findDuplications();
  }
  
  /**
   * Find duplicated modules
   */
  findDuplications() {
    const pathMap = new Map();
    
    for (const module of this.modules) {
      const normalizedPath = this.normalizePath(module.path);
      
      if (!pathMap.has(normalizedPath)) {
        pathMap.set(normalizedPath, []);
      }
      
      pathMap.get(normalizedPath).push(module);
    }
    
    // Keep only paths with multiple modules
    for (const [path, modules] of pathMap.entries()) {
      if (modules.length > 1) {
        this.duplicationMap.set(path, modules);
      }
    }
  }
  
  /**
   * Normalize module path for duplication detection
   * 
   * @param {string} path - Module path
   * @returns {string} Normalized path
   */
  normalizePath(path) {
    // Remove version numbers
    return path.replace(/[@/\\][\d.]+/g, '');
  }
  
  /**
   * Get the largest modules
   * 
   * @param {number} [limit=20] - Maximum number of modules to return
   * @returns {Array<ModuleSize>} Largest modules
   */
  getLargestModules(limit = 20) {
    return [...this.modules]
      .sort((a, b) => b.size - a.size)
      .slice(0, limit);
  }
  
  /**
   * Get duplicated modules
   * 
   * @returns {Map<string, Array<ModuleSize>>} Map of path to duplicated modules
   */
  getDuplicatedModules() {
    return this.duplicationMap;
  }
  
  /**
   * Get high impact modules
   * 
   * @param {number} [limit=20] - Maximum number of modules to return
   * @returns {Array<Object>} High impact modules
   */
  getHighImpactModules(limit = 20) {
    return this.depTracker.getHighImpactModules(limit);
  }
  
  /**
   * Get circular dependencies
   * 
   * @returns {Array<Array<string>>} Circular dependencies
   */
  getCircularDependencies() {
    return this.depTracker.findCircularDependencies();
  }
  
  /**
   * Generate optimization recommendations
   * 
   * @returns {Array<Object>} Optimization recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Check for large modules
    const largeModules = this.getLargestModules(10);
    if (largeModules.length > 0) {
      recommendations.push({
        type: 'large-modules',
        title: 'Large modules detected',
        description: 'These modules take up significant bundle space and should be considered for optimization',
        items: largeModules.map(module => ({
          name: module.name,
          size: module.size,
          formattedSize: formatBytes(module.size),
          percentage: ((module.size / this.totalSize) * 100).toFixed(2) + '%',
          path: module.path,
        })),
      });
    }
    
    // Check for duplicated modules
    const duplications = this.getDuplicatedModules();
    if (duplications.size > 0) {
      const duplicationItems = [];
      
      for (const [path, modules] of duplications.entries()) {
        const totalSize = modules.reduce((sum, m) => sum + m.size, 0);
        const potentialSavings = totalSize - (modules[0]?.size || 0);
        
        duplicationItems.push({
          path,
          count: modules.length,
          size: totalSize,
          formattedSize: formatBytes(totalSize),
          potentialSavings,
          formattedSavings: formatBytes(potentialSavings),
          modules: modules.map(m => ({
            name: m.name,
            size: m.size,
            formattedSize: formatBytes(m.size),
          })),
        });
      }
      
      recommendations.push({
        type: 'duplications',
        title: 'Duplicated modules detected',
        description: 'These modules appear multiple times in the bundle and are candidates for deduplication',
        items: duplicationItems.sort((a, b) => b.potentialSavings - a.potentialSavings),
      });
    }
    
    // Check for circular dependencies
    const circularDeps = this.getCircularDependencies();
    if (circularDeps.length > 0) {
      recommendations.push({
        type: 'circular-dependencies',
        title: 'Circular dependencies detected',
        description: 'These circular dependencies can lead to increased bundle size and potential issues',
        items: circularDeps.map(cycle => ({
          cycle,
          description: cycle.join(' → ') + ` → ${cycle[0]}`,
        })),
      });
    }
    
    // Check for high impact modules
    const highImpactModules = this.getHighImpactModules(10);
    if (highImpactModules.length > 0) {
      recommendations.push({
        type: 'high-impact',
        title: 'High impact modules',
        description: 'These modules are widely used across the codebase and should be optimized',
        items: highImpactModules.map(module => ({
          name: module.name,
          score: module.score.toFixed(1),
          size: module.size,
          formattedSize: formatBytes(module.size),
          path: module.path,
        })),
      });
    }
    
    return recommendations;
  }
  
  /**
   * Generate a summary report
   * 
   * @returns {string} Markdown summary report
   */
  generateSummaryReport() {
    const recommendations = this.generateRecommendations();
    let report = `# Bundle Analysis Summary\n\n`;
    
    report += `Total bundle size: ${formatBytes(this.totalSize)}\n\n`;
    
    // Add recommendations
    for (const rec of recommendations) {
      report += `## ${rec.title}\n\n`;
      report += `${rec.description}\n\n`;
      
      if (rec.type === 'large-modules') {
        report += `| Module | Size | % of Bundle | Path |\n`;
        report += `| ------ | ---- | ----------- | ---- |\n`;
        
        for (const item of rec.items) {
          report += `| ${item.name} | ${item.formattedSize} | ${item.percentage} | ${item.path} |\n`;
        }
        
        report += `\n`;
      } else if (rec.type === 'duplications') {
        report += `| Module Path | Instances | Total Size | Potential Savings |\n`;
        report += `| ----------- | --------- | ---------- | ----------------- |\n`;
        
        for (const item of rec.items) {
          report += `| ${item.path} | ${item.count} | ${item.formattedSize} | ${item.formattedSavings} |\n`;
        }
        
        report += `\n`;
      } else if (rec.type === 'circular-dependencies') {
        report += `| Circular Dependency Chain |\n`;
        report += `| ------------------------- |\n`;
        
        for (const item of rec.items) {
          report += `| ${item.description} |\n`;
        }
        
        report += `\n`;
      } else if (rec.type === 'high-impact') {
        report += `| Module | Impact Score | Size | Path |\n`;
        report += `| ------ | ------------ | ---- | ---- |\n`;
        
        for (const item of rec.items) {
          report += `| ${item.name} | ${item.score} | ${item.formattedSize} | ${item.path} |\n`;
        }
        
        report += `\n`;
      }
    }
    
    // Add optimization advice
    report += `## Optimization Recommendations\n\n`;
    
    report += `1. **Code Splitting**: Implement dynamic imports for large modules\n`;
    report += `2. **Tree Shaking**: Ensure all imports are specific to minimize dead code\n`;
    report += `3. **Deduplication**: Fix package duplication by normalizing dependencies\n`;
    report += `4. **Lazy Loading**: Defer loading non-critical components until needed\n`;
    report += `5. **Bundle Analysis**: Run this analysis regularly to track progress\n`;
    
    return report;
  }
}

/**
 * Create a new bundle analyzer
 * 
 * @returns {BundleAnalyzer} Bundle analyzer instance
 */
export const createBundleAnalyzer = () => {
  return new BundleAnalyzer();
};