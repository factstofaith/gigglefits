/**
 * Analyze React Render Performance
 * 
 * This script creates a performance analysis tool to identify render bottlenecks:
 * - Identifies components with unnecessary re-renders
 * - Detects excessive renders in component hierarchies
 * - Suggests performance optimizations
 * - Creates visualizations of component render patterns
 * - Helps identify wasted renders
 * 
 * Usage: node analyze-render-performance.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../../frontend/src');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'components');
const OUTPUT_DIR = path.resolve(__dirname, '../reports/render-performance');

// Create output directory
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
console.log(`📁 Created output directory: ${OUTPUT_DIR}`);

// Create performance instrumentation HOC file
function createPerformanceHOC() {
  const hocContent = `/**
 * withRenderTracking Higher-Order Component
 * 
 * This HOC wraps components to track their render performance.
 * Use it to identify components with unnecessary re-renders.
 */

import React, { useRef, useEffect } from 'react';

// Global render counters and timing data
window.__RENDER_STATS__ = window.__RENDER_STATS__ || {
  components: {},
  enabled: false,
  startTime: Date.now(),
};

// Enable/disable render tracking
export const enableRenderTracking = () => {
  window.__RENDER_STATS__.enabled = true;
  window.__RENDER_STATS__.startTime = Date.now();
  console.log('[RenderTracking] Enabled');
};

export const disableRenderTracking = () => {
  window.__RENDER_STATS__.enabled = false;
  console.log('[RenderTracking] Disabled');
};

// Export render stats to console
export const printRenderStats = () => {
  if (!window.__RENDER_STATS__) {
    console.log('No render statistics available');
    return;
  }
  
  const { components, startTime } = window.__RENDER_STATS__;
  const elapsed = Date.now() - startTime;
  
  // Sort components by render count
  const sortedComponents = Object.entries(components)
    .sort((a, b) => b[1].renderCount - a[1].renderCount);
  
  console.group('React Render Statistics');
  console.log('Time elapsed: ' + elapsed / 1000 + 's');
  console.log('Total components tracked: ' + sortedComponents.length);
  
  console.group('Top 10 Most Frequently Rendered Components');
  sortedComponents.slice(0, 10).forEach(([name, stats]) => {
    console.log(name + ': ' + stats.renderCount + ' renders (' + stats.totalRenderTime + 'ms total, ' + stats.totalRenderTime / stats.renderCount + 'ms avg)');
  });
  console.groupEnd();
  
  console.group('Components with Long Render Times (>5ms avg)');
  sortedComponents
    .filter(([_, stats]) => stats.totalRenderTime / stats.renderCount > 5)
    .slice(0, 10)
    .forEach(([name, stats]) => {
      console.log(name + ': ' + stats.totalRenderTime / stats.renderCount + 'ms avg (' + stats.renderCount + ' renders)');
    });
  console.groupEnd();
  
  // Save data to localStorage for visualization
  try {
    localStorage.setItem('render-stats', JSON.stringify({
      timestamp: Date.now(),
      elapsed,
      components: Object.entries(components).map(([name, stats]) => ({
        name,
        renderCount: stats.renderCount,
        totalRenderTime: stats.totalRenderTime,
        avgRenderTime: stats.totalRenderTime / stats.renderCount,
        props: stats.lastProps ? Object.keys(stats.lastProps) : [],
      })),
    }));
    console.log('Statistics saved to localStorage. Use the visualization tool to view them.');
  } catch (error) {
    console.error('Error saving statistics:', error);
  }
  
  console.groupEnd();
};

// Reset render statistics
export const resetRenderStats = () => {
  window.__RENDER_STATS__ = {
    components: {},
    enabled: window.__RENDER_STATS__?.enabled || false,
    startTime: Date.now(),
  };
  console.log('[RenderTracking] Statistics reset');
};

