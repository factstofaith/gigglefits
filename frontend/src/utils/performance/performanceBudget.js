/**
 * Performance Budget System
 * 
 * A system for establishing, tracking, and enforcing performance budgets across 
 * the application. Part of the zero technical debt performance implementation.
 * 
 * @module utils/performance/performanceBudget
 */

import { getPerformanceMetrics } from './performanceMonitor';

/**
 * Default performance budget thresholds
 */
const defaultBudgets = {
  // Component render times (milliseconds)
  components: {
    critical: 30, // Critical path components (e.g., main layout)
    standard: 50, // Standard components
    complex: 100, // Complex visualization components
  },
  
  // Interaction response times (milliseconds)
  interactions: {
    button: 50, // Button clicks
    input: 30, // Input field interactions
    toggle: 30, // Toggle interactions
    navigation: 100, // Navigation interactions
    form: 150, // Form submissions
  },
  
  // Resource loading times (milliseconds)
  resources: {
    script: 400, // JavaScript files
    style: 200, // CSS files
    image: 500, // Images
    font: 300, // Font files
    xhr: 1000, // API requests
  },
  
  // Navigation/page load metrics (milliseconds)
  navigation: {
    firstPaint: 1000, // First paint
    firstContentfulPaint: 1500, // First contentful paint
    domInteractive: 2000, // DOM interactive
    domComplete: 3000, // DOM complete
    load: 4000, // Page load
  },
  
  // Bundle size limits (bytes)
  bundleSizes: {
    total: 5 * 1024 * 1024, // Total bundle size (5MB)
    main: 2 * 1024 * 1024, // Main bundle (2MB)
    vendor: 2 * 1024 * 1024, // Vendor bundle (2MB)
    chunk: 500 * 1024, // Individual chunks (500KB)
    asset: 250 * 1024, // Individual assets (250KB)
  },
};

// Store custom budgets
let customBudgets = {};

// Track violations
const violations = {
  components: {},
  interactions: {},
  resources: {},
  navigation: {},
  bundleSizes: {},
};

// Store violation handlers
const violationHandlers = [];

/**
 * Set a custom performance budget
 * 
 * @param {Object} budgets - Custom budget thresholds to set
 */
export const setPerformanceBudget = (budgets) => {
  customBudgets = {
    ...customBudgets,
    ...budgets,
  };
};

/**
 * Get the current performance budget
 * 
 * @returns {Object} Current performance budget
 */
export const getPerformanceBudget = () => {
  // Merge default and custom budgets
  return {
    components: { ...defaultBudgets.components, ...customBudgets.components },
    interactions: { ...defaultBudgets.interactions, ...customBudgets.interactions },
    resources: { ...defaultBudgets.resources, ...customBudgets.resources },
    navigation: { ...defaultBudgets.navigation, ...customBudgets.navigation },
    bundleSizes: { ...defaultBudgets.bundleSizes, ...customBudgets.bundleSizes },
  };
};

/**
 * Register a violation handler
 * 
 * @param {Function} handler - Function to call when budget is violated
 * @returns {Function} Function to unregister the handler
 */
export const onBudgetViolation = (handler) => {
  if (typeof handler !== 'function') {
    throw new Error('Budget violation handler must be a function');
  }
  
  violationHandlers.push(handler);
  
  // Return unregister function
  return () => {
    const index = violationHandlers.indexOf(handler);
    if (index !== -1) {
      violationHandlers.splice(index, 1);
    }
  };
};

/**
 * Record a budget violation
 * 
 * @param {string} category - Violation category (components, interactions, etc.)
 * @param {string} name - Name of the item
 * @param {number} value - Actual value
 * @param {number} budget - Budget threshold
 * @param {string} unit - Unit of measurement (ms, bytes, etc.)
 */
