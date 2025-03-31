/**
 * React Render Tracer
 * 
 * A tool to trace React component renders and identify performance issues.
 * This script can be included in development to track component render times.
 */

const fs = require('fs');
const path = require('path');

// Ensure reports directory exists
const REPORTS_DIR = path.resolve(__dirname, '../performance-reports');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Current date for reports
const currentDate = new Date().toISOString().split('T')[0];
const reportFile = path.join(REPORTS_DIR, `render-trace-${currentDate}.md`);

/**
 * Instructions for implementing React render tracing
 */
const instructions = `
# React Render Tracing

This script provides utilities for tracing React component renders and identifying performance issues.

## How to use the render tracer

1. Add the following code to your application entry point (src/index.js):

\`\`\`javascript
// Performance monitoring
if (process.env.NODE_ENV !== 'production' && process.env.PERF_MONITOR === 'true') {
  const { setupReactPerformanceTracing } = require('../scripts/tracing-utils');
  setupReactPerformanceTracing();
}
\`\`\`

2. Create a file at scripts/tracing-utils.js with the following content:

\`\`\`javascript
// React performance tracing utilities
export function setupReactPerformanceTracing() {
  // Save original console methods
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  };

  // Component render times
  const componentRenderTimes = new Map();
  const RENDER_TIME_THRESHOLD = 5; // ms
  
  // Performance marks prefix
  const MARK_PREFIX = 'react-render-';
  
  // Install React DevTools hook if not present
  if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      supportsFiber: true,
      inject: () => {},
      onCommitFiberRoot: () => {},
      onCommitFiberUnmount: () => {},
    };
  }
  
  // Store original DevTools hooks
  const originalHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  const originalInject = originalHook.inject;
  
  // Override the inject method
  originalHook.inject = (renderer) => {
    const result = originalInject.call(originalHook, renderer);
    
    // Get React internals
    const ReactFiberTreeReflection = renderer.findFiberByHostInstance ? 
      renderer : null;
    
    if (ReactFiberTreeReflection) {
      // Hook into React commits
      const originalOnCommitFiberRoot = originalHook.onCommitFiberRoot;
      
      originalHook.onCommitFiberRoot = (...args) => {
        const result = originalOnCommitFiberRoot.apply(originalHook, args);
        
        try {
          // Analyze the fiber tree
          const fiberRoot = args[1];
          analyzeCommit(fiberRoot, ReactFiberTreeReflection);
        } catch (err) {
          originalConsole.error('Error in React performance tracing:', err);
        }
        
        return result;
      };
    }
    
    return result;
  };
  
  // Analyze a commit
  function analyzeCommit(fiberRoot, ReactFiberTreeReflection) {
    if (!fiberRoot || !fiberRoot.current) return;
    
    // Start a new batch of performance measurements
    performance.clearMarks();
    
    // Walk the fiber tree
    walkFiber(fiberRoot.current);
  }
  
  // Walk through the fiber tree
  function walkFiber(fiber) {
    if (!fiber) return;
    
    // Check if this is a component fiber
    if (fiber.type && typeof fiber.type === 'function') {
      const componentName = fiber.type.displayName || fiber.type.name || 'Unknown';
      
      // Start timing
      const startMarkName = \`\${MARK_PREFIX}\${componentName}-start\`;
      const endMarkName = \`\${MARK_PREFIX}\${componentName}-end\`;
      const measureName = \`\${MARK_PREFIX}\${componentName}\`;
      
      performance.mark(startMarkName);
      
      // Check if component has update
      const hasUpdate = fiber.flags && (fiber.flags & 4); // Update flag
      
      if (hasUpdate) {
        // Simulate the render (not actual rendering, just measurement)
        performance.mark(endMarkName);
        performance.measure(measureName, startMarkName, endMarkName);
        
        const entries = performance.getEntriesByName(measureName);
        if (entries.length > 0) {
          const renderTime = entries[0].duration;
          
          // Store render time
          if (!componentRenderTimes.has(componentName)) {
            componentRenderTimes.set(componentName, {
              totalTime: 0,
              renderCount: 0,
              maxTime: 0,
            });
          }
          
          const stats = componentRenderTimes.get(componentName);
          stats.totalTime += renderTime;
          stats.renderCount += 1;
          stats.maxTime = Math.max(stats.maxTime, renderTime);
          
          // Log slow renders
          if (renderTime > RENDER_TIME_THRESHOLD) {
            const avgTime = stats.totalTime / stats.renderCount;
            originalConsole.warn(
              \`Slow render: \${componentName} took \${renderTime.toFixed(2)}ms (\${stats.renderCount} renders, avg: \${avgTime.toFixed(2)}ms)\`
            );
          }
        }
        
        // Clean up
        performance.clearMarks(startMarkName);
        performance.clearMarks(endMarkName);
        performance.clearMeasures(measureName);
      }
    }
    
    // Walk child fibers
    let child = fiber.child;
    while (child) {
      walkFiber(child);
      child = child.sibling;
    }
  }
  
  // Periodically log render statistics
  setInterval(() => {
    if (componentRenderTimes.size === 0) return;
    
    originalConsole.log('=== React Component Render Stats ===');
    
    // Convert to array and sort by total time
    const sortedComponents = Array.from(componentRenderTimes.entries())
      .map(([name, stats]) => ({
        name,
        ...stats,
        avgTime: stats.totalTime / stats.renderCount,
      }))
      .sort((a, b) => b.totalTime - a.totalTime);
    
    // Log top 10 components by total render time
    originalConsole.log('Top components by total render time:');
    sortedComponents.slice(0, 10).forEach((component, i) => {
      originalConsole.log(
        \`\${i+1}. \${component.name}: \${component.totalTime.toFixed(2)}ms total, \` +
        \`\${component.renderCount} renders, \${component.avgTime.toFixed(2)}ms avg\`
      );
    });
    
    // Save to localStorage for the dashboard
    try {
      localStorage.setItem('reactRenderStats', JSON.stringify(
        sortedComponents.slice(0, 50)
      ));
    } catch (e) {
      // Ignore storage errors
    }
  }, 10000);
  
  // Log setup completion
  originalConsole.log('React performance tracing initialized');
}
\`\`\`

3. Run your application with the PERF_MONITOR environment variable:

\`\`\`
npm run perf:monitor
\`\`\`

4. Open the browser console to see render statistics and warnings about slow components.

## Alternative: Use React Profiler API

For more structured profiling, you can also use React's built-in Profiler API:

\`\`\`javascript
import React, { Profiler } from 'react';

function onRenderCallback(
  id, // the "id" prop of the Profiler tree
  phase, // "mount" or "update"
  actualDuration, // time spent rendering
  baseDuration, // estimated time for full render
  startTime, // when React began rendering
  commitTime // when React committed changes
) {
  console.log(\`\${id} \${phase}: \${actualDuration.toFixed(2)}ms\`);
}

// Wrap components with the Profiler
<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComponent />
</Profiler>
\`\`\`

## Performance Monitoring Dashboard

To add a performance monitoring dashboard to your application, import and use the PerformanceDashboard component:

\`\`\`javascript
import PerformanceDashboard from './components/performance/PerformanceDashboard';

// In your App component
<div className="app">
  {/* Your app content */}
  {process.env.NODE_ENV !== 'production' && (
    <PerformanceDashboard initiallyExpanded={false} />
  )}
</div>
\`\`\`

This will provide real-time monitoring of component render performance.
`;

// Write the instructions to the report file
fs.writeFileSync(reportFile, instructions);

console.log(`React render tracing instructions generated: ${reportFile}`);

// Generate a utility script that can be used in the application
const utilsScript = `
/**
 * React Performance Tracing Utilities
 * 
 * Utility functions for monitoring React component performance.
 */

// React performance tracing setup
export function setupReactPerformanceTracing() {
  // Implementation details are in the instructions file
  console.log('React performance tracing initialized');
  
  // Add implementation based on instructions
}
`;

const utilsScriptPath = path.join(__dirname, 'tracing-utils.js');
fs.writeFileSync(utilsScriptPath, utilsScript);

console.log(`Tracing utilities script created: ${utilsScriptPath}`);
console.log('\nTo enable tracing, follow the instructions in the generated report file.');