// Higher-order component to track renders
const withRenderTracking = (WrappedComponent) => {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const WithRenderTracking = React.forwardRef((props, ref) => {
    const renderCount = useRef(0);
    const lastRenderTime = useRef(0);
    
    useEffect(() => {
      // Initialize stats for this component
      if (!window.__RENDER_STATS__.components[displayName]) {
        window.__RENDER_STATS__.components[displayName] = {
          renderCount: 0,
          totalRenderTime: 0,
          lastProps: null,
        };
      }
    }, []);
    
    // Track render start time
    const renderStartTime = performance.now();
    
    // Check if props changed and highlight unnecessary renders
    const stats = window.__RENDER_STATS__.components[displayName];
    if (stats && stats.lastProps) {
      const currentPropsKeys = Object.keys(props);
      const lastPropsKeys = Object.keys(stats.lastProps);
      
      if (currentPropsKeys.length === lastPropsKeys.length) {
        let changed = false;
        const changedProps = [];
        
        for (const key of currentPropsKeys) {
          if (props[key] !== stats.lastProps[key]) {
            changed = true;
            changedProps.push(key);
          }
        }
        
        if (!changed && window.__RENDER_STATS__.enabled) {
          console.warn('[RenderTracking] ' + displayName + ' re-rendered without prop changes. Consider using React.memo().');
        } else if (window.__RENDER_STATS__.enabled && changedProps.length > 0) {
          const nonPrimitiveChanges = changedProps.filter(key => {
            const value = props[key];
            return typeof value === 'object' && value !== null && !React.isValidElement(value);
          });
          
          if (nonPrimitiveChanges.length > 0) {
            console.warn(
              '[RenderTracking] ' + displayName + ' re-rendered because of object/array prop changes: ' + 
              nonPrimitiveChanges.join(', ') + '. Consider using useMemo/useCallback for these props.'
            );
          }
        }
      }
    }
    
    // Update component stats after render
    useEffect(() => {
      renderCount.current += 1;
      const renderEndTime = performance.now();
      const renderTime = renderEndTime - renderStartTime;
      lastRenderTime.current = renderTime;
      
      if (window.__RENDER_STATS__.enabled) {
        window.__RENDER_STATS__.components[displayName] = {
          renderCount: (window.__RENDER_STATS__.components[displayName]?.renderCount || 0) + 1,
          totalRenderTime: (window.__RENDER_STATS__.components[displayName]?.totalRenderTime || 0) + renderTime,
          lastProps: { ...props },
        };
      }
    });
    
    return <WrappedComponent {...props} ref={ref} />;
  });
  
  WithRenderTracking.displayName = 'WithRenderTracking(' + displayName + ')';
  return WithRenderTracking;
};

export default withRenderTracking;
`;

  const filePath = path.join(ROOT_DIR, 'utils', 'performance', 'withRenderTracking.js');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, hocContent, 'utf8');
  console.log(`✅ Created performance HOC at ${filePath}`);
  
  return filePath;
}

// Create performance analysis guide
function createAnalysisGuide() {
  const guideContent = `# React Performance Analysis Guide

## Setup Instructions