const recordViolation = (category, name, value, budget, unit = 'ms') => {
  if (!violations[category]) {
    violations[category] = {};
  }
  
  violations[category][name] = {
    name,
    value,
    budget,
    overage: value - budget,
    overagePercent: ((value - budget) / budget) * 100,
    timestamp: Date.now(),
    unit,
  };
  
  // Notify handlers
  violationHandlers.forEach(handler => {
    try {
      handler({
        category,
        name,
        value,
        budget,
        overage: value - budget,
        overagePercent: ((value - budget) / budget) * 100,
        unit,
      });
    } catch (e) {
      console.error('Error in budget violation handler:', e);
    }
  });
};

/**
 * Check component render times against budget
 * 
 * @param {Object} [options] - Options for checking
 * @param {boolean} [options.logToConsole=false] - Whether to log violations to console
 * @returns {Array} Array of violations
 */
export const checkComponentBudgets = ({ logToConsole = false } = {}) => {
  const metrics = getPerformanceMetrics();
  const budget = getPerformanceBudget();
  const componentViolations = [];
  
  Object.entries(metrics.components).forEach(([name, data]) => {
    // Determine which budget to use
    let budgetValue = budget.components.standard;
    
    // Check for specific component budgets
    if (budget.components[name]) {
      budgetValue = budget.components[name];
    } else if (name.includes('Chart') || name.includes('Graph') || name.includes('Visualization')) {
      budgetValue = budget.components.complex;
    } else if (name.includes('Layout') || name.includes('App') || name.includes('Page')) {
      budgetValue = budget.components.critical;
    }
    
    // Check if average render time exceeds budget
    if (data.averageTime > budgetValue) {
      const violation = {
        name,
        value: data.averageTime,
        budget: budgetValue,
        overage: data.averageTime - budgetValue,
        overagePercent: ((data.averageTime - budgetValue) / budgetValue) * 100,
      };
      
      componentViolations.push(violation);
      recordViolation('components', name, data.averageTime, budgetValue);
      
      if (logToConsole) {
        console.warn(
          `[PerformanceBudget] Component "${name}" exceeds render time budget: ` +
          `${data.averageTime.toFixed(2)}ms vs ${budgetValue}ms budget ` +
          `(${violation.overagePercent.toFixed(1)}% over)`
        );
      }
    }
  });
  
  return componentViolations;
};

/**
 * Check interaction times against budget
 * 
 * @param {Object} [options] - Options for checking
 * @param {boolean} [options.logToConsole=false] - Whether to log violations to console
 * @returns {Array} Array of violations
 */
export const checkInteractionBudgets = ({ logToConsole = false } = {}) => {
  const metrics = getPerformanceMetrics();
  const budget = getPerformanceBudget();
  const interactionViolations = [];
  
  Object.entries(metrics.interactions).forEach(([name, data]) => {
    // Determine which budget to use
    let budgetValue = budget.interactions.button; // Default to button budget
    
    // Check type from interaction data and name
    const type = data.type || '';
    
    if (type === 'input' || name.includes('input:')) {
      budgetValue = budget.interactions.input;
    } else if (type === 'change' || name.includes('toggle') || name.includes('switch')) {
      budgetValue = budget.interactions.toggle;
    } else if (name.includes('form') || name.includes('submit')) {
      budgetValue = budget.interactions.form;
    } else if (name.includes('navigation') || name.includes('link') || name.includes('route')) {
      budgetValue = budget.interactions.navigation;
    }
    
    // Check specific interaction budgets
    if (budget.interactions[name]) {
      budgetValue = budget.interactions[name];
    }
    
    // Check if average interaction time exceeds budget
    if (data.averageTime > budgetValue) {
      const violation = {
        name,
        value: data.averageTime,
        budget: budgetValue,
        overage: data.averageTime - budgetValue,
        overagePercent: ((data.averageTime - budgetValue) / budgetValue) * 100,
      };
      
      interactionViolations.push(violation);
      recordViolation('interactions', name, data.averageTime, budgetValue);
      
      if (logToConsole) {
        console.warn(
          `[PerformanceBudget] Interaction "${name}" exceeds response time budget: ` +
          `${data.averageTime.toFixed(2)}ms vs ${budgetValue}ms budget ` +
          `(${violation.overagePercent.toFixed(1)}% over)`
        );
      }
    }
  });
  
  return interactionViolations;
};

/**
 * Check resource load times against budget
 * 
 * @param {Object} [options] - Options for checking
 * @param {boolean} [options.logToConsole=false] - Whether to log violations to console
 * @returns {Array} Array of violations
 */
export const checkResourceBudgets = ({ logToConsole = false } = {}) => {
  const metrics = getPerformanceMetrics();
  const budget = getPerformanceBudget();
  const resourceViolations = [];
  
  Object.entries(metrics.resources).forEach(([name, data]) => {
    // Determine which budget to use
    let budgetValue = budget.resources.xhr; // Default to XHR budget
    
    const type = data.type || '';
    
    // Check type
    if (type === 'script' || name.includes('js:')) {
      budgetValue = budget.resources.script;
    } else if (type === 'stylesheet' || name.includes('css:')) {
      budgetValue = budget.resources.style;
    } else if (type === 'img' || type === 'image' || name.match(/\.(jpg|jpeg|png|gif|webp|svg):/i)) {
      budgetValue = budget.resources.image;
    } else if (type === 'font' || name.match(/\.(woff|woff2|ttf|otf|eot):/i)) {
      budgetValue = budget.resources.font;
    }
    
    // Check specific resource budgets
    if (budget.resources[name]) {
      budgetValue = budget.resources[name];
    }
    
    // Check if average load time exceeds budget
    if (data.averageTime > budgetValue) {
      const violation = {
        name,
        value: data.averageTime,
        budget: budgetValue,
        overage: data.averageTime - budgetValue,
        overagePercent: ((data.averageTime - budgetValue) / budgetValue) * 100,
      };
      
      resourceViolations.push(violation);
      recordViolation('resources', name, data.averageTime, budgetValue);
      
      if (logToConsole) {
        console.warn(
          `[PerformanceBudget] Resource "${name}" exceeds load time budget: ` +
          `${data.averageTime.toFixed(2)}ms vs ${budgetValue}ms budget ` +
          `(${violation.overagePercent.toFixed(1)}% over)`
        );
      }
    }
  });
  
  return resourceViolations;
};

/**
 * Check navigation times against budget
 * 
 * @param {Object} [options] - Options for checking
 * @param {boolean} [options.logToConsole=false] - Whether to log violations to console
 * @returns {Array} Array of violations
 */
export const checkNavigationBudgets = ({ logToConsole = false } = {}) => {
  const metrics = getPerformanceMetrics();
  const budget = getPerformanceBudget();
  const navigationViolations = [];
  
  Object.entries(metrics.navigation).forEach(([url, data]) => {
    // Check each navigation metric against budget
    Object.entries(data).forEach(([metric, value]) => {
      // Skip timestamp and metrics that aren't in the budget
      if (metric === 'timestamp' || !budget.navigation[metric]) {
        return;
      }
      
      const budgetValue = budget.navigation[metric];
      
      // Check if value exceeds budget
      if (value > budgetValue) {
        const violation = {
          name: `${url} ${metric}`,
          value,
          budget: budgetValue,
          overage: value - budgetValue,
          overagePercent: ((value - budgetValue) / budgetValue) * 100,
        };
        
        navigationViolations.push(violation);
        recordViolation('navigation', `${url} ${metric}`, value, budgetValue);
        
        if (logToConsole) {
          console.warn(
            `[PerformanceBudget] Navigation "${url}" exceeds ${metric} budget: ` +
            `${value.toFixed(2)}ms vs ${budgetValue}ms budget ` +
            `(${violation.overagePercent.toFixed(1)}% over)`
          );
        }
      }
    });
  });
  
  return navigationViolations;
};

/**
 * Check bundle sizes against budget
 * 
 * @param {Object} bundleSizes - Bundle size information to check
 * @param {Object} [options] - Options for checking
 * @param {boolean} [options.logToConsole=false] - Whether to log violations to console
 * @returns {Array} Array of violations
 */