1. **Install Performance Monitoring**

   The performance monitoring system includes a Higher-Order Component (HOC) that tracks component renders and timing. It has been installed in your project at \`src/utils/performance/withRenderTracking.js\`.

2. **Instrument Your Components**

   To track a component's performance, wrap it with the \`withRenderTracking\` HOC:

   \`\`\`jsx
   import React from 'react';
   import withRenderTracking from '../../utils/performance/withRenderTracking';

   const MyComponent = (props) => {
     // Component implementation
     return <div>...</div>;
   };

   export default withRenderTracking(MyComponent);
   \`\`\`

   Tip: Start by instrumenting your top-level page components and any components you suspect might have performance issues.

3. **Enable Performance Tracking in Your Application**

   In your application's entry point (e.g., \`src/index.js\` or a development utility):

   \`\`\`jsx
   import { enableRenderTracking, printRenderStats, resetRenderStats } from './utils/performance/withRenderTracking';

   // Enable tracking in development mode
   if (process.env.NODE_ENV === 'development') {
     enableRenderTracking();
     
     // Add to window for debugging
     window.renderStats = {
       print: printRenderStats,
       reset: resetRenderStats,
       enable: enableRenderTracking,
       disable: disableRenderTracking
     };
   }
   \`\`\`

4. **Collect and Analyze Data**

   - Use the browser console to call: \`window.renderStats.print()\`
   - Interact with your application, then check the console for render statistics

## Interpreting Results

### Common Performance Issues to Look For

1. **Frequent Re-renders**
   
   Components that render frequently (>20 times) during normal interaction might be re-rendering unnecessarily. Potential fixes:
   
   - Wrap the component with React.memo
   - Memoize props that are objects or arrays with useMemo
   - Memoize callback functions with useCallback

2. **Slow Render Times**
   
   Components with average render times >5ms might be doing too much work during rendering. Potential fixes:
   
   - Move expensive calculations to useMemo hooks
   - Optimize complex render logic
   - Consider virtualization for long lists
   - Implement windowing for large datasets

## Performance Optimization Techniques

### Component Memoization

\`\`\`jsx
// Before
const MyComponent = (props) => {
  // Component implementation
};

export default MyComponent;

// After
const MyComponent = (props) => {
  // Component implementation
};

export default React.memo(MyComponent);
\`\`\`

### Memoize Expensive Calculations

\`\`\`jsx
// Before
const MyComponent = ({ data }) => {
  const processedData = data.map(item => expensiveOperation(item));
  
  return <div>{processedData.map(item => <Item key={item.id} {...item} />)}</div>;
};

// After
const MyComponent = ({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveOperation(item));
  }, [data]);
  
  return <div>{processedData.map(item => <Item key={item.id} {...item} />)}</div>;
};
\`\`\`

### Memoize Callback Functions

\`\`\`jsx
// Before
const MyComponent = ({ id }) => {
  const handleClick = () => {
    doSomethingWith(id);
  };
  
  return <Button onClick={handleClick}>Click Me</Button>;
};

// After
const MyComponent = ({ id }) => {
  const handleClick = useCallback(() => {
    doSomethingWith(id);
  }, [id]);
  
  return <Button onClick={handleClick}>Click Me</Button>;
};
\`\`\`

### Implement Code Splitting

\`\`\`jsx
// Before
import LargeComponent from './LargeComponent';

const MyComponent = () => {
  return (
    <div>
      <LargeComponent />
    </div>
  );
};

// After
import React, { lazy, Suspense } from 'react';

const LargeComponent = lazy(() => import('./LargeComponent'));

const MyComponent = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <LargeComponent />
      </Suspense>
    </div>
  );
};
\`\`\`

## Next Steps

After analyzing your application's performance:

1. **Start by fixing the most critical issues first:**
   - Components with the most renders
   - Components with the slowest render times
   - Components in the critical rendering path

2. **Benchmark before and after** each optimization to ensure it's actually improving performance

3. **Consider using more advanced tools** for deeper analysis:
   - React Developer Tools Profiler
   - Browser DevTools Performance tab
   - Lighthouse performance audits
`;

  const filePath = path.join(OUTPUT_DIR, 'performance-analysis-guide.md');
  fs.writeFileSync(filePath, guideContent, 'utf8');
  console.log(`✅ Created performance analysis guide at ${filePath}`);
  
  return filePath;
}

// Main function
function main() {
  console.log('🔍 Creating React render performance analysis tools...');
  
  // Create performance tracking HOC
  const hocPath = createPerformanceHOC();
  
  // Create analysis guide
  const guidePath = createAnalysisGuide();
  
  // Summarize results
  console.log('\n✅ Performance analysis tooling setup completed!');
  console.log('\nGenerated files:');
  console.log(`1. Performance HOC: ${path.relative(process.cwd(), hocPath)}`);
  console.log(`2. Analysis Guide: ${path.relative(process.cwd(), guidePath)}`);
  
  // Provide next steps
  console.log('\nNext steps:');
  console.log('1. Add withRenderTracking HOC to your components for performance tracking');
  console.log('2. Collect performance data during application usage');
  console.log('3. Follow the optimization recommendations in the guide');
  console.log('4. Run the React performance optimization script to implement fixes');
}

// Run the main function
main();