export const checkBundleSizeBudgets = (bundleSizes, { logToConsole = false } = {}) => {
  const budget = getPerformanceBudget();
  const bundleViolations = [];
  
  // Check total bundle size
  if (bundleSizes.total > budget.bundleSizes.total) {
    const violation = {
      name: 'Total bundle size',
      value: bundleSizes.total,
      budget: budget.bundleSizes.total,
      overage: bundleSizes.total - budget.bundleSizes.total,
      overagePercent: ((bundleSizes.total - budget.bundleSizes.total) / budget.bundleSizes.total) * 100,
      unit: 'bytes',
    };
    
    bundleViolations.push(violation);
    recordViolation('bundleSizes', 'total', bundleSizes.total, budget.bundleSizes.total, 'bytes');
    
    if (logToConsole) {
      console.warn(
        `[PerformanceBudget] Total bundle size exceeds budget: ` +
        `${(bundleSizes.total / 1024 / 1024).toFixed(2)}MB vs ${(budget.bundleSizes.total / 1024 / 1024).toFixed(2)}MB budget ` +
        `(${violation.overagePercent.toFixed(1)}% over)`
      );
    }
  }
  
  // Check main bundle
  if (bundleSizes.main && bundleSizes.main > budget.bundleSizes.main) {
    const violation = {
      name: 'Main bundle',
      value: bundleSizes.main,
      budget: budget.bundleSizes.main,
      overage: bundleSizes.main - budget.bundleSizes.main,
      overagePercent: ((bundleSizes.main - budget.bundleSizes.main) / budget.bundleSizes.main) * 100,
      unit: 'bytes',
    };
    
    bundleViolations.push(violation);
    recordViolation('bundleSizes', 'main', bundleSizes.main, budget.bundleSizes.main, 'bytes');
    
    if (logToConsole) {
      console.warn(
        `[PerformanceBudget] Main bundle size exceeds budget: ` +
        `${(bundleSizes.main / 1024 / 1024).toFixed(2)}MB vs ${(budget.bundleSizes.main / 1024 / 1024).toFixed(2)}MB budget ` +
        `(${violation.overagePercent.toFixed(1)}% over)`
      );
    }
  }
  
  // Check vendor bundle
  if (bundleSizes.vendor && bundleSizes.vendor > budget.bundleSizes.vendor) {
    const violation = {
      name: 'Vendor bundle',
      value: bundleSizes.vendor,
      budget: budget.bundleSizes.vendor,
      overage: bundleSizes.vendor - budget.bundleSizes.vendor,
      overagePercent: ((bundleSizes.vendor - budget.bundleSizes.vendor) / budget.bundleSizes.vendor) * 100,
      unit: 'bytes',
    };
    
    bundleViolations.push(violation);
    recordViolation('bundleSizes', 'vendor', bundleSizes.vendor, budget.bundleSizes.vendor, 'bytes');
    
    if (logToConsole) {
      console.warn(
        `[PerformanceBudget] Vendor bundle size exceeds budget: ` +
        `${(bundleSizes.vendor / 1024 / 1024).toFixed(2)}MB vs ${(budget.bundleSizes.vendor / 1024 / 1024).toFixed(2)}MB budget ` +
        `(${violation.overagePercent.toFixed(1)}% over)`
      );
    }
  }
  
  // Check individual chunks
  if (bundleSizes.chunks) {
    Object.entries(bundleSizes.chunks).forEach(([chunkName, size]) => {
      // Skip if size is not a number
      if (typeof size !== 'number') return;
      
      let budgetValue = budget.bundleSizes.chunk;
      
      // Check if there's a specific budget for this chunk
      if (budget.bundleSizes[chunkName]) {
        budgetValue = budget.bundleSizes[chunkName];
      }
      
      if (size > budgetValue) {
        const violation = {
          name: `Chunk: ${chunkName}`,
          value: size,
          budget: budgetValue,
          overage: size - budgetValue,
          overagePercent: ((size - budgetValue) / budgetValue) * 100,
          unit: 'bytes',
        };
        
        bundleViolations.push(violation);
        recordViolation('bundleSizes', `chunk:${chunkName}`, size, budgetValue, 'bytes');
        
        if (logToConsole) {
          console.warn(
            `[PerformanceBudget] Chunk "${chunkName}" exceeds size budget: ` +
            `${(size / 1024).toFixed(2)}KB vs ${(budgetValue / 1024).toFixed(2)}KB budget ` +
            `(${violation.overagePercent.toFixed(1)}% over)`
          );
        }
      }
    });
  }
  
  // Check individual assets
  if (bundleSizes.assets) {
    Object.entries(bundleSizes.assets).forEach(([assetName, size]) => {
      // Skip if size is not a number
      if (typeof size !== 'number') return;
      
      let budgetValue = budget.bundleSizes.asset;
      
      // Check if there's a specific budget for this asset
      if (budget.bundleSizes[assetName]) {
        budgetValue = budget.bundleSizes[assetName];
      }
      
      if (size > budgetValue) {
        const violation = {
          name: `Asset: ${assetName}`,
          value: size,
          budget: budgetValue,
          overage: size - budgetValue,
          overagePercent: ((size - budgetValue) / budgetValue) * 100,
          unit: 'bytes',
        };
        
        bundleViolations.push(violation);
        recordViolation('bundleSizes', `asset:${assetName}`, size, budgetValue, 'bytes');
        
        if (logToConsole) {
          console.warn(
            `[PerformanceBudget] Asset "${assetName}" exceeds size budget: ` +
            `${(size / 1024).toFixed(2)}KB vs ${(budgetValue / 1024).toFixed(2)}KB budget ` +
            `(${violation.overagePercent.toFixed(1)}% over)`
          );
        }
      }
    });
  }
  
  return bundleViolations;
};

/**
 * Check all performance budgets
 * 
 * @param {Object} [options] - Options for checking
 * @param {Object} [options.bundleSizes] - Bundle size information
 * @param {boolean} [options.logToConsole=false] - Whether to log violations to console
 * @returns {Object} Object containing all violations by category
 */
export const checkAllBudgets = ({ bundleSizes, logToConsole = false } = {}) => {
  const allViolations = {
    components: checkComponentBudgets({ logToConsole }),
    interactions: checkInteractionBudgets({ logToConsole }),
    resources: checkResourceBudgets({ logToConsole }),
    navigation: checkNavigationBudgets({ logToConsole }),
    bundleSizes: bundleSizes ? checkBundleSizeBudgets(bundleSizes, { logToConsole }) : [],
  };
  
  return allViolations;
};

/**
 * Get all recorded violations
 * 
 * @returns {Object} All recorded violations
 */
export const getViolations = () => {
  return { ...violations };
};

/**
 * Clear all recorded violations
 */
export const clearViolations = () => {
  Object.keys(violations).forEach(category => {
    violations[category] = {};
  });
};

/**
 * Generate a performance budget report as HTML
 * 
 * @returns {string} HTML report of budget violations
 */
export const generateBudgetReport = () => {
  const currentViolations = getViolations();
  const budget = getPerformanceBudget();
  
  // Create HTML report
  let report = `
    <h1>Performance Budget Report</h1>
    <p>Generated on ${new Date().toLocaleString()}</p>
    
    <h2>Budget Violations Summary</h2>
  `;
  
  // Count violations by category
  const counts = Object.keys(currentViolations).reduce((acc, category) => {
    acc[category] = Object.keys(currentViolations[category]).length;
    return acc;
  }, {});
  
  report += `
    <div class="summary">
      <div class="summary-item ${counts.components > 0 ? 'violation' : 'ok'}">
        <h3>Components</h3>
        <span class="count">${counts.components}</span>
      </div>
      <div class="summary-item ${counts.interactions > 0 ? 'violation' : 'ok'}">
        <h3>Interactions</h3>
        <span class="count">${counts.interactions}</span>
      </div>
      <div class="summary-item ${counts.resources > 0 ? 'violation' : 'ok'}">
        <h3>Resources</h3>
        <span class="count">${counts.resources}</span>
      </div>
      <div class="summary-item ${counts.navigation > 0 ? 'violation' : 'ok'}">
        <h3>Navigation</h3>
        <span class="count">${counts.navigation}</span>
      </div>
      <div class="summary-item ${counts.bundleSizes > 0 ? 'violation' : 'ok'}">
        <h3>Bundle Sizes</h3>
        <span class="count">${counts.bundleSizes}</span>
      </div>
    </div>
  `;
  
  // Add detailed violations by category
  Object.entries(currentViolations).forEach(([category, violations]) => {
    if (Object.keys(violations).length === 0) {
      return;
    }
    
    report += `
      <h2>${category.charAt(0).toUpperCase() + category.slice(1)} Violations</h2>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Value</th>
            <th>Budget</th>
            <th>Overage</th>
            <th>% Over</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    Object.values(violations).forEach((violation) => {
      // Format values based on unit
      const unit = violation.unit || 'ms';
      let value, budget, overage;
      
      if (unit === 'bytes') {
        value = `${(violation.value / 1024).toFixed(1)} KB`;
        budget = `${(violation.budget / 1024).toFixed(1)} KB`;
        overage = `${(violation.overage / 1024).toFixed(1)} KB`;
      } else {
        value = `${violation.value.toFixed(1)} ${unit}`;
        budget = `${violation.budget.toFixed(1)} ${unit}`;
        overage = `${violation.overage.toFixed(1)} ${unit}`;
      }
      
      // Determine severity class
      let severityClass = 'moderate';
      if (violation.overagePercent > 50) {
        severityClass = 'severe';
      } else if (violation.overagePercent > 20) {
        severityClass = 'significant';
      }
      
      report += `
        <tr class="${severityClass}">
          <td>${violation.name}</td>
          <td>${value}</td>
          <td>${budget}</td>
          <td>${overage}</td>
          <td>${violation.overagePercent.toFixed(1)}%</td>
        </tr>
      `;
    });
    
    report += `
        </tbody>
      </table>
    `;
  });
  
  // Add current budget settings
  report += `
    <h2>Current Budget Settings</h2>
    
    <h3>Component Render Times</h3>
    <table>
      <thead>
        <tr>
          <th>Component Type</th>
          <th>Budget (ms)</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  Object.entries(budget.components).forEach(([name, value]) => {
    report += `
      <tr>
        <td>${name}</td>
        <td>${value}</td>
      </tr>
    `;
  });
  
  report += `
      </tbody>
    </table>
    
    <h3>Interaction Response Times</h3>
    <table>
      <thead>
        <tr>
          <th>Interaction Type</th>
          <th>Budget (ms)</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  Object.entries(budget.interactions).forEach(([name, value]) => {
    report += `
      <tr>
        <td>${name}</td>
        <td>${value}</td>
      </tr>
    `;
  });
  
  report += `
      </tbody>
    </table>
    
    <h3>Resource Loading Times</h3>
    <table>
      <thead>
        <tr>
          <th>Resource Type</th>
          <th>Budget (ms)</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  Object.entries(budget.resources).forEach(([name, value]) => {
    report += `
      <tr>
        <td>${name}</td>
        <td>${value}</td>
      </tr>
    `;
  });
  
  report += `
      </tbody>
    </table>
    
    <h3>Navigation Performance</h3>
    <table>
      <thead>
        <tr>
          <th>Navigation Metric</th>
          <th>Budget (ms)</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  Object.entries(budget.navigation).forEach(([name, value]) => {
    report += `
      <tr>
        <td>${name}</td>
        <td>${value}</td>
      </tr>
    `;
  });
  
  report += `
      </tbody>
    </table>
    
    <h3>Bundle Size Limits</h3>
    <table>
      <thead>
        <tr>
          <th>Bundle Component</th>
          <th>Budget</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  Object.entries(budget.bundleSizes).forEach(([name, value]) => {
    let formattedValue;
    
    if (value >= 1024 * 1024) {
      formattedValue = `${(value / 1024 / 1024).toFixed(2)} MB`;
    } else {
      formattedValue = `${(value / 1024).toFixed(2)} KB`;
    }
    
    report += `
      <tr>
        <td>${name}</td>
        <td>${formattedValue}</td>
      </tr>
    `;
  });
  
  report += `
      </tbody>
    </table>
    
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; max-width: 1200px; margin: 0 auto; padding: 1rem; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
      th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #eee; }
      th { background: #f5f5f5; font-weight: 600; }
      .summary { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem; }
      .summary-item { flex: 1; min-width: 150px; background: #f5f5f5; padding: 1rem; border-radius: 0.5rem; text-align: center; }
      .summary-item h3 { margin-top: 0; }
      .summary-item .count { font-size: 2rem; font-weight: bold; }
      .ok { background: #e6f4ea; }
      .violation { background: #fce8e8; }
      .moderate { background: rgba(255, 235, 178, 0.2); }
      .significant { background: rgba(251, 211, 141, 0.3); }
      .severe { background: rgba(249, 168, 168, 0.3); }
      
      @media (max-width: 768px) {
        .summary { flex-direction: column; }
      }
    </style>
  `;
  
  return report;
};

/**
 * Create a webpack plugin to enforce bundle size budgets
 * 
 * @param {Object} [options] - Plugin options
 * @param {boolean} [options.emitError=false] - Whether to emit errors for violations
 * @param {boolean} [options.emitWarning=true] - Whether to emit warnings for violations
 * @returns {Object} Webpack plugin
 */
export const createBudgetPlugin = ({ emitError = false, emitWarning = true } = {}) => {
  return {
    apply(compiler) {
      compiler.hooks.afterEmit.tap('PerformanceBudgetPlugin', compilation => {
        const assets = compilation.assets;
        const stats = compilation.getStats().toJson({ all: false, assets: true, chunks: true });
        
        // Calculate bundle sizes
        const bundleSizes = {
          total: 0,
          main: 0,
          vendor: 0,
          chunks: {},
          assets: {},
        };
        
        // Process assets
        stats.assets.forEach(asset => {
          // Skip source maps
          if (asset.name.endsWith('.map')) return;
          
          bundleSizes.total += asset.size;
          bundleSizes.assets[asset.name] = asset.size;
          
          // Check for main/vendor bundles by name
          if (asset.name.includes('main')) {
            bundleSizes.main += asset.size;
          } else if (asset.name.includes('vendor')) {
            bundleSizes.vendor += asset.size;
          }
        });
        
        // Process chunks
        stats.chunks.forEach(chunk => {
          const size = chunk.files.reduce((total, file) => {
            const asset = stats.assets.find(a => a.name === file);
            return total + (asset ? asset.size : 0);
          }, 0);
          
          bundleSizes.chunks[chunk.id] = size;
          
          // Check for main/vendor chunks by name
          if (chunk.names && chunk.names.includes('main')) {
            bundleSizes.main = size;
          } else if (chunk.names && chunk.names.includes('vendor')) {
            bundleSizes.vendor = size;
          }
        });
        
        // Check budget
        const violations = checkBundleSizeBudgets(bundleSizes);
        
        if (violations.length > 0) {
          const message = `Performance budget violations:\n${violations.map(v => 
            `- ${v.name}: ${v.value / 1024}KB (exceeds ${v.budget / 1024}KB budget by ${v.overagePercent.toFixed(1)}%)`
          ).join('\n')}`;
          
          if (emitError) {
            compilation.errors.push(new Error(message));
          } else if (emitWarning) {
            compilation.warnings.push(message);
          }
        }
      });
    }
  };